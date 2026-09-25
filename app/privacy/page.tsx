import { Metadata } from "next";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | FlipMeet Studio",
  description: "Privacy policy for FlipMeet Studio.",
};

export default function PrivacyPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-base-bg px-6 pt-32 pb-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-text-primary mb-2">
            Privacy Policy
          </h1>
          <p className="text-xs text-text-secondary tracking-widest uppercase mb-12">
            Last Updated: September 2026
          </p>

          <div className="prose prose-invert prose-sm max-w-none text-text-secondary space-y-6">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">1. Information We Collect</h2>
              <p>
                When you visit FlipMeet Studio, we collect certain information about your device, your interaction with the site, and information necessary to process your purchases. This may include your name, billing address, shipping address, payment information, email address, and phone number.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">2. How We Use Your Information</h2>
              <p>
                We use your personal information to fulfill any orders placed through the site (including processing your payment, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this information to communicate with you, screen our orders for potential risk or fraud, and provide you with information or advertising relating to our products.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">3. Sharing Your Information</h2>
              <p>
                We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use Supabase to power our database and Vercel for hosting. We may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant, or other lawful request for information we receive, or to otherwise protect our rights.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">4. Data Retention</h2>
              <p>
                When you place an order through the site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}