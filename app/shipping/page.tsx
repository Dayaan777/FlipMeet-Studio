import { Metadata } from "next";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Shipping Policy | FlipMeet Studio",
  description: "Shipping policy for FlipMeet Studio.",
};

export default function ShippingPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-base-bg px-6 pt-32 pb-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-text-primary mb-2">
            Shipping Policy
          </h1>
          <p className="text-xs text-text-secondary tracking-widest uppercase mb-12">
            Last Updated: September 2026
          </p>

          <div className="prose prose-invert prose-sm max-w-none text-text-secondary space-y-6">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">1. Order Processing Time</h2>
              <p>
                All orders are processed within 2-3 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders due to a recent drop, shipments may be delayed by a few days. Please allow additional days in transit for delivery.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">2. Shipping Rates & Delivery Estimates</h2>
              <p>
                Shipping charges for your order will be calculated and displayed at checkout. Standard delivery within Pakistan usually takes 3-5 business days. We partner with reliable private couriers to ensure the safe and timely arrival of your garments.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">3. Pre-Orders & Drop Schedules</h2>
              <p>
                Certain collections or items (such as Drop 001) are sold on a pre-order basis. Fulfillment schedules for these drops are communicated clearly on the product pages and during checkout. Please refer to those specific timelines for when manufacturing starts and when shipments will dispatch.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">4. Order Tracking</h2>
              <p>
                You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
