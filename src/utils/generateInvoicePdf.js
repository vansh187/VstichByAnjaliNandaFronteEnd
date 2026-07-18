// jsPDF's built-in fonts (helvetica/times/courier) don't include the ₹ glyph,
// so formatINR's Intl currency symbol renders as a stray/superscript
// character in the PDF. Use a plain "Rs." prefix here instead - screen UI
// keeps the ₹ symbol via formatINR, only the PDF needs this.
const pdfAmountFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const formatAmountForPdf = (value) => `Rs. ${pdfAmountFormatter.format(Number(value) || 0)}`;

// jsPDF is loaded lazily so a failure to import/build the PDF never breaks
// the checkout flow itself - the order is already placed by this point,
// the bill is a nice-to-have on top of it.
export async function generateInvoicePdf(order) {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const marginX = 48;
    let y = 56;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("VStitch by Anjali Nanda", marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y += 18;
    doc.text("Tax Invoice / Order Receipt", marginX, y);

    y += 28;
    doc.setDrawColor(200);
    doc.line(marginX, y, 547, y);

    y += 24;
    doc.setFontSize(11);
    doc.text(`Order ID: #${order.vstitch_order_id ?? "-"}`, marginX, y);
    doc.text(`Status: ${String(order.order_status ?? "-").toUpperCase()}`, 320, y);

    y += 18;
    doc.text(`Payment Method: ${String(order.payment_method ?? "-").toUpperCase()}`, marginX, y);
    doc.text(`Date: ${new Date().toLocaleString("en-IN")}`, 320, y);

    if (order.shipping) {
      y += 28;
      doc.setFont("helvetica", "bold");
      doc.text("Ship To", marginX, y);
      doc.setFont("helvetica", "normal");
      y += 16;
      const shippingLines = [
        order.shipping.shipping_recipient_name,
        order.shipping.shipping_address_line1,
        order.shipping.shipping_address_line2,
        [order.shipping.shipping_city, order.shipping.shipping_state, order.shipping.shipping_postal_code]
          .filter(Boolean)
          .join(", "),
        order.shipping.shipping_country,
        order.shipping.shipping_phone_number,
      ].filter(Boolean);
      shippingLines.forEach((line) => {
        doc.text(String(line), marginX, y);
        y += 14;
      });
    }

    y += 20;
    doc.setFont("helvetica", "bold");
    doc.text("Item", marginX, y);
    doc.text("Qty", 380, y, { align: "right" });
    doc.text("Amount", 547, y, { align: "right" });
    y += 8;
    doc.line(marginX, y, 547, y);
    y += 18;

    doc.setFont("helvetica", "normal");
    const items = Array.isArray(order.items) ? order.items : [];
    items.forEach((item) => {
      if (y > 760) {
        doc.addPage();
        y = 56;
      }
      const label = String(item.product_name ?? "Item");
      const variant = [item.size && `Size ${item.size}`, item.color].filter(Boolean).join(" / ");
      doc.text(label, marginX, y, { maxWidth: 300 });
      doc.text(String(item.quantity ?? 0), 380, y, { align: "right" });
      doc.text(formatAmountForPdf(item.line_total ?? 0), 547, y, { align: "right" });
      y += 14;
      if (variant) {
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(variant, marginX, y);
        doc.setFontSize(11);
        doc.setTextColor(0);
        y += 16;
      } else {
        y += 6;
      }
    });

    y += 12;
    doc.line(marginX, y, 547, y);
    y += 22;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Total", 380, y, { align: "right" });
    doc.text(formatAmountForPdf(order.total_amount ?? 0), 547, y, { align: "right" });

    y += 40;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("Thank you for shopping with VStitch by Anjali Nanda.", marginX, y);

    doc.save(`VStitch-Invoice-${order.vstitch_order_id ?? "order"}.pdf`);
    return true;
  } catch (err) {
    console.error("Failed to generate invoice PDF:", err);
    return false;
  }
}
