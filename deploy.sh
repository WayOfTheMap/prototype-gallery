#!/bin/bash

# Generic Prototype Gallery Deployment Script
# This script deploys prototypes from any project to a unified Vercel gallery

set -e

# Default values
SOURCE_DIR=""
CONFIG_FILE=""
GALLERY_DIR="./gallery"
VERBOSE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }
log_section() { echo -e "\n${CYAN}${1}${NC}"; }
log_header() {
    echo -e "\n${MAGENTA}============================================================${NC}"
    echo -e "${MAGENTA}   🎨 GENERIC PROTOTYPE GALLERY DEPLOYER${NC}"
    echo -e "${MAGENTA}============================================================${NC}\n"
}

# Usage information
show_usage() {
    cat << EOF
Generic Prototype Gallery Deployment Script

USAGE:
    $0 --source-dir <path> --config <file> [options]

REQUIRED:
    --source-dir <path>    Path to directory containing prototypes
    --config <file>        Path to .gallery-config file

OPTIONS:
    --verbose              Enable verbose output
    --help                 Show this help message

EXAMPLES:
    # Deploy OmniVerse prototypes
    $0 --source-dir ./prototypes --config ./.gallery-config

    # Deploy from different directory  
    $0 --source-dir /path/to/prototypes --config /path/to/.gallery-config

CONFIGURATION FILE FORMAT:
    The config file should define these variables:
    - PROJECT_NAME: Unique identifier for your project
    - PROJECT_TITLE: Display name for the gallery
    - VERCEL_PROJECT_NAME: Name for the Vercel deployment
    - PROTOTYPES_DIR: Relative path to prototypes (optional)
    - PROJECT_DESCRIPTION: Description for the gallery (optional)

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --source-dir)
                SOURCE_DIR="$2"
                shift 2
                ;;
            --config)
                CONFIG_FILE="$2"
                shift 2
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# Load configuration file
load_config() {
    if [[ ! -f "$CONFIG_FILE" ]]; then
        log_error "Configuration file not found: $CONFIG_FILE"
        exit 1
    fi

    log_info "Loading configuration from: $CONFIG_FILE"
    source "$CONFIG_FILE"

    # Validate required configuration
    if [[ -z "$PROJECT_NAME" ]]; then
        log_error "PROJECT_NAME not defined in config file"
        exit 1
    fi

    if [[ -z "$VERCEL_PROJECT_NAME" ]]; then
        log_error "VERCEL_PROJECT_NAME not defined in config file"
        exit 1
    fi

    # Set defaults for optional values
    PROJECT_TITLE="${PROJECT_TITLE:-$PROJECT_NAME}"
    PROJECT_DESCRIPTION="${PROJECT_DESCRIPTION:-Interactive prototypes for $PROJECT_TITLE}"

    if [[ "$VERBOSE" == "true" ]]; then
        log_info "Configuration loaded:"
        log_info "  PROJECT_NAME: $PROJECT_NAME"
        log_info "  PROJECT_TITLE: $PROJECT_TITLE"
        log_info "  VERCEL_PROJECT_NAME: $VERCEL_PROJECT_NAME"
        log_info "  PROJECT_DESCRIPTION: $PROJECT_DESCRIPTION"
    fi
}

# Validate inputs
validate_inputs() {
    if [[ -z "$SOURCE_DIR" ]]; then
        log_error "Source directory is required. Use --source-dir"
        show_usage
        exit 1
    fi

    if [[ -z "$CONFIG_FILE" ]]; then
        log_error "Configuration file is required. Use --config"
        show_usage
        exit 1
    fi

    if [[ ! -d "$SOURCE_DIR" ]]; then
        log_error "Source directory does not exist: $SOURCE_DIR"
        exit 1
    fi

    log_success "Inputs validated"
}

