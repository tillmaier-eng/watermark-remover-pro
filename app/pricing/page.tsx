import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";

export default async function PricingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      <Navbar user={user} />

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Pricing built for everyone
            </h1>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Start free. Upgrade only when you need more power. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
              <p className="text-sm text-zinc-400 mb-6">For trying things out</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-zinc-400">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-zinc-300">
                <li className="flex gap-2"><span className="text-green-400">✓</span> 3 free credits</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span> 5MB max file size</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span> PNG output</li>
                <li className="flex gap-2"><span className="text-zinc-600">✗</span> Batch processing</li>
                <li className="flex gap-2"><span className="text-zinc-600">✗</span> API access</li>
              </ul>
              <Link
                href="/register"
                className="block text-center px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition"
              >
                Get started
              </Link>
            </div>

            {/* Pro */}
            <div className="relative bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur border border-purple-500/50 rounded-2xl p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-xs font-medium text-white">
                Most popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
              <p className="text-sm text-zinc-400 mb-6">For creators & freelancers</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$9.99</span>
                <span className="text-zinc-400">/mo</span>
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
              <p className="text-sm text-zinc-400 mb-6">For teams & agencies</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$29</span>
                <span className="text-zinc-400">/mo</span>
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

          {/* FAQ */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Common questions</h2>
            <div className="space-y-4">
              {[
                { q: "Can I cancel anytime?", a: "Yes — cancel from your dashboard, no questions asked. Your plan stays active until the end of the billing period." },
                { q: "What happens to unused credits?", a: "Free tier credits don't roll over. Paid plan credits reset each month on your billing date." },
                { q: "Do you offer refunds?", a: "Yes, full refund within 7 days of purchase if you're not satisfied." },
                { q: "Is my data private?", a: "Absolutely. Images are auto-deleted after processing. We never share or sell your data." },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-2">{item.q}</h3>
                  <p className="text-sm text-zinc-400">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}