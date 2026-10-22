import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CompletionBadge({
  percent,
  isCompleted,
}: {
  percent: number;
  isCompleted: boolean;
}) {
  if (isCompleted) {
    return (
      <Badge className="gap-1 bg-green-600 text-white hover:bg-green-600">
        <Award className="h-3 w-3" /> Completed
      </Badge>
    );
  }
  if (percent === 0) return <Badge variant="outline">Not started</Badge>;
  return <Badge variant="secondary">In progress</Badge>;
}
