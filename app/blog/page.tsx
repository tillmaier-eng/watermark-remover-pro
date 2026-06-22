import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";
import { getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog | Watermark Remover Pro",
  description: "Tips, guides, and tutorials on AI watermark removal.",
};

export default async function BlogPage() {
  const user = await getCurrentUser();
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      <Navbar user={user} />

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Blog</h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Tips, guides, and tutorials on removing watermarks with AI.
            </p>
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-zinc-500">No posts yet. Check back soon!</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-zinc-900/50 backdrop-blur border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition"
                >
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <span>·</span>
                    <span>{post.readingTime} min read</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition">
                    {post.title}
                  </h2>
                  <p className="text-sm text-zinc-400 line-clamp-3">{post.description}</p>
                  {post.tags.length > 0 && (
                    <div className="flex gap-2 mt-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
