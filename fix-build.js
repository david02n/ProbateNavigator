import fs from 'fs';
import path from 'path';

const serverPath = './dist/index.js';

if (fs.existsSync(serverPath)) {
  console.log('Fixing ES module compatibility in dist/index.js...');
  
  let content = fs.readFileSync(serverPath, 'utf8');
  
  // Add ES module compatibility shim at the very top
  const shimCode = `// ES Module compatibility shim for deployment
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

`;
  
  // Only add shim if not already present
  if (!content.includes('fileURLToPath')) {
    content = shimCode + content;
  }
  
  // Fix all __dirname references - replace with __dirname (now shimmed)
  content = content.replace(
    /path3\.join\(__dirname,\s*["']\.\.\/public["']\)/g,
    'path3.resolve(__dirname, "public")'
  );
  
  // Fix static file serving paths  
  content = content.replace(
    /express\.static\(path3\.join\(__dirname,\s*["']\.\.\/public["']\)\)/g,
    'express.static(path3.resolve(__dirname, "public"))'
  );
  
  // Fix any import.meta.dirname references to use shimmed __dirname
  content = content.replace(
    /import\.meta\.dirname/g,
    '__dirname'
  );
  
  // Ensure server listens on correct host and port for deployment
  content = content.replace(
    /server\.listen\(\{[^}]+\}/g,
    'server.listen(process.env.PORT || 5000, "0.0.0.0"'
  );
  
  // Fix server.listen calls to use proper Node.js API
  content = content.replace(
    /server\.listen\(port,\s*host,/g,
    'server.listen(port, host,'
  );
  
  fs.writeFileSync(serverPath, content);
  console.log('Fixed ES module compatibility and deployment issues in production build');
} else {
  console.log('Build file not found at ./dist/index.js');
}