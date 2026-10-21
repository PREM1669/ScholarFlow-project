import { BookOpen } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
        <BookOpen className="size-5" />
      </span>
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
