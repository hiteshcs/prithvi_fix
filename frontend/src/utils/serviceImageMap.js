// Mapping of 47 Services, Categories, Banners, and Trust Assets

export const CATEGORY_IMAGE_MAP = {
  'Electrical': '/images/categories/cat_electrician.png',
  'Plumbing': '/images/services/service_tap_repair.jpg',
  'Appliance Repair': '/images/categories/cat_ac_appliance.png',
  'AC & Appliance Repair': '/images/categories/cat_ac_appliance.png',
  'Carpentry': '/images/categories/cat_carpentry.png',
  'Painting': '/images/categories/cat_painting.png',
  'Cleaning': '/images/categories/cat_cleaning.png',
  'Gardening': '/images/categories/cat_gardening.png',
  'Caregiving': '/images/ui/onboarding_slide_3.png',
  'Driving': '/images/services/service_city_chauffeur.jpg',
  'Driving & Transport': '/images/services/service_city_chauffeur.jpg',
  'Emergency Services': '/images/banners/banner_emergency_squad.png',
  'Domestic Services': '/images/categories/cat_cleaning.png',
  'Technician Services': '/images/categories/cat_electrician.png'
};

export const PROMO_BANNERS = [
  {
    id: 'ac_fest',
    title: 'Summer AC Foam-Jet Festival',
    tag: 'Seasonal Special',
    desc: 'Deep indoor & outdoor chemical pressure wash with 30-day cooling warranty.',
    price: '₹449',
    unit: 'per unit',
    image: '/images/banners/banner_ac_fest.png',
    link: '/services?category=Appliance+Repair&search=AC',
    badgeColor: 'bg-blue-600 text-white',
    accent: 'border-blue-200'
  },
  {
    id: 'monsoon_waterproof',
    title: 'Monsoon Waterproofing & Seepage Shield',
    tag: 'Weather Armor',
    desc: '3-Layer elastomeric polymer membrane & chemical injection damp treatment.',
    price: '₹28',
    unit: 'per sqft',
    image: '/images/banners/banner_monsoon_waterproof.png',
    link: '/services?category=Painting&search=Waterproof',
    badgeColor: 'bg-emerald-600 text-white',
    accent: 'border-emerald-200'
  },
  {
    id: 'electrical_safety',
    title: 'Home Electrical & MCB Safety Audit',
    tag: 'Govt Certified',
    desc: 'Megger earth resistance check, 3-phase load balance & short-circuit protection.',
    price: '₹399',
    unit: 'inspection',
    image: '/images/banners/banner_electrical_safety.png',
    link: '/services?category=Electrical',
    badgeColor: 'bg-amber-600 text-white',
    accent: 'border-amber-200'
  },
  {
    id: 'emergency_squad',
    title: '24/7 Rapid Emergency Response Squad',
    tag: '< 60 Mins Dispatch',
    desc: 'Fast containment for pipe bursts, main line power cuts, and lockouts.',
    price: '₹499',
    unit: 'priority visit',
    image: '/images/banners/banner_emergency_squad.png',
    link: '/services?category=Emergency+Services',
    badgeColor: 'bg-red-600 text-white',
    accent: 'border-red-200'
  }
];

export const TRUST_BADGES = [
  {
    id: 'verified',
    title: '100% Skill Verified',
    desc: 'NSDC & NCCT Certified Artisans',
    image: '/images/trust/trust_verified_artisan.png'
  },
  {
    id: 'warranty',
    title: '30-Day Free Warranty',
    desc: 'Prithvi Suraksha guarantee cover',
    image: '/images/trust/trust_30day_warranty.png'
  },
  {
    id: 'fair_wage',
    title: 'Zero Surge • 93% Wage',
    desc: 'Statutory living wage for workers',
    image: '/images/trust/trust_fair_wage.png'
  },
  {
    id: 'otp',
    title: 'Dual OTP Handshake',
    desc: 'Arrival & completion verification',
    image: '/images/trust/trust_dual_otp.png'
  }
];

