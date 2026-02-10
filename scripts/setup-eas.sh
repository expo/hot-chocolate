#!/bin/bash
# Recreates eas.json and adds EAS-related config to app.json

set -e

EAS_PROJECT_ID="355e9a75-384b-4185-aefc-893ac990a771"
ASC_APP_ID="6744465817"

# Create eas.json
cat > eas.json << 'EOF'
{
  "cli": {
    "version": ">= 16.32.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "autoIncrement": true,
      "channel": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "6744465817"
      }
    }
  }
}
EOF

# Add EAS config to app.json using node for safe JSON manipulation
node -e "
const fs = require('fs');
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));

appJson.expo.extra = appJson.expo.extra || {};
appJson.expo.extra.eas = { projectId: '${EAS_PROJECT_ID}' };

appJson.expo.runtimeVersion = { policy: 'appVersion' };
appJson.expo.updates = { url: 'https://u.expo.dev/${EAS_PROJECT_ID}' };

fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2) + '\n');
"

echo "EAS config written to eas.json and app.json"
