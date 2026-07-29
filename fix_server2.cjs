const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// The replacement was done, but let's grab the part after my inserted code to the end of Tier 5.
const startStr = 'const xaiKey = process.env.XAI_API_KEY';
const startIndex = code.indexOf(startStr);
const endStr = '// Simulation fallback if everything fails';
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + code.substring(endIndex);
    // Remove the unused Gemini import if needed, but whatever.
    // Also add the import for routeLLMRequest at the top.
    if (!code.includes('routeLLMRequest')) {
        code = 'import { routeLLMRequest } from "./services/lib/llmRouter.ts";\n' + code;
    }
    fs.writeFileSync('server.ts', code);
    console.log("Successfully removed old tiers");
} else {
    console.log("Could not find start or end index");
}
