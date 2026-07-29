const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const startStr = 'const result = await routeLLMRequest(message, model, systemPrompt, proxy, extra_data);';
const cutStart = code.indexOf('    const xaiKey = process.env.XAI_API_KEY');
const cutEnd = code.indexOf('    // === Cloud SQL (ai-studio-4e79f483) Sync Routes ===');

if (cutStart !== -1 && cutEnd !== -1) {
    code = code.substring(0, cutStart) + "  });\n\n" + code.substring(cutEnd);
    if (!code.includes('import { routeLLMRequest }')) {
        code = 'import { routeLLMRequest } from "./services/lib/llmRouter.ts";\n' + code;
    }
    fs.writeFileSync('server.ts', code);
    console.log("Success");
} else {
    console.log("Could not find ranges to cut");
}
