#!/bin/bash

# Debug deployment script
ENVIRONMENT=${1:-production}
USERNAME=${2:-your-username}

echo "=== Debug Information ==="
echo "Environment: $ENVIRONMENT"
echo "Username: $USERNAME"
echo "Remote host: techonward.in"

# Test SSH connection
echo "Testing SSH connection to techonward.in..."
ssh -o ConnectTimeout=10 -o BatchMode=yes $USERNAME@techonward.in "echo 'SSH connection successful'" 2>&1

echo ""
echo "Testing SCP connection..."
echo "whoami" | ssh -o ConnectTimeout=10 -o BatchMode=yes $USERNAME@techonward.in "cat" 2>&1

echo ""
echo "=== SSH Config Check ==="
echo "Checking ~/.ssh/config for any github.com entries..."
grep -n "github.com" ~/.ssh/config 2>/dev/null || echo "No github.com entries found in SSH config"

echo ""
echo "=== SSH Config Fix ==="
echo "Found the issue: Your SSH config has 'Hostname github.com' under 'Host *'"
echo "This redirects all connections to GitHub."
echo ""
echo "To fix this, add this to your ~/.ssh/config:"
echo ""
echo "Host techonward.in"
echo "    HostName techonward.in"
echo "    User $USERNAME"
echo "    IdentityFile ~/.ssh/id_rsa"
echo "    IdentitiesOnly yes"
echo ""
echo "Or run this command to add it automatically:"
echo "echo -e '\nHost techonward.in\n    HostName techonward.in\n    User $USERNAME\n    IdentityFile ~/.ssh/id_rsa\n    IdentitiesOnly yes' >> ~/.ssh/config"
