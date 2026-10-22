import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CertificateButton({ courseId }: { courseId: string }) {
  return (
    <Button asChild variant="outline">
      <a href={`/api/v1/enrollments/${courseId}/certificate`}>
        <Award className="mr-1 h-4 w-4" /> Certificate
      </a>
    </Button>
  );
}
