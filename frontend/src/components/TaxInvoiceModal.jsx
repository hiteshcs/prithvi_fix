import React, { useRef } from 'react';
import {
  Printer, Building2, ShieldCheck, CheckCircle2,
  X, QrCode, FileText, Landmark
} from 'lucide-react';

export default function TaxInvoiceModal({ isOpen = true, invoice, booking, onClose }) {
  const printRef = useRef();

  if (isOpen === false) return null;

  const handlePrint = () => {
    window.print();
  };

  // Resilient invoice data: use invoice object or synthesize from booking
  const activeInvoice = invoice ? {
    ...invoice,
    society_name: invoice.society_name || booking?.society_name || 'Kalinga Labour Cooperative Society Ltd.',
    society_reg: invoice.society_reg || booking?.society_reg || 'SOC-OD-2024-089',
    federation_name: invoice.federation_name || invoice.cooperative_name || booking?.federation_name || booking?.cooperative_name || 'West Khordha Regional Artisan & Maintenance Federation',
  } : (booking ? {
    invoice_number: `INV-2026-${String(booking.id || '101').padStart(4, '0')}`,
    society_name: booking.society_name || 'Kalinga Labour Cooperative Society Ltd.',
    society_reg: booking.society_reg || 'SOC-OD-2024-089',
    society_address: booking.society_local_area ? `${booking.society_local_area}, ${booking.society_district || 'Khordha'}` : 'Saheed Nagar, Unit-8, Bhubaneswar, Khordha',
    federation_name: booking.federation_name || booking.cooperative_name || 'West Khordha Regional Artisan & Maintenance Federation',
    federation_reg: booking.federation_reg || booking.cooperative_reg || 'COOP-OD-2024-001',
    cooperative_name: booking.cooperative_name || 'West Khordha Regional Artisan & Maintenance Federation',
    cooperative_reg: booking.cooperative_reg || 'COOP-OD-2024-001',
    customer_name: booking.customer_name || 'Citizen Customer',
    customer_phone: booking.customer_phone,
    location_address: booking.location_address || 'Patia, Bhubaneswar',
    location_city: booking.location_city || 'Bhubaneswar',
    location_district: booking.location_district || 'Khordha',
    location_pincode: booking.location_pincode || '751024',
    booking_code: booking.booking_code,
    worker_name: booking.worker_name || 'Assigned Cooperative Artisan',
    worker_code: booking.worker_code || 'WKR-OD-1001',
    service_name: booking.service_name || 'Standard Cooperative Service',
    service_date: booking.scheduled_date || new Date().toISOString().split('T')[0],
    amount: booking.amount || 299,
    parts_cost: booking.parts_cost || 0,
    parts_details: booking.parts_details,
    cooperative_fee: booking.cooperative_fee !== undefined ? booking.cooperative_fee : 14.95,
    platform_fee: booking.platform_fee !== undefined ? booking.platform_fee : 5.98,
    total_amount: booking.total_amount || 319.93,
    payment_status: booking.status === 'COMPLETED' ? 'PAID' : 'UNPAID / ESCROW HOLD',
    transaction_id: `TXN-OD-${booking.id}-2026`,
  } : null);

  if (!activeInvoice) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 pt-4 sm:pt-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-tax-invoice, .printable-tax-invoice * {
            visibility: visible;
          }
          .printable-tax-invoice {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: auto;
            margin: 0;
            padding: 1.5rem !important;
            border: none !important;
            box-shadow: none !important;
            max-height: none !important;
            overflow: visible !important;
            background: white !important;
            z-index: 9999;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[calc(100vh-2.5rem)] overflow-hidden border border-slate-300 animate-in zoom-in-95 duration-150">
        {/* Top Control Bar (Always visible & sticky at top) */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800 no-print z-10">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-100">
            <FileText size={16} className="text-amber-400 shrink-0" />
            <span>Official Cooperative Tax Invoice</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-sm bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
              title="Print Tax Invoice or Save as PDF"
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Printable Invoice Document Body (Scrolls smoothly inside modal) ── */}
        <div ref={printRef} className="printable-tax-invoice p-5 sm:p-7 space-y-5 text-xs text-slate-800 bg-white overflow-y-auto flex-1">
          {/* Header Banner: Primary Society (Issuer) & Apex Federation Affiliation */}
          <div className="border-b-2 border-blue-900 pb-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-950 text-white font-black text-sm flex items-center justify-center shrink-0 border border-blue-900 shadow-xs">
                PF
              </div>
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-900 uppercase tracking-wider">
                  <Landmark size={12} /> Primary Labour Cooperative Society
                </div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight leading-snug">
                  {activeInvoice.society_name || 'Kalinga Labour Cooperative Society Ltd.'}
                </h1>
                <p className="text-[11px] text-slate-600 font-medium">
                  Registered under State Cooperative Societies Act • Reg No: <span className="font-mono font-bold text-slate-800">{activeInvoice.society_reg || 'SOC-OD-2024-089'}</span>
                </p>
                <div className="text-[11px] font-bold text-blue-950 bg-blue-50/90 px-2.5 py-0.5 rounded-md border border-blue-200 inline-flex items-center gap-1.5 mt-1 shadow-2xs">
                  <span>🏛️ Affiliated under:</span>
                  <strong className="font-black text-blue-900">{activeInvoice.federation_name || activeInvoice.cooperative_name || 'West Khordha Regional Artisan & Maintenance Federation'}</strong>
                  <span className="text-[10px] text-slate-500 font-medium">(District Apex Federation)</span>
                </div>
              </div>
            </div>

            <div className="text-right space-y-1 shrink-0">
              <div className="inline-block px-2.5 py-1 rounded bg-emerald-100 text-emerald-950 font-black font-mono text-xs uppercase border border-emerald-300">
                TAX INVOICE
              </div>
              <div className="text-xs font-mono font-black text-slate-950 block">
                {activeInvoice.invoice_number}
              </div>
              <div className="text-[11px] text-slate-600 font-bold">
                Date: {activeInvoice.service_date || new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>

          {/* Billed To & Service Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                Billed To (Citizen / Customer)
              </span>
              <div className="font-black text-sm text-slate-950">{activeInvoice.customer_name}</div>
              <div className="text-slate-700 font-semibold mt-0.5">{activeInvoice.location_address || 'Patia, Bhubaneswar'}</div>
              <div className="text-slate-600 text-[11px] font-medium">
                {activeInvoice.location_city || 'Bhubaneswar'}, {activeInvoice.location_district || 'Khordha'} - {activeInvoice.location_pincode || '751024'}
              </div>
              {activeInvoice.customer_phone && (
                <div className="text-slate-600 text-[10px] font-semibold mt-1">Ph: {activeInvoice.customer_phone}</div>
              )}
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                Service Order Details
              </span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-semibold">Booking Ref:</span>
                  <span className="font-mono font-black text-blue-950">{activeInvoice.booking_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-semibold">Assigned Worker:</span>
                  <span className="font-bold text-slate-950">{activeInvoice.worker_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-semibold">Payment Status:</span>
                  <span className={`font-black px-2 py-0.5 rounded text-[10px] uppercase border ${
                    activeInvoice.payment_status?.includes('PAID') ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {activeInvoice.payment_status}
                  </span>
                </div>
                {activeInvoice.transaction_id && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-600 font-semibold">Txn Ref:</span>
                    <span className="font-mono font-bold text-slate-800">{activeInvoice.transaction_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[10px] font-black">
                <tr>
                  <th className="p-3">Description of Labour / Service / Parts</th>
                  <th className="p-3">SAC Code</th>
                  <th className="p-3 text-right">Standard Rate</th>
                  <th className="p-3 text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3">
                    <div className="font-black text-slate-950">{activeInvoice.service_name}</div>
                    <div className="text-[10px] text-slate-600 font-medium">Standard cooperative artisan skilled labour charge</div>
                  </td>
                  <td className="p-3 font-mono text-slate-600 font-bold">998719</td>
                  <td className="p-3 text-right font-mono font-semibold">₹{activeInvoice.amount}</td>
                  <td className="p-3 text-right font-mono font-black text-slate-950">₹{activeInvoice.amount}</td>
                </tr>

                {activeInvoice.parts_cost > 0 && (
                  <tr className="bg-amber-50/50">
                    <td className="p-3">
                      <div className="font-black text-amber-950">Standard Locked Replacement Parts</div>
                      <div className="text-[10px] text-amber-800 font-medium">{activeInvoice.parts_details || 'Original Manufacturer Components'}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-600 font-bold">PRT-STD</td>
                    <td className="p-3 text-right font-mono font-semibold">₹{activeInvoice.parts_cost}</td>
                    <td className="p-3 text-right font-mono font-black text-amber-950">₹{activeInvoice.parts_cost}</td>
                  </tr>
                )}

                <tr className="bg-blue-50/40">
                  <td className="p-3">
                    <div className="font-bold text-blue-950">PF & Insurance (5%)</div>
                    <div className="text-[10px] text-blue-800 font-medium">ESIC accident insurance, PF, health & pension contribution</div>
                  </td>
                  <td className="p-3 font-mono text-slate-600 font-bold">COOP-WLF</td>
                  <td className="p-3 text-right font-mono font-semibold">5.0%</td>
                  <td className="p-3 text-right font-mono font-black text-blue-950">₹{activeInvoice.cooperative_fee}</td>
                </tr>

                <tr>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">Platform Fee (2%)</div>
                    <div className="text-[10px] text-slate-600 font-medium">Dispatch helpline, quality assurance & server infra</div>
                  </td>
                  <td className="p-3 font-mono text-slate-600 font-bold">PLAT-FEE</td>
                  <td className="p-3 text-right font-mono font-semibold">2.0%</td>
                  <td className="p-3 text-right font-mono font-black text-slate-950">₹{activeInvoice.platform_fee}</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={3} className="p-3 text-right text-slate-900 uppercase text-[11px] font-black">
                    Total Tax Invoice Value:
                  </td>
                  <td className="p-3 text-right text-base font-black text-blue-950 font-mono">
                    ₹{activeInvoice.total_amount}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer & Digital Seal */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-50 border border-slate-300 rounded-xl p-1 flex items-center justify-center shrink-0 shadow-2xs">
                <QrCode size={46} className="text-slate-900" />
              </div>
              <div className="space-y-0.5 text-[10px] text-slate-600">
                <div className="font-black text-slate-800 text-xs">Digital Verification Seal</div>
                <div className="font-medium">Scan with Prithvi Fix Citizen App to verify authenticity.</div>
                <div className="text-emerald-800 font-bold flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-700 shrink-0" /> Verified by Labour Federation Officer
                </div>
              </div>
            </div>

            <div className="text-right text-[10px] text-slate-600 space-y-0.5">
              <div className="font-black text-slate-800 text-xs">Authorised Signatory</div>
              <div className="font-serif italic text-sm text-blue-950 font-bold">Arun Kumar Pattnaik</div>
              <div className="font-extrabold text-slate-800">{activeInvoice.society_name || 'Primary Labour Cooperative Society'}</div>
              <div className="text-[10px] text-slate-500 font-medium">Under: {activeInvoice.federation_name || activeInvoice.cooperative_name || 'District Labour Cooperative Federation'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
