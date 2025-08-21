#!/usr/bin/env node

/**
 * Smart Prototype Deployment Script
 * Automatically scans, deploys, and updates the gallery
 * 
 * For Product Designers: This script handles all your prototype deployments!
 * Just run: npm run deploy-prototypes
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Configuration
const CONFIG = {
    prototypesDir: './prototypes',
    galleryDir: './gallery',
    deploymentCache: './gallery/deployments.json',
    vercelProjectPrefix: 'prototype-',
    excludeDirs: ['node_modules', '.git', '.DS_Store']
};

// Color output helpers
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    section: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
    item: (msg) => console.log(`  • ${msg}`),
    header: () => {
        console.log(`\n${colors.bright}${colors.magenta}${'='.repeat(60)}${colors.reset}`);
        console.log(`${colors.bright}${colors.magenta}   🎨 PROTOTYPE DEPLOYMENT TOOL${colors.reset}`);
        console.log(`${colors.bright}${colors.magenta}${'='.repeat(60)}${colors.reset}\n`);
    }
};

// Load or initialize deployment cache
async function loadDeploymentCache() {
    try {
        const data = await fs.readFile(CONFIG.deploymentCache, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

// Save deployment cache
async function saveDeploymentCache(cache) {
    await fs.writeFile(CONFIG.deploymentCache, JSON.stringify(cache, null, 2));
}

// Scan prototypes directory structure
async function scanPrototypes() {
    const prototypes = {};
    
    try {
        const features = await fs.readdir(CONFIG.prototypesDir);
        
        for (const feature of features) {
            if (CONFIG.excludeDirs.includes(feature)) continue;
            
            const featurePath = path.join(CONFIG.prototypesDir, feature);
            const stat = await fs.stat(featurePath);
            
            if (stat.isDirectory()) {
                prototypes[feature] = [];
                
                // Check if this is a direct prototype (has index.html)
                const indexPath = path.join(featurePath, 'index.html');
                try {
                    await fs.access(indexPath);
                    // This is a single prototype
                    prototypes[feature].push({
                        name: formatName(feature),
                        slug: feature,
                        path: featurePath,
                        description: await extractDescription(indexPath)
                    });
                } catch {
                    // This is a feature folder with sub-prototypes
                    const subItems = await fs.readdir(featurePath);
                    
                    for (const item of subItems) {
                        if (CONFIG.excludeDirs.includes(item)) continue;
                        
                        const itemPath = path.join(featurePath, item);
                        const itemStat = await fs.stat(itemPath);
                        
                        if (itemStat.isDirectory()) {
                            const subIndexPath = path.join(itemPath, 'index.html');
                            try {
                                await fs.access(subIndexPath);
                                prototypes[feature].push({
                                    name: formatName(item),
                                    slug: item,
                                    path: itemPath,
                                    description: await extractDescription(subIndexPath)
                                });
                            } catch {
                                // No index.html, skip
                            }
                        }
                    }
                }
                
                // Remove empty features
                if (prototypes[feature].length === 0) {
                    delete prototypes[feature];
                }
            }
        }
    } catch (error) {
        log.error(`Failed to scan prototypes: ${error.message}`);
    }
    
    return prototypes;
}

// Format slug to readable name
function formatName(slug) {
    return slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .replace(/Mockup \d+/, (match) => match.replace(/(\d+)/, '#$1'))
        .replace(/Ai /g, 'AI ');
}

// Extract description from HTML title or content
async function extractDescription(htmlPath) {
    try {
        const content = await fs.readFile(htmlPath, 'utf8');
        const titleMatch = content.match(/<title>(.*?)<\/title>/i);
        if (titleMatch) {
            const title = titleMatch[1];
            // Remove common prefixes and return
            return title
                .replace(/^.*?[-–—]\s*/, '')
                .replace(/Prototype/i, '')
                .trim() || 'Interactive prototype';
        }
    } catch {
        // Ignore errors
    }
    return 'Interactive prototype';
}

// Check if prototype has changed (simplified check)
async function hasChanged(prototypePath, lastModified) {
    try {
        const stats = await fs.stat(path.join(prototypePath, 'index.html'));
        return !lastModified || stats.mtime > new Date(lastModified);
    } catch {
        return true; // Assume changed if we can't check
    }
}

