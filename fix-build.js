import fs from 'fs';
import path from 'path';

const serverPath = './dist/index.js';

if (fs.existsSync(serverPath)) {
  console.log('Fixing ES module compatibility in dist/index.js...');
  
  let content = fs.readFileSync(serverPath, 'utf8');
  
  // Replace __dirname with import.meta.dirname for ES modules
  content = content.replace(
    /path3\.join\(__dirname,\s*["']\.\.\/public["']\)/g,
    'path3.resolve(import.meta.dirname, "public")'
  );
  
  // Also handle any other __dirname patterns
  content = content.replace(
    /__dirname/g,
    'import.meta.dirname'
  );
  
  fs.writeFileSync(serverPath, content);
  console.log('Fixed __dirname issues in production build');
} else {
  console.log('Build file not found at ./dist/index.js');
}