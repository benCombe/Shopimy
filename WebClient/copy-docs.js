const fs = require('fs');
const path = require('path');

// Source directories and files
const rootDir = path.resolve(__dirname, '..');
const docSrcDir = path.resolve(rootDir, 'Documents');
const stylesSrcFile = path.resolve(__dirname, 'src', 'README-STYLES.md');
const readmeSrcFile = path.resolve(rootDir, 'README.md');

// Destination directory
const docDestDir = path.resolve(__dirname, 'src', 'assets', 'docs');

// Create destination directory if it doesn't exist
if (!fs.existsSync(docDestDir)) {
  fs.mkdirSync(docDestDir, { recursive: true });
  console.log(`Created directory: ${docDestDir}`);
}

// Copy README.md from root directory
try {
  fs.copyFileSync(readmeSrcFile, path.join(docDestDir, 'README.md'));
  console.log(`Copied: README.md`);
} catch (error) {
  console.error(`Error copying README.md: ${error.message}`);
}

// Copy README-STYLES.md from WebClient/src
try {
  fs.copyFileSync(stylesSrcFile, path.join(docDestDir, 'README-STYLES.md'));
  console.log(`Copied: README-STYLES.md`);
} catch (error) {
  console.error(`Error copying README-STYLES.md: ${error.message}`);
}

// Files to copy from Documents directory
const docFiles = [
  'ARCHITECTURE.md',
  'DEVELOPMENT_GUIDELINES.md',
  'REQUIREMENTS.md',
  'DEPLOYMENT.md',
  'EMAIL_MANAGEMENT.md',
  'DOCUMENTATION.md'
];

// Copy files from Documents directory
docFiles.forEach(file => {
  try {
    fs.copyFileSync(path.join(docSrcDir, file), path.join(docDestDir, file));
    console.log(`Copied: ${file}`);
  } catch (error) {
    console.error(`Error copying ${file}: ${error.message}`);
  }
});

console.log('Documentation files copied to assets/docs directory.'); 