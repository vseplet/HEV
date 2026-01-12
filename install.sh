#!/bin/bash
set -e

REPO="vseplet/HEV"

echo "Installing HEV..."
echo

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    echo "Deno not found. Installing..."
    curl -fsSL https://deno.land/install.sh | sh

    export DENO_INSTALL="$HOME/.deno"
    export PATH="$DENO_INSTALL/bin:$PATH"

    echo
    echo "Deno installed. You may need to restart your shell or run:"
    echo "  export PATH=\"\$HOME/.deno/bin:\$PATH\""
    echo
fi

echo "Deno version: $(deno --version | head -1)"
echo

# Get latest version from GitHub
echo "Fetching latest version..."
LATEST=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" 2>/dev/null | grep '"tag_name"' | sed 's/.*"tag_name": "\(.*\)".*/\1/' || echo "")

if [ -z "$LATEST" ]; then
    echo "No releases found, using main branch..."
    VERSION="main"
else
    echo "Latest version: $LATEST"
    VERSION="$LATEST"
fi

# Install hev
echo
echo "Installing hev@${VERSION}..."
deno install -g -n hev -rf --allow-all \
    --import-map="https://raw.githubusercontent.com/${REPO}/${VERSION}/deno.json" \
    "https://raw.githubusercontent.com/${REPO}/${VERSION}/src/cli.ts"

echo
echo "Done! Run 'hev --help' to get started."
echo
echo "If 'hev' command is not found, add Deno to your PATH:"
echo "  export PATH=\"\$HOME/.deno/bin:\$PATH\""
