"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useEnroll, useUnenroll } from "@/hooks/use-enrollments";

export function EnrollButton({ courseId, price, enrolled }: { courseId: string; price: number; enrolled: boolean }) {
  const router = useRouter();
  const enroll = useEnroll();
  const unenroll = useUnenroll(courseId);
  if (enrolled) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button asChild><Link href={`/student/courses/${courseId}/learn`}>Continue learning</Link></Button>
        <ConfirmDialog
          trigger={<Button variant="outline">Unenroll</Button>}
          title="Unenroll from this course?"
          description="Your progress and quiz attempts for this course will be permanently deleted."
          confirmLabel="Unenroll"
          onConfirm={() => unenroll.mutateAsync()}
        />
      </div>
    );
  }
  return (
    <Button
      disabled={enroll.isPending}
      onClick={() => enroll.mutate(courseId, { onSuccess: () => router.push(`/student/courses/${courseId}/learn`) })}
    >
      {enroll.isPending ? "Enrolling..." : price === 0 ? "Enroll for free" : `Enroll for $${price.toFixed(2)}`}
    </Button>
  );
}
