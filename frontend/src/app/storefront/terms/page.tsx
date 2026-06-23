"use client";

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-sm sm:prose lg:prose-lg">
        <h1 className="text-4xl font-black text-gray-900 mb-8">Terms of Use</h1>

        <p className="text-gray-600 mb-8">
          Last updated: June 2026
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            By accessing and using LUXURY.lk, you accept and agree to be bound by the terms and provision of this
            agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Permission is granted to temporarily download one copy of the materials (information or software) on
            LUXURY.lk for personal, non-commercial transitory viewing only. This is the grant of a license, not a
            transfer of title, and under this license you may not:
          </p>
          <ul className="text-gray-700 space-y-2 ml-6 list-disc">
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software contained on LUXURY.lk</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
          <p className="text-gray-700 leading-relaxed">
            The materials on LUXURY.lk are provided on an 'as is' basis. Luxury Cloths makes no warranties, expressed
            or implied, and hereby disclaims and negates all other warranties including, without limitation, implied
            warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of
            intellectual property or other violation of rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitations</h2>
          <p className="text-gray-700 leading-relaxed">
            In no event shall Luxury Cloths or its suppliers be liable for any damages (including, without limitation,
            damages for loss of data or profit, or due to business interruption) arising out of the use or inability
            to use the materials on LUXURY.lk, even if Luxury Cloths or an authorized representative has been notified
            orally or in writing of the possibility of such damage.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Accuracy of Materials</h2>
          <p className="text-gray-700 leading-relaxed">
            The materials appearing on LUXURY.lk could include technical, typographical, or photographic errors.
            Luxury Cloths does not warrant that any of the materials on its website are accurate, complete, or current.
            Luxury Cloths may make changes to the materials contained on its website at any time without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Links</h2>
          <p className="text-gray-700 leading-relaxed">
            Luxury Cloths has not reviewed all of the sites linked to its website and is not responsible for the
            contents of any such linked site. The inclusion of any link does not imply endorsement by Luxury Cloths
            of the site. Use of any such linked website is at the user's own risk.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modifications</h2>
          <p className="text-gray-700 leading-relaxed">
            Luxury Cloths may revise these terms of use for its website at any time without notice. By using this
            website, you are agreeing to be bound by the then current version of these terms of use.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These terms and conditions are governed by and construed in accordance with the laws of Sri Lanka, and
            you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about these Terms of Use, please contact us at:
          </p>
          <div className="mt-4 text-gray-700">
            <p><strong>Email:</strong> support@luxurycloth.lk</p>
            <p><strong>Address:</strong> Colombo, Sri Lanka</p>
          </div>
        </section>
      </div>
    </main>
  );
}
