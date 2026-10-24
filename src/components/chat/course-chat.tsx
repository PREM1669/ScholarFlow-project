"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { SendHorizontal, Square, Trash2 } from "lucide-react";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCourseChat } from "@/hooks/use-course-chat";

type Props = {
  courseId: string;
  courseTitle: string;
  suggestions: string[];
};

export function CourseChat({ courseId, courseTitle, suggestions }: Props) {
  const { messages, isStreaming, error, send, stop, reset } =
    useCourseChat(courseId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  useEffect(() => {
    const element = scrollRef.current;
    if (element && stickToBottom.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  function handleScroll() {
    const element = scrollRef.current;
    if (element) {
      stickToBottom.current =
        element.scrollHeight - element.scrollTop - element.clientHeight < 80;
    }
  }

  async function submit(text: string) {
    const question = text.trim();
    if (!question || isStreaming) return;
    setInput("");
    stickToBottom.current = true;
    const handled = await send(question);
    if (!handled) setInput((current) => current || question);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(input);
  }

  return (
    <div className="flex h-[70vh] min-h-[420px] w-full min-w-0 max-w-3xl flex-col rounded-xl border bg-white">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-busy={isStreaming}
        aria-label="Course assistant conversation"
        className="flex-1 space-y-4 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <div className="space-y-4 py-8 text-center">
            <p className="font-medium">Ask me anything about {courseTitle}</p>
            <p className="text-sm text-muted-foreground">
              I answer from this course&apos;s notes only.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void submit(suggestion)}
                  disabled={isStreaming}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              message={message}
              pending={isStreaming && index === messages.length - 1}
            />
          ))
        )}
      </div>

      {error && (
        <p role="alert" className="border-t px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <form className="flex items-end gap-2 border-t p-3" onSubmit={onSubmit}>
        <Textarea
          rows={2}
          maxLength={2000}
          className="min-h-0 resize-none text-base sm:text-sm"
          placeholder="Ask a question about this course..."
          aria-label="Your question"
          value={input}
          onChange={(event) => setInput(event.currentTarget.value)}
          disabled={isStreaming}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              void submit(input);
            }
          }}
        />
        {isStreaming ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Stop generating"
            onClick={stop}
          >
            <Square className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            aria-label="Send question"
            disabled={!input.trim()}
          >
            <SendHorizontal className="size-4" aria-hidden="true" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Clear chat"
          disabled={messages.length === 0}
          onClick={reset}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </form>

      <p className="border-t px-4 py-2 text-xs text-muted-foreground">
        Answers come from this course&apos;s notes and can contain mistakes.
        Check important details with your instructor.
      </p>
    </div>
  );
}
