/* ==========================================================================
   BUILD LEVEL — Admin: Shopify Integration Tab
   Uses REST API: /api/admin/shopify/*
   ========================================================================== */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ExternalLink, RefreshCw, Download, Package, Loader2, ShoppingBag, CheckCircle, XCircle } from "lucide-react";

const ADMIN_TOKEN_KEY = "bl_admin_token";

function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return {};
  if (token.startsWith("eyJ")) return { Authorization: `Bearer ${token}` };
  return { "x-admin-token": token };
}

async function adminFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

interface ShopifyProduct {
  id: number;
  title: string;
  vendor?: string;
  body_html?: string;
  images?: { src: string }[];
  variants?: { id: number; price: string; title?: string }[];
}

interface ShopifyOrder {
  id: number;
  name: string;
  created_at: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  currency?: string;
  line_items?: { title: string; quantity: number }[];
}

export default function ShopifyTab() {
  const [status, setStatus] = useState<{ connected: boolean; storeUrl?: string } | null>(null);
  const [storeUrl, setStoreUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState("any");

  useEffect(() => {
    adminFetch<{ connected: boolean; storeUrl?: string }>("GET", "/api/admin/shopify/status")
      .then(setStatus)
      .catch(() => setStatus({ connected: false }));
  }, []);

  useEffect(() => {
    if (!status?.connected) return;
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.connected, view, orderStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (view === "products") {
        const data = await adminFetch<{ products: ShopifyProduct[] }>("GET", "/api/admin/shopify/products");
        setProducts(data.products || []);
      } else {
        const data = await adminFetch<{ orders: ShopifyOrder[] }>("GET", `/api/admin/shopify/orders?status=${orderStatus}`);
        setOrders(data.orders || []);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!storeUrl || !apiKey) { toast.error("Store URL and API Key are required"); return; }
    setSaving(true);
    try {
      await adminFetch("POST", "/api/admin/shopify/credentials", { storeUrl, apiKey });
      toast.success("Shopify connected!");
      setStatus({ connected: true, storeUrl });
      setStoreUrl("");
      setApiKey("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save credentials");
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (product: ShopifyProduct) => {
    setImporting(product.id);
    try {
      const variant = product.variants?.[0];
      await adminFetch("POST", "/api/admin/shopify/import", {
        shopifyProductId: String(product.id),
        shopifyVariantId: variant ? String(variant.id) : "",
        name: product.title,
        description: product.body_html?.replace(/<[^>]*>/g, "") || "",
        price: parseFloat(variant?.price || "0"),
        imageUrl: product.images?.[0]?.src || "",
      });
      toast.success(`"${product.title}" imported to your store!`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(null);
    }
  };

  if (!status) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (!status.connected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-white font-bold tracking-widest text-lg">SHOPIFY</h1>
            <p className="font-body text-[#555] text-sm mt-1">Sync products and orders from your Shopify store.</p>
          </div>
          <a href="https://shopify.com/admin/apps/development" target="_blank" rel="noopener noreferrer"
            className="admin-btn-secondary flex items-center gap-1.5 text-xs">
            <ExternalLink size={11} /> Shopify Admin
          </a>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 p-6 max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={16} className="text-red-400" />
            <span className="font-display text-white text-xs tracking-widest">NOT CONNECTED</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="font-display text-[#888] text-[10px] tracking-widest block mb-1.5">STORE URL</label>
              <input
                type="text"
                value={storeUrl}
                onChange={e => setStoreUrl(e.target.value)}
                placeholder="your-store.myshopify.com"
                className="w-full bg-[#111] border border-white/10 text-white font-body text-xs px-3 py-2.5 outline-none focus:border-[#FF6B00] transition-colors"
              />
            </div>
            <div>
              <label className="font-display text-[#888] text-[10px] tracking-widest block mb-1.5">ADMIN API ACCESS TOKEN</label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="shpat_xxxxxxxxxxxxxxxx"
                  className="w-full bg-[#111] border border-white/10 text-white font-body text-xs px-3 py-2.5 pr-16 outline-none focus:border-[#FF6B00] transition-colors"
                />
                <button type="button" onClick={() => setShowKey(s => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-white text-[10px] font-display tracking-widest">
                  {showKey ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>
            <div className="bg-[#111] border border-white/5 p-3">
              <p className="font-body text-[#666] text-xs leading-relaxed">
                <strong className="text-[#888]">How to get your API token:</strong> Shopify Admin → Settings → Apps → Develop apps → Create an app → Configure Admin API scopes (read_products, read_orders) → Install app → Copy Admin API access token.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveCredentials}
                disabled={saving || !storeUrl || !apiKey}
                className="admin-btn-primary flex items-center gap-2 text-xs"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : null}
                CONNECT SHOPIFY
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-white font-bold tracking-widest text-lg">SHOPIFY</h1>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle size={14} className="text-green-400" />
            <span className="font-body text-green-400 text-sm">Connected — {status.storeUrl}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {status.storeUrl && (
            <a href={`https://${status.storeUrl.replace(/^https?:\/\//, "")}/admin`} target="_blank" rel="noopener noreferrer"
              className="admin-btn-secondary flex items-center gap-1.5 text-xs">
              <ExternalLink size={11} /> Open Admin
            </a>
          )}
          <button onClick={() => setStatus({ connected: false })}
            className="admin-btn-danger text-xs px-3 py-1.5">
            DISCONNECT
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-0 border-b border-white/10 mb-6">
        {[{ id: "products", label: "PRODUCTS" }, { id: "orders", label: "ORDERS" }].map(({ id, label }) => (
          <button key={id} onClick={() => setView(id as "products" | "orders")}
            className={`px-5 py-3 font-display text-xs font-bold tracking-widest border-b-2 transition-colors ${
              view === id ? "border-[#FF6B00] text-white" : "border-transparent text-[#555] hover:text-[#888]"
            }`}>
            {label}
          </button>
        ))}
        <button onClick={loadData} disabled={loading}
          className="ml-auto admin-btn-secondary flex items-center gap-1.5 text-xs mb-1">
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#FF6B00]" />
        </div>
      ) : view === "products" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <Package size={40} className="text-[#333] mx-auto mb-3" />
              <p className="font-body text-[#555] text-sm">No active products found</p>
            </div>
          )}
          {products.map(p => (
            <div key={p.id} className="bg-[#1A1A1A] border border-white/10 overflow-hidden">
              {p.images?.[0]?.src ? (
                <img src={p.images[0].src} alt={p.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-[#222] flex items-center justify-center">
                  <ShoppingBag size={32} className="text-[#333]" />
                </div>
              )}
              <div className="p-4">
                <p className="font-display text-white text-xs font-bold tracking-wider mb-1 line-clamp-2">{p.title}</p>
                {p.vendor && <p className="font-body text-[#555] text-xs mb-1">{p.vendor}</p>}
                {p.variants?.[0] && (
                  <p className="font-body text-[#888] text-xs mb-3">From ${parseFloat(p.variants[0].price).toFixed(2)}</p>
                )}
                <button
                  onClick={() => handleImport(p)}
                  disabled={importing === p.id}
                  className="w-full admin-btn-primary flex items-center gap-1.5 text-xs justify-center"
                >
                  {importing === p.id ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
                  IMPORT TO STORE
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <label className="font-display text-[#888] text-[10px] tracking-widest">STATUS:</label>
            <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)}
              className="bg-[#1A1A1A] border border-white/10 text-white font-body text-xs px-3 py-1.5 outline-none">
              <option value="any">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="space-y-3">
            {orders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag size={40} className="text-[#333] mx-auto mb-3" />
                <p className="font-body text-[#555] text-sm">No orders found</p>
              </div>
            )}
            {orders.map(o => (
              <div key={o.id} className="bg-[#1A1A1A] border border-white/10 p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-display text-white text-xs font-bold tracking-wider">{o.name}</p>
                    <span className={`px-2 py-0.5 font-display text-[10px] tracking-widest ${
                      o.financial_status === "paid" ? "bg-green-500/10 text-green-400" :
                      o.financial_status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                      "bg-white/5 text-[#555]"
                    }`}>
                      {o.financial_status?.toUpperCase()}
                    </span>
                    {o.fulfillment_status && (
                      <span className="px-2 py-0.5 font-display text-[10px] tracking-widest bg-blue-500/10 text-blue-400">
                        {o.fulfillment_status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-[#555] text-xs mt-1">
                    {o.line_items?.map(li => `${li.quantity}x ${li.title}`).join(", ") || "—"}
                  </p>
                  <p className="font-body text-[#555] text-[10px] mt-0.5">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display text-white text-sm font-bold">${parseFloat(o.total_price).toFixed(2)} {o.currency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
