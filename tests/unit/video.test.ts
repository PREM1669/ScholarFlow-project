import { parseVideoUrl } from "@/lib/video";

const id = "dQw4w9WgXcQ";

describe("parseVideoUrl", () => {
  it.each([
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtube.com/watch?v=${id}&t=10s`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `  https://youtu.be/${id}  `,
  ])("accepts YouTube URL %s", (url) => {
    expect(parseVideoUrl(url)).toEqual({
      provider: "youtube",
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    });
  });

  it.each([
    "https://vimeo.com/123456789",
    "https://player.vimeo.com/video/123456789",
  ])("accepts Vimeo URL %s", (url) => {
    expect(parseVideoUrl(url)).toEqual({
      provider: "vimeo",
      id: "123456789",
      embedUrl: "https://player.vimeo.com/video/123456789",
    });
  });

  it.each([
    "https://example.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=short",
    "https://vimeo.com/notanumber",
    "https://vimeo.com/channels/staffpicks/123",
    "ftp://youtube.com/watch?v=dQw4w9WgXcQ",
    "javascript:alert(1)",
    "not a url",
    "",
  ])("rejects unsafe or unsupported URL %s", (url) => {
    expect(parseVideoUrl(url)).toBeNull();
  });
});
