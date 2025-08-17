#!/bin/bash
# Exit on error
set -e

# Install Python dependencies
pip install -r requirements.txt

# Make the script executable
chmod +x build.sh