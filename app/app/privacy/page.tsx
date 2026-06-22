import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Privacy Policy | Watermark Remover Pro",
  description: "How we protect your data and privacy.",
};

export default async function PrivacyPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      <Navbar user={user} />

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-sm text-zinc-500 mb-8">Last updated: January 2025</p>

          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-8 space-y-6 text-zinc-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <p>We collect minimal information to provide our service:</p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>Email address (for account creation)</li>
                <li>Display name (optional)</li>
                <li>Uploaded images (stored temporarily, deleted after processing)</li>
                <li>Usage data (credits used, processing history)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>To provide and improve the watermark removal service</li>
                <li>To manage your account and credits</li>
                <li>To send important service notifications</li>
                <li>To prevent abuse and ensure security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">3. Image Processing</h2>
              <p>All watermark removal is performed client-side in your browser using OpenCV.js. Your images are never sent to external AI services. Uploaded images are stored temporarily to provide processing history and are automatically deleted after 30 days.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">4. Data Security</h2>
              <p>We use industry-standard encryption (HTTPS, bcrypt password hashing) to protect your data. Database backups are encrypted and stored securely.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">5. Your Rights</h2>
              <p>You can request to:</p>
              <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                <li>Access your personal data</li>
                <li>Delete your account and all associated data</li>
                <li>Export your data</li>
                <li>Opt out of marketing emails</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">6. Contact</h2>
              <p>For privacy inquiries: <a href="mailto:privacy@watermarkremoverpro.com" className="text-purple-400 hover:text-purple-300">privacy@watermarkremoverpro.com</a></p>
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
