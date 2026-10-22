import { Progress } from "@/components/ui/progress";

export function CourseProgress({
  percent,
  completed,
  total,
}: {
  percent: number;
  completed: number;
  total: number;
}) {
  return (
    <div className="space-y-1">
      <Progress value={percent} aria-label={`${percent}% complete`} />
      <p className="text-xs text-muted-foreground">
        {completed} of {total} sections · {percent}%
      </p>
    </div>
  );
}
