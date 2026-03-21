import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeSystem OS",
  description: "Your personal operating system for life optimization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased min-h-screen bg-[var(--background)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
