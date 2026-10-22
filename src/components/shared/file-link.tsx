import { Paperclip } from "lucide-react";

export function FileLink({
  url,
  name,
}: {
  url: string;
  name: string | null;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-center gap-2 break-all text-sm text-primary underline underline-offset-4"
    >
      <Paperclip className="size-4 shrink-0" aria-hidden="true" />
      {name ?? "Attachment"}
    </a>
  );
}
