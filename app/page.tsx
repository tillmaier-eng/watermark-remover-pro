import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      <Navbar user={user} />

      {/* HERO */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-zinc-900/50 border border-zinc-800 rounded-full">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs text-zinc-400">AI-powered · Free 3 credits</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6">
            Remove watermarks
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              instantly with AI
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Clean logos, timestamps, and unwanted text from your images in seconds.
            No Photoshop needed — just upload and let AI do the work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25"
            >
              {user ? "Open Dashboard" : "Start free →"}
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-medium rounded-xl transition"
            >
              See pricing
            </Link>
          </div>

          <p className="text-xs text-zinc-500 mt-6">
            No credit card required · 3 free images to try
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-zinc-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-zinc-400">Three simple steps. No learning curve.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload", desc: "Drop your image — JPG, PNG, or WebP up to 100MB." },
              { step: "2", title: "AI Removes", desc: "Our AI automatically detects and removes watermarks in seconds." },
              { step: "3", title: "Download", desc: "Get a clean, high-quality version. Ready to use anywhere." },
            ].map((item) => (
              <div key={item.step} className="relative bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-8">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 mt-2">{item.title}</h3>
                <p className="text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Built for speed, accuracy, and privacy. Your images are processed in seconds and never shared.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "⚡", title: "Lightning fast", desc: "Most images processed in under 10 seconds." },
              { icon: "🎯", title: "Auto-detect", desc: "AI finds watermarks automatically — no manual selection." },
              { icon: "🔒", title: "Private", desc: "Images are auto-deleted after processing. Your files stay yours." },
              { icon: "📦", title: "Batch upload", desc: "Process up to 50 images at once with the Business plan." },
              { icon: "🖼️", title: "HD output", desc: "Download in original resolution. No quality loss." },
              { icon: "🔌", title: "API access", desc: "Integrate watermark removal into your own apps." },
            ].map((f) => (
              <div
                key={f.title}
                className="group bg-zinc-900/30 backdrop-blur border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-4 bg-zinc-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, fair pricing
            </h2>
            <p className="text-zinc-400">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-zinc-400">/forever</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-zinc-300">
                <li className="flex gap-2"><span className="text-green-400">✓</span> 3 free credits</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span> 5MB max file size</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span> PNG output</li>
                <li className="flex gap-2"><span className="text-zinc-600">✗</span> Batch processing</li>
              </ul>
              <Link
                href="/register"
                className="block text-center px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition"
              >
                Get started
              </Link>
            </div>

            {/* Pro - highlighted */}
            <div className="relative bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur border border-purple-500/50 rounded-2xl p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-xs font-medium text-white">
                Most popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-zinc-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-zinc-300">
                <li className="flex gap-2"><span className="text-green-400">✓</span> 100 credits/month</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span> 25MB max file size</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span> PNG, JPG, WebP</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span> 10-image batch</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span> API access</li>
              </ul>
              <Link
                href="/register"
                className="block text-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium rounded-xl transition"
              >
                Start free trial
              </Link>
            </div>

            {/* Business */}
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-2">Business</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="text-zinc-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-zinc-300">
                <li className="flex gap-2"><span className="text-green-400">✓</span> 500 credits/month</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span> 100MB max file size</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span> All formats + RAW</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span> 50-image batch</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span> Priority queue</li>
              </ul>
              <Link
                href="/register"
                className="block text-center px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur border border-purple-500/30 rounded-3xl p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to clean your images?
          </h2>
          <p className="text-zinc-300 mb-8 max-w-xl mx-auto">
            Join thousands removing watermarks in seconds. Free forever to start.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-zinc-900 font-medium rounded-xl hover:bg-zinc-100 transition"
          >
            Create free account →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}