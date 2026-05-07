/* ==========================================================================
   BUILD LEVEL — FAQ Page
   Design: Dark Luxury Editorial — accordion-style FAQ with shipping, returns, sizing
   ========================================================================== */

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqCategories = [
  {
    category: "Shipping",
    icon: "📦",
    items: [
      {
        q: "How long does shipping take?",
        a: "Standard shipping takes 5–7 business days. Expedited shipping (2–3 business days) is available at checkout. International orders typically arrive within 10–14 business days.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship worldwide. International shipping rates and delivery times vary by destination. All duties and taxes are the responsibility of the customer.",
      },
      {
        q: "How can I track my order?",
        a: "Once your order ships, you'll receive a tracking number via email. You can use this to track your package through our carrier's website.",
      },
      {
        q: "Do you offer free shipping?",
        a: "We offer free standard shipping on all domestic orders over $75. International orders do not qualify for free shipping at this time.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    icon: "🔄",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 30 days of delivery for unworn, unwashed items in their original condition with tags attached. Sale items are final sale and cannot be returned.",
      },
      {
        q: "How do I start a return?",
        a: "Email us at returns@buildlevel.com with your order number and reason for return. We'll send you a prepaid return label within 24 hours.",
      },
      {
        q: "How long does a refund take?",
        a: "Once we receive your return, refunds are processed within 3–5 business days. The refund will appear on your original payment method within 5–10 business days.",
      },
      {
        q: "Can I exchange for a different size?",
        a: "Yes, exchanges are available for different sizes of the same item, subject to availability. Contact us at info@buildlevel.com to initiate an exchange.",
      },
    ],
  },
  {
    category: "Sizing",
    icon: "📏",
    items: [
      {
        q: "How do BUILD LEVEL items fit?",
        a: "Our hoodies and tees are designed with an oversized, relaxed fit consistent with premium streetwear. We recommend sizing down if you prefer a more fitted look.",
      },
      {
        q: "Where can I find the size chart?",
        a: "Each product page includes a detailed size chart with chest, length, and sleeve measurements. When in doubt, our customer service team is happy to help you find the right fit.",
      },
      {
        q: "Do your sizes run large or small?",
        a: "Our items run true to size with a generous, relaxed cut. If you're between sizes, we recommend going with your usual size for the intended oversized streetwear fit.",
      },
    ],
  },
  {
    category: "Products & Quality",
    icon: "⚡",
    items: [
      {
        q: "What materials are your products made from?",
        a: "Our hoodies are crafted from 400GSM heavyweight cotton fleece. Our tees use 220GSM premium ring-spun cotton. Every piece is built to last.",
      },
      {
        q: "How should I care for my BUILD LEVEL gear?",
        a: "Machine wash cold, inside out, with like colors. Tumble dry low or hang dry. Do not bleach. Iron on low heat if needed, avoiding printed areas.",
      },
      {
        q: "Are your products ethically made?",
        a: "Yes. We work exclusively with manufacturing partners who meet strict ethical standards for fair wages, safe working conditions, and sustainable practices.",
      },
    ],
  },
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#2A2A2A]">
      <Navbar />

      {/* Page Header */}
      <div className="pt-32 pb-16 bg-[#333333] border-b border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <p className="section-label">Help Center</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white">
            FREQUENTLY ASKED<br /><span className="text-[#FF6B00]">QUESTIONS</span>
          </h1>
          <p className="font-body text-[#888] mt-4 text-sm max-w-[400px]">
            Everything you need to know about orders, shipping, returns, and more.
          </p>
        </div>
      </div>

      <section className="py-24">
        <div className="max-w-[900px] mx-auto px-6 lg:px-10">
          {faqCategories.map((cat, ci) => (
            <div key={ci} className="mb-16 scroll-reveal" style={{ transitionDelay: `${ci * 0.1}s` }}>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-2xl">{cat.icon}</span>
                <h2 className="font-display text-2xl font-bold text-white">{cat.category}</h2>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="space-y-2">
                {cat.items.map((item, ii) => {
                  const key = `${ci}-${ii}`;
                  const isOpen = openItems[key];
                  return (
                    <div
                      key={ii}
                      className={`border transition-colors duration-200 ${
                        isOpen ? "border-[#FF6B00]/40 bg-[#404040]" : "border-white/5 bg-[#333333]"
                      }`}
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between px-6 py-5 text-left"
                      >
                        <span className="font-display text-sm font-semibold text-white tracking-wide pr-8">
                          {item.q}
                        </span>
                        {isOpen ? (
                          <ChevronUp size={16} className="text-[#FF6B00] flex-shrink-0" />
                        ) : (
                          <ChevronDown size={16} className="text-[#888] flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6">
                          <div className="w-8 h-0.5 bg-[#FF6B00] mb-4" />
                          <p className="font-body text-[#888] text-sm leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Still need help CTA */}
          <div className="bg-[#404040] border border-white/5 p-10 text-center scroll-reveal">
            <h3 className="font-display text-2xl font-bold text-white mb-3">
              STILL HAVE <span className="text-[#FF6B00]">QUESTIONS?</span>
            </h3>
            <p className="font-body text-[#888] text-sm mb-8">
              Our team is ready to help. Reach out and we'll get back to you within 24 hours.
            </p>
            <Link href="/contact">
              <span className="btn-primary text-sm tracking-[0.2em]">CONTACT US</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
