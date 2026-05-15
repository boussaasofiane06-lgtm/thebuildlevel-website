import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Download, Lock, Star, Headphones, BookOpen, Play, Pause, Volume2 } from "lucide-react";

const CATEGORIES = ["All", "Guide", "Audiobook", "Workout", "Nutrition", "Mindset"];

// Static fallback products — always visible even without server
const STATIC_PRODUCTS = [
  {
    id: 1,
    name: "DISCIPLINE MINDSET — The BUILD LEVEL Guide",
    description: "A fully-loaded 13-page guide to building unbreakable mental strength. Covers 7 chapters: What Discipline Really Means, The Architecture of Your Mind, The Five Pillars of Mental Discipline, Daily Protocols, Handling Failure, Advanced Mental Training, and The BUILD LEVEL Code. This is not motivation. This is a system.",
    price: 19.99,
    category: "mindset",
    productType: "pdf" as const,
    badge: "NEW",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663635005932/ZpCxvttgRWUJYjQSvWcg6k/discipline-mindset-cover-4tL8ikv8VjQQa3vbGynnuC.webp",
    fileUrl: "/manus-storage/BUILD_LEVEL_Discipline_Mindset_4f45f459.pdf",
    fileName: "BUILD_LEVEL_Discipline_Mindset.pdf",
    audioUrl: null as string | null,
    duration: null as string | null,
    published: true,
  },
];

// Audio Player component for audiobooks
function AudioPlayer({ audioUrl, title }: { audioUrl: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const [audio] = useState(() => new Audio(audioUrl));

  const toggle = () => {
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => toast.error("Could not play audio. Try downloading instead."));
      setPlaying(true);
    }
  };

  audio.onended = () => setPlaying(false);

  return (
    <div className="bg-[#1A1A1A] border border-[#FF6B00]/30 p-4 flex items-center gap-4 mt-3">
      <button
        onClick={toggle}
        className="w-10 h-10 bg-[#FF6B00] flex items-center justify-center flex-shrink-0 hover:bg-[#e55e00] transition-colors"
      >
        {playing ? <Pause size={16} className="text-black" /> : <Play size={16} className="text-black" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-display text-white text-xs tracking-wide truncate">{title}</p>
        <div className="flex items-center gap-1 mt-1">
          <Volume2 size={10} className="text-[#FF6B00]" />
          <span className="font-body text-[#555] text-[10px]">Preview available</span>
        </div>
      </div>
    </div>
  );
}

