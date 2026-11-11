/**
 * Prithvi Fix — Regulated Cooperative Rate Card & Suraksha Cover Data
 * Implements the 93-2-5 Cooperative Economic Model:
 * 93% to Certified Artisan, 2% to Platform Operations, 5% to Worker Social Security & ESIC Health Fund.
 * 
 * Rates are 20% to 50% more affordable than commercial aggregator apps (Urban Company).
 */

export const MODEL_9325 = {
  name: '93-2-5 Statutory Cooperative Tariff Model',
  artisanSharePct: 93,
  platformFeePct: 2,
  welfareFundPct: 5,
  labourCapNotice: 'Labour Charges are regulated by the Cooperative Federation and capped at ₹199–₹399 per appliance (vs ₹499 on commercial apps). All prices include standardized ISI spare parts with zero conveyance surcharge.',
  savingsNotice: 'Cooperative tariffs are 20% to 50% more affordable than commercial aggregator apps because there are no 30% venture-capital commissions or artificial surge multipliers.'
};

export const SURAKSHA_PROTECTION = {
  badge: 'Prithvi Suraksha Cover',
  title: 'End-to-End Service Protection',
  subtitle: 'Every booking made on Prithvi Fix is backed by our cooperative safety net and dispute resolution charter.',
  cards: [
    {
      id: 'warranty',
      title: '30-Day Workmanship Warranty',
      badge: 'Guaranteed',
      accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: 'ShieldCheck',
      features: [
        {
          title: 'Free repairs if the same issue arises',
          desc: 'If the repaired appliance or fixture exhibits the same defect within 30 days, we re-service at ₹0 labour cost.'
        },
        {
          title: 'One-click hassle-free claims',
          desc: 'Directly trigger an automatic Master Artisan re-dispatch from your booking timeline without bureaucratic forms.'
        },
        {
          title: 'Up to ₹10,000 damage protection cover',
          desc: 'Comprehensive coverage if any appliance or property is accidentally damaged during the repair session.'
        }
      ]
    },
    {
      id: 'verified_quotes',
      title: 'Expert Verified Repair Quotes',
      badge: 'Fair Price',
      accentColor: 'text-blue-700 bg-blue-50 border-blue-200',
      icon: 'ClockCheck',
      features: [
        {
          title: 'We verify the repair quote shared by the professional',
          desc: 'All part numbers and technician diagnostic estimates are strictly cross-checked against this public rate card.'
        },
        {
          title: 'If you\'re still unsure, ask an expert for a second opinion',
          desc: 'Request a complimentary video or phone diagnostic consultation from an accredited Senior Master Artisan.'
        },
        {
          title: 'Locked ISI spare parts matrix',
          desc: 'Artisans source verified branded parts at factory wholesale prices with zero unauthorized retail markups.'
        }
      ]
    },
    {
      id: 'rate_card',
      title: 'Regulated Fixed Rate Card',
      badge: 'Zero Surge',
      accentColor: 'text-amber-700 bg-amber-50 border-amber-200',
      icon: 'FileText',
      features: [
        {
          title: 'All our prices are decided basis cooperative statutory standards',
          desc: 'Tariffs are formulated by technical federations with fixed base fees and zero peak-hour or weather surges.'
        },
        {
          title: '93-2-5 Dignified Living Wage Split',
          desc: '93% of your payment goes directly into the artisan\'s wallet, while 5% funds their pension, healthcare, and PF.'
        },
        {
          title: 'Immediate refund if charged above rate card',
          desc: 'If an artisan requests any payment above the rate card, our federation nodal desk enforces immediate corrective refund.'
        }
      ]
    }
  ]
};

export const RATE_CARD_TRADES = [
  { id: 'ac', name: '❄️ AC & Appliance Repair', active: true },
  { id: 'electrical', name: '⚡ Electrical & Wiring', active: false },
  { id: 'plumbing', name: '🚰 Plumbing & Sanitary', active: false },
  { id: 'carpentry', name: '🔨 Carpentry & Fixtures', active: false }
];

