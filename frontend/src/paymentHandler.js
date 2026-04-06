export const handlePaymentProcess = async (userInfo, paymentDataCallback) => {
  // BYPASS PAYMENT FOR NOW
  const BYPASS_PAYMENT = true;
  if (BYPASS_PAYMENT) {
    const paymentResult = {
      razorpay_payment_id: 'bypassed_' + Date.now().toString().slice(-6),
      razorpay_order_id: 'bypassed_' + Date.now().toString().slice(-6),
      razorpay_signature: 'bypassed',
    };
    if (paymentDataCallback) paymentDataCallback(paymentResult);
    return paymentResult;
  }

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
        key: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: data.amount, // Amount is in currency subunits. Default currency is INR.
        currency: data.currency,
        name: 'VYUGA Event Registration',
        description: 'Registration Fee',
        order_id: data.orderId, // This is a sample Order ID. Pass the `id` obtained in the response of create-order.
        handler: function (response) {
          // Success callback
          const paymentResult = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          };
          if (paymentDataCallback) paymentDataCallback(paymentResult);
          resolve(paymentResult);
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.phone
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
        reject(new Error(response.error.description || 'Payment failed'));
      });
      rzp1.open();
    });
  } catch (err) {
    console.error('Payment Flow Error:', err);
    throw err;
  }
};
