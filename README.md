# Generic Prototype Gallery System

A lightweight, reusable system for deploying and sharing HTML/CSS/JavaScript prototypes across multiple projects. Each project gets its own unified gallery deployed to Vercel with all prototypes accessible from a single URL.

## 🚀 Quick Start

### For New Projects

1. **Clone this repository:**
   ```bash
   git clone https://github.com/WayOfTheMap/prototype-gallery.git
   cd prototype-gallery
   ```

2. **In your project directory, create a configuration file:**
   ```bash
   # Create .gallery-config in your project root
   cat > .gallery-config << 'EOF'
   PROJECT_NAME="my-project-prototypes"
   PROJECT_TITLE="My Project Prototypes"
   PROJECT_DESCRIPTION="Interactive prototypes for My Project"
   VERCEL_PROJECT_NAME="my-project-prototypes"
   PROTOTYPES_DIR="./prototypes"
   EOF
   ```

3. **Create your deployment script:**
   ```bash
   cat > deploy-prototypes.sh << 'EOF'
   #!/bin/bash
   GALLERY_REPO_PATH="$HOME/Developer/prototype-gallery"
   CONFIG_FILE="./.gallery-config"
   PROTOTYPES_DIR="./prototypes"

   cd "$GALLERY_REPO_PATH"
   ./deploy.sh --source-dir "$PROTOTYPES_DIR" --config "$CONFIG_FILE" --verbose
   EOF
   chmod +x deploy-prototypes.sh
   ```

4. **Deploy your prototypes:**
   ```bash
   ./deploy-prototypes.sh
   ```

## 📁 Project Structure

### This Repository (Generic)
```
prototype-gallery/
├── deploy.sh              # Generic deployment script
├── README.md              # This documentation
└── gallery/               # Generated gallery files (temporary)
```

### Your Project Repository
```
your-project/
├── prototypes/            # Your HTML prototypes
│   ├── feature-a/
│   │   ├── prototype-1.html
│   │   └── prototype-2.html
│   └── feature-b/
│       └── prototype-3.html
├── .gallery-config        # Configuration file
└── deploy-prototypes.sh   # Deployment script
```

## ⚙️ Configuration

### .gallery-config File

Create a `.gallery-config` file in your project root with these variables:

```bash
# Required settings
PROJECT_NAME="unique-project-identifier"          # Used for internal references
PROJECT_TITLE="Display Name for Gallery"          # Shown in gallery header
VERCEL_PROJECT_NAME="vercel-deployment-name"      # Vercel project name
PROTOTYPES_DIR="./prototypes"                     # Path to prototypes directory

# Optional settings
PROJECT_DESCRIPTION="Description for your gallery"
CONTACT_EMAIL="your-email@example.com"
GITHUB_REPO="https://github.com/your-org/your-repo"
GALLERY_THEME="default"
SHOW_DEPLOYMENT_DATES="true"
ENABLE_SEARCH="true"
```

### Configuration Examples

**Simple Project:**
```bash
PROJECT_NAME="design-system-prototypes"
PROJECT_TITLE="Design System Prototypes"
VERCEL_PROJECT_NAME="design-system-prototypes"
PROTOTYPES_DIR="./prototypes"
```

**Complex Project:**
```bash
PROJECT_NAME="saas-app-prototypes"
PROJECT_TITLE="SaaS Application Prototypes"
PROJECT_DESCRIPTION="Interactive prototypes for our SaaS platform redesign"
VERCEL_PROJECT_NAME="saas-app-prototypes"
PROTOTYPES_DIR="./design/prototypes"
CONTACT_EMAIL="design-team@company.com"
GITHUB_REPO="https://github.com/company/saas-app"
```

## 🏗️ How It Works

### Deployment Process

1. **Scan**: The system scans your prototypes directory for HTML files
2. **Copy**: All prototypes are copied to a temporary gallery structure
3. **Generate**: A unified index.html is generated with navigation
4. **Deploy**: Everything is deployed as a single Vercel project
5. **Access**: Your gallery is available at `https://your-project-name.vercel.app`

### URL Structure

After deployment, your prototypes are available at:
```
https://your-project-name.vercel.app/              # Gallery index
https://your-project-name.vercel.app/feature-a/prototype-1.html
https://your-project-name.vercel.app/feature-b/prototype-3.html
```

### Directory Organization

The system automatically organizes prototypes by directory structure:

