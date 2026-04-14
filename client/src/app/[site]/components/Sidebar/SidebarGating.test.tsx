import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ─── All mocks must be declared before any imports ────────────────────────────

vi.mock("next/navigation", () => ({
  usePathname: () => "/1/main",
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ site: "1" }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useExtracted: () => (key: string) => key,
}));

vi.mock("../../../../lib/auth", () => ({
  authClient: {
    useSession: () => ({
      data: { user: { id: "u1", email: "test@test.com", name: "Test" } },
      isPending: false,
    }),
    useActiveOrganization: () => ({ data: { id: "org1", name: "Test Org" } }),
  },
}));

vi.mock("../../../../api/insights/hooks/useGetAlertUnreadCount", () => ({
  useGetAlertUnreadCount: () => ({ data: { count: 0 } }),
}));

vi.mock("../../../../api/admin/hooks/useSites", () => ({
  useGetSite: () => ({
    data: { siteId: 1, name: "Test Site", domain: "test.com" },
  }),
}));

vi.mock("../../../../hooks/useSignout", () => ({
  useSignout: () => vi.fn(),
}));

vi.mock("../../../../components/ThemeSwitcher", () => ({
  ThemeSwitcher: () => null,
}));

vi.mock("../../../../components/SiteSettings/SiteSettings", () => ({
  SiteSettings: () => null,
}));

vi.mock("../../../../components/EeseeLogo", () => ({
  PielIcon: () => null,
}));

vi.mock("../../utils", () => ({
  useEmbedablePage: () => false,
}));

vi.mock("./SiteSelector", () => ({
  SiteSelector: () => <div data-testid="site-selector">SiteSelector</div>,
}));

// Mock the Sidebar UI primitives to render simple labelled items
vi.mock("../../../../components/sidebar/Sidebar", () => ({
  Sidebar: {
    SectionHeader: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="section-header">{children}</div>
    ),
    Item: ({
      label,
      href,
    }: {
      label: string;
      href?: string;
      [key: string]: unknown;
    }) => (
      <a data-testid={`nav-item-${label.toLowerCase().replace(/\s+/g, "-")}`} href={href ?? "#"}>
        {label}
      </a>
    ),
  },
}));

// ─── Subscription mock — overridden per describe block ────────────────────────
vi.mock("../../../../lib/subscription/useStripeSubscription", () => ({
  useStripeSubscription: vi.fn(),
}));

// IS_CLOUD = true so gating logic is active
vi.mock("../../../../lib/const", () => ({
  IS_CLOUD: true,
  BACKEND_URL: "http://localhost:3001",
  STARTER_SITE_LIMIT: 1,
  STARTER_TEAM_LIMIT: 1,
  PRO_SITE_LIMIT: 10,
  PRO_TEAM_LIMIT: 10,
}));

// Import after all mocks
import { SidebarContent } from "./Sidebar";
import * as useStripeSubscriptionModule from "../../../../lib/subscription/useStripeSubscription";

// ─── Pro tier tests ────────────────────────────────────────────────────────────

describe("Sidebar — Pro tier (IS_CLOUD=true)", () => {
  beforeEach(() => {
    vi.mocked(useStripeSubscriptionModule.useStripeSubscription).mockReturnValue({
      data: { planName: "pro100k", status: "active" },
      isLoading: false,
    } as any);
  });

  it("shows Reports nav item for Pro tier", () => {
    render(<SidebarContent />);
    expect(screen.getByTestId("nav-item-reports")).toBeDefined();
  });

  it("shows Alerts nav item for Pro tier", () => {
    render(<SidebarContent />);
    expect(screen.getByTestId("nav-item-alerts")).toBeDefined();
  });

  it("shows Performance nav item for Pro tier", () => {
    render(<SidebarContent />);
    expect(screen.getByTestId("nav-item-performance")).toBeDefined();
  });

  it("shows Search Console nav item for Pro tier", () => {
    render(<SidebarContent />);
    expect(screen.getByTestId("nav-item-search-console")).toBeDefined();
  });
});

// ─── Starter tier tests ───────────────────────────────────────────────────────

describe("Sidebar — Starter tier (IS_CLOUD=true)", () => {
  beforeEach(() => {
    vi.mocked(useStripeSubscriptionModule.useStripeSubscription).mockReturnValue({
      data: { planName: "starter100k", status: "active" },
      isLoading: false,
    } as any);
  });

  it("hides Reports nav item for Starter tier", () => {
    render(<SidebarContent />);
    expect(screen.queryByTestId("nav-item-reports")).toBeNull();
  });

  it("shows Alerts nav item for Starter tier (always visible)", () => {
    render(<SidebarContent />);
    expect(screen.getByTestId("nav-item-alerts")).toBeDefined();
  });

  it("hides Chat nav item for Starter tier", () => {
    render(<SidebarContent />);
    expect(screen.queryByTestId("nav-item-chat")).toBeNull();
  });

  it("hides Piel section header for Starter tier", () => {
    render(<SidebarContent />);
    expect(screen.queryByText("Piel")).toBeNull();
  });

  it("still shows Main nav item for Starter tier", () => {
    render(<SidebarContent />);
    expect(screen.getByTestId("nav-item-main")).toBeDefined();
  });
});

// ─── Scale tier tests ─────────────────────────────────────────────────────────

describe("Sidebar — Scale tier (IS_CLOUD=true)", () => {
  beforeEach(() => {
    vi.mocked(useStripeSubscriptionModule.useStripeSubscription).mockReturnValue({
      data: { planName: "scale500k", status: "active" },
      isLoading: false,
    } as any);
  });

  it("shows Reports nav item for Scale tier", () => {
    render(<SidebarContent />);
    expect(screen.getByTestId("nav-item-reports")).toBeDefined();
  });

  it("shows Alerts nav item for Scale tier", () => {
    render(<SidebarContent />);
    expect(screen.getByTestId("nav-item-alerts")).toBeDefined();
  });
});
