// Cooperative Standard Operating Procedure (SOP) Generator for 47 Services across 9 Trades

export function getProcessStepsForService(service) {
  const name = (service?.name || '').toLowerCase();
  const cat = (service?.category || '').toLowerCase();

  // 1. AC Gas Refill & Leak Testing
  if (name.includes('gas') || name.includes('refill')) {
    return {
      categoryTag: 'HVAC Specialist Protocol',
      estDuration: '75-90 Minutes',
      tools: ['Digital Manifold Gauge', '300 PSI Dry Nitrogen Cylinder', '2-Stage Vacuum Pump', 'R32/R410A Refrigerant Scale', 'Halogen Leak Sniffer'],
      steps: [
        {
          step: 1,
          title: 'Nitrogen High-Pressure Leak Test (300 PSI)',
          desc: 'Technician connects digital manifold gauge and pressurizes copper circuits to 300 PSI with dry nitrogen to pinpoint hairline fractures.',
          points: ['Soap bubble & acoustic leak localization', 'Schrader valve pin inspection', 'Standing pressure loss log']
        },
        {
          step: 2,
          title: 'Oxy-Acetylene Copper Joint Brazing',
          desc: 'Cracked capillary joints and U-bends are deburred and silver-brazed with flux-coated alloy under dry nitrogen purge to eliminate soot.',
          points: ['Silver-copper eutectic brazing', 'Zero-soot internal inert gas purge', 'High-vibration absorption loop check']
        },
        {
          step: 3,
          title: 'Deep Vacuumization (< 500 Microns)',
          desc: 'Two-stage rotary vane vacuum pump draws the system down below 500 microns to extract non-condensable air and all internal moisture.',
          points: ['Dual-stage vacuum down to 500 microns', '15-minute standing vacuum decay test', 'Zero moisture in compressor oil']
        },
        {
          step: 4,
          title: 'Precision Refrigerant Charge by Weight',
          desc: 'Pure virgin R32 / R410A refrigerant is weighed in precisely according to manufacturer nameplate grams using a calibrated digital scale.',
          points: ['Calibrated digital scale dispensing', 'Running suction & discharge pressure audit', 'Compressor amp draw load verification']
        },
        {
          step: 5,
          title: 'Laser Delta-T Performance Audit & 30-Day Cover',
          desc: 'Infrared thermometer confirms a 10°C–14°C temperature differential across air louvers. 30-day workmanship warranty is digitally issued.',
          points: ['Laser Delta-T temperature drop verification', 'Zero-drip condensate drain flow test', 'Customer OTP sign-off & digital warranty']
        }
      ]
    };
  }

  // 2. AC Jet Cleaning & HVAC Maintenance
  if (name.includes('jet') || name.includes('foam') || name.includes('air conditioner') || (cat.includes('appliance') && name.includes('ac'))) {
    return {
      categoryTag: 'HVAC Sanitation Protocol',
      estDuration: '60-75 Minutes',
      tools: ['120-Bar Portable Pressure Jet Pump', 'Bio-Enzyme Chemical Foam Gun', 'Waterproof Indoor Service Apron', 'Digital Laser Thermometer'],
      steps: [
        {
          step: 1,
          title: 'Pre-Service Diagnostic & Sensor Audit',
          desc: 'Technician tests baseline airflow CFM, compressor amp draw, and inspects indoor unit PCB error codes before servicing.',
          points: ['Airflow CFM & baseline cooling test', 'Compressor electrical load check', 'Remote control sensor verification']
        },
        {
          step: 2,
          title: 'Indoor Unit Foam-Jet Chemical Soak',
          desc: 'Mounted inside a leak-proof service apron, cooling coils and blower rotors are sprayed with non-caustic bio-enzyme foam.',
          points: ['Non-corrosive aluminum-safe foam', 'Waterproof apron protects wall & furniture', 'Drain pan descaling']
        },
        {
          step: 3,
          title: 'High-Pressure Rotary Jet Flush',
          desc: '120-bar pressurized water jet thoroughly dislodges deep-seated fungus, pollen, and mud from the indoor barrel and outdoor unit fins.',
          points: ['Deep fin penetrative wash', 'Blower rotor wheel descaling', 'Outdoor unit condenser coil cleaning']
        },
        {
          step: 4,
          title: 'Drain Line Flushed & Anti-Bacterial Sanitization',
          desc: 'Condensate drain line is unclogged with pressurized water to prevent indoor water dripping, followed by antimicrobial air louver wipe.',
          points: ['Condensate line back-flushed', 'Antimicrobial coating on blower louvers', 'Air filter mesh sterilization']
        },
        {
          step: 5,
          title: 'Post-Clean Delta-T Calibration & Clean-up',
          desc: 'Operating grill temperature drop is calibrated (min 10°C drop), room is left spotless, and 30-day warranty armed.',
          points: ['Laser thermometer delta-T verification', 'Room & flooring wiped dry', '30-Day Prithvi Suraksha warranty armed']
        }
      ]
    };
  }

  // 3. Electrical Services
  if (cat.includes('electrical')) {
    return {
      categoryTag: 'Cooperative Electrical Guild SOP',
      estDuration: '45-60 Minutes',
      tools: ['True-RMS Digital Multimeter', 'Non-Contact Proximity Voltage Detector', '500V Insulation Megger Tester', 'Insulated 1000V Toolkit'],
      steps: [
        {
          step: 1,
          title: 'Circuit Isolation & Digital Multimeter Audit',
          desc: 'Main MCB isolation, live-line proximity voltage detector verification, and phase-to-neutral continuity testing.',
          points: ['Zero-voltage safety verification', 'Earthing continuity check (< 1 Ohm)', 'Load calculation for connected appliances']
        },
        {
          step: 2,
          title: 'Conduit & Enclosure Disassembly',
          desc: 'Switchboard or fixture enclosure opened to inspect heat discoloration, burnt insulation, and loose terminal screws.',
          points: ['Fire-hazard hotspot inspection', 'Wire gauge cross-sectional check', 'Neutral busbar tightening']
        },
        {
          step: 3,
          title: 'ISI-Certified Modular Component Replacement',
          desc: 'Installation of Havells / Anchor / Legrand ISI-marked modular switches, sockets, or MCB breakers with heat-resistant copper cabling.',
          points: ['ISI-certified grade-A components', 'Spring-loaded torque-tightened terminals', 'Fire-retardant grade FR copper wiring']
        },
        {
          step: 4,
          title: 'Full Load Tripping & Insulation Resistance Test',
          desc: '500V Megger test to confirm zero ground leakage and verification of instantaneous RCCB trip on artificial fault induction.',
          points: ['500V Megger insulation resistance test', 'RCCB 30mA residual current trip test', 'Ammeter full-load current check']
        },
        {
          step: 5,
          title: 'Cover Plate Sealing & Digital Warranty Arming',
          desc: 'Faceplate snapped into place with flush screw alignment, live demonstration of all switches, and 30-day warranty armed.',
          points: ['Aesthetic scratch-free plate alignment', 'Customer live operational test', '30-Day Prithvi Suraksha Cover issued']
        }
      ]
    };
  }

  // 4. Plumbing Services
  if (cat.includes('plumbing')) {
    return {
      categoryTag: 'Civic Plumbing Guild SOP',
      estDuration: '45-60 Minutes',
      tools: ['Rotary Pipe Wrench Set', 'Hydrostatic Pressure Gauge', 'Ceramic Cartridge Puller', 'High-Temp PTFE Thread Sealant'],
      steps: [
        {
          step: 1,
          title: 'Pressure Differential & Pipe Seepage Diagnosis',
          desc: 'Acoustic leak detection and hydrostatic pressure gauge measurement across CPVC/UPVC lines to pinpoint faulty joints or worn cartridges.',
          points: ['Static line pressure measurement', 'Acoustic wall cavity leak scan', 'Sanitary seal integrity audit']
        },
        {
          step: 2,
          title: 'Main Header Isolation & Controlled Draining',
          desc: 'Overhead riser valve isolated, line depressurized, and catch-basins placed to prevent any secondary floor dampness.',
          points: ['Controlled line depressurization', 'Anti-flood floor catchment deployed', 'Concealed diverter access inspection']
        },
        {
          step: 3,
          title: 'Heavy-Duty Brass & Ceramic Cartridge Overhaul',
          desc: 'Replacement of damaged spindle with genuine Jaquar / Kohler / Hindware ceramic disc spindle, Teflon thread lock, and food-grade silicone grease.',
          points: ['100% brass & ceramic disc cartridges', 'High-temp PTFE sealant application', 'Anti-corrosion chrome nut torque']
        },
        {
          step: 4,
          title: '15-Minute Hydrostatic Backpressure Test',
          desc: 'System re-pressurized to 4.5 Bar to verify that zero weeping or microscopic dripping occurs under prolonged domestic water pressure.',
          points: ['4.5 Bar hydrostatic stress hold', 'Aerator flow rate measurement', 'Flush valve dynamic siphon test']
        },
        {
          step: 5,
          title: 'Sanitary Wipe & 30-Day Workmanship Cover',
          desc: 'Fixtures wiped with anti-limescale microfiber cloth, customer approves leak-free flow, and 30-day warranty receipt generated.',
          points: ['Surrounding tiles dried and polished', 'Zero-drip customer verification', '30-day free leak rectification guarantee']
        }
      ]
    };
  }

  // 5. Carpentry Services
  if (cat.includes('carpentry')) {
    return {
      categoryTag: 'Master Carpenter Guild SOP',
      estDuration: '60-90 Minutes',
      tools: ['Laser Digital Level', 'Plunge Router & Chisel Set', 'Electric Impact Driver', 'Heavy-Duty Clamp Fixture Set'],
      steps: [
        {
          step: 1,
          title: 'Timber Moisture & Structural Alignment Audit',
          desc: 'Inspection of wood grain swelling, door frame plumb, hinge mortise depth, and existing load distribution.',
          points: ['Digital level plumb verification', 'Moisture meter reading', 'Hinge mortise stress analysis']
        },
        {
          step: 2,
          title: 'Precision Chiseling & Hardware Slotting',
          desc: 'Accurate routing and beveling for Godrej / Yale lock mortises or hydraulic soft-close concealed hinges.',
          points: ['CNC-grade template routing', 'Flush edge rebate leveling', 'Anti-friction brass bushing alignment']
        },
        {
          step: 3,
          title: 'Grade-8 Stainless Steel Fastener Anchoring',
          desc: 'Installation of high-tensile SS304 screws with countersunk drilling to prevent timber splitting and sagging.',
          points: ['SS304 corrosion-proof fasteners', 'Torque-regulated screw driving', 'Zero wood surface splitting']
        },
        {
          step: 4,
          title: 'Smooth Glide & Latch Strike Calibration',
          desc: 'Adjustment of gap tolerances (2mm standard), latch bolt engagement, and smooth resistance-free door swing.',
          points: ['2mm uniform perimeter gap', 'Silent latch closure action', 'Deadbolt key lock smooth turn']
        },
        {
          step: 5,
          title: 'Sawdust HEPA Vacuum & 30-Day Guarantee',
          desc: 'Fine sawdust and wood shavings vacuumed clean, polish touch-up applied, and customer signs OTP for 30-day warranty.',
          points: ['HEPA vacuum of all wood shavings', 'Natural wax finish buffed', '30-Day free adjustment guarantee']
        }
      ]
    };
  }

  // 6. Painting & Waterproofing
  if (cat.includes('painting')) {
    return {
      categoryTag: 'Surface Finishing Guild SOP',
      estDuration: '2-4 Hours',
      tools: ['Digital Wall Moisture Meter', 'Electric Orbital Sanding Machine', 'Airless Paint Spray Gun', 'Non-Marking Edge Masking Tape'],
      steps: [
        {
          step: 1,
          title: 'Substrate Moisture & Efflorescence Audit',
          desc: 'Digital moisture meter reading of wall masonry (< 12% required) to check for capillary dampness and chalking.',
          points: ['Masonry moisture percentage logged', 'Plaster delamination tap test', 'Alkali efflorescence identification']
        },
        {
          step: 2,
          title: 'Rotary Sanding & Acrylic Crack Filling',
          desc: 'High-RPM electric orbital sander scrapes old peeling paint, followed by elastomeric waterproof putty application on cracks.',
          points: ['80-grit mechanical surface keying', 'Elastomeric fiber-reinforced putty fill', 'Smooth level wall leveling']
        },
        {
          step: 3,
          title: 'Anti-Fungal Deep-Penetrating Primer Coat',
          desc: 'Application of high-opacity primer coat to bind loose particles and create a water-resistant adhesive base.',
          points: ['Alkali-resistant primer coat', 'Even roller cross-lap technique', '2-hour standard drying dwell']
        },
        {
          step: 4,
          title: 'Dual-Coat Premium Emulsion Finish',
          desc: 'Two uniform coats of Asian Paints / Berger washable luxury emulsion applied with microfiber lint-free rollers.',
          points: ['Uniform 45-micron dry film thickness', 'Zero roller lap-mark texture', 'Consistent hue and sheen index']
        },
        {
          step: 5,
          title: 'Masking Removal, Floor Polishing & Handover',
          desc: 'Edge masking tape peeled for razor-sharp borders, floor drop-cloths folded, paint droplets cleaned, and warranty issued.',
          points: ['Razor-sharp paint boundary edges', 'Tile floor free of paint splatters', '1-Year cooperative finish warranty']
        }
      ]
    };
  }

  // 7. Cleaning & Sanitization
  if (cat.includes('cleaning')) {
    return {
      categoryTag: 'Sanitization & Deep Hygiene SOP',
      estDuration: '90-180 Minutes',
      tools: ['Industrial Wet & Dry Vacuum', 'Single-Disc Rotary Floor Polisher', 'Hospital-Grade Bio-Enzyme Disinfectant', 'Microfiber Color-Coded Cloths'],
      steps: [
        {
          step: 1,
          title: 'High-Efficiency Particulate Dry Pre-Vacuuming',
          desc: 'HEPA filtration vacuuming removes dry abrasive grit, dust bunnies, and loose dirt from baseboards, ledges, and corners.',
          points: ['HEPA vacuum of all corners & edges', 'Furniture moved for complete access', 'Dry dust extraction']
        },
        {
          step: 2,
          title: 'Non-Caustic Bio-Enzyme Chemical Dwell',
          desc: 'Eco-friendly degreasing and descaling solutions applied to bathroom grout, tile stains, and kitchen oil residue.',
          points: ['Non-hazardous biodegradable chemicals', '15-minute chemical dwell for grease breakdown', 'Limescale & hard-water dissolver']
        },
        {
          step: 3,
          title: 'Single-Disc Rotary Mechanical Scrubbing',
          desc: 'High-torque rotary brush scrubs tile joints, textured floors, and stubborn grime without scratching glaze.',
          points: ['Mechanical deep tile agitation', 'Grout line discoloration restored', 'Heavy oil degreased from surfaces']
        },
        {
          step: 4,
          title: 'Wet-Vacuum Slurry Extraction & Disinfection',
          desc: 'High-power suction extracts all suspended dirty water slurry, followed by hospital-grade sanitization of touchpoints.',
          points: ['Zero moisture residue left on floors', 'Sanitization of handles, faucets & switches', 'Streak-free mirror and glass wipe']
        },
        {
          step: 5,
          title: 'Aroma Ozone Neutralization & Quality Audit',
          desc: 'Pleasant natural citrus aroma neutralization, joint inspection with customer, and digital sign-off.',
          points: ['Odor elimination & fresh fragrance', 'Joint customer satisfaction checklist', '30-Day workmanship warranty armed']
        }
      ]
    };
  }

  // Default Cooperative Standard SOP
  return {
    categoryTag: 'Cooperative Guild Service Standard',
    estDuration: '60 Minutes',
    tools: ['Standard Artisan Toolkit', 'Calibrated Diagnostic Instruments', 'Protective Floor Drop-Cloths', 'ISI-Marked Replacement Spares'],
    steps: [
      {
        step: 1,
        title: 'Initial Diagnostic Audit & Site Assessment',
        desc: 'Artisan inspects the physical site, verifies scope of work against rate card tariffs, and explains steps to customer.',
        points: ['Baseline condition documentation', 'Transparent fixed rate card verification', 'Pre-service risk and safety assessment']
      },
      {
        step: 2,
        title: 'Work Area Prep & Floor Surface Protection',
        desc: 'Protective drop-cloths and dust barriers deployed to ensure adjacent home furnishings and walls remain completely undamaged.',
        points: ['Heavy-duty floor drop-cloths deployed', 'Household furniture dust covers installed', 'Safe isolation of utilities']
      },
      {
        step: 3,
        title: 'Cooperative Guild Craft Execution',
        desc: 'Artisan executes the repair or installation using ISI-certified materials, calibrated guild power tools, and ergonomic precision.',
        points: ['ISI-certified grade materials used', 'Cooperative guild quality protocol followed', 'Zero shortcut policy enforced']
      },
      {
        step: 4,
        title: 'Quality & Stress Tolerance Verification',
        desc: 'Artisan tests the completed work against standard performance benchmarks under real operating conditions.',
        points: ['Operational load & stress check', 'Smooth mechanical action verification', 'Aesthetic and functional sign-off']
      },
      {
        step: 5,
        title: 'Spotless Clean-up & 30-Day Warranty Sign-Off',
        desc: 'Work area swept clean, all packaging debris removed, customer verifies work via arrival OTP, and 30-day warranty armed.',
        points: ['Debris and packaging completely removed', 'Customer satisfaction OTP verification', '30-Day Prithvi Suraksha warranty issued']
      }
    ]
  };
}
