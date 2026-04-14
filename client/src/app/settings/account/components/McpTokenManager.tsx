"use client";

import { useState } from "react";
import { Bot, Check, Copy, ExternalLink } from "lucide-react";
import { DateTime } from "luxon";
import { authClient } from "@/lib/auth";
import { toast } from "@/components/ui/sonner";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { useListApiKeys, useCreateApiKey, useDeleteApiKey } from "../../../../api/admin/hooks/useUserApiKeys";
import { useGetSitesFromOrg } from "../../../../api/admin/hooks/useSites";
import { IS_CLOUD } from "../../../../lib/const";
import { getPlanTier, tierAtLeast } from "../../../../lib/tier";

function buildClaudeDesktopConfig(token: string, serverUrl: string) {
  return JSON.stringify(
    {
      mcpServers: {
        analytics: {
          type: "http",
          url: `${serverUrl}/api/mcp`,
          headers: { Authorization: `Bearer ${token}` },
        },
      },
    },
    null,
    2
  );
}

function buildCursorConfig(token: string, serverUrl: string) {
  return JSON.stringify(
    {
      mcpServers: {
        analytics: {
          url: `${serverUrl}/api/mcp`,
          headers: { Authorization: `Bearer ${token}` },
        },
      },
    },
    null,
    2
  );
}

interface CreatedToken {
  token: string;
  siteDomain: string;
}

