// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    // Initialize the app
    initApp()
  } catch (error) {
    console.error("Error initializing app:", error)
    // Fallback to show something if initialization fails
    const appContainer = document.getElementById("app")
    if (appContainer) {
      appContainer.innerHTML = `
        <div style="padding: 2rem; text-align: center;">
          <h2>Error Loading Application</h2>
          <p>There was a problem loading the application. Please refresh the page or try again later.</p>
          <p>Error details: ${error.message}</p>
        </div>
      `
    }
  }
})

// Fallback initialization if DOMContentLoaded doesn't fire for some reason
window.onload = () => {
  const appContainer = document.getElementById("app")
  if (appContainer && appContainer.innerHTML.includes("Loading HealthCare Service")) {
    console.log("Using fallback initialization")
    try {
      initApp()
    } catch (error) {
      console.error("Error in fallback initialization:", error)
      appContainer.innerHTML = `
        <div style="padding: 2rem; text-align: center;">
          <h2>Error Loading Application</h2>
          <p>There was a problem loading the application. Please refresh the page or try again later.</p>
          <p>Error details: ${error.message}</p>
        </div>
      `
    }
  }
}

// Main app initialization
function initApp() {
  console.log("Initializing app...")

  // Initialize Lucide icons (using the global lucide variable from the CDN)
  if (window.lucide) {
    try {
      window.lucide.createIcons()
    } catch (error) {
      console.error("Error initializing Lucide icons:", error)
    }
  } else {
    console.warn("Lucide library not loaded, icons may not display correctly")
  }

  // Get the app container
  const appContainer = document.getElementById("app")
  if (!appContainer) {
    console.error("App container not found")
    return
  }

  // Set initial state
  let activeTab = "hospitals"
  let userLocation = null
  let mapInstance = null
  let hospitalMarkers = []

  // Render the initial UI
  renderApp()

  // Function to render the entire app
  function renderApp() {
    console.log("Rendering app...")

    // Create the app structure
    appContainer.innerHTML = `
      <div class="app-container">
        <!-- Header -->
        <header class="header">
          <div class="container header-content">
            <div class="logo-container">
              <div>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                  <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                  <circle cx="20" cy="10" r="2" />
                </svg>
              </div>
              <div>
                <h1 class="app-title">HealthCare Service</h1>
                <p class="app-subtitle">Powered by Team Titans</p>
              </div>
            </div>
            <div class="header-actions">
              <div class="search-container">
                <span class="search-icon">
                  <i data-lucide="search"></i>
                </span>
                <input 
                  type="text" 
                  placeholder="Search hospitals, doctors..." 
                  class="search-input"
                />
              </div>
              <button class="button button-ghost" data-action="signIn">
                <i data-lucide="user"></i>
                Sign In
              </button>
            </div>
          </div>
        </header>

        <!-- Navigation -->
        <nav class="nav">
          <div class="container nav-container">
            ${renderNavItem("hospitals", "building-2", "Hospitals")}
            ${renderNavItem("diagnosticCenters", "microscope", "Diagnostic Centers")}
            ${renderNavItem("bloodBanks", "droplet", "Blood Banks")}
            ${renderNavItem("pharmacies", "pill", "Pharmacies")}
            ${renderNavItem("ambulance", "ambulance", "Ambulance")}
            
            ${renderNavItem("telemedicine", "video", "Telemedicine")}
            ${renderNavItem("drugInteractions", "alert-circle", "Drug Interactions")}
            ${renderNavItem("appointments", "calendar", "Appointments")}
          </div>
        </nav>

        <!-- Main Content -->
        <main class="main-content">
          <div id="map"></div>
          ${renderContent()}
        </main>

        <!-- Sign In Modal (hidden by default) -->
        <div id="signInModal" class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Sign In</h2>
              <button class="close-button" data-action="closeModal">&times;</button>
            </div>
            <div class="modal-body">
              <form id="signInForm">
                <div class="form-group">
                  <label for="email">Email</label>
                  <input type="email" id="email" name="email" required class="form-input" placeholder="Enter your email">
                </div>
                <div class="form-group">
                  <label for="password">Password</label>
                  <input type="password" id="password" name="password" required class="form-input" placeholder="Enter your password">
                </div>
                <div class="form-actions">
                  <button type="submit" class="button button-primary button-full" data-action="submitSignIn">Sign In</button>
                </div>
                <div class="form-footer">
                  <p>Don't have an account? <a href="#" data-action="showSignUp">Sign Up</a></p>
                  <p><a href="#" data-action="forgotPassword">Forgot Password?</a></p>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Location Loading Indicator (hidden by default) -->
        <div id="locationLoading" class="loading-overlay">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>Finding your location...</p>
          </div>
        </div>
      </div>
    `

    // Initialize the map (with error handling)
    try {
      // Hide map for drug interactions tab
      if (activeTab === "drugInteractions") {
        const mapElement = document.getElementById("map")
        if (mapElement) {
          mapElement.style.display = "none"
        }
      }

      initMap()
    } catch (error) {
      console.error("Error initializing map:", error)
      const mapElement = document.getElementById("map")
      if (mapElement) {
        mapElement.innerHTML = `
          <div style="height: 100%; display: flex; align-items: center; justify-content: center; background-color: #f3f4f6;">
            <p>Map could not be loaded. Please check your internet connection.</p>
          </div>
        `
      }
    }

    // Clear hospital markers and list when not on hospitals tab
    if (activeTab !== "hospitals") {
      // Remove any existing hospital list
      const existingHospitalList = document.querySelector(".hospital-list-container")
      if (existingHospitalList) {
        existingHospitalList.remove()
      }

      // Clear hospital markers from map if they exist and map is initialized
      if (mapInstance) {
        try {
          // Remove all markers
          if (hospitalMarkers.length > 0) {
            // We'll just reinitialize the map without the markers
            mapInstance.remove()
            mapInstance = null
            // Reset hospital markers array
            hospitalMarkers = []
            initMap()
          }
        } catch (error) {
          console.error("Error clearing hospital markers:", error)
        }
      }
    } else {
      // If we're on the hospitals tab and have user location, show hospitals
      if (userLocation && hospitalMarkers.length > 0) {
        try {
          showNearbyHospitals()
        } catch (error) {
          console.error("Error showing nearby hospitals:", error)
        }
      }
    }

    // Re-initialize Lucide icons after DOM update
    if (window.lucide) {
      try {
        window.lucide.createIcons()
      } catch (error) {
        console.error("Error re-initializing Lucide icons:", error)
      }
    }

    // Add event listeners to nav items
    document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", function () {
    const tab = this.getAttribute("data-tab")

    if (tab === "appointments") {
      window.location.href = "appointments.php"
      return
    }
     if (tab === "pharmacies") {
      window.location.href = "pharmacy.php";
      return;
     }
     if (tab === "ambulance") {
      window.location.href = "ambulance.php";
      return;
     }

    activeTab = tab
    renderApp()
  })
})


    // Add event listeners to buttons
    document.querySelectorAll("[data-action]").forEach((element) => {
      element.addEventListener("click", function (e) {
        const action = this.getAttribute("data-action")
        if (action) {
          e.preventDefault() // Prevent default for links
          handleAction(action)
        }
      })
    })

    // Add event listener to sign in form
    const signInForm = document.getElementById("signInForm")
    if (signInForm) {
      signInForm.addEventListener("submit", (e) => {
        e.preventDefault()
        handleSignIn()
      })
    }

    console.log("App rendering complete")
  }

  // Function to render a navigation item
  function renderNavItem(tabId, iconName, label) {
    const isActive = activeTab === tabId
    return `
      <button 
        class="nav-item ${isActive ? "active" : ""}"
        data-tab="${tabId}"
      >
        <span class="nav-item-icon">
          <i data-lucide="${iconName}"></i>
        </span>
        ${label}
      </button>
    `
  }

  // Function to render the main content based on active tab
  function renderContent() {
    switch (activeTab) {
      case "ambulance":
        return renderAmbulanceView()
      case "emergency":
        return renderEmergencyView()
      case "bloodBanks":
        return renderBloodBanksView()
      case "telemedicine":
        return renderTelemedicineView()
      case "drugInteractions":
        return renderDrugInteractionsView()
      case "hospitals":
        return `
          <div class="floating-top-right">
            <button class="button button-primary" data-action="findNearbyHospitals">
              <i data-lucide="map-pin"></i>
              Find Nearby Hospitals
            </button>
          </div>
        `
      case "diagnosticCenters":
        return `
          <div class="floating-top-right">
            <button class="button button-primary" data-action="findNearbyDiagnosticCenters">
              <i data-lucide="map-pin"></i>
              Find Nearby Diagnostic Centers
            </button>
          </div>
        `
      default:
        return "" // Return empty for other tabs
    }
  }

  // Function to render the Drug Interactions view
  function renderDrugInteractionsView() {
    return `
    <div class="drug-interactions-container">
      <div class="drug-interactions-header">
        <h2 class="section-title">Drug Interactions & Allergies Database</h2>
        <button class="button button-primary" data-action="checkInteractions">
          <i data-lucide="search"></i>
          Check Interactions
        </button>
      </div>
      
      <div class="drug-interactions-content">
        <div class="drug-search-section">
          <div class="form-group">
            <label for="drugSearch">Search for a drug or allergy:</label>
            <div class="search-with-button">
              <input type="text" id="drugSearch" class="form-input" placeholder="Enter drug name or allergy">
              <button class="button button-primary" data-action="searchDrug">
                <i data-lucide="search"></i>
              </button>
            </div>
          </div>
          
          <div class="drug-interaction-checker">
            <h3>Check Multiple Drug Interactions</h3>
            <p>Add medications to check for potential interactions:</p>
            
            <div class="drug-list">
              <div class="drug-item">
                <select class="form-input">
                  <option value="">Select a medication</option>
                  <option value="aspirin">Aspirin</option>
                  <option value="ibuprofen">Ibuprofen</option>
                  <option value="acetaminophen">Acetaminophen</option>
                  <option value="lisinopril">Lisinopril</option>
                  <option value="metformin">Metformin</option>
                  <option value="atorvastatin">Atorvastatin</option>
                  <option value="levothyroxine">Levothyroxine</option>
                  <option value="warfarin">Warfarin</option>
                </select>
                <button class="button button-secondary" data-action="removeDrug">
                  <i data-lucide="x"></i>
                </button>
              </div>
              
              <div class="drug-item">
                <select class="form-input">
                  <option value="">Select a medication</option>
                  <option value="aspirin">Aspirin</option>
                  <option value="ibuprofen">Ibuprofen</option>
                  <option value="acetaminophen">Acetaminophen</option>
                  <option value="lisinopril">Lisinopril</option>
                  <option value="metformin">Metformin</option>
                  <option value="atorvastatin">Atorvastatin</option>
                  <option value="levothyroxine">Levothyroxine</option>
                  <option value="warfarin">Warfarin</option>
                </select>
                <button class="button button-secondary" data-action="removeDrug">
                  <i data-lucide="x"></i>
                </button>
              </div>
            </div>
            
            <div class="drug-actions">
              <button class="button button-secondary" data-action="addDrug">
                <i data-lucide="plus"></i>
                Add Another Medication
              </button>
              
              <button class="button button-primary" data-action="checkInteractions">
                Check Interactions
              </button>
            </div>
          </div>
        </div>
        
        <div class="drug-info-section">
          <div class="common-interactions">
            <h3>Common Drug Interactions</h3>
            <div class="interaction-grid">
              ${renderInteractionCard("Warfarin + NSAIDs", "Increased risk of bleeding", "high")}
              
              ${renderInteractionCard(
                "ACE Inhibitors + Potassium Supplements",
                "Risk of hyperkalemia (high potassium levels)",
                "moderate",
              )}
              
              ${renderInteractionCard(
                "Statins + Grapefruit Juice",
                "Increased statin concentration and side effects",
                "moderate",
              )}
              
              ${renderInteractionCard("MAOIs + SSRIs", "Risk of serotonin syndrome", "high")}
              
              ${renderInteractionCard(
                "Antibiotics + Oral Contraceptives",
                "Reduced contraceptive effectiveness",
                "moderate",
              )}
              
              ${renderInteractionCard("Alcohol + Sedatives", "Enhanced sedation and respiratory depression", "high")}
            </div>
          </div>
          
          <div class="common-allergies">
            <h3>Common Allergies</h3>
            <div class="allergy-list">
              ${renderAllergyItem("Penicillin", "Antibiotics", "Rash, hives, anaphylaxis")}
              ${renderAllergyItem("Sulfa Drugs", "Antibiotics", "Skin rash, hives")}
              ${renderAllergyItem("NSAIDs", "Pain relievers", "Hives, facial swelling, wheezing")}
              ${renderAllergyItem("Contrast Dye", "Imaging studies", "Itching, hives, low blood pressure")}
              ${renderAllergyItem("Latex", "Medical supplies", "Contact dermatitis, hives, anaphylaxis")}
              ${renderAllergyItem("Shellfish", "Food", "Hives, throat swelling, anaphylaxis")}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Drug Interaction Results Modal (hidden by default) -->
    <div id="interactionResultsModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Drug Interaction Results</h2>
          <button class="close-button" data-action="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="interaction-results">
            <div class="interaction-result severe">
              <div class="interaction-severity">
                <span class="severity-indicator severe"></span>
                <span class="severity-text">Severe</span>
              </div>
              <h3>Warfarin + Aspirin</h3>
              <p>These medications taken together may increase the risk of bleeding. Monitor for signs of bleeding such as unusual bruising, nosebleeds, or blood in urine or stool.</p>
              <p><strong>Recommendation:</strong> Avoid combination if possible. If necessary, close monitoring is required.</p>
            </div>
            
            <div class="interaction-result moderate">
              <div class="interaction-severity">
                <span class="severity-indicator moderate"></span>
                <span class="severity-text">Moderate</span>
              </div>
              <h3>Lisinopril + Ibuprofen</h3>
              <p>NSAIDs like ibuprofen may reduce the blood pressure-lowering effect of ACE inhibitors like lisinopril.</p>
              <p><strong>Recommendation:</strong> Monitor blood pressure. Consider acetaminophen as an alternative.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
  }

  // Function to render an interaction card
  function renderInteractionCard(title, description, severity) {
    return `
      <div class="card card-interaction">
        <div class="card-content">
          <div class="card-header">
            <h3 class="card-title">${title}</h3>
            <span class="interaction-severity ${severity}"></span>
          </div>
          <p class="card-text">${description}</p>
          <div class="severity-label ${severity}">
            ${severity.charAt(0).toUpperCase() + severity.slice(1)} Risk
          </div>
        </div>
      </div>
    `
  }

  // Function to render an allergy item
  function renderAllergyItem(allergen, category, reactions) {
    return `
      <div class="allergy-item">
        <div class="allergy-header">
          <h4>${allergen}</h4>
          <span class="allergy-category">${category}</span>
        </div>
        <p class="allergy-reactions"><strong>Common reactions:</strong> ${reactions}</p>
      </div>
    `
  }

  // Function to render the Ambulance view
  function renderAmbulanceView() {
    return `
      <div class="floating-top-right">
        <button class="button button-danger" data-action="emergencyCall">
          Emergency Call
        </button>
      </div>
      
      <div class="floating-top-left">
        <h2 class="section-title">Available Ambulances</h2>
        
        <div class="card-grid card-grid-2">
          ${renderAmbulanceCard("Unit DHK-001", "5 mins")}
          ${renderAmbulanceCard("Unit CTG-001", "8 mins")}
        </div>
      </div>
    `
  }

  // Function to render an Ambulance card
  function renderAmbulanceCard(unit, responseTime) {
    return `
      <div class="card card-ambulance">
        <div class="card-content">
          <div class="card-header">
            <h3 class="card-title">${unit}</h3>
            <span class="card-status">Available</span>
          </div>
          <p class="card-text">Response Time: ${responseTime}</p>
          <button class="button button-primary button-full" data-action="callAmbulance" data-unit="${unit}">
            Call Ambulance
          </button>
        </div>
      </div>
    `
  }

  // Function to render the Emergency view
  function renderEmergencyView() {
    return `
      <div class="floating-top-right">
        <button class="button button-danger" data-action="emergencyCall">
          Emergency Call
        </button>
      </div>
      
      <div class="floating-top-left">
        <h2 class="section-title">Emergency Services</h2>
        
        <div class="card-grid card-grid-3">
          ${renderEmergencyCard(
            "Ambulance Service",
            "24/7 emergency ambulance service with GPS tracking",
            "ambulance",
            "Call Now",
            "callAmbulanceService",
          )}
          
          ${renderEmergencyCard(
            "Emergency Room",
            "Find the nearest emergency room",
            "building",
            "Locate",
            "locateEmergencyRoom",
          )}
          
          ${renderEmergencyCard(
            "Medical Helpline",
            "Speak with a medical professional",
            "phone",
            "Call Helpline",
            "callHelpline",
          )}
        </div>
      </div>
    `
  }

  // Function to render an Emergency card
  function renderEmergencyCard(title, description, iconName, buttonText, action) {
    return `
      <div class="card card-emergency">
        <div class="emergency-card-content">
          <div class="emergency-icon">
            <i data-lucide="${iconName}" style="width: 48px; height: 48px;"></i>
          </div>
          <h3 class="emergency-title">${title}</h3>
          <p class="emergency-text">${description}</p>
          <button 
            class="button button-primary button-full"
            data-action="${action}"
          >
            ${buttonText}
          </button>
        </div>
      </div>
    `
  }

  // Function to render the Blood Banks view
  function renderBloodBanksView() {
    return `
  <div class="floating-top-right">
    <button class="button button-primary blood-donate-btn" data-action="donateBlood">
      <i data-lucide="heart"></i>
      Donate Blood
    </button>
  </div>
  
  <div class="floating-top-left">
    <h2 class="section-title">Blood Banks Near You</h2>
    
    <div class="card-grid card-grid-2">
      ${renderBloodBankCard("City Blood Bank", "2.3 km", ["A+", "B+", "AB+", "O+"], ["A-", "O-"])}
      ${renderBloodBankCard("Red Cross Blood Center", "3.5 km", ["A+", "O+"], ["AB-", "B-", "O-"])}
      ${renderBloodBankCard("Memorial Hospital Blood Bank", "4.1 km", ["B+", "AB+"], ["A-", "AB-"])}
      ${renderBloodBankCard("University Medical Center", "5.2 km", ["A+", "B+", "O+"], ["B-"])}
    </div>
  </div>

  <!-- Blood Donation Modal (hidden by default) -->
  <div id="bloodDonationModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Donate Blood</h2>
        <button class="close-button" data-action="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="bloodDonationForm">
          <div class="form-group">
            <label for="donorName">Full Name</label>
            <input type="text" id="donorName" name="donorName" required class="form-input" placeholder="Enter your full name">
          </div>
          <div class="form-group">
            <label for="donorAge">Age</label>
            <input type="number" id="donorAge" name="donorAge" required class="form-input" min="18" max="65" placeholder="Must be between 18-65">
          </div>
          <div class="form-group">
            <label for="donorBloodType">Blood Type</label>
            <select id="donorBloodType" name="donorBloodType" required class="form-input">
              <option value="">Select your blood type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div class="form-group">
            <label for="donorPhone">Phone Number</label>
            <input type="tel" id="donorPhone" name="donorPhone" required class="form-input" placeholder="Enter your phone number">
          </div>
          <div class="form-group">
            <label for="donorEmail">Email</label>
            <input type="email" id="donorEmail" name="donorEmail" class="form-input" placeholder="Enter your email (optional)">
          </div>
          <div class="form-group">
            <label for="preferredLocation">Preferred Donation Location</label>
            <select id="preferredLocation" name="preferredLocation" required class="form-input">
              <option value="">Select preferred location</option>
              <option value="City Blood Bank">City Blood Bank</option>
              <option value="Red Cross Blood Center">Red Cross Blood Center</option>
              <option value="Memorial Hospital Blood Bank">Memorial Hospital Blood Bank</option>
              <option value="University Medical Center">University Medical Center</option>
            </select>
          </div>
          <div class="form-group">
            <label for="preferredDate">Preferred Date</label>
            <input type="date" id="preferredDate" name="preferredDate" required class="form-input" min="${getTomorrowDate()}">
          </div>
          <div class="form-group health-declaration">
            <label class="checkbox-container">
              <input type="checkbox" id="healthDeclaration" name="healthDeclaration" required>
              <span class="checkmark"></span>
              I declare that I am in good health and haven't donated blood in the last 3 months
            </label>
          </div>
          <div class="form-actions">
            <button type="submit" class="button button-primary button-full" data-action="submitBloodDonation">Register as Donor</button>
          </div>
        </form>
      </div>
    </div>
  </div>
`
  }

  // Function to render a Blood Bank card
  function renderBloodBankCard(name, distance, availableTypes, neededTypes) {
    return `
  <div class="card card-blood-bank">
    <div class="card-content">
      <div class="card-header">
        <h3 class="card-title">${name}</h3>
        <span class="card-distance">${distance}</span>
      </div>
      <div class="blood-types-container">
        <div class="blood-types-section">
          <h4 class="blood-types-title">Available</h4>
          <div class="blood-types-list">
            ${availableTypes.map((type) => `<span class="blood-type available">${type}</span>`).join("")}
          </div>
        </div>
        <div class="blood-types-section">
          <h4 class="blood-types-title urgent">Urgently Needed</h4>
          <div class="blood-types-list">
            ${neededTypes.map((type) => `<span class="blood-type needed">${type}</span>`).join("")}
          </div>
        </div>
      </div>
      <button class="button button-primary button-full" data-action="contactBloodBank" data-bank="${name}">
        Contact Blood Bank
      </button>
    </div>
  </div>
`
  }

  // Function to render the Telemedicine view
  function renderTelemedicineView() {
    return `
      <div class="floating-top-right">
        <button class="button button-telemedicine" data-action="startTelemedicine">
          <i data-lucide="video"></i>
          Start Consultation
        </button>
      </div>
      
      <div class="floating-top-left">
        <h2 class="section-title">Telemedicine Services</h2>
        
        <div class="card-grid card-grid-2">
          ${renderDoctorCard("Dr. Sarah Johnson", "Cardiologist", "Available Now", "15 mins", "4.9", "500")}
          
          ${renderDoctorCard("Dr. Michael Chen", "Pediatrician", "Available Now", "5 mins", "4.8", "320")}
          
          ${renderDoctorCard("Dr. Emily Rodriguez", "Dermatologist", "Available at 3:00 PM", "30 mins", "4.7", "215")}
          
          ${renderDoctorCard("Dr. James Wilson", "General Physician", "Available Now", "10 mins", "4.9", "430")}
        </div>
      </div>

      <!-- Telemedicine Modal (hidden by default) -->
      <div id="telemedicineModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Start Video Consultation</h2>
            <button class="close-button" data-action="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="telemedicine-container">
              <div class="video-placeholder">
                <i data-lucide="video" style="width: 48px; height: 48px;"></i>
                <p>Your video will appear here</p>
              </div>
              <div class="doctor-info">
                <h3>Connecting to doctor...</h3>
                <p>Please wait while we connect you to a healthcare professional.</p>
              </div>
              <div class="video-controls">
                <button class="button button-secondary" data-action="toggleMute">
                  <i data-lucide="mic"></i>
                  Mute
                </button>
                <button class="button button-secondary" data-action="toggleVideo">
                  <i data-lucide="video"></i>
                  Turn Off Video
                </button>
                <button class="button button-danger" data-action="endCall">
                  <i data-lucide="phone-off"></i>
                  End Call
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  // Function to render a Doctor card for Telemedicine
  function renderDoctorCard(name, specialty, availability, waitTime, rating, reviews) {
    const isAvailableNow = availability === "Available Now"

    return `
      <div class="card card-doctor">
        <div class="card-content">
          <div class="card-header">
            <h3 class="card-title">${name}</h3>
            <span class="card-status ${isAvailableNow ? "available" : "scheduled"}">${availability}</span>
          </div>
          <p class="card-text">Specialty: ${specialty}</p>
          <p class="card-text">Wait Time: ${waitTime}</p>
          <div class="doctor-rating">
            <div class="rating-stars">
              <i data-lucide="star" class="star-filled"></i>
              <span class="rating-value">${rating}</span>
            </div>
            <span class="review-count">(${reviews} reviews)</span>
          </div>
          <button class="button ${isAvailableNow ? "button-telemedicine" : "button-secondary"} button-full" 
            data-action="${isAvailableNow ? "startConsultation" : "scheduleConsultation"}" 
            data-doctor="${name}">
            ${isAvailableNow ? "Start Consultation" : "Schedule Appointment"}
          </button>
        </div>
      </div>
    `
  }

  // Helper function to get tomorrow's date in YYYY-MM-DD format for the date input min attribute
  function getTomorrowDate() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  // Function to initialize the map
  function initMap() {
    try {
      // Check if Leaflet is loaded
      if (!window.L) {
        console.warn("Leaflet library not loaded, skipping map initialization")
        const mapElement = document.getElementById("map")
        if (mapElement) {
          mapElement.innerHTML = `
            <div style="height: 100%; display: flex; align-items: center; justify-content: center; background-color: #f3f4f6;">
              <p>Map could not be loaded. Please check your internet connection.</p>
            </div>
          `
        }
        return
      }

      // Default position (Dhaka, Bangladesh)
      const position = userLocation || [23.7808, 90.3791]

      // Create map instance
      mapInstance = window.L.map("map").setView(position, 13)

      // Add tile layer
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance)

      // Add user location marker if available
      if (userLocation) {
        const userIcon = window.L.divIcon({
          html: '<div class="user-location-marker"><div class="pulse"></div></div>',
          className: "",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        window.L.marker(userLocation, { icon: userIcon }).addTo(mapInstance).bindPopup("Your Location").openPopup()

        // Add hospital markers if they exist
        if (hospitalMarkers.length > 0) {
          showNearbyHospitals()
        }
      } else {
        // Add default marker
        window.L.marker(position).addTo(mapInstance)
      }
    } catch (error) {
      console.error("Error initializing map:", error)
      const mapElement = document.getElementById("map")
      if (mapElement) {
        mapElement.innerHTML = `
          <div style="height: 100%; display: flex; align-items: center; justify-content: center; background-color: #f3f4f6;">
            <p>Map could not be loaded. Please check your internet connection.</p>
          </div>
        `
      }
    }
  }

  // Function to handle all actions
  function handleAction(action, data) {
    try {
      switch (action) {
        case "signIn":
          showSignInModal()
          break
        case "closeModal":
          closeModal()
          break
        case "submitSignIn":
          handleSignIn()
          break
        case "showSignUp":
          alert("Sign Up functionality will be implemented soon.")
          break
        case "forgotPassword":
          alert("Password recovery functionality will be implemented soon.")
          break
        case "findNearbyHospitals":
          getUserLocation()
          break
        case "emergencyCall":
          alert("Making emergency call...")
          break
        case "callAmbulance":
          alert("Calling ambulance...")
          break
        case "callAmbulanceService":
          alert("Calling ambulance service...")
          break
        case "locateEmergencyRoom":
          alert("Locating nearest emergency room...")
          break
        case "callHelpline":
          alert("Calling medical helpline...")
          break
        case "donateBlood":
          showBloodDonationModal()
          break
        case "submitBloodDonation":
          handleBloodDonationSubmit()
          break
        case "contactBloodBank":
          const bankName = event.target.getAttribute("data-bank")
          alert(`Contacting ${bankName}. They will call you shortly.`)
          break
        case "startTelemedicine":
          showTelemedicineModal()
          break
        case "startConsultation":
          const doctorName = event.target.getAttribute("data-doctor")
          startVideoConsultation(doctorName)
          break
        case "scheduleConsultation":
          const doctor = event.target.getAttribute("data-doctor")
          scheduleAppointment(doctor)
          break
        case "toggleMute":
          alert("Microphone toggled")
          break
        case "toggleVideo":
          alert("Video toggled")
          break
        case "endCall":
          alert("Call ended")
          closeModal()
          break
        case "checkInteractions":
          showInteractionResults()
          break
        case "searchDrug":
          alert("Searching for drug information...")
          break
        case "addDrug":
          alert("Add another medication option")
          break
        case "removeDrug":
          alert("Remove medication from list")
          break
        case "findNearbyDiagnosticCenters":
          getUserLocationForDiagnosticCenters()
          break
        default:
          console.log("Action not implemented:", action)
      }
    } catch (error) {
      console.error("Error handling action:", action, error)
      alert("An error occurred. Please try again.")
    }
  }

  // Function to show the sign in modal
  function showSignInModal() {
    const modal = document.getElementById("signInModal")
    if (modal) {
      modal.classList.add("show")
    }
  }

  // Function to show drug interaction results
  function showInteractionResults() {
    const modal = document.getElementById("interactionResultsModal")
    if (modal) {
      modal.classList.add("show")

      // Re-initialize Lucide icons for the modal content
      if (window.lucide) {
        try {
          window.lucide.createIcons()
        } catch (error) {
          console.error("Error initializing Lucide icons in modal:", error)
        }
      }
    }
  }

  // Function to close any modal
  function closeModal() {
    const modals = document.querySelectorAll(".modal")
    modals.forEach((modal) => {
      modal.classList.remove("show")
    })
  }

  // Function to handle sign in form submission
  function handleSignIn() {
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    if (!email || !password) {
      alert("Please enter both email and password.")
      return
    }

    // In a real app, you would send this to a server
    // For this demo, we'll just show a success message
    alert(`Signed in successfully as ${email}`)
    closeModal()
  }

  // Function to show the blood donation modal
  function showBloodDonationModal() {
    const modal = document.getElementById("bloodDonationModal")
    if (modal) {
      modal.classList.add("show")

      // Add event listener to the form
      const bloodDonationForm = document.getElementById("bloodDonationForm")
      if (bloodDonationForm) {
        bloodDonationForm.addEventListener("submit", (e) => {
          e.preventDefault()
          handleBloodDonationSubmit()
        })
      }
    }
  }

  // Function to handle blood donation form submission
  function handleBloodDonationSubmit() {
    const donorName = document.getElementById("donorName").value
    const donorAge = document.getElementById("donorAge").value
    const donorBloodType = document.getElementById("donorBloodType").value
    const donorPhone = document.getElementById("donorPhone").value
    const preferredLocation = document.getElementById("preferredLocation").value
    const preferredDate = document.getElementById("preferredDate").value
    const healthDeclaration = document.getElementById("healthDeclaration").checked

    // Validate form
    if (
      !donorName ||
      !donorAge ||
      !donorBloodType ||
      !donorPhone ||
      !preferredLocation ||
      !preferredDate ||
      !healthDeclaration
    ) {
      alert("Please fill in all required fields.")
      return
    }

    if (donorAge < 18 || donorAge > 65) {
      alert("You must be between 18 and 65 years old to donate blood.")
      return
    }

    // In a real app, you would send this to a server
    // For this demo, we'll just show a success message
    alert(
      `Thank you, ${donorName}! Your blood donation (${donorBloodType}) has been scheduled for ${preferredDate} at ${preferredLocation}. They will contact you at ${donorPhone} to confirm.`,
    )
    closeModal()
  }

  // Function to show telemedicine modal
  function showTelemedicineModal() {
    const modal = document.getElementById("telemedicineModal")
    if (modal) {
      modal.classList.add("show")

      // Re-initialize Lucide icons for the modal content
      if (window.lucide) {
        try {
          window.lucide.createIcons()
        } catch (error) {
          console.error("Error initializing Lucide icons in telemedicine modal:", error)
        }
      }
    }
  }

  // Function to start a video consultation
  function startVideoConsultation(doctorName) {
    const modal = document.getElementById("telemedicineModal")
    if (modal) {
      // Update doctor info in the modal
      const doctorInfo = modal.querySelector(".doctor-info")
      if (doctorInfo) {
        doctorInfo.innerHTML = `
          <h3>Connecting to ${doctorName}</h3>
          <p>Please wait while we connect you to your healthcare professional.</p>
        `
      }

      modal.classList.add("show")

      // Re-initialize Lucide icons for the modal content
      if (window.lucide) {
        try {
          window.lucide.createIcons()
        } catch (error) {
          console.error("Error initializing Lucide icons in consultation modal:", error)
        }
      }
    }
  }

  // Function to schedule an appointment
  function scheduleAppointment(doctorName) {
    alert(`Opening scheduling calendar for ${doctorName}...`)
    // In a real app, this would open a scheduling interface
  }

  // Function to get user's current location
  function getUserLocation() {
    // Show loading indicator
    const loadingOverlay = document.getElementById("locationLoading")
    if (loadingOverlay) {
      loadingOverlay.classList.add("show")
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      const loadingOverlayElement = document.getElementById("locationLoading")
      if (loadingOverlayElement) {
        loadingOverlayElement.classList.remove("show")
      }
      return
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        userLocation = [position.coords.latitude, position.coords.longitude]

        // Hide loading indicator
        const loadingOverlayElement = document.getElementById("locationLoading")
        if (loadingOverlayElement) {
          loadingOverlayElement.classList.remove("show")
        }

        // Generate nearby hospitals (simulated)
        generateNearbyHospitals()

        // Reinitialize map with user location
        if (mapInstance) {
          try {
            mapInstance.remove()
          } catch (error) {
            console.error("Error removing map instance:", error)
          }
        }
        initMap()

        // Show nearby hospitals
        showNearbyHospitals()
      },
      // Error callback
      (error) => {
        // Hide loading indicator
        const loadingOverlayElement = document.getElementById("locationLoading")
        if (loadingOverlayElement) {
          loadingOverlayElement.classList.remove("show")
        }

        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.")
            break
          case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.")
            break
          case error.TIMEOUT:
            alert("The request to get user location timed out.")
            break
          case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.")
            break
        }
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  // Function to generate nearby hospitals (simulated)
  function generateNearbyHospitals() {
    if (!userLocation) return

    // Clear existing markers
    hospitalMarkers = []

    // Generate 5 random hospital locations around the user's location
    const hospitalNames = [
      "City General Hospital",
      "Community Medical Center",
      "St. Mary's Hospital",
      "Memorial Healthcare",
      "University Medical Center",
    ]

    for (let i = 0; i < 5; i++) {
      // Generate a random offset (within ~1-2km)
      const latOffset = (Math.random() - 0.5) * 0.02
      const lngOffset = (Math.random() - 0.5) * 0.02

      hospitalMarkers.push({
        position: [userLocation[0] + latOffset, userLocation[1] + lngOffset],
        name: hospitalNames[i],
        distance: Math.round((Math.random() * 1.5 + 0.5) * 10) / 10, // 0.5 to 2.0 km
        beds: Math.floor(Math.random() * 50) + 10, // 10 to 60 available beds
      })
    }

    // Sort by distance
    hospitalMarkers.sort((a, b) => a.distance - b.distance)
  }

  // Function to show nearby hospitals on the map
  function showNearbyHospitals() {
    if (!mapInstance || !userLocation || hospitalMarkers.length === 0) return

    try {
      // Create hospital icon
      const hospitalIcon = window.L.divIcon({
        html: '<div class="hospital-marker"><i data-lucide="building"></i></div>',
        className: "",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      // Add markers to map
      hospitalMarkers.forEach((hospital) => {
        const marker = window.L.marker(hospital.position, { icon: hospitalIcon }).addTo(mapInstance)

        // Create popup content
        const popupContent = `
          <div class="hospital-popup">
            <h3>${hospital.name}</h3>
            <p><strong>Distance:</strong> ${hospital.distance} km</p>
            <p><strong>Available Beds:</strong> ${hospital.beds}</p>
            <button class="button button-primary button-small" onclick="alert('Directions to ${hospital.name}')">
              Get Directions
            </button>
          </div>
        `

        marker.bindPopup(popupContent)
      })

      // Remove any existing hospital list before adding a new one
      const existingHospitalList = document.querySelector(".hospital-list-container")
      if (existingHospitalList) {
        existingHospitalList.remove()
      }

      // Only add the hospital list if we're on the hospitals tab
      if (activeTab === "hospitals") {
        // Add a floating panel with hospital list
        const hospitalListContainer = document.createElement("div")
        hospitalListContainer.className = "floating-top-left hospital-list-container"
        hospitalListContainer.innerHTML = `
          <h2 class="section-title">Nearby Hospitals</h2>
          <div class="hospital-list">
            ${hospitalMarkers
              .map(
                (hospital) => `
              <div class="hospital-list-item">
                <h3>${hospital.name}</h3>
                <p><strong>Distance:</strong> ${hospital.distance} km</p>
                <p><strong>Available Beds:</strong> ${hospital.beds}</p>
                <button class="button button-primary button-small" data-action="getDirections" data-hospital="${hospital.name}">
                Get Directions
                </button>
              </div>
            `,
              )
              .join("")}
          </div>
        `

        document.querySelector(".main-content").appendChild(hospitalListContainer)
      }

      // Re-initialize Lucide icons for the new content
      if (window.lucide) {
        try {
          window.lucide.createIcons()
        } catch (error) {
          console.error("Error initializing Lucide icons in hospital list:", error)
        }
      }

      // Add event listeners to the new buttons
      document.querySelectorAll('[data-action="getDirections"]').forEach((button) => {
        button.addEventListener("click", function () {
          const hospitalName = this.getAttribute("data-hospital")
          alert(`Getting directions to ${hospitalName}`)
        })
      })
    } catch (error) {
      console.error("Error showing nearby hospitals:", error)
    }
  }

  // Add this function after the showNearbyHospitals function
  function getUserLocationForDiagnosticCenters() {
    // Show loading indicator
    const loadingOverlay = document.getElementById("locationLoading")
    if (loadingOverlay) {
      loadingOverlay.classList.add("show")
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      const loadingOverlayElement = document.getElementById("locationLoading")
      if (loadingOverlayElement) {
        loadingOverlayElement.classList.remove("show")
      }
      return
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        userLocation = [position.coords.latitude, position.coords.longitude]

        // Hide loading indicator
        const loadingOverlayElement = document.getElementById("locationLoading")
        if (loadingOverlayElement) {
          loadingOverlayElement.classList.remove("show")
        }

        // Generate nearby diagnostic centers (simulated)
        generateNearbyDiagnosticCenters()

        // Reinitialize map with user location
        if (mapInstance) {
          try {
            mapInstance.remove()
          } catch (error) {
            console.error("Error removing map instance:", error)
          }
        }
        initMap()

        // Show nearby diagnostic centers
        showNearbyDiagnosticCenters()
      },
      // Error callback
      (error) => {
        // Hide loading indicator
        const loadingOverlayElement = document.getElementById("locationLoading")
        if (loadingOverlayElement) {
          loadingOverlayElement.classList.remove("show")
        }

        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.")
            break
          case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.")
            break
          case error.TIMEOUT:
            alert("The request to get user location timed out.")
            break
          case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.")
            break
        }
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  // Function to generate nearby diagnostic centers (simulated)
  function generateNearbyDiagnosticCenters() {
    if (!userLocation) return

    // Initialize diagnostic center markers array if it doesn't exist
    if (!window.diagnosticCenterMarkers) {
      window.diagnosticCenterMarkers = []
    }

    // Clear existing markers
    window.diagnosticCenterMarkers = []

    // Generate 5 random diagnostic center locations around the user's location
    const diagnosticCenterNames = [
      "City Diagnostic Center",
      "HealthScan Labs",
      "MediTest Diagnostics",
      "Advanced Imaging Center",
      "LifeCheck Diagnostics",
    ]

    const diagnosticServices = [
      ["X-ray", "MRI", "CT Scan", "Blood Tests"],
      ["Blood Tests", "Ultrasound", "ECG", "Mammography"],
      ["CT Scan", "PET Scan", "Ultrasound", "Biopsy"],
      ["MRI", "X-ray", "Bone Density", "Cardiac Tests"],
      ["Blood Tests", "Allergy Testing", "Genetic Testing", "Hormone Tests"],
    ]

    for (let i = 0; i < 5; i++) {
      // Generate a random offset (within ~1-2km)
      const latOffset = (Math.random() - 0.5) * 0.02
      const lngOffset = (Math.random() - 0.5) * 0.02

      window.diagnosticCenterMarkers.push({
        position: [userLocation[0] + latOffset, userLocation[1] + lngOffset],
        name: diagnosticCenterNames[i],
        distance: Math.round((Math.random() * 1.5 + 0.5) * 10) / 10, // 0.5 to 2.0 km
        services: diagnosticServices[i],
        rating: (Math.random() * 1 + 4).toFixed(1), // 4.0 to 5.0 rating
      })
    }

    // Sort by distance
    window.diagnosticCenterMarkers.sort((a, b) => a.distance - b.distance)
  }

  // Function to show nearby diagnostic centers on the map
  function showNearbyDiagnosticCenters() {
    if (!mapInstance || !userLocation || !window.diagnosticCenterMarkers || window.diagnosticCenterMarkers.length === 0)
      return

    try {
      // Create diagnostic center icon
      const diagnosticIcon = window.L.divIcon({
        html: '<div class="hospital-marker" style="color: #8b5cf6;"><i data-lucide="microscope"></i></div>',
        className: "",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      // Add markers to map
      window.diagnosticCenterMarkers.forEach((center) => {
        const marker = window.L.marker(center.position, { icon: diagnosticIcon }).addTo(mapInstance)

        // Create popup content
        const popupContent = `
      <div class="hospital-popup">
        <h3>${center.name}</h3>
        <p><strong>Distance:</strong> ${center.distance} km</p>
        <p><strong>Rating:</strong> ${center.rating}/5.0</p>
        <button class="button button-primary button-small" onclick="alert('Directions to ${center.name}')">
          Get Directions
        </button>
      </div>
    `

        marker.bindPopup(popupContent)
      })

      // Remove any existing diagnostic center list before adding a new one
      const existingDiagnosticList = document.querySelector(".diagnostic-list-container")
      if (existingDiagnosticList) {
        existingDiagnosticList.remove()
      }

      // Only add the diagnostic center list if we're on the diagnostic centers tab
      if (activeTab === "diagnosticCenters") {
        // Add a floating panel with diagnostic center list
        const diagnosticListContainer = document.createElement("div")
        diagnosticListContainer.className = "floating-top-left diagnostic-list-container"
        diagnosticListContainer.innerHTML = `
  <h2 class="section-title">Nearby Diagnostic Centers</h2>
  
  <div id="diagnosticCentersList" class="hospital-list">
    ${window.diagnosticCenterMarkers
      .map(
        (center) => `
      <div class="hospital-list-item diagnostic-list-item" data-distance="${center.distance}">
        <h3>${center.name}</h3>
        <p><strong>Distance:</strong> ${center.distance} km</p>
        <p><strong>Rating:</strong> ${center.rating}/5.0</p>
        <div class="services-list">
          <p><strong>Services:</strong></p>
          <div class="services-tags">
            ${center.services.map((service) => `<span class="service-tag">${service}</span>`).join("")}
          </div>
        </div>
        <div class="diagnostic-actions">
          <button class="button button-primary button-small" data-action="getDirections" data-center="${center.name}">
            Get Directions
          </button>
          <button class="button button-secondary button-small" data-action="bookTest" data-center="${center.name}">
            Book Test
          </button>
        </div>
      </div>
    `,
      )
      .join("")}
  </div>
`

// Now add the event listener for the slider after appending the container to the DOM
document.querySelector(".main-content").appendChild(diagnosticListContainer)

// Add event listener to the distance filter slider
const distanceSlider = document.getElementById("distanceFilter")
if (distanceSlider) {
  distanceSlider.addEventListener("input", function() {
    const maxDistance = Number.parseFloat(this.value)
    document.getElementById("distanceValue").textContent = maxDistance.toFixed(1)
    
    // Filter the diagnostic centers based on distance
    const centerItems = document.querySelectorAll(".diagnostic-list-item")
    centerItems.forEach(item => {
      const distance = Number.parseFloat(item.getAttribute("data-distance"))
      if (distance <= maxDistance) {
        item.style.display = "block"
      } else {
        item.style.display = "none"
      }
    })
  })
}
   
  }
    }
    catch (error) {
      console.error("Error rendering diagnostic centers:", error)
    }
  }
}
