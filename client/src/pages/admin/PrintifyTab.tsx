/* ==========================================================================
   BUILD LEVEL — Admin: Printify Integration Tab
   Uses REST API: /api/admin/printify/*
   ========================================================================== */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ExternalLink, RefreshCw, Download, Package, Loader2, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle } from "lucide-react";

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

interface PrintifyProduct {
  id: string;
  title: string;
  description?: string;
  images?: { src: string }[];
  variants?: { price: number; title?: string }[];
}

interface PrintifyOrder {
  id: string;
  status: string;
  created_at: string;
  total_price?: number;
  line_items?: { title: string; quantity: number }[];
}

export default function PrintifyTab() {
  const [status, setStatus] = useState<{ connected: boolean; shopId?: string } | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [shopId, setShopId] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<PrintifyProduct[]>([]);
  const [orders, setOrders] = useState<PrintifyOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    adminFetch<{ connected: boolean; shopId?: string }>("GET", "/api/admin/printify/status")
      .then(setStatus)
      .catch(() => setStatus({ connected: false }));
  }, []);

  useEffect(() => {
    if (!status?.connected) return;
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.connected, view, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (view === "products") {
        const data = await adminFetch<{ data: PrintifyProduct[] }>("GET", `/api/admin/printify/products?page=${page}`);
        setProducts(data.data || []);
      } else {
        const data = await adminFetch<{ data: PrintifyOrder[] }>("GET", `/api/admin/printify/orders?page=${page}`);
        setOrders(data.data || []);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!apiKey || !shopId) { toast.error("API Key and Shop ID are required"); return; }
    setSaving(true);
    try {
      await adminFetch("POST", "/api/admin/printify/credentials", { apiKey, shopId });
      toast.success("Printify connected!");
      setStatus({ connected: true, shopId });
      setApiKey("");
      setShopId("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save credentials");
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (product: PrintifyProduct) => {
    setImporting(product.id);
    try {
      const price = product.variants?.[0]?.price ? product.variants[0].price / 100 : 0;
      await adminFetch("POST", "/api/admin/printify/import", {
        printifyProductId: product.id,
        name: product.title,
        description: product.description || "",
        price,
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
            <h1 className="font-display text-white font-bold tracking-widest text-lg">PRINTIFY</h1>
            <p className="font-body text-[#555] text-sm mt-1">Print-on-demand fulfillment — sync products and manage orders.</p>
          </div>
          <a href="https://printify.com/app/account/api" target="_blank" rel="noopener noreferrer"
            className="admin-btn-secondary flex items-center gap-1.5 text-xs">
            <ExternalLink size={11} /> Printify Dashboard
          </a>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 p-6 max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={16} className="text-red-400" />
            <span className="font-display text-white text-xs tracking-widest">NOT CONNECTED</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="font-display text-[#888] text-[10px] tracking-widest block mb-1.5">API KEY</label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Paste your Printify API key"
                  className="w-full bg-[#111] border border-white/10 text-white font-body text-xs px-3 py-2.5 pr-16 outline-none focus:border-[#FF6B00] transition-colors"
                />
                <button type="button" onClick={() => setShowKey(s => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-white text-[10px] font-display tracking-widest">
                  {showKey ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>
            <div>
              <label className="font-display text-[#888] text-[10px] tracking-widest block mb-1.5">SHOP ID</label>
              <input
                type="text"
                value={shopId}
                onChange={e => setShopId(e.target.value)}
                placeholder="Your Printify Shop ID"
                className="w-full bg-[#111] border border-white/10 text-white font-body text-xs px-3 py-2.5 outline-none focus:border-[#FF6B00] transition-colors"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveCredentials}
                disabled={saving || !apiKey || !shopId}
                className="admin-btn-primary flex items-center gap-2 text-xs"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : null}
                CONNECT PRINTIFY
              </button>
              <p className="font-body text-[#555] text-xs">
                Get your API key from{" "}
                <a href="https://printify.com/app/account/api" target="_blank" rel="noopener noreferrer" className="text-[#FF6B00] hover:underline">
                  printify.com
                </a>
              </p>
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
          <h1 className="font-display text-white font-bold tracking-widest text-lg">PRINTIFY</h1>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle size={14} className="text-green-400" />
            <span className="font-body text-green-400 text-sm">Connected — Shop {status.shopId}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://printify.com/app/account/api" target="_blank" rel="noopener noreferrer"
            className="admin-btn-secondary flex items-center gap-1.5 text-xs">
            <ExternalLink size={11} /> Dashboard
          </a>
          <button onClick={() => setStatus({ connected: false })}
            className="admin-btn-danger text-xs px-3 py-1.5">
            DISCONNECT
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-0 border-b border-white/10 mb-6">
        {[{ id: "products", label: "PRODUCTS" }, { id: "orders", label: "ORDERS" }].map(({ id, label }) => (
          <button key={id} onClick={() => { setView(id as "products" | "orders"); setPage(1); }}
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
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {products.map(p => (
              <div key={p.id} className="bg-[#1A1A1A] border border-white/10 overflow-hidden">
                {p.images?.[0]?.src ? (
                  <img src={p.images[0].src} alt={p.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-[#222] flex items-center justify-center">
                    <Package size={32} className="text-[#333]" />
                  </div>
                )}
                <div className="p-4">
                  <p className="font-display text-white text-xs font-bold tracking-wider mb-1 line-clamp-2">{p.title}</p>
                  <p className="font-body text-[#555] text-xs mb-1">{p.variants?.length || 0} variants</p>
                  {p.variants?.[0] && (
                    <p className="font-body text-[#888] text-xs mb-3">From ${(p.variants[0].price / 100).toFixed(2)}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleImport(p)}
                      disabled={importing === p.id}
                      className="admin-btn-primary flex items-center gap-1.5 text-xs flex-1 justify-center"
                    >
                      {importing === p.id ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
                      IMPORT
                    </button>
                    <a href={`https://printify.com/app/products/${p.id}`} target="_blank" rel="noopener noreferrer"
                      className="admin-btn-secondary flex items-center gap-1.5 text-xs px-3">
                      <Eye size={11} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {products.length === 0 && (
            <div className="text-center py-12">
              <Package size={40} className="text-[#333] mx-auto mb-3" />
              <p className="font-body text-[#555] text-sm">No products found in your Printify shop.</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="admin-btn-secondary flex items-center gap-1 text-xs px-3 disabled:opacity-40">
              <ChevronLeft size={12} /> Prev
            </button>
            <span className="font-display text-[#555] text-xs">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={products.length < 20}
              className="admin-btn-secondary flex items-center gap-1 text-xs px-3 disabled:opacity-40">
              Next <ChevronRight size={12} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="bg-[#1A1A1A] border border-white/10 p-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-white text-xs font-bold tracking-wider">#{String(o.id).slice(-8).toUpperCase()}</p>
                <p className="font-body text-[#555] text-xs mt-1">
                  {o.line_items?.map((li) => `${li.quantity}x ${li.title}`).join(", ") || "—"}
                </p>
                <p className="font-body text-[#555] text-[10px] mt-0.5">{new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {o.total_price != null && (
                  <p className="font-display text-white text-sm font-bold">${(o.total_price / 100).toFixed(2)}</p>
                )}
                <span className={`inline-block mt-1 px-2 py-0.5 font-display text-[10px] tracking-widest ${
                  o.status === "fulfilled" ? "bg-green-500/10 text-green-400" :
                  o.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-white/5 text-[#555]"
                }`}>
                  {o.status?.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package size={40} className="text-[#333] mx-auto mb-3" />
              <p className="font-body text-[#555] text-sm">No orders yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
