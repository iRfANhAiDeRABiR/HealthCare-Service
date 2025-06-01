-- Create ambulance database tables
USE healthcare_service;

-- Create ambulance_services table
CREATE TABLE IF NOT EXISTS ambulance_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone_primary VARCHAR(20) NOT NULL,
    phone_secondary VARCHAR(20),
    email VARCHAR(100),
    address TEXT NOT NULL,
    division VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    area VARCHAR(100),
    service_type ENUM('basic', 'advanced', 'icu', 'neonatal', 'cardiac') NOT NULL,
    availability ENUM('24/7', 'day_only', 'emergency_only') DEFAULT '24/7',
    price_per_km DECIMAL(8,2),
    base_charge DECIMAL(8,2),
    equipment TEXT,
    description TEXT,
    website VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create ambulance_reviews table
CREATE TABLE IF NOT EXISTS ambulance_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ambulance_id INT NOT NULL,
    reviewer_name VARCHAR(100) NOT NULL,
    reviewer_phone VARCHAR(20),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    service_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ambulance_id) REFERENCES ambulance_services(id) ON DELETE CASCADE
);

-- Insert sample ambulance services data
INSERT INTO ambulance_services (
    service_name, contact_person, phone_primary, phone_secondary, email, 
    address, division, district, area, service_type, availability, 
    price_per_km, base_charge, equipment, description, website, verified
) VALUES 
-- Dhaka Division
('Dhaka Medical College Ambulance', 'Dr. Rahman', '01712345678', '02-9661064', 'ambulance@dmch.gov.bd', 
 'Dhaka Medical College Hospital, Ramna, Dhaka-1000', 'Dhaka', 'Dhaka', 'Ramna', 'advanced', '24/7', 
 15.00, 500.00, 'Oxygen cylinder, ECG machine, Defibrillator, Ventilator, Emergency medicines', 
 'Government hospital ambulance service with advanced life support equipment', 'https://dmch.gov.bd', TRUE),

('Square Hospital Ambulance', 'Nurse Fatima', '01713456789', '02-8159457', 'emergency@squarehospital.com', 
 '18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka-1205', 'Dhaka', 'Dhaka', 'Panthapath', 'icu', '24/7', 
 25.00, 800.00, 'ICU setup, Ventilator, Cardiac monitor, Infusion pump, Emergency drugs', 
 'Premium private hospital ambulance with ICU facilities', 'https://squarehospital.com', TRUE),

('United Hospital Ambulance', 'Mr. Karim', '01714567890', '02-8836000', 'ambulance@uhlbd.com', 
 'Plot 15, Road 71, Gulshan-2, Dhaka-1212', 'Dhaka', 'Dhaka', 'Gulshan', 'advanced', '24/7', 
 30.00, 1000.00, 'Advanced life support, Ventilator, Defibrillator, Cardiac monitor', 
 'International standard ambulance service', 'https://uhlbd.com', TRUE),

('Apollo Hospital Ambulance', 'Sister Rashida', '01715678901', '02-8401661', 'emergency@apollodhaka.com', 
 'Plot 81, Block E, Bashundhara R/A, Dhaka-1229', 'Dhaka', 'Dhaka', 'Bashundhara', 'icu', '24/7', 
 28.00, 900.00, 'Mobile ICU, Ventilator, Defibrillator, Emergency medicines, Trained paramedics', 
 'Apollo Hospitals ambulance with mobile ICU facility', 'https://apollodhaka.com', TRUE),

('Quantum Ambulance Service', 'Mr. Hasan', '01716789012', '01716789013', 'info@quantumambulance.com', 
 'Quantum Foundation, Dhanmondi, Dhaka', 'Dhaka', 'Dhaka', 'Dhanmondi', 'basic', '24/7', 
 12.00, 300.00, 'Basic life support, Oxygen, First aid kit, Stretcher', 
 'Affordable ambulance service by Quantum Foundation', 'https://quantumfoundation.org', TRUE),

-- Chittagong Division
('Chittagong Medical College Ambulance', 'Dr. Ahmed', '01817123456', '031-2502000', 'cmch@ambulance.gov.bd', 
 'Chittagong Medical College Hospital, Panchlaish, Chittagong', 'Chittagong', 'Chittagong', 'Panchlaish', 'advanced', '24/7', 
 18.00, 600.00, 'Advanced life support, Oxygen, ECG, Emergency medicines', 
 'Government medical college hospital ambulance', NULL, TRUE),

('Imperial Hospital Ambulance', 'Mr. Rahim', '01818234567', '031-2851234', 'emergency@imperialhospital.com', 
 'Nasirabad, Chittagong', 'Chittagong', 'Chittagong', 'Nasirabad', 'icu', '24/7', 
 22.00, 700.00, 'ICU equipment, Ventilator, Cardiac monitor, Emergency drugs', 
 'Private hospital with advanced ambulance service', NULL, TRUE),

-- Rajshahi Division
('Rajshahi Medical College Ambulance', 'Dr. Begum', '01721345678', '0721-772101', 'rmch@ambulance.gov.bd', 
 'Rajshahi Medical College Hospital, Laxmipur, Rajshahi', 'Rajshahi', 'Rajshahi', 'Laxmipur', 'advanced', '24/7', 
 15.00, 450.00, 'Advanced life support, Oxygen, ECG, Defibrillator', 
 'Government medical college ambulance service', NULL, TRUE),

