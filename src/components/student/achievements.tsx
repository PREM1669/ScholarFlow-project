import {
  Footprints,
  GraduationCap,
  Rocket,
  Target,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Achievement, BadgeKey } from "@/types";

const ICONS: Record<BadgeKey, LucideIcon> = {
  "first-steps": Footprints,
  "getting-started": Rocket,
  "quiz-ace": Target,
  graduate: GraduationCap,
};

export function Achievements({ items }: { items: Achievement[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((achievement) => {
        const Icon = ICONS[achievement.key];
        return (
          <div
            key={achievement.key}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3",
              !achievement.earned && "opacity-50",
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                achievement.earned
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {achievement.label}{" "}
                <span className="sr-only">
                  {achievement.earned ? "(earned)" : "(locked)"}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {achievement.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
