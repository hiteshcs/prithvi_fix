/**
 * Sensitive Personally Identifiable Information (PII) Masking Utility.
 * Complies with Digital Personal Data Protection (DPDP) Act & Reserve Bank of India / UIDAI guidelines.
 */

/**
 * Masks 12-digit Indian Aadhaar Number.
 * Example: '548912349812' -> 'XXXX-XXXX-9812'
 */
function maskAadhaar(aadhaar) {
  if (!aadhaar || typeof aadhaar !== 'string') return null;
  const digits = aadhaar.replace(/\D/g, '');
  if (digits.length < 4) return 'XXXX-XXXX-XXXX';
  const last4 = digits.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

/**
 * Masks 10-character Indian Permanent Account Number (PAN).
 * Example: 'ABCDE1234F' -> 'XXXXX1234F'
 */
function maskPan(pan) {
  if (!pan || typeof pan !== 'string') return null;
  const cleaned = pan.trim().toUpperCase();
  if (cleaned.length !== 10) return 'XXXXXXXXXX';
  return `XXXXX${cleaned.slice(5)}`;
}

/**
 * Masks Bank Account Number.
 * Example: '918237461928' -> 'XXXXXX1928'
 */
function maskBankAccount(acc) {
  if (!acc || typeof acc !== 'string') return null;
  const digits = acc.replace(/\D/g, '');
  if (digits.length < 4) return 'XXXXXXXX';
  return `XXXXXX${digits.slice(-4)}`;
}

/**
 * Masks Phone Number for public catalogs to prevent web scraping and spam.
 * Example: '9876543210' -> '+91 XXXXX-XX210'
 */
function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 3) return '+91 XXXXX-XXXXX';
  const last3 = digits.slice(-3);
  return `+91 XXXXX-XX${last3}`;
}

/**
 * Sanitizes a Worker Profile record based on viewer authorization.
 * Only COOPERATIVE_ADMIN and the worker owner themselves can view raw PII.
 *
 * @param {Object} worker - Raw database row
 * @param {Object} viewer - req.user ({ id, role })
 * @returns {Object} Sanitized worker profile
 */
function sanitizeWorkerProfile(worker, viewer) {
  if (!worker) return null;

  const isOwner = viewer && viewer.id === worker.user_id;
  const isAdmin = viewer && viewer.role === 'COOPERATIVE_ADMIN';

  // Privileged viewers receive full profile
  if (isOwner || isAdmin) {
    return worker;
  }

  // Public or regular citizen viewer gets masked identifiers
  const sanitized = { ...worker };
  
  if (sanitized.aadhaar_number) {
    sanitized.aadhaar_number = maskAadhaar(sanitized.aadhaar_number);
  }
  if (sanitized.pan_number) {
    sanitized.pan_number = maskPan(sanitized.pan_number);
  }
  if (sanitized.ration_card) {
    sanitized.ration_card = 'XXXX-RESTRICTED';
  }
  if (sanitized.bank_account) {
    sanitized.bank_account = maskBankAccount(sanitized.bank_account);
  }
  if (sanitized.bank_ifsc) {
    // Reveal bank prefix only e.g. SBIN0... -> SBINXXXX
    sanitized.bank_ifsc = sanitized.bank_ifsc.length >= 4 ? `${sanitized.bank_ifsc.substring(0, 4)}XXXXXXX` : 'XXXXXXXX';
  }
  if (sanitized.emergency_contact_phone) {
    sanitized.emergency_contact_phone = maskPhone(sanitized.emergency_contact_phone);
  }

  return sanitized;
}

module.exports = {
  maskAadhaar,
  maskPan,
  maskBankAccount,
  maskPhone,
  sanitizeWorkerProfile,
};
