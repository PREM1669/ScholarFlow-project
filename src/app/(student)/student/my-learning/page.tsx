import { MyLearningView } from "@/components/student/my-learning-view";
import { PageHeader } from "@/components/shared/page-header";

export default function MyLearningPage() {
  return (
    <>
      <PageHeader title="My learning" description="Your courses, progress and achievements." />
      <MyLearningView />
    </>
  );
}
