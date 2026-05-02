"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, mapBackendUser } from "@/lib/api/auth";
import type { UpdateProfileFormData, ChangePasswordFormData } from "@/lib/api/contracts";
import { useAuth } from "@/contexts/auth-context";
import { saveSession, loadSession } from "@/lib/session/storage";

const profileKeys = {
  me: ["profile", "me"] as const,
};

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: async () => {
      const { user } = await authService.getCurrentUser();
      return mapBackendUser(user);
    },
    initialData: user ?? undefined,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: UpdateProfileFormData) => authService.updateProfile(data),
    onSuccess: (res) => {
      const mapped = mapBackendUser(res.user);
      const session = loadSession();
      if (session) {
        saveSession({ ...session, user: mapped });
      }
      qc.setQueryData(profileKeys.me, mapped);
      qc.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }),
  });
}
