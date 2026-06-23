"use client";

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-sm sm:prose lg:prose-lg">
        <h1 className="text-4xl font-black text-gray-900 mb-8">Return & Exchange Policy</h1>

        <p className="text-gray-600 mb-8">
          At Luxury Cloths, your satisfaction is our top priority. We offer a hassle-free 30-day return policy.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Eligibility</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            To be eligible for a return, your item must meet the following criteria:
          </p>
          <ul className="text-gray-700 space-y-2 ml-6 list-disc">
            <li>Return requested within 30 days of purchase</li>
            <li>Item is unused and unworn</li>
            <li>All tags are attached</li>
            <li>Original packaging is intact</li>
            <li>Item is in the same condition as received</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Initiate a Return</h2>
          <div className="text-gray-700 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Step 1: Log in to Your Account</h3>
              <p>Visit your account dashboard and navigate to your orders.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Step 2: Select the Item</h3>
              <p>Choose the item you wish to return and click the "Return" button.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Step 3: Choose Return Method</h3>
              <p>Select your preferred return method and generate a shipping label.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Step 4: Ship It Back</h3>
              <p>Pack the item securely and use the provided shipping label to send it back to us.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Shipping</h2>
          <ul className="text-gray-700 space-y-2 ml-6 list-disc">
            <li><strong>Free Returns:</strong> We provide free return shipping for all items</li>
            <li><strong>Shipping Label:</strong> A prepaid shipping label is included in your order</li>
            <li><strong>Return Address:</strong> Your return shipping label contains our warehouse address</li>
            <li><strong>Tracking:</strong> Track your return shipment using the provided tracking number</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Processing</h2>
          <ul className="text-gray-700 space-y-2 ml-6 list-disc">
            <li>We'll process your refund within 7-10 business days of receiving your return</li>
            <li>Refunds are issued to the original payment method</li>
            <li>You'll receive an email confirmation once your refund is processed</li>
            <li>Refunds typically appear in your account within 5-10 business days</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Exchanges</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Want to exchange for a different size or color? It's easy:
          </p>
          <ul className="text-gray-700 space-y-2 ml-6 list-disc">
            <li>Return the original item using our standard return process</li>
            <li>Once received and inspected, we'll send your replacement at no additional cost</li>
            <li>Exchanges are completed within 2-3 weeks</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Non-Returnable Items</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The following items cannot be returned:
          </p>
          <ul className="text-gray-700 space-y-2 ml-6 list-disc">
            <li>Items purchased on clearance or final sale</li>
            <li>Custom or personalized items</li>
            <li>Intimate apparel (for hygiene reasons)</li>
            <li>Items without original tags or packaging</li>
            <li>Items showing signs of wear or damage</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Damaged or Defective Items</h2>
          <p className="text-gray-700 leading-relaxed">
            If you received a damaged or defective item, we'll replace it for free. Contact our customer support team
            with photos of the damage within 48 hours of delivery.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h2>
          <p className="text-gray-700 leading-relaxed">
            For any questions about our return policy, please contact our support team at
            <strong> support@luxurycloth.lk</strong> or call <strong>+94 11 234 5678</strong>.
          </p>
        </section>
      </div>
    </main>
  );
}
