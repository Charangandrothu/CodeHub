import Editor from "@monaco-editor/react";

const CodeEditor = ({ language, code, setCode }) => {
  return (
    <Editor
      height="60vh"
      language={language}
      value={code}
      theme="vs-dark"
      onChange={(value) => setCode(value)}
      options={{
        fontSize: 14,
        minimap: { enabled: true },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: "on",
        tabSize: 2,
      }}
    />
  );
};

export default CodeEditor;
