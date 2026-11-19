import { Scale, Wrench, Printer, CheckCircle2 } from 'lucide-react';
import Layout from '../../components/Layout';

const DeveloperContract = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">System Development Contract</h1>
            <p className="mt-1 text-sm text-stone-500">
              Official software development and system turnover agreement for AUSE.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-50"
          >
            <Printer className="h-4 w-4" />
            Print Contract
          </button>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-600">
                Internal Governance & Legal Record
              </p>
              <h2 className="text-xl font-extrabold text-stone-900 sm:text-2xl">
                Software Development & System Turnover Agreement
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-stone-700">
            <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 text-xs text-teal-900">
              <strong>Contract Reference No.:</strong> AUSE-DEV-2026-001 •{' '}
              <strong>Jurisdiction:</strong> Caloocan City, Metro Manila, Philippines
            </div>

            <p>
              This <strong>Software Development and System Turnover Agreement</strong>{' '}
              (&ldquo;Agreement&rdquo;) is entered into on <strong>November 19, 2026</strong>,
              by and between:
            </p>

            <div className="grid grid-cols-1 gap-4 rounded-2xl bg-stone-50 p-4 text-xs sm:grid-cols-2">
              <div>
                <span className="font-bold uppercase text-stone-400">The Client (Company)</span>
                <p className="mt-1 text-sm font-bold text-stone-900">
                  AUSE Home Appliance Services Corp.
                </p>
                <p className="text-stone-600">
                  128 Rizal Avenue Extension, Grace Park, Caloocan City, Metro Manila
                </p>
              </div>
              <div>
                <span className="font-bold uppercase text-stone-400">
                  The Developers (Service Provider)
                </span>
                <p className="mt-1 text-sm font-bold text-stone-900">
                  BSIT 3A Web Development Team
                </p>
                <p className="text-stone-600">
                  Full-Stack Systems Engineering Group (Node.js, Express, MySQL & React)
                </p>
              </div>
            </div>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-stone-900">
                Article I — Scope of Deliverables
              </h3>
              <p>
                The Developers agree to design, develop, test, and deliver the{' '}
                <strong>AUSE Appliance Repair Management System</strong>, comprising:
              </p>
              <ul className="ml-5 list-disc space-y-1 text-stone-600">
                <li>
                  Role-Based Customer & Administrator Web Portals with JWT Authentication.
                </li>
                <li>
                  End-to-End Repair Ticketing, Image Attachments, Diagnosis Quotation, and
                  Conflict-Checked Home Visit Scheduling.
                </li>
                <li>
                  Payment & Billing Ledger supporting Cash, GCash, Maya, and Bank Transfer.
                </li>
                <li>
                  Administrative Analytics Dashboard with Visual Charts, SQL JOIN/Aliased
                  Date-Range CSV Reports, and System Audit Activity Logs.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-stone-900">
                Article II — Intellectual Property & Source Code Ownership
              </h3>
              <p>
                Upon final project acceptance and turnover, full ownership and operational
                rights to the AUSE web application, MySQL database schema (<code>ause_db</code>
                ), and custom documentation are granted to{' '}
                <strong>AUSE Home Appliance Services Corp.</strong>, while retaining academic
                attribution rights for the Development Team.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-stone-900">
                Article III — Data Confidentiality & Post-Deployment Support
              </h3>
              <p>
                Both parties agree to maintain strict confidentiality over customer records,
                financial reports, and system credentials. The Developers provide a{' '}
                <strong>60-day post-turnover technical support and bug-fix warranty</strong>{' '}
                covering database integrity, API uptime, and UI responsiveness.
              </p>
            </section>

            {/* Signature Blocks */}
            <div className="mt-8 grid grid-cols-1 gap-8 border-t border-stone-200 pt-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-stone-400">
                  Signed for and on behalf of AUSE Corp.:
                </p>
                <div className="mt-8 flex items-center gap-1.5 border-b border-stone-400 pb-1 font-bold text-stone-900">
                  <Wrench className="h-4 w-4 text-teal-600" />
                  Engr. Roberto M. Santos
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Operations Director, AUSE Home Appliance Services Corp.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-stone-400">
                  Signed by the Lead System Developers:
                </p>
                <div className="mt-8 flex items-center gap-1.5 border-b border-stone-400 pb-1 font-bold text-stone-900">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  BSIT 3A Development Team
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Lead Full-Stack Developers & Database Architects
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DeveloperContract;