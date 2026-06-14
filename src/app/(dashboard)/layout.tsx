import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandMenu } from "@/components/layout/command-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen noise">
      <Sidebar />
      <CommandMenu />
      {/* Margin only applies once the desktop sidebar appears (md+). On mobile
          the content is full-width with bottom padding to clear the tab bar. */}
      <main className="flex-1 md:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-24 md:px-8 md:py-10 md:pb-10">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
