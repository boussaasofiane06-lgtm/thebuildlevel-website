import { describe, expect, it, vi } from "vitest";

// Mock stripe before importing routers
vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: "cs_test_123",
            url: "https://checkout.stripe.com/test",
          }),
        },
      },
    })),
  };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createCtx(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { origin: "https://example.com" },
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("shop.createCheckoutSession", () => {
  it("returns a checkout URL for valid items", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.shop.createCheckoutSession({
      items: [
        { name: "Build Level Core Hoodie", priceUSD: 89, quantity: 1 },
      ],
      currency: "usd",
      customerEmail: "test@example.com",
      paymentMethod: "card",
    });

    expect(result.url).toBeTruthy();
    expect(result.sessionId).toBe("cs_test_123");
  });

  it("handles multiple items", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.shop.createCheckoutSession({
      items: [
        { name: "Hoodie", priceUSD: 89, quantity: 2 },
        { name: "Tee", priceUSD: 45, quantity: 1 },
      ],
      currency: "gbp",
    });

    expect(result.url).toBeTruthy();
  });
});
