export function progressSummary(completed: number, total: number) {
  return {
    completedSections: completed,
    totalSections: total,
    percent: total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100)),
    isCompleted: total > 0 && completed >= total,
  };
}
