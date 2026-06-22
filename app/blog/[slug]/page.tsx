import Link from "next/link";
import { notFound } from "next/navigation";
import { remark } from "remark";
import html from "remark-html";
import matter from "gray-matter";
import fs from "fs";
import path from "path";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Watermark Remover Pro`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const filePath = path.join(process.cwd(), "content", "blog", `${slug}.md`);
  if (!fs.existsSync(filePath)) return notFound();

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const processed = await remark().use(html).process(content);
  const contentHtml = processed.toString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data.title,
    description: data.description,
    datePublished: data.date,
    author: { "@type": "Organization", name: data.author ?? "Watermark Remover Pro" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      <Navbar user={user} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="text-purple-400 hover:text-purple-300 text-sm">
            ← Back to blog
          </Link>

          <header className="mt-8 mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{data.title}</h1>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <time dateTime={data.date}>
                {new Date(data.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              <span>·</span>
              <span>{Math.ceil(content.split(/\s+/).length / 200)} min read</span>
            </div>
          </header>

          <div
            className="prose prose-invert prose-lg max-w-none text-zinc-300"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          <div className="mt-16 p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-white mb-2">Try Watermark Remover Pro</h3>
            <p className="text-sm text-zinc-300 mb-4">Remove watermarks in seconds with AI.</p>
            <Link
              href="/register"
              className="inline-block px-6 py-2.5 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-100 transition"
            >
              Get 3 free credits →
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
