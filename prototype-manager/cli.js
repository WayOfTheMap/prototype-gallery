#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);
const prototypesDir = path.join(rootDir, 'prototypes');
const configPath = path.join(__dirname, 'config.json');

// Load or create config
let config = {
  prototypesPath: '../prototypes',
  deployments: {},
  defaultSettings: {
    public: true,
    framework: null
  }
};

if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function saveConfig() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// Get list of available prototypes (including subfolders)
function getPrototypes() {
  if (!fs.existsSync(prototypesDir)) {
    return [];
  }
  
  const prototypes = [];
  
  // Function to recursively find prototypes
  function findPrototypes(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        const indexPath = path.join(itemPath, 'index.html');
        const vercelPath = path.join(itemPath, 'vercel.json');
        
        // Check if this directory is a prototype (has index.html or vercel.json)
        if (fs.existsSync(indexPath) || fs.existsSync(vercelPath)) {
          const name = prefix ? `${prefix}/${item}` : item;
          prototypes.push(name);
        } else {
          // Recursively search subdirectories
          const subPrefix = prefix ? `${prefix}/${item}` : item;
          findPrototypes(itemPath, subPrefix);
        }
      }
    }
  }
  
  findPrototypes(prototypesDir);
  return prototypes;
}

// Deploy a prototype
async function deployPrototype(prototypeName) {
  const prototypePath = path.join(prototypesDir, prototypeName);
  
  if (!fs.existsSync(prototypePath)) {
    console.error(chalk.red(`Prototype "${prototypeName}" not found`));
    process.exit(1);
  }
  
  console.log(chalk.blue(`\n🚀 Deploying ${prototypeName}...\n`));
  
  try {
    // Run vercel deployment
    const result = execSync('vercel --yes --prod', {
      cwd: prototypePath,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    // Extract URL from output
    const lines = result.split('\n');
    const urlLine = lines.find(line => line.includes('https://'));
    const url = urlLine ? urlLine.trim() : null;
    
    if (url) {
      // Save deployment info
      config.deployments[prototypeName] = {
        url: url,
        deployedAt: new Date().toISOString(),
        path: prototypePath
      };
      saveConfig();
      
      console.log(chalk.green('\n✅ Deployment successful!'));
      console.log(chalk.white('\n📋 Prototype URL:'));
      console.log(chalk.cyan.bold(url));
      console.log(chalk.gray('\n(URL copied to clipboard if pbcopy is available)\n'));
      
      // Try to copy to clipboard
      try {
        execSync(`echo "${url}" | pbcopy`);
      } catch {
        // Clipboard copy failed, ignore
      }
    } else {
      console.log(chalk.yellow('\nDeployment completed but URL not captured.'));
      console.log(chalk.gray('Check the Vercel dashboard for the deployment URL.'));
    }
  } catch (error) {
    console.error(chalk.red('\nDeployment failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting:'));
    console.log(chalk.gray('1. Make sure you have logged into Vercel: vercel login'));
    console.log(chalk.gray('2. Check that the prototype has an index.html file'));
    console.log(chalk.gray('3. Try deploying manually: cd prototypes/' + prototypeName + ' && vercel'));
  }
}

// List all prototypes
function listPrototypes() {
  const prototypes = getPrototypes();
  
  console.log(chalk.blue('\n📦 Available Prototypes:\n'));
  
  if (prototypes.length === 0) {
    console.log(chalk.yellow('No prototypes found. Add HTML files to the prototypes/ directory.'));
    return;
  }
  
  prototypes.forEach(name => {
    const deployment = config.deployments[name];
    console.log(chalk.white(`• ${name}`));
    
    if (deployment) {
      console.log(chalk.gray(`  URL: ${chalk.cyan(deployment.url)}`));
      console.log(chalk.gray(`  Deployed: ${new Date(deployment.deployedAt).toLocaleString()}`));
    } else {
      console.log(chalk.gray('  Status: Not deployed'));
    }
    console.log();
  });
}

// Interactive deployment
async function interactiveDeploy() {
  const prototypes = getPrototypes();
  
  if (prototypes.length === 0) {
    console.log(chalk.yellow('No prototypes found. Add HTML files to the prototypes/ directory.'));
    process.exit(0);
  }
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'prototype',
      message: 'Select a prototype to deploy:',
      choices: prototypes.map(p => ({
        name: config.deployments[p] 
          ? `${p} (deployed: ${config.deployments[p].url})` 
          : `${p} (not deployed)`,
        value: p
      }))
    }
  ]);
  
  await deployPrototype(answers.prototype);
}

// Quick deploy command
async function quickDeploy() {
  console.log(chalk.blue('\n⚡ Quick Deploy Mode\n'));
  
  // Check for HTML files in current directory
  const localHtml = await glob('*.html', { cwd: process.cwd() });
  
  if (localHtml.length > 0) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'file',
        message: 'Found HTML files in current directory. Deploy which one?',
        choices: [...localHtml, { name: 'Cancel', value: null }]
      }
    ]);
    
    if (answers.file) {
      // Create temporary prototype directory
      const tempName = `quick-${Date.now()}`;
      const tempPath = path.join(prototypesDir, tempName);
      fs.mkdirSync(tempPath, { recursive: true });
      
      // Copy HTML file
      fs.copyFileSync(
        path.join(process.cwd(), answers.file),
        path.join(tempPath, 'index.html')
      );
      
      // Deploy
      await deployPrototype(tempName);
    }
  } else {
    console.log(chalk.yellow('No HTML files found in current directory.'));
    await interactiveDeploy();
  }
}

// Get deployment URL for a prototype
function getUrl(prototypeName) {
  const deployment = config.deployments[prototypeName];
  
  if (deployment) {
    console.log(chalk.cyan(deployment.url));
    
    // Copy to clipboard if available
    try {
      execSync(`echo "${deployment.url}" | pbcopy`);
      console.log(chalk.gray('(Copied to clipboard)'));
    } catch {
      // Ignore clipboard errors
    }
  } else {
    console.log(chalk.yellow(`Prototype "${prototypeName}" has not been deployed yet.`));
    console.log(chalk.gray(`Run: npm run deploy`));
  }
}

// Main CLI
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'deploy':
    if (args[0]) {
      deployPrototype(args[0]);
    } else {
      interactiveDeploy();
    }
    break;
    
  case 'list':
    listPrototypes();
    break;
    
  case 'quick':
    quickDeploy();
    break;
    
  case 'url':
    if (args[0]) {
      getUrl(args[0]);
    } else {
      console.log(chalk.red('Please specify a prototype name'));
      console.log(chalk.gray('Usage: npm run url <prototype-name>'));
    }
    break;
    
  default:
    console.log(chalk.blue('\n🎨 Prototype Manager\n'));
    console.log(chalk.white('Commands:'));
    console.log(chalk.gray('  npm run deploy [name]  - Deploy a prototype'));
    console.log(chalk.gray('  npm run list          - List all prototypes'));
    console.log(chalk.gray('  npm run quick         - Quick deploy from current directory'));
    console.log(chalk.gray('  npm run url <name>    - Get URL for deployed prototype'));
    console.log();
}