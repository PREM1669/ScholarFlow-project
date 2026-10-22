import { Badge } from "@/components/ui/badge";
import type { SubmissionStatus } from "@/types";

export function SubmissionStatusBadge({
  status,
  isLate,
}: {
  status: SubmissionStatus;
  isLate?: boolean;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {status === "graded" ? (
        <Badge className="bg-green-600 text-white hover:bg-green-600">
          Graded
        </Badge>
      ) : status === "submitted" ? (
        <Badge variant="secondary">Submitted</Badge>
      ) : (
        <Badge variant="outline">Not submitted</Badge>
      )}
      {isLate && status !== "not_submitted" && (
        <Badge variant="destructive">Late</Badge>
      )}
    </span>
  );
}
