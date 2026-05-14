import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = trpc.blog.get.useQuery({ slug: slug || "" });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <Navbar />
        <div className="pt-32 pb-16 px-4 max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#1A1A1A] w-1/3" />
            <div className="h-16 bg-[#1A1A1A] w-full" />
            <div className="h-64 bg-[#1A1A1A] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <Navbar />
        <div className="pt-32 pb-16 px-4 text-center">
          <p className="font-display text-[#333] text-5xl font-black tracking-widest mb-4">POST NOT FOUND</p>
          <Link href="/blog">
            <span className="font-display text-[#FF6B00] text-sm tracking-widest cursor-pointer hover:underline">← BACK TO BLOG</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      <article className="pt-32 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Back */}
          <Link href="/blog">
            <span className="font-display text-[#555] text-xs tracking-widest cursor-pointer hover:text-[#FF6B00] transition-colors inline-block mb-8">
              ← BACK TO BLOG
            </span>
          </Link>

          {/* Category + Date */}
          <div className="flex items-center gap-4 mb-4">
            <span className="font-display text-[#FF6B00] text-[10px] tracking-widest uppercase">{post.category}</span>
            <span className="text-[#444] text-xs font-body">
              {new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="font-body text-[#888] text-xl leading-relaxed mb-8 border-l-2 border-[#FF6B00] pl-4">
              {post.excerpt}
            </p>
          )}

          {/* Hero Image */}
          {post.imageUrl && (
            <div className="mb-10 overflow-hidden">
              <img src={post.imageUrl} alt={post.title} className="w-full object-cover max-h-[480px]" />
            </div>
          )}

          {/* Content */}
          <div
            className="font-body text-[#CCCCCC] text-base leading-relaxed space-y-4 prose-headings:font-display prose-headings:text-white prose-headings:tracking-wide prose-strong:text-white prose-a:text-[#FF6B00]"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {post.content}
          </div>

          {/* Footer CTA */}
          <div className="mt-16 border-t border-white/10 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-display text-white font-bold tracking-widest text-sm">STAY DISCIPLINED.</p>
              <p className="font-body text-[#555] text-xs mt-1">More content coming. Follow the movement.</p>
            </div>
            <Link href="/blog">
              <button className="font-display text-xs tracking-widest px-6 py-3 bg-[#FF6B00] text-black hover:bg-[#e55e00] transition-colors">
                MORE POSTS →
              </button>
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
