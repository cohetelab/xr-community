import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 사용자 입력 마크다운을 안전하게 렌더 (react-markdown은 기본적으로 raw HTML 미허용)
export default function MarkdownContent({ children }: { children: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer nofollow" />,
          // eslint-disable-next-line @next/next/no-img-element
          img: ({ node, ...props }) => <img {...props} alt={props.alt || ""} loading="lazy" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
