import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface MarkdownPreviewProps {
  content: string;
  theme?: 'light' | 'dark';
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  theme = 'dark',
}) => {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderedContent = useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl font-bold mt-8 mb-4 text-zinc-900 dark:text-white" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl font-bold mt-6 mb-3 text-zinc-900 dark:text-white" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl font-bold mt-5 mb-2 text-zinc-900 dark:text-white" {...props} />
          ),

          // Paragraphs and text
          p: ({ node, ...props }) => (
            <p className="mb-4 text-zinc-700 dark:text-zinc-300 leading-relaxed" {...props} />
          ),

          // Code blocks
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'plaintext';
            const code = String(children).replace(/\n$/, '');

            if (inline) {
              return (
                <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-sm font-mono text-red-600 dark:text-red-400">
                  {code}
                </code>
              );
            }

            return (
              <div className="relative group mb-4">
                <div className="bg-zinc-900 dark:bg-black rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 dark:bg-zinc-950 border-b border-zinc-700">
                    <span className="text-xs font-mono text-zinc-400">{language}</span>
                    <button
                      onClick={() => copyCode(code)}
                      className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
                    >
                      {copiedCode === code ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} className="text-zinc-400" />
                      )}
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto">
                    <code className="text-zinc-100 text-sm font-mono">{code}</code>
                  </pre>
                </div>
              </div>
            );
          },

          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 text-zinc-700 dark:text-zinc-300 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 text-zinc-700 dark:text-zinc-300 space-y-2" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-2" {...props} />
          ),

          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 text-zinc-600 dark:text-zinc-400 italic" {...props} />
          ),

          // Links
          a: ({ node, href, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              {...props}
            >
              {props.children}
              <ExternalLink size={12} className="opacity-60" />
            </a>
          ),

          // Horizontal rule
          hr: () => <hr className="my-6 border-zinc-200 dark:border-zinc-800" />,

          // Tables
          table: ({ node, ...props }) => (
            <table className="w-full mb-4 border-collapse border border-zinc-300 dark:border-zinc-700" {...props} />
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-zinc-100 dark:bg-zinc-800" {...props} />
          ),
          tbody: ({ node, ...props }) => <tbody {...props} />,
          tr: ({ node, ...props }) => <tr className="border-b border-zinc-300 dark:border-zinc-700" {...props} />,
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 text-left text-zinc-900 dark:text-zinc-100 font-semibold" {...props} />
          ),

          // Emphasis
          em: ({ node, ...props }) => (
            <em className="italic text-zinc-700 dark:text-zinc-300" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-zinc-900 dark:text-white" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    ),
    [content, copiedCode]
  );

  return (
    <div
      className={`h-full flex flex-col bg-white dark:bg-zinc-950 ${theme === 'dark' ? 'dark' : ''}`}
    >
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">MARKDOWN PREVIEW</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="prose dark:prose-invert max-w-none">
          {content ? (
            renderedContent
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-500 dark:text-zinc-400">No content to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
