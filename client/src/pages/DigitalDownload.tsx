import { useEffect } from "react";
import { Link, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Download, CheckCircle, AlertCircle } from "lucide-react";

export default function DigitalDownload() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") || "";

  const { data, isLoading, error } = trpc.digital.getDownload.useQuery(
    { token },
    { enabled: !!token }
  );

  useEffect(() => {
    if (data?.fileUrl) {
      // Auto-trigger download after a short delay
      const timer = setTimeout(() => {
        window.open(data.fileUrl!, "_blank");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      <div className="pt-32 pb-24 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full text-center">
          {isLoading ? (
            <div className="space-y-4">
              <div className="w-16 h-16 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-display text-white tracking-widest">VERIFYING PURCHASE...</p>
            </div>
          ) : !token ? (
            <div className="space-y-4">
              <AlertCircle size={48} className="text-[#FF6B00] mx-auto" />
              <p className="font-display text-white text-2xl font-black tracking-widest">INVALID LINK</p>
              <p className="font-body text-[#666] text-sm">This download link is invalid or has expired.</p>
              <Link href="/digital">
                <button className="font-display text-xs tracking-widest px-6 py-3 bg-[#FF6B00] text-black hover:bg-[#e55e00] transition-colors mt-4">
                  BROWSE PRODUCTS →
                </button>
              </Link>
            </div>
          ) : error || !data ? (
            <div className="space-y-4">
              <AlertCircle size={48} className="text-red-500 mx-auto" />
              <p className="font-display text-white text-2xl font-black tracking-widest">NOT FOUND</p>
              <p className="font-body text-[#666] text-sm">
                We couldn't find your purchase. If you just paid, please wait a moment and refresh. If the issue persists, email <a href="mailto:info@buildlevel.com" className="text-[#FF6B00]">info@buildlevel.com</a>.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <CheckCircle size={56} className="text-green-400 mx-auto" />
              <div>
                <p className="font-display text-[#FF6B00] text-xs tracking-[0.3em] mb-2">PURCHASE CONFIRMED</p>
                <p className="font-display text-white text-3xl font-black tracking-widest leading-tight">
                  {data.productName}
                </p>
              </div>
              <p className="font-body text-[#888] text-sm">
                Your download is starting automatically. If it doesn't start, click the button below.
              </p>
              {data.fileUrl && (
                <a href={data.fileUrl} target="_blank" rel="noopener noreferrer" download={data.fileName || true}>
                  <button className="w-full bg-[#FF6B00] text-black font-display text-sm tracking-widest py-4 hover:bg-[#e55e00] transition-colors flex items-center justify-center gap-2">
                    <Download size={16} />
                    DOWNLOAD NOW
                  </button>
                </a>
              )}
              <p className="font-body text-[#444] text-xs">
                Save this link — you can use it to re-download anytime.
              </p>
              <Link href="/digital">
                <span className="font-display text-[#555] text-xs tracking-widest cursor-pointer hover:text-[#FF6B00] transition-colors inline-block">
                  ← BACK TO DIGITAL PRODUCTS
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
