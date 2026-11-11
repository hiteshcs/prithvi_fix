/**
 * Seed script: populate parts_catalog with sample ISI-approved parts
 * Run: node backend/src/db/seed_parts.js
 */
const { query } = require('../db/connection');

const PARTS = [
  // Electrical
  ['Electrical', 'Capacitor 35μF (ISI Mark)', 350, 'piece', 12],
  ['Electrical', 'MCB 32A Single Pole (Havells/Legrand)', 280, 'piece', 24],
  ['Electrical', 'MCB 16A Single Pole (Havells/Legrand)', 220, 'piece', 24],
  ['Electrical', 'Copper Wire 2.5 sq.mm (per metre)', 65, 'metre', 6],
  ['Electrical', 'Copper Wire 1.5 sq.mm (per metre)', 42, 'metre', 6],
  ['Electrical', 'Modular Switch 6A (Anchor/Roma)', 85, 'piece', 12],
  ['Electrical', 'Socket 6A 3-pin (Anchor/Roma)', 95, 'piece', 12],
  ['Electrical', 'Ceiling Fan Capacitor 2.5μF', 120, 'piece', 6],
  ['Electrical', 'Fan Regulator (Electronic, 5-step)', 180, 'piece', 12],
  ['Electrical', 'PVC Conduit Pipe 25mm (per metre)', 35, 'metre', 6],
  ['Electrical', 'Junction Box 4x4 inch (PVC)', 45, 'piece', 12],

  // Appliance Repair
  ['Appliance Repair', 'AC Compressor Capacitor 40μF', 420, 'piece', 12],
  ['Appliance Repair', 'AC Thermostat (Universal)', 650, 'piece', 12],
  ['Appliance Repair', 'AC Filter Mesh (Split, per set)', 180, 'set', 6],
  ['Appliance Repair', 'Refrigerator Door Gasket (Universal)', 380, 'piece', 6],
  ['Appliance Repair', 'Refrigerator Thermostat', 520, 'piece', 12],
  ['Appliance Repair', 'Washing Machine Belt (Universal)', 150, 'piece', 6],
  ['Appliance Repair', 'Washing Machine Drain Pump', 750, 'piece', 12],
  ['Appliance Repair', 'Mixer Grinder Jar Coupler', 90, 'piece', 6],
  ['Appliance Repair', 'Mixer Grinder Carbon Brush Set', 75, 'set', 6],
  ['Appliance Repair', 'Geyser Heating Element 2KW', 480, 'piece', 12],
  ['Appliance Repair', 'Geyser Thermostat (80°C)', 320, 'piece', 12],

  // Plumbing
  ['Plumbing', 'CPVC Ball Valve 1/2 inch (ISI)', 120, 'piece', 24],
  ['Plumbing', 'CPVC Ball Valve 1 inch (ISI)', 180, 'piece', 24],
  ['Plumbing', 'CPVC Pipe 1/2 inch (per metre, Astral)', 55, 'metre', 12],
  ['Plumbing', 'CPVC Pipe 1 inch (per metre, Astral)', 95, 'metre', 12],
  ['Plumbing', 'GI Pipe Elbow 1/2 inch', 45, 'piece', 12],
  ['Plumbing', 'PVC Flexible Hose 3/4 inch (per metre)', 38, 'metre', 6],
  ['Plumbing', 'Tap Washer Set (Assorted, 10 pcs)', 35, 'set', 3],
  ['Plumbing', 'Ceramic Disc Cartridge (Mixer Tap)', 220, 'piece', 12],
  ['Plumbing', 'Toilet Flush Valve (Universal)', 350, 'piece', 12],
  ['Plumbing', 'Float Ball Valve (Tank Inlet)', 180, 'piece', 12],
  ['Plumbing', 'Teflon Tape (19mm x 12m)', 25, 'piece', 3],

  // Carpentry
  ['Carpentry', 'Door Hinge Heavy Duty 4 inch (SS, pair)', 120, 'pair', 24],
  ['Carpentry', 'Door Handle (SS Mortise)', 280, 'piece', 24],
  ['Carpentry', 'Door Stopper (Floor Mounted, SS)', 95, 'piece', 12],
  ['Carpentry', 'Piano Hinge 6 inch (SS)', 85, 'piece', 24],
  ['Carpentry', 'Drawer Channel Slide 18 inch (pair)', 160, 'pair', 12],
  ['Carpentry', 'Plywood 18mm BWR (per sq.ft, Century)', 95, 'sq.ft', 12],
  ['Carpentry', 'Wood Screw SS 1.5 inch (100 pcs)', 45, 'pack', 12],
  ['Carpentry', 'Wood Adhesive Fevicol SH (1 kg)', 120, 'kg', 6],

  // Painting
  ['Painting', 'Interior Emulsion Paint (per litre, Asian/Berger)', 85, 'litre', 12],
  ['Painting', 'Exterior Weather Shield (per litre, Asian/Berger)', 120, 'litre', 12],
  ['Painting', 'Wall Putty (per kg, Birla White)', 18, 'kg', 6],
  ['Painting', 'Primer (per litre, Asian)', 55, 'litre', 6],
  ['Painting', 'Sand Paper Sheet (80/120 grit)', 15, 'piece', 3],
  ['Painting', 'Paint Roller Sleeve 9 inch', 65, 'piece', 3],
  ['Painting', 'Paint Brush 2 inch (Camel/Hamilton)', 45, 'piece', 3],

  // Cleaning
  ['Cleaning', 'Drain Cleaning Chemical (500ml)', 95, 'piece', 6],
  ['Cleaning', 'Descaling Solution (500ml)', 85, 'piece', 6],
];

async function seedParts() {
  let inserted = 0;
  for (const [tc, pn, sp, unit, wm] of PARTS) {
    await query(
      'INSERT INTO parts_catalog (trade_category, part_name, standard_price, unit, warranty_months) VALUES ($1,$2,$3,$4,$5)',
      [tc, pn, sp, unit, wm]
    );
    inserted++;
    process.stdout.write(`  ✓ ${pn}\n`);
  }
  console.log(`\n✅ Seeded ${inserted} parts into parts_catalog`);
  process.exit(0);
}

seedParts().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