export default function Digital() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [checkoutEmail, setCheckoutEmail] = useState<Record<number, string>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const { data: serverProducts, isLoading } = trpc.digital.list.useQuery(undefined, {
    retry: false,
    staleTime: 30_000,
  });
  // Use server products if available, otherwise fall back to static list
  const products = serverProducts && serverProducts.length > 0 ? serverProducts : (isLoading ? [] : STATIC_PRODUCTS);
  const createCheckout = trpc.digital.createCheckout.useMutation();

  const filtered = activeCategory === "All"
    ? products
    : products.filter(p =>
        activeCategory === "Audiobook"
          ? (p as any).productType === "audiobook"
          : p.category === activeCategory.toLowerCase()
      );

  const handleBuy = async (productId: number) => {
    const email = checkoutEmail[productId];
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoadingId(productId);
    try {
      const result = await createCheckout.mutateAsync({ productId, customerEmail: email });
      if (result.url) {
        toast.success("Redirecting to checkout...");
        window.open(result.url, "_blank");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <p className="font-display text-[#FF6B00] text-xs tracking-[0.3em] mb-4">INSTANT DOWNLOAD</p>
          <h1 className="font-display text-5xl md:text-7xl font-black text-white tracking-tight leading-none mb-6">
            DIGITAL<br />
            <span className="text-[#FF6B00]">PRODUCTS</span>
          </h1>
          <p className="font-body text-[#888] text-lg max-w-xl">
            Guides, audiobooks, and tools to help you build your level. Buy once, access instantly.
          </p>
          {/* Type icons */}
          <div className="flex gap-6 mt-8">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-[#FF6B00]" />
              <span className="font-display text-[#888] text-xs tracking-widest">PDF GUIDES</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones size={16} className="text-[#FF6B00]" />
              <span className="font-display text-[#888] text-xs tracking-widest">AUDIOBOOKS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4 border-b border-white/10 sticky top-0 bg-[#0A0A0A] z-10">
        <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 font-display text-xs tracking-widest px-4 py-2 border transition-all ${
                activeCategory === cat
                  ? "bg-[#FF6B00] text-black border-[#FF6B00]"
                  : "bg-transparent text-[#888] border-white/20 hover:border-[#FF6B00] hover:text-white"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#1A1A1A] animate-pulse h-96" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Download size={48} className="text-[#333] mx-auto mb-4" />
              <p className="font-display text-[#333] text-4xl font-black tracking-widest mb-4">COMING SOON</p>
              <p className="font-body text-[#555] text-sm">Digital products are being prepared. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => {
                const isAudiobook = (product as any).productType === "audiobook";
                const audioUrl = (product as any).audioUrl as string | null;
                const duration = (product as any).duration as string | null;
                return (
                  <div key={product.id} className="bg-[#111] border border-white/10 hover:border-[#FF6B00]/30 transition-all duration-300 overflow-hidden flex flex-col">
                    {/* Image */}
                    {product.imageUrl ? (
                      <div className="aspect-video overflow-hidden relative">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        {/* Type badge */}
                        <div className="absolute top-3 right-3 bg-black/70 flex items-center gap-1 px-2 py-1">
                          {isAudiobook
                            ? <><Headphones size={10} className="text-[#FF6B00]" /><span className="font-display text-[#FF6B00] text-[9px] tracking-widest">AUDIO</span></>
                            : <><BookOpen size={10} className="text-[#FF6B00]" /><span className="font-display text-[#FF6B00] text-[9px] tracking-widest">PDF</span></>
                          }
                        </div>
                        {product.badge && (
                          <span className="absolute top-3 left-3 bg-[#FF6B00] text-black font-display text-[10px] tracking-widest px-2 py-1">
                            {product.badge.toUpperCase()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-[#1A1A1A] flex items-center justify-center relative">
                        {isAudiobook ? <Headphones size={32} className="text-[#333]" /> : <Download size={32} className="text-[#333]" />}
                        {product.badge && (
                          <span className="absolute top-3 left-3 bg-[#FF6B00] text-black font-display text-[10px] tracking-widest px-2 py-1">
                            {product.badge.toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Info */}
                    <div className="p-5 flex flex-col flex-1">
                      <span className="font-display text-[#FF6B00] text-[10px] tracking-widest uppercase">{product.category}</span>
                      <h2 className="font-display text-white font-bold text-lg tracking-wide mt-1 mb-2">{product.name}</h2>
                      {product.description && (
                        <p className="font-body text-[#666] text-sm mb-3 flex-1 line-clamp-3">{product.description}</p>
                      )}

                      {/* Audio preview player for audiobooks */}
                      {isAudiobook && audioUrl && (
                        <AudioPlayer audioUrl={audioUrl} title={product.name} />
                      )}

                      {/* Duration for audiobooks */}
                      {isAudiobook && duration && (
                        <div className="flex items-center gap-1 mt-2 mb-2">
                          <Headphones size={11} className="text-[#555]" />
                          <span className="font-body text-[#555] text-xs">{duration}</span>
                        </div>
                      )}

                      {/* Price + type badge */}
                      <div className="flex items-center justify-between mb-4 mt-3">
                        <span className="font-display text-white font-bold text-2xl">
                          ${Number(product.price).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1 text-[#555]">
                          {isAudiobook
                            ? <><Headphones size={12} /><span className="font-body text-xs">Stream + Download</span></>
                            : <><Download size={12} /><span className="font-body text-xs">Instant download</span></>
                          }
                        </div>
                      </div>

                      {/* Email + Buy */}
                      <div className="flex flex-col gap-2">
                        <input
                          type="email"
                          placeholder="Your email for access link"
                          value={checkoutEmail[product.id] || ""}
                          onChange={e => setCheckoutEmail(prev => ({ ...prev, [product.id]: e.target.value }))}
                          className="w-full bg-[#1A1A1A] border border-white/10 text-white font-body text-xs px-3 py-2.5 outline-none focus:border-[#FF6B00] transition-colors placeholder:text-[#444]"
                        />
                        <button
                          onClick={() => handleBuy(product.id)}
                          disabled={loadingId === product.id}
                          className="w-full bg-[#FF6B00] text-black font-display text-xs tracking-widest py-3 hover:bg-[#e55e00] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Lock size={12} />
                          {loadingId === product.id ? "REDIRECTING..." : isAudiobook ? "BUY NOW — STREAM + DOWNLOAD" : "BUY NOW — INSTANT ACCESS"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Trust section */}
      <section className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { icon: <Lock size={20} />, title: "SECURE PAYMENT", desc: "Powered by Stripe. Your payment info is never stored." },
            { icon: <Headphones size={20} />, title: "STREAM + DOWNLOAD", desc: "Listen online or download to your device. Yours forever." },
            { icon: <Star size={20} />, title: "QUALITY CONTENT", desc: "Built by people who live the BUILD LEVEL mindset." },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-3">
              <div className="text-[#FF6B00]">{item.icon}</div>
              <p className="font-display text-white text-xs tracking-widest font-bold">{item.title}</p>
              <p className="font-body text-[#555] text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
