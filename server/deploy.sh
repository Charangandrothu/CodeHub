#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd /root/codehubx-server
echo "=== Node version ==="
node --version
echo "=== Installing dependencies ==="
npm install --production
echo "=== Restarting server ==="
pm2 startOrRestart ecosystem.config.js --env production
pm2 save
echo "=== Done! Current status ==="
pm2 list
