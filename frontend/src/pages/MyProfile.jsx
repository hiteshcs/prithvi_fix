import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import CivicLoader from '../components/CivicLoader';
import {
  User, Mail, Phone, MapPin, Building2, Hash, Shield, Star,
  Award, Briefcase, CheckCircle2, Edit3, Save, X, Calendar,
  BadgeCheck, AlertCircle, CreditCard, Wrench, Clock
} from 'lucide-react';

const i18n = {
  EN: {
    pageTitle: 'My Profile',
    pageSubtitle: 'View and manage your cooperative member profile',
    personalInfo: 'Personal Information',
    contactDetails: 'Contact Details',
    addressInfo: 'Address & Location',
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    name: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    district: 'District',
    city: 'City / Town',
    address: 'Full Address',
    pincode: 'PIN Code',
    role: 'Account Role',
    memberSince: 'Member Since',
    saving: 'Saving...',
    saved: 'Profile updated successfully!',
    error: 'Failed to update profile. Please try again.',
    workerProfile: 'Worker Profile',
    workerCode: 'Worker Code',
    trade: 'Primary Trade',
    experience: 'Experience',
    rating: 'Rating',
    totalJobs: 'Jobs Completed',
    totalEarnings: 'Total Earnings',
    tier: 'Artisan Tier',
    verificationStatus: 'Verification',
    cooperative: 'Cooperative',
    society: 'Society',
    years: 'years',
  },
  HI: {
    pageTitle: 'मेरी प्रोफ़ाइल',
    pageSubtitle: 'अपनी सहकारी सदस्य प्रोफ़ाइल देखें और प्रबंधित करें',
    personalInfo: 'व्यक्तिगत जानकारी',
    contactDetails: 'संपर्क विवरण',
    addressInfo: 'पता और स्थान',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    saveChanges: 'परिवर्तन सहेजें',
    cancel: 'रद्द करें',
    name: 'पूरा नाम',
    email: 'ईमेल पता',
    phone: 'फ़ोन नंबर',
    district: 'जिला',
    city: 'शहर / कस्बा',
    address: 'पूरा पता',
    pincode: 'पिन कोड',
    role: 'खाता प्रकार',
    memberSince: 'सदस्यता तिथि',
    saving: 'सहेज रहे हैं...',
    saved: 'प्रोफ़ाइल सफलतापूर्वक अपडेट हुई!',
    error: 'प्रोफ़ाइल अपडेट विफल। कृपया पुनः प्रयास करें।',
    workerProfile: 'कारीगर प्रोफ़ाइल',
    workerCode: 'कारीगर कोड',
    trade: 'प्राथमिक कार्य',
    experience: 'अनुभव',
    rating: 'रेटिंग',
    totalJobs: 'पूर्ण कार्य',
    totalEarnings: 'कुल आय',
    tier: 'कारीगर श्रेणी',
    verificationStatus: 'सत्यापन',
    cooperative: 'सहकारी',
    society: 'समिति',
    years: 'वर्ष',
  },
  OR: {
    pageTitle: 'ମୋ ପ୍ରୋଫାଇଲ୍',
    pageSubtitle: 'ଆପଣଙ୍କ ସମବାୟ ସଦସ୍ୟ ପ୍ରୋଫାଇଲ୍ ଦେଖନ୍ତୁ ଏବଂ ପରିଚାଳନା କରନ୍ତୁ',
    personalInfo: 'ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ',
    contactDetails: 'ଯୋଗାଯୋଗ ବିବରଣୀ',
    addressInfo: 'ଠିକଣା ଏବଂ ସ୍ଥାନ',
    editProfile: 'ପ୍ରୋଫାଇଲ୍ ସମ୍ପାଦନ',
    saveChanges: 'ପରିବର୍ତ୍ତନ ସେଭ୍ କରନ୍ତୁ',
    cancel: 'ବାତିଲ',
    name: 'ପୂରା ନାମ',
    email: 'ଇମେଲ୍',
    phone: 'ଫୋନ୍',
    district: 'ଜିଲ୍ଲା',
    city: 'ସହର',
    address: 'ପୂରା ଠିକଣା',
    pincode: 'ପିନ୍ କୋଡ୍',
    role: 'ଖାତା ଭୂମିକା',
    memberSince: 'ସଦସ୍ୟତା ତାରିଖ',
    saving: 'ସେଭ୍ ହେଉଛି...',
    saved: 'ପ୍ରୋଫାଇଲ୍ ସଫଳଭାବେ ଅପଡେଟ୍ ହୋଇଛି!',
    error: 'ପ୍ରୋଫାଇଲ୍ ଅପଡେଟ୍ ବିଫଳ। ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ।',
    workerProfile: 'ଶ୍ରମିକ ପ୍ରୋଫାଇଲ୍',
    workerCode: 'ଶ୍ରମିକ କୋଡ୍',
    trade: 'ମୁଖ୍ୟ ବୃତ୍ତି',
    experience: 'ଅଭିଜ୍ଞତା',
    rating: 'ରେଟିଂ',
    totalJobs: 'ସମ୍ପୂର୍ଣ୍ଣ କାର୍ଯ୍ୟ',
    totalEarnings: 'ମୋଟ ଆୟ',
    tier: 'କାରିଗର ସ୍ତର',
    verificationStatus: 'ସତ୍ୟାପନ',
    cooperative: 'ସମବାୟ',
    society: 'ସମିତି',
    years: 'ବର୍ଷ',
  },
  BN: {
    pageTitle: 'আমার প্রোফাইল',
    pageSubtitle: 'আপনার সমবায় সদস্য প্রোফাইল দেখুন এবং পরিচালনা করুন',
    personalInfo: 'ব্যক্তিগত তথ্য',
    contactDetails: 'যোগাযোগের বিবরণ',
    addressInfo: 'ঠিকানা ও অবস্থান',
    editProfile: 'প্রোফাইল সম্পাদনা',
    saveChanges: 'পরিবর্তন সংরক্ষণ',
    cancel: 'বাতিল',
    name: 'পুরো নাম',
    email: 'ইমেইল',
    phone: 'ফোন',
    district: 'জেলা',
    city: 'শহর',
    address: 'পূর্ণ ঠিকানা',
    pincode: 'পিন কোড',
    role: 'অ্যাকাউন্ট ভূমিকা',
    memberSince: 'সদস্যপদের তারিখ',
    saving: 'সংরক্ষণ করা হচ্ছে...',
    saved: 'প্রোফাইল সফলভাবে আপডেট হয়েছে!',
    error: 'প্রোফাইল আপডেট ব্যর্থ।',
    workerProfile: 'শ্রমিক প্রোফাইল',
    workerCode: 'শ্রমিক কোড',
    trade: 'প্রাথমিক পেশা',
    experience: 'অভিজ্ঞতা',
    rating: 'রেটিং',
    totalJobs: 'সম্পন্ন কাজ',
    totalEarnings: 'মোট উপার্জন',
    tier: 'কারিগর স্তর',
    verificationStatus: 'যাচাইকরণ',
    cooperative: 'সমবায়',
    society: 'সমিতি',
    years: 'বছর',
  },
  TE: {
    pageTitle: 'నా ప్రొఫైల్',
    pageSubtitle: 'మీ సహకార సభ్యత్వ ప్రొఫైల్ చూడండి మరియు నిర్వహించండి',
    personalInfo: 'వ్యక్తిగత సమాచారం',
    contactDetails: 'సంప్రదింపు వివరాలు',
    addressInfo: 'చిరునామా & స్థానం',
    editProfile: 'ప్రొఫైల్ సవరించు',
    saveChanges: 'మార్పులు సేవ్ చేయండి',
    cancel: 'రద్దు',
    name: 'పూర్తి పేరు',
    email: 'ఇమెయిల్',
    phone: 'ఫోన్',
    district: 'జిల్లా',
    city: 'నగరం',
    address: 'పూర్తి చిరునామా',
    pincode: 'పిన్ కోడ్',
    role: 'ఖాతా పాత్ర',
    memberSince: 'సభ్యత్వ తేదీ',
    saving: 'సేవ్ అవుతోంది...',
    saved: 'ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది!',
    error: 'ప్రొఫైల్ నవీకరణ విఫలమైంది.',
    workerProfile: 'కార్మిక ప్రొఫైల్',
    workerCode: 'కార్మిక కోడ్',
    trade: 'ప్రాథమిక వృత్తి',
    experience: 'అనుభవం',
    rating: 'రేటింగ్',
    totalJobs: 'పూర్తి చేసిన పనులు',
    totalEarnings: 'మొత్తం ఆదాయం',
    tier: 'కార్మిక స్థాయి',
    verificationStatus: 'ధృవీకరణ',
    cooperative: 'సహకార',
    society: 'సమాజం',
    years: 'సంవత్సరాలు',
  },
};

