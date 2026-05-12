/* ==========================================================================
   BUILD LEVEL — Contact Page
   Design: Dark Luxury Editorial — email form, social links
   ========================================================================== */

import { useState, useEffect } from "react";
import { Instagram, Mail, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const contactNotify = trpc.notifications.contactForm.useMutation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    contactNotify.mutate({
      name: form.name,
      email: form.email,
      message: `Subject: ${form.subject}\n\n${form.message}`,
    });
  };

  const inputClass = "w-full bg-[#404040] border border-white/10 text-white placeholder-[#555] px-5 py-4 font-body text-sm outline-none focus:border-[#FF6B00] transition-colors";

  return (
    <div className="min-h-screen bg-[#2A2A2A]">
      <Navbar />

      {/* Page Header */}
      <div className="pt-32 pb-16 bg-[#333333] border-b border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <p className="section-label">Get In Touch</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white">
            CONTACT <span className="text-[#FF6B00]">US</span>
          </h1>
          <p className="font-body text-[#888] mt-4 text-sm max-w-[400px]">
            Questions about orders, sizing, or just want to connect? We're here.
          </p>
        </div>
      </div>

      <section className="py-24">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="scroll-reveal">
              <h2 className="font-display text-2xl font-bold text-white mb-8">
                SEND A <span className="text-[#FF6B00]">MESSAGE</span>
              </h2>
              {submitted ? (
                <div className="bg-[#404040] border border-[#FF6B00]/30 p-10 text-center">
                  <div className="font-display text-2xl font-bold text-white mb-3">MESSAGE RECEIVED.</div>
                  <p className="font-body text-[#888] text-sm">We'll get back to you within 24–48 hours. Stay disciplined.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="YOUR NAME"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className={inputClass}
                    style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.1em", fontSize: "11px" }}
                  />
                  <input
                    type="email"
                    placeholder="YOUR EMAIL"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className={inputClass}
                    style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.1em", fontSize: "11px" }}
                  />
                  <input
                    type="text"
                    placeholder="SUBJECT"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                    className={inputClass}
                    style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.1em", fontSize: "11px" }}
                  />
                  <textarea
                    placeholder="YOUR MESSAGE"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={6}
                    className={`${inputClass} resize-none`}
                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", letterSpacing: "0" }}
                  />
                  <button type="submit" className="btn-primary w-full text-sm tracking-[0.2em] flex items-center justify-center gap-3">
                    SEND MESSAGE <Send size={14} />
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="scroll-reveal space-y-10">
              <div>
                <h2 className="font-display text-2xl font-bold text-white mb-8">
                  CONNECT <span className="text-[#FF6B00]">WITH US</span>
                </h2>
                <div className="space-y-6">
                  <a
                    href="mailto:info@buildlevel.com"
                    className="flex items-start gap-5 group"
                  >
                    <div className="w-12 h-12 bg-[#404040] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#FF6B00] transition-colors">
                      <Mail size={18} className="text-[#FF6B00]" />
                    </div>
                    <div>
                      <p className="font-display text-xs tracking-widest text-[#888] mb-1">Email</p>
                      <p className="font-body text-white text-sm group-hover:text-[#FF6B00] transition-colors">info@buildlevel.com</p>
                    </div>
                  </a>

                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-5 group"
                  >
                    <div className="w-12 h-12 bg-[#404040] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#FF6B00] transition-colors">
                      <Instagram size={18} className="text-[#FF6B00]" />
                    </div>
                    <div>
                      <p className="font-display text-xs tracking-widest text-[#888] mb-1">Instagram</p>
                      <p className="font-body text-white text-sm group-hover:text-[#FF6B00] transition-colors">@buildlevel</p>
                    </div>
                  </a>

                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-5 group"
                  >
                    <div className="w-12 h-12 bg-[#404040] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#FF6B00] transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF6B00">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-display text-xs tracking-widest text-[#888] mb-1">TikTok</p>
                      <p className="font-body text-white text-sm group-hover:text-[#FF6B00] transition-colors">@buildlevel</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="bg-[#404040] border border-white/5 p-8">
                <h3 className="font-display text-sm tracking-widest text-[#FF6B00] mb-4">RESPONSE TIME</h3>
                <p className="font-body text-[#888] text-sm leading-relaxed">
                  We typically respond to all inquiries within 24–48 business hours. For order-related questions, please have your order number ready.
                </p>
              </div>

              <div className="bg-[#FF6B00] p-8">
                <h3 className="font-display text-xl font-bold text-white mb-3">EXECUTE DAILY.</h3>
                <p className="font-body text-white/80 text-sm leading-relaxed">
                  Join the movement. Follow us on social media for daily motivation, exclusive drops, and community content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
