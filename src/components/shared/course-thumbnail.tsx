import Image from "next/image";
import { cn } from "@/lib/utils";

export function CourseThumbnail({
  src,
  alt,
  className,
  children,
}: {
  src: string | null;
  alt: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden bg-muted",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No thumbnail
        </div>
      )}
      {children}
    </div>
  );
}
