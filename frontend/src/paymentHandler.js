export const handlePaymentProcess = async (userInfo, paymentDataCallback) => {
  try {
    // 1. Create order
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiUrl}/api/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInfo),
    });
    
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    // 2. Open Razorpay Checkout
    return new Promise((resolve, reject) => {
      const options = {
        key: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount, // total including GST, in paise
        currency: data.currency,
        name: 'VYUGA Event Registration',
        description: `Registration Fee (incl. 18% GST)`,
        order_id: data.orderId,
        handler: function (response) {
          const paymentResult = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            receiptId: data.receipt_id,
            // Pass GST info back to caller
            baseAmount: data.baseAmount,
            gstAmount: data.gstAmount,
            totalAmount: data.amount,
          };
          if (paymentDataCallback) paymentDataCallback(paymentResult);
          resolve(paymentResult);
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.phone
        },
        notes: {
          base_amount: data.baseAmount,
          gst_amount: data.gstAmount,
          receipt_id: data.receipt_id,
        },
        theme: {
          color: '#0197B2'
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled by user.'));
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        console.warn('Payment failed attempt:', response.error.description);
      });
      rzp1.open();
    });
  } catch (err) {
    console.error('Payment Flow Error:', err);
    throw err;
  }
};

/**
 * Fetch the registration fee breakdown for a given event type.
 * Returns { baseFee, gstFee, totalFee } in Rupees (not paise).
 */
export const fetchEventFee = async (eventType) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiUrl}/api/form-settings`);
    const json = await res.json();
    if (!json.success) return null;
    const setting = json.data.find(s => s.id === eventType);
    if (!setting || setting.registration_fee_paise == null) return null;
    const basePaise = setting.registration_fee_paise;
    const gstPaise  = Math.round(basePaise * 18 / 100);
    return {
      baseFee:  basePaise  / 100,
      gstFee:   gstPaise   / 100,
      totalFee: (basePaise + gstPaise) / 100,
    };
  } catch {
    return null;
  }
};

