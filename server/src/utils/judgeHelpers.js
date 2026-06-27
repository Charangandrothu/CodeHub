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
    return str.replace(/\r\n/g, "\n")
        .split('\n')
        .map(line => line.replace(/\s+$/, '').replace(/,\s+/g, ','))
        .join('\n')
        .replace(/\n+$/, '')
        .replace(/,\s+/g, ',');
};

const getBraceMatchedSubstring = (str, startBraceIndex) => {
    let depth = 0;
    for (let i = startBraceIndex; i < str.length; i++) {
        if (str[i] === '{') depth++;
        else if (str[i] === '}') {
            depth--;
            if (depth === 0) {
                return str.substring(startBraceIndex + 1, i);
            }
        }
    }
    return "";
};

const getPythonBody = (code, startIndex) => {
    const lines = code.substring(startIndex).split('\n');
    if (lines.length === 0) return "";
    let firstLineIdx = 0;
    while (firstLineIdx < lines.length && !lines[firstLineIdx].trim()) {
        firstLineIdx++;
    }
    if (firstLineIdx >= lines.length) return "";
    const matchIndent = lines[firstLineIdx].match(/^\s+/);
    const baseIndent = matchIndent ? matchIndent[0].length : 0;
    if (baseIndent === 0) return "";
    
    const bodyLines = [];
    for (let i = firstLineIdx; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) {
            bodyLines.push(line);
            continue;
        }
        const curIndentMatch = line.match(/^\s+/);
        const curIndent = curIndentMatch ? curIndentMatch[0].length : 0;
        if (curIndent < baseIndent) {
            break;
        }
        bodyLines.push(line);
    }
    return bodyLines.join('\n');
};

