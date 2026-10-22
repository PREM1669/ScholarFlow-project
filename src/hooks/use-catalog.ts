"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { CatalogCourseDetail, CatalogPage } from "@/types";

export type CatalogParams = {
  q?: string;
  category?: string;
  price?: string;
  sort?: string;
  page?: number;
};

export function useCatalog(params: CatalogParams) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return useQuery({
    queryKey: ["catalog", params],
    queryFn: () => apiFetch<CatalogPage>(`/api/v1/catalog?${search}`),
    placeholderData: keepPreviousData,
  });
}

export function useCatalogCourse(id: string) {
  return useQuery({
    queryKey: ["catalogCourse", id],
    queryFn: () => apiFetch<CatalogCourseDetail>(`/api/v1/catalog/${id}`),
    enabled: Boolean(id),
  });
}
