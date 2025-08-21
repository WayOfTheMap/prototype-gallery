# Prototype Manager

A lightweight system for hosting and sharing HTML/CSS/JavaScript prototypes via public URLs.

## Features

- **Instant Deployment**: Deploy prototypes to Vercel in seconds
- **Public URLs**: Get shareable links for user feedback
- **Simple CLI**: Easy command-line interface
- **Free Hosting**: Uses Vercel's free tier
- **Zero Config**: Works out of the box with HTML files

## Quick Start

1. **Initial Setup** (one time only):
```bash
cd prototype-manager
npm install
npm run setup
```

2. **Login to Vercel** (one time only):
```bash
vercel login
```

3. **Deploy a Prototype**:
```bash
npm run deploy
# Or deploy specific prototype:
npm run deploy smart-flows-mockup-1-ai-first
```

## Commands

- `npm run setup` - Initial setup and organize existing prototypes
- `npm run deploy [name]` - Deploy a prototype (interactive if no name provided)
- `npm run list` - List all prototypes and their deployment status
- `npm run quick` - Quick deploy HTML file from current directory
- `npm run url <name>` - Get the deployed URL for a prototype
- `npm run help` - Show available commands

## Directory Structure

```
DevMini/
├── prototypes/                    # All your prototypes
│   ├── smart-flows-mockup-1/
│   │   ├── index.html
│   │   └── vercel.json
│   ├── dashboard-v2/
│   │   └── index.html
│   └── ...
└── prototype-manager/
    ├── cli.js                     # Main CLI tool
    ├── setup.js                   # Setup script
    └── config.json                # Deployment tracking
```

## Adding New Prototypes

1. Create a new folder in `prototypes/`
2. Add your `index.html` file (and any assets)
3. Run `npm run deploy` and select your prototype

## Workflow Integration

### From Claude Code or Cursor

1. Create/edit your prototype HTML
2. Save to `prototypes/your-prototype-name/index.html`
3. In terminal: `cd prototype-manager && npm run deploy your-prototype-name`
4. Share the generated URL

### Quick Deploy Current File

If you're working on an HTML file in any directory:
```bash
cd prototype-manager
npm run quick
# Select your HTML file from the list
```

## Example Workflow

```bash
# List available prototypes
npm run list

# Deploy a specific prototype
npm run deploy smart-flows-mockup-3

# Get the URL later
npm run url smart-flows-mockup-3

# Quick deploy from anywhere
npm run quick
```

## Tips

- Each deployment gets a unique URL that remains stable
- URLs are automatically copied to clipboard (macOS)
- Prototypes are served with HTTPS and CDN caching
- No build process needed for simple HTML/CSS/JS

## Troubleshooting

**"Deployment failed"**
- Run `vercel login` to authenticate
- Check that your prototype has an `index.html` file

**"Command not found: vercel"**
- Run `npm install -g vercel`

**Can't see my changes**
- Vercel caches aggressively; add `?v=2` to your URL or redeploy

## Cost

- **Free** for personal use (Hobby plan)
- Includes custom domains, HTTPS, unlimited deployments
- No credit card required