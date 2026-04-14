"use client";

import { PielPageInfo, type PageInfoKey } from "../../../components/PielPageInfo";

interface UptimePageHeaderProps {
  title: string;
  description?: string;
  pageInfo: PageInfoKey;
  actions?: React.ReactNode;
}

export function UptimePageHeader({ title, description, pageInfo, actions }: UptimePageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="text-sm text-neutral-500 mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <PielPageInfo page={pageInfo} />
      </div>
    </div>
  );
}
