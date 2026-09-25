import { Metadata } from "next";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions | FlipMeet Studio",
  description: "Terms and conditions for FlipMeet Studio.",
};

export default function TermsPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-base-bg px-6 pt-32 pb-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-text-primary mb-2">
            Terms & Conditions
          </h1>
          <p className="text-xs text-text-secondary tracking-widest uppercase mb-12">
            Last Updated: September 2026
          </p>

          <div className="prose prose-invert prose-sm max-w-none text-text-secondary space-y-6">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">1. Introduction</h2>
              <p>
                Welcome to FlipMeet Studio. These Terms & Conditions govern your use of our website and the purchase of our products. By accessing our site or placing an order, you agree to be bound by these terms. FlipMeet Studio reserves the right to update these terms at any time without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">2. Intellectual Property</h2>
              <p>
                All content, designs, graphics, logos, and garments featured on this website are the exclusive property of FlipMeet Studio. Any unauthorized reproduction, distribution, or resale of our products or digital content is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">3. Product Availability & Drops</h2>
              <p>
                FlipMeet Studio operates on a strictly limited-edition &quot;drop&quot; model. We do not restock items once they are sold out unless explicitly stated otherwise. Adding an item to your cart does not guarantee its availability until the checkout process is fully completed and payment is confirmed.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">4. Pricing & Payments</h2>
              <p>
                All prices are listed in PKR (Pakistani Rupee). We reserve the right to modify prices at any time. Payments are processed securely. In the event of a pricing error on the website, we reserve the right to cancel any orders placed for the item at the incorrect price.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">5. User Conduct</h2>
              <p>
                You agree not to use our website for any unlawful purpose or in any way that could damage, disable, or impair the site. Automated purchasing (botting) is strictly prohibited and will result in immediate order cancellation and a permanent ban from future drops.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}