import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Contact Us | Watermark Remover Pro",
  description: "Get in touch with the Watermark Remover Pro team.",
};

export default async function ContactPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      <Navbar user={user} />

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-zinc-400">
              Have a question, feedback, or need support? We'd love to hear from you.
            </p>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Email Us</h2>
                <p className="text-zinc-400">For general inquiries:</p>
                <a href="mailto:support@watermarkremoverpro.com" className="text-purple-400 hover:text-purple-300">
                  support@watermarkremoverpro.com
                </a>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Response Time</h2>
                <p className="text-zinc-400">We typically respond within 24 hours on business days.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Business Hours</h2>
                <p className="text-zinc-400">Monday - Friday, 9:00 AM - 6:00 PM (UTC)</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Common Topics</h2>
                <ul className="space-y-2 text-zinc-400">
                  <li>• Technical support & bug reports</li>
                  <li>• Account & billing questions</li>
                  <li>• Feature requests</li>
                  <li>• API access & integrations</li>
                  <li>• Partnership inquiries</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-purple-400 hover:text-purple-300">
              ← Back to home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