export const AC_RATE_CARD_SECTIONS = [
  {
    id: 'electrical_parts',
    title: 'Electrical Parts & PCBs',
    icon: 'Zap',
    badge: '11 Standard Items',
    items: [
      {
        name: 'Non-Inverter PCB Repaired',
        desc: 'Testing, trace soldering & diode/capacitor repair on single-stage split AC motherboards.',
        partPrice: 750,
        labourFee: 249,
        coopTotal: 999,
        commercialPrice: 1500,
        warranty: '6 Months'
      },
      {
        name: 'Inverter PCB Repaired',
        desc: 'Advanced microprocessor, IPM module & dual-frequency inverter inverter board repair.',
        partPrice: 2550,
        labourFee: 349,
        coopTotal: 2899,
        commercialPrice: 4500,
        warranty: '6 Months'
      },
      {
        name: 'LVT (Transformer)',
        desc: 'Low voltage transformer replacement for display & control logic boards.',
        partPrice: 650,
        labourFee: 249,
        coopTotal: 899,
        commercialPrice: 1249,
        warranty: '12 Months'
      },
      {
        name: 'Replace Sensor (Thermistor)',
        desc: 'Copper tube temperature sensor & ambient room thermistor replacement.',
        partPrice: 220,
        labourFee: 249,
        coopTotal: 469,
        commercialPrice: 849,
        warranty: '6 Months'
      },
      {
        name: 'Contactor Replaced',
        desc: 'Heavy duty electromagnetic contactor relay for single-phase outdoor units.',
        partPrice: 350,
        labourFee: 249,
        coopTotal: 599,
        commercialPrice: 999,
        warranty: '12 Months'
      },
      {
        name: 'Contactor Daikin / O-General',
        desc: 'OEM high-current sealed contactor for premium Japanese inverter ACs.',
        partPrice: 1050,
        labourFee: 249,
        coopTotal: 1299,
        commercialPrice: 1949,
        warranty: '12 Months'
      },
      {
        name: 'Convert PCB with Universal Remote',
        desc: 'Universal motherboard retrofit with wireless digital LCD remote control.',
        partPrice: 850,
        labourFee: 249,
        coopTotal: 1099,
        commercialPrice: 1500,
        warranty: '12 Months'
      },
      {
        name: 'Fan Capacitor (2.5 to 10 mfd)',
        desc: 'Heavy duty run capacitor for indoor blower motor or outdoor fan motor.',
        partPrice: 120,
        labourFee: 199,
        coopTotal: 319,
        commercialPrice: 699,
        warranty: '12 Months'
      },
      {
        name: 'Comp Capacitor (25 to 60 mfd)',
        desc: 'High voltage 440V compressor starting capacitor with burst-proof safety valve.',
        partPrice: 240,
        labourFee: 199,
        coopTotal: 439,
        commercialPrice: 849,
        warranty: '12 Months'
      },
      {
        name: 'Combo Capacitor (Comp + Fan)',
        desc: 'Dual-value capacitor (e.g. 50+5 uF) serving both compressor and fan motor.',
        partPrice: 320,
        labourFee: 249,
        coopTotal: 569,
        commercialPrice: 949,
        warranty: '12 Months'
      },
      {
        name: 'Fuse Change in PCB',
        desc: 'High-speed ceramic surge protection fuse replacement and circuit continuity test.',
        partPrice: 60,
        labourFee: 199,
        coopTotal: 259,
        commercialPrice: 449,
        warranty: '3 Months'
      }
    ]
  },
  {
    id: 'gas_charging',
    title: 'Gas Charging & Cooling Coils',
    icon: 'Snowflake',
    badge: '14 Standard Items',
    items: [
      {
        name: 'Complete AC Gas Charging (R32 / R410A)',
        desc: 'Nitrogen pressure leak detection test, vacuuming with two-stage pump & pure gas refill.',
        partPrice: 1400,
        labourFee: 499,
        coopTotal: 1899,
        commercialPrice: 3000,
        warranty: '6 Months'
      },
      {
        name: 'Flair Nut Replaced',
        desc: 'Heavy-duty brass flare nut with precision flaring & torque tightening to prevent leakages.',
        partPrice: 50,
        labourFee: 30,
        coopTotal: 80,
        commercialPrice: 150,
        warranty: '12 Months'
      },
      {
        name: 'Copper Condenser Coil (1 Ton Split)',
        desc: '100% inner grooved pure copper tube condenser with anti-corrosive gold-fin coating.',
        partPrice: 2450,
        labourFee: 350,
        coopTotal: 2800,
        commercialPrice: 4000,
        warranty: '12 Months'
      },
      {
        name: 'Copper Condenser Coil (1.5 Ton Split)',
        desc: 'Multi-pass pure copper condenser coil for superior heat rejection in 1.5T units.',
        partPrice: 3050,
        labourFee: 350,
        coopTotal: 3400,
        commercialPrice: 4800,
        warranty: '12 Months'
      },
      {
        name: 'Copper Condenser Coil (2 Ton Split)',
        desc: 'High capacity heavy-gauge copper coil engineered for high-ambient coastal temperatures.',
        partPrice: 3500,
        labourFee: 400,
        coopTotal: 3900,
        commercialPrice: 5300,
        warranty: '12 Months'
      },
      {
        name: 'Capillary Tube & Copper Filter Dryer',
        desc: 'Replacement of choked copper capillary expansion tube and molecular sieve filter dryer.',
        partPrice: 140,
        labourFee: 80,
        coopTotal: 220,
        commercialPrice: 350,
        warranty: '12 Months'
      },
      {
        name: 'Compressor Replacement (0.8–1 Ton)',
        desc: 'Rotary hermetic compressor replacement with nitrogen brazing and fresh oil charge.',
        partPrice: 4400,
        labourFee: 400,
        coopTotal: 4800,
        commercialPrice: 6500,
        warranty: '12 Months'
      },
      {
        name: 'Compressor Replacement (1.5 Ton)',
        desc: 'High energy-efficiency rotary/twin-rotary compressor with brazed copper connections.',
        partPrice: 5800,
        labourFee: 400,
        coopTotal: 6200,
        commercialPrice: 8500,
        warranty: '12 Months'
      },
      {
        name: 'Compressor Replacement (2 Ton)',
        desc: 'Heavy duty scroll / rotary compressor for large 2T domestic & light commercial split ACs.',
        partPrice: 7000,
        labourFee: 500,
        coopTotal: 7500,
        commercialPrice: 10000,
        warranty: '12 Months'
      },
      {
        name: 'Expansion Valve Replaced',
        desc: 'Thermostatic or electronic stepping motor expansion valve replacement.',
        partPrice: 580,
        labourFee: 200,
        coopTotal: 780,
        commercialPrice: 1200,
        warranty: '12 Months'
      },
      {
        name: 'Service Valve Replaced (1/4" or 1/2")',
        desc: '3-way brass service charging valve replacement with Teflon O-ring seals.',
        partPrice: 180,
        labourFee: 80,
        coopTotal: 260,
        commercialPrice: 400,
        warranty: '12 Months'
      },
      {
        name: 'Copper Cooling Coil (1 Ton Split Evaporator)',
        desc: 'Hydrophilic blue/gold fin indoor evaporator cooling coil replacement.',
        partPrice: 3500,
        labourFee: 400,
        coopTotal: 3900,
        commercialPrice: 5500,
        warranty: '12 Months'
      },
      {
        name: 'Copper Cooling Coil (1.5 Ton Split Evaporator)',
        desc: 'Multi-bend pure copper evaporator cooling coil for 1.5 ton split AC indoor units.',
        partPrice: 4300,
        labourFee: 400,
        coopTotal: 4700,
        commercialPrice: 6500,
        warranty: '12 Months'
      },
      {
        name: 'Cooling Coil Anti-Rust Coating & U-Band Repair',
        desc: 'Ultrasonic leak detection, copper brazing of pinhole leaks and protective anti-rust spray.',
        partPrice: 350,
        labourFee: 249,
        coopTotal: 599,
        commercialPrice: 899,
        warranty: '6 Months'
      }
    ]
  },
  {
    id: 'fan_motors',
    title: 'Fan Motors & Blowers',
    icon: 'Wind',
    badge: '8 Standard Items',
    items: [
      {
        name: 'Fan Motor - Split AC (Outdoor Unit)',
        desc: 'Permanent split capacitor (PSC) sealed outdoor condenser fan motor replacement.',
        partPrice: 1250,
        labourFee: 299,
        coopTotal: 1549,
        commercialPrice: 2299,
        warranty: '12 Months'
      },
      {
        name: 'Blower Motor - Split AC (Indoor Unit)',
        desc: 'Low-noise multi-speed indoor cross-flow blower motor replacement.',
        partPrice: 1500,
        labourFee: 299,
        coopTotal: 1799,
        commercialPrice: 2699,
        warranty: '12 Months'
      },
      {
        name: 'Cross-Flow Blower Wheel Replaced',
        desc: 'Dynamically balanced indoor cylindrical blower fan wheel replacement.',
        partPrice: 750,
        labourFee: 249,
        coopTotal: 999,
        commercialPrice: 1599,
        warranty: '6 Months'
      },
      {
        name: 'Replace Flap / Louver Swing Motor',
        desc: 'Synchronous stepping motor controlling motorized air deflection louvers.',
        partPrice: 250,
        labourFee: 199,
        coopTotal: 449,
        commercialPrice: 899,
        warranty: '12 Months'
      },
      {
        name: 'Motor Bearing Change (Set of 2)',
        desc: 'High-temperature 608 / 6201 sealed ball bearing replacement with lithium grease.',
        partPrice: 450,
        labourFee: 200,
        coopTotal: 650,
        commercialPrice: 1000,
        warranty: '12 Months'
      },
      {
        name: 'Fan Motor - Window AC (Dual Shaft)',
        desc: 'Dual-shaft motor driving both outdoor propeller fan and indoor centrifugal blower.',
        partPrice: 1800,
        labourFee: 299,
        coopTotal: 2099,
        commercialPrice: 3099,
        warranty: '12 Months'
      },
      {
        name: 'DC Inverter Blower Motor - Split AC',
        desc: 'Brushless DC (BLDC) high-efficiency variable-speed indoor fan motor.',
        partPrice: 2400,
        labourFee: 299,
        coopTotal: 2699,
        commercialPrice: 3800,
        warranty: '12 Months'
      },
      {
        name: 'DC Inverter Outdoor Fan Motor',
        desc: 'Weather-proof BLDC outdoor motor for smart inverter cooling units.',
        partPrice: 2400,
        labourFee: 299,
        coopTotal: 2699,
        commercialPrice: 3800,
        warranty: '12 Months'
      }
    ]
  },
  {
    id: 'service_installation',
    title: 'Service & Installation',
    icon: 'Wrench',
    badge: '14 Standard Items',
    items: [
      {
        name: 'Foam-Jet Power AC Deep Service',
        desc: 'High-pressure water pump and biodegradable foam jet coil cleaning with drain tray wash.',
        partPrice: 150,
        labourFee: 349,
        coopTotal: 499,
        commercialPrice: 699,
        warranty: '30 Days'
      },
      {
        name: 'Lite AC Preventive Service',
        desc: 'Air filter cleaning, cooling coil comb brushing, electrical terminal check & blower dust removal.',
        partPrice: 100,
        labourFee: 299,
        coopTotal: 399,
        commercialPrice: 599,
        warranty: '30 Days'
      },
      {
        name: 'Complete Split AC Installation',
        desc: 'Mounting indoor backplate, core-hole alignment, outdoor stand installation, copper piping & testing.',
        partPrice: 500,
        labourFee: 799,
        coopTotal: 1299,
        commercialPrice: 2199,
        warranty: '30 Days'
      },
      {
        name: 'Split AC Safe Uninstallation',
        desc: 'Refrigerant gas pump-down into compressor, dismounting indoor & outdoor units with pipe sealing.',
        partPrice: 100,
        labourFee: 349,
        coopTotal: 449,
        commercialPrice: 699,
        warranty: '30 Days'
      },
      {
        name: 'Split AC Heavy Duty Wall Stand',
        desc: 'Powder-coated rust-proof 3mm cold-rolled steel bracket pair with vibration dampeners.',
        partPrice: 350,
        labourFee: 149,
        coopTotal: 499,
        commercialPrice: 750,
        warranty: '24 Months'
      },
      {
        name: '1 ft Insulated Copper Pipe Set',
        desc: '1/4" & 1/2" pure copper tubing with closed-cell elastomeric thermal insulation and 3-core cable.',
        partPrice: 200,
        labourFee: 40,
        coopTotal: 240,
        commercialPrice: 350,
        warranty: '12 Months'
      },
      {
        name: 'Outdoor Unit Reinstallation',
        desc: 'Fixing outdoor compressor unit onto wall stand with flare connection and leak testing.',
        partPrice: 200,
        labourFee: 349,
        coopTotal: 549,
        commercialPrice: 799,
        warranty: '30 Days'
      },
      {
        name: 'Indoor Unit Reinstallation',
        desc: 'Securing indoor backplate, water level alignment and electrical interconnection.',
        partPrice: 180,
        labourFee: 299,
        coopTotal: 479,
        commercialPrice: 699,
        warranty: '30 Days'
      },
      {
        name: 'Heavy Duty Fastener Anchor Set',
        desc: 'Set of 4 M10 zinc-plated expansion anchor bolts for solid masonry anchoring.',
        partPrice: 80,
        labourFee: 40,
        coopTotal: 120,
        commercialPrice: 200,
        warranty: '24 Months'
      },
      {
        name: 'Terrace / Floor Stand',
        desc: 'Elevated anti-vibration floor rubber mounts protecting unit from monsoon puddles.',
        partPrice: 280,
        labourFee: 100,
        coopTotal: 380,
        commercialPrice: 550,
        warranty: '24 Months'
      },
      {
        name: 'Universal Backplate Mounting Bracket',
        desc: 'Galvanized universal steel indoor wall-mounting bracket.',
        partPrice: 120,
        labourFee: 60,
        coopTotal: 180,
        commercialPrice: 300,
        warranty: '24 Months'
      },
      {
        name: 'Anti-Rust Spray Treatment',
        desc: 'Polyurethane aerosol protective coating on copper U-bends and coastal outdoor chassis.',
        partPrice: 100,
        labourFee: 69,
        coopTotal: 169,
        commercialPrice: 249,
        warranty: '6 Months'
      },
      {
        name: 'Reinforced Drain Pipe Replacement (per m)',
        desc: 'Corrugated UV-stabilized flexible drain tubing preventing indoor water drip.',
        partPrice: 40,
        labourFee: 20,
        coopTotal: 60,
        commercialPrice: 100,
        warranty: '12 Months'
      },
      {
        name: '3/4 Core Interconnecting Power Cable (per m)',
        desc: 'ISI grade 1.5 sqmm FR PVC copper wire connecting indoor unit to outdoor condensing unit.',
        partPrice: 55,
        labourFee: 25,
        coopTotal: 80,
        commercialPrice: 120,
        warranty: '12 Months'
      }
    ]
  },
  {
    id: 'minor_repairs',
    title: 'Minor Repairs & Adjustments',
    icon: 'Hammer',
    badge: '11 Standard Items',
    items: [
      {
        name: 'Water Leakage Repair - Split AC',
        desc: 'Clearing indoor tray blockage, adjusting drain slope & flushing fungal sludge.',
        partPrice: 50,
        labourFee: 249,
        coopTotal: 299,
        commercialPrice: 599,
        warranty: '30 Days'
      },
      {
        name: 'Adjust Front Grill Locks & Alignment',
        desc: 'Resetting front decorative plastic clips and acoustic alignment to eliminate rattling.',
        partPrice: 0,
        labourFee: 199,
        coopTotal: 199,
        commercialPrice: 349,
        warranty: '30 Days'
      },
      {
        name: 'Adjust Pipe & Tighten Compressor Mount Screws',
        desc: 'Compressor anti-vibration grommet alignment and dampening bolt tightening.',
        partPrice: 0,
        labourFee: 199,
        coopTotal: 199,
        commercialPrice: 349,
        warranty: '30 Days'
      },
      {
        name: 'Connector Terminal Wires Replaced',
        desc: 'Crimping new heat-resistant copper terminals and replacing brittle connection wires.',
        partPrice: 50,
        labourFee: 199,
        coopTotal: 249,
        commercialPrice: 449,
        warranty: '6 Months'
      },
      {
        name: 'Tighten / Replace Thimble Terminals',
        desc: 'Replacing burnt compressor lead thimbles with high-temperature ceramic insulators.',
        partPrice: 30,
        labourFee: 199,
        coopTotal: 229,
        commercialPrice: 399,
        warranty: '6 Months'
      },
      {
        name: 'External Dust & Foreign Object Removal',
        desc: 'Removing bird nest debris, leaves or twigs lodged in outdoor condenser fan.',
        partPrice: 0,
        labourFee: 199,
        coopTotal: 199,
        commercialPrice: 399,
        warranty: '30 Days'
      },
      {
        name: 'Motor Noise & Vibration Adjustment',
        desc: 'Motor shaft centering and dynamic balancing of fan blades.',
        partPrice: 0,
        labourFee: 199,
        coopTotal: 199,
        commercialPrice: 399,
        warranty: '30 Days'
      },
      {
        name: 'Blower Noise & Squeak Correction',
        desc: 'Lubricating nylon blower sleeve bearing and realigning indoor rotor.',
        partPrice: 0,
        labourFee: 199,
        coopTotal: 199,
        commercialPrice: 399,
        warranty: '30 Days'
      },
      {
        name: 'Swing Flap Mechanism Alignment',
        desc: 'Freeing up jammed gear links on motorized vertical and horizontal swing flaps.',
        partPrice: 0,
        labourFee: 199,
        coopTotal: 199,
        commercialPrice: 399,
        warranty: '30 Days'
      },
      {
        name: 'Water Leakage Repair - Window AC',
        desc: 'Cleaning chassis base pan, clearing drain hole plug & leveling tilt angle.',
        partPrice: 0,
        labourFee: 249,
        coopTotal: 249,
        commercialPrice: 449,
        warranty: '30 Days'
      },
      {
        name: 'Refrigerant Pipe Thermal Insulation Refix',
        desc: 'Re-taping deteriorated thermal insulation with UV vinyl wrap on exposed suction line.',
        partPrice: 0,
        labourFee: 199,
        coopTotal: 199,
        commercialPrice: 399,
        warranty: '30 Days'
      }
    ]
  },
  {
    id: 'other_parts',
    title: 'Other Spare Parts & Remotes',
    icon: 'Package',
    badge: '7 Standard Items',
    items: [
      {
        name: 'AC Outdoor Fan Blade',
        desc: 'Molded aerodynamic 3-blade propeller fan wheel for outdoor condensing unit.',
        partPrice: 480,
        labourFee: 249,
        coopTotal: 729,
        commercialPrice: 1199,
        warranty: '12 Months'
      },
      {
        name: 'Indoor Unit Front Grill Cover Panel',
        desc: 'Front decorative intake panel with LED display bezel for 1T/1.5T split models.',
        partPrice: 980,
        labourFee: 249,
        coopTotal: 1229,
        commercialPrice: 1849,
        warranty: '12 Months'
      },
      {
        name: 'Motorized Swing Blade / Louver Replacement',
        desc: 'Horizontal air deflection guide flap replacement.',
        partPrice: 260,
        labourFee: 199,
        coopTotal: 459,
        commercialPrice: 749,
        warranty: '12 Months'
      },
      {
        name: 'Universal AC Remote Control',
        desc: 'Pre-programmed remote control compatible with Voltas, LG, Daikin, Blue Star, Carrier, Lloyd, etc.',
        partPrice: 499,
        labourFee: 0,
        coopTotal: 499,
        commercialPrice: 800,
        warranty: '6 Months'
      },
      {
        name: 'Internal Condensate Water Drain Tray',
        desc: 'Molded plastic water collector tray sitting below indoor evaporator coil.',
        partPrice: 340,
        labourFee: 150,
        coopTotal: 490,
        commercialPrice: 700,
        warranty: '12 Months'
      },
      {
        name: 'AC Voltage Stabilizer Bench Repair',
        desc: 'Relay replacement, micro-controller calibration & high-voltage trip test on 4kVA stabilizer.',
        partPrice: 650,
        labourFee: 249,
        coopTotal: 899,
        commercialPrice: 1500,
        warranty: '6 Months'
      },
      {
        name: 'Copper Pipe Insulation Sleeve (per piece)',
        desc: 'Nitrile elastomeric foam pipe insulation sleeve (6 ft length).',
        partPrice: 35,
        labourFee: 0,
        coopTotal: 35,
        commercialPrice: 50,
        warranty: '12 Months'
      }
    ]
  }
];

export function calculate9325Split(totalPrice) {
  const price = Number(totalPrice) || 0;
  const artisanShare = Math.round(price * 0.93 * 100) / 100;
  const platformFee = Math.round(price * 0.02 * 100) / 100;
  const welfareFund = Math.round((price - artisanShare - platformFee) * 100) / 100;
  return {
    price,
    artisanShare,
    platformFee,
    welfareFund
  };
}
