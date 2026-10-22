import { Badge } from "@/components/ui/badge";

export function DueDate({
  dueDate,
  showPast = true,
}: {
  dueDate: string;
  showPast?: boolean;
}) {
  const past = new Date(dueDate).getTime() < Date.now();
  return (
    <span className="inline-flex flex-wrap items-center gap-2 text-sm text-slate-500">
      Due{" "}
      {new Date(dueDate).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })}
      {past && showPast && <Badge variant="destructive">Past due</Badge>}
    </span>
  );
}
