const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// The sed command changed exactly '// Tier 1: Check for Direct xAI API Key' to the multi-line string.
// Let's restore the file first since I can't use git checkout easily.
// I'll grab it from git object database maybe? Or just replace the messed up block.
