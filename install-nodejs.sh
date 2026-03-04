#!/bin/bash

# Node.js Installation Script for Hostinger
echo "=== Node.js Installation on Hostinger ==="

# Check if Node.js is already installed
echo "Checking current Node.js installation..."
ssh -p 65002 $1@techonward.in << 'EOF'
    which node && echo "Node.js found: $(node --version)" || echo "Node.js not found"
    which npm && echo "npm found: $(npm --version)" || echo "npm not found"
EOF

echo ""
echo "Installing Node.js using NVM (Node Version Manager)..."

# Install NVM and Node.js
ssh -p 65002 $1@techonward.in << 'EOF'
    # Download and install NVM
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    
    # Source NVM
    export NVM_DIR="\$HOME/.nvm"
    [ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
    [ -s "\$NVM_DIR/bash_completion" ] && \. "\$NVM_DIR/bash_completion"
    
    # Install latest LTS Node.js
    nvm install --lts
    
    # Use latest LTS
    nvm use --lts
    
    # Make Node.js available in future sessions
    echo "export NVM_DIR=\"\$HOME/.nvm\"" >> ~/.bashrc
    echo "[ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"" >> ~/.bashrc
    echo "[ -s \"\$NVM_DIR/bash_completion\" ] && \. \"\$NVM_DIR/bash_completion\"" >> ~/.bashrc
    
    # Verify installation
    echo "Node.js version: \$(node --version)"
    echo "npm version: \$(npm --version)"
EOF

echo ""
echo "Node.js installation completed!"
echo "You may need to log out and log back in for PATH changes to take effect."
