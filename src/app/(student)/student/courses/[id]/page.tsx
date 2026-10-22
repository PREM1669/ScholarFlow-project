import { CourseDetailView } from "@/components/student/course-detail-view";

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return <CourseDetailView courseId={params.id} />;
}