```
prototypes/
├── authentication/
│   ├── login-form.html      → Authentication → Login Form
│   └── signup-flow.html     → Authentication → Signup Flow  
├── dashboard/
│   └── main-view.html       → Dashboard → Main View
└── onboarding/
    ├── welcome.html         → Onboarding → Welcome
    └── tutorial.html        → Onboarding → Tutorial
```

## 🔧 Requirements

### System Dependencies
- **Node.js** (for gallery generation)
- **Vercel CLI** (`npm install -g vercel`)
- **Bash** (for deployment scripts)
- **Git** (for repository management)

### Setup Verification
```bash
# Check if everything is installed
node --version
vercel --version
vercel whoami  # Must be logged in
```

### First-Time Setup
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Test deployment (run from your project directory)
./deploy-prototypes.sh
```

## 📖 Usage Examples

### Basic HTML Prototype
```html
<!DOCTYPE html>
<html>
<head>
    <title>Login Form Prototype</title>
    <style>/* Your styles */</style>
</head>
<body>
    <h1>Login Form</h1>
    <!-- Your prototype content -->
    <script>/* Your JavaScript */</script>
</body>
</html>
```

### Interactive Prototype with External Libraries
```html
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard Prototype</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body>
    <!-- Alpine.js interactive prototype -->
    <div x-data="{ tab: 'overview' }">
        <!-- Your interactive content -->
    </div>
</body>
</html>
```

## 🎯 Best Practices

### File Organization
- Use descriptive directory names (`authentication`, `dashboard`, `onboarding`)
- Use descriptive file names (`login-form.html`, `signup-flow.html`)
- Keep each prototype focused on a single feature or flow
- Use relative paths for assets within prototypes

### HTML Structure
- Include meaningful `<title>` tags (used for gallery navigation)
- Use semantic HTML for better accessibility
- Include meta viewport tags for mobile compatibility
- Keep external dependencies to a minimum

### Development Workflow
1. Create/modify prototypes locally
2. Test prototypes by opening HTML files in browser
3. Run deployment script when ready to share
4. Share the gallery URL with your team

## 🛠️ Advanced Usage

### Multiple Environments

You can have different configurations for different environments:

```bash
# .gallery-config.dev
PROJECT_NAME="myapp-prototypes-dev"
VERCEL_PROJECT_NAME="myapp-prototypes-dev"

# .gallery-config.prod  
PROJECT_NAME="myapp-prototypes"
VERCEL_PROJECT_NAME="myapp-prototypes"

# Deploy to different environments
./deploy.sh --config .gallery-config.dev
./deploy.sh --config .gallery-config.prod
```

### Custom Deployment Scripts

Create project-specific deployment logic:

```bash
#!/bin/bash
# custom-deploy.sh

# Pre-deployment: Build prototypes
npm run build-prototypes

# Deploy with custom config
cd "$HOME/Developer/prototype-gallery"
./deploy.sh --source-dir ./build/prototypes --config ./.gallery-config

# Post-deployment: Notify team
curl -X POST "$SLACK_WEBHOOK" -d '{"text":"Prototypes deployed!"}'
```

### Integration with CI/CD

Add to your GitHub Actions or similar:

```yaml
- name: Deploy Prototypes
  run: |
    cd prototype-gallery
    ./deploy.sh --source-dir ../my-project/prototypes --config ../my-project/.gallery-config
```

## 🔍 Troubleshooting

### Common Issues

**"Vercel CLI not found"**
```bash
npm install -g vercel
```

**"Not logged in to Vercel"**
```bash
vercel login
```

**"No prototypes found"**
- Check that your `PROTOTYPES_DIR` path is correct
- Ensure your prototypes directory contains `.html` files
- Verify directory structure matches expected format

**"Deployment failed"**
- Check Vercel project name is unique and valid
- Ensure you have permission to create projects in your Vercel account
- Try deploying with `--verbose` flag for more details

### Debug Mode

Run with verbose output to see detailed information:
```bash
./deploy.sh --source-dir ./prototypes --config ./.gallery-config --verbose
```

## 🤝 Contributing

This is a generic tool designed to work with any project. If you find issues or want to improve the system:

1. Fork this repository
2. Make your changes to the generic scripts
3. Test with multiple project configurations  
4. Submit a pull request

### Development Guidelines
- Keep all scripts project-agnostic
- Use configuration files for project-specific settings
- Maintain backward compatibility when possible
- Include clear error messages and documentation

## 📄 License

MIT License - feel free to use this in your projects!

## 🆘 Support

- Create issues in this repository for bugs or feature requests
- Check existing issues for common problems
- Review the troubleshooting section above

---

**Happy prototyping! 🎨**