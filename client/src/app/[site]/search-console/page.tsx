"use client";

import { SiGoogle } from "@icons-pack/react-simple-icons";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Loader2,
  Search,
  SquareArrowOutUpRight,
  Unlink,
} from "lucide-react";
import { useExtracted } from "next-intl";
import { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useDebounce } from "@uidotdev/usehooks";
import { GSCData, GSCDimension } from "../../../api/gsc/endpoints";
import { useConnectGSC } from "../../../api/gsc/hooks/useConnectGSC";
import { useDisconnectGSC } from "../../../api/gsc/hooks/useDisconnectGSC";
import { useGetGSCConnection } from "../../../api/gsc/hooks/useGetGSCConnection";
import { useGetGSCData } from "../../../api/gsc/hooks/useGetGSCData";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/basic-tabs";
import { useSetPageTitle } from "../../../hooks/useSetPageTitle";
import { cn, getCountryName } from "../../../lib/utils";
import { CountryFlag } from "../components/shared/icons/CountryFlag";
import { DeviceIcon } from "../components/shared/icons/Device";
import { SubHeader } from "../components/SubHeader/SubHeader";

// ─── Setup guide (not connected) ─────────────────────────────────────────────

function SetupGuide() {
  const { mutate: connect, isPending } = useConnectGSC();
  const t = useExtracted();

  const steps = [
    {
      n: 1,
      title: t("Verify your site in Google Search Console"),
      body: t(
        "Go to search.google.com/search-console and add your property if you haven't already. You can verify ownership via DNS record, HTML file, or your Analytics tag."
      ),
      link: { href: "https://search.google.com/search-console", label: t("Open Search Console") },
    },
    {
      n: 2,
      title: t("Connect your Google account"),
      body: t(
        "Click the button below to sign in with Google. You'll be asked to grant read-only access to your Search Console data — no changes will be made to your account."
      ),
    },
    {
      n: 3,
      title: t("Select a property"),
      body: t(
        "After signing in, choose which Search Console property matches this site. Both domain properties (sc-domain:example.com) and URL-prefix properties (https://example.com/) are supported."
      ),
    },
    {
      n: 4,
      title: t("Data appears within minutes"),
      body: t(
        "Once connected, keyword rankings, click-through rates, impressions, and top pages will populate here. Note: Google Search Console data has a 2–3 day delay, so very recent data may not appear yet."
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Alert className="p-4 bg-neutral-50/50 border-neutral-200/50 dark:bg-neutral-800/25 dark:border-neutral-700/50">
        <div className="flex items-start gap-3">
          <SiGoogle className="h-5 w-5 mt-0.5 shrink-0 text-neutral-700 dark:text-neutral-300" />
          <div className="flex-1">
            <AlertTitle className="text-base font-semibold mb-1 text-neutral-700/90 dark:text-neutral-100">
              {t("Connect Google Search Console")}
            </AlertTitle>
            <AlertDescription className="text-sm text-neutral-700/80 dark:text-neutral-300/80">
              {t(
                "Link your Search Console account to see how your site performs in Google Search — keywords, impressions, click-through rates, and average ranking positions."
              )}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Steps */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
        {steps.map((step) => (
          <div key={step.n} className="flex gap-4 p-4">
            <div className="shrink-0 w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              {step.n}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 mb-0.5">
                {step.title}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {step.body}
              </p>
              {step.link && (
                <a
                  href={step.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1.5 text-xs text-accent-500 hover:text-accent-400 transition-colors"
                >
                  {step.link.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-start">
        <Button onClick={() => connect()} disabled={isPending} size="sm">
          <SiGoogle className="w-4 h-4" />
          {isPending ? t("Connecting...") : t("Connect Google Search Console")}
        </Button>
      </div>
    </div>
  );
}

// ─── Connected header bar ─────────────────────────────────────────────────────

function ConnectedBar({ propertyUrl }: { propertyUrl: string | null }) {
  const { mutate: disconnect, isPending } = useDisconnectGSC();
  const t = useExtracted();

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <SiGoogle className="w-4 h-4 shrink-0 text-neutral-600 dark:text-neutral-300" />
        <span className="text-neutral-500 dark:text-neutral-400 shrink-0">{t("Connected to")}</span>
        <span className="font-medium text-neutral-800 dark:text-neutral-100 truncate">
          {propertyUrl
            ? propertyUrl.startsWith("sc-domain:")
              ? propertyUrl.replace("sc-domain:", "")
              : propertyUrl
            : t("Unknown property")}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 text-neutral-500 hover:text-red-600 dark:hover:text-red-400 h-7 px-2"
        onClick={() => disconnect()}
        disabled={isPending}
      >
        <Unlink className="w-3.5 h-3.5 mr-1" />
        {isPending ? t("Disconnecting...") : t("Disconnect")}
      </Button>
    </div>
  );
}

// ─── Data table (full-width) ──────────────────────────────────────────────────

const columnHelper = createColumnHelper<GSCData>();

function DataTable({
  dimension,
  label,
  renderName,
}: {
  dimension: GSCDimension;
  label: string;
  renderName?: (name: string) => React.ReactNode;
}) {
  const { data, isLoading } = useGetGSCData(dimension);
  const t = useExtracted();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);
  const [sorting, setSorting] = useState<SortingState>([{ id: "clicks", desc: true }]);

  const filtered = data
    ? data.filter((item) =>
        String(item.name).toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : [];

  const columns = [
    columnHelper.accessor("name", {
      header: label,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {renderName ? renderName(row.original.name) : row.original.name}
        </div>
      ),
    }),
    columnHelper.accessor("clicks", {
      header: t("Clicks"),
      cell: (info) => (
        <div className="text-right">{info.getValue().toLocaleString()}</div>
      ),
    }),
    columnHelper.accessor("impressions", {
      header: t("Impressions"),
      cell: (info) => (
        <div className="text-right">{info.getValue().toLocaleString()}</div>
      ),
    }),
    columnHelper.accessor("ctr", {
      header: t("CTR"),
      cell: (info) => (
        <div className="text-right">{(info.getValue() * 100).toFixed(1)}%</div>
      ),
    }),
    columnHelper.accessor("position", {
      header: t("Avg. Position"),
      cell: (info) => (
        <div className="text-right">{info.getValue().toFixed(1)}</div>
      ),
    }),
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    sortDescFirst: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-neutral-500 dark:text-neutral-500">
        <Info className="w-5 h-5" />
        <p className="text-sm">{t("No Data")}</p>
        <p className="text-xs text-center max-w-xs">
          {t("Google Search Console data has a 2-3 day delay. Try selecting a wider date range.")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
        <Input
          placeholder={t("Filter {count} items...", { count: String(data.length) })}
          className="pl-9 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-max">
            <thead className="bg-neutral-50 dark:bg-neutral-850 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header, i) => (
                    <th
                      key={header.id}
                      className={cn(
                        "px-3 py-2.5 font-medium whitespace-nowrap cursor-pointer select-none",
                        i === 0 ? "text-left" : "text-right"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className={cn("flex items-center gap-1", i !== 0 && "justify-end")}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: <ChevronUp className="h-3 w-3" />, desc: <ChevronDown className="h-3 w-3" /> }[
                          header.column.getIsSorted() as string
                        ] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors",
                    rowIndex % 2 === 0
                      ? "bg-white dark:bg-neutral-900"
                      : "bg-neutral-50/50 dark:bg-neutral-950"
                  )}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <td
                      key={cell.id}
                      className={cn("px-3 py-2", cellIndex !== 0 && "text-right")}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-xs text-neutral-500 dark:text-neutral-500">
            {t("No results found")}
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        {t("Showing {count} results", { count: String(filtered.length) })}
        {data.length > filtered.length && ` ${t("of {total}", { total: String(data.length) })}`}
      </p>
    </div>
  );
}

// ─── Connected data view ──────────────────────────────────────────────────────

type Tab = "queries" | "pages" | "countries" | "devices";

function ConnectedView({ propertyUrl }: { propertyUrl: string | null }) {
  const [tab, setTab] = useState<Tab>("queries");
  const t = useExtracted();

  return (
    <div className="space-y-4">
      <ConnectedBar propertyUrl={propertyUrl} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="queries">{t("Keywords")}</TabsTrigger>
          <TabsTrigger value="pages">{t("Pages")}</TabsTrigger>
          <TabsTrigger value="countries">{t("Countries")}</TabsTrigger>
          <TabsTrigger value="devices">{t("Devices")}</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="queries">
            <DataTable dimension="query" label={t("Keyword")} />
          </TabsContent>
          <TabsContent value="pages">
            <DataTable
              dimension="page"
              label={t("Page")}
              renderName={(name) => {
                let path = name;
                try {
                  path = new URL(name).pathname || "/";
                } catch {}
                return (
                  <div className="flex items-center gap-1">
                    <span className="truncate max-w-[300px]">{path}</span>
                    <a
                      href={name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      <SquareArrowOutUpRight className="w-3 h-3" strokeWidth={2.5} />
                    </a>
                  </div>
                );
              }}
            />
          </TabsContent>
          <TabsContent value="countries">
            <DataTable
              dimension="country"
              label={t("Country")}
              renderName={(name) => (
                <div className="flex items-center gap-2">
                  <CountryFlag country={name} />
                  {getCountryName(name)}
                </div>
              )}
            />
          </TabsContent>
          <TabsContent value="devices">
            <DataTable
              dimension="device"
              label={t("Device")}
              renderName={(name) => (
                <div className="flex items-center gap-2">
                  <DeviceIcon deviceType={name || ""} size={14} />
                  {name === "DESKTOP"
                    ? t("Desktop")
                    : name === "MOBILE"
                    ? t("Mobile")
                    : name === "TABLET"
                    ? t("Tablet")
                    : t("Other")}
                </div>
              )}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SearchConsolePage() {
  useSetPageTitle("Search Console");
  const { data: connection, isLoading } = useGetGSCConnection();

  return (
    <div className="p-2 md:p-4 max-w-[1100px] mx-auto space-y-3">
      <SubHeader />
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : connection?.connected ? (
        <ConnectedView propertyUrl={connection.gscPropertyUrl} />
      ) : (
        <SetupGuide />
      )}
    </div>
  );
}
