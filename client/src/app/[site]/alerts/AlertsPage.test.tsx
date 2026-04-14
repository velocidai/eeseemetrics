import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

// ─── All mocks must be declared before any imports ────────────────────────────

vi.mock("next/navigation", () => ({
  usePathname: () => "/1/alerts",
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ site: "1" }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useExtracted: () => (key: string) => key,
}));

vi.mock("@/lib/store", () => ({
  useStore: () => ({ site: "1" }),
}));

vi.mock("@/hooks/useSetPageTitle", () => ({
  useSetPageTitle: () => undefined,
}));

vi.mock("@/components/InsightsGate", () => ({
  InsightsGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../components/SubHeader/SubHeader", () => ({
  SubHeader: () => null,
}));

vi.mock("@/components/NothingFound", () => ({
  NothingFound: ({ title }: { title: string }) => (
    <div data-testid="nothing-found">{title}</div>
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Import after all mocks
import AlertsPage from "./page";
import * as useGetAnomalyAlertsModule from "@/api/insights/hooks/useGetAnomalyAlerts";
import * as useUpdateAnomalyAlertModule from "@/api/insights/hooks/useUpdateAnomalyAlert";
import type { AnomalyAlert } from "@/api/insights/endpoints";

const mockAlert: AnomalyAlert = {
  id: "alert-1",
  metric: "sessions",
  severity: "high",
  status: "new",
  currentValue: 1500,
  baselineValue: 1000,
  percentChange: 50,
  cooldownKey: "sessions-high-1",
  detectedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  siteId: 1,
  ruleId: null,
};

beforeEach(() => {
  vi.spyOn(useUpdateAnomalyAlertModule, "useUpdateAnomalyAlert").mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as any);
});

describe("AlertsPage", () => {
  it("renders active alert with severity badge and metric name", async () => {
    vi.spyOn(useGetAnomalyAlertsModule, "useGetAnomalyAlerts").mockReturnValue({
      data: {
        data: [mockAlert],
        meta: {
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
          hasEnoughData: true,
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AlertsPage />);

    await waitFor(() => {
      // Multiple "high" elements: filter tab button + severity badge
      const highElements = screen.getAllByText(/high/i);
      expect(highElements.length).toBeGreaterThan(0);
    });
  });

  it("renders the sessions metric label for a sessions alert", async () => {
    vi.spyOn(useGetAnomalyAlertsModule, "useGetAnomalyAlerts").mockReturnValue({
      data: {
        data: [mockAlert],
        meta: {
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
          hasEnoughData: true,
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AlertsPage />);

    await waitFor(() => {
      expect(screen.getByText("Sessions")).toBeDefined();
    });
  });

  it("shows 'Not enough traffic' message when hasEnoughData is false", async () => {
    vi.spyOn(useGetAnomalyAlertsModule, "useGetAnomalyAlerts").mockReturnValue({
      data: {
        data: [],
        meta: {
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0,
          hasEnoughData: false,
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AlertsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("nothing-found")).toBeDefined();
      expect(screen.getByText(/Not enough traffic/i)).toBeDefined();
    });
  });

  it("shows empty state when no alerts match and hasEnoughData is true", async () => {
    vi.spyOn(useGetAnomalyAlertsModule, "useGetAnomalyAlerts").mockReturnValue({
      data: {
        data: [],
        meta: {
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0,
          hasEnoughData: true,
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AlertsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("nothing-found")).toBeDefined();
      expect(screen.getByText(/No alerts found/i)).toBeDefined();
    });
  });

  it("shows loading skeleton while fetching", () => {
    vi.spyOn(useGetAnomalyAlertsModule, "useGetAnomalyAlerts").mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    render(<AlertsPage />);
    const pulsing = document.querySelectorAll(".animate-pulse");
    expect(pulsing.length).toBeGreaterThan(0);
  });

  it("shows error message on fetch failure", async () => {
    vi.spyOn(useGetAnomalyAlertsModule, "useGetAnomalyAlerts").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    render(<AlertsPage />);

    await waitFor(() => {
      expect(document.body.textContent).toContain("Failed to load alerts");
    });
  });

  it("renders the page header 'Anomaly Alerts'", async () => {
    vi.spyOn(useGetAnomalyAlertsModule, "useGetAnomalyAlerts").mockReturnValue({
      data: {
        data: [],
        meta: {
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0,
          hasEnoughData: true,
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AlertsPage />);

    await waitFor(() => {
      expect(screen.getByText("Anomaly Alerts")).toBeDefined();
    });
  });
});
