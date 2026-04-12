import type { User } from "@/types";

export const demoUser: User = {
  id: "usr_super_001",
  name: "超级管理员",
  email: "admin@parkhub.test",
  phone: "13800000000",
  role: "super_admin",
};

let tokenCounter = 0;

export function generateToken(userId: string): string {
  tokenCounter++;
  const timestamp = Date.now();
  return `pkh_mock_${userId}_${timestamp}_${tokenCounter}`;
}

export function validateToken(token: string): boolean {
  return typeof token === "string" && token.startsWith("pkh_mock_");
}
