import { Badge } from "@/components/ui/badge";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/use-course-chat";

export function ChatBubble({
  message,
  pending,
}: {
  message: ChatMessage;
  pending: boolean;
}) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-4 py-3 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : message.content ? (
          <MarkdownContent>{message.content}</MarkdownContent>
        ) : pending ? (
          <span className="text-muted-foreground">Thinking...</span>
        ) : null}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1 border-t pt-2">
            <span className="text-xs text-muted-foreground">Based on:</span>
            {message.sources.map((source) => (
              <Badge key={source} variant="outline" className="text-xs">
                {source}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