const roleLabels = {
  CUSTOMER: 'Citizen / Customer',
  WORKER: 'Registered Artisan / Worker',
  COOPERATIVE_ADMIN: 'Cooperative Administrator',
};

const tierColors = {
  BRONZE: 'bg-amber-800/20 text-amber-700 border-amber-600/30',
  SILVER: 'bg-slate-200/40 text-slate-700 border-slate-400/40',
  GOLD: 'bg-yellow-100 text-yellow-800 border-yellow-400/50',
  MASTER: 'bg-purple-100 text-purple-800 border-purple-400/50',
};

const verifyColors = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-300',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  REJECTED: 'bg-red-50 text-red-700 border-red-300',
};

export default function MyProfile() {
  const { user, workerProfile, refreshUser } = useAuth();
  const { lang } = useLanguage();
  const t = i18n[lang] || i18n.EN;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    district: '',
    city: '',
    address: '',
    pincode: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        district: user.district || '',
        city: user.city || '',
        address: user.address || '',
        pincode: user.pincode || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.updateProfile(form);
      if (refreshUser) {
        await refreshUser();
      }
      setMessage({ type: 'success', text: t.saved });
      setEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || t.error });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-20 max-w-xl mx-auto">
        <CivicLoader title="Loading Profile..." subtitle="Fetching your cooperative member data." size="md" />
      </div>
    );
  }

  const isWorker = user.role === 'WORKER';
  const wp = workerProfile;

  return (
    <div className="container py-6 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User size={22} className="text-blue-600 dark:text-blue-400" />
              {t.pageTitle}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.pageSubtitle}</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm cursor-pointer"
            >
              <Edit3 size={14} />
              {t.editProfile}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? t.saving : t.saveChanges}
              </button>
              <button
                onClick={() => { setEditing(false); setMessage(null); setForm({ name: user.name || '', phone: user.phone || '', district: user.district || '', city: user.city || '', address: user.address || '', pincode: user.pincode || '' }); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer"
              >
                <X size={14} />
                {t.cancel}
              </button>
            </div>
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

      {/* Profile Avatar Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 sm:p-6 mb-5 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-lg">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold truncate">{user.name}</h2>
            <p className="text-xs text-blue-100 truncate">{user.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 border border-white/30">
                <Shield size={10} />
                {roleLabels[user.role] || user.role}
              </span>
              {isWorker && wp && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tierColors[wp.tier] || tierColors.BRONZE}`}>
                  <Award size={10} />
                  {wp.tier} Tier
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Personal Information Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <User size={15} className="text-blue-600 dark:text-blue-400" />
              {t.personalInfo}
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <ProfileField
              icon={<User size={15} />}
              label={t.name}
              value={form.name}
              editing={editing}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <ProfileField
              icon={<Mail size={15} />}
              label={t.email}
              value={user.email}
              editing={false}
              readOnly
            />
            <ProfileField
              icon={<Shield size={15} />}
              label={t.role}
              value={roleLabels[user.role] || user.role}
              editing={false}
              readOnly
            />
            <ProfileField
              icon={<Calendar size={15} />}
              label={t.memberSince}
              value={user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              editing={false}
              readOnly
            />
          </div>
        </div>

        {/* Contact & Address Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <MapPin size={15} className="text-emerald-600 dark:text-emerald-400" />
              {t.contactDetails} & {t.addressInfo}
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <ProfileField
              icon={<Phone size={15} />}
              label={t.phone}
              value={form.phone}
              editing={editing}
              onChange={(v) => setForm({ ...form, phone: v })}
              placeholder="+91 98765 43210"
            />
            <ProfileField
              icon={<Building2 size={15} />}
              label={t.district}
              value={form.district}
              editing={editing}
              onChange={(v) => setForm({ ...form, district: v })}
              placeholder="e.g. Khordha"
            />
            <ProfileField
              icon={<Building2 size={15} />}
              label={t.city}
              value={form.city}
              editing={editing}
              onChange={(v) => setForm({ ...form, city: v })}
              placeholder="e.g. Bhubaneswar"
            />
            <ProfileField
              icon={<MapPin size={15} />}
              label={t.address}
              value={form.address}
              editing={editing}
              onChange={(v) => setForm({ ...form, address: v })}
              placeholder="Full street address"
              multiline
            />
            <ProfileField
              icon={<Hash size={15} />}
              label={t.pincode}
              value={form.pincode}
              editing={editing}
              onChange={(v) => setForm({ ...form, pincode: v })}
              placeholder="751001"
            />
          </div>
        </div>
      </div>

      {/* Worker Profile Section (only for workers) */}
      {isWorker && wp && (
        <div className="mt-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-950/20">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Wrench size={15} className="text-emerald-600 dark:text-emerald-400" />
              {t.workerProfile}
            </h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <WorkerStat icon={<BadgeCheck size={16} />} label={t.workerCode} value={wp.worker_code || '—'} />
              <WorkerStat icon={<Wrench size={16} />} label={t.trade} value={wp.primary_trade || '—'} />
              <WorkerStat icon={<Clock size={16} />} label={t.experience} value={`${wp.experience_years || 0} ${t.years}`} />
              <WorkerStat icon={<Star size={16} />} label={t.rating} value={wp.rating ? `${Number(wp.rating).toFixed(1)} ★` : '—'} />
              <WorkerStat icon={<Briefcase size={16} />} label={t.totalJobs} value={wp.total_jobs_completed || 0} />
              <WorkerStat icon={<CreditCard size={16} />} label={t.totalEarnings} value={`₹${Number(wp.total_earnings || 0).toLocaleString('en-IN')}`} />
              <WorkerStat icon={<Award size={16} />} label={t.tier} value={wp.tier || 'BRONZE'} badge badgeClass={tierColors[wp.tier]} />
              <WorkerStat
                icon={<Shield size={16} />}
                label={t.verificationStatus}
                value={wp.verification_status || 'PENDING'}
                badge
                badgeClass={verifyColors[wp.verification_status]}
              />
              {wp.cooperative_name && (
                <WorkerStat icon={<Building2 size={16} />} label={t.cooperative} value={wp.cooperative_name} />
              )}
              {wp.society_name && (
                <WorkerStat icon={<Building2 size={16} />} label={t.society} value={wp.society_name} />
              )}
            </div>

            {/* Bio */}
            {wp.bio && (
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bio</div>
                <p className="text-xs text-slate-700 dark:text-slate-300">{wp.bio}</p>
              </div>
            )}

            {/* Skills */}
            {wp.skills && wp.skills.length > 0 && (
              <div className="mt-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Certified Skills</div>
                <div className="flex flex-wrap gap-2">
                  {wp.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    >
                      <CheckCircle2 size={10} />
                      {skill.name}
                      {skill.proficiency_level && <span className="text-[9px] text-blue-400 ml-1">({skill.proficiency_level})</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileField({ icon, label, value, editing, onChange, readOnly, placeholder, multiline }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</div>
        {editing && !readOnly ? (
          multiline ? (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={2}
              className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          )
        ) : (
          <div className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate">{value || '—'}</div>
        )}
      </div>
    </div>
  );
}

function WorkerStat({ icon, label, value, badge, badgeClass }) {
  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      {badge ? (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${badgeClass || 'bg-slate-100 text-slate-700 border-slate-300'}`}>
          {value}
        </span>
      ) : (
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{value}</div>
      )}
    </div>
  );
}
