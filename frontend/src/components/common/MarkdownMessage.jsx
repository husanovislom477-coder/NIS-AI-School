import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { useState } from 'react';

function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900 text-slate-100 text-[11px] font-mono shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/60 text-[10px] text-slate-400">
        <span className="uppercase tracking-wider font-semibold text-blue-400">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <FiCheck size={11} className="text-emerald-400" /> : <FiCopy size={11} />}
          <span>{copied ? 'Nusxalandi' : 'Nusxa olish'}</span>
        </button>
      </div>
      <div className="p-3 overflow-x-auto">
        <pre className="m-0 leading-relaxed font-mono">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
}

export default function MarkdownMessage({ content, isAgent = false }) {
  if (!content) return null;

  return (
    <div className={`prose-sm max-w-none text-xs leading-relaxed ${isAgent ? 'text-slate-800' : 'text-white'}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h3 className="font-bold text-sm mt-2 mb-1 text-slate-900" {...props} />,
          h2: ({ node, ...props }) => <h4 className="font-bold text-xs mt-2 mb-1 text-slate-900" {...props} />,
          h3: ({ node, ...props }) => <h5 className="font-bold text-xs mt-1.5 mb-0.5 text-slate-900" {...props} />,
          p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900 font-display" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-3 border-blue-500 pl-3 my-2 italic text-slate-600 bg-blue-50/40 py-1 rounded-r" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-2 rounded-lg border border-slate-200">
              <table className="w-full text-[11px] text-left border-collapse" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="bg-slate-100 font-semibold px-2.5 py-1.5 border-b border-slate-200 text-slate-700" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-2.5 py-1 border-b border-slate-100 text-slate-600" {...props} />
          ),
          a: ({ node, href, children, ...props }) => {
            const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-blue-600 font-medium underline underline-offset-2 hover:text-blue-800"
                {...props}
              >
                {children}
              </a>
            );
          },
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            if (!inline && (match || codeString.includes('\n'))) {
              return <CodeBlock language={match?.[1] || ''} value={codeString} />;
            }
            return (
              <code
                className={`font-mono text-[11px] px-1 py-0.5 rounded font-medium ${
                  isAgent
                    ? 'bg-slate-100 text-blue-700 border border-slate-200/80'
                    : 'bg-white/20 text-white'
                }`}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