const extractJavaFunction = (userCode) => {
    const methodRe = /(?:public\s+|protected\s+|private\s+|static\s+|final\s+)*([\w\[\]<>,\s]+?)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{/g;
    const classNameMatch = userCode.match(/class\s+(\w+)/);
    const userClassName = classNameMatch ? classNameMatch[1] : 'Solution';
    let m;
    const methods = [];
    while ((m = methodRe.exec(userCode)) !== null) {
        const name = m[2];
        if (name === 'main' || name === userClassName) continue; // skip constructor & main
        methods.push({
            returnType: m[1].trim(),
            name: m[2],
            paramStr: m[3],
            index: m.index,
            fullMatch: m[0]
        });
    }
    if (methods.length === 0) return null;
    const solveMethod = methods.find(m => m.name === 'solve');
    if (solveMethod) return solveMethod;
    
    const nonHelpers = methods.filter(m => {
        return !methods.some(other => {
            if (other.name === m.name) return false;
            const openBrace = userCode.indexOf('{', other.index);
            if (openBrace === -1) return false;
            const body = getBraceMatchedSubstring(userCode, openBrace);
            return body.includes(m.name);
        });
    });
    if (nonHelpers.length > 0) return nonHelpers[0];
    return methods[0];
};

const extractCppFunction = (userCode) => {
    const methodRe = /(?:inline\s+|static\s+|virtual\s+|constexpr\s+)*([\w<>\s:&*]+)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{/g;
    let m;
    const methods = [];
    while ((m = methodRe.exec(userCode)) !== null) {
        if (m[2] === 'main') continue;
        methods.push({
            returnType: m[1].trim(),
            name: m[2],
            paramStr: m[3],
            index: m.index
        });
    }
    if (methods.length === 0) return null;
    const solveMethod = methods.find(m => m.name === 'solve');
    if (solveMethod) return solveMethod;
    
    const nonHelpers = methods.filter(m => {
        return !methods.some(other => {
            if (other.name === m.name) return false;
            const openBrace = userCode.indexOf('{', other.index);
            if (openBrace === -1) return false;
            const body = getBraceMatchedSubstring(userCode, openBrace);
            return body.includes(m.name);
        });
    });
    if (nonHelpers.length > 0) return nonHelpers[0];
    return methods[0];
};

// Helper to extract signature
const getFunctionSignature = (code, language) => {
    if (language === 'python') {
        const regex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)[^:]*:/g;
        let match;
        const funcs = [];
        while ((match = regex.exec(code)) !== null) {
            const name = match[1];
            const rawArgs = match[2].split(',').map(arg => arg.trim()).filter(a => a);
            const cleanArgs = rawArgs.map(arg => arg.split('=')[0].split(':')[0].trim());
            funcs.push({ name, args: cleanArgs, index: match.index });
        }
        if (funcs.length === 0) return null;
        const solveFunc = funcs.find(f => f.name === 'solve');
        if (solveFunc) return solveFunc;
        
        const nonHelpers = funcs.filter(f => {
            return !funcs.some(other => {
                if (other.name === f.name) return false;
                const body = getPythonBody(code, other.index);
                return body.includes(f.name);
            });
        });
        if (nonHelpers.length > 0) return nonHelpers[0];
        return funcs[0];
    } else if (language === 'javascript') {
        const funcs = [];
        const funcRegex = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/g;
        let match;
        while ((match = funcRegex.exec(code)) !== null) {
            funcs.push({ name: match[1], args: match[2].split(',').map(arg => arg.trim()).filter(a => a), index: match.index });
        }
        const arrowRegex = /(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\(?([^)=]*)\)?\s*=>/g;
        while ((match = arrowRegex.exec(code)) !== null) {
            funcs.push({ name: match[1], args: match[2].split(',').map(arg => arg.trim()).filter(a => a), index: match.index });
        }
        if (funcs.length === 0) return null;
        const solveFunc = funcs.find(f => f.name === 'solve');
        if (solveFunc) return solveFunc;
        
        const nonHelpers = funcs.filter(f => {
            return !funcs.some(other => {
                if (other.name === f.name) return false;
                const openBrace = code.indexOf('{', other.index);
                if (openBrace === -1) return false;
                const body = getBraceMatchedSubstring(code, openBrace);
                return body.includes(f.name);
            });
        });
        if (nonHelpers.length > 0) return nonHelpers[0];
        return funcs[0];
    }
    return null;
};

// ─── Java driver helpers ────────────────────────────────────────────────────

// Parse a raw value string into a Java declaration for the given type
const javaParseValue = (type, varName, rawVal) => {
    const t = type.replace(/\s+/g, '');
    const escaped = rawVal.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    if (t === 'int' || t === 'Integer') return `int ${varName} = ${rawVal};`;
    if (t === 'long' || t === 'Long') return `long ${varName} = ${rawVal}L;`;
    if (t === 'double' || t === 'Double') return `double ${varName} = ${rawVal};`;
    if (t === 'boolean' || t === 'Boolean') return `boolean ${varName} = ${rawVal};`;
    if (t === 'String') {
        if (rawVal.startsWith('"') || rawVal.startsWith("'"))
            return `String ${varName} = ${rawVal.replace(/'/g, '"')};`;
        return `String ${varName} = "${rawVal}";`;
    }
    if (t === 'int[]') return `int[] ${varName} = parseIntArray("${escaped}");`;
    if (t === 'long[]') return `long[] ${varName} = parseLongArray("${escaped}");`;
    if (t === 'double[]') return `double[] ${varName} = parseDoubleArray("${escaped}");`;
    if (t === 'String[]') return `String[] ${varName} = parseStringArray("${escaped}");`;
    if (t === 'int[][]') return `int[][] ${varName} = parse2DIntArray("${escaped}");`;
    if (t === 'List<Integer>' || t === 'ArrayList<Integer>') return `List<Integer> ${varName} = parseIntList("${escaped}");`;
    if (t === 'List<String>' || t === 'ArrayList<String>') return `List<String> ${varName} = parseStringList("${escaped}");`;
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
    const methodMatch = extractJavaFunction(userCode);
    if (!methodMatch) return null; // can't auto-wrap; fall back to as-is

    const returnType = methodMatch.returnType.replace(/\b(public|protected|private|static|final)\b/g, '').trim();
    const methodName = methodMatch.name;
    const paramStr = methodMatch.paramStr;

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
    const isStatic = methodMatch.fullMatch.includes('static');
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
        const b64SourceCode = Buffer.from(source_code || "").toString('base64');
        const b64Stdin = Buffer.from(stdin || "").toString('base64');

        const createRes = await axios.post(
            "https://ce.judge0.com/submissions?base64_encoded=true&wait=true",
            {
                source_code: b64SourceCode,
                language_id,
                stdin: b64Stdin,
                cpu_time_limit,
                memory_limit: 262144  // 256 MB in KB
            },
            { headers: { "Content-Type": "application/json" } }
        );

        const decodeResponse = (data) => {
            if (!data) return data;
            const decoded = { ...data };
            if (decoded.stdout) decoded.stdout = Buffer.from(decoded.stdout, 'base64').toString('utf8');
            if (decoded.stderr) decoded.stderr = Buffer.from(decoded.stderr, 'base64').toString('utf8');
            if (decoded.compile_output) decoded.compile_output = Buffer.from(decoded.compile_output, 'base64').toString('utf8');
            return decoded;
        };

        if (createRes.data.status && createRes.data.status.id > 2) {
            return decodeResponse(createRes.data);
        }

        const token = createRes.data.token;
        if (!token) throw new Error("Failed to get submission token from Judge0");

        let attempts = 0;
        const maxAttempts = 60; // 60 seconds max

        while (attempts < maxAttempts) {
            attempts++;
            await new Promise(r => setTimeout(r, 200));

            const getRes = await axios.get(
                `https://ce.judge0.com/submissions/${token}?base64_encoded=true&fields=stdout,stderr,status,compile_output,time,memory`,
                { headers: { "Content-Type": "application/json" } }
            );

            const statusId = getRes.data.status?.id;

            if (statusId && statusId > 2) {
                return decodeResponse(getRes.data);
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
    if (t === 'int' || t === 'Integer') return `int ${varName} = Integer.parseInt(${stringVar}.trim());`;
    if (t === 'long' || t === 'Long') return `long ${varName} = Long.parseLong(${stringVar}.trim());`;
    if (t === 'double' || t === 'Double') return `double ${varName} = Double.parseDouble(${stringVar}.trim());`;
    if (t === 'boolean' || t === 'Boolean') return `boolean ${varName} = Boolean.parseBoolean(${stringVar}.trim());`;
    if (t === 'String') return `String ${varName} = ${stringVar}.trim().replaceAll("^\\"|\\"$", "").replaceAll("^'|'$", "");`;
    if (t === 'int[]') return `int[] ${varName} = parseIntArray(${stringVar});`;
    if (t === 'long[]') return `long[] ${varName} = parseLongArray(${stringVar});`;
    if (t === 'double[]') return `double[] ${varName} = parseDoubleArray(${stringVar});`;
    if (t === 'String[]') return `String[] ${varName} = parseStringArray(${stringVar});`;
    if (t === 'int[][]') return `int[][] ${varName} = parse2DIntArray(${stringVar});`;
    if (t === 'List<Integer>' || t === 'ArrayList<Integer>') return `List<Integer> ${varName} = parseIntList(${stringVar});`;
    if (t === 'List<String>' || t === 'ArrayList<String>') return `List<String> ${varName} = parseStringList(${stringVar});`;
    return `// unsupported type ${type} for ${varName}`;
};

/** Build a Java batch driver that loops over T test cases read from stdin.
 *  Replaces the per-value-hardcoded buildJavaDriver for submissions. */
const buildBatchDriverJava = (userCode) => {
    const methodMatch = extractJavaFunction(userCode);
    if (!methodMatch) return null;

    const returnType = methodMatch.returnType.replace(/\b(public|protected|private|static|final)\b/g, '').trim();
    const methodName = methodMatch.name;
    const paramStr = methodMatch.paramStr;
    const params = paramStr.split(',').map(p => {
        p = p.trim(); if (!p) return null;
        const i = p.lastIndexOf(' '); if (i < 0) return null;
        return { type: p.substring(0, i).trim(), name: p.substring(i + 1).trim() };
    }).filter(Boolean);

    const classNameMatch = userCode.match(/class\s+(\w+)/);
    const userClassName = classNameMatch ? classNameMatch[1] : 'Solution';
    const isStatic = methodMatch.fullMatch.includes('static');

    // One readLine + type-parse per param
    const parseLines = params.map((p, i) => {
        const rawVar = `_r${i}`;
        return `String ${rawVar} = _ev(sc.nextLine());\n            ${javaRuntimeParseFromVar(p.type, p.name, rawVar)}`;
    });

    const callExpr = isStatic
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
            System.out.println("~---~");
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
        console.log('~---~');
        } catch(e) { process.stderr.write(String(e.message || e)); process.exit(1); }
    }
})();`;
};

/** Build a Python batch driver wrapping the user function. */
const buildBatchDriverPython = (userCode, signature) => {
    const { name, args } = signature;
    const readArgs = args.map(arg =>
        `${arg} = _pv(_lines[_i])\n            _i += 1`
    ).join('\n            ');

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
            print('~---~')
        except Exception as e: sys.stderr.write(str(e)); sys.exit(1)
`;
};

