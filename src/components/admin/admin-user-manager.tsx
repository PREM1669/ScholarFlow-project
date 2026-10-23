"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AdminUser, AdminUsersPage, Role } from "@/types";

type RoleFilter = Role | "ALL";
type StatusFilter = "ALL" | "ACTIVE" | "SUSPENDED";

export function AdminUserManager({ currentUserId }: { currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<AdminUsersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search.trim()) params.set("q", search.trim());
      if (role !== "ALL") params.set("role", role);
      if (status !== "ALL") params.set("status", status);
      const response = await fetch(`/api/v1/admin/users?${params.toString()}`);
      const payload = (await response.json()) as
        | AdminUsersPage
        | { error?: string };
      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Unable to load users");
      }
      setResult(payload as AdminUsersPage);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load users",
      );
    } finally {
      setLoading(false);
    }
  }, [page, role, search, status]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function toggleStatus(user: AdminUser) {
    setUpdatingId(user.id);
    try {
      const response = await fetch(
        `/api/v1/admin/users/${encodeURIComponent(user.id)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !user.isActive }),
        },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update user status");
      }
      toast.success(user.isActive ? "User suspended" : "User reactivated");
      await loadUsers();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update user status",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function resetPage(action: () => void) {
    setPage(1);
    action();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User management</CardTitle>
        <p className="text-sm text-muted-foreground">
          Search accounts, filter by role or status, and manage access.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(14rem,1fr)_10rem_10rem]">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) =>
                resetPage(() => setSearch(event.currentTarget.value))
              }
              placeholder="Search name or email"
              aria-label="Search users"
              className="pl-9"
            />
          </div>
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            value={role}
            onChange={(event) =>
              resetPage(() => setRole(event.currentTarget.value as RoleFilter))
            }
            aria-label="Filter by role"
          >
            <option value="ALL">All roles</option>
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(event) =>
              resetPage(() =>
                setStatus(event.currentTarget.value as StatusFilter),
              )
            }
            aria-label="Filter by status"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground">
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Joined</th>
                <th className="p-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <LoaderCircle
                      className="mx-auto size-5 animate-spin text-muted-foreground"
                      aria-label="Loading users"
                    />
                  </td>
                </tr>
              )}
              {!loading && result?.users.map((user) => {
                const protectedUser =
                  user.role === "ADMIN" || user.id === currentUserId;
                return (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="p-3">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary">{user.role.toLowerCase()}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={user.isActive ? "default" : "destructive"}>
                        {user.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      {protectedUser ? (
                        <span className="text-xs text-muted-foreground">
                          Protected
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant={user.isActive ? "destructive" : "outline"}
                          disabled={updatingId === user.id}
                          onClick={() => void toggleStatus(user)}
                        >
                          {updatingId === user.id
                            ? "Updating..."
                            : user.isActive
                              ? "Suspend"
                              : "Reactivate"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!loading && result?.users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No users match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {result
              ? `${result.total} users · Page ${result.page} of ${Math.max(1, result.totalPages)}`
              : "Loading users"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || !result || page >= result.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
