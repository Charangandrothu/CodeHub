import React, { useEffect } from 'react';
import Editor, { useMonaco } from "@monaco-editor/react";

const CodeEditor = ({ language, code, setCode }) => {
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('codehub-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#1e1e1e', // Requested color
          'minimap.background': '#1e1e1e',
          'editorGutter.background': '#1e1e1e',
          'editor.lineHighlightBackground': '#ffffff0a',
        }
      });
      monaco.editor.setTheme('codehub-dark');
    }
  }, [monaco]);

  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      theme="codehub-dark"
      onChange={(value) => setCode(value)}
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontLigatures: true,
        minimap: { enabled: true },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: "on",
        tabSize: 2,
        padding: { top: 16, bottom: 16 },
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        renderLineHighlight: "all",
      }}
    />
  );
};

export default CodeEditor;
