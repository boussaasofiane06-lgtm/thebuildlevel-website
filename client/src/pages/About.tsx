/* ==========================================================================
   BUILD LEVEL — About Page
   Design: Dark Luxury Editorial — brand story, mission pillars, manifesto
   ========================================================================== */

import { useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MISSION_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663635005932/FqJozxCqZQ4nbgjqXYB8qi/mission_bg-i2sEsXdD6nFhU7BzWs9sQC.webp";
const LIFESTYLE_BANNER = "https://d2xsxph8kpxj0f.cloudfront.net/310519663635005932/FqJozxCqZQ4nbgjqXYB8qi/lifestyle_banner-Buij7hEhHVXY6sLzydu3i4.webp";

export default function About() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#2A2A2A]">
      <Navbar />

      {/* Hero */}
      <div
        className="relative pt-32 pb-40 overflow-hidden"
        style={{
          backgroundImage: `url(${LIFESTYLE_BANNER})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10">
          <p className="section-label animate-fade-up">Our Story</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight animate-fade-up-delay-1">
            BUILT FOR<br /><span className="text-[#FF6B00]">BUILDERS.</span>
          </h1>
        </div>
      </div>

      {/* Brand Story */}
      <section className="py-24 bg-[#2A2A2A]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="scroll-reveal">
              <p className="section-label">The Origin</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-8">
                WHERE IT<br /><span className="text-[#FF6B00]">STARTED.</span>
              </h2>
              <div className="w-12 h-0.5 bg-[#FF6B00] mb-8" />
              <p className="font-body text-[#B0B0A8] text-base leading-relaxed mb-6">
                BUILD LEVEL was created for people obsessed with growth, discipline, and execution. Not for the ones who talk about it — for the ones who live it every single day.
              </p>
              <p className="font-body text-[#888] text-base leading-relaxed mb-6">
                We built this brand from the ground up, the same way our community builds themselves — one rep, one decision, one day at a time. Every piece we create carries that same energy.
              </p>
              <p className="font-body text-[#888] text-base leading-relaxed">
                BUILD LEVEL isn't just clothing. It's a signal. A reminder that you chose the harder path — and you're still showing up.
              </p>
            </div>
            <div className="scroll-reveal">
              <div
                className="aspect-[4/5] overflow-hidden"
                style={{
                  backgroundImage: `url(${MISSION_BG})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Pillars */}
      <section className="py-24 bg-[#333333]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-16 scroll-reveal">
            <p className="section-label">The Foundation</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
              THREE <span className="text-[#FF6B00]">PILLARS</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
            {[
              {
                number: "01",
                title: "Discipline",
                text: "The foundation of everything. Discipline is what separates those who wish from those who achieve. It's not motivation — it's a decision made every single day.",
              },
              {
                number: "02",
                title: "Focus",
                text: "In a world built for distraction, focus is a superpower. We build for people who know what they want and cut out everything that doesn't serve that vision.",
              },
              {
                number: "03",
                title: "Execution",
                text: "Ideas are worthless without action. Execution is the only currency that matters. BUILD LEVEL is for those who put in the work when nobody is watching.",
              },
            ].map((pillar, i) => (
              <div
                key={i}
                className="bg-[#333333] p-10 scroll-reveal"
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                <div className="font-display text-5xl font-bold text-[#FF6B00] mb-4">{pillar.number}</div>
                <h3 className="font-display text-2xl font-bold text-white mb-4">{pillar.title}</h3>
                <div className="w-8 h-0.5 bg-[#FF6B00] mb-6" />
                <p className="font-body text-[#888] text-sm leading-relaxed">{pillar.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-24 bg-[#2A2A2A]">
        <div className="max-w-[800px] mx-auto px-6 lg:px-10 text-center scroll-reveal">
          <p className="section-label">The Manifesto</p>
          <blockquote className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-8">
            "We don't make excuses. We make progress. We don't wait for the right moment. We <span className="text-[#FF6B00]">create it.</span>"
          </blockquote>
          <div className="w-16 h-0.5 bg-[#FF6B00] mx-auto mb-8" />
          <p className="font-body text-[#888] text-base leading-relaxed">
            Every product we release is designed with intention. The weight of the fabric, the cut of the garment, the message it carries — all of it is deliberate. Because the people who wear BUILD LEVEL are deliberate.
          </p>
          <div className="mt-12">
            <Link href="/shop">
              <span className="btn-primary text-sm tracking-[0.2em]">SHOP THE COLLECTION</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
