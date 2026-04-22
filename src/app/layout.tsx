import { Metadata } from "next";
import "./globals.css";
import { MswProvider } from "@/components/layout/msw-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { QueryProvider } from "@/components/layout/query-provider";
import { ApiClientInitializer } from "@/components/layout/api-client-initializer";

export const metadata: Metadata = {
  title: "ParkHub · 智慧停车管理平台",
  description: "为物业公司与商业综合体打造的一站式停车管理解决方案",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
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
