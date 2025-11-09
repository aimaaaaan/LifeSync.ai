import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function MarkdownRenderer({ children }: { children: string }) {
  return (
    <div className="prose prose-gray max-w-none">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
