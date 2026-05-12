import Stripe from "stripe";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-04-22.dahlia",
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  shop: router({
    createCheckoutSession: publicProcedure
      .input(
        z.object({
          items: z.array(
            z.object({
              name: z.string(),
              priceUSD: z.number(),
              quantity: z.number(),
              image: z.string().optional(),
            })
          ),
          currency: z.string().default("usd"),
          customerEmail: z.string().email().optional(),
          paymentMethod: z.enum(["card", "apple_pay", "google_pay"]).default("card"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const origin = ctx.req.headers.origin || "http://localhost:3000";

        const lineItems = input.items.map((item) => ({
          price_data: {
            currency: input.currency,
            product_data: {
              name: item.name,
              images: item.image ? [item.image] : [],
            },
            unit_amount: Math.round(item.priceUSD * 100),
          },
          quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
          line_items: lineItems,
          mode: "payment",
          customer_email: input.customerEmail || undefined,
          allow_promotion_codes: true,
          shipping_address_collection: {
            allowed_countries: ["US", "GB", "CA", "AU", "DE", "FR", "JP", "NG", "ZA", "AE"],
          },
          shipping_options: [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: 0, currency: input.currency },
                display_name: "Standard Shipping",
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 5 },
                  maximum: { unit: "business_day", value: 10 },
                },
              },
            },
            {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: 1999, currency: input.currency },
                display_name: "Express Shipping",
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 2 },
                  maximum: { unit: "business_day", value: 3 },
                },
              },
            },
          ],
          success_url: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/checkout`,
          metadata: {
            source: "build_level_website",
          },
        });

        // Notify owner of new order
        const itemSummary = input.items
          .map((i) => `${i.quantity}x ${i.name}`)
          .join(", ");
        const total = input.items
          .reduce((sum, i) => sum + i.priceUSD * i.quantity, 0)
          .toFixed(2);
        await notifyOwner({
          title: "🛒 New Order Placed — BUILD LEVEL",
          content: `A new order was placed on your store.\n\nItems: ${itemSummary}\nTotal: $${total} ${input.currency.toUpperCase()}\nCustomer: ${input.customerEmail || "Guest"}`,
        }).catch(() => {/* non-blocking */});

        return { url: session.url, sessionId: session.id };
      }),
  }),

  notifications: router({
    // Owner alert when someone signs up to the email list
    emailSignup: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await notifyOwner({
          title: "📧 New Email Signup — BUILD LEVEL",
          content: `A new subscriber joined your email list.\n\nEmail: ${input.email}\nTime: ${new Date().toUTCString()}`,
        }).catch(() => {/* non-blocking */});
        return { success: true };
      }),

    // Owner alert when contact form is submitted
    contactForm: publicProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().email(),
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        await notifyOwner({
          title: `📬 New Contact Form — ${input.name}`,
          content: `Name: ${input.name}\nEmail: ${input.email}\n\nMessage:\n${input.message}`,
        }).catch(() => {/* non-blocking */});
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
