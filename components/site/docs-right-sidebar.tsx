"use client";

import { TableOfContents } from "./table-of-contents";

export function DocsRightSidebar() {
  return (
    <div className="w-full space-y-6">
      <TableOfContents />
    </div>
  );
}