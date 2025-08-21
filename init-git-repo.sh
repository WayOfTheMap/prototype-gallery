#!/bin/bash

echo "🚀 Initializing Git Repository for Prototype Gallery System"
echo "=========================================================="
echo ""

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Prototype Gallery System

Features:
- One-command deployment system
- Auto-generated gallery with search
- Organized prototype structure
- Keyboard navigation (Cmd+K, Esc)
- Public access without authentication
- Consistent URLs across deployments"

echo ""
echo "✅ Repository initialized!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub/GitLab"
echo "2. Add the remote:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/prototype-gallery.git"
echo "3. Push to remote:"
echo "   git push -u origin main"
echo ""
echo "For others to use:"
echo "1. They clone: git clone [your-repo-url]"
echo "2. They run: npm run setup"
echo "3. They're ready to create and deploy prototypes!"