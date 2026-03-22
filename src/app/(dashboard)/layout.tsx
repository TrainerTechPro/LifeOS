import { Sidebar } from "@/components/layout/sidebar";
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
      <main className="flex-1 ml-64">
        <div className="mx-auto max-w-6xl px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
