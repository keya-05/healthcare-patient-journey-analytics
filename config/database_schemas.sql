-- Healthcare Patient Journey Analytics Database Schema
-- Author: Keya
-- Date: 2025-08-30

-- Create database
CREATE DATABASE healthcare_analytics;
\c healthcare_analytics;

-- Create schemas for data layers
CREATE SCHEMA bronze;    -- Raw data
CREATE SCHEMA silver;    -- Cleaned data  
CREATE SCHEMA gold;      -- Analytics-ready data

-- =============================================================================
-- BRONZE LAYER: Raw Data Tables
-- =============================================================================

-- Raw patient encounters from EHR
CREATE TABLE bronze.patient_encounters (
    encounter_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    encounter_date TIMESTAMP NOT NULL,
    encounter_type VARCHAR(100),
    facility_id VARCHAR(50),
    provider_id VARCHAR(50),
    admission_source VARCHAR(50),
    discharge_disposition VARCHAR(50),
    raw_data JSONB,
    ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_system VARCHAR(50) DEFAULT 'EHR'
);

-- Raw laboratory results
CREATE TABLE bronze.lab_results (
    lab_result_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    encounter_id VARCHAR(50),
    test_code VARCHAR(20),
    test_name VARCHAR(200),
    result_value VARCHAR(100),
    reference_range VARCHAR(100),
    result_date TIMESTAMP,
    lab_facility VARCHAR(100),
    raw_data JSONB,
    ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Raw imaging studies
CREATE TABLE bronze.imaging_studies (
    study_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    encounter_id VARCHAR(50),
    modality VARCHAR(20),
    study_description VARCHAR(500),
    study_date TIMESTAMP,
    radiologist_id VARCHAR(50),
    findings TEXT,
    raw_data JSONB,
    ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Raw medication data
CREATE TABLE bronze.medications (
    medication_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    encounter_id VARCHAR(50),
    medication_name VARCHAR(200),
    dosage VARCHAR(100),
    frequency VARCHAR(50),
    start_date DATE,
    end_date DATE,
    prescriber_id VARCHAR(50),
    raw_data JSONB,
    ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- SILVER LAYER: Cleaned and Validated Data
-- =============================================================================

-- Master patient index
CREATE TABLE silver.patients (
    patient_id VARCHAR(50) PRIMARY KEY,
    medical_record_number VARCHAR(50) UNIQUE,
    date_of_birth DATE,
    gender CHAR(1) CHECK (gender IN ('M', 'F', 'O')),
    race VARCHAR(50),
    ethnicity VARCHAR(50),
    primary_language VARCHAR(50),
    insurance_type VARCHAR(50),
    zip_code VARCHAR(10),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Standardized encounters
CREATE TABLE silver.patient_journey (
    journey_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES silver.patients(patient_id),
    encounter_id VARCHAR(50) NOT NULL,
    event_sequence INTEGER,
    event_type VARCHAR(50) NOT NULL,
    event_datetime TIMESTAMP NOT NULL,
    facility_name VARCHAR(100),
    facility_type VARCHAR(50),
    provider_name VARCHAR(100),
    provider_specialty VARCHAR(100),
    primary_diagnosis_code VARCHAR(20),
    diagnosis_description TEXT,
    procedure_codes TEXT[], -- Array of CPT codes
    length_of_stay_hours INTEGER,
    treatment_outcome VARCHAR(50),
    cost_amount DECIMAL(10,2),
    quality_score DECIMAL(3,2),
    data_quality_flags JSONB,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Standardized clinical measurements
CREATE TABLE silver.clinical_measurements (
    measurement_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES silver.patients(patient_id),
    encounter_id VARCHAR(50),
    measurement_type VARCHAR(50), -- 'vital_sign', 'lab_result', 'assessment'
    measurement_name VARCHAR(100),
    measurement_value DECIMAL(10,3),
    measurement_unit VARCHAR(20),
    reference_min DECIMAL(10,3),
    reference_max DECIMAL(10,3),
    is_abnormal BOOLEAN,
    measured_datetime TIMESTAMP,
    provider_id VARCHAR(50),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Provider information
CREATE TABLE silver.providers (
    provider_id VARCHAR(50) PRIMARY KEY,
    provider_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    facility_id VARCHAR(50),
    license_number VARCHAR(50),
    years_experience INTEGER,
    patient_volume_avg INTEGER,
    quality_rating DECIMAL(3,2),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facility information
CREATE TABLE silver.facilities (
    facility_id VARCHAR(50) PRIMARY KEY,
    facility_name VARCHAR(100) NOT NULL,
    facility_type VARCHAR(50), -- 'hospital', 'clinic', 'urgent_care'
    address_line1 VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    bed_count INTEGER,
    specialties TEXT[],
    quality_rating DECIMAL(3,2),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- GOLD LAYER: Analytics-Ready Data
-- =============================================================================

-- Patient journey summary metrics
CREATE TABLE gold.patient_metrics (
    patient_id VARCHAR(50) PRIMARY KEY REFERENCES silver.patients(patient_id),
    total_encounters INTEGER DEFAULT 0,
    first_encounter_date DATE,
    last_encounter_date DATE,
    avg_length_of_stay DECIMAL(5,2),
    total_cost DECIMAL(12,2),
    primary_conditions TEXT[],
    readmission_30_day BOOLEAN DEFAULT FALSE,
    readmission_90_day BOOLEAN DEFAULT FALSE,
    mortality_risk_score DECIMAL(5,2),
    chronic_conditions_count INTEGER DEFAULT 0,
    quality_indicators JSONB,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Provider performance metrics
CREATE TABLE gold.provider_performance (
    provider_id VARCHAR(50) PRIMARY KEY REFERENCES silver.providers(provider_id),
    reporting_month DATE,
    patient_volume INTEGER,
    avg_length_of_stay DECIMAL(5,2),
    readmission_rate DECIMAL(5,4),
    patient_satisfaction_avg DECIMAL(3,2),
    cost_efficiency_score DECIMAL(5,2),
    quality_measures JSONB,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facility utilization metrics
CREATE TABLE gold.facility_utilization (
    facility_id VARCHAR(50) REFERENCES silver.facilities(facility_id),
    reporting_date DATE,
    bed_occupancy_rate DECIMAL(5,4),
    avg_daily_census INTEGER,
    emergency_department_volume INTEGER,
    surgery_volume INTEGER,
    revenue_per_day DECIMAL(12,2),
    staff_productivity_score DECIMAL(5,2),
    PRIMARY KEY (facility_id, reporting_date)
);

-- Clinical pathway analysis
CREATE TABLE gold.clinical_pathways (
    pathway_id VARCHAR(50) PRIMARY KEY,
    diagnosis_group VARCHAR(100),
    pathway_sequence INTEGER,
    event_type VARCHAR(50),
    typical_duration_hours INTEGER,
    cost_estimate DECIMAL(10,2),
    success_rate DECIMAL(5,4),
    complications_rate DECIMAL(5,4),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- VIEWS FOR ANALYTICS
-- =============================================================================

-- Patient journey timeline view
CREATE VIEW analytics.patient_journey_timeline AS
SELECT 
    pj.patient_id,
    p.medical_record_number,
    pj.event_datetime,
    pj.event_type,
    pj.facility_name,
    pj.provider_name,
    pj.diagnosis_description,
    pj.length_of_stay_hours,
    pj.cost_amount,
    ROW_NUMBER() OVER (PARTITION BY pj.patient_id ORDER BY pj.event_datetime) as sequence_number
FROM silver.patient_journey pj
JOIN silver.patients p ON pj.patient_id = p.patient_id
ORDER BY pj.patient_id, pj.event_datetime;

-- Readmission analysis view
CREATE VIEW analytics.readmission_analysis AS
SELECT 
    p.patient_id,
    p.medical_record_number,
    current_encounter.event_datetime as discharge_date,
    next_encounter.event_datetime as readmission_date,
    EXTRACT(DAYS FROM (next_encounter.event_datetime - current_encounter.event_datetime)) as days_to_readmission,
    current_encounter.diagnosis_description as original_diagnosis,
    next_encounter.diagnosis_description as readmission_diagnosis,
    CASE 
        WHEN EXTRACT(DAYS FROM (next_encounter.event_datetime - current_encounter.event_datetime)) <= 30 
        THEN TRUE ELSE FALSE 
    END as is_30_day_readmission
FROM silver.patients p
JOIN silver.patient_journey current_encounter ON p.patient_id = current_encounter.patient_id
JOIN silver.patient_journey next_encounter ON p.patient_id = next_encounter.patient_id
WHERE current_encounter.event_type = 'Discharge'
    AND next_encounter.event_type = 'Admission'
    AND next_encounter.event_datetime > current_encounter.event_datetime
    AND next_encounter.event_sequence = current_encounter.event_sequence + 1;

-- Provider workload view
CREATE VIEW analytics.provider_workload AS
SELECT 
    pr.provider_id,
    pr.provider_name,
    pr.specialty,
    COUNT(DISTINCT pj.patient_id) as unique_patients,
    COUNT(pj.journey_id) as total_encounters,
    AVG(pj.length_of_stay_hours) as avg_los_hours,
    SUM(pj.cost_amount) as total_revenue,
    AVG(pj.quality_score) as avg_quality_score
FROM silver.providers pr
LEFT JOIN silver.patient_journey pj ON pr.provider_name = pj.provider_name
WHERE pj.event_datetime >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY pr.provider_id, pr.provider_name, pr.specialty;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Bronze layer indexes
CREATE INDEX idx_bronze_encounters_patient_date ON bronze.patient_encounters(patient_id, encounter_date);
CREATE INDEX idx_bronze_encounters_facility ON bronze.patient_encounters(facility_id);
CREATE INDEX idx_bronze_lab_patient_date ON bronze.lab_results(patient_id, result_date);
CREATE INDEX idx_bronze_imaging_patient_date ON bronze.imaging_studies(patient_id, study_date);

-- Silver layer indexes
CREATE INDEX idx_silver_journey_patient_date ON silver.patient_journey(patient_id, event_datetime);
CREATE INDEX idx_silver_journey_facility ON silver.patient_journey(facility_name);
CREATE INDEX idx_silver_journey_provider ON silver.patient_journey(provider_name);
CREATE INDEX idx_silver_measurements_patient_type ON silver.clinical_measurements(patient_id, measurement_type);
CREATE INDEX idx_silver_patients_mrn ON silver.patients(medical_record_number);

-- Gold layer indexes
CREATE INDEX idx_gold_metrics_patient ON gold.patient_metrics(patient_id);
CREATE INDEX idx_gold_provider_month ON gold.provider_performance(provider_id, reporting_month);
CREATE INDEX idx_gold_facility_date ON gold.facility_utilization(facility_id, reporting_date);

-- =============================================================================
-- FUNCTIONS FOR DATA QUALITY
-- =============================================================================

-- Function to calculate patient age
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEARS FROM AGE(CURRENT_DATE, birth_date));
END;
$$ LANGUAGE plpgsql;

-- Function to validate diagnosis codes
CREATE OR REPLACE FUNCTION is_valid_icd10(code VARCHAR(20))
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic ICD-10 format validation (simplified)
    RETURN code ~ '^[A-Z][0-9]{2}(\.[0-9A-Z]{1,4})?$';
END;
$$ LANGUAGE plpgsql;

-- Function to calculate quality score
CREATE OR REPLACE FUNCTION calculate_quality_score(
    length_of_stay_hours INTEGER,
    readmission_flag BOOLEAN,
    complications_count INTEGER
)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    base_score DECIMAL(3,2) := 10.0;
    penalty DECIMAL(3,2) := 0.0;
BEGIN
    -- Penalize extended stays
    IF length_of_stay_hours > 168 THEN -- > 7 days
        penalty := penalty + 1.0;
    END IF;
    
    -- Penalize readmissions
    IF readmission_flag THEN
        penalty := penalty + 2.0;
    END IF;
    
    -- Penalize complications
    penalty := penalty + (complications_count * 0.5);
    
    RETURN GREATEST(0.0, base_score - penalty);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SAMPLE DATA INSERTION (for testing)
-- =============================================================================

-- Insert sample facilities
INSERT INTO silver.facilities (facility_id, facility_name, facility_type, city, state, bed_count, quality_rating) VALUES
('FAC001', 'General Hospital', 'hospital', 'Mumbai', 'Maharashtra', 500, 4.2),
('FAC002', 'Cardiac Care Center', 'specialty_hospital', 'Pune', 'Maharashtra', 150, 4.7),
('FAC003', 'Community Clinic', 'clinic', 'Bangalore', 'Karnataka', 25, 4.0);

-- Insert sample providers
INSERT INTO silver.providers (provider_id, provider_name, specialty, facility_id, years_experience, quality_rating) VALUES
('PROV001', 'Dr. Sharma', 'Cardiology', 'FAC002', 15, 4.8),
('PROV002', 'Dr. Patel', 'Emergency Medicine', 'FAC001', 8, 4.3),
('PROV003', 'Dr. Kumar', 'Internal Medicine', 'FAC001', 12, 4.5);

-- Insert sample patients (de-identified)
INSERT INTO silver.patients (patient_id, medical_record_number, date_of_birth, gender, race, insurance_type, zip_code) VALUES
('PAT001', 'MRN001234', '1975-03-15', 'M', 'Asian', 'Private', '411001'),
('PAT002', 'MRN001235', '1982-07-22', 'F', 'Asian', 'Government', '400001'),
('PAT003', 'MRN001236', '1990-11-08', 'M', 'Asian', 'Private', '560001');

-- =============================================================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- =============================================================================

-- Daily census materialized view
CREATE MATERIALIZED VIEW analytics.daily_census AS
SELECT 
    DATE(event_datetime) as census_date,
    facility_name,
    COUNT(DISTINCT CASE WHEN event_type = 'Admission' THEN patient_id END) as admissions,
    COUNT(DISTINCT CASE WHEN event_type = 'Discharge' THEN patient_id END) as discharges,
    AVG(length_of_stay_hours) as avg_los_hours
FROM silver.patient_journey 
WHERE event_datetime >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(event_datetime), facility_name;

-- Monthly quality metrics
CREATE MATERIALIZED VIEW analytics.monthly_quality_metrics AS
SELECT 
    DATE_TRUNC('month', event_datetime) as reporting_month,
    facility_name,
    COUNT(DISTINCT patient_id) as total_patients,
    AVG(quality_score) as avg_quality_score,
    COUNT(CASE WHEN quality_score < 7.0 THEN 1 END) as poor_quality_count,
    AVG(cost_amount) as avg_cost_per_encounter
FROM silver.patient_journey 
GROUP BY DATE_TRUNC('month', event_datetime), facility_name;

-- Create refresh schedule for materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW analytics.daily_census;
    REFRESH MATERIALIZED VIEW analytics.monthly_quality_metrics;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Create roles
CREATE ROLE data_engineer;
CREATE ROLE data_analyst;
CREATE ROLE business_user;

-- Grant permissions to data engineers (full access)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA bronze TO data_engineer;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA silver TO data_engineer;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA gold TO data_engineer;

-- Grant read/write to analysts
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA silver TO data_analyst;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA gold TO data_analyst;

-- Grant read-only to business users
GRANT SELECT ON ALL TABLES IN SCHEMA gold TO business_user;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO business_user;

-- =============================================================================
-- TRIGGERS FOR AUDIT LOGGING
-- =============================================================================

-- Audit log table
CREATE TABLE audit.data_changes (
    audit_id SERIAL PRIMARY KEY,
    table_name VARCHAR(100),
    operation VARCHAR(10),
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit.data_changes (table_name, operation, new_values, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(NEW), USER);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.data_changes (table_name, operation, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(OLD), to_jsonb(NEW), USER);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit.data_changes (table_name, operation, old_values, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(OLD), USER);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER patient_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON silver.patients
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER journey_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON silver.patient_journey
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