// Deploy prototype to Vercel
async function deployPrototype(prototype, feature) {
    const projectName = `${CONFIG.vercelProjectPrefix}${prototype.slug}`;
    
    log.item(`Deploying ${prototype.name}...`);
    
    try {
        // Deploy using Vercel CLI
        const { stdout } = await execAsync(
            `cd "${prototype.path}" && vercel --prod --name="${projectName}" --yes --no-clipboard`,
            { timeout: 60000 }
        );
        
        // Extract URL from output
        const urlMatch = stdout.match(/https:\/\/[^\s]+\.vercel\.app/);
        if (urlMatch) {
            const url = urlMatch[0];
            log.success(`Deployed to: ${url}`);
            return url;
        } else {
            throw new Error('Could not extract URL from Vercel output');
        }
    } catch (error) {
        log.error(`Failed to deploy ${prototype.name}: ${error.message}`);
        return null;
    }
}

// Generate gallery HTML
async function generateGallery(prototypes, deploymentCache) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prototype Gallery</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }
        
        h1 {
            color: #333;
        }
        
        .sync-status {
            font-size: 12px;
            color: #666;
            background: white;
            padding: 6px 12px;
            border-radius: 6px;
            border: 1px solid #ddd;
        }
        
        .cmd-hint {
            background: white;
            border: 1px solid #ddd;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 14px;
            color: #666;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .kbd {
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            border: 1px solid #d0d0d0;
        }
        
        .feature-section {
            margin-bottom: 40px;
        }
        
        .feature-title {
            font-size: 18px;
            color: #666;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e0e0e0;
            text-transform: capitalize;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .tile {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            cursor: pointer;
            transition: box-shadow 0.2s;
            text-decoration: none;
            color: inherit;
            position: relative;
        }
        
        .tile:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .tile h3 {
            font-size: 16px;
            margin-bottom: 8px;
            color: #0066cc;
        }
        
        .tile p {
            color: #666;
            font-size: 14px;
        }
        
        .status {
            margin-top: 10px;
            font-size: 12px;
            color: #28a745;
        }
        
        .deployment-time {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 11px;
            color: #999;
        }
        
        /* Command Palette Styles */
        .cmd-palette {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            animation: fadeIn 0.15s ease;
        }
        
        .cmd-palette.open {
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 100px;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideDown {
            from { 
                opacity: 0;
                transform: translateY(-20px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .cmd-modal {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 400px;
            display: flex;
            flex-direction: column;
            animation: slideDown 0.15s ease;
            box-shadow: 0 16px 70px rgba(0, 0, 0, 0.2);
        }
        
        .cmd-input-wrapper {
            padding: 16px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .cmd-input {
            width: 100%;
            padding: 8px 12px;
            font-size: 16px;
            border: none;
            outline: none;
            background: transparent;
        }
        
        .cmd-results {
            overflow-y: auto;
            max-height: 320px;
        }
        
        .cmd-item {
            padding: 12px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
            border-left: 3px solid transparent;
        }
        
        .cmd-item:hover,
        .cmd-item.selected {
            background: #f8f8f8;
            border-left-color: #0066cc;
        }
        
        .cmd-item-icon {
            width: 32px;
            height: 32px;
            background: #f0f0f0;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
        }
        
        .cmd-item-content {
            flex: 1;
        }
        
        .cmd-item-title {
            font-size: 14px;
            font-weight: 500;
            color: #333;
        }
        
        .cmd-item-desc {
            font-size: 12px;
            color: #666;
            margin-top: 2px;
        }
        
        .cmd-item-feature {
            font-size: 11px;
            color: #999;
            padding: 2px 6px;
            background: #f5f5f5;
            border-radius: 4px;
        }
        
        .no-results {
            padding: 40px;
            text-align: center;
            color: #999;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Prototype Gallery</h1>
        <div style="display: flex; gap: 10px; align-items: center;">
            <div class="sync-status">Last sync: ${new Date().toLocaleString()}</div>
            <div class="cmd-hint">
                Press <span class="kbd">⌘</span><span class="kbd">K</span> to search
            </div>
        </div>
    </div>
    
    <div id="feature-sections">
        ${Object.entries(prototypes).map(([feature, protos]) => `
            <div class="feature-section">
                <h2 class="feature-title">${feature.replace(/-/g, ' ')}</h2>
                <div class="grid">
                    ${protos.map(proto => {
                        const deployment = deploymentCache[proto.slug];
                        const url = deployment?.url || '#';
                        const deployTime = deployment?.timestamp ? 
                            new Date(deployment.timestamp).toLocaleDateString() : '';
                        
                        return `
                            <a href="${url}" class="tile" ${url === '#' ? 'onclick="return false;" style="opacity: 0.6; cursor: not-allowed;"' : ''}>
                                ${deployTime ? `<div class="deployment-time">${deployTime}</div>` : ''}
                                <h3>${proto.name}</h3>
                                <p>${proto.description}</p>
                                <div class="status">${url !== '#' ? '✓ Deployed' : '⏳ Pending deployment'}</div>
                            </a>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('')}
    </div>

    <!-- Command Palette -->
    <div class="cmd-palette" id="cmdPalette">
        <div class="cmd-modal">
            <div class="cmd-input-wrapper">
                <input 
                    type="text" 
                    class="cmd-input" 
                    id="cmdInput" 
                    placeholder="Search prototypes..."
                    autocomplete="off"
                >
            </div>
            <div class="cmd-results" id="cmdResults">
                <!-- Results will be inserted here -->
            </div>
        </div>
    </div>

    <script>
        // Prototype data from generation
        const prototypesByFeature = ${JSON.stringify(
            Object.fromEntries(
                Object.entries(prototypes).map(([feature, protos]) => [
                    feature,
                    protos.map(proto => ({
                        ...proto,
                        url: deploymentCache[proto.slug]?.url || '#'
                    }))
                ])
            ), null, 2
        )};

        // Command Palette functionality
        const cmdPalette = document.getElementById('cmdPalette');
        const cmdInput = document.getElementById('cmdInput');
        const cmdResults = document.getElementById('cmdResults');
        let selectedIndex = 0;
        let filteredResults = [];

        // Flatten all prototypes for searching
        const allPrototypes = Object.entries(prototypesByFeature).flatMap(([feature, protos]) => 
            protos.map(p => ({ ...p, feature }))
        );

        function openCommandPalette() {
            cmdPalette.classList.add('open');
            cmdInput.value = '';
            cmdInput.focus();
            showAllResults();
        }

        function closeCommandPalette() {
            cmdPalette.classList.remove('open');
            selectedIndex = 0;
        }

        function showAllResults() {
            filteredResults = allPrototypes.filter(p => p.url !== '#');
            renderResults();
        }

        function searchPrototypes(query) {
            if (!query) {
                showAllResults();
                return;
            }
            
            const q = query.toLowerCase();
            filteredResults = allPrototypes.filter(p => 
                p.url !== '#' && (
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.feature.toLowerCase().includes(q) ||
                    p.slug.toLowerCase().includes(q)
                )
            );
            
            selectedIndex = 0;
            renderResults();
        }

        function renderResults() {
            if (filteredResults.length === 0) {
                cmdResults.innerHTML = '<div class="no-results">No deployed prototypes found</div>';
                return;
            }
            
            cmdResults.innerHTML = filteredResults.map((proto, index) => \`
                <div class="cmd-item \${index === selectedIndex ? 'selected' : ''}" data-index="\${index}">
                    <div class="cmd-item-icon">📄</div>
                    <div class="cmd-item-content">
                        <div class="cmd-item-title">\${proto.name}</div>
                        <div class="cmd-item-desc">\${proto.description}</div>
                    </div>
                    <span class="cmd-item-feature">\${proto.feature}</span>
                </div>
            \`).join('');
            
            // Add click handlers
            document.querySelectorAll('.cmd-item').forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.dataset.index);
                    navigateToPrototype(index);
                });
            });
        }

        function navigateToPrototype(index) {
            if (filteredResults[index] && filteredResults[index].url !== '#') {
                window.location.href = filteredResults[index].url;
            }
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Cmd+K or Ctrl+K to open
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openCommandPalette();
            }
            
            // Escape to close
            if (e.key === 'Escape' && cmdPalette.classList.contains('open')) {
                closeCommandPalette();
            }
            
            // Navigation in command palette
            if (cmdPalette.classList.contains('open')) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    selectedIndex = Math.min(selectedIndex + 1, filteredResults.length - 1);
                    renderResults();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    selectedIndex = Math.max(selectedIndex - 1, 0);
                    renderResults();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    navigateToPrototype(selectedIndex);
                }
            }
        });

        // Input handler
        cmdInput.addEventListener('input', (e) => {
            searchPrototypes(e.target.value);
        });

        // Click outside to close
        cmdPalette.addEventListener('click', (e) => {
            if (e.target === cmdPalette) {
                closeCommandPalette();
            }
        });
    </script>
</body>
</html>`;

    await fs.writeFile(path.join(CONFIG.galleryDir, 'index.html'), html);
    log.success('Gallery updated');
}

// Main sync function
async function syncPrototypes() {
    console.log(`${colors.bright}${colors.cyan}
╔══════════════════════════════════════╗
║   Prototype Sync & Deploy System     ║
╚══════════════════════════════════════╝${colors.reset}`);

    // Step 1: Scan prototypes
    log.section('Scanning prototypes directory...');
    const prototypes = await scanPrototypes();
    
    const totalCount = Object.values(prototypes).reduce((sum, arr) => sum + arr.length, 0);
    log.success(`Found ${totalCount} prototypes in ${Object.keys(prototypes).length} features`);
    
    for (const [feature, protos] of Object.entries(prototypes)) {
        log.info(`${feature}: ${protos.length} prototype(s)`);
    }

    // Step 2: Load deployment cache
    log.section('Loading deployment cache...');
    const deploymentCache = await loadDeploymentCache();
    
    // Step 3: Check for changes and deploy
    log.section('Checking for changes and deploying...');
    let deploymentsNeeded = 0;
    let deploymentsMade = 0;
    
    for (const [feature, protos] of Object.entries(prototypes)) {
        for (const proto of protos) {
            const cached = deploymentCache[proto.slug];
            
            if (!cached || await hasChanged(proto.path, cached.lastModified)) {
                deploymentsNeeded++;
                
                const url = await deployPrototype(proto, feature);
                if (url) {
                    deploymentCache[proto.slug] = {
                        url,
                        lastModified: new Date().toISOString(),
                        timestamp: new Date().toISOString(),
                        feature,
                        name: proto.name
                    };
                    deploymentsMade++;
                }
            } else {
                log.item(`${proto.name} - no changes, using cached URL`);
            }
        }
    }
    
    if (deploymentsNeeded > 0) {
        log.success(`Deployed ${deploymentsMade} of ${deploymentsNeeded} prototypes`);
    } else {
        log.info('All prototypes up to date');
    }

    // Step 4: Save deployment cache
    await saveDeploymentCache(deploymentCache);
    
    // Step 5: Generate gallery
    log.section('Generating gallery...');
    await generateGallery(prototypes, deploymentCache);
    
    // Step 6: Deploy gallery
    log.section('Deploying gallery...');
    try {
        const { stdout } = await execAsync(
            `cd "${CONFIG.galleryDir}" && vercel --prod --name="prototype-gallery" --yes --no-clipboard`,
            { timeout: 60000 }
        );
        
        const urlMatch = stdout.match(/https:\/\/[^\s]+\.vercel\.app/);
        if (urlMatch) {
            log.success(`Gallery deployed to: ${urlMatch[0]}`);
        }
    } catch (error) {
        log.error(`Failed to deploy gallery: ${error.message}`);
    }

    console.log(`\n${colors.bright}${colors.green}✓ Sync complete!${colors.reset}\n`);
}

// Check for Vercel CLI
async function checkDependencies() {
    log.section('🔍 Checking System Requirements...');
    
    // Check for Vercel CLI
    try {
        const { stdout: vercelVersion } = await execAsync('vercel --version');
        log.success(`Vercel CLI found: ${vercelVersion.trim()}`);
    } catch {
        log.error('Vercel CLI not found!');
        console.log('\n  To fix this:');
        console.log('  1. Install Vercel CLI: npm install -g vercel');
        console.log('  2. Then login: vercel login');
        console.log('\n  This is needed to deploy your prototypes to the web.');
        process.exit(1);
    }
    
    // Check if logged in to Vercel
    try {
        const { stdout } = await execAsync('vercel whoami');
        log.success(`Logged in to Vercel as: ${stdout.trim()}`);
    } catch {
        log.warning('Not logged in to Vercel!');
        console.log('\n  To fix this:');
        console.log('  Run: vercel login');
        console.log('  This will open your browser to authenticate.');
        console.log('\n  You need to be logged in to deploy prototypes.');
        process.exit(1);
    }
    
    // Check if prototypes directory exists
    try {
        await fs.access(CONFIG.prototypesDir);
        const stats = await fs.stat(CONFIG.prototypesDir);
        if (!stats.isDirectory()) {
            throw new Error('Not a directory');
        }
        log.success('Prototypes directory found');
    } catch {
        log.error(`Prototypes directory not found: ${CONFIG.prototypesDir}`);
        console.log('\n  Create it with: mkdir prototypes');
        process.exit(1);
    }
    
    console.log('');
}

// Main execution
async function main() {
    try {
        log.header();
        await checkDependencies();
        await syncPrototypes();
    } catch (error) {
        log.error(`Fatal error: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { syncPrototypes, scanPrototypes, generateGallery };