const fs = require('fs');
const path = require('path');

const envExamplePath = path.join(__dirname, '.env.example');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('Created .env file from .env.example');
  console.log('Please update the .env file with your configuration values');
} else {
  console.log('.env file already exists');
} 