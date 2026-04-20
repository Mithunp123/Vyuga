const fs = require('fs');

let content = fs.readFileSync('backend/server.js', 'utf8');

// 1. Add invoice_number to create-order
content = content.replace(
  /const order = await razorpay\.orders\.create\(options\);/,
  "const order = await razorpay.orders.create(options);\n    const invoiceNumber = `VYG-${Date.now().toString().slice(-8)}`;"
);

content = content.replace(
  /payer_phone: phone \? phone\.trim\(\) : null,/,
  "payer_phone: phone ? phone.trim() : null,\n      invoice_number: invoiceNumber,"
);

// 2. Select invoice_number in payments
content = content.replace(
  /\.select\('amount, base_amount, gst_amount, payer_name, payer_email, payer_phone, event_type'\)/g,
  ".select('amount, base_amount, gst_amount, payer_name, payer_email, payer_phone, event_type, invoice_number')"
);

// 3. Pass invoice_number to sendGSTInvoiceEmail
content = content.replace(
  /razorpayPaymentId: req\.body\.razorpay_payment_id, invoiceDate: new Date\(\)\.toISOString\(\)/g,
  "razorpayPaymentId: req.body.razorpay_payment_id, invoiceDate: new Date().toISOString(), invoiceNumber: payRec.invoice_number"
);

fs.writeFileSync('backend/server.js', content, 'utf8');
console.log('Fixed server.js');
