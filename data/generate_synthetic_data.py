"""
Synthetic Healthcare Data Generator
Author: Keya
Date: 2025-08-30

Generates realistic but anonymized healthcare data for testing and development.
All data is synthetic and HIPAA-compliant.
"""

import pandas as pd
import numpy as np
from faker import Faker
from datetime import datetime, timedelta
import json
import random
import uuid
import psycopg2
from sqlalchemy import create_engine
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HealthcareSyntheticDataGenerator:
    """Generate synthetic healthcare data for testing"""
    
    def __init__(self, seed: int = 42):
        """Initialize generator with random seed for reproducibility"""
        self.fake = Faker()
        Faker.seed(seed)
        np.random.seed(seed)
        random.seed(seed)
        
        # Medical data lists
        self.diagnosis_codes = [
            'I50.9', 'J44.1', 'N18.9', 'E11.9', 'I25.9', 'F32.9', 'M79.3',
            'K59.00', 'R06.02', 'Z51.11', 'I10', 'E78.5', 'F41.9', 'M25.50'
        ]
        
        self.diagnosis_descriptions = [
            'Heart failure, unspecified', 'Chronic obstructive pulmonary disease with acute exacerbation',
            'Chronic kidney disease, unspecified', 'Type 2 diabetes mellitus without complications',
            'Chronic ischemic heart disease', 'Major depressive disorder, single episode',
            'Fibromyalgia', 'Constipation, unspecified', 'Shortness of breath',
            'Encounter for antineoplastic chemotherapy', 'Essential hypertension',
            'Hyperlipidemia, unspecified', 'Anxiety disorder, unspecified', 'Joint pain, unspecified'
        ]
        
        self.procedure_codes = [
            '99213', '99214', '99232', '99233', '36415', '85025', '80053',
            '93000', '71020', '74177', '45378', '43239', '64483', '20610'
        ]
        
        self.medications = [
            'Lisinopril', 'Metformin', 'Atorvastatin', 'Amlodipine', 'Omeprazole',
            'Levothyroxine', 'Azithromycin', 'Amoxicillin', 'Hydrochlorothiazide',
            'Gabapentin', 'Sertraline', 'Ibuprofen', 'Acetaminophen', 'Aspirin'
        ]
        
        self.facilities = [
            ('FAC001', 'General Hospital', 'hospital', 'Mumbai', 'Maharashtra', 500),
            ('FAC002', 'Cardiac Care Center', 'specialty_hospital', 'Pune', 'Maharashtra', 150),
            ('FAC003', 'Community Clinic', 'clinic', 'Bangalore', 'Karnataka', 25),
            ('FAC004', 'Emergency Medical Center', 'emergency_hospital', 'Chennai', 'Tamil Nadu', 200),
            ('FAC005', 'Wellness Clinic', 'outpatient_clinic', 'Hyderabad', 'Telangana', 50)
        ]
        
        self.providers = [
            ('PROV001', 'Dr. Sharma', 'Cardiology', 'FAC002', 15),
            ('PROV002', 'Dr. Patel', 'Emergency Medicine', 'FAC001', 8),
            ('PROV003', 'Dr. Kumar', 'Internal Medicine', 'FAC001', 12),
            ('PROV004', 'Dr. Singh', 'Pulmonology', 'FAC001', 10),
            ('PROV005', 'Dr. Gupta', 'Endocrinology', 'FAC003', 18),
            ('PROV006', 'Dr. Reddy', 'Nephrology', 'FAC004', 14),
            ('PROV007', 'Dr. Joshi', 'Psychiatry', 'FAC005', 20)
        ]
    
    def generate_patients(self, num_patients: int = 1000) -> pd.DataFrame:
        """Generate synthetic patient data"""
        logger.info(f"Generating {num_patients} synthetic patients")
        
        patients = []
        for i in range(num_patients):
            patient = {
                'patient_id': f'PAT{str(i+1).zfill(6)}',
                'medical_record_number': f'MRN{str(i+1).zfill(6)}',
                'date_of_birth': self.fake.date_of_birth(minimum_age=18, maximum_age=95),
                'gender': random.choice(['M', 'F']),
                'race': random.choice(['Asian', 'White', 'Black', 'Hispanic', 'Other']),
                'ethnicity': random.choice(['Hispanic', 'Non-Hispanic']),
                'primary_language': random.choice(['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali']),
                'insurance_type': random.choice(['Private', 'Government', 'Self-Pay', 'Medicare']),
                'zip_code': self.fake.zipcode()
            }
            patients.append(patient)
        
        return pd.DataFrame(patients)
    
    def generate_encounters(self, patients_df: pd.DataFrame, encounters_per_patient: int = 3) -> pd.DataFrame:
        """Generate synthetic patient encounters"""
        logger.info(f"Generating encounters for {len(patients_df)} patients")
        
        encounters = []
        encounter_types = ['EM', 'IP', 'OP', 'OB', 'AMB']
        
        for _, patient in patients_df.iterrows():
            num_encounters = np.random.poisson(encounters_per_patient)
            
            for j in range(max(1, num_encounters)):  # At least 1 encounter per patient
                # Generate encounter date (within last 2 years)
                encounter_date = self.fake.date_time_between(
                    start_date='-2y', 
                    end_date='now'
                )
                
                # Select random facility and provider
                facility = random.choice(self.facilities)
                provider = random.choice(self.providers)
                
                # Generate length of stay based on encounter type
                encounter_type = random.choice(encounter_types)
                if encounter_type == 'IP':  # Inpatient
                    los_hours = np.random.gamma(2, 24)  # Average 2 days
                elif encounter_type == 'EM':  # Emergency
                    los_hours = np.random.exponential(4)  # Average 4 hours
                else:  # Outpatient
                    los_hours = np.random.uniform(0.5, 3)  # 30 min to 3 hours
                
                # Generate costs based on encounter type and LOS
                base_cost = {
                    'IP': 5000, 'EM': 1500, 'OP': 300, 'OB': 2000, 'AMB': 250
                }
                cost_multiplier = 1 + (los_hours / 24) * 0.5  # Cost increases with LOS
                total_cost = base_cost[encounter_type] * cost_multiplier * random.uniform(0.7, 1.8)
                
                # Select diagnoses and procedures
                primary_diagnosis = random.choice(self.diagnosis_codes)
                num_procedures = np.random.poisson(2) + 1
                procedure_codes = random.sample(self.procedure_codes, min(num_procedures, len(self.procedure_codes)))
                
                # Create raw data JSON
                raw_data = {
                    'diagnosis_codes': [primary_diagnosis] + random.sample(self.diagnosis_codes, random.randint(0, 2)),
                    'procedure_codes': procedure_codes,
                    'length_of_stay_hours': round(los_hours, 1),
                    'total_cost': round(total_cost, 2),
                    'vital_signs': {
                        'blood_pressure_systolic': random.randint(90, 180),
                        'blood_pressure_diastolic': random.randint(60, 120),
                        'heart_rate': random.randint(60, 120),
                        'temperature': round(random.uniform(96.5, 102.0), 1),
                        'oxygen_saturation': random.randint(92, 100)
                    },
                    'complications': random.choice([[], ['Infection'], ['Bleeding'], ['Drug Reaction']])
                }
                
                encounter = {
                    'encounter_id': f'ENC{str(len(encounters) + 1).zfill(8)}',
                    'patient_id': patient['patient_id'],
                    'encounter_date': encounter_date,
                    'encounter_type': encounter_type,
                    'facility_id': facility[0],
                    'provider_id': provider[0],
                    'admission_source': random.choice(['Emergency', 'Physician Referral', 'Transfer', 'Direct']),
                    'discharge_disposition': random.choice(['Home', 'Transfer', 'Skilled Nursing', 'Rehab']),
                    'raw_data': json.dumps(raw_data)
                }
                encounters.append(encounter)
        
        return pd.DataFrame(encounters)
    
    def generate_lab_results(self, encounters_df: pd.DataFrame) -> pd.DataFrame:
        """Generate synthetic laboratory results"""
        logger.info("Generating laboratory results")
        
        lab_tests = [
            ('CBC', 'Complete Blood Count', 'count', 4.5, 11.0),
            ('BMP', 'Basic Metabolic Panel', 'mg/dL', 70, 100),
            ('HbA1c', 'Hemoglobin A1C', '%', 4.0, 5.6),
            ('TSH', 'Thyroid Stimulating Hormone', 'mIU/L', 0.4, 4.0),
            ('CRP', 'C-Reactive Protein', 'mg/L', 0.0, 3.0),
            ('BUN', 'Blood Urea Nitrogen', 'mg/dL', 7, 20),
            ('Creatinine', 'Serum Creatinine', 'mg/dL', 0.6, 1.2)
        ]
        
        lab_results = []
        
        for _, encounter in encounters_df.iterrows():
            # Generate 1-5 lab tests per encounter
            num_tests = np.random.poisson(2) + 1
            
            for _ in range(num_tests):
                test = random.choice(lab_tests)
                
                # Generate realistic test values
                if random.random() < 0.8:  # 80% normal results
                    result_value = round(random.uniform(test[3], test[4]), 2)
                else:  # 20% abnormal results
                    if random.random() < 0.5:
                        result_value = round(random.uniform(test[3] * 0.5, test[3]), 2)  # Below normal
                    else:
                        result_value = round(random.uniform(test[4], test[4] * 1.5), 2)  # Above normal
                
                lab_result = {
                    'lab_result_id': f'LAB{str(len(lab_results) + 1).zfill(8)}',
                    'patient_id': encounter['patient_id'],
                    'encounter_id': encounter['encounter_id'],
                    'test_code': test[0],
                    'test_name': test[1],
                    'result_value': str(result_value),
                    'reference_range': f'{test[3]}-{test[4]} {test[2]}',
                    'result_date': encounter['encounter_date'] + timedelta(hours=random.randint(1, 24)),
                    'lab_facility': random.choice(['Central Lab', 'Point of Care', 'Reference Lab'])
                }
                lab_results.append(lab_result)
        
        return pd.DataFrame(lab_results)
    
    def generate_imaging_studies(self, encounters_df: pd.DataFrame) -> pd.DataFrame:
        """Generate synthetic imaging studies"""
        logger.info("Generating imaging studies")
        
        imaging_modalities = [
            ('CT', 'Computed Tomography'),
            ('MRI', 'Magnetic Resonance Imaging'),
            ('XR', 'X-Ray'),
            ('US', 'Ultrasound'),
            ('NM', 'Nuclear Medicine')
        ]
        
        study_descriptions = [
            'CT Chest without contrast',
            'MRI Brain with and without contrast',
            'Chest X-ray, 2 views',
            'Abdominal ultrasound',
            'Bone scan, whole body',
            'CT Abdomen and Pelvis with contrast',
            'MRI Lumbar spine without contrast'
        ]
        
        findings_templates = [
            'No acute abnormalities detected',
            'Mild degenerative changes noted',
            'Small pleural effusion identified',
            'Chronic changes consistent with patient age',
            'Follow-up recommended in 6 months',
            'Stable appearance compared to prior study',
            'Acute findings requiring immediate attention'
        ]
        
        imaging_studies = []
        
        # Generate imaging for ~40% of encounters
        imaging_encounters = encounters_df.sample(frac=0.4)
        
        for _, encounter in imaging_encounters.iterrows():
            modality = random.choice(imaging_modalities)
            
            imaging_study = {
                'study_id': f'IMG{str(len(imaging_studies) + 1).zfill(8)}',
                'patient_id': encounter['patient_id'],
                'encounter_id': encounter['encounter_id'],
                'modality': modality[0],
                'study_description': random.choice(study_descriptions),
                'study_date': encounter['encounter_date'] + timedelta(hours=random.randint(0, 48)),
                'radiologist_id': f'RAD{random.randint(1, 10):03d}',
                'findings': random.choice(findings_templates)
            }
            imaging_studies.append(imaging_study)
        
        return pd.DataFrame(imaging_studies)
    
    def generate_medications(self, encounters_df: pd.DataFrame) -> pd.DataFrame:
        """Generate synthetic medication data"""
        logger.info("Generating medication data")
        
        dosages = ['5mg', '10mg', '25mg', '50mg', '100mg', '250mg', '500mg']
        frequencies = ['Once daily', 'Twice daily', 'Three times daily', 'As needed', 'Every 8 hours']
        
        medications = []
        
        for _, encounter in encounters_df.iterrows():
            # Generate 1-4 medications per encounter
            num_meds = np.random.poisson(2) + 1
            
            for _ in range(num_meds):
                start_date = encounter['encounter_date'].date()
                duration_days = random.randint(7, 90)  # 1 week to 3 months
                
                medication = {
                    'medication_id': f'MED{str(len(medications) + 1).zfill(8)}',
                    'patient_id': encounter['patient_id'],
                    'encounter_id': encounter['encounter_id'],
                    'medication_name': random.choice(self.medications),
                    'dosage': random.choice(dosages),
                    'frequency': random.choice(frequencies),
                    'start_date': start_date,
                    'end_date': start_date + timedelta(days=duration_days),
                    'prescriber_id': encounter['provider_id']
                }
                medications.append(medication)
        
        return pd.DataFrame(medications)
    
    def save_to_database(self, engine, data_dict: Dict[str, pd.DataFrame]):
        """Save all generated data to database"""
        logger.info("Saving synthetic data to database")
        
        try:
            # Save to bronze layer
            for table_name, df in data_dict.items():
                df.to_sql(
                    table_name, 
                    engine, 
                    schema='bronze',
                    if_exists='replace',
                    index=False,
                    chunksize=1000
                )
                logger.info(f"Saved {len(df)} records to bronze.{table_name}")
            
            # Save reference data to silver layer
            facilities_df = pd.DataFrame(self.facilities, columns=[
                'facility_id', 'facility_name', 'facility_type', 'city', 'state', 'bed_count'
            ])
            facilities_df['quality_rating'] = np.random.uniform(3.5, 5.0, len(facilities_df)).round(1)
            facilities_df['address_line1'] = [self.fake.street_address() for _ in range(len(facilities_df))]
            facilities_df['zip_code'] = [self.fake.zipcode() for _ in range(len(facilities_df))]
            facilities_df['specialties'] = [
                json.dumps(random.sample(['Cardiology', 'Emergency', 'Surgery', 'ICU', 'Pediatrics'], 
                                       random.randint(2, 4)))
                for _ in range(len(facilities_df))
            ]
            
            providers_df = pd.DataFrame(self.providers, columns=[
                'provider_id', 'provider_name', 'specialty', 'facility_id', 'years_experience'
            ])
            providers_df['license_number'] = [f'LIC{random.randint(100000, 999999)}' for _ in range(len(providers_df))]
            providers_df['patient_volume_avg'] = np.random.poisson(50, len(providers_df))
            providers_df['quality_rating'] = np.random.uniform(3.8, 5.0, len(providers_df)).round(1)
            
            # Save reference data
            facilities_df.to_sql('facilities', engine, schema='silver', if_exists='replace', index=False)
            providers_df.to_sql('providers', engine, schema='silver', if_exists='replace', index=False)
            
            logger.info("Successfully saved all synthetic data")
            
        except Exception as e:
            logger.error(f"Error saving data to database: {str(e)}")
            raise
    
    def save_to_files(self, data_dict: Dict[str, pd.DataFrame], output_dir: str = 'data/synthetic/'):
        """Save generated data to CSV files"""
        logger.info(f"Saving synthetic data to {output_dir}")
        
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        for table_name, df in data_dict.items():
            file_path = f"{output_dir}{table_name}.csv"
            df.to_csv(file_path, index=False)
            logger.info(f"Saved {len(df)} records to {file_path}")
    
    def generate_complete_dataset(self, num_patients: int = 1000) -> Dict[str, pd.DataFrame]:
        """Generate complete synthetic healthcare dataset"""
        logger.info(f"Generating complete synthetic dataset for {num_patients} patients")
        
        # Generate core data
        patients_df = self.generate_patients(num_patients)
        encounters_df = self.generate_encounters(patients_df, encounters_per_patient=3)
        lab_results_df = self.generate_lab_results(encounters_df)
        imaging_studies_df = self.generate_imaging_studies(encounters_df)
        medications_df = self.generate_medications(encounters_df)
        
        # Add patients to encounters for reference
        patients_df.to_sql('patients', schema='silver', con=None, if_exists='replace', index=False)
        
        data_dict = {
            'patient_encounters': encounters_df,
            'lab_results': lab_results_df,
            'imaging_studies': imaging_studies_df,
            'medications': medications_df
        }
        
        # Print summary statistics
        print("\n" + "="*50)
        print("SYNTHETIC DATA GENERATION SUMMARY")
        print("="*50)
        for table_name, df in data_dict.items():
            print(f"{table_name}: {len(df):,} records")
        print(f"Total patients: {len(patients_df):,}")
        print(f"Date range: {encounters_df['encounter_date'].min()} to {encounters_df['encounter_date'].max()}")
        print("="*50)
        
        return data_dict

def main():
    """Main execution function"""
    # Database connection
    try:
        engine = create_engine('postgresql://postgres:password@localhost:5432/healthcare_analytics')
        
        # Initialize generator
        generator = HealthcareSyntheticDataGenerator(seed=42)
        
        # Generate complete dataset
        data_dict = generator.generate_complete_dataset(num_patients=1000)
        
        # Save to database
        generator.save_to_database(engine, data_dict)
        
        # Save to files for backup
        generator.save_to_files(data_dict)
        
        print("\n✅ Synthetic data generation completed successfully!")
        print("📁 Data saved to database and CSV files in data/synthetic/")
        print("🔄 Ready to run ETL pipeline with: python src/processing/patient_journey_etl.py")
        
    except Exception as e:
        logger.error(f"Failed to generate synthetic data: {str(e)}")
        print(f"\n❌ Error: {str(e)}")
        print("💡 Make sure PostgreSQL is running and database is created")

if __name__ == "__main__":
    main()
