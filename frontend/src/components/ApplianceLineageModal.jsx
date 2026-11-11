import { useState, useEffect } from 'react';
import { X, ShieldCheck, Wrench, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import CivicLoader from './CivicLoader';

export default function ApplianceLineageModal({ isOpen, onClose, customerId }) {
  const [lineage, setLineage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchLineage();
    }
  }, [isOpen]);

  const fetchLineage = async () => {
    setLoading(true);
    try {
      const res = await api.getApplianceLineage(customerId);
      setLineage(res.lineage || []);
    } catch (err) {
      console.error('Failed to load appliance lineage:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5 text-blue-800" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-950">Household & Appliance Service Lineage</h2>
              <p className="text-xs text-gray-500">Official cooperative digital maintenance book & warranty log</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4">
          {loading ? (
            <CivicLoader
              variant="card"
              size="sm"
              title="Loading Digital Lineage Records..."
              subtitle="Auditing parts serial numbers and warranty milestones"
            />
          ) : lineage.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No appliance history logged yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Completed cooperative service visits and parts installations are automatically recorded here for lifetime warranty tracking.
              </p>
            </div>
          ) : (
            lineage.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-all bg-gradient-to-br from-white to-blue-50/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-blue-950">{item.appliance_type}</span>
                      {item.brand_model && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                          {item.brand_model}
                        </span>
                      )}
                    </div>
                    {item.serial_number && (
                      <p className="text-xs text-gray-500 mt-0.5">SN: {item.serial_number}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Guarantee Verified
                  </span>
                </div>

                <div className="mt-3 text-xs text-gray-700 bg-white p-3 rounded-lg border border-gray-100">
                  <p className="font-medium text-gray-900 mb-1">{item.service_summary}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 text-[11px] mt-2 pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" /> Date: {item.last_service_date}
                    </span>
                    {item.technician_name && (
                      <span>Artisan: <strong>{item.technician_name}</strong></span>
                    )}
                    {item.warranty_until && (
                      <span className="text-blue-900 font-semibold">Warranty Until: {item.warranty_until}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>🏛️ Labour Cooperative Society Digital Record</span>
          <button onClick={onClose} className="btn btn-secondary btn-sm">Close</button>
        </div>
      </div>
    </div>
  );
}
