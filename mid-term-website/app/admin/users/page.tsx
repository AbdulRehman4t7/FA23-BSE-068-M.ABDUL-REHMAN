"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Shield, UserCog, Users } from "lucide-react";
import { toast } from "sonner";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  created_at: string;
};

const roleOptions = ["CLIENT", "MODERATOR", "ADMIN", "SUPER_ADMIN"];

function normalizeRole(role: string) {
  return String(role || "").toUpperCase();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadUsers() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users || []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = [user.name, user.email]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || normalizeRole(user.role) === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const stats = useMemo(
    () => [
      { label: "Total Users", value: users.length, icon: Users },
      {
        label: "Moderators",
        value: users.filter((u) => normalizeRole(u.role) === "MODERATOR").length,
        icon: Shield,
      },
      {
        label: "Admins",
        value: users.filter((u) => ["ADMIN", "SUPER_ADMIN"].includes(normalizeRole(u.role))).length,
        icon: UserCog,
      },
    ],
    [users]
  );

  async function updateUser(userId: string, payload: { role?: string; status?: string }) {
    try {
      setSavingId(userId);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...payload }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      toast.success("User updated");
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...data.user } : u)));
    } catch (e: any) {
      toast.error(e?.message || "Failed to update user");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and account status with server-validated RBAC controls.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{isLoading ? "..." : stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Directory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email"
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue placeholder="Filter role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {!isLoading && filteredUsers.length === 0 && (
                <div className="rounded-2xl border border-border p-6 text-center text-sm text-muted-foreground">
                  No users found for current filters.
                </div>
              )}

              {filteredUsers.map((user) => {
                const currentRole = normalizeRole(user.role);
                const isSaving = savingId === user.id;

                return (
                  <div
                    key={user.id}
                    className="flex flex-col gap-4 rounded-2xl border border-border p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{user.name || "Unnamed user"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(user.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Select
                        value={currentRole}
                        onValueChange={(nextRole) => updateUser(user.id, { role: nextRole })}
                      >
                        <SelectTrigger className="w-[180px]" disabled={isSaving}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant={String(user.status || "ACTIVE").toUpperCase() === "ACTIVE" ? "destructive" : "outline"}
                        disabled={isSaving}
                        onClick={() =>
                          updateUser(user.id, {
                            status:
                              String(user.status || "ACTIVE").toUpperCase() === "ACTIVE"
                                ? "SUSPENDED"
                                : "ACTIVE",
                          })
                        }
                      >
                        {String(user.status || "ACTIVE").toUpperCase() === "ACTIVE"
                          ? "Disable"
                          : "Enable"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
