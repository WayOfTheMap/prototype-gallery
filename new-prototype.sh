#!/bin/bash

# Simplified version of new-prototype-in-folder.sh for easier use
# Usage: ./new-prototype.sh <feature-folder> <prototype-name>

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Create a new prototype"
    echo ""
    echo "Usage: ./new-prototype.sh <feature-folder> <prototype-name>"
    echo ""
    echo "Example: ./new-prototype.sh onboarding welcome-screen"
    echo ""
    echo "This will create: prototypes/onboarding/welcome-screen/"
    exit 1
fi

FEATURE=$1
NAME=$2
PROTO_DIR="prototypes/$FEATURE/$NAME"

# Check if already exists
if [ -d "$PROTO_DIR" ]; then
    echo "❌ Prototype already exists: $PROTO_DIR"
    exit 1
fi

# Create directory structure
mkdir -p "$PROTO_DIR"

# Create basic HTML template
cat > "$PROTO_DIR/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prototype</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f5f5f5;
        }
        
        .back-button {
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #ddd;
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            color: #333;
            font-size: 14px;
            z-index: 1000;
            transition: background 0.2s;
        }
        
        .back-button:hover {
            background: white;
        }
        
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            max-width: 600px;
            width: 90%;
        }
        
        h1 {
            margin-bottom: 20px;
            color: #333;
        }
        
        p {
            color: #666;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <a href="#" class="back-button">← Back to Gallery <span style="opacity: 0.6; font-size: 12px;">(Esc)</span></a>
    <div class="container">
        <h1>New Prototype</h1>
        <p>Start building your prototype here.</p>
    </div>
    
    <!-- Esc key navigation to gallery -->
    <script>
        // Esc key navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // URL will be updated after deployment
                window.history.back();
            }
        });
    </script>
</body>
</html>
EOF

# Create vercel.json with sanitized name
SAFE_NAME=$(echo "proto-$FEATURE-$NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g')
cat > "$PROTO_DIR/vercel.json" << EOF
{
  "name": "$SAFE_NAME",
  "public": true,
  "builds": [],
  "routes": []
}
EOF

echo "✅ Created new prototype: $PROTO_DIR"
echo ""
echo "Next steps:"
echo "1. Edit your prototype: $PROTO_DIR/index.html"
echo "2. Deploy: npm run deploy-prototypes"
echo ""
echo "Tip: Your prototype will be organized under '$FEATURE' in the gallery"