/** Build a C++ batch driver wrapping the user function. */
const cppRuntimeParseFromVar = (type, varName, stringVar) => {
    const t = type.replace(/\s+/g, '').replace(/&$/, '');
    if (t === 'int') return `int ${varName} = stoi(${stringVar});`;
    if (t === 'long' || t === 'longlong') return `long long ${varName} = stoll(${stringVar});`;
    if (t === 'double') return `double ${varName} = stod(${stringVar});`;
    if (t === 'float') return `float ${varName} = stof(${stringVar});`;
    if (t === 'bool') return `bool ${varName} = (${stringVar}=="true"||${stringVar}=="1");`;
    if (t === 'string' || t === 'String') return `string ${varName} = ${stringVar};`;
    if (t === 'vector<int>') return `vector<int> ${varName} = _pvi(${stringVar});`;
    if (t === 'vector<long>' || t === 'vector<longlong>') return `vector<long long> ${varName} = _pvl(${stringVar});`;
    if (t === 'vector<string>') return `vector<string> ${varName} = _pvs(${stringVar});`;
    if (t === 'vector<vector<int>>') return `vector<vector<int>> ${varName} = _pvvi(${stringVar});`;
    return `// unsupported c++ type ${type} for ${varName}`;
};

const cppFormatPrint = (returnType, callExpr) => {
    const t = returnType.replace(/\s+/g, '').replace(/&$/, '');
    if (t === 'void') return `${callExpr};`;
    if (t === 'vector<int>' || t === 'vector<longlong>' || t === 'vector<long>')
        return `auto _res = ${callExpr}; cout << "["; for(size_t i=0;i<_res.size();i++) { cout << _res[i] << (i+1==_res.size()?"":","); } cout << "]";`;
    if (t === 'vector<vector<int>>' || t === 'vector<vector<longlong>>' || t === 'vector<vector<long>>')
        return `auto _res = ${callExpr}; cout << "["; for(size_t i=0;i<_res.size();i++) { cout << "["; for(size_t j=0;j<_res[i].size();j++) { cout << _res[i][j] << (j+1==_res[i].size()?"":","); } cout << "]" << (i+1==_res.size()?"":","); } cout << "]";`;
    if (t === 'bool')
        return `cout << (${callExpr} ? "true" : "false");`;
    return `cout << ${callExpr};`;
};

