/* ==========================================================================
   BUILD LEVEL — Shop Page
   Design: Dark Luxury Editorial — product grid with category filters,
   hover effects, size selection, add to cart
   ========================================================================== */

import { useState, useEffect } from "react";
import { Star, Filter, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PRODUCT_HOODIE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663635005932/FqJozxCqZQ4nbgjqXYB8qi/product_hoodie-mooq7Qw4za8hLYwwYeQdR6.webp";
const PRODUCT_TSHIRT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663635005932/FqJozxCqZQ4nbgjqXYB8qi/product_tshirt-ZUmrE26ymPLdjN4UWhFo7C.webp";

const allProducts = [
  { id: 1, name: "Build Level Core Hoodie", category: "Hoodies", price: "$89", image: PRODUCT_HOODIE, tag: "BEST SELLER", tagColor: "#FF6B00", reviews: 4.9, reviewCount: 214 },
  { id: 2, name: "Execute Daily Tee", category: "T-Shirts", price: "$45", image: PRODUCT_TSHIRT, tag: "NEW DROP", tagColor: "#FF6B00", reviews: 4.8, reviewCount: 98 },
  { id: 3, name: "Discipline Heavyweight Hoodie", category: "Hoodies", price: "$95", image: PRODUCT_HOODIE, tag: "LIMITED", tagColor: "#FF6B00", reviews: 5.0, reviewCount: 67 },
  { id: 4, name: "Built Different Tee", category: "T-Shirts", price: "$42", image: PRODUCT_TSHIRT, tag: null, tagColor: "", reviews: 4.7, reviewCount: 143 },
  { id: 5, name: "Focus Snapback Hat", category: "Hats", price: "$38", image: PRODUCT_TSHIRT, tag: null, tagColor: "", reviews: 4.6, reviewCount: 55 },
  { id: 6, name: "Lock In Trucker Cap", category: "Hats", price: "$35", image: PRODUCT_TSHIRT, tag: "NEW DROP", tagColor: "#FF6B00", reviews: 4.8, reviewCount: 32 },
  { id: 7, name: "Execute Wristband Set", category: "Accessories", price: "$18", image: PRODUCT_HOODIE, tag: null, tagColor: "", reviews: 4.9, reviewCount: 189 },
  { id: 8, name: "Build Level Tote Bag", category: "Accessories", price: "$28", image: PRODUCT_HOODIE, tag: null, tagColor: "", reviews: 4.7, reviewCount: 76 },
];

const categories = ["All", "Hoodies", "T-Shirts", "Hats", "Accessories"];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const [addedId, setAddedId] = useState<number | null>(null);

  const filtered = activeCategory === "All"
    ? allProducts
    : allProducts.filter((p) => p.category === activeCategory);

  const handleAddToCart = (id: number) => {
    setCartCount((c) => c + 1);
    setAddedId(id);
    setTimeout(() => setAddedId(null), 1500);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filtered]);

  return (
    <div className="min-h-screen bg-[#2A2A2A]">
      <Navbar />

      {/* Page Header */}
      <div className="pt-32 pb-16 bg-[#333333] border-b border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <p className="section-label">Build Level</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white">
            THE <span className="text-[#FF6B00]">SHOP</span>
          </h1>
          <p className="font-body text-[#888] mt-4 text-sm">
            Premium gear for those who execute daily.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-16 z-30 bg-[#2A2A2A]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-4 flex items-center gap-6 overflow-x-auto">
          <Filter size={14} className="text-[#888] flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-display text-xs tracking-[0.2em] whitespace-nowrap transition-colors pb-1 ${
                activeCategory === cat
                  ? "text-[#FF6B00] border-b-2 border-[#FF6B00]"
                  : "text-[#888] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
          {cartCount > 0 && (
            <div className="ml-auto flex-shrink-0 flex items-center gap-2 bg-[#FF6B00] px-4 py-2">
              <span className="font-display text-xs tracking-widest text-white">
                CART ({cartCount})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product, i) => (
              <div
                key={product.id}
                className="product-card scroll-reveal"
                style={{ transitionDelay: `${i * 0.05}s` }}
              >
                {product.tag && (
                  <div
                    className="absolute top-3 left-3 z-10 px-3 py-1"
                    style={{ backgroundColor: product.tagColor }}
                  >
                    <span className="font-display text-[10px] tracking-widest text-white">
                      {product.tag}
                    </span>
                  </div>
                )}
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="product-overlay">
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="btn-primary text-xs px-6 py-3"
                  >
                    {addedId === product.id ? "ADDED!" : "ADD TO CART"}
                  </button>
                </div>
                <div className="p-4">
                  <p className="font-display text-[10px] tracking-widest text-[#888] mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-display text-sm font-semibold text-white mb-2">
                    {product.name}
                  </h3>
                  <div className="flex gap-1 mb-3">
                    {["S", "M", "L", "XL"].map((size) => (
                      <button
                        key={size}
                        className="w-7 h-7 border border-white/15 font-display text-[9px] text-[#666] hover:border-[#FF6B00] hover:text-white transition-all"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base font-bold text-[#FF6B00]">
                      {product.price}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={10} fill="#FF6B00" stroke="none" />
                      <span className="text-[#888] text-xs">{product.reviews}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
