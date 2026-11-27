// backend/src/utils/receiptPdf.js
const PDFDocument = require('pdfkit');

const formatCurrency = (val) =>
  `PHP ${Number(val || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * Stream a branded AUSE Service Invoice / Official Receipt PDF into an Express response.
 */
const streamReceiptPdf = (res, ticket, items = []) => {
  const doc = new PDFDocument({ size: 'A4', margin: 48 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="AUSE-Receipt-${ticket.request_id}.pdf"`
  );

  doc.pipe(res);

  // Header band
  doc.rect(0, 0, doc.page.width, 96).fill('#1d4ed8');
  doc
    .fillColor('#ffffff')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('AUSE APPLIANCE CARE', 48, 28);
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#bae6fd')
    .text('Metro Manila Field Service & Home Appliance Repair', 48, 56);

  doc
    .fillColor('#ffffff')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(`OFFICIAL RECEIPT #OR-${String(ticket.request_id).padStart(5, '0')}`, 320, 34, {
      align: 'right',
      width: 227,
    });
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#e0f2fe')
    .text(`Issued: ${new Date().toLocaleDateString('en-PH')}`, 320, 54, {
      align: 'right',
      width: 227,
    });

  // Customer & Job Details
  let y = 120;
  doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('Customer & Service Details', 48, y);
  y += 18;
  doc.fontSize(9.5).font('Helvetica').fillColor('#334155');
  doc.text(`Customer: ${ticket.customer_name || '—'}`, 48, y);
  doc.text(`Ticket #: ${ticket.request_id}`, 340, y);
  y += 15;
  doc.text(`Phone: ${ticket.customer_phone || '—'}`, 48, y);
  doc.text(`Appliance: ${ticket.appliance_type} ${ticket.brand_model ? `(${ticket.brand_model})` : ''}`, 340, y);
  y += 15;
  doc.text(`Address: ${ticket.service_address || '—'}`, 48, y, { width: 499 });
  y += 28;

  // Divider
  doc.moveTo(48, y).lineTo(547, y).strokeColor('#cbd5e1').stroke();
  y += 14;

  // Itemized Table
  doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('Itemized Service Breakdown', 48, y);
  y += 20;

  // Table header
  doc.rect(48, y, 499, 22).fill('#f1f5f9');
  doc.fillColor('#475569').fontSize(8.5).font('Helvetica-Bold');
  doc.text('TYPE', 56, y + 7);
  doc.text('DESCRIPTION', 140, y + 7);
  doc.text('QTY', 360, y + 7, { width: 40, align: 'right' });
  doc.text('UNIT', 405, y + 7, { width: 65, align: 'right' });
  doc.text('SUBTOTAL', 475, y + 7, { width: 64, align: 'right' });
  y += 26;

  doc.font('Helvetica').fontSize(9).fillColor('#1e293b');
  if (items.length > 0) {
    for (const item of items) {
      const subtotal = Number(item.subtotal || item.quantity * item.unit_price || 0);
      doc.text(item.item_type || 'Service', 56, y, { width: 80 });
      doc.text(item.description || 'Repair item', 140, y, { width: 215 });
      doc.text(String(item.quantity || 1), 360, y, { width: 40, align: 'right' });
      doc.text(formatCurrency(item.unit_price), 405, y, { width: 65, align: 'right' });
      doc.text(formatCurrency(subtotal), 475, y, { width: 64, align: 'right' });
      y += 20;
    }
  } else {
    doc.text('Service', 56, y);
    doc.text(ticket.recommended_service || ticket.problem_description || 'Appliance Repair', 140, y, {
      width: 215,
    });
    doc.text('1', 360, y, { width: 40, align: 'right' });
    doc.text(formatCurrency(ticket.total_amount || ticket.estimated_cost), 405, y, {
      width: 65,
      align: 'right',
    });
    doc.text(formatCurrency(ticket.total_amount || ticket.estimated_cost), 475, y, {
      width: 64,
      align: 'right',
    });
    y += 20;
  }

  y += 8;
  doc.moveTo(48, y).lineTo(547, y).strokeColor('#cbd5e1').stroke();
  y += 14;

  // Payment Summary Box
  const totalBill = Number(ticket.total_amount || ticket.estimated_cost || 0);
  const amountPaid = Number(ticket.amount_paid || 0);
  const balance = Number(ticket.balance ?? Math.max(0, totalBill - amountPaid));

  doc.rect(310, y, 237, 92).fill('#f8fafc');
  doc.fillColor('#334155').fontSize(9.5).font('Helvetica');
  doc.text('Total Bill:', 324, y + 12);
  doc.font('Helvetica-Bold').text(formatCurrency(totalBill), 420, y + 12, { width: 115, align: 'right' });

  doc.font('Helvetica').text('Amount Paid:', 324, y + 32);
  doc.fillColor('#059669').font('Helvetica-Bold').text(formatCurrency(amountPaid), 420, y + 32, {
    width: 115,
    align: 'right',
  });

  doc.fillColor('#334155').font('Helvetica').text('Remaining Balance:', 324, y + 52);
  doc.font('Helvetica-Bold').text(formatCurrency(balance), 420, y + 52, { width: 115, align: 'right' });

  doc.font('Helvetica').fontSize(8.5).fillColor('#64748b');
  doc.text(
    `Method: ${ticket.payment_method || 'Pending'} (${ticket.payment_status || 'Unpaid'})`,
    324,
    y + 72
  );

  // Warranty Box
  doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text('30-Day Service Warranty', 48, y + 12);
  doc.font('Helvetica').fontSize(8.5).fillColor('#475569');
  const warrantyText = ticket.warranty_expires_at
    ? `Valid until ${new Date(ticket.warranty_expires_at).toLocaleDateString('en-PH')}. Covers labor and replaced parts for the same diagnosed issue.`
    : 'AUSE provides a standard 30-day workmanship warranty upon repair completion. Present this receipt when claiming warranty.';
  doc.text(warrantyText, 48, y + 30, { width: 245 });

  doc
    .fontSize(8)
    .fillColor('#94a3b8')
    .text('Thank you for choosing AUSE Appliance Care.', 48, doc.page.height - 60, {
      align: 'center',
      width: 499,
    });

  doc.end();
};

module.exports = { streamReceiptPdf };
