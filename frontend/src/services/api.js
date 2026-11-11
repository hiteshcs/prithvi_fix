const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const url = API_BASE.endsWith('/') 
    ? `${API_BASE.slice(0, -1)}${endpoint}`
    : `${API_BASE}${endpoint}`;

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && (data.message?.toLowerCase().includes('token') || data.message?.toLowerCase().includes('revoked'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const fallbackMsg = response.status >= 500 
      ? 'Backend server temporarily unreachable. Please retry.' 
      : response.status === 404
      ? 'Requested endpoint not found.'
      : 'Request failed';
    const error = new Error(data.message || data.error || fallbackMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  logout: () => request('/auth/logout', { method: 'POST' }).catch(() => ({})),
  getMe: () => request('/auth/me'),

  // Services
  getServices: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== null && v !== 'ALL')
    ).toString();
    return request(`/services${query ? `?${query}` : ''}`);
  },
  getServiceLocations: (district = '') => request(`/services/locations${district ? `?district=${encodeURIComponent(district)}` : ''}`),
  getServiceById: (id) => request(`/services/${id}`),

  // Workers
  getWorkers: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();
    return request(`/workers${query ? `?${query}` : ''}`);
  },
  getWorkerById: (id) => request(`/workers/${id}`),

  // Matching (Phase 3 with Trust Cards & Master Pairing)
  recommendWorkers: (data) => request('/matching/recommend', { method: 'POST', body: data }),

  // Bookings (Phase 1-6)
  createBooking: (data) => request('/bookings', { method: 'POST', body: data }),
  getBookings: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();
    return request(`/bookings${query ? `?${query}` : ''}`);
  },
  getBookingById: (id) => request(`/bookings/${id}`),
  updateBookingStatus: (id, status, workerId) =>
    request(`/bookings/${id}/status`, { method: 'PUT', body: { status, workerId } }),
  cancelBooking: (id, reason) =>
    request(`/bookings/${id}/cancel`, { method: 'POST', body: { reason } }),

  // Phase 4: OTP Handshakes, Photos & Parts
  verifyArrivalOtp: (bookingId, otp) =>
    request(`/bookings/${bookingId}/verify-arrival-otp`, { method: 'POST', body: { otp } }),
  verifyCompletionOtp: (bookingId, otp) =>
    request(`/bookings/${bookingId}/verify-completion-otp`, { method: 'POST', body: { otp } }),
  uploadPhotoProof: (bookingId, type, photoUrl) =>
    request(`/bookings/${bookingId}/photo-proof`, { method: 'POST', body: { type, photoUrl } }),
  addPartsToBooking: (bookingId, parts) =>
    request(`/bookings/${bookingId}/add-parts`, { method: 'POST', body: { parts } }),

  // Phase 6: 30-Day Guarantee
  claimGuarantee: (bookingId) =>
    request(`/bookings/${bookingId}/claim-guarantee`, { method: 'POST' }),

  // Worker Portal
  getWorkerDashboard: () => request('/worker-portal/dashboard'),
  updateWorkerAvailability: (availability) =>
    request('/worker-portal/availability', { method: 'PUT', body: { availability } }),
  handleWorkerJobAction: (bookingId, action) =>
    request(`/worker-portal/jobs/${bookingId}/action`, { method: 'PUT', body: { action } }),
  getWorkerWelfare: () => request('/worker-portal/welfare'),
  enrollWorkerWelfare: (data) => request('/worker-portal/welfare/enroll', { method: 'POST', body: data }),
  getWorkerToolkits: () => request('/worker-portal/toolkits'),
  orderWorkerToolkit: (data) => request('/worker-portal/toolkits/order', { method: 'POST', body: data }),

  // Admin Portal
  getAdminDashboard: () => request('/admin/dashboard'),
  getAdminWorkers: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();
    return request(`/admin/workers${query ? `?${query}` : ''}`);
  },
  verifyWorker: (workerId, status, rejectionReason = '') =>
    request(`/admin/workers/${workerId}/verify`, { method: 'PUT', body: { status, rejectionReason } }),
  getAdminBookings: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();
    return request(`/admin/bookings${query ? `?${query}` : ''}`);
  },

  // Smart Features & Demand Forecast
  getDemandForecast: () => request('/smart-features/forecast'),
  getWorkforceAllocation: () => request('/smart-features/allocation'),
  approveMutualAid: (proposalId) =>
    request(`/smart-features/mutual-aid/${proposalId}/approve`, { method: 'POST' }),

  // Payments & Invoices
  processPayment: (data) => request('/payments/process', { method: 'POST', body: data }),
  getInvoice: (bookingId) => request(`/payments/invoice/${bookingId}`),

  // Reviews
  submitReview: (data) => request('/reviews', { method: 'POST', body: data }),
  getWorkerReviews: (workerId) => request(`/reviews/worker/${workerId}`),
  getFeaturedReviews: () => request('/reviews/featured'),

  // Phase 4 & 7: Governance, SOS, Disputes & Locked Parts Catalog
  triggerSos: (data) => request('/governance/sos', { method: 'POST', body: data }),
  getSosAlerts: () => request('/governance/sos-alerts'),
  getLiveMap: () => request('/governance/live-map'),
  createDispute: (data) => request('/governance/disputes', { method: 'POST', body: data }),
  getDisputes: () => request('/governance/disputes'),
  resolveDispute: (id, resolutionNotes) =>
    request(`/governance/disputes/${id}/resolve`, { method: 'PUT', body: { resolutionNotes } }),
  getApplianceLineage: (customerId) =>
    request(`/governance/appliance-lineage${customerId ? `/${customerId}` : ''}`),
  getPartsCatalog: (tradeCategory) =>
    request(`/governance/parts-catalog${tradeCategory ? `?tradeCategory=${encodeURIComponent(tradeCategory)}` : ''}`),

  // ── Federation Head Tariff Administration ──
  getAllServicesAdmin: () => request('/governance/admin/services'),
  createService: (data) => request('/governance/admin/services', { method: 'POST', body: data }),
  updateService: (id, data) => request(`/governance/admin/services/${id}`, { method: 'PUT', body: data }),
  deleteService: (id) => request(`/governance/admin/services/${id}`, { method: 'DELETE' }),
  createPart: (data) => request('/governance/admin/parts-catalog', { method: 'POST', body: data }),
  updatePart: (id, data) => request(`/governance/admin/parts-catalog/${id}`, { method: 'PUT', body: data }),
  deletePart: (id) => request(`/governance/admin/parts-catalog/${id}`, { method: 'DELETE' }),

  // AI Assistant Chatbot
  sendAIChat: (message, history = [], language = 'EN') =>
    request('/smart-features/ai-chat', {
      method: 'POST',
      body: { message, history, language },
    }),

  // Society Registration & Lifecycle Tracking (Pages 1 & 2)
  registerSociety: (data) =>
    request('/societies/register', {
      method: 'POST',
      body: data,
    }),
  getSocietyTracking: (trackingId) =>
    request(`/societies/track/${encodeURIComponent(trackingId)}`),
  getSocietiesList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/societies${query ? `?${query}` : ''}`);
  },
  updateSocietyTimeline: (id, data) =>
    request(`/societies/${id}/timeline`, {
      method: 'PATCH',
      body: data,
    }),
  getPendingSocietiesForDco: () =>
    request('/societies/pending/dco'),
  getPublicFederations: (district = '') =>
    request(`/societies/federations${district ? `?district=${encodeURIComponent(district)}` : ''}`),
  createFederation: (data) =>
    request('/societies/federations', {
      method: 'POST',
      body: data,
    }),
  getDistricts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/societies/districts${query ? `?${query}` : ''}`);
  },
  createDistrict: (data) =>
    request('/societies/districts', {
      method: 'POST',
      body: data,
    }),
  toggleDistrictPortal: (id, data) =>
    request(`/societies/districts/${id}/toggle`, {
      method: 'PATCH',
      body: data,
    }),
  getFederationsOverview: (district = '') =>
    request(`/societies/federation-overview${district ? `?district=${encodeURIComponent(district)}` : ''}`),
  dcoReviewSociety: (id, data) =>
    request(`/societies/${id}/dco-review`, {
      method: 'POST',
      body: data,
    }),

  getFederationAdminDashboard: (societyId = '') =>
    request(`/federation/admin-dashboard${societyId !== undefined && societyId !== null && societyId !== '' ? `?societyId=${societyId}` : ''}`),
  getFederationTreasurerDashboard: (societyId = '') =>
    request(`/federation/treasurer-dashboard${societyId !== undefined && societyId !== null && societyId !== '' ? `?societyId=${societyId}` : ''}`),
  applyNcctTraining: (data) =>
    request('/federation/ncct/apply', {
      method: 'POST',
      body: data,
    }),
  getInstitutionalTenders: () =>
    request('/federation/tenders'),
  registerWorkerByFederation: (data) =>
    request('/federation/workers/register', {
      method: 'POST',
      body: data,
    }),
  resolveDisputeTicket: (disputeId, data) =>
    request(`/federation/disputes/${disputeId}/resolve`, {
      method: 'POST',
      body: data,
    }),

  // DCO Statutory Regulatory
  updateSocietyAudit: (id, data) =>
    request(`/societies/${id}/audit`, {
      method: 'PATCH',
      body: data,
    }),
  updateSocietyGovernance: (id, data) =>
    request(`/societies/${id}/governance`, {
      method: 'PATCH',
      body: data,
    }),
  createOrUpdateInquiry: (data) =>
    request('/societies/inquiries', {
      method: 'POST',
      body: data,
    }),

  // Stats
  getDbStats: () => request('/db/stats'),

  // Cooperative Admin & Worker Verification
  getAdminDashboard: () => request('/admin/dashboard'),
  getAdminWorkers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/workers${query ? `?${query}` : ''}`);
  },
  verifyWorker: (workerId, status, rejectionReason = '', verificationStep = null) =>
    request(`/admin/workers/${workerId}/verify`, {
      method: 'PUT',
      body: { status, rejectionReason, verificationStep },
    }),
  getAdminBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/bookings${query ? `?${query}` : ''}`);
  },
  getAdminAuditLogs: () => request('/admin/audit-logs'),

  // Profile & Saved Addresses
  updateProfile: (data) => request('/profile', { method: 'PUT', body: data }),
  getSavedAddresses: () => request('/profile/addresses'),
  createSavedAddress: (data) => request('/profile/addresses', { method: 'POST', body: data }),
  updateSavedAddress: (id, data) => request(`/profile/addresses/${id}`, { method: 'PUT', body: data }),
  deleteSavedAddress: (id) => request(`/profile/addresses/${id}`, { method: 'DELETE' }),
};

