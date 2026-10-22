"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { CatalogCard } from "@/components/student/catalog-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCatalog } from "@/hooks/use-catalog";
import { useDebounce } from "@/hooks/use-debounce";
import { COURSE_CATEGORIES } from "@/lib/constants";

const ALL_CATEGORY = "All categories";
const ALL_PRICE = "Any price";
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "title", label: "Title (A to Z)" },
] as const;

export function CatalogView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? ALL_CATEGORY;
  const price = params.get("price") ?? ALL_PRICE;
  const sort = params.get("sort") ?? "newest";
  const sortLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label ?? SORT_OPTIONS[0].label;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [search, setSearch] = useState(q);
  const debounced = useDebounce(search, 400);

  function setParams(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "" || value === ALL_CATEGORY || value === ALL_PRICE) next.delete(key);
      else next.set(key, value);
    }
    if (!("page" in changes)) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  useEffect(() => {
    if (debounced.trim() !== q) setParams({ q: debounced.trim() });
    // URL query state is the source of truth for shareable catalog filters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => setSearch(q), [q]);

  const { data, isLoading, isFetching, error } = useCatalog({
    q: q || undefined,
    category: category === ALL_CATEGORY ? undefined : category,
    price: price === ALL_PRICE ? undefined : price,
    sort,
    page,
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          className="sm:col-span-2 lg:col-span-1"
          placeholder="Search courses..."
          aria-label="Search courses"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select value={category} onValueChange={(value) => setParams({ category: value })}>
          <SelectTrigger aria-label="Category"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORY}>All categories</SelectItem>
            {COURSE_CATEGORIES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={price} onValueChange={(value) => setParams({ price: value })}>
          <SelectTrigger aria-label="Price"><SelectValue placeholder="Price" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PRICE}>Any price</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortLabel} onValueChange={(label) => setParams({ sort: SORT_OPTIONS.find((option) => option.label === label)?.value ?? "newest" })}>
          <SelectTrigger aria-label="Sort by"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => <SelectItem key={option.value} value={option.label}>{option.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => <Skeleton key={item} className="h-96" />)}
        </div>
      )}
      {error && <p role="alert" className="text-destructive">{error.message}</p>}
      {data && (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {data.total} course{data.total === 1 ? "" : "s"} found
          </p>
          {data.items.length === 0 ? (
            <EmptyState
              title="No courses match"
              description="Try a different search or clear some filters."
              action={<Button variant="outline" onClick={() => { setSearch(""); router.replace(pathname); }}>Clear filters</Button>}
            />
          ) : (
            <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
              {data.items.map((course) => <CatalogCard key={course.id} course={course} />)}
            </div>
          )}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" disabled={page <= 1} onClick={() => setParams({ page: String(page - 1) })}>Previous</Button>
              <span className="text-sm">Page {data.page} of {data.totalPages}</span>
              <Button variant="outline" disabled={page >= data.totalPages} onClick={() => setParams({ page: String(page + 1) })}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
