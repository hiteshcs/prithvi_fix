const { query } = require('../db/connection');

/**
 * PUT /api/profile
 * Update current user's basic profile fields.
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone, district, city, address, pincode } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Validation Error', message: 'Name must be at least 2 characters.' });
    }

    const result = await query(
      `UPDATE users
       SET name = $1, phone = $2, district = $3, city = $4, address = $5, pincode = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, name, email, phone, role, district, city, address, pincode, latitude, longitude, avatar_url, is_active, admin_type, designation, society_id, created_at, updated_at`,
      [name.trim(), phone || null, district || null, city || null, address || null, pincode || null, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found.' });
    }

    res.json({ message: 'Profile updated successfully.', user: result.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update profile.' });
  }
}

/**
 * GET /api/profile/addresses
 * Fetch all saved addresses for current user.
 */
async function getSavedAddresses(req, res) {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT * FROM saved_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );
    res.json({ addresses: result.rows });
  } catch (err) {
    console.error('Get saved addresses error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch saved addresses.' });
  }
}

/**
 * POST /api/profile/addresses
 * Create a new saved address.
 */
async function createSavedAddress(req, res) {
  try {
    const userId = req.user.id;
    const { label, full_address, district, city, pincode, landmark, latitude, longitude, is_default } = req.body;

    if (!full_address || full_address.trim().length < 5) {
      return res.status(400).json({ error: 'Validation Error', message: 'Full address is required (min 5 chars).' });
    }

    // If setting as default, unset all others first
    if (is_default) {
      await query(`UPDATE saved_addresses SET is_default = 0 WHERE user_id = $1`, [userId]);
    }

    const result = await query(
      `INSERT INTO saved_addresses (user_id, label, full_address, district, city, pincode, landmark, latitude, longitude, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        (label || 'Home').trim(),
        full_address.trim(),
        district || null,
        city || null,
        pincode || null,
        landmark || null,
        latitude || null,
        longitude || null,
        is_default ? 1 : 0
      ]
    );

    res.status(201).json({ message: 'Address saved.', address: result.rows[0] });
  } catch (err) {
    console.error('Create saved address error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to save address.' });
  }
}

/**
 * PUT /api/profile/addresses/:id
 * Update an existing saved address.
 */
async function updateSavedAddress(req, res) {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const { label, full_address, district, city, pincode, landmark, latitude, longitude, is_default } = req.body;

    if (!full_address || full_address.trim().length < 5) {
      return res.status(400).json({ error: 'Validation Error', message: 'Full address is required (min 5 chars).' });
    }

    // If setting as default, unset all others first
    if (is_default) {
      await query(`UPDATE saved_addresses SET is_default = 0 WHERE user_id = $1`, [userId]);
    }

    const result = await query(
      `UPDATE saved_addresses
       SET label = $1, full_address = $2, district = $3, city = $4, pincode = $5, landmark = $6,
           latitude = $7, longitude = $8, is_default = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [
        (label || 'Home').trim(),
        full_address.trim(),
        district || null,
        city || null,
        pincode || null,
        landmark || null,
        latitude || null,
        longitude || null,
        is_default ? 1 : 0,
        addressId,
        userId
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Address not found or not owned by you.' });
    }

    res.json({ message: 'Address updated.', address: result.rows[0] });
  } catch (err) {
    console.error('Update saved address error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update address.' });
  }
}

/**
 * DELETE /api/profile/addresses/:id
 * Delete a saved address.
 */
async function deleteSavedAddress(req, res) {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const result = await query(
      `DELETE FROM saved_addresses WHERE id = $1 AND user_id = $2 RETURNING id`,
      [addressId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Address not found or not owned by you.' });
    }

    res.json({ message: 'Address deleted.' });
  } catch (err) {
    console.error('Delete saved address error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to delete address.' });
  }
}

module.exports = { updateProfile, getSavedAddresses, createSavedAddress, updateSavedAddress, deleteSavedAddress };
