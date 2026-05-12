/* ==========================================================================
   BUILD LEVEL — Shop Page
   Design: Dark Luxury Editorial — product grid with category filters,
   size selection, add to cart with CartContext integration
   ========================================================================== */

import { useState, useEffect } from "react";
import { Star, Filter, ShoppingBag, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const PRODUCT_HOODIE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663635005932/FqJozxCqZQ4nbgjqXYB8qi/product_hoodie-mooq7Qw4za8hLYwwYeQdR6.webp";
const PRODUCT_TSHIRT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663635005932/FqJozxCqZQ4nbgjqXYB8qi/product_tshirt-ZUmrE26ymPLdjN4UWhFo7C.webp";

const FALLBACK_PRODUCTS = [
  { id: 1, name: "Build Level Core Hoodie", category: "hoodies", price: 89, imageUrl: PRODUCT_HOODIE, badge: "BEST SELLER", sizes: ["S","M","L","XL","XXL"], inStock: true, featured: true, compareAtPrice: null },
  { id: 2, name: "Execute Daily Tee", category: "t-shirts", price: 45, imageUrl: PRODUCT_TSHIRT, badge: "NEW DROP", sizes: ["S","M","L","XL","XXL"], inStock: true, featured: false, compareAtPrice: null },
  { id: 3, name: "Discipline Heavyweight Hoodie", category: "hoodies", price: 95, imageUrl: PRODUCT_HOODIE, badge: "LIMITED", sizes: ["S","M","L","XL","XXL"], inStock: true, featured: true, compareAtPrice: null },
  { id: 4, name: "Built Different Tee", category: "t-shirts", price: 42, imageUrl: PRODUCT_TSHIRT, badge: null, sizes: ["S","M","L","XL","XXL"], inStock: true, featured: false, compareAtPrice: null },
  { id: 5, name: "Focus Snapback Hat", category: "hats", price: 38, imageUrl: PRODUCT_TSHIRT, badge: null, sizes: ["S","M","L","XL","XXL"], inStock: true, featured: false, compareAtPrice: null },
  { id: 6, name: "Lock In Trucker Cap", category: "hats", price: 35, imageUrl: PRODUCT_TSHIRT, badge: "NEW DROP", sizes: ["S","M","L","XL","XXL"], inStock: true, featured: false, compareAtPrice: null },
  { id: 7, name: "Execute Wristband Set", category: "accessories", price: 18, imageUrl: PRODUCT_HOODIE, badge: null, sizes: ["One Size"], inStock: true, featured: false, compareAtPrice: null },
  { id: 8, name: "Build Level Tote Bag", category: "accessories", price: 28, imageUrl: PRODUCT_HOODIE, badge: null, sizes: ["One Size"], inStock: true, featured: false, compareAtPrice: null },
];

const categories = ["All", "Hoodies", "T-Shirts", "Hats", "Accessories"];
const SIZES = ["S", "M", "L", "XL", "XXL"];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});
  const { addItem, convertPrice, openCart } = useCart();

  const { data: dbProducts, isLoading: productsLoading } = trpc.products.list.useQuery({});

  // Use DB products if available, otherwise fall back to hardcoded
  const allProducts = (dbProducts && dbProducts.length > 0) ? dbProducts : FALLBACK_PRODUCTS;

  const filtered = activeCategory === "All"
    ? allProducts
    : allProducts.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());

  const handleSizeSelect = (productId: number, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: typeof allProducts[0]) => {
    const productSizes = (product.sizes as string[]) || SIZES;
    const size = selectedSizes[product.id] || productSizes[0] || "M";
    addItem({
      id: product.id,
      name: product.name,
      category: product.category,
      priceUSD: product.price,
      image: product.imageUrl || "",
      size,
    });
    toast.success(`${product.name} (${size}) added to cart`, {
      description: "View your cart to checkout",
      action: { label: "View Cart", onClick: openCart },
    });
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
                {product.badge && (
                  <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-[#FF6B00]">
                    <span className="font-display text-[10px] tracking-widest text-white">
                      {product.badge}
                    </span>
                  </div>
                )}
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={product.imageUrl || ""}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="product-overlay">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn-primary text-xs px-6 py-3 flex items-center gap-2"
                  >
                    <ShoppingBag size={12} />
                    ADD TO CART
                  </button>
                </div>
                <div className="p-4">
                  <p className="font-display text-[10px] tracking-widest text-[#888] mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-display text-sm font-semibold text-white mb-2">
                    {product.name}
                  </h3>
                  {/* Size selector */}
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {((product.sizes as string[]) || SIZES).map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(product.id, size)}
                        className={`w-7 h-7 border font-display text-[9px] transition-all ${
                          selectedSizes[product.id] === size
                            ? "border-[#FF6B00] text-[#FF6B00]"
                            : "border-white/15 text-[#666] hover:border-[#FF6B00] hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base font-bold text-[#FF6B00]">
                      {convertPrice(product.price)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={10} fill="#FF6B00" stroke="none" />
                      <span className="text-[#888] text-xs">4.9</span>
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
