import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Terms of Service | Watermark Remover Pro",
  description: "Terms and conditions for using our service.",
};

export default async function TermsPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      <Navbar user={user} />

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-sm text-zinc-500 mb-8">Last updated: January 2025</p>

          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-8 space-y-6 text-zinc-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using Watermark Remover Pro, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">2. Service Description</h2>
              <p>Watermark Remover Pro provides AI-powered image processing tools to remove watermarks, logos, and other overlays from images. The service is provided on a credit-based system with free and paid tiers.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">3. Acceptable Use</h2>
              <p>You agree NOT to use the service to:</p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>Remove watermarks from images you don't own or have permission to edit</li>
                <li>Infringe on others' copyrights, trademarks, or intellectual property</li>
                <li>Process illegal, harmful, or offensive content</li>
                <li>Abuse the system or attempt to bypass credit limits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">4. Intellectual Property</h2>
              <p>You retain all rights to images you upload. We do not claim ownership of your content. Our service code, design, and AI models remain our intellectual property.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">5. Credits & Refunds</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Free tier credits are provided on signup and do not roll over</li>
                <li>Paid plan credits reset monthly on your billing date</li>
                <li>Refunds available within 7 days of purchase</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">6. Service Availability</h2>
              <p>We aim for 99.9% uptime but do not guarantee uninterrupted service. Maintenance, updates, or unforeseen issues may cause temporary downtime.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
              <p>The service is provided "as is" without warranties. We are not liable for any damages resulting from use of the service, including but not limited to data loss or processing errors.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">8. Changes to Terms</h2>
              <p>We reserve the right to update these terms. Users will be notified of significant changes via email.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">9. Contact</h2>
              <p>For questions about these terms: <a href="mailto:legal@watermarkremoverpro.com" className="text-purple-400 hover:text-purple-300">legal@watermarkremoverpro.com</a></p>
            </section>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-purple-400 hover:text-purple-300">← Back to home</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
