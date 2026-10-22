export type ParsedVideo = {
  provider: "youtube" | "vimeo";
  id: string;
  embedUrl: string;
};

const YOUTUBE_ID = /^[\w-]{11}$/;

export function parseVideoUrl(input: string): ParsedVideo | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.replace(/^(www|m)\./, "");
  const parts = url.pathname.split("/").filter(Boolean);
  let youtubeId: string | null = null;

  if (host === "youtu.be") {
    youtubeId = parts[0] ?? null;
  } else if (host === "youtube.com") {
    if (url.pathname === "/watch") youtubeId = url.searchParams.get("v");
    else if (parts[0] === "embed" || parts[0] === "shorts") {
      youtubeId = parts[1] ?? null;
    }
  }

  if (youtubeId && YOUTUBE_ID.test(youtubeId)) {
    return {
      provider: "youtube",
      id: youtubeId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
    };
  }

  let vimeoId: string | null = null;
  if (host === "vimeo.com" && /^\d+$/.test(parts[0] ?? "")) {
    vimeoId = parts[0];
  } else if (
    host === "player.vimeo.com" &&
    parts[0] === "video" &&
    /^\d+$/.test(parts[1] ?? "")
  ) {
    vimeoId = parts[1];
  }

  if (vimeoId) {
    return {
      provider: "vimeo",
      id: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
    };
  }

  return null;
}
