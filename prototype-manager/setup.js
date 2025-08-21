#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);

console.log(chalk.blue('\n🚀 Setting up Prototype Hosting System\n'));

// Step 1: Check if Vercel CLI is installed
console.log(chalk.yellow('Checking for Vercel CLI...'));
try {
  execSync('vercel --version', { stdio: 'ignore' });
  console.log(chalk.green('✓ Vercel CLI is already installed'));
} catch {
  console.log(chalk.yellow('Installing Vercel CLI globally...'));
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log(chalk.green('✓ Vercel CLI installed successfully'));
  } catch (error) {
    console.error(chalk.red('Failed to install Vercel CLI. Please run: npm install -g vercel'));
    process.exit(1);
  }
}

// Step 2: Create prototypes directory if it doesn't exist
const prototypesDir = path.join(rootDir, 'prototypes');
if (!fs.existsSync(prototypesDir)) {
  fs.mkdirSync(prototypesDir, { recursive: true });
  console.log(chalk.green('✓ Created prototypes directory'));
} else {
  console.log(chalk.green('✓ Prototypes directory exists'));
}

// Step 3: Move existing HTML prototypes to prototypes folder
console.log(chalk.yellow('\nOrganizing existing prototypes...'));

const htmlFiles = [
  'smart-flows-mockup-1-ai-first.html',
  'smart-flows-mockup-2-goal-based.html',
  'smart-flows-mockup-3-guided-wizard.html',
  'smart-flows-modal-wireframe.html'
];

htmlFiles.forEach(file => {
  const sourcePath = path.join(rootDir, file);
  if (fs.existsSync(sourcePath)) {
    // Create a folder for each prototype
    const prototypeName = file.replace('.html', '');
    const targetDir = path.join(prototypesDir, prototypeName);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const targetPath = path.join(targetDir, 'index.html');
    
    // Copy instead of move to preserve originals
    fs.copyFileSync(sourcePath, targetPath);
    console.log(chalk.green(`✓ Organized ${file} → prototypes/${prototypeName}/`));
  }
});

// Step 4: Create config file
const configPath = path.join(__dirname, 'config.json');
const config = {
  prototypesPath: '../prototypes',
  deployments: {},
  defaultSettings: {
    public: true,
    framework: null
  }
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(chalk.green('✓ Created configuration file'));

// Step 5: Create vercel.json for each prototype
console.log(chalk.yellow('\nConfiguring Vercel settings...'));

const prototypeDirs = fs.readdirSync(prototypesDir)
  .filter(item => fs.statSync(path.join(prototypesDir, item)).isDirectory());

prototypeDirs.forEach(dir => {
  const vercelConfigPath = path.join(prototypesDir, dir, 'vercel.json');
  const vercelConfig = {
    "name": `prototype-${dir}`,
    "builds": [],
    "routes": [],
    "public": true
  };
  
  if (!fs.existsSync(vercelConfigPath)) {
    fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
    console.log(chalk.green(`✓ Created Vercel config for ${dir}`));
  }
});

// Step 6: Create .gitignore for Vercel
const gitignorePath = path.join(prototypesDir, '.gitignore');
const gitignoreContent = `.vercel
*.log
.DS_Store
`;

fs.writeFileSync(gitignorePath, gitignoreContent);
console.log(chalk.green('✓ Created .gitignore for prototypes'));

console.log(chalk.blue('\n✨ Setup complete!\n'));
console.log(chalk.white('Next steps:'));
console.log(chalk.gray('1. Run "npm run deploy" to deploy a prototype'));
console.log(chalk.gray('2. Run "npm run list" to see all prototypes'));
console.log(chalk.gray('3. Add new prototypes to the prototypes/ directory\n'));