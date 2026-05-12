/* ==========================================================================
   BUILD LEVEL — Order Confirmation Page
   ========================================================================== */

import { useEffect } from "react";
import { Link, useSearch } from "wouter";
import { CheckCircle, Package, Truck, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export default function OrderConfirmation() {
  const { clearCart } = useCart();
  const search = useSearch();
  const sessionId = new URLSearchParams(search).get("session_id");

  useEffect(() => {
    // Clear cart after successful order
    clearCart();
    // Show customer confirmation toast
    toast.success("Order confirmed! Check your email for receipt.", {
      duration: 8000,
      description: sessionId ? `Reference: ${sessionId.slice(-8).toUpperCase()}` : "Your BUILD LEVEL gear is on its way!",
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#2A2A2A]">
      <Navbar />

      <div className="pt-32 pb-24">
        <div className="max-w-[640px] mx-auto px-6 text-center">

          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 flex items-center justify-center">
              <CheckCircle size={40} className="text-[#FF6B00]" />
            </div>
          </div>

          <p className="font-display text-xs tracking-[0.3em] text-[#FF6B00] mb-3">
            ORDER CONFIRMED
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            YOU'RE IN THE<br />
            <span className="text-[#FF6B00]">MOVEMENT.</span>
          </h1>
          <p className="font-body text-[#888] text-lg mb-12">
            Your order has been placed successfully. A confirmation email will be sent to you shortly.
          </p>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: <CheckCircle size={24} className="text-[#FF6B00]" />,
                title: "Order Placed",
                desc: "Your order is confirmed and being processed.",
              },
              {
                icon: <Package size={24} className="text-[#FF6B00]" />,
                title: "Being Packed",
                desc: "Your gear is being carefully packed and quality checked.",
              },
              {
                icon: <Truck size={24} className="text-[#FF6B00]" />,
                title: "On Its Way",
                desc: "Estimated delivery: 5–10 business days worldwide.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-[#333] border border-white/5 p-6 text-center"
              >
                <div className="flex justify-center mb-3">{step.icon}</div>
                <h3 className="font-display text-sm font-bold text-white mb-2">{step.title}</h3>
                <p className="font-body text-xs text-[#888]">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Email notice */}
          <div className="flex items-center justify-center gap-3 bg-[#1A1A1A] border border-white/10 p-4 mb-10">
            <Mail size={16} className="text-[#FF6B00] flex-shrink-0" />
            <p className="font-body text-sm text-[#888]">
              Check your email for your order receipt and tracking information.
            </p>
          </div>

          {/* Quote */}
          <div className="mb-10">
            <div className="w-8 h-0.5 bg-[#FF6B00] mx-auto mb-4" />
            <p className="font-display text-xl font-bold text-white italic">
              "Discipline Is Quiet Power."
            </p>
            <p className="font-body text-xs text-[#888] mt-2">Keep executing. — BUILD LEVEL</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <span className="btn-primary text-sm px-8 py-4 block">
                CONTINUE SHOPPING
              </span>
            </Link>
            <Link href="/">
              <span className="btn-outline text-sm px-8 py-4 block">
                BACK TO HOME
              </span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
