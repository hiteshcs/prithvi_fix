import React, { useState } from 'react';
import { api } from '../services/api';
import {
  CreditCard, QrCode, Building, CheckCircle2, AlertTriangle,
  X, ShieldCheck, IndianRupee, ArrowRight, Sparkles, Check
} from 'lucide-react';

export default function PaymentModal({ isOpen = true, booking, onClose, onPaymentSuccess, onSuccess }) {
  const [activeTab, setActiveTab] = useState('UPI'); // UPI, CARD, NET_BANKING
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  if (isOpen === false) return null;
  if (!booking) return null;

  const amount = Number(booking?.total_amount) || Number(booking?.amount) || 299;

  const handleProcessPayment = async (method) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.processPayment({
        bookingId: booking.id,
        paymentMethod: method,
      });
      setPaymentSuccess(res);
      if (onPaymentSuccess) onPaymentSuccess(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      console.error('Payment processing failed:', err);
      setError(err.message || 'Payment simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (onPaymentSuccess) onPaymentSuccess();
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleFinish(); }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0">
        {/* Modal Header */}
        <div className="p-5 bg-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-blue-950 flex items-center justify-center font-bold">
              ₹
            </div>
            <div>
              <h2 className="text-base font-bold">Cooperative Escrow Payment Gateway</h2>
              <div className="text-[11px] text-blue-200">
                Booking: <span className="font-mono">{booking?.booking_code}</span> • ₹{amount.toFixed(2)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFinish}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {paymentSuccess ? (
          /* Payment Success View */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-xl font-bold text-gray-900">Payment Confirmed!</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Your payment has been securely credited. 93% is routed directly to the artisan, 2% covers the platform fee, and 5% has been contributed to PF & Insurance.
            </p>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-left space-y-1.5 max-w-xs mx-auto font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Txn Ref:</span>
                <span className="font-bold text-blue-900">{paymentSuccess.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-bold text-gray-900">₹{amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-bold text-emerald-700">✓ PAID (TAX INVOICE UPDATED)</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleFinish}
                className="btn btn-primary btn-sm px-6 font-bold text-xs"
              >
                Close & View Updated Invoice
              </button>
            </div>
          </div>
        ) : (
          /* Payment Selection Tabs */
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Tab navigation */}
            <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('UPI')}
                className={`flex-1 py-2 rounded-lg transition ${
                  activeTab === 'UPI' ? 'bg-white text-blue-950 shadow-xs font-bold' : 'text-gray-600'
                }`}
              >
                UPI / QR Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('CARD')}
                className={`flex-1 py-2 rounded-lg transition ${
                  activeTab === 'CARD' ? 'bg-white text-blue-950 shadow-xs font-bold' : 'text-gray-600'
                }`}
              >
                Debit / Credit Card
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('NET_BANKING')}
                className={`flex-1 py-2 rounded-lg transition ${
                  activeTab === 'NET_BANKING' ? 'bg-white text-blue-950 shadow-xs font-bold' : 'text-gray-600'
                }`}
              >
                Net Banking
              </button>
            </div>

            {/* Tab 1: UPI */}
            {activeTab === 'UPI' && (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl inline-block">
                  <QrCode size={120} className="mx-auto text-blue-950" />
                  <span className="text-[10px] text-gray-500 mt-1 block">Scan with GPay, PhonePe, Paytm</span>
                </div>

                <div className="text-xs text-gray-600">
                  Total Payable: <strong className="text-base text-gray-900 font-mono">₹{amount.toFixed(2)}</strong>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleProcessPayment('UPI')}
                  className="w-full btn btn-saffron py-2.5 font-bold text-xs shadow-xs"
                >
                  {loading ? 'Confirming Transaction...' : `⚡ Simulate Instant UPI Payment (₹${amount.toFixed(2)})`}
                </button>
              </div>
            )}

            {/* Tab 2: Card */}
            {activeTab === 'CARD' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Card Number</label>
                  <input
                    type="text"
                    disabled
                    value="4532 •••• •••• 8821"
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Expiry</label>
                    <input
                      type="text"
                      disabled
                      value="08/28"
                      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">CVV</label>
                    <input
                      type="text"
                      disabled
                      value="•••"
                      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleProcessPayment('CARD')}
                  className="w-full btn btn-saffron py-2.5 font-bold text-xs shadow-xs mt-2"
                >
                  {loading ? 'Authorizing Card...' : `Pay ₹${amount.toFixed(2)} with Test Card`}
                </button>
              </div>
            )}

            {/* Tab 3: Net Banking */}
            {activeTab === 'NET_BANKING' && (
              <div className="space-y-3 text-xs">
                <p className="text-gray-600">Select Cooperative or Nationalized Bank:</p>
                <div className="grid grid-cols-2 gap-2">
                  {['National Coop Bank', 'SBI', 'HDFC Bank', 'ICICI Bank'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleProcessPayment('NET_BANKING')}
                      className="p-2.5 rounded-xl border border-gray-200 hover:border-blue-900 text-left font-semibold text-gray-800 hover:bg-blue-50 transition"
                    >
                      🏦 {b}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
