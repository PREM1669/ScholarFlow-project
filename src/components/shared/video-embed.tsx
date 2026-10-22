import { parseVideoUrl } from "@/lib/video";

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const video = parseVideoUrl(url);
  if (!video) return null;

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border bg-black">
      <iframe
        src={video.embedUrl}
        title={title}
        className="h-full w-full"
        loading="lazy"
        allow="accelerometer; encrypted-media; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
