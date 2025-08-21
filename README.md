# 🎨 Prototype Gallery System

A lightweight, automated system for deploying and sharing HTML/CSS/JavaScript prototypes using Vercel. Perfect for product designers who want to quickly share interactive prototypes with stakeholders.

![Gallery Preview](https://img.shields.io/badge/Status-Ready%20to%20Use-green)
![Deployment](https://img.shields.io/badge/Deployment-Vercel-black)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- **🚀 One-Command Deployment** - Deploy all prototypes with `npm run deploy-prototypes`
- **📁 Organized Structure** - Group prototypes by feature/project
- **🔍 Command Palette** - Press `⌘K` to search and navigate prototypes
- **⌨️ Keyboard Navigation** - Press `Esc` in any prototype to return to gallery
- **🔗 Consistent URLs** - Stable URLs that don't change between deployments
- **🌐 Public Access** - Share with anyone, no login required
- **⚡ Smart Sync** - Only deploys changed prototypes

## 🎯 Perfect For

- Product designers sharing early concepts
- Design teams collaborating on prototypes
- Quick iteration and feedback cycles
- Client presentations
- Design documentation

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm
- Free [Vercel account](https://vercel.com/signup)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone [your-repo-url]
cd prototype-gallery
```

### 2. Run Setup

```bash
npm run setup
```

This will:
- Install all dependencies
- Install Vercel CLI globally
- Create necessary directories
- Guide you through Vercel login

### 3. Create Your First Prototype

```bash
./new-prototype.sh my-feature my-first-prototype
```

### 4. Deploy Everything

```bash
npm run deploy-prototypes
```

### 5. Access Your Gallery

After first deployment, you'll get a URL like:
```
https://gallery-[unique-id].vercel.app
```

**Bookmark this URL!** It will remain consistent for all future deployments.

## 📁 Project Structure

```
prototype-gallery/
├── prototypes/              # Your prototypes go here
│   ├── example-feature/     # Feature/project folders
│   │   └── example-prototype/
│   │       ├── index.html
│   │       └── vercel.json
│   └── [your-features]/     # Create your own feature folders
│       └── [your-prototypes]/
├── gallery/                 # Auto-generated gallery (don't edit)
├── prototype-manager/       # CLI tools
├── sync-prototypes.js       # Main deployment script
├── new-prototype.sh         # Create new prototypes
├── setup.sh                 # First-time setup
└── package.json
```

## 📖 Usage Guide

### Creating Prototypes

#### Option 1: Use the helper script
```bash
./new-prototype.sh feature-name prototype-name
```

#### Option 2: Manual creation
1. Create folder: `prototypes/feature-name/prototype-name/`
2. Add your `index.html`
3. Run deployment

### Deploying

Deploy everything with one command:
```bash
npm run deploy-prototypes
```

This will:
- ✅ Check Vercel is configured
- ✅ Scan all prototypes
- ✅ Deploy changed prototypes
- ✅ Update the gallery
- ✅ Give you shareable URLs

### Organizing Prototypes

Structure your prototypes by feature or project:
```
prototypes/
├── onboarding/
│   ├── welcome-screen/
│   ├── tutorial-flow/
│   └── first-setup/
├── dashboard/
│   ├── analytics-view/
│   └── settings-panel/
└── mobile/
    ├── ios-app/
    └── android-app/
```

## ⌨️ Keyboard Shortcuts

### In Gallery
- `⌘K` - Open search palette
- `Enter` - Navigate to selected prototype
- `↑↓` - Navigate search results

### In Prototypes
- `Esc` - Return to gallery

## 🔧 Configuration

### Consistent URLs

After first deployment, Vercel creates stable aliases. Your URLs will look like:
- Gallery: `https://gallery-[project].vercel.app`
- Prototypes: `https://proto-[name].vercel.app`

These remain consistent across deployments.

### Public Access

All prototypes are publicly accessible by default. No authentication required for viewers.

## 🎨 For Designers

### No Technical Knowledge Required

1. **Create** - Drop your HTML files in the prototypes folder
2. **Deploy** - Run `npm run deploy-prototypes`
3. **Share** - Send the gallery link to stakeholders

### Tips

- Keep prototype names simple (use dashes, not spaces)
- Organize by project or feature
- Each prototype needs an `index.html` file
- Use the gallery URL as your main sharing link
- Bookmark your gallery URL for quick access

## 🛠 Troubleshooting

### "Vercel CLI not found"
```bash
npm install -g vercel
```

### "Not logged in to Vercel"
```bash
vercel login
```

### "Prototypes directory not found"
```bash
mkdir prototypes
```

### URLs keep changing
- Ensure each prototype has a unique name in `vercel.json`
- Run `vercel link` in the gallery folder

## 📦 What's Included

- **Smart Sync System** - Intelligently deploys only changed files
- **Gallery Generator** - Auto-creates searchable gallery
- **Prototype Templates** - Ready-to-use HTML templates
- **Helper Scripts** - Quick commands for common tasks
- **Full Documentation** - Comprehensive guides for all features

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use this in your projects!

## 🙏 Acknowledgments

Built with:
- [Vercel](https://vercel.com) for hosting
- [Node.js](https://nodejs.org) for scripting
- Love for simple, effective tools

---

## 📚 Additional Resources

### Available Scripts

- `npm run setup` - First-time setup
- `npm run deploy-prototypes` - Deploy all prototypes
- `./new-prototype.sh [feature] [name]` - Create new prototype
- `./deploy-prototype.sh [name]` - Deploy single prototype

### Environment Variables

No environment variables required! Everything works out of the box.

### Support

Having issues? Check the [troubleshooting guide](#-troubleshooting) or open an issue.

---

**Made with ❤️ for designers who build**