import { Metadata } from "next";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Returns & Exchange | FlipMeet Studio",
  description: "Returns and exchange policy for FlipMeet Studio.",
};

export default function ReturnsPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-base-bg px-6 pt-32 pb-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-text-primary mb-2">
            Returns & Exchange
          </h1>
          <p className="text-xs text-text-secondary tracking-widest uppercase mb-12">
            Last Updated: September 2026
          </p>

          <div className="prose prose-invert prose-sm max-w-none text-text-secondary space-y-6">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">1. General Policy</h2>
              <p>
                Due to the limited nature of our drops and archive pieces, ALL SALES ARE FINAL. We do not offer refunds or exchanges for change of mind or incorrect sizing. Please carefully consult our size guides before placing your order.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">2. Defective or Incorrect Items</h2>
              <p>
                If you receive a defective garment or the wrong item was shipped to you, we will gladly accept a return or exchange. You must contact our support team within 48 hours of receiving your order with photographic evidence of the defect or incorrect item.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">3. Return Process</h2>
              <p>
                Once your claim for a defective or incorrect item is approved, we will provide you with a return shipping address. The item must be returned in its original condition, unworn, unwashed, and with all tags attached. We will cover the return shipping costs for defective or incorrect items.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">4. Missing Packages</h2>
              <p>
                FlipMeet Studio is not responsible for packages that are lost or stolen after they have been marked as delivered by the courier. If your package is lost in transit, please contact the courier directly to file a claim.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}