#!/bin/bash

set -e

echo "Installing HEV..."

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    echo "Deno not found. Installing Deno..."
    curl -fsSL https://deno.land/install.sh | sh
    export DENO_INSTALL="$HOME/.deno"
    export PATH="$DENO_INSTALL/bin:$PATH"
fi

# Install HEV
echo "Installing HEV CLI..."
deno install --allow-all --global --force --name hev \
    https://raw.githubusercontent.com/vseplet/HEV/main/src/cli.ts

echo ""
echo "HEV installed successfully!"
echo "Run 'hev --help' to get started."
