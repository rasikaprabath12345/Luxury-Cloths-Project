"use client";

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-sm sm:prose lg:prose-lg">
        <h1 className="text-4xl font-black text-gray-900 mb-8">Shipping & Delivery</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Methods & Rates</h2>
          
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Standard Shipping</h3>
              <p className="text-gray-700 mb-2">✓ Free on orders over Rs. 30,000</p>
              <p className="text-gray-700 mb-2">✓ 5-7 business days</p>
              <p className="text-sm text-gray-600">Regular delivery to your address</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Express Shipping</h3>
              <p className="text-gray-700 mb-2">✓ Rs. 4,500 for orders under Rs. 30,000</p>
              <p className="text-gray-700 mb-2">✓ 2-3 business days</p>
              <p className="text-sm text-gray-600">Fastest delivery option</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">International Shipping</h3>
              <p className="text-gray-700 mb-2">✓ Rs. 9,000 - 15,000 depending on location</p>
              <p className="text-gray-700 mb-2">✓ 10-21 business days</p>
              <p className="text-sm text-gray-600">Available to 50+ countries</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Overnight Shipping</h3>
              <p className="text-gray-700 mb-2">✓ Rs. 15,000</p>
              <p className="text-gray-700 mb-2">✓ Next business day</p>
              <p className="text-sm text-gray-600">For urgent orders</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Times</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Delivery times are estimates and begin from the order processing date. Orders are typically processed
            within 24-48 hours of placement. Peak seasons may cause delays.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tracking Your Order</h2>
          <ul className="text-gray-700 space-y-2 ml-6 list-disc">
            <li>You'll receive a tracking number via email once your order ships</li>
            <li>Track your package in real-time on our website or carrier's website</li>
            <li>You can also check your order status in your account dashboard</li>
            <li>We'll send you email updates at each major step</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Address Requirements</h2>
          <ul className="text-gray-700 space-y-2 ml-6 list-disc">
            <li>Complete and valid street address</li>
            <li>Valid city and state/province</li>
            <li>Complete ZIP/postal code</li>
            <li>Valid phone number for delivery confirmation</li>
            <li>No P.O. boxes or mailbox services for standard delivery</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">International Shipping</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We ship to most countries worldwide. International orders may be subject to customs duties and import taxes
            at the destination. These fees are the responsibility of the recipient.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Customs & Documentation:</strong> We'll complete all necessary export documentation. Customs 
            processing times vary by country.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Delayed Shipments</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If your order hasn't arrived within the promised timeframe:
          </p>
          <ul className="text-gray-700 space-y-2 ml-6 list-disc">
            <li>Check your tracking information first</li>
            <li>Contact our support team within 5 days of the expected delivery date</li>
            <li>We'll investigate and offer a solution (reshipment or refund)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Signature Required</h2>
          <p className="text-gray-700 leading-relaxed">
            Orders over Rs. 150,000 require a signature upon delivery. Packages will not be left unattended. If you're not
            available, the carrier will leave a notice and attempt redelivery.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lost or Damaged Packages</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If your package arrives damaged or goes missing:
          </p>
          <ol className="text-gray-700 space-y-2 ml-6 list-decimal">
            <li>Contact us immediately with photos of the damage or proof of non-delivery</li>
            <li>We'll work with the carrier to investigate</li>
            <li>Once confirmed, we'll send a replacement or issue a full refund</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Support</h2>
          <p className="text-gray-700 leading-relaxed">
            Questions about shipping? Contact us at:
          </p>
          <div className="mt-4 text-gray-700">
            <p><strong>Email:</strong> shipping@luxurycloth.lk</p>
            <p><strong>Phone:</strong> +94 11 234 5678</p>
            <p><strong>Hours:</strong> Monday - Friday, 9 AM - 6 PM (Sri Lanka Time)</p>
          </div>
        </section>
      </div>
    </main>
  );
}
