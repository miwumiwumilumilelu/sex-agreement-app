import React from "react";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "性行为同意协议系统",
  description: "帮助用户创建和签署性行为同意协议的在线平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" data-theme="corporate">
      <body className="min-h-screen">
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