# Check dependencies
check_dependencies() {
    log_section "Checking dependencies..."

    # Check for Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required but not installed"
        exit 1
    fi
    log_success "Node.js found: $(node --version)"

    # Check for Vercel CLI
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI is required but not installed"
        log_info "Install with: npm install -g vercel"
        exit 1
    fi
    log_success "Vercel CLI found: $(vercel --version)"

    # Check if logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        log_error "Not logged in to Vercel"
        log_info "Please run: vercel login"
        exit 1
    fi
    log_success "Logged in to Vercel as: $(vercel whoami)"
}

# Clean and prepare gallery directory
prepare_gallery() {
    log_section "Preparing gallery directory..."

    # Clean gallery directory
    if [[ -d "$GALLERY_DIR" ]]; then
        rm -rf "$GALLERY_DIR"
    fi
    mkdir -p "$GALLERY_DIR"

    log_success "Gallery directory prepared: $GALLERY_DIR"
}

# Copy prototypes to gallery structure
sync_prototypes() {
    log_section "Syncing prototypes..."

    local prototype_count=0

    # Copy all prototypes maintaining directory structure
    if [[ -d "$SOURCE_DIR" ]]; then
        # Use rsync for efficient copying, excluding common unwanted files
        rsync -av \
            --exclude='node_modules' \
            --exclude='.git' \
            --exclude='.DS_Store' \
            --exclude='*.log' \
            --exclude='vercel.json' \
            "$SOURCE_DIR/" "$GALLERY_DIR/"

        # Count prototypes (HTML files)
        prototype_count=$(find "$GALLERY_DIR" -name "*.html" -type f | wc -l)
        
        log_success "Synced $prototype_count prototype files"
    else
        log_error "Source directory not found: $SOURCE_DIR"
        exit 1
    fi

    if [[ $prototype_count -eq 0 ]]; then
        log_warning "No HTML files found in source directory"
    fi
}

