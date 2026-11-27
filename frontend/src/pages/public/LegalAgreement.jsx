import { Link } from 'react-router-dom';
import { ArrowLeft, Wrench, Printer } from 'lucide-react';

const LegalAgreement = () => {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="no-print flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to AUSE Home
          </Link>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Terms
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                AUSE Home Appliance Services
              </p>
              <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                Terms & Conditions and Customer Service Agreement
              </h1>
            </div>
          </div>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-700">
            <p className="text-xs text-slate-400">
              Effective Date: November 1, 2026 • Last Updated: November 2026
            </p>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p>
                By registering an account or submitting a home-appliance repair request
                through the <strong>AUSE (Appliance Utility Service & Engagement)</strong>{' '}
                platform, you agree to be bound by these Terms & Conditions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">
                2. Diagnosis & Repair Quotations
              </h2>
              <p>
                All repair requests undergo an initial technical review. Where physical
                inspection is required, an on-site diagnostic fee (starting at ₱350) applies.{' '}
                <strong>
                  No repair work is billed without your explicit digital approval
                </strong>{' '}
                of the posted quotation.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">
                3. Home-Service Scheduling & Cancellations
              </h2>
              <p>
                Customers may cancel a repair request at no charge while its status remains{' '}
                <strong>Pending</strong>. Once a quotation is approved and a technician visit
                is scheduled, please notify AUSE at least four (4) hours prior to the
                appointed arrival window for rescheduling.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">
                4. Billing, Payment & 30-Day Service Warranty
              </h2>
              <p>
                Payments may be settled via Cash, GCash, Maya, or Bank Transfer upon
                completion of the service. All completed repairs carry a{' '}
                <strong>30-day workmanship warranty</strong> covering the specific issue
                serviced, excluding damage caused by power surges, misuse, or third-party
                tampering.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">
                5. Data Privacy & Activity Logging
              </h2>
              <p>
                Customer contact details, addresses, and uploaded appliance photos are used
                strictly for service dispatch, quotation records, and billing verification in
                compliance with the Philippine Data Privacy Act of 2012 (RA 10173).
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalAgreement;