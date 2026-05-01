import { useState, type ReactNode } from "react";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block sticky top-0 h-screen">
        <Sidebar />
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar onMenu={() => setOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
