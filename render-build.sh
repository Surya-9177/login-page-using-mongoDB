#!/usr/bin/env bash
echo "Reinstalling clean modules on Render..."
rm -rf node_modules
npm install --force
