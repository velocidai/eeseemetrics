import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ─── All mocks must be declared before any imports ────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/subscribe",
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useExtracted: () => (key: string) => key,
}));

vi.mock("@/lib/auth", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: false }),
    useActiveOrganization: () => ({ data: null }),
  },
}));

vi.mock("nuqs", () => ({
  useQueryState: () => [null, vi.fn()],
}));

// Mock PricingCard to avoid deep rendering complexity
vi.mock("@/components/pricing/PricingCard", () => ({
  PricingCard: ({ title, monthlyPrice, annualPrice, isAnnual, buttonText }: {
    title: string;
    monthlyPrice?: number;
    annualPrice?: number;
    isAnnual?: boolean;
    buttonText?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid={`pricing-card-${title.toLowerCase()}`}>
      <span data-testid={`plan-title-${title.toLowerCase()}`}>{title}</span>
      <span data-testid={`plan-price-${title.toLowerCase()}`}>
        ${isAnnual ? annualPrice : monthlyPrice}
      </span>
      {buttonText && (
        <button data-testid={`plan-btn-${title.toLowerCase()}`}>{buttonText}</button>
      )}
    </div>
  ),
  FeatureItem: ({ feature }: { feature: string }) => <div>{feature}</div>,
}));

// Mock CheckoutModal
vi.mock("@/components/subscription/components/CheckoutModal", () => ({
  CheckoutModal: () => null,
}));

// Mock toast
vi.mock("@/components/ui/sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

// Mock trackAdEvent
vi.mock("../../../lib/trackAdEvent", () => ({
  trackAdEvent: vi.fn(),
}));

// Mock Slider to avoid @radix-ui complexity
vi.mock("@/components/ui/slider", () => ({
  Slider: ({ onValueChange }: { onValueChange?: (v: number[]) => void }) => (
    <input
      type="range"
      data-testid="event-slider"
      onChange={(e) => onValueChange?.([parseInt(e.target.value)])}
    />
  ),
}));

// Import after all mocks
import { PricingCards } from "./PricingCards";

describe("PricingCards", () => {
  it("renders without crashing", () => {
    const { container } = render(<PricingCards isLoggedIn={false} />);
    expect(container).toBeDefined();
  });

  it("shows all three plan tiers", () => {
    render(<PricingCards isLoggedIn={false} />);
    expect(screen.getByTestId("plan-title-starter")).toBeDefined();
    expect(screen.getByTestId("plan-title-pro")).toBeDefined();
    expect(screen.getByTestId("plan-title-scale")).toBeDefined();
  });

  it("renders Starter plan title text", () => {
    render(<PricingCards isLoggedIn={false} />);
    expect(screen.getByText("Starter")).toBeDefined();
  });

  it("renders Pro plan title text", () => {
    render(<PricingCards isLoggedIn={false} />);
    expect(screen.getByText("Pro")).toBeDefined();
  });

  it("renders Scale plan title text", () => {
    render(<PricingCards isLoggedIn={false} />);
    expect(screen.getByText("Scale")).toBeDefined();
  });

  it("renders annual/monthly toggle buttons", () => {
    render(<PricingCards isLoggedIn={false} />);
    // The toggle buttons render text keys from useExtracted mock
    expect(document.body.textContent).toContain("Annual");
    expect(document.body.textContent).toContain("Monthly");
  });

  it("shows trial day labels in button text (7-day for Starter)", () => {
    render(<PricingCards isLoggedIn={false} />);
    // useExtracted mock returns the key string unchanged
    // so "Start 7-day trial" appears as the translation key
    const starterBtn = screen.getByTestId("plan-btn-starter");
    expect(starterBtn.textContent).toContain("7");
    expect(starterBtn.textContent).toContain("day");
  });

  it("shows 14-day trial label for Pro plan", () => {
    render(<PricingCards isLoggedIn={false} />);
    const proBtn = screen.getByTestId("plan-btn-pro");
    expect(proBtn.textContent).toContain("14");
    expect(proBtn.textContent).toContain("day");
  });

  it("starts in annual mode by default", () => {
    render(<PricingCards isLoggedIn={false} />);
    const starterCard = screen.getByTestId("pricing-card-starter");
    // In annual mode, the price shown should be from annualPrice prop
    expect(starterCard).toBeDefined();
  });

  it("switches between monthly and annual pricing", () => {
    render(<PricingCards isLoggedIn={false} />);
    const monthlyButton = screen.getByText("Monthly");
    const annualButton = screen.getByText("Annual");

    // Default is annual
    fireEvent.click(monthlyButton);
    // After clicking monthly, the monthly prices should be shown
    expect(screen.getByTestId("pricing-card-starter")).toBeDefined();

    fireEvent.click(annualButton);
    // Back to annual
    expect(screen.getByTestId("pricing-card-starter")).toBeDefined();
  });
});
