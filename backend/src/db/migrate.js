const { query, ensureDatabaseExists } = require('./connection');

let migrationPromise = null;

/**
 * Create all PostgreSQL database tables and apply schema migrations for 7-Phase Workflow.
 */
async function migrate() {
  if (migrationPromise) return migrationPromise;

  migrationPromise = (async () => {
    await ensureDatabaseExists();

    const ddl = `
    -- =============================================
    -- Cooperatives
    -- =============================================
    CREATE TABLE IF NOT EXISTS cooperatives (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      registration_number TEXT UNIQUE,
      district TEXT NOT NULL,
      city TEXT,
      address TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- Decentralized Regional Federation Architecture
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS local_area TEXT;
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS jurisdiction_zone TEXT;
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING_DCO_APPROVAL';
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS dco_office_name TEXT;
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS dco_officer_name TEXT;
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS dco_approval_status VARCHAR(50) DEFAULT 'PENDING';
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS dco_approved_at TIMESTAMPTZ;
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS dco_order_number TEXT;
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS dco_audit_notes TEXT;
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS federation_type VARCHAR(50) DEFAULT 'REGIONAL_FEDERATION';
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS total_member_societies INTEGER DEFAULT 0;
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS capital_reserve REAL DEFAULT 500000.0;
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS cooperative_bank_name TEXT;
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS bank_account_no TEXT;
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS bank_ifsc TEXT;
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS worker_wage_share_pct REAL DEFAULT 93.0;
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS welfare_fund_share_pct REAL DEFAULT 5.0;
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS platform_upkeep_share_pct REAL DEFAULT 2.0;
    ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS bocw_cess_pct REAL DEFAULT 0.0;

    -- =============================================
    -- Users (Customer, Worker, Admin)
    -- =============================================
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role VARCHAR(50) NOT NULL CHECK(role IN ('CUSTOMER', 'WORKER', 'COOPERATIVE_ADMIN')),
      avatar_url TEXT,
      district TEXT,
      city TEXT,
      address TEXT,
      pincode TEXT,
      latitude REAL,
      longitude REAL,
      is_active INTEGER DEFAULT 1,
      admin_type VARCHAR(50) DEFAULT 'SOCIETY_ADMIN',
      designation TEXT,
      society_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_type VARCHAR(50) DEFAULT 'SOCIETY_ADMIN';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS designation TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS society_id INTEGER;
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('CUSTOMER', 'WORKER', 'COOPERATIVE_ADMIN', 'FEDERATION', 'DCO', 'ADMIN'));

    -- =============================================
    -- Workers (extends Users with role='WORKER')
    -- =============================================
    CREATE TABLE IF NOT EXISTS workers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE,
      worker_code TEXT UNIQUE NOT NULL,
      cooperative_id INTEGER NOT NULL,
      experience_years INTEGER DEFAULT 0,
      service_area TEXT,
      latitude REAL,
      longitude REAL,
      verification_status VARCHAR(50) DEFAULT 'PENDING' CHECK(verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
      availability VARCHAR(50) DEFAULT 'AVAILABLE' CHECK(availability IN ('AVAILABLE', 'BUSY', 'OFFLINE', 'ON_LEAVE')),
      rating REAL DEFAULT 0.0,
      total_reviews INTEGER DEFAULT 0,
      total_jobs_completed INTEGER DEFAULT 0,
      total_earnings REAL DEFAULT 0.0,
      bio TEXT,
      tier VARCHAR(50) DEFAULT 'BRONZE' CHECK(tier IN ('BRONZE', 'SILVER', 'GOLD', 'MASTER')),
      merit_points INTEGER DEFAULT 100,
      strike_count INTEGER DEFAULT 0,
      sos_active INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (cooperative_id) REFERENCES cooperatives(id)
    );

    -- Ensure newly introduced columns exist in workers if table was already created
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS cooperative_id INTEGER;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS federation_id INTEGER DEFAULT 1;
    ALTER TABLE workers ALTER COLUMN federation_id DROP NOT NULL;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'BRONZE';
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS merit_points INTEGER DEFAULT 100;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS strike_count INTEGER DEFAULT 0;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS sos_active INTEGER DEFAULT 0;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS primary_trade TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS sub_skills TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS tools_owned TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS aadhaar_number TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS pan_number TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS ration_card TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS bank_name TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS bank_account TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS bank_ifsc TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS emergency_contact_relation TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS application_no TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS reviewed_by_admin_id INTEGER;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS toolkit_compliance VARCHAR(50) DEFAULT 'PENDING';
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS aadhaar_hash TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS police_verification_expiry DATE;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS verification_badge VARCHAR(50) DEFAULT 'STANDARD';
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS verification_step INTEGER DEFAULT 2;

    -- =============================================
    -- Skills
    -- =============================================
    CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- =============================================
    -- Worker Skills (many-to-many)
    -- =============================================
    CREATE TABLE IF NOT EXISTS worker_skills (
      id SERIAL PRIMARY KEY,
      worker_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      proficiency_level VARCHAR(50) DEFAULT 'INTERMEDIATE' CHECK(proficiency_level IN ('BEGINNER', 'INTERMEDIATE', 'EXPERT')),
      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
      UNIQUE(worker_id, skill_id)
    );

    -- =============================================
    -- Certifications
    -- =============================================
    CREATE TABLE IF NOT EXISTS certifications (
      id SERIAL PRIMARY KEY,
      worker_id INTEGER NOT NULL,
      certification_name TEXT NOT NULL,
      issuing_organization TEXT,
      certificate_number TEXT,
      issue_date TEXT,
      expiry_date TEXT,
      document_url TEXT,
      verification_status VARCHAR(50) DEFAULT 'PENDING' CHECK(verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
    );

    -- =============================================
    -- Services
    -- =============================================
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      base_price REAL NOT NULL,
      price_unit TEXT DEFAULT 'per_visit',
      icon TEXT,
      is_complex INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE services ADD COLUMN IF NOT EXISTS is_complex INTEGER DEFAULT 0;

    -- =============================================
    -- Locked Parts Catalog (Phase 2 & 4 Price Matrix)
    -- =============================================
    CREATE TABLE IF NOT EXISTS parts_catalog (
      id SERIAL PRIMARY KEY,
      trade_category VARCHAR(100) NOT NULL,
      part_name TEXT NOT NULL,
      standard_price REAL NOT NULL,
      unit TEXT DEFAULT 'piece',
      warranty_months INTEGER DEFAULT 6,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- =============================================
    -- Bookings (Phase 1-6 Enhanced)
    -- =============================================
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      booking_code TEXT UNIQUE NOT NULL,
      customer_id INTEGER NOT NULL,
      worker_id INTEGER,
      paired_master_worker_id INTEGER,
      service_id INTEGER NOT NULL,
      location_district TEXT,
      location_city TEXT,
      location_address TEXT,
      location_pincode TEXT,
      latitude REAL,
      longitude REAL,
      scheduled_date TEXT,
      scheduled_time TEXT,
      is_emergency INTEGER DEFAULT 0,
      is_bulk_order INTEGER DEFAULT 0,
      bulk_discount_amount REAL DEFAULT 0.0,
      status VARCHAR(50) DEFAULT 'REQUESTED' CHECK(status IN ('REQUESTED', 'MATCHED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
      amount REAL,
      parts_cost REAL DEFAULT 0.0,
      parts_details TEXT,
      cooperative_fee REAL,
      platform_fee REAL,
      total_amount REAL,
      notes TEXT,
      arrival_otp VARCHAR(6),
      completion_otp VARCHAR(6),
      pre_job_photo_url TEXT,
      post_job_photo_url TEXT,
      guarantee_armed_until TIMESTAMPTZ,
      guarantee_claimed INTEGER DEFAULT 0,
      completed_at TIMESTAMPTZ,
      cancelled_at TIMESTAMPTZ,
      cancellation_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (worker_id) REFERENCES workers(id),
      FOREIGN KEY (paired_master_worker_id) REFERENCES workers(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
    );

    -- Ensure newly introduced columns exist in bookings
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS arrival_otp VARCHAR(6);
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completion_otp VARCHAR(6);
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_bulk_order INTEGER DEFAULT 0;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bulk_discount_amount REAL DEFAULT 0.0;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paired_master_worker_id INTEGER;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pre_job_photo_url TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS post_job_photo_url TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS parts_cost REAL DEFAULT 0.0;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS parts_details TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guarantee_armed_until TIMESTAMPTZ;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guarantee_claimed INTEGER DEFAULT 0;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS declined_worker_ids TEXT DEFAULT '';
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cooperative_fee REAL DEFAULT 0.0;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS platform_fee REAL DEFAULT 0.0;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount REAL DEFAULT 0.0;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS squad_size INTEGER DEFAULT 1;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS squad_worker_ids TEXT DEFAULT '';
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS transit_compensation_fee REAL DEFAULT 50.0;

    -- =============================================
    -- Payments (Phase 5 Escrow Model)
    -- =============================================
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER NOT NULL,
      transaction_id TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      payment_method VARCHAR(50) CHECK(payment_method IN ('UPI', 'CARD', 'NET_BANKING', 'CASH')),
      status VARCHAR(50) DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ESCROW_HELD', 'SUCCESS', 'FAILED', 'REFUNDED')),
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );

    -- =============================================
    -- Invoices (Phase 5 Form IV Tax Invoices)
    -- =============================================
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER NOT NULL UNIQUE,
      invoice_number TEXT UNIQUE NOT NULL,
      cooperative_name TEXT,
      customer_name TEXT,
      worker_name TEXT,
      service_name TEXT,
      service_date TEXT,
      amount REAL,
      parts_cost REAL DEFAULT 0.0,
      cooperative_fee REAL,
      platform_fee REAL,
      total_amount REAL,
      payment_status VARCHAR(50) DEFAULT 'UNPAID',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );

    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS parts_cost REAL DEFAULT 0.0;

    -- =============================================
    -- Reviews (Phase 6 2-Way Feedback)
    -- =============================================
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER NOT NULL UNIQUE,
      customer_id INTEGER NOT NULL,
      worker_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      punctuality_score INTEGER DEFAULT 5,
      quality_score INTEGER DEFAULT 5,
      safety_score INTEGER DEFAULT 5,
      worker_reply TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (worker_id) REFERENCES workers(id)
    );

    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS punctuality_score INTEGER DEFAULT 5;
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 5;
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS safety_score INTEGER DEFAULT 5;
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS worker_reply TEXT;

    -- =============================================
    -- Worker Welfare (Phase 5 & 7)
    -- =============================================
    CREATE TABLE IF NOT EXISTS worker_welfare (
      id SERIAL PRIMARY KEY,
      worker_id INTEGER NOT NULL,
      benefit_type TEXT NOT NULL,
      benefit_name TEXT NOT NULL,
      provider TEXT,
      status VARCHAR(50) DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'ENROLLED', 'PENDING', 'EXPIRED')),
      enrollment_date TEXT,
      details TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
    );

    -- =============================================
    -- Appliance Service Lineage (Phase 6 Permanent History)
    -- =============================================
    CREATE TABLE IF NOT EXISTS appliance_lineage (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      appliance_type VARCHAR(100) NOT NULL,
      brand_model TEXT,
      serial_number TEXT,
      last_service_date TEXT,
      service_summary TEXT,
      technician_name TEXT,
      booking_id INTEGER,
      warranty_until TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
    );

    -- =============================================
    -- Dispute Resolution Tickets (Phase 7 Governance)
    -- =============================================
    CREATE TABLE IF NOT EXISTS dispute_tickets (
      id SERIAL PRIMARY KEY,
      ticket_code TEXT UNIQUE NOT NULL,
      booking_id INTEGER,
      customer_id INTEGER NOT NULL,
      worker_id INTEGER,
      issue_type VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED')),
      resolution_notes TEXT,
      arbitrator_name TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      resolved_at TIMESTAMPTZ,
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (worker_id) REFERENCES workers(id),
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );

    -- =============================================
    -- SOS Emergency Logs (Phase 4 Worker Safety)
    -- =============================================
    CREATE TABLE IF NOT EXISTS sos_logs (
      id SERIAL PRIMARY KEY,
      worker_id INTEGER NOT NULL,
      booking_id INTEGER,
      latitude REAL,
      longitude REAL,
      status VARCHAR(50) DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
      details TEXT,
      triggered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      resolved_at TIMESTAMPTZ,
      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
    );

    -- =============================================
    -- Newly Registered / Formed Societies (Pages 1 & 2)
    -- =============================================
    CREATE TABLE IF NOT EXISTS societies (
      id SERIAL PRIMARY KEY,
      society_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'DRAFT' CHECK(status IN ('DRAFT', 'SUBMITTED', 'DCO_REVIEW', 'REGISTRAR_APPROVED', 'ACTIVE', 'REJECTED')),
      registration_number TEXT,
      registered_email TEXT UNIQUE NOT NULL,
      registered_phone TEXT,
      district TEXT NOT NULL,
      city TEXT,
      address TEXT,
      pincode TEXT,
      objectives TEXT,
      is_nlcf_affiliated INTEGER DEFAULT 0,
      nlcf_certificate_no TEXT,
      nlcf_affiliation_date TEXT,
      dco_office_name TEXT,
      dco_officer_name TEXT,
      dco_linked INTEGER DEFAULT 0,
      ncct_training_completed INTEGER DEFAULT 0,
      ministry_recognized INTEGER DEFAULT 0,
      initial_capital_balance REAL DEFAULT 10000.0,
      bank_account_no TEXT,
      cooperative_bank_name TEXT,
      bank_ifsc TEXT,
      audit_frequency VARCHAR(50) DEFAULT 'QUARTERLY' CHECK(audit_frequency IN ('QUARTERLY', 'HALF_YEARLY')),
      timeline_stage INTEGER DEFAULT 1,
      tracking_id TEXT UNIQUE NOT NULL,
      total_workers_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE societies ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER;
    ALTER TABLE societies ADD COLUMN IF NOT EXISTS federation_id INTEGER REFERENCES cooperatives(id) ON DELETE SET NULL;
    ALTER TABLE societies ADD COLUMN IF NOT EXISTS audit_grade VARCHAR(50) DEFAULT 'A';
    ALTER TABLE societies ALTER COLUMN audit_grade TYPE VARCHAR(50);
    ALTER TABLE societies ADD COLUMN IF NOT EXISTS annual_return_status VARCHAR(50) DEFAULT 'FILED_CURRENT_FY';
    ALTER TABLE societies ADD COLUMN IF NOT EXISTS last_agm_date VARCHAR(50) DEFAULT '2024-09-15';
    ALTER TABLE societies ADD COLUMN IF NOT EXISTS committee_term_end VARCHAR(50) DEFAULT '2027-03-31';
    ALTER TABLE societies ADD COLUMN IF NOT EXISTS reserve_fund_balance REAL DEFAULT 125000.0;
    ALTER TABLE societies ADD COLUMN IF NOT EXISTS regulatory_inquiry_status VARCHAR(50) DEFAULT 'CLEAR';
    ALTER TABLE societies ADD COLUMN IF NOT EXISTS worker_wage_share_pct REAL DEFAULT 93.0;
    ALTER TABLE societies ADD COLUMN IF NOT EXISTS welfare_fund_share_pct REAL DEFAULT 5.0;
    ALTER TABLE societies ADD COLUMN IF NOT EXISTS platform_upkeep_share_pct REAL DEFAULT 2.0;
    ALTER TABLE societies ADD COLUMN IF NOT EXISTS bocw_cess_pct REAL DEFAULT 0.0;

    CREATE TABLE IF NOT EXISTS society_regulatory_inquiries (
      id SERIAL PRIMARY KEY,
      society_id INTEGER REFERENCES societies(id) ON DELETE CASCADE,
      district TEXT NOT NULL,
      case_number TEXT UNIQUE NOT NULL,
      section VARCHAR(50) NOT NULL,
      title TEXT NOT NULL,
      complainant TEXT NOT NULL,
      respondent TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'HEARING_SCHEDULED' CHECK(status IN ('HEARING_SCHEDULED', 'UNDER_INQUIRY', 'RESOLVED', 'SURCHARGE_ORDERED')),
      next_hearing_date DATE,
      dco_remarks TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- =============================================
    -- Society Founding Members (Page 1: Min 10 Members)
    -- =============================================
    CREATE TABLE IF NOT EXISTS society_founding_members (
      id SERIAL PRIMARY KEY,
      society_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      occupation TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT,
      aadhaar_number TEXT,
      id_proof_url TEXT,
      role_in_society VARCHAR(50) DEFAULT 'MEMBER' CHECK(role_in_society IN ('PRESIDENT', 'SECRETARY', 'TREASURER', 'MEMBER')),
      is_signatory INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
    );

    -- =============================================
    -- Society Statutory Documents (Page 1 Dossier)
    -- =============================================
    CREATE TABLE IF NOT EXISTS society_statutory_documents (
      id SERIAL PRIMARY KEY,
      society_id INTEGER NOT NULL,
      doc_type VARCHAR(100) NOT NULL,
      document_name TEXT NOT NULL,
      document_url TEXT NOT NULL,
      verification_status VARCHAR(50) DEFAULT 'PENDING' CHECK(verification_status IN ('PENDING', 'VERIFIED', 'FLAGGED')),
      verified_by_officer TEXT,
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
    );

    -- =============================================
    -- NCCT Training Applications & Records (Pages 1, 3, 4)
    -- =============================================
    CREATE TABLE IF NOT EXISTS ncct_trainings (
      id SERIAL PRIMARY KEY,
      training_code TEXT UNIQUE NOT NULL,
      society_id INTEGER NOT NULL,
      worker_id INTEGER,
      worker_name TEXT,
      trade VARCHAR(100) NOT NULL,
      course_name TEXT NOT NULL,
      institute_name TEXT DEFAULT 'NCCT Regional Institute of Cooperative Management',
      training_type VARCHAR(50) DEFAULT 'TECHNICAL' CHECK(training_type IN ('TECHNICAL', 'ACCOUNTING_GOVERNANCE', 'SAFETY')),
      status VARCHAR(50) DEFAULT 'APPLIED' CHECK(status IN ('APPLIED', 'ENROLLED', 'IN_TRAINING', 'COMPLETED', 'CERTIFIED')),
      cost_per_worker REAL DEFAULT 2500.0,
      subsidy_amount REAL DEFAULT 2000.0,
      payable_by_society REAL DEFAULT 500.0,
      certificate_no TEXT,
      enrolled_date TEXT,
      completion_date TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE SET NULL
    );

    -- =============================================
    -- Society Treasury & Financial Accounting (Page 4: 10 KPIs)
    -- =============================================
    CREATE TABLE IF NOT EXISTS society_treasury_ledger (
      id SERIAL PRIMARY KEY,
      society_id INTEGER NOT NULL,
      transaction_code TEXT UNIQUE NOT NULL,
      transaction_type VARCHAR(50) NOT NULL CHECK(transaction_type IN (
        '2_PERCENT_PLATFORM_FEE',
        '5_PERCENT_PLATFORM_FEE',
        '5_PERCENT_WELFARE_FUND',
        'CANCELLATION_REVENUE',
        'LOAN_DISBURSEMENT',
        'LOAN_REPAYMENT',
        'PROJECT_FUNDS_INFLOW',
        'INSURANCE_PREMIUM_OUTFLOW',
        'TREASURY_DEPOSIT'
      )),
      amount REAL NOT NULL,
      worker_id INTEGER,
      project_id INTEGER,
      description TEXT NOT NULL,
      balance_after REAL NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
    );

    ALTER TABLE society_treasury_ledger DROP CONSTRAINT IF EXISTS society_treasury_ledger_transaction_type_check;
    ALTER TABLE society_treasury_ledger ADD CONSTRAINT society_treasury_ledger_transaction_type_check CHECK(transaction_type IN (
      '2_PERCENT_PLATFORM_FEE',
      '5_PERCENT_PLATFORM_FEE',
      '5_PERCENT_WELFARE_FUND',
      'CANCELLATION_REVENUE',
      'LOAN_DISBURSEMENT',
      'LOAN_REPAYMENT',
      'PROJECT_FUNDS_INFLOW',
      'INSURANCE_PREMIUM_OUTFLOW',
      'TREASURY_DEPOSIT'
    ));

    -- =============================================
    -- Worker Welfare, ESIC Insurance & Micro-Loans (Page 4)
    -- =============================================
    CREATE TABLE IF NOT EXISTS society_worker_welfare (
      id SERIAL PRIMARY KEY,
      worker_id INTEGER NOT NULL UNIQUE,
      society_id INTEGER NOT NULL,
      health_insurance_policy_no TEXT,
      health_insurance_provider TEXT DEFAULT 'ESIC / National Health Scheme',
      health_insurance_status VARCHAR(50) DEFAULT 'ACTIVE' CHECK(health_insurance_status IN ('ACTIVE', 'IN_PROCESS', 'EXPIRED')),
      accident_policy_no TEXT,
      accident_coverage_amount REAL DEFAULT 500000.0,
      accident_policy_status VARCHAR(50) DEFAULT 'ACTIVE',
      loan_sanctioned_amount REAL DEFAULT 0.0,
      loan_balance_due REAL DEFAULT 0.0,
      next_loan_due_amount REAL DEFAULT 0.0,
      next_loan_due_date TEXT,
      mini_pf_accumulated REAL DEFAULT 0.0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
      FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
    );

    -- =============================================
    -- Institutional Tenders & Bids (Pages 2 & 4)
    -- =============================================
    CREATE TABLE IF NOT EXISTS institutional_tenders (
      id SERIAL PRIMARY KEY,
      tender_code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      issuing_authority TEXT NOT NULL,
      category TEXT NOT NULL,
      district TEXT NOT NULL,
      estimated_value REAL NOT NULL,
      requires_nlcf_affiliation INTEGER DEFAULT 1,
      status VARCHAR(50) DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'BID_SUBMITTED', 'AWARDED', 'IN_PROGRESS', 'COMPLETED')),
      awarded_society_id INTEGER,
      funds_received REAL DEFAULT 0.0,
      due_remaining REAL DEFAULT 0.0,
      allocated_workers_count INTEGER DEFAULT 0,
      bid_submission_deadline TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (awarded_society_id) REFERENCES societies(id) ON DELETE SET NULL
    );

    -- Workers table extensions for NCCT & Federation affiliation
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS society_id INTEGER;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS is_ncct_certified INTEGER DEFAULT 0;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS ncct_certificate_no TEXT;
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS is_nlcf_affiliated INTEGER DEFAULT 0;

    -- Security Hardening: OTP anti-brute-force attempt tracking
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS arrival_otp_attempts INTEGER DEFAULT 0;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completion_otp_attempts INTEGER DEFAULT 0;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS otp_locked_until TIMESTAMPTZ;

    -- =============================================
    -- Security Audit Trail (Tamper-Evident Ledger)
    -- =============================================
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      user_role VARCHAR(50),
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50),
      entity_id VARCHAR(100),
      ip_address VARCHAR(100),
      details JSONB,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- =============================================
    -- Token Revocation Denylist
    -- =============================================
    CREATE TABLE IF NOT EXISTS token_denylist (
      id SERIAL PRIMARY KEY,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- =============================================
    -- Mandatory Toolkits (by Trade)
    -- =============================================
    CREATE TABLE IF NOT EXISTS mandatory_toolkits (
      id SERIAL PRIMARY KEY,
      trade_category TEXT NOT NULL,
      kit_name TEXT NOT NULL,
      description TEXT,
      items_included TEXT NOT NULL,
      market_price REAL NOT NULL,
      subsidized_price REAL NOT NULL,
      monthly_emi REAL NOT NULL,
      tenure_months INTEGER DEFAULT 10,
      isi_standards TEXT,
      image_url TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- =============================================
    -- Worker Toolkit Orders & Loans
    -- =============================================
    CREATE TABLE IF NOT EXISTS worker_toolkit_orders (
      id SERIAL PRIMARY KEY,
      worker_id INTEGER NOT NULL,
      toolkit_id INTEGER NOT NULL,
      order_code TEXT UNIQUE NOT NULL,
      payment_mode VARCHAR(50) NOT NULL CHECK(payment_mode IN ('DIRECT_PAY', 'COOP_LOAN')),
      total_amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0.0,
      remaining_amount REAL NOT NULL,
      monthly_emi REAL DEFAULT 0.0,
      status VARCHAR(50) DEFAULT 'ACTIVE_LOAN' CHECK(status IN ('ACTIVE_LOAN', 'DELIVERED', 'COMPLETED')),
      delivery_address TEXT,
      delivery_status VARCHAR(50) DEFAULT 'DISPATCHED' CHECK(delivery_status IN ('PROCESSING', 'DISPATCHED', 'DELIVERED')),
      loan_deduction_per_job REAL DEFAULT 50.0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
      FOREIGN KEY (toolkit_id) REFERENCES mandatory_toolkits(id) ON DELETE CASCADE
    );

    -- =============================================
    -- Indexes
    -- =============================================
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_workers_cooperative ON workers(cooperative_id);
    CREATE INDEX IF NOT EXISTS idx_workers_verification ON workers(verification_status);
    CREATE INDEX IF NOT EXISTS idx_workers_tier ON workers(tier);
    CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_worker ON bookings(worker_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_appliance_customer ON appliance_lineage(customer_id);
    CREATE INDEX IF NOT EXISTS idx_disputes_status ON dispute_tickets(status);
    CREATE INDEX IF NOT EXISTS idx_sos_status ON sos_logs(status);
    CREATE INDEX IF NOT EXISTS idx_societies_code ON societies(society_code);
    CREATE INDEX IF NOT EXISTS idx_societies_status ON societies(status);
    CREATE INDEX IF NOT EXISTS idx_societies_district ON societies(district);
    CREATE INDEX IF NOT EXISTS idx_societies_federation ON societies(federation_id);
    CREATE INDEX IF NOT EXISTS idx_treasury_society ON society_treasury_ledger(society_id);
    CREATE INDEX IF NOT EXISTS idx_welfare_worker ON society_worker_welfare(worker_id);
    CREATE INDEX IF NOT EXISTS idx_tenders_status ON institutional_tenders(status);
    CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
    CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_denylist_hash ON token_denylist(token_hash);
    CREATE INDEX IF NOT EXISTS idx_toolkit_trade ON mandatory_toolkits(trade_category);
    CREATE INDEX IF NOT EXISTS idx_toolkit_orders_worker ON worker_toolkit_orders(worker_id);

    -- =============================================
    -- State Cooperative Operational Districts Registry
    -- =============================================
    CREATE TABLE IF NOT EXISTS districts (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      state TEXT DEFAULT 'Odisha',
      headquarters TEXT,
      regional_zone TEXT,
      status VARCHAR(50) DEFAULT 'ACTIVE',
      dco_office_name TEXT,
      dco_officer_name TEXT,
      nodal_phone TEXT,
      nodal_email TEXT,
      is_portal_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await query(ddl);

  // Seed default core operational districts if not present
  await query(`
    INSERT INTO districts (name, state, headquarters, regional_zone, status, dco_office_name, dco_officer_name, nodal_phone, nodal_email, is_portal_active)
    VALUES
      ('Khordha', 'Odisha', 'Bhubaneswar', 'Central Urban Zone', 'ACTIVE', 'Khordha District Cooperative Office', 'Shri Debendra Nayak (DCO)', '0674-2548891', 'dco.khordha@coop.od.in', 1),
      ('Cuttack', 'Odisha', 'Cuttack', 'Mahanadi Commercial Zone', 'ACTIVE', 'Cuttack District Cooperative Office', 'Smt. Prangya Paramita (DCO)', '0671-2316700', 'dco.cuttack@coop.od.in', 1),
      ('Puri', 'Odisha', 'Puri', 'Coastal Pilgrim Zone', 'ACTIVE', 'Puri District Cooperative Office', 'Shri Biswajit Mishra (DCO)', '06752-224420', 'dco.puri@coop.od.in', 1)
    ON CONFLICT (name) DO NOTHING;
  `);

  // Enforce dual work requirements: Both VERIFIED and VERIFIED_EQUIPPED toolkit required to work
  await query(`
    UPDATE workers
    SET toolkit_compliance = 'VERIFIED_EQUIPPED',
        tools_owned = COALESCE(tools_owned, 'Standard ISI Certified Trade Toolkit & Safety Kit')
    WHERE verification_status = 'VERIFIED' AND (toolkit_compliance = 'PENDING' OR toolkit_compliance IS NULL);

    UPDATE workers
    SET availability = 'OFFLINE'
    WHERE verification_status != 'VERIFIED' OR toolkit_compliance != 'VERIFIED_EQUIPPED';

    -- Initialize verification_step
    UPDATE workers
    SET verification_step = 4
    WHERE verification_status = 'VERIFIED' AND (verification_step IS NULL OR verification_step < 4);

    UPDATE workers
    SET verification_step = 2
    WHERE verification_status = 'PENDING' AND verification_step IS NULL;
    -- =============================================
    -- Performance Indexes for Sub-Millisecond Queries
    -- =============================================
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_district ON users(district);
    CREATE INDEX IF NOT EXISTS idx_workers_user_id ON workers(user_id);
    CREATE INDEX IF NOT EXISTS idx_workers_society_id ON workers(society_id);
    CREATE INDEX IF NOT EXISTS idx_workers_cooperative_id ON workers(cooperative_id);
    CREATE INDEX IF NOT EXISTS idx_workers_status_avail ON workers(verification_status, availability);
    CREATE INDEX IF NOT EXISTS idx_workers_rating ON workers(rating DESC);
    CREATE INDEX IF NOT EXISTS idx_worker_skills_worker_id ON worker_skills(worker_id);
    CREATE INDEX IF NOT EXISTS idx_worker_skills_skill_id ON worker_skills(skill_id);
    CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
    CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
    CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
    CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_worker_id ON bookings(worker_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON bookings(scheduled_date);
    CREATE INDEX IF NOT EXISTS idx_reviews_worker_id ON reviews(worker_id);
    CREATE INDEX IF NOT EXISTS idx_societies_district ON societies(district);
    CREATE INDEX IF NOT EXISTS idx_societies_status ON societies(status);
    -- =============================================
    -- Saved Addresses (Customer Address Book)
    -- =============================================
    CREATE TABLE IF NOT EXISTS saved_addresses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      label TEXT NOT NULL DEFAULT 'Home',
      full_address TEXT NOT NULL,
      district TEXT,
      city TEXT,
      pincode TEXT,
      landmark TEXT,
      latitude REAL,
      longitude REAL,
      is_default INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_saved_addresses_user_id ON saved_addresses(user_id);
  `);

    console.log('✅ PostgreSQL migration complete — 7-Phase schema, tables, and dual work compliance ready.');
  })();

  return migrationPromise;
}

if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Migration finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { migrate };