# Generate gallery index
generate_gallery_index() {
    log_section "Generating gallery index..."

    # Call the Node.js script to generate the gallery
    node -e "
        const path = require('path');
        const fs = require('fs').promises;

        const config = {
            projectName: '$PROJECT_NAME',
            projectTitle: '$PROJECT_TITLE',
            projectDescription: '$PROJECT_DESCRIPTION',
            galleryDir: '$GALLERY_DIR'
        };

        async function generateIndex() {
            // Scan for prototypes - look for HTML files directly
            const prototypes = {};
            
            async function scanDirectory(dir, category = '') {
                const items = await fs.readdir(dir);
                
                for (const item of items) {
                    const itemPath = path.join(dir, item);
                    const stat = await fs.stat(itemPath);
                    
                    if (stat.isDirectory()) {
                        // This is a feature directory, scan for HTML files
                        const categoryName = category || item;
                        await scanDirectory(itemPath, categoryName);
                    } else if (stat.isFile() && item.endsWith('.html')) {
                        // This is an HTML file
                        const categoryName = category || 'general';
                        
                        if (!prototypes[categoryName]) {
                            prototypes[categoryName] = [];
                        }
                        
                        // Extract title from HTML if possible
                        const baseName = path.basename(item, '.html');
                        let title = baseName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        
                        try {
                            const htmlContent = await fs.readFile(itemPath, 'utf8');
                            const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
                            if (titleMatch) {
                                title = titleMatch[1].replace(/^.*?[-–—]\\s*/, '').trim() || title;
                            }
                        } catch (e) {}
                        
                        const relativePath = category ? path.join(category, item) : item;
                        
                        prototypes[categoryName].push({
                            name: title,
                            slug: baseName,
                            path: relativePath,
                            url: './' + relativePath
                        });
                    }
                }
            }
            
            await scanDirectory(config.galleryDir);
            
            // Generate HTML
            const html = \`<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>\${config.projectTitle}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            background: #f5f5f5;
            line-height: 1.6;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        h1 { color: #333; font-size: 2.5em; font-weight: 300; }
        .subtitle { color: #666; font-size: 1.1em; margin-top: 5px; }
        .sync-status {
            font-size: 12px; color: #666; background: white;
            padding: 6px 12px; border-radius: 6px; border: 1px solid #ddd;
        }
        .feature-section { margin-bottom: 40px; }
        .feature-title {
            font-size: 1.4em; color: #555; margin-bottom: 15px;
            padding-bottom: 8px; border-bottom: 1px solid #e0e0e0;
            text-transform: capitalize;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .tile {
            background: white; border: 1px solid #ddd; border-radius: 8px;
            padding: 20px; text-decoration: none; color: inherit;
            transition: all 0.2s; position: relative;
        }
        .tile:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        .tile h3 {
            font-size: 1.1em; margin-bottom: 8px; color: #0066cc;
            font-weight: 500;
        }
        .tile p { color: #666; font-size: 0.9em; }
        .status {
            margin-top: 10px; font-size: 0.8em; color: #28a745;
        }
        .empty-state {
            text-align: center; padding: 60px 20px; color: #666;
        }
        .empty-state h2 { margin-bottom: 10px; color: #999; }
    </style>
</head>
<body>
    <div class=\"header\">
        <div>
            <h1>\${config.projectTitle}</h1>
            <div class=\"subtitle\">\${config.projectDescription}</div>
        </div>
        <div class=\"sync-status\">
            Last updated: \${new Date().toLocaleString()}
        </div>
    </div>
    
    \${Object.keys(prototypes).length === 0 ? \`
        <div class=\"empty-state\">
            <h2>No prototypes found</h2>
            <p>Add HTML files to your prototypes directory and redeploy.</p>
        </div>
    \` : Object.entries(prototypes).map(([category, items]) => \`
        <div class=\"feature-section\">
            <h2 class=\"feature-title\">\${category.replace(/-/g, ' ')}</h2>
            <div class=\"grid\">
                \${items.map(proto => \`
                    <a href=\"\${proto.url}\" class=\"tile\">
                        <h3>\${proto.name}</h3>
                        <p>Interactive prototype</p>
                        <div class=\"status\">✓ Available</div>
                    </a>
                \`).join('')}
            </div>
        </div>
    \`).join('')}
</body>
</html>\`;
            
            await fs.writeFile(path.join(config.galleryDir, 'index.html'), html);
            console.log('Gallery index generated successfully');
        }
        
        generateIndex().catch(console.error);
    "

    log_success "Gallery index generated"
}

# Create vercel configuration
create_vercel_config() {
    log_section "Creating Vercel configuration..."

    cat > "$GALLERY_DIR/vercel.json" << EOF
{
  "public": true,
  "cleanUrls": true,
  "trailingSlash": false
}
EOF

    log_success "Vercel configuration created"
}

# Deploy to Vercel
deploy_to_vercel() {
    log_section "Deploying to Vercel..."

    cd "$GALLERY_DIR"
    
    # Deploy with specific project name
    local deploy_output
    deploy_output=$(vercel --prod --name="$VERCEL_PROJECT_NAME" --yes 2>&1)
    local exit_code=$?
    
    if [[ "$VERBOSE" == "true" ]]; then
        echo "$deploy_output"
    fi
    
    if [[ $exit_code -eq 0 ]]; then
        # Extract deployment URL
        DEPLOYMENT_URL=$(echo "$deploy_output" | grep -o 'https://[^[:space:]]*\.vercel\.app' | head -1)
        if [[ -n "$DEPLOYMENT_URL" ]]; then
            log_success "Deployment successful!"
            log_success "Gallery URL: $DEPLOYMENT_URL"
        else
            log_success "Deployment successful! Check Vercel dashboard for URL."
        fi
    else
        log_error "Deployment failed"
        echo "$deploy_output"
        exit 1
    fi
    
    cd - > /dev/null
}

# Main execution function
main() {
    log_header
    
    parse_args "$@"
    validate_inputs
    load_config
    check_dependencies
    prepare_gallery
    sync_prototypes
    generate_gallery_index
    create_vercel_config
    deploy_to_vercel
    
    log_section "Deployment complete! 🎉"
}

# Run main function with all arguments
main "$@"