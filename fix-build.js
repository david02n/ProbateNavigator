import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Starting production build...');

// Set environment variables to disable problematic plugins
const env = {
  ...process.env,
  NODE_ENV: 'production',
  REPL_ID: ''
};

// Run the build command
const buildProcess = spawn('npm', ['run', 'build'], {
  env,
  stdio: 'pipe'
});

let output = '';
let errorOutput = '';

buildProcess.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  console.log(text);
});

buildProcess.stderr.on('data', (data) => {
  const text = data.toString();
  errorOutput += text;
  console.error(text);
});

buildProcess.on('close', (code) => {
  console.log(`Build process exited with code ${code}`);
  
  if (code === 0) {
    console.log('Build successful, checking for __dirname issues...');
    
    // Check the built server file for __dirname usage
    const serverPath = './dist/index.js';
    if (fs.existsSync(serverPath)) {
      const serverContent = fs.readFileSync(serverPath, 'utf8');
      if (serverContent.includes('__dirname')) {
        console.log('Found __dirname in built server file - this needs to be fixed');
        
        // Replace __dirname with import.meta.dirname for ES modules
        const fixedContent = serverContent.replace(
          /path\.join\(__dirname,\s*['"`]\.\.\/public['"`]\)/g,
          'path.resolve(import.meta.dirname, "public")'
        );
        
        fs.writeFileSync(serverPath, fixedContent);
        console.log('Fixed __dirname issue in dist/index.js');
      } else {
        console.log('No __dirname issues found in built server');
      }
    }
  } else {
    console.log('Build failed with errors:', errorOutput);
  }
});

// Kill the process after 3 minutes to avoid hanging
setTimeout(() => {
  buildProcess.kill();
  console.log('Build process killed due to timeout');
}, 180000);