const buildBatchDriverCpp = (userCode) => {
    const methodMatch = extractCppFunction(userCode);
    if (!methodMatch) return null;

    const returnType = methodMatch.returnType;
    const methodName = methodMatch.name;
    const paramStr = methodMatch.paramStr;
    const params = paramStr.split(',').map(p => {
        p = p.trim(); if (!p) return null;
        let lastSpace = p.lastIndexOf(' '); if (lastSpace < 0) return null;
        return { type: p.substring(0, lastSpace).trim(), name: p.substring(lastSpace + 1).trim().replace(/^&|\*|&$/g, '') };
    }).filter(Boolean);

    const parseLines = params.map((p, i) => {
        const rawVar = `_r${i}`;
        return `string ${rawVar}; getline(cin, ${rawVar}); ${rawVar} = _ev(${rawVar});\n        ${cppRuntimeParseFromVar(p.type, p.name, rawVar)}`;
    });

    const callExpr = `${methodName}(${params.map(p => p.name).join(', ')})`;
    const printLine = cppFormatPrint(returnType, callExpr);

    return `// === AUTO-GENERATED BATCH RUNNER ===
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <climits>
#include <queue>
#include <stack>
#include <map>
#include <unordered_map>
#include <set>
#include <unordered_set>
#include <cmath>
#include <numeric>

using namespace std;

${userCode}

string _tr(string s) {
    size_t start = s.find_first_not_of(" \\t\\r\\n");
    if (start == string::npos) return "";
    size_t end = s.find_last_not_of(" \\t\\r\\n");
    return s.substr(start, end - start + 1);
}
string _ev(string line) {
    size_t eq = line.find('=');
    return eq != string::npos ? _tr(line.substr(eq + 1)) : _tr(line);
}
vector<int> _pvi(string s) {
    vector<int> res; s = _tr(s);
    if(s.empty() || s=="[]") return res;
    s.erase(remove(s.begin(), s.end(), '['), s.end());
    s.erase(remove(s.begin(), s.end(), ']'), s.end());
    s.erase(remove(s.begin(), s.end(), ' '), s.end());
    stringstream ss(s); string item;
    while(getline(ss, item, ',')) { if(item.empty()) continue; res.push_back(stoi(item)); }
    return res;
}
vector<long long> _pvl(string s) {
    vector<long long> res; s = _tr(s);
    if(s.empty() || s=="[]") return res;
    s.erase(remove(s.begin(), s.end(), '['), s.end());
    s.erase(remove(s.begin(), s.end(), ']'), s.end());
    s.erase(remove(s.begin(), s.end(), ' '), s.end());
    stringstream ss(s); string item;
    while(getline(ss, item, ',')) res.push_back(stoll(item));
    return res;
}
vector<string> _pvs(string s) {
    vector<string> res; s = _tr(s);
    if(s.empty() || s=="[]") return res;
    s = s.substr(1, s.length()-2);
    stringstream ss(s); string item;
    while(getline(ss, item, ',')) {
        item = _tr(item);
        if(item.front()=='"' || item.front()=='\\\'') item = item.substr(1, item.length()-2);
        res.push_back(item);
    }
    return res;
}
vector<vector<int>> _pvvi(string s) {
    vector<vector<int>> res; s = _tr(s);
    if(s.empty() || s=="[]" || s=="[[]]") return res;
    if (s.front() == '[' && s.back() == ']') {
        s = s.substr(1, s.length() - 2);
    }
    size_t i = 0;
    while(i < s.length()) {
        if(s[i] == '[') {
            size_t start = i;
            int depth = 1;
            i++;
            while(i < s.length() && depth > 0) {
                if(s[i] == '[') depth++;
                else if(s[i] == ']') depth--;
                i++;
            }
            if(depth == 0) {
                res.push_back(_pvi(s.substr(start, i - start)));
            }
        } else {
            i++;
        }
    }
    return res;
}

#ifndef NO_MAIN
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string t_str;
    if(!getline(cin, t_str)) return 0;
    int _T = stoi(_tr(t_str));
    for (int _t = 0; _t < _T; _t++) {
        ${parseLines.join('\n        ')}
        ${printLine}
        cout << "\\n~---~\\n";
    }
    return 0;
}
#endif
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
    if (language === 'cpp') {
        return buildBatchDriverCpp(userCode);
    }
    return null; // caller uses parallel fallback if needed
};

/**
 * Build combined stdin:  T\n  tc1_line1\n tc1_line2\n ... tcN_lineM\n
 * Each test case's key=value lines become the stdin consumed by the batch driver.
 */
const buildBatchCombinedStdin = (hiddenCases) => {
    const blocks = hiddenCases.map(tc => tc.input.trim()).join('\n');
    return `${hiddenCases.length} \n${blocks} \n`;
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
