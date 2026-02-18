const axios = require("axios");
const Submission = require("../models/Submission");

// Judge0 language IDs
const languageIds = {
    javascript: 63,
    python: 71,
    cpp: 54,
    java: 62
};

// Helper to normalized output
const normalizeOutput = (str) => {
    if (!str) return "";
    return str.trim().replace(/\r\n/g, "\n");
};

// Helper to extract signature
const getFunctionSignature = (code, language) => {
    if (language === 'python') {
        const match = code.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\):/);
        if (match) {
            return {
                name: match[1],
                args: match[2].split(',').map(arg => arg.trim()).filter(a => a)
            };
        }
    } else if (language === 'javascript') {
        const matchFunc = code.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/);
        if (matchFunc) {
            return {
                name: matchFunc[1],
                args: matchFunc[2].split(',').map(arg => arg.trim()).filter(a => a)
            };
        }
        const matchArrow = code.match(/(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\(?([^)=]*)\)?\s*=>/);
        if (matchArrow) {
            return {
                name: matchArrow[1],
                args: matchArrow[2].split(',').map(arg => arg.trim()).filter(a => a)
            };
        }
    }
    return null;
};

// Helper to generate driver code
const generateDriverCode = (userCode, language, testCaseInput) => {
    const signature = getFunctionSignature(userCode, language);

    if (!signature) return userCode;

    const { name, args } = signature;

    const normalizedInput = testCaseInput.replace(/,\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g, '\n$1 =');
    const inputLines = normalizedInput.split('\n').filter(line => line.trim());
    const inputValues = inputLines.map(line => {
        const match = line.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*(.*)/);
        return match ? match[1] : line.trim();
    });

    const argDefinitions = args.map((arg, i) => {
        const val = inputValues[i] || 'undefined';
        return { name: arg, value: val };
    });

    if (language === 'python') {
        const pythonDefs = argDefinitions.map(def => `${def.name} = ${def.value}`).join('\n');
        return `
import sys
import json
from typing import *

${userCode}

# Driver Code
try:
    # Prepare inputs
${pythonDefs.split('\n').map(l => '    ' + l).join('\n')}
    
    # Call solution
    result = ${name}(${args.join(', ')})
    
    # Print result
    if result is not None:
        if isinstance(result, bool):
            print("true" if result else "false")
        elif isinstance(result, str):
            print(result)
        else:
            print(json.dumps(result))                                                                   
        
except Exception as e:
    sys.stderr.write(str(e))
    exit(1)
`;
    } else if (language === 'javascript') {
        const jsDefs = argDefinitions.map(def => `let ${def.name} = ${def.value};`).join('\n');
        return `
${userCode}

// Driver Code
try {
    ${jsDefs}
    
    const result = ${name}(${args.join(', ')});
    
    if (result !== undefined) {
        if (typeof result === 'object' && result !== null) {
            console.log(JSON.stringify(result));
        } else {
            console.log(result);
        }
    }
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
`;
    }
    return userCode;
};

// Helper: Execute with Optimized Polling
const executeWithPolling = async (source_code, language_id, stdin) => {
    try {
        const createRes = await axios.post(
            "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
            {
                source_code,
                language_id,
                stdin
            },
            { headers: { "Content-Type": "application/json" } }
        );

        if (createRes.data.status && createRes.data.status.id > 2) {
            return createRes.data;
        }

        const token = createRes.data.token;
        if (!token) throw new Error("Failed to get submission token from Judge0");

        let attempts = 0;
        const maxAttempts = 60; // 60 seconds max

        while (attempts < maxAttempts) {
            attempts++;
            await new Promise(r => setTimeout(r, 200));

            const getRes = await axios.get(
                `https://ce.judge0.com/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status,compile_output`,
                { headers: { "Content-Type": "application/json" } }
            );

            const statusId = getRes.data.status?.id;

            if (statusId && statusId > 2) {
                return getRes.data;
            }
        }
        throw new Error("Execution timed out (polling limit exceeded)");

    } catch (err) {
        throw new Error(`Judge0 Error: ${err.message}`);
    }
};

module.exports = {
    languageIds,
    normalizeOutput,
    getFunctionSignature,
    generateDriverCode,
    executeWithPolling
};