-- Khulna Division
('Khulna Medical College Ambulance', 'Dr. Islam', '01741234567', '041-760300', 'kmch@ambulance.gov.bd', 
 'Khulna Medical College Hospital, Khulna', 'Khulna', 'Khulna', 'Medical College Area', 'advanced', '24/7', 
 16.00, 500.00, 'Advanced life support, Oxygen, Emergency medicines', 
 'Government hospital ambulance with trained staff', NULL, TRUE),

-- Sylhet Division
('Sylhet MAG Osmani Medical College Ambulance', 'Dr. Chowdhury', '01821345678', '0821-713061', 'somch@ambulance.gov.bd', 
 'Sylhet MAG Osmani Medical College Hospital, Sylhet', 'Sylhet', 'Sylhet', 'Medical College', 'advanced', '24/7', 
 17.00, 550.00, 'Advanced life support, Oxygen, ECG, Emergency kit', 
 'Government medical college hospital ambulance', NULL, TRUE),

-- Barisal Division
('Sher-E-Bangla Medical College Ambulance', 'Dr. Khan', '01431234567', '0431-63340', 'sbmch@ambulance.gov.bd', 
 'Sher-E-Bangla Medical College Hospital, Barisal', 'Barisal', 'Barisal', 'Medical College', 'advanced', '24/7', 
 14.00, 400.00, 'Advanced life support, Oxygen, Emergency medicines', 
 'Government hospital ambulance service', NULL, TRUE),

-- Rangpur Division
('Rangpur Medical College Ambulance', 'Dr. Roy', '01521234567', '0521-62324', 'rmch@ambulance.gov.bd', 
 'Rangpur Medical College Hospital, Rangpur', 'Rangpur', 'Rangpur', 'Medical College', 'advanced', '24/7', 
 13.00, 350.00, 'Advanced life support, Oxygen, ECG', 
 'Government medical college ambulance', NULL, TRUE),

-- Mymensingh Division
('Mymensingh Medical College Ambulance', 'Dr. Haque', '01921234567', '091-66075', 'mmch@ambulance.gov.bd', 
 'Mymensingh Medical College Hospital, Mymensingh', 'Mymensingh', 'Mymensingh', 'Medical College', 'advanced', '24/7', 
 14.00, 400.00, 'Advanced life support, Oxygen, Emergency medicines', 
 'Government hospital with 24/7 ambulance service', NULL, TRUE),

-- Private Services
('Green Life Medical Ambulance', 'Mr. Salam', '01611234567', '01611234568', 'ambulance@greenlifebd.com', 
 'Green Life Medical College Hospital, Dhaka', 'Dhaka', 'Dhaka', 'Green Road', 'icu', '24/7', 
 26.00, 850.00, 'Mobile ICU, Ventilator, Cardiac monitor, Emergency drugs', 
 'Private medical college with advanced ambulance', 'https://greenlifebd.com', TRUE),

('Popular Diagnostic Ambulance', 'Ms. Nasreen', '01711234567', '02-8836000', 'emergency@populardiagnostic.com', 
 'Popular Diagnostic Centre, Dhanmondi, Dhaka', 'Dhaka', 'Dhaka', 'Dhanmondi', 'basic', '24/7', 
 20.00, 600.00, 'Basic life support, Oxygen, First aid, Stretcher', 
 'Diagnostic center ambulance service', 'https://populardiagnostic.com', TRUE),

('Ibn Sina Ambulance Service', 'Dr. Mahmud', '01811234567', '02-8836000', 'ambulance@ibnsinahospital.com', 
 'Ibn Sina Hospital, Dhanmondi, Dhaka', 'Dhaka', 'Dhaka', 'Dhanmondi', 'advanced', '24/7', 
 24.00, 750.00, 'Advanced life support, Oxygen, ECG, Emergency medicines', 
 'Private hospital ambulance with trained paramedics', 'https://ibnsinahospital.com', TRUE);

-- Insert sample reviews
INSERT INTO ambulance_reviews (ambulance_id, reviewer_name, reviewer_phone, rating, review_text, service_date) VALUES
(1, 'Mohammad Ali', '01712345678', 5, 'Excellent service, very quick response time. Professional staff.', '2024-12-15'),
(1, 'Fatima Begum', '01812345678', 4, 'Good service but could be faster during rush hours.', '2024-12-10'),
(2, 'Karim Ahmed', '01912345678', 5, 'Outstanding ICU ambulance service. Saved my fathers life.', '2024-12-08'),
(3, 'Rashida Khan', '01612345678', 4, 'Professional service but expensive. Worth it for emergency.', '2024-12-05'),
(4, 'Hasan Rahman', '01512345678', 5, 'Apollo ambulance is the best. Quick and well-equipped.', '2024-12-01'),
(5, 'Nasir Uddin', '01412345678', 4, 'Affordable and reliable. Good for basic emergencies.', '2024-11-28');

-- Update ratings based on reviews
UPDATE ambulance_services a 
SET rating = (
    SELECT AVG(rating) 
    FROM ambulance_reviews r 
    WHERE r.ambulance_id = a.id
),
total_reviews = (
    SELECT COUNT(*) 
    FROM ambulance_reviews r 
    WHERE r.ambulance_id = a.id
)
WHERE id IN (SELECT DISTINCT ambulance_id FROM ambulance_reviews);