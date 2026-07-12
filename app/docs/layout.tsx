"use client";

import { DocsSidebarNav } from "../../components/site/docs-sidebar-nav";
import { DocsRightSidebar } from "../../components/site/docs-right-sidebar";
import { MobileTocFab } from "../../components/site/mobile-toc-fab";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="relative border-b">
      <div className="mx-auto w-full flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] xl:max-w-[1600px] xl:grid-cols-[240px_minmax(0,1fr)_220px]">
        <aside className="sticky top-14 z-30 hidden h-[calc(100vh-3.5rem)] border-r bg-sidebar md:block">
          <div className="h-full overflow-y-auto px-4 py-8 lg:px-5">
            <DocsSidebarNav />
          </div>
        </aside>
        
        <main className="relative min-w-0 px-6 py-10 sm:px-8 lg:px-12 xl:px-10 xl:py-12">
          <div className="mx-auto w-full min-w-0 max-w-[960px]">
            {children}
          </div>
        </main>
        
        <aside className="sticky top-14 z-20 hidden h-[calc(100vh-3.5rem)] border-l bg-sidebar xl:block">
          <div className="h-full overflow-y-auto px-5 py-8">
            <DocsRightSidebar />
          </div>
        </aside>
      </div>

      {/* Mobile TOC FAB - only visible on mobile/tablet */}
      <MobileTocFab />
    </div>
  );
}
