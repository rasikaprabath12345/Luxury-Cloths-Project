"use client";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-sm sm:prose lg:prose-lg">
        <h1 className="text-4xl font-black text-gray-900 mb-8">Privacy Policy</h1>

        <p className="text-gray-600 mb-8">
          Last updated: June 2026
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            Luxury Cloths ("we", "us", "our", or "Company") operates the LUXURY.lk website (the "Service").
            This page informs you of our policies regarding the collection, use, and disclosure of personal
            data when you use our Service and the choices you have associated with that data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information Collection and Use</h2>
          <p className="text-gray-700 leading-relaxed mb-4">We collect several different types of information for various purposes:</p>
          <ul className="text-gray-700 space-y-2 ml-6">
            <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information ("Personal Data") including:
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Email address</li>
                <li>• First name and last name</li>
                <li>• Phone number</li>
                <li>• Address, State, Province, ZIP/Postal code, City</li>
                <li>• Cookies and Usage Data</li>
              </ul>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Data</h2>
          <p className="text-gray-700 leading-relaxed mb-4">Luxury Cloths uses the collected data for various purposes:</p>
          <ul className="text-gray-700 space-y-2 ml-6 list-disc">
            <li>To provide and maintain the Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information so we can improve our Service</li>
            <li>To monitor the usage of our Service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Security of Data</h2>
          <p className="text-gray-700 leading-relaxed">
            The security of your data is important to us, but remember that no method of transmission over the
            Internet is 100% secure. While we strive to use commercially acceptable means to protect your Personal
            Data, we cannot guarantee its absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
            new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <div className="mt-4 text-gray-700">
            <p><strong>Email:</strong> privacy@luxurycloth.lk</p>
            <p><strong>Address:</strong> Colombo, Sri Lanka</p>
          </div>
        </section>
      </div>
    </main>
  );
}
