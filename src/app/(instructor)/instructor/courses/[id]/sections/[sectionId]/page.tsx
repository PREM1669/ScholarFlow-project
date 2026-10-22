import { SectionEditor } from "@/components/instructor/section-editor";

export default function SectionEditorPage({
  params,
}: {
  params: { id: string; sectionId: string };
}) {
  return <SectionEditor courseId={params.id} sectionId={params.sectionId} />;
}
