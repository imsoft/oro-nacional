"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Search, Mail, Calendar, Shield, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUsersWithStats, getUserCountByRole } from "@/lib/supabase/user-management";
import type { UserWithStats, UserCountByRole } from "@/types/user-management";

export default function UsuariosAdmin() {
  const t = useTranslations('admin.users');
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [userCounts, setUserCounts] = useState<UserCountByRole>({
    total_users: 0,
    admin_count: 0,
    user_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [usersData, countsData] = await Promise.all([
      getUsersWithStats(),
      getUserCountByRole(),
    ]);
    setUsers(usersData);
    setUserCounts(countsData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredUsers = users.filter((user) => {
    const userName = user.full_name || t('noName');
    const matchesSearch =
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t('filterByRole')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allRoles')}</SelectItem>
            <SelectItem value="user">{t('user')}</SelectItem>
            <SelectItem value="admin">{t('admin')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="rounded-lg bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('userColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('roleColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('ordersColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('totalSpentColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('registrationColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('lastAccessColumn')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('actionsColumn')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-[#D4AF37]" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {user.full_name || t('noName')}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role === "admin" && (
                          <Shield className="h-3 w-3" />
                        )}
                        {user.role === "admin" ? t('administrator') : t('user')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground font-medium">
                        {user.order_count} {user.order_count === 1 ? t('orderSingular') : t('orderPlural')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        ${Number(user.total_spent).toLocaleString("es-MX")} MXN
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(user.created_at).toLocaleDateString("es-MX")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">
                        -
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#D4AF37] hover:text-[#B8941E]"
                      >
                        {t('viewDetails')}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    {t('noUsersFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="text-sm text-muted-foreground">{t('totalUsers')}</div>
          <div className="mt-2 text-3xl font-bold text-foreground">
            {userCounts.total_users}
          </div>
        </div>
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="text-sm text-muted-foreground">{t('customers')}</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {userCounts.user_count}
          </div>
        </div>
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="text-sm text-muted-foreground">{t('administrators')}</div>
          <div className="mt-2 text-3xl font-bold text-purple-600">
            {userCounts.admin_count}
          </div>
        </div>
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="text-sm text-muted-foreground">{t('totalValue')}</div>
          <div className="mt-2 text-3xl font-bold text-[#D4AF37]">
            ${users.reduce((sum, u) => sum + Number(u.total_spent), 0).toLocaleString("es-MX")}
          </div>
        </div>
      </div>
    </div>
  );
}
