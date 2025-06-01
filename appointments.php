<?php
// DB connection
$host = "localhost";
$user = "root";
$password = "";
$database = "healthcare_service";

$conn = new mysqli($host, $user, $password, $database);
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$success = false;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $fullName = $_POST["fullName"];
  $email = $_POST["email"];
  $phone = $_POST["phone"];
  $department = $_POST["department"];
  $doctor = $_POST["doctor"];
  $date = $_POST["date"];
  $time = $_POST["time"];

  $stmt = $conn->prepare("INSERT INTO appointments (full_name, email, phone, department, doctor, appointment_date, appointment_time) VALUES (?, ?, ?, ?, ?, ?, ?)");
  $stmt->bind_param("sssssss", $fullName, $email, $phone, $department, $doctor, $date, $time);
  $stmt->execute();
  $stmt->close();

  $success = true;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Appointments - HealthCare Service</title>
  <link rel="stylesheet" href="styles.css" />
  <link rel="icon" href="data:," />
  <style>
    .appointment-layout {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    @media (min-width: 1024px) {
      .appointment-layout {
        flex-direction: row;
        gap: 2rem;
        align-items: flex-start;
      }
      .appointment-form-section {
        flex: 2;
      }
      .hospital-doctor-info {
        flex: 1;
        background-color: #f9fafb;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    }
    .hospital-doctor-info h3 {
      margin-bottom: 1rem;
    }
    .info-item {
      margin-bottom: 1rem;
    }
    .info-item h4 {
      margin-bottom: 0.25rem;
    }
    .info-item p {
      font-size: 0.875rem;
      color: #4b5563;
    }
    .search-input {
      margin-bottom: 1rem;
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 0.25rem;
    }
    .modal-content {
      background-color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .success-message {
      background-color: #d1fae5;
      border: 1px solid #10b981;
      padding: 1rem;
      border-radius: 0.5rem;
      color: #065f46;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <header class="header">
      <div class="container header-content">
        <div class="logo-container">
          <h1 class="app-title">Appointments</h1>
        </div>
        <a href="index.html" class="button button-primary">← Back to Home</a>
      </div>
    </header>

    <main class="main-content" style="padding: 2rem 1rem;">
      <h2 class="section-title">Book a Hospital Appointment</h2>
      <div class="appointment-layout">
        <div class="appointment-form-section">
          <?php if ($success): ?>
            <div class="success-message">
              ✅ Your appointment has been booked! We will contact you shortly.
            </div>
          <?php else: ?>
            <form method="POST" class="modal-content">
              <div class="form-group">
                <label for="fullName">Full Name</label>
                <input type="text" id="fullName" name="fullName" required class="form-input" placeholder="Your name" />
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required class="form-input" placeholder="you@example.com" />
              </div>

              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" required class="form-input" placeholder="Your phone number" />
              </div>

              <div class="form-group">
                <label for="department">Select Department</label>
                <select id="department" name="department" required class="form-input">
                  <option value="">Choose a department</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="neurology">Neurology</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="general">General Medicine</option>
                </select>
              </div>

              <div class="form-group">
                <label for="doctor">Preferred Doctor (Optional)</label>
                <input type="text" id="doctor" name="doctor" class="form-input" placeholder="Doctor's name" />
              </div>

              <div class="form-group">
                <label for="date">Appointment Date</label>
                <input type="date" id="date" name="date" required class="form-input" min="2025-01-01" />
              </div>

              <div class="form-group">
                <label for="time">Appointment Time</label>
                <input type="time" id="time" name="time" required class="form-input" />
              </div>

              <div class="form-actions">
                <button type="submit" class="button button-primary button-full">Book Appointment</button>
              </div>
            </form>
          <?php endif; ?>
        </div>

        <div class="hospital-doctor-info">
          <h3>Popular Hospitals & Doctors</h3>
          <input type="text" class="search-input" id="doctorSearch" placeholder="Search by doctor, hospital or department..." oninput="filterDoctors()" />
          <div class="info-item" data-filter="City General Hospital Cardiology Neurology Pediatrics Sarah Ahmed Faisal Rahman">
            <h4>City General Hospital</h4>
            <p>Cardiology, Neurology, Pediatrics</p>
            <p>Dr. Sarah Ahmed (Cardiologist), Dr. Faisal Rahman (Neurologist)</p>
          </div>
          <div class="info-item" data-filter="Sunrise Medical Center Orthopedics Dermatology Nabila Chowdhury Reza Karim">
            <h4>Sunrise Medical Center</h4>
            <p>Orthopedics, Dermatology</p>
            <p>Dr. Nabila Chowdhury (Dermatologist), Dr. Reza Karim (Orthopedic)</p>
          </div>
          <div class="info-item" data-filter="Unity Hospital General Medicine Emergency Services Tanvir Hossain">
            <h4>Unity Hospital</h4>
            <p>General Medicine, Emergency Services</p>
            <p>Dr. Tanvir Hossain (General Physician), 24/7 ER available</p>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script>
    function filterDoctors() {
      const query = document.getElementById("doctorSearch").value.toLowerCase();
      const items = document.querySelectorAll(".info-item");
      items.forEach((item) => {
        const text = item.getAttribute("data-filter").toLowerCase();
        item.style.display = text.includes(query) ? "block" : "none";
      });
    }
  </script>
</body>
</html>
