/**
 * Localization & Multilingual Dictionary Controller
 * Supports Indian regional languages + English
 */

const LOCALES = {
  EN: {
    code: 'EN',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    dictionary: {
      portalTitle: 'National Cooperative Labour Services Federation Portal',
      brandName: 'Prithvi Fix',
      brandSubtitle: 'Cooperative Gig Services Platform',
      tagline: 'Verified Skills. Fair Work. Stronger Communities.',
      heroTitle: 'Trusted Services. Cooperative Workers. Stronger Communities.',
      heroSubtitle: 'Connect with certified, background-verified skilled professionals affiliated with regional Labour Cooperative Federations across India.',
      navHome: 'Home',
      navServices: 'Services',
      navFindWorker: 'Find Worker',
      navBookService: 'Book Service',
      navAbout: 'About',
      navHelp: 'Help & Grievances',
      btnBookNow: 'Book a Service',
      btnFindWorker: 'Find a Worker',
      btnJoinWorker: 'Are you a skilled worker? Join your local Cooperative Federation →',
      btnPayNow: 'Pay via UPI / Card',
      btnRateWorker: 'Rate & Review Service',
      btnViewInvoice: 'View Official Tax Invoice',
      categories: {
        Electrical: 'Electrical Repair & Wiring',
        Plumbing: 'Plumbing & Pipe Fitting',
        Carpentry: 'Carpentry & Furniture',
        Painting: 'Painting & Wall Coating',
        Cleaning: 'Deep Cleaning & Sanitation',
        Gardening: 'Gardening & Landscaping',
        Caregiving: 'Elder & Patient Caregiving',
        Driving: 'Commercial & Personal Driving',
        Appliance: 'AC & Appliance Repair',
        Domestic: 'Domestic Helper & Cooking',
        Technician: 'CCTV & IT Technician',
        Emergency: '24/7 Priority Emergency Services',
      },
      welfare: {
        esic: 'ESIC Group Accident Insurance (Rs. 2,00,000 Coverage)',
        health: 'Cooperative Health Support & Free Annual Checkup',
        nsdc: 'NSDC & Vocational Trade Upskilling Workshop',
        epfo: 'EPFO Social Security & Retirement Pension',
        emergencyLoan: 'Cooperative Emergency Family Assistance Fund',
      },
    },
  },
  HI: {
    code: 'HI',
    name: 'Hindi',
    nativeName: 'हिंदी',
    direction: 'ltr',
    dictionary: {
      portalTitle: 'राष्ट्रीय श्रम सहकारी सेवा पोर्टल',
      brandName: 'पृथ्वी फिक्स',
      brandSubtitle: 'सहकारी गिग सेवा मंच',
      tagline: 'सत्यापित कौशल। उचित कार्य। सशक्त समुदाय।',
      heroTitle: 'विश्वसनीय सेवाएँ। सहकारी श्रमिक। सशक्त समुदाय।',
      heroSubtitle: 'ओडिशा भर के क्षेत्रीय श्रम सहकारी संघों से जुड़े प्रमाणित, पृष्ठभूमि-सत्यापित कुशल पेशेवरों से जुड़ें।',
      navHome: 'होम',
      navServices: 'सेवाएं',
      navFindWorker: 'श्रमिक खोजें',
      navBookService: 'सेवा बुक करें',
      navAbout: 'हमारे बारे में',
      navHelp: 'सहायता एवं शिकायतें',
      btnBookNow: 'सेवा बुक करें',
      btnFindWorker: 'श्रमिक खोजें',
      btnJoinWorker: 'क्या आप एक कुशल श्रमिक हैं? अपने स्थानीय सहकारी संघ से जुड़ें →',
      btnPayNow: 'यूपीआई / कार्ड से भुगतान करें',
      btnRateWorker: 'रेटिंग और समीक्षा दें',
      btnViewInvoice: 'आधिकारिक टैक्स चालान देखें',
      categories: {
        Electrical: 'विद्युत मरम्मत एवं वायरिंग',
        Plumbing: 'नलसाजी (प्लंबर) कार्य',
        Carpentry: 'बढ़ईगीरी एवं फर्नीचर',
        Painting: 'पेंटिंग एवं दीवार फिनिशिंग',
        Cleaning: 'गहन सफाई एवं स्वच्छता',
        Gardening: 'बागवानी एवं भू-निर्माण',
        Caregiving: 'बुजुर्ग एवं रोगी देखभाल',
        Driving: 'वाहन चालक (ड्राइवर)',
        Appliance: 'एसी एवं उपकरण मरम्मत',
        Domestic: 'घरेलू सहायता एवं रसोइया',
        Technician: 'सीसीटीवी एवं आईटी तकनीशियन',
        Emergency: '24/7 आपातकालीन सेवाएँ',
      },
      welfare: {
        esic: 'ईएसआईसी समूह दुर्घटना बीमा (₹2,00,000 कवरेज)',
        health: 'सहकारी स्वास्थ्य सहायता एवं वार्षिक जांच',
        nsdc: 'एनएसडीसी एवं आईटीआई कौशल उन्नयन कार्यशाला',
        epfo: 'ईपीएफओ सामाजिक सुरक्षा एवं पेंशन कोष',
        emergencyLoan: 'सहकारी आपातकालीन परिवार सहायता कोष',
      },
    },
  },
  OR: {
    code: 'OR',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    direction: 'ltr',
    dictionary: {
      portalTitle: 'ଶ୍ରମ ସମବାୟ ସେବା ପୋର୍ଟାଲ',
      brandName: 'ପୃଥିବୀ ଫିକ୍ସ',
      brandSubtitle: 'ସମବାୟ ଗିଗ୍ ସେବା ମଞ୍ଚ',
      tagline: 'ଯାଞ୍ଚ ହୋଇଥିବା ଦକ୍ଷତା। ନ୍ୟାଯ୍ୟ କାର୍ଯ୍ୟ। ସଶକ୍ତ ସମୁଦାୟ।',
      heroTitle: 'ବିଶ୍ୱସନୀୟ ସେବା। ସମବାୟ ଶ୍ରମିକ। ସଶକ୍ତ ସମାଜ।',
      heroSubtitle: 'ଓଡ଼ିଶାର ଆଞ୍ଚଳିକ ଶ୍ରମ ସମବାୟ ମହାସଂଘ ସହିତ ଜଡ଼ିତ ପ୍ରମାଣିତ ତଥା ପୃଷ୍ଠଭୂମି-ଯାଞ୍ଚ ହୋଇଥିବା କୁଶଳୀ ଶ୍ରମିକମାନଙ୍କ ସହିତ ସଂଯୋଗ କରନ୍ତୁ।',
      navHome: 'ମୂଳ ପୃଷ୍ଠା',
      navServices: 'ସେବା ସମୂହ',
      navFindWorker: 'ଶ୍ରମିକ ଖୋଜନ୍ତୁ',
      navBookService: 'ସେବା ବୁକ୍ କରନ୍ତୁ',
      navAbout: 'ଆମ ବିଷୟରେ',
      navHelp: 'ସହାୟତା ଓ ଅଭିଯୋଗ',
      btnBookNow: 'ସେବା ବୁକ୍ କରନ୍ତୁ',
      btnFindWorker: 'ଶ୍ରମିକ ଖୋଜନ୍ତୁ',
      btnJoinWorker: 'ଆପଣ ଜଣେ କୁଶଳୀ ଶ୍ରମିକ କି? ନିଜ ସ୍ଥାନୀୟ ସମବାୟ ସମିତିରେ ଯୋଗ ଦିଅନ୍ତୁ →',
      btnPayNow: 'ୟୁପିଆଇ / କାର୍ଡ ମାଧ୍ୟମରେ ଦେୟ ପ୍ରଦାନ କରନ୍ତୁ',
      btnRateWorker: 'ମତାମତ ଏବଂ ରେଟିଂ ଦିଅନ୍ତୁ',
      btnViewInvoice: 'ଆଧିକାରିକ ଟିକସ ଚାଲାଣ ଦେଖନ୍ତୁ',
      categories: {
        Electrical: 'ବିଦ୍ୟୁତ୍ ମରାମତି ଓ ୱେୟାରିଂ',
        Plumbing: 'ପ୍ଲମ୍ବିଂ / ନଳକୂପ କାର୍ଯ୍ୟ',
        Carpentry: 'କାଠ କାର୍ଯ୍ୟ ଓ ଆସବାବପତ୍ର',
        Painting: 'ରଙ୍ଗ କାର୍ଯ୍ୟ (ପେଣ୍ଟିଂ)',
        Cleaning: 'ସଫେଇ ଓ ପରିମଳ ସେବା',
        Gardening: 'ବଗିଚା ରକ୍ଷଣାବେକ୍ଷଣ',
        Caregiving: 'ବୃଦ୍ଧ ଓ ରୋଗୀ ଯତ୍ନ ସେବା',
        Driving: 'ଡ୍ରାଇଭର ସେବା',
        Appliance: 'ଏସି ଓ ଉପକରଣ ମରାମତି',
        Domestic: 'ଘରୋଇ ସହାୟତା ଓ ରୋଷେଇ',
        Technician: 'ସିସିଟିଭି ଓ ଆଇଟି ଟେକ୍ନିସିଆନ୍',
        Emergency: '୨୪/୭ ଜରୁରୀକାଳୀନ ସେବା',
      },
      welfare: {
        esic: 'ଇଏସଆଇସି ଦୁର୍ଘଟଣା ବୀମା (୨,୦୦,୦୦୦ ଟଙ୍କା ପର୍ଯ୍ୟନ୍ତ)',
        health: 'ସମବାୟ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟତା ଓ ମାଗଣା ସ୍ୱାସ୍ଥ୍ୟ ପରୀକ୍ଷା',
        nsdc: 'ଏନଏସଡିସି ଓ ଆଇଟିଆଇ ବାଣିଜ୍ୟ ତାଲିମ ଶିବିର',
        epfo: 'ଇପିଏଫଓ ସାମାଜିକ ସୁରକ୍ଷା ଓ ପେନସନ',
        emergencyLoan: 'ସମବାୟ ଜରୁରୀକାଳୀନ ପରିବାର କଲ୍ୟାଣ ପାଣ୍ଠି',
      },
    },
  },
  BN: {
    code: 'BN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    direction: 'ltr',
    dictionary: {
      portalTitle: 'সমবায় শ্রম সেবা পোর্টাল',
      brandName: 'পৃথ্বী ফিক্স',
      brandSubtitle: 'সমবায় গিগ সেবা প্ল্যাটফর্ম',
      tagline: 'যাচাইকৃত দক্ষতা। ন্যায্য কাজ। শক্তিশালী সমাজ।',
      heroTitle: 'নির্ভরযোগ্য সেবা। সমবায় কর্মী। শক্তিশালী সমাজ।',
      heroSubtitle: 'আঞ্চলিক শ্রম সমবায় ফেডারেশনের সাথে যুক্ত দক্ষ ও যাচাইকৃত পেশাদারদের সাথে সংযোগ করুন।',
      navHome: 'হোম',
      navServices: 'পরিষেবাসমূহ',
      navFindWorker: 'কর্মী খুঁজুন',
      navBookService: 'পরিষেবা বুক করুন',
      navAbout: 'আমাদের সম্পর্কে',
      navHelp: 'সহায়তা',
      btnBookNow: 'বুক করুন',
      btnFindWorker: 'কর্মী খুঁজুন',
      btnJoinWorker: 'আপনি কি একজন দক্ষ কর্মী? আপনার স্থানীয় সমবায়ে যোগ দিন →',
      btnPayNow: 'ইউপিআই / কার্ড দিয়ে পেমেন্ট করুন',
      btnRateWorker: 'রেটিং ও পর্যালোচনা দিন',
      btnViewInvoice: 'অফিসিয়াল ট্যাক্স চালান দেখুন',
      categories: {
        Electrical: 'বৈদ্যুতিক মেরামত ও ওয়্যারিং',
        Plumbing: 'প্লাম্বিং ও পাইপ ফিটিং',
        Carpentry: 'কাঠের কাজ ও আসবাবপত্র',
        Painting: 'পেইন্টিং ও ওয়াল ফিনিশিং',
        Cleaning: 'পরিচ্ছন্নতা ও স্যানিটেশন',
        Gardening: 'বাগান পরিচর্যা',
        Caregiving: 'সেবাযত্ন ও পরিচর্যা',
        Driving: 'ড্রাইভার সেবা',
        Appliance: 'এসি ও যন্ত্রপাতি মেরামত',
        Domestic: 'গৃহস্থালি সাহায্য',
        Technician: 'সিসিটিভি ও আইটি প্রযুক্তিবিদ',
        Emergency: '২৪/৭ জরুরি পরিষেবা',
      },
      welfare: {
        esic: 'ইএসআইসি দুর্ঘটনা বিমা (২,০০,০০০ টাকা)',
        health: 'সমবায় স্বাস্থ্য সহায়তা ও বিনামূল্যে স্বাস্থ্য পরীক্ষা',
        nsdc: 'এনএসডিসি ও আইটিআই দক্ষতা উন্নয়ন কর্মশালা',
        epfo: 'ইপিএফও সামাজিক সুরক্ষা ও পেনশন',
        emergencyLoan: 'সমবায় জরুরি পরিবার সহায়তা তহবিল',
      },
    },
  },
  TE: {
    code: 'TE',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    direction: 'ltr',
    dictionary: {
      portalTitle: 'సహకార కార్మిక సేవల పోర్టల్',
      brandName: 'పృథ్వీ ఫిక్స్',
      brandSubtitle: 'సహకార గిగ్ సేవల వేదిక',
      tagline: 'ధృవీకరించబడిన నైపుణ్యాలు. న్యాయమైన పని. బలమైన సమాజం.',
      heroTitle: 'విశ్వసనీయ సేవలు. సహకార కార్మికులు. బలమైన సమాజం.',
      heroSubtitle: 'ప్రాంతీయ కార్మిక సహకార సమాఖ్యలతో అనుబంధించబడిన నైపుణ్యం కలిగిన నిపుణులతో కనెక్ట్ అవ్వండి.',
      navHome: 'హోమ్',
      navServices: 'సేవలు',
      navFindWorker: 'కార్మికుడిని కనుగొనండి',
      navBookService: 'సేవను బుక్ చేయండి',
      navAbout: 'మా గురించి',
      navHelp: 'సహాయం',
      btnBookNow: 'సేవ బుక్ చేయండి',
      btnFindWorker: 'కార్మికుడిని కనుగొనండి',
      btnJoinWorker: 'మీరు నైపుణ్యం కలిగిన కార్మికులా? మీ స్థానిక సహకార సంఘంలో చేరండి →',
      btnPayNow: 'యూపీఐ / కార్డ్ ద్వారా చెల్లించండి',
      btnRateWorker: 'రేటింగ్ మరియు సమీక్ష ఇవ్వండి',
      btnViewInvoice: 'అధికారిక పన్ను ఇన్‌వాయిస్ చూడండి',
      categories: {
        Electrical: 'ఎలక్ట్రికల్ మరమ్మతులు & వైరింగ్',
        Plumbing: 'ప్లంబింగ్ పనులు',
        Carpentry: 'వడ్రంగి & ఫర్నిచర్',
        Painting: 'పెయింటింగ్ పనులు',
        Cleaning: 'శుభ్రపరచడం & శానిటైజేషన్',
        Gardening: 'తోటపని',
        Caregiving: 'సంరక్షణ సేవలు',
        Driving: 'డ్రైవర్ సేవలు',
        Appliance: 'ఏసీ & ఉపకరణాల మరమ్మతు',
        Domestic: 'గృహ సహాయం',
        Technician: 'సీసీటీవీ & ఐటీ టెక్నీషియన్',
        Emergency: '24/7 అత్యవసర సేవలు',
      },
      welfare: {
        esic: 'ఈఎస్‌ఐసీ ప్రమాద బీమా (రూ. 2,00,000 కవరేజ్)',
        health: 'సహకార ఆరోగ్య మద్దతు & ఉచిత తనిఖీ',
        nsdc: 'ఎన్‌ఎస్‌డీసీ నైపుణ్య శిక్షణ వర్క్‌షాప్',
        epfo: 'ఈపీఎఫ్‌ఓ సామాజిక భద్రత & పెన్షన్',
        emergencyLoan: 'సహకార అత్యవసర కుటుంబ సహాయ నిధి',
      },
    },
  },
};

/**
 * GET /api/localization/languages
 * Returns list of supported Indian languages + English
 */
function getSupportedLanguages(req, res) {
  const languages = Object.values(LOCALES).map((l) => ({
    code: l.code,
    name: l.name,
    nativeName: l.nativeName,
    direction: l.direction,
  }));
  res.json({ languages });
}

/**
 * GET /api/localization/:lang
 * Returns dictionary translations for requested language code
 */
function getLanguageDictionary(req, res) {
  const lang = (req.params.lang || 'EN').toUpperCase();
  const localeData = LOCALES[lang] || LOCALES.EN;
  res.json({
    language: localeData.code,
    name: localeData.name,
    nativeName: localeData.nativeName,
    dictionary: localeData.dictionary,
  });
}

/**
 * GET /api/localization/translate
 * Translates a single key or sentence dynamically
 */
function translateText(req, res) {
  const { key, lang = 'EN' } = req.query;
  const langCode = lang.toUpperCase();
  const locale = LOCALES[langCode] || LOCALES.EN;
  const translation = locale.dictionary[key] || LOCALES.EN.dictionary[key] || key;
  res.json({ key, lang: langCode, translation });
}

module.exports = {
  getSupportedLanguages,
  getLanguageDictionary,
  translateText,
};
