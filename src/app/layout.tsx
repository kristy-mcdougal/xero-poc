import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { PreviewBridge } from "@/components/PreviewBridge";
import { PreviewToggle } from "@/components/PreviewToggle";

export const metadata: Metadata = {
  title: "Xero POC",
  description: "Multi-site CMS proof of concept",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-navy">
        {children}
        <Suspense fallback={null}>
          <PreviewBridge />
        </Suspense>
        <Suspense fallback={null}>
          <PreviewToggle />
        </Suspense>
      </body>
    </html>
  );
}
