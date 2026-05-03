import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MswProvider } from "@/components/layout/msw-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { QueryProvider } from "@/components/layout/query-provider";
import { ApiClientInitializer } from "@/components/layout/api-client-initializer";

export const metadata: Metadata = {
  title: "ParkHub · 智慧停车管理平台",
  description: "为物业公司与商业综合体打造的一站式停车管理解决方案",
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <MswProvider>
          <QueryProvider>
            <AuthProvider>
              <ApiClientInitializer />
              {children}
            </AuthProvider>
          </QueryProvider>
        </MswProvider>
      </body>
    </html>
  );
}