export function McpTokenManager() {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: sitesData } = useGetSitesFromOrg(activeOrg?.id);

  const { data: allKeys, isLoading } = useListApiKeys();
  const createApiKey = useCreateApiKey();
  const deleteApiKey = useDeleteApiKey();

  const [tokenName, setTokenName] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [createdToken, setCreatedToken] = useState<CreatedToken | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const sites = sitesData?.sites ?? [];
  const subscription = sitesData?.subscription;
  const tier = getPlanTier(subscription?.planName);
  const hasAccess = !IS_CLOUD || tierAtLeast(tier, "pro");

  // Filter to only MCP tokens
  const mcpKeys = (allKeys ?? []).filter(k => (k.metadata as any)?.type === "mcp");

  const serverUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";

  const handleCreate = async () => {
    if (!tokenName.trim()) {
      toast.error("Enter a name for this token");
      return;
    }
    if (!selectedSiteId) {
      toast.error("Select a site to scope this token to");
      return;
    }

    const site = sites.find(s => String(s.siteId) === selectedSiteId);
    if (!site) return;

    try {
      const result = await createApiKey.mutateAsync({
        name: tokenName,
        metadata: { type: "mcp", siteId: Number(selectedSiteId) },
      });
      setCreatedToken({ token: result.key, siteDomain: site.domain });
      setTokenName("");
      setSelectedSiteId("");
      setShowDialog(true);
      toast.success("MCP token created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create token");
    }
  };

  const handleDelete = async (keyId: string, keyName: string | null) => {
    if (!confirm(`Delete MCP token "${keyName ?? "Unnamed"}"? This immediately revokes access.`)) return;
    try {
      await deleteApiKey.mutateAsync(keyId);
      toast.success("Token revoked");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke token");
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!hasAccess) {
    return (
      <Card className="p-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Bot className="w-5 h-5 text-accent-500" />
            MCP Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">
            MCP tokens require a Pro or Scale plan. They let you connect AI assistants like Claude Desktop and Cursor directly to your analytics data.{" "}
            <a href="/subscribe" className="text-accent-500 underline underline-offset-2">
              View plans →
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Bot className="w-5 h-5 text-accent-500" />
            MCP Tokens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xs text-neutral-500">
            Connect AI assistants (Claude Desktop, Cursor, etc.) to your site analytics via the{" "}
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent-500 underline underline-offset-2"
            >
              Model Context Protocol
              <ExternalLink className="w-3 h-3" />
            </a>
            . Each token is scoped to a single site.
          </p>

          {/* Create form */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Create token</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Token name (e.g. Cursor – my-site)"
                value={tokenName}
                onChange={e => setTokenName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                className="flex-1"
              />
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map(s => (
                    <SelectItem key={s.siteId} value={String(s.siteId)}>
                      {s.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleCreate}
                disabled={createApiKey.isPending || !tokenName.trim() || !selectedSiteId}
              >
                {createApiKey.isPending ? "Creating…" : "Create"}
              </Button>
            </div>
          </div>

          {/* Token list */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Your tokens</h4>
            {isLoading ? (
              <p className="text-xs text-neutral-500">Loading…</p>
            ) : mcpKeys.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Key prefix</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mcpKeys.map(key => {
                    const siteId = (key.metadata as any)?.siteId;
                    const site = sites.find(s => s.siteId === siteId);
                    return (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.name ?? "Unnamed"}</TableCell>
                        <TableCell>
                          {site ? (
                            <Badge variant="secondary" className="font-mono text-xs">
                              {site.domain}
                            </Badge>
                          ) : (
                            <span className="text-xs text-neutral-500">site #{siteId}</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{key.start ?? "****"}…</TableCell>
                        <TableCell className="text-xs">
                          {DateTime.fromISO(key.createdAt).toLocaleString(DateTime.DATE_SHORT)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(key.id, key.name)}
                            disabled={deleteApiKey.isPending}
                          >
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-xs text-neutral-500">No MCP tokens yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Created token dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>MCP Token Created</DialogTitle>
            <DialogDescription>
              Copy your token now — it won't be shown again. Then paste the config into your AI client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Token itself */}
            <div className="space-y-1">
              <Label>Token</Label>
              <div className="flex gap-2">
                <Input value={createdToken?.token ?? ""} readOnly className="font-mono text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyText(createdToken?.token ?? "", "token")}
                >
                  {copiedKey === "token" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> Store this token securely. It grants read access to analytics for{" "}
                <strong>{createdToken?.siteDomain}</strong>.
              </p>
            </div>

            {/* Config snippets */}
            <div className="space-y-1">
              <Label>Connection config</Label>
              <Tabs defaultValue="claude">
                <TabsList className="h-8">
                  <TabsTrigger value="claude" className="text-xs">Claude Desktop</TabsTrigger>
                  <TabsTrigger value="cursor" className="text-xs">Cursor</TabsTrigger>
                </TabsList>

                <TabsContent value="claude" className="mt-2 space-y-2">
                  <p className="text-xs text-neutral-500">
                    Add to{" "}
                    <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded text-[11px]">
                      ~/Library/Application Support/Claude/claude_desktop_config.json
                    </code>
                  </p>
                  <div className="relative">
                    <pre className="rounded-md bg-neutral-900 text-neutral-100 text-xs p-3 overflow-x-auto leading-relaxed">
                      {createdToken
                        ? buildClaudeDesktopConfig(createdToken.token, serverUrl)
                        : ""}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 h-7 gap-1 text-xs"
                      onClick={() =>
                        createdToken &&
                        copyText(buildClaudeDesktopConfig(createdToken.token, serverUrl), "claude")
                      }
                    >
                      {copiedKey === "claude" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="cursor" className="mt-2 space-y-2">
                  <p className="text-xs text-neutral-500">
                    Add to{" "}
                    <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded text-[11px]">
                      .cursor/mcp.json
                    </code>{" "}
                    in your project, or global Cursor MCP settings.
                  </p>
                  <div className="relative">
                    <pre className="rounded-md bg-neutral-900 text-neutral-100 text-xs p-3 overflow-x-auto leading-relaxed">
                      {createdToken
                        ? buildCursorConfig(createdToken.token, serverUrl)
                        : ""}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 h-7 gap-1 text-xs"
                      onClick={() =>
                        createdToken &&
                        copyText(buildCursorConfig(createdToken.token, serverUrl), "cursor")
                      }
                    >
                      {copiedKey === "cursor" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <Button className="w-full" onClick={() => setShowDialog(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
