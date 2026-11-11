import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import CivicLoader from '../components/CivicLoader';
import {
  MapPin, Plus, Edit3, Trash2, Save, X, Star, Home, Building2,
  Briefcase, Heart, CheckCircle2, AlertCircle, Navigation, Hash
} from 'lucide-react';

const i18n = {
  EN: {
    pageTitle: 'Saved Addresses',
    pageSubtitle: 'Manage your saved delivery and service addresses',
    addNew: 'Add New Address',
    edit: 'Edit',
    delete: 'Delete',
    setDefault: 'Set as Default',
    defaultBadge: 'Default',
    save: 'Save Address',
    update: 'Update Address',
    cancel: 'Cancel',
    label: 'Address Label',
    fullAddress: 'Full Address',
    district: 'District',
    city: 'City / Town',
    pincode: 'PIN Code',
    landmark: 'Landmark (Optional)',
    noAddresses: 'No saved addresses yet',
    noAddressesDesc: 'Add your home, office, or other frequently used addresses for quick service booking.',
    saving: 'Saving...',
    saved: 'Address saved successfully!',
    updated: 'Address updated!',
    deleted: 'Address deleted.',
    error: 'Operation failed. Please try again.',
    confirmDelete: 'Are you sure you want to delete this address?',
    labelHome: 'Home',
    labelOffice: 'Office',
    labelWork: 'Work Site',
    labelOther: 'Other',
  },
  HI: {
    pageTitle: 'सहेजे गए पते',
    pageSubtitle: 'अपने सहेजे गए डिलीवरी और सेवा पते प्रबंधित करें',
    addNew: 'नया पता जोड़ें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    setDefault: 'डिफ़ॉल्ट सेट करें',
    defaultBadge: 'डिफ़ॉल्ट',
    save: 'पता सहेजें',
    update: 'पता अपडेट करें',
    cancel: 'रद्द करें',
    label: 'पता लेबल',
    fullAddress: 'पूरा पता',
    district: 'जिला',
    city: 'शहर / कस्बा',
    pincode: 'पिन कोड',
    landmark: 'लैंडमार्क (वैकल्पिक)',
    noAddresses: 'कोई सहेजा गया पता नहीं',
    noAddressesDesc: 'त्वरित सेवा बुकिंग के लिए अपना घर, कार्यालय या अन्य पता जोड़ें।',
    saving: 'सहेज रहे हैं...',
    saved: 'पता सफलतापूर्वक सहेजा गया!',
    updated: 'पता अपडेट हो गया!',
    deleted: 'पता हटा दिया गया।',
    error: 'ऑपरेशन विफल। कृपया पुनः प्रयास करें।',
    confirmDelete: 'क्या आप इस पते को हटाना चाहते हैं?',
    labelHome: 'घर',
    labelOffice: 'कार्यालय',
    labelWork: 'कार्य स्थल',
    labelOther: 'अन्य',
  },
  OR: {
    pageTitle: 'ସେଭ୍ ହୋଇଥିବା ଠିକଣା',
    pageSubtitle: 'ଆପଣଙ୍କ ସେଭ୍ ହୋଇଥିବା ଠିକଣା ପରିଚାଳନା କରନ୍ତୁ',
    addNew: 'ନୂଆ ଠିକଣା ଯୋଡ଼ନ୍ତୁ',
    edit: 'ସମ୍ପାଦନ',
    delete: 'ବିଲୋପ',
    setDefault: 'ଡିଫଲ୍ଟ ସେଟ୍ କରନ୍ତୁ',
    defaultBadge: 'ଡିଫଲ୍ଟ',
    save: 'ଠିକଣା ସେଭ୍ କରନ୍ତୁ',
    update: 'ଠିକଣା ଅପଡେଟ୍ କରନ୍ତୁ',
    cancel: 'ବାତିଲ',
    label: 'ଠିକଣା ଲେବଲ୍',
    fullAddress: 'ପୂରା ଠିକଣା',
    district: 'ଜିଲ୍ଲା',
    city: 'ସହର',
    pincode: 'ପିନ୍ କୋଡ୍',
    landmark: 'ଲ୍ୟାଣ୍ଡମାର୍କ (ଐଚ୍ଛିକ)',
    noAddresses: 'କୋଣସି ସେଭ୍ ହୋଇଥିବା ଠିକଣା ନାହିଁ',
    noAddressesDesc: 'ଶୀଘ୍ର ସେବା ବୁକିଂ ପାଇଁ ଆପଣଙ୍କ ଘର, ଅଫିସ୍ ବା ଅନ୍ୟ ଠିକଣା ଯୋଡ଼ନ୍ତୁ।',
    saving: 'ସେଭ୍ ହେଉଛି...',
    saved: 'ଠିକଣା ସଫଳଭାବେ ସେଭ୍ ହୋଇଛି!',
    updated: 'ଠିକଣା ଅପଡେଟ୍ ହୋଇଛି!',
    deleted: 'ଠିକଣା ବିଲୋପ ହୋଇଛି।',
    error: 'ଅପରେସନ୍ ବିଫଳ। ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ।',
    confirmDelete: 'ଆପଣ ଏହି ଠିକଣା ବିଲୋପ କରିବାକୁ ଚାହୁଁଛନ୍ତି?',
    labelHome: 'ଘର',
    labelOffice: 'ଅଫିସ୍',
    labelWork: 'କାର୍ଯ୍ୟସ୍ଥଳ',
    labelOther: 'ଅନ୍ୟ',
  },
  BN: {
    pageTitle: 'সংরক্ষিত ঠিকানা',
    pageSubtitle: 'আপনার সংরক্ষিত ঠিকানা পরিচালনা করুন',
    addNew: 'নতুন ঠিকানা যোগ করুন',
    edit: 'সম্পাদনা',
    delete: 'মুছুন',
    setDefault: 'ডিফল্ট সেট করুন',
    defaultBadge: 'ডিফল্ট',
    save: 'ঠিকানা সংরক্ষণ',
    update: 'ঠিকানা আপডেট',
    cancel: 'বাতিল',
    label: 'ঠিকানা লেবেল',
    fullAddress: 'পূর্ণ ঠিকানা',
    district: 'জেলা',
    city: 'শহর',
    pincode: 'পিন কোড',
    landmark: 'ল্যান্ডমার্ক (ঐচ্ছিক)',
    noAddresses: 'কোনো সংরক্ষিত ঠিকানা নেই',
    noAddressesDesc: 'দ্রুত সেবা বুকিংয়ের জন্য আপনার ঠিকানা যোগ করুন।',
    saving: 'সংরক্ষণ হচ্ছে...',
    saved: 'ঠিকানা সফলভাবে সংরক্ষিত!',
    updated: 'ঠিকানা আপডেট হয়েছে!',
    deleted: 'ঠিকানা মুছে ফেলা হয়েছে।',
    error: 'অপারেশন ব্যর্থ।',
    confirmDelete: 'আপনি কি এই ঠিকানাটি মুছতে চান?',
    labelHome: 'বাড়ি',
    labelOffice: 'অফিস',
    labelWork: 'কর্মস্থল',
    labelOther: 'অন্যান্য',
  },
  TE: {
    pageTitle: 'సేవ్ చేసిన చిరునామాలు',
    pageSubtitle: 'మీ సేవ్ చేసిన చిరునామాలను నిర్వహించండి',
    addNew: 'కొత్త చిరునామా జోడించండి',
    edit: 'సవరించు',
    delete: 'తొలగించు',
    setDefault: 'డిఫాల్ట్ సెట్ చేయండి',
    defaultBadge: 'డిఫాల్ట్',
    save: 'చిరునామా సేవ్ చేయండి',
    update: 'చిరునామా నవీకరించండి',
    cancel: 'రద్దు',
    label: 'చిరునామా లేబుల్',
    fullAddress: 'పూర్తి చిరునామా',
    district: 'జిల్లా',
    city: 'నగరం',
    pincode: 'పిన్ కోడ్',
    landmark: 'ల్యాండ్‌మార్క్ (ఐచ్ఛికం)',
    noAddresses: 'సేవ్ చేసిన చిరునామాలు లేవు',
    noAddressesDesc: 'త్వరిత సేవ బుకింగ్ కోసం మీ చిరునామాను జోడించండి.',
    saving: 'సేవ్ అవుతోంది...',
    saved: 'చిరునామా విజయవంతంగా సేవ్ చేయబడింది!',
    updated: 'చిరునామా నవీకరించబడింది!',
    deleted: 'చిరునామా తొలగించబడింది.',
    error: 'ఆపరేషన్ విఫలమైంది.',
    confirmDelete: 'మీరు ఈ చిరునామాను తొలగించాలనుకుంటున్నారా?',
    labelHome: 'ఇల్లు',
    labelOffice: 'కార్యాలయం',
    labelWork: 'కార్యస్థలం',
    labelOther: 'ఇతరం',
  },
};

