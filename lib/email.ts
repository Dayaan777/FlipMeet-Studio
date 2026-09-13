import { Resend } from "resend";

export type OrderConfirmationEmailData = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  total: number;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  deliveryEstimate?: string;
};

export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData) {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY is not configured in environment. Skipping email sending.");
    return { success: false, reason: "missing_api_key" };
  }

  const resend = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "FlipMeet Studio <onboarding@resend.dev>";
  const deliveryWindow = data.deliveryEstimate || "20–30 Oct 2026";

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #242424; vertical-align: top;">
          <div style="font-weight: 700; color: #FFFFFF; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
            ${item.name}
          </div>
          <div style="font-size: 12px; color: #9A9A9A; margin-top: 4px;">
            Size: <strong style="color: #FFFFFF;">${item.size}</strong> &bull; Qty: ${item.quantity}
          </div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #242424; text-align: right; vertical-align: top; font-weight: 700; color: #FFFFFF; font-size: 14px;">
          PKR ${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed — ${data.orderId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #000000; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #111111; border: 1px solid #242424; border-radius: 4px; overflow: hidden; text-align: left;">
          
          <!-- Header Branding -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #242424;">
              <div style="color: #FF4D1E; font-size: 10px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase;">
                FLIPMEET STUDIO // DROP 001
              </div>
              <h1 style="margin: 8px 0 0 0; color: #FFFFFF; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; text-transform: uppercase;">
                ORDER CONFIRMED
              </h1>
              <p style="margin: 6px 0 0 0; color: #9A9A9A; font-size: 13px;">
                Order ID: <strong style="color: #FF4D1E;">${data.orderId}</strong>
              </p>
            </td>
          </tr>

          <!-- Customer Message -->
          <tr>
            <td style="padding: 24px 32px 16px 32px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #D1D1D1;">
                Hello <strong style="color: #FFFFFF;">${data.customerName}</strong>,
              </p>
              <p style="margin: 8px 0 0 0; font-size: 13px; line-height: 1.6; color: #9A9A9A;">
                Your garment allocation has been recorded in our production ledger. Thank you for securing your piece from Drop 001. Below is your official receipt.
              </p>
            </td>
          </tr>

          <!-- Order Summary Details -->
          <tr>
            <td style="padding: 0 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #000000; border: 1px solid #242424; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
                <tr>
                  <td style="font-size: 12px; color: #9A9A9A; padding-bottom: 8px;">Est. Delivery Window</td>
                  <td style="font-size: 12px; font-weight: 700; color: #FFFFFF; text-align: right; padding-bottom: 8px;">${deliveryWindow}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #9A9A9A; padding-bottom: 8px;">Shipping Address</td>
                  <td style="font-size: 12px; font-weight: 600; color: #D1D1D1; text-align: right; padding-bottom: 8px;">${data.shippingAddress}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #9A9A9A;">Courier Service</td>
                  <td style="font-size: 12px; font-weight: 700; color: #10B981; text-align: right;">COMPLIMENTARY (PAKISTAN)</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #9A9A9A; margin-bottom: 8px;">
                Allocated Garments
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${itemsHtml}
              </table>

              <!-- Total Breakdown -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 16px;">
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #9A9A9A;">Shipping</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #10B981; text-align: right;">FREE</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0 0; font-size: 15px; font-weight: 800; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.05em; border-top: 1px solid #242424;">
                    Total
                  </td>
                  <td style="padding: 12px 0 0 0; font-size: 20px; font-weight: 800; color: #FF4D1E; text-align: right; border-top: 1px solid #242424;">
                    PKR ${data.total.toLocaleString()}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Note -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0A0A0A; border-top: 1px solid #242424; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #9A9A9A; line-height: 1.6;">
                Each garment in Drop 001 is individually numbered and limited to 100 units worldwide.
              </p>
              <p style="margin: 12px 0 0 0; font-size: 10px; letter-spacing: 0.2em; color: #666666; text-transform: uppercase;">
                FLIPMEET STUDIO &copy; 2026. BUILT FOR THE CULTURE.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `Order Confirmed: ${data.orderId} | FlipMeet Studio`,
      html: emailHtml,
    });

    console.log("[Resend] Order confirmation email dispatched:", result);
    return { success: true, result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error sending email via Resend";
    console.error("[Resend] Failed to send order confirmation email:", message);
    return { success: false, error: message };
  }
}
