const axios = require("axios");
const Submission = require("../models/Submission");

// Judge0 language IDs
const languageIds = {
    javascript: 63,
    python: 71,
    cpp: 54,
    java: 62
};

// Per-language time limits (seconds)
const timeLimits = {
    python: 2,
    javascript: 2,
    cpp: 1,
    java: 1.5
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

// ─── Java driver helpers ────────────────────────────────────────────────────

// Parse a raw value string into a Java declaration for the given type
const javaParseValue = (type, varName, rawVal) => {
    const t = type.replace(/\s+/g, '');
    const escaped = rawVal.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    if (t === 'int' || t === 'Integer')    return `int ${varName} = ${rawVal};`;
    if (t === 'long' || t === 'Long')      return `long ${varName} = ${rawVal}L;`;
    if (t === 'double' || t === 'Double')  return `double ${varName} = ${rawVal};`;
    if (t === 'boolean' || t === 'Boolean') return `boolean ${varName} = ${rawVal};`;
    if (t === 'String') {
        if (rawVal.startsWith('"') || rawVal.startsWith("'"))
            return `String ${varName} = ${rawVal.replace(/'/g, '"')};`;
        return `String ${varName} = "${rawVal}";`;
    }
    if (t === 'int[]')      return `int[] ${varName} = parseIntArray("${escaped}");`;
    if (t === 'long[]')     return `long[] ${varName} = parseLongArray("${escaped}");`;
    if (t === 'double[]')   return `double[] ${varName} = parseDoubleArray("${escaped}");`;
    if (t === 'String[]')   return `String[] ${varName} = parseStringArray("${escaped}");`;
    if (t === 'int[][]')    return `int[][] ${varName} = parse2DIntArray("${escaped}");`;
    if (t === 'List<Integer>' || t === 'ArrayList<Integer>') return `List<Integer> ${varName} = parseIntList("${escaped}");`;
    if (t === 'List<String>'  || t === 'ArrayList<String>')  return `List<String> ${varName} = parseStringList("${escaped}");`;
    // fallback — will likely cause compile error but at least gives raw value
    return `// unsupported type ${type} for ${varName} (raw: ${rawVal})`;
};

// Generate the System.out.println statement based on return type
const javaFormatPrint = (returnType, callExpr) => {
    const t = returnType.replace(/\s+/g, '');
    if (t === 'void') return `${callExpr};`;
    if (t === 'int[]' || t === 'long[]' || t === 'double[]' || t === 'char[]')
        return `System.out.println(java.util.Arrays.toString(${callExpr}));`;
    if (t === 'int[][]' || t === 'long[][]')
        return `System.out.println(java.util.Arrays.deepToString(${callExpr}));`;
    return `System.out.println(${callExpr});`;
};

// Static helper methods included in every Java Main wrapper
const JAVA_HELPERS = `
    static int[] parseIntArray(String s) {
        s = s.replaceAll("[\\\\[\\\\]\\\\s]", "");
        if (s.isEmpty()) return new int[0];
        String[] p = s.split(",");
        int[] a = new int[p.length];
        for (int i = 0; i < p.length; i++) a[i] = Integer.parseInt(p[i].trim());
        return a;
    }
    static long[] parseLongArray(String s) {
        s = s.replaceAll("[\\\\[\\\\]\\\\s]", "");
        if (s.isEmpty()) return new long[0];
        String[] p = s.split(",");
        long[] a = new long[p.length];
        for (int i = 0; i < p.length; i++) a[i] = Long.parseLong(p[i].trim());
        return a;
    }
    static double[] parseDoubleArray(String s) {
        s = s.replaceAll("[\\\\[\\\\]\\\\s]", "");
        if (s.isEmpty()) return new double[0];
        String[] p = s.split(",");
        double[] a = new double[p.length];
        for (int i = 0; i < p.length; i++) a[i] = Double.parseDouble(p[i].trim());
        return a;
    }
    static String[] parseStringArray(String s) {
        s = s.replaceAll("^\\\\[|\\\\]$", "").trim();
        if (s.isEmpty()) return new String[0];
        return java.util.Arrays.stream(s.split(","))
            .map(x -> x.trim().replaceAll("^\\"|\\"$", "").replaceAll("^'|'$", ""))
            .toArray(String[]::new);
    }
    static int[][] parse2DIntArray(String s) {
        s = s.trim();
        if (s.equals("[]") || s.isEmpty()) return new int[0][];
        s = s.substring(1, s.length() - 1);
        java.util.List<int[]> rows = new java.util.ArrayList<>();
        int depth = 0, start = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '[') { if (depth++ == 0) start = i; }
            else if (s.charAt(i) == ']') { if (--depth == 0) rows.add(parseIntArray(s.substring(start, i + 1))); }
        }
        return rows.toArray(new int[0][]);
    }
    static java.util.List<Integer> parseIntList(String s) {
        int[] a = parseIntArray(s);
        java.util.List<Integer> l = new java.util.ArrayList<>();
        for (int x : a) l.add(x);
        return l;
    }
    static java.util.List<String> parseStringList(String s) {
        String[] a = parseStringArray(s);
        return new java.util.ArrayList<>(java.util.Arrays.asList(a));
    }
`;

// Build the full Java driver wrapping user's class
const buildJavaDriver = (userCode, inputValues) => {
    // Extract public/package-private method: return-type methodName(params)
    // Match the first non-constructor, non-main method
    const methodRe = /(?:public\s+)?(?:static\s+)?([\w\[\]<>,\s]+?)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{/g;
    let methodMatch = null;
    let m;
    while ((m = methodRe.exec(userCode)) !== null) {
        const name = m[2];
        if (name === 'main' || name === userCode.match(/class\s+(\w+)/)?.[1]) continue; // skip constructor & main
        methodMatch = m;
        break;
    }
    if (!methodMatch) return null; // can't auto-wrap; fall back to as-is

    const returnType = methodMatch[1].trim();
    const methodName = methodMatch[2];
    const paramStr   = methodMatch[3];

    // Parse parameter list
    const params = paramStr.split(',').map(p => {
        p = p.trim();
        if (!p) return null;
        const lastSpace = p.lastIndexOf(' ');
        if (lastSpace < 0) return null;
        return { type: p.substring(0, lastSpace).trim(), name: p.substring(lastSpace + 1).trim() };
    }).filter(Boolean);

    // Extract user's class name
    const classNameMatch = userCode.match(/class\s+(\w+)/);
    const userClassName = classNameMatch ? classNameMatch[1] : 'Solution';

    // Generate per-param parsing lines
    const parseLines = params.map((p, i) => javaParseValue(p.type, p.name, inputValues[i] || '""'));

    // Check if method is static
    const isStatic = methodMatch[0].includes('static');
    const callExpr = isStatic
        ? `${userClassName}.${methodName}(${params.map(p => p.name).join(', ')})`
        : `new ${userClassName}().${methodName}(${params.map(p => p.name).join(', ')})`;

    const printLine = javaFormatPrint(returnType, callExpr);

    return `import java.util.*;

${userCode}

class Main {
    public static void main(String[] args) {
        ${parseLines.join('\n        ')}
        ${printLine}
    }
${JAVA_HELPERS}
}`;
};

// Helper to generate driver code
const generateDriverCode = (userCode, language, testCaseInput) => {
    // C++ passes through as-is (template includes main + stdin)
    if (language === 'cpp') return userCode;

    // Java: build a Main wrapper around the user's class
    if (language === 'java') {
        const normalizedInput = testCaseInput.replace(/,\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g, '\n$1 =');
        const inputLines = normalizedInput.split('\n').filter(line => line.trim());
        const inputValues = inputLines.map(line => {
            const match = line.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*(.*)/);
            return match ? match[1] : line.trim();
        });
        return buildJavaDriver(userCode, inputValues) || userCode;
    }

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
const executeWithPolling = async (source_code, language_id, stdin, cpu_time_limit = 2) => {
    try {
        const createRes = await axios.post(
            "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
            {
                source_code,
                language_id,
                stdin,
                cpu_time_limit,
                memory_limit: 262144  // 256 MB in KB
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
                `https://ce.judge0.com/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status,compile_output,time,memory`,
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

// ─── Batch driver helpers ────────────────────────────────────────────────────

/**
 * Generate a Java parse statement that reads from a RUNTIME string variable,
 * rather than embedding a literal value.  Used by the batch driver.
 */
const javaRuntimeParseFromVar = (type, varName, stringVar) => {
    const t = type.replace(/\s+/g, '');
    if (t === 'int'   || t === 'Integer')  return `int ${varName} = Integer.parseInt(${stringVar}.trim());`;
    if (t === 'long'  || t === 'Long')     return `long ${varName} = Long.parseLong(${stringVar}.trim());`;
    if (t === 'double'|| t === 'Double')   return `double ${varName} = Double.parseDouble(${stringVar}.trim());`;
    if (t === 'boolean'||t === 'Boolean')  return `boolean ${varName} = Boolean.parseBoolean(${stringVar}.trim());`;
    if (t === 'String')                    return `String ${varName} = ${stringVar}.trim().replaceAll("^\\"|\\"$", "").replaceAll("^'|'$", "");`;
    if (t === 'int[]')     return `int[] ${varName} = parseIntArray(${stringVar});`;
    if (t === 'long[]')    return `long[] ${varName} = parseLongArray(${stringVar});`;
    if (t === 'double[]')  return `double[] ${varName} = parseDoubleArray(${stringVar});`;
    if (t === 'String[]')  return `String[] ${varName} = parseStringArray(${stringVar});`;
    if (t === 'int[][]')   return `int[][] ${varName} = parse2DIntArray(${stringVar});`;
    if (t === 'List<Integer>' || t === 'ArrayList<Integer>') return `List<Integer> ${varName} = parseIntList(${stringVar});`;
    if (t === 'List<String>'  || t === 'ArrayList<String>')  return `List<String> ${varName} = parseStringList(${stringVar});`;
    return `// unsupported type ${type} for ${varName}`;
};

/** Build a Java batch driver that loops over T test cases read from stdin.
 *  Replaces the per-value-hardcoded buildJavaDriver for submissions. */
const buildBatchDriverJava = (userCode) => {
    const methodRe = /(?:public\s+)?(?:static\s+)?([\w\[\]<>,\s]+?)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{/g;
    let methodMatch = null, m;
    while ((m = methodRe.exec(userCode)) !== null) {
        const name = m[2];
        if (name === 'main' || name === (userCode.match(/class\s+(\w+)/)?.[1])) continue;
        methodMatch = m; break;
    }
    if (!methodMatch) return null;

    const returnType  = methodMatch[1].trim();
    const methodName  = methodMatch[2];
    const paramStr    = methodMatch[3];
    const params = paramStr.split(',').map(p => {
        p = p.trim(); if (!p) return null;
        const i = p.lastIndexOf(' '); if (i < 0) return null;
        return { type: p.substring(0, i).trim(), name: p.substring(i + 1).trim() };
    }).filter(Boolean);

    const classNameMatch = userCode.match(/class\s+(\w+)/);
    const userClassName  = classNameMatch ? classNameMatch[1] : 'Solution';
    const isStatic       = methodMatch[0].includes('static');

    // One readLine + type-parse per param
    const parseLines = params.map((p, i) => {
        const rawVar = `_r${i}`;
        return `String ${rawVar} = _ev(sc.nextLine());\n            ${javaRuntimeParseFromVar(p.type, p.name, rawVar)}`;
    });

    const callExpr  = isStatic
        ? `${userClassName}.${methodName}(${params.map(p => p.name).join(', ')})`
        : `new ${userClassName}().${methodName}(${params.map(p => p.name).join(', ')})`;
    const printLine = javaFormatPrint(returnType, callExpr);

    return `import java.util.*;

${userCode}

class Main {
    static String _ev(String line) {
        int eq = line.indexOf('=');
        return eq >= 0 ? line.substring(eq + 1).trim() : line.trim();
    }
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        int _T = Integer.parseInt(sc.nextLine().trim());
        for (int _t = 0; _t < _T; _t++) {
            ${parseLines.join('\n            ')}
            ${printLine}
        }
    }
${JAVA_HELPERS}
}`;
};

/** Build a JavaScript batch driver wrapping the user function. */
const buildBatchDriverJS = (userCode, signature) => {
    const { name, args } = signature;
    const readArgs = args.map(arg =>
        `const ${arg} = _pv(_lines[_i++]);`
    ).join('\n        ');

    return `${userCode}

// === AUTO-GENERATED BATCH RUNNER ===
(function() {
    const _lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
    let _i = 0;
    const _T = parseInt(_lines[_i++]);
    function _pv(line) {
        const _m = line ? line.match(/^[^=]+=\\s*([\\s\\S]*)$/) : null;
        const _r = (_m ? _m[1] : (line || '')).trim();
        try { return JSON.parse(_r); } catch(e) { return _r; }
    }
    for (let _t = 0; _t < _T; _t++) {
        try {
        ${readArgs}
        const _res = ${name}(${args.join(', ')});
        if (_res !== undefined) {
            if (typeof _res === 'boolean') { console.log(_res ? 'true' : 'false'); }
            else if (typeof _res === 'object' && _res !== null) { console.log(JSON.stringify(_res)); }
            else { console.log(_res); }
        }
        } catch(e) { process.stderr.write(String(e.message || e)); process.exit(1); }
    }
})();`;
};

/** Build a Python batch driver wrapping the user function. */
const buildBatchDriverPython = (userCode, signature) => {
    const { name, args } = signature;
    const readArgs = args.map(arg =>
        `${arg} = _pv(_lines[_i]); _i += 1`
    ).join('\n        ');

    return `import sys
import json
import ast
from typing import *

${userCode}

# === AUTO-GENERATED BATCH RUNNER ===
if __name__ == "__main__":
    _lines = sys.stdin.read().strip().split('\\n')
    _i = 0
    _T = int(_lines[_i]); _i += 1
    def _pv(line):
        _r = (line.split('=', 1)[1] if '=' in line else line).strip()
        try: return ast.literal_eval(_r)
        except: return _r
    for _ in range(_T):
        try:
            ${readArgs}
            _res = ${name}(${args.join(', ')})
            if _res is None: pass
            elif isinstance(_res, bool): print('true' if _res else 'false')
            elif isinstance(_res, str): print(_res)
            else: print(json.dumps(_res))
        except Exception as e: sys.stderr.write(str(e)); sys.exit(1)
`;
};

/**
 * Build a single-execution driver for all hidden test cases.
 * Returns null for C++ (caller falls back to parallel).
 */
const buildBatchDriver = (userCode, language) => {
    if (language === 'javascript') {
        const sig = getFunctionSignature(userCode, 'javascript');
        if (!sig) return null;
        return buildBatchDriverJS(userCode, sig);
    }
    if (language === 'python') {
        const sig = getFunctionSignature(userCode, 'python');
        if (!sig) return null;
        return buildBatchDriverPython(userCode, sig);
    }
    if (language === 'java') {
        return buildBatchDriverJava(userCode); // null if signature not found
    }
    return null; // C++ — caller uses parallel
};

/**
 * Build combined stdin:  T\n  tc1_line1\n tc1_line2\n ... tcN_lineM\n
 * Each test case's key=value lines become the stdin consumed by the batch driver.
 */
const buildBatchCombinedStdin = (hiddenCases) => {
    const blocks = hiddenCases.map(tc => tc.input.trim()).join('\n');
    return `${hiddenCases.length}\n${blocks}\n`;
};

module.exports = {
    languageIds,
    timeLimits,
    normalizeOutput,
    getFunctionSignature,
    generateDriverCode,
    buildJavaDriver,
    executeWithPolling,
    buildBatchDriver,
    buildBatchCombinedStdin,
};