const labelIcons = {
  Home: Home,
  Office: Building2,
  'Work Site': Briefcase,
  Other: MapPin,
};

const labelPresets = ['Home', 'Office', 'Work Site', 'Other'];

const emptyForm = {
  label: 'Home',
  full_address: '',
  district: '',
  city: '',
  pincode: '',
  landmark: '',
  is_default: false,
};

export default function SavedAddresses() {
  const { lang } = useLanguage();
  const t = i18n[lang] || i18n.EN;

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const loadAddresses = useCallback(async () => {
    try {
      const data = await api.getSavedAddresses();
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleSubmit = async () => {
    if (!form.full_address || form.full_address.trim().length < 5) {
      setMessage({ type: 'error', text: 'Please enter a valid full address (min 5 characters).' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      if (editingId) {
        await api.updateSavedAddress(editingId, form);
        setMessage({ type: 'success', text: t.updated });
      } else {
        await api.createSavedAddress(form);
        setMessage({ type: 'success', text: t.saved });
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      await loadAddresses();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || t.error });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label || 'Home',
      full_address: addr.full_address || '',
      district: addr.district || '',
      city: addr.city || '',
      pincode: addr.pincode || '',
      landmark: addr.landmark || '',
      is_default: !!addr.is_default,
    });
    setShowForm(true);
    setMessage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await api.deleteSavedAddress(id);
      setMessage({ type: 'success', text: t.deleted });
      await loadAddresses();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || t.error });
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      await api.updateSavedAddress(addr.id, { ...addr, is_default: true });
      await loadAddresses();
      setMessage({ type: 'success', text: t.updated });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || t.error });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="container py-20 max-w-xl mx-auto">
        <CivicLoader title="Loading Addresses..." subtitle="Fetching your saved address book." size="md" />
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Navigation size={22} className="text-emerald-600 dark:text-emerald-400" />
              {t.pageTitle}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.pageSubtitle}</p>
          </div>
          {!showForm && (
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...emptyForm }); setMessage(null); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm cursor-pointer"
            >
              <Plus size={15} />
              {t.addNew}
            </button>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {message && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 border ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {message.text}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-950/20">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <MapPin size={15} className="text-emerald-600 dark:text-emerald-400" />
              {editingId ? t.update : t.addNew}
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {/* Label Presets */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{t.label}</label>
              <div className="flex flex-wrap gap-2">
                {labelPresets.map((preset) => {
                  const tKey = `label${preset.replace(' ', '')}`;
                  const LabelIcon = labelIcons[preset] || MapPin;
                  const isActive = form.label === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setForm({ ...form, label: preset })}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <LabelIcon size={13} />
                      {t[tKey] || preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{t.fullAddress} *</label>
              <textarea
                value={form.full_address}
                onChange={(e) => setForm({ ...form, full_address: e.target.value })}
                placeholder="e.g. Plot No 42, Saheed Nagar, Near Big Bazaar"
                rows={2}
                className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{t.district}</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  placeholder="e.g. Khordha"
                  className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{t.city}</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Bhubaneswar"
                  className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{t.pincode}</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  placeholder="751001"
                  maxLength={6}
                  className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{t.landmark}</label>
              <input
                type="text"
                value={form.landmark}
                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                placeholder="e.g. Near Esplanade Mall"
                className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              />
            </div>

            {/* Default Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                className="w-4 h-4 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t.setDefault}</span>
            </label>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? t.saving : editingId ? t.update : t.save}
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer"
              >
                <X size={14} />
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-16 px-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <MapPin size={36} className="text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-2">{t.noAddresses}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">{t.noAddressesDesc}</p>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...emptyForm }); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            {t.addNew}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const LabelIcon = labelIcons[addr.label] || MapPin;
            return (
              <div
                key={addr.id}
                className={`relative bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                  addr.is_default
                    ? 'border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-800'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Top ribbon */}
                <div className={`px-4 py-2.5 flex items-center justify-between ${
                  addr.is_default
                    ? 'bg-emerald-50 dark:bg-emerald-950/20'
                    : 'bg-slate-50 dark:bg-slate-800/50'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      addr.is_default
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      <LabelIcon size={14} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{addr.label}</span>
                    {addr.is_default ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        <Star size={9} className="fill-current" />
                        {t.defaultBadge}
                      </span>
                    ) : null}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {!addr.is_default && (
                      <button
                        onClick={() => handleSetDefault(addr)}
                        title={t.setDefault}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition cursor-pointer"
                      >
                        <Star size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(addr)}
                      title={t.edit}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition cursor-pointer"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      title={t.delete}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Address Content */}
                <div className="p-4 space-y-2">
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {addr.full_address}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {addr.district && (
                      <span className="flex items-center gap-1">
                        <Building2 size={10} />
                        {addr.district}
                      </span>
                    )}
                    {addr.city && (
                      <span className="flex items-center gap-1">
                        <Building2 size={10} />
                        {addr.city}
                      </span>
                    )}
                    {addr.pincode && (
                      <span className="flex items-center gap-1">
                        <Hash size={10} />
                        {addr.pincode}
                      </span>
                    )}
                  </div>
                  {addr.landmark && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                      📍 {addr.landmark}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
