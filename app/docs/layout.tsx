"use client";

import { DocsSidebarNav } from "../../components/site/docs-sidebar-nav";
import { DocsRightSidebar } from "../../components/site/docs-right-sidebar";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {

  return (
    <div className="relative border-b">
      <div className="container mx-auto max-w-[1400px] flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-8 lg:grid-cols-[260px_minmax(0,1fr)_240px] lg:gap-12 xl:gap-16">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block border-r">
          <div className="h-full py-8 pr-8 lg:py-10">
            <DocsSidebarNav />
          </div>
        </aside>
        
        <main className="relative py-8 lg:py-10 xl:py-12">
          <div className="mx-auto w-full min-w-0 max-w-4xl">
            {children}
          </div>
        </main>
        
        <aside className="fixed top-14 z-20 -mr-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 lg:sticky lg:block border-l">
          <div className="h-full py-8 pl-8 lg:py-10">
            <DocsRightSidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}