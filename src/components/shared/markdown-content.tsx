import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownContent({ children }: { children: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => {
            void node;
            return (
              <a {...props} target="_blank" rel="noopener noreferrer" />
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
