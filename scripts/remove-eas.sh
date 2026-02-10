#!/bin/bash
# Removes EAS-related config from app.json and deletes eas.json

set -e

# Remove eas.json if it exists
rm -f eas.json

# Remove EAS config from app.json using node for safe JSON manipulation
node -e "
const fs = require('fs');
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));

if (appJson.expo.extra) {
  delete appJson.expo.extra.eas;
}
delete appJson.expo.runtimeVersion;
delete appJson.expo.updates;

fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2) + '\n');
"

echo "EAS config removed from app.json and eas.json deleted"
