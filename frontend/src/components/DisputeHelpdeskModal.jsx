import { useState } from 'react';
import { X, HelpCircle, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function DisputeHelpdeskModal({ isOpen, onClose, bookingId, onDisputeCreated }) {
  const [issueType, setIssueType] = useState('Quality Concern');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketCode, setTicketCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      const res = await api.createDispute({
        bookingId,
        issueType,
        description,
      });
      setTicketCode(res.ticket?.ticket_code || 'DISP-2026-NEW');
      setSuccess(true);
      if (onDisputeCreated) onDisputeCreated();
    } catch (err) {
      alert(err.message || 'Failed to submit grievance');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-blue-950">Human Dispute & Grievance Desk</h2>
              <p className="text-xs text-gray-500">Direct federation supervisor arbitration (No bot dead-ends)</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Grievance Ticket Registered</h3>
            <p className="text-xs text-gray-600 max-w-xs mx-auto">
              Ticket Code: <strong className="text-blue-950 font-mono text-sm">{ticketCode}</strong>
            </p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              A designated District Cooperative Federation Officer will review this and contact both parties within 2 hours.
            </p>
            <button onClick={handleClose} className="btn btn-primary btn-sm mt-4">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                As a state labour cooperative, fair resolution and artisan dignity are guaranteed. Our human supervisor directly mediates every dispute.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Issue Category</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              >
                <option value="Quality Concern">Workmanship & Quality Concern</option>
                <option value="Billing Query">Billing or Tariff Discrepancy</option>
                <option value="Punctuality / Delay">Punctuality / Significant Delay</option>
                <option value="Parts Dispute">Parts / Materials Inquiry</option>
                <option value="Other">Other Operational Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                placeholder="Explain the issue clearly (include time, artisan details, or specific fault)..."
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" onClick={handleClose} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !description.trim()}
                className="btn btn-primary btn-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Submitting...' : 'Submit to Arbitrator'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