// Exact keyword mapping for 47 granular services
const SERVICE_KEYWORD_IMAGE_MAP = [
  // AC & Appliances
  { match: ['ac gas', 'gas leak', 'refill'], image: '/images/services/service_ac_gas_refill.jpg' },
  { match: ['split ac installation', 'relocation'], image: '/images/services/service_ac_install.jpg' },
  { match: ['jet clean', 'foam-jet', 'split ac deep'], image: '/images/services/service_ac_jet_clean.jpg' },
  { match: ['inverter ac pcb', 'pcb diagnostics'], image: '/images/services/service_short_circuit.jpg' },
  { match: ['refrigerator', 'fridge'], image: '/images/services/service_fridge_repair.jpg' },
  { match: ['washing machine'], image: '/images/services/service_washing_machine.jpg' },
  { match: ['chimney', 'hob'], image: '/images/services/service_chimney_degrease.jpg' },
  { match: ['microwave'], image: '/images/services/service_microwave_repair.jpg' },

  // Electrical
  { match: ['switch', 'socket', 'modular plate'], image: '/images/services/service_switch_socket.jpg' },
  { match: ['ceiling fan'], image: '/images/services/service_ceiling_fan.jpg' },
  { match: ['mcb', 'distribution board'], image: '/images/services/service_short_circuit.jpg' },
  { match: ['inverter & battery', 'battery home'], image: '/images/services/service_house_rewiring.jpg' },
  { match: ['rewiring', 'house wiring'], image: '/images/services/service_house_rewiring.jpg' },
  { match: ['chandelier', 'pendant light'], image: '/images/services/service_chandelier_install.jpg' },
  { match: ['ev charger', 'four-wheeler home'], image: '/images/services/service_ev_charger.jpg' },
  { match: ['geyser', 'water heater'], image: '/images/services/service_geyser_repair.jpg' },
  { match: ['short circuit', 'power outage'], image: '/images/services/service_short_circuit.jpg' },

  // Plumbing
  { match: ['tap', 'spout', 'flush valve'], image: '/images/services/service_tap_repair.jpg' },
  { match: ['commode', 'ewc', 'cistern'], image: '/images/services/service_commode_install.jpg' },
  { match: ['water tank', 'tank clean'], image: '/images/services/service_water_tank_clean.jpg' },
  { match: ['booster pump', 'water pump'], image: '/images/services/service_booster_pump.jpg' },
  { match: ['diverter'], image: '/images/services/service_diverter_overhaul.jpg' },
  { match: ['drain', 'sewer', 'pipe de-clog'], image: '/images/services/service_drain_declog.jpg' },
  { match: ['purifier', 'ro + uv', 'filter replace'], image: '/images/services/service_water_purifier.jpg' },
  { match: ['burst containment', 'burst'], image: '/images/services/service_tap_repair.jpg' },

  // Carpentry
  { match: ['flatpack', 'furniture assembly', 'wardrobe'], image: '/images/services/service_furniture_assembly.jpg' },
  { match: ['mortise lock', 'door lock', 'locksmith'], image: '/images/services/service_mortise_lock.jpg' },
  { match: ['hydraulic hinge', 'kitchen soft-close'], image: '/images/services/service_kitchen_hinge.jpg' },
  { match: ['door planing', 'planing'], image: '/images/services/service_door_planing.jpg' },
  { match: ['sliding window', 'roller & track'], image: '/images/services/service_window_roller.jpg' },
  { match: ['spirit & wood', 'pu polish', 'polish'], image: '/images/services/service_wood_polish.jpg' },

  // Painting
  { match: ['interior luxury', 'silk emulsion', 'interior painting'], image: '/images/services/service_interior_painting.jpg' },
  { match: ['terrace chemical', 'elastomeric', 'terrace waterproof'], image: '/images/services/service_terrace_waterproof.jpg' },
  { match: ['weathercoat', 'exterior anti-fungal', 'exterior painting'], image: '/images/services/service_exterior_painting.jpg' },
  { match: ['wall putty'], image: '/images/services/service_wall_putty.jpg' },
  { match: ['seepage damp', 'injection grouting', 'seepage'], image: '/images/services/service_seepage_grouting.jpg' },

  // Cleaning & Pest Control
  { match: ['full apartment', 'deep machine clean'], image: '/images/services/service_apartment_clean.jpg' },
  { match: ['kitchen oil', 'grease descaling'], image: '/images/services/service_kitchen_degrease.jpg' },
  { match: ['bathroom acid', 'grout restoration'], image: '/images/services/service_bathroom_descaling.jpg' },
  { match: ['sofa & mattress', 'foam shampoo'], image: '/images/services/service_sofa_extraction.jpg' },
  { match: ['cockroach', 'pest barrier', 'pest control'], image: '/images/services/service_pest_control.jpg' },

  // Gardening, Caregiving, Driving
  { match: ['lawn mowing', 'landscape shrub'], image: '/images/services/service_lawn_mowing.jpg' },
  { match: ['drip automation', 'terrace garden micro'], image: '/images/services/service_drip_irrigation.jpg' },
  { match: ['elderly bedside', 'bedside attendant'], image: '/images/ui/onboarding_slide_3.png' },
  { match: ['post-operative', 'nursing visit', 'dressing'], image: '/images/ui/onboarding_slide_2.png' },
  { match: ['city chauffeur', '8-hour shift'], image: '/images/services/service_city_chauffeur.jpg' },
  { match: ['outstation', 'highway chauffeur'], image: '/images/services/service_highway_chauffeur.jpg' },
];

export function getServiceImage(serviceName = '', category = '') {
  const normName = serviceName.toLowerCase();

  for (const item of SERVICE_KEYWORD_IMAGE_MAP) {
    if (item.match.some((keyword) => normName.includes(keyword))) {
      return item.image;
    }
  }

  // Fallback to Category Image if specific service image is not matched
  if (category && CATEGORY_IMAGE_MAP[category]) {
    return CATEGORY_IMAGE_MAP[category];
  }

  // General default fallback
  return '/images/banners/banner_emergency_squad.png';
}

export const TRUST_BADGES = [
  {
    id: 'verified',
    title: '100% Verified Artisans',
    desc: 'Police background & trade certificate verified',
    image: '/images/trust/trust_verified_artisan.png'
  },
  {
    id: 'fair_wage',
    title: 'Fair Wage Guarantee',
    desc: '93% direct worker payout under cooperative model',
    image: '/images/trust/trust_fair_wage.png'
  },
  {
    id: 'warranty',
    title: '30-Day Free Warranty',
    desc: 'Comprehensive post-service rework protection',
    image: '/images/trust/trust_30day_warranty.png'
  },
  {
    id: 'dual_otp',
    title: 'Dual OTP Escrow',
    desc: 'Escrow release only after customer completion OTP',
    image: '/images/trust/trust_dual_otp.png'
  }
];

