document.addEventListener("DOMContentLoaded", () => {
  // --- Data Definitions ---
 

  const menuCategories = [
    {
      id: "windows",
      name: "Microsoft Windows",
      icon: "🪟",
      subcategories: ["Windows 7", "Windows 8/8.1", "Windows 10", "Windows 11", "Windows Server"],
    },
    {
      id: "office",
      name: "Microsoft Office",
      icon: "📊",
      subcategories: [
        "Office 2010",
        "Office 2013",
        "Office 2016",
        "Office 2019",
        "Office 2021",
        "Office 2024",
        "Office 365",
      ],
    },
    {
      id: "project",
      name: "Microsoft Project",
      icon: "📋",
      subcategories: ["Project 2019", "Project 2021", "Project Professional", "Project Standard"],
    },
    {
      id: "visio",
      name: "Microsoft Visio",
      icon: "📊",
      subcategories: ["Visio 2019", "Visio 2021", "Visio Professional", "Visio Standard"],
    },
    {
      id: "access",
      name: "Microsoft Access",
      icon: "🗃️",
      subcategories: ["Access 2019", "Access 2021", "Access Runtime"],
    },
    {
      id: "outlook",
      name: "Microsoft Outlook",
      icon: "📧",
      subcategories: ["Outlook 2019", "Outlook 2021", "Outlook 365"],
    },
    {
      id: "visual-studio",
      name: "Microsoft Visual Studio",
      icon: "💻",
      subcategories: ["Visual Studio 2019", "Visual Studio 2022", "Visual Studio Code", "Visual Studio Professional"],
    },
    {
      id: "sql-server",
      name: "Microsoft SQL Server",
      icon: "🗄️",
      subcategories: ["SQL Server 2019", "SQL Server 2022", "SQL Server Express", "SQL Server Standard"],
    },
    {
      id: "power-bi",
      name: "Microsoft Power BI",
      icon: "📈",
      subcategories: ["Power BI Desktop", "Power BI Pro", "Power BI Premium"],
    },
    {
      id: "adobe",
      name: "Adobe Products",
      icon: "🎨",
      subcategories: [
        "Adobe Creative Cloud",
        "Adobe Photoshop",
        "Adobe Illustrator",
        "Adobe Premiere Pro",
        "Adobe After Effects",
      ],
    },
    {
      id: "autocad",
      name: "AutoCAD",
      icon: "📐",
      subcategories: ["AutoCAD 2024", "AutoCAD LT", "AutoCAD Architecture", "AutoCAD Electrical"],
    },
    {
      id: "antivirus",
      name: "Antivirus Software",
      icon: "🛡️",
      subcategories: ["Norton Antivirus", "McAfee", "Kaspersky", "Bitdefender", "Avast Premium"],
    },
  ]

  // --- Global State ---
  const cartItems = []
  let cartCount = 0
  let cartTotal = 0.0

  // --- Cart Functions ---
  function updateCartDisplay() {
    document.getElementById("cart-display").textContent = `${cartCount} item(s) - $${cartTotal.toFixed(2)}`
  }

  function addToCart(product, quantity = 1) {
    const existingItemIndex = cartItems.findIndex(
      (item) => item.id === product.id && item.category === product.category,
    )
    if (existingItemIndex > -1) {
      cartItems[existingItemIndex].quantity += quantity
    } else {
      cartItems.push({ ...product, quantity })
    }
    cartCount += quantity
    cartTotal += Number.parseFloat(product.price.replace("$", "")) * quantity
    updateCartDisplay()
    alert(`${quantity}x ${product.name} added to cart!`)
    console.log("Cart:", cartItems)
  }

  function buyNow(product, quantity = 1) {
    alert(`Proceeding to checkout with ${quantity}x ${product.name} - ${product.price}`)
    // In a real application, this would redirect to a checkout page
  }

  // --- Product Card Rendering Function ---
  function createProductCard(product, sectionConfig) {
    const card = document.createElement("div")
    card.className = "product-card"

    const badgeHtml = product.badge ? `<div class="product-badge ${product.badgeColor}">${product.badge}</div>` : ""

    // Use product.imageUrl if available, otherwise fallback to a generic placeholder
    const imageUrl = product.imageUrl || "/placeholder.svg?height=64&width=64"

    const logoHtml = `
          <div class="product-logo-circle">
              <img src="${imageUrl}" alt="${product.name} logo" class="product-logo-image" />
          </div>
      `

    const priceDisplay = product.originalPrice
      ? `<span class="product-price-discounted">${product.price}</span><span class="product-price-original">${product.originalPrice}</span>`
      : `<span class="product-price">${product.price}</span>`

    card.innerHTML = `
      ${badgeHtml}
      <div class="product-header ${sectionConfig.headerClass}">
          <h3>${sectionConfig.headerTitle(product)}</h3>
          <p>${sectionConfig.headerSubtitle(product)}</p>
          ${logoHtml}
          <div class="text-center">
              <p class="font-semibold">${product.license || product.duration}</p>
              <p class="text-sm opacity-90">${product.activation || product.devices || product.type || "Digital License"}</p>
          </div>
      </div>
      <div class="product-details-content">
          <h4>${sectionConfig.detailsTitle(product)}</h4>
          <div class="flex items-center space-x-2 mb-4">
              ${priceDisplay}
          </div>
          <div class="space-y-2 mb-3">
              <div class="flex items-center space-x-2">
                  <input type="number" value="1" min="1" class="quantity-input" id="quantity-${product.category.replace(/\s/g, "-")}-${product.id}">
                  <button class="add-to-cart-button" data-product-id="${product.id}" data-product-category="${product.category}">ADD TO CART</button>
              </div>
              <button class="buy-now-button" data-product-id="${product.id}" data-product-category="${product.category}">BUY NOW</button>
          </div>
          <div class="action-buttons">
              <div class="flex items-center space-x-2 action-button-group">
                  <button><i data-lucide="heart" class="icon-sm"></i></button>
                  <button><i data-lucide="bar-chart-3" class="icon-sm"></i></button>
              </div>
              <div class="flex items-center space-x-3 text-gray-500 action-links">
                  <button><i data-lucide="help-circle" class="icon-sm"></i><span>Question</span></button>
              </div>
          </div>
      </div>
  `

    // Attach event listeners
    const addToCartBtn = card.querySelector(".add-to-cart-button")
    const buyNowBtn = card.querySelector(".buy-now-button")
    const quantityInput = card.querySelector(`#quantity-${product.category.replace(/\s/g, "-")}-${product.id}`)

    addToCartBtn.addEventListener("click", () => {
      const quantity = Number.parseInt(quantityInput.value)
      addToCart(product, quantity)
    })

    buyNowBtn.addEventListener("click", () => {
      const quantity = Number.parseInt(quantityInput.value)
      buyNow(product, quantity)
    })

    return card
  }

  function renderProductSection(containerId, products, sectionTitle, sectionConfig) {
    const container = document.getElementById(containerId)
    if (!container) return

    let sectionHtml = `<section class="product-section">
          <h2 class="product-section-title">${sectionTitle}</h2>
          <div class="product-grid">`

    products.forEach((product) => {
      const card = createProductCard(product, sectionConfig)
      sectionHtml += card.outerHTML
    })

    sectionHtml += `</div></section>`
    container.innerHTML = sectionHtml

    // Re-attach event listeners after innerHTML update
    products.forEach((product) => {
      const cardElement = container
        .querySelector(`.product-card [data-product-id="${product.id}"][data-product-category="${product.category}"]`)
        .closest(".product-card")
      const addToCartBtn = cardElement.querySelector(".add-to-cart-button")
      const buyNowBtn = cardElement.querySelector(".buy-now-button")
      const quantityInput = cardElement.querySelector(`#quantity-${product.category.replace(/\s/g, "-")}-${product.id}`)

      addToCartBtn.addEventListener("click", () => {
        const quantity = Number.parseInt(quantityInput.value)
        addToCart(product, quantity)
      })
      buyNowBtn.addEventListener("click", () => {
        const quantity = Number.parseInt(quantityInput.value)
        buyNow(product, quantity)
      })
    })
  }

  // --- Mega Menu Functions ---
  const megaMenu = document.getElementById("mega-menu")
  const allProductsNavItem = document.getElementById("all-products-nav-item")
  const megaMenuCategoryList = document.getElementById("mega-menu-category-list")
  const megaMenuContent = document.getElementById("mega-menu-content")
  let activeCategory = "windows" // Default active category

  function renderMegaMenuCategories() {
    megaMenuCategoryList.innerHTML = ""
    menuCategories.forEach((category) => {
      const li = document.createElement("li")
      const button = document.createElement("button")
      button.className = `w-full text-left px-3 py-2 rounded-md flex items-center justify-between hover:bg-gray-200 transition-colors ${activeCategory === category.id ? "active" : ""}`
      button.innerHTML = `
              <div class="flex items-center">
                  <span class="mr-3 text-lg">${category.icon}</span>
                  <span class="text-sm font-medium">${category.name}</span>
              </div>
              <i data-lucide="chevron-right" class="icon-sm"></i>
          `
      button.addEventListener("mouseenter", () => {
        activeCategory = category.id
        renderMegaMenuCategories() // Re-render categories to update active state
        renderMegaMenuSubcategories()
      })
      li.appendChild(button)
      megaMenuCategoryList.appendChild(li)
    })
  }

  function renderMegaMenuSubcategories() {
    const activeCategoryData = menuCategories.find((cat) => cat.id === activeCategory)
    if (activeCategoryData) {
      let subcategoryHtml = `
              <h4 class="font-semibold text-lg text-gray-900 mb-4 flex items-center">
                  <span class="mr-2">${activeCategoryData.icon}</span>
                  ${activeCategoryData.name}
              </h4>
              <div class="grid grid-cols-2 gap-4">
          `
      activeCategoryData.subcategories.forEach((subcategory) => {
        subcategoryHtml += `
                  <button class="text-left p-3 rounded-md hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer">
                      <span class="text-sm text-gray-700 hover:text-blue-600">${subcategory}</span>
                  </button>
              `
      })
      subcategoryHtml += `</div>`
      megaMenuContent.innerHTML = subcategoryHtml

      // Attach click listeners to subcategory buttons
      megaMenuContent.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", (event) => {
          const subcategoryName = event.target.textContent.trim()
          console.log(`Clicked on subcategory: ${subcategoryName}`)
          // Add navigation logic here, e.g., window.location.href = `/products?category=${activeCategory}&subcategory=${subcategoryName}`;
        })
      })
    } else {
      megaMenuContent.innerHTML = '<p class="text-gray-500">Select a category to see subcategories.</p>'
    }
  }

  function openMegaMenu() {
    megaMenu.classList.add("open")
    renderMegaMenuCategories()
    renderMegaMenuSubcategories()
  }

  function closeMegaMenu() {
    megaMenu.classList.remove("open")
  }

  // --- Event Listeners for Mega Menu ---
  allProductsNavItem.addEventListener("mouseenter", openMegaMenu)
  megaMenu.addEventListener("mouseleave", closeMegaMenu)
  // To prevent immediate closing when moving from nav item to mega menu
  megaMenu.addEventListener("mouseenter", () => {
    // Do nothing, just keep it open
  })

  // --- Mobile Menu ---
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle")
  const mobileMenuSheet = document.getElementById("mobile-menu-sheet")
  const mobileMenuClose = document.getElementById("mobile-menu-close")

  mobileMenuToggle.addEventListener("click", () => {
    mobileMenuSheet.classList.add("open")
  })

  mobileMenuClose.addEventListener("click", () => {
    mobileMenuSheet.classList.remove("open")
  })

  // --- Carousel Logic ---
  const carouselTrack = document.getElementById("carousel-track")
  const carouselSlides = document.querySelectorAll(".carousel-slide")
  const carouselDotsContainer = document.getElementById("carousel-dots")
  let currentSlide = 0
  const slideIntervalTime = 5000 // 5 seconds

  function updateCarousel() {
    const offset = -currentSlide * 100
    carouselTrack.style.transform = `translateX(${offset}%)`
    updateCarouselDots()
  }

  function updateCarouselDots() {
    carouselDotsContainer.innerHTML = ""
    carouselSlides.forEach((_, index) => {
      const dot = document.createElement("div")
      dot.classList.add("carousel-dot")
      if (index === currentSlide) {
        dot.classList.add("active")
      }
      dot.addEventListener("click", () => {
        currentSlide = index
        updateCarousel()
      })
      carouselDotsContainer.appendChild(dot)
    })
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % carouselSlides.length
    updateCarousel()
  }

  // Auto-slide
  setInterval(nextSlide, slideIntervalTime)

  // --- Initial Render ---
  updateCartDisplay()
  updateCarousel() // Initialize carousel display

  renderProductSection("windows-section", windowsProducts, "Microsoft Windows", {
    headerClass: "windows-header",
    headerTitle: (p) => "Windows",
    headerSubtitle: (p) => `10/11 ${p.name.includes("Pro") ? "Pro" : "Home"}`,
    detailsTitle: (p) => `${p.name} 1PC [${p.activation}]`,
  })

  renderProductSection("windows-server-section", windowsServerProducts, "Microsoft Windows Server", {
    headerClass: "windows-server-header",
    headerTitle: (p) => "Windows",
    headerSubtitle: (p) => `Server ${p.name.includes("2022") ? "2022" : "2019"}`,
    detailsTitle: (p) => `${p.name} ${p.type} [${p.license}]`,
  })

  renderProductSection("office-section", officeProducts, "Microsoft Office", {
    headerClass: "office-header",
    headerTitle: (p) => "MS Office",
    headerSubtitle: (p) =>
      p.name.includes("365") ? "365 A3" : p.name.includes("2021 Pro Plus") ? "2021 Pro Plus" : "Home & Business 2021",
    detailsTitle: (p) =>
      p.name.includes("365")
        ? "Microsoft Office 365 A3 Account Valid for 5 Devices 1 Year"
        : p.name.includes("Home & Business")
          ? "Office 2021 Home & Business 1 MAC [BIND]"
          : `Office 2021 Pro Plus ${p.duration} [${p.devices}]`,
  })

  renderProductSection("project-visio-section", projectVisioProducts, "Microsoft Project & Visio", {
    headerClass: "project-visio-header",
    headerTitle: (p) => (p.name.includes("Project") ? "MS Project" : "MS Visio"),
    headerSubtitle: (p) => p.type,
    detailsTitle: (p) => `${p.name} ${p.subtitle} [${p.license}]`,
  })

  renderProductSection("adobe-autocad-section", adobeAutocadProducts, "Adobe & AutoCAD", {
    headerClass: (p) => (p.name.includes("Adobe") ? "adobe-header" : "autocad-header"),
    headerTitle: (p) => (p.name.includes("Adobe") ? "Adobe" : "AutoCAD"),
    headerSubtitle: (p) =>
      p.name.includes("Creative Cloud") ? "Creative Cloud" : p.name.includes("AutoCAD") ? "2024" : p.name.split(" ")[1],
    detailsTitle: (p) => `${p.name} ${p.subtitle} [${p.duration}]`,
  })

  renderProductSection("sql-visual-studio-section", sqlVisualStudioProducts, "Microsoft SQL Server & Visual Studio", {
    headerClass: (p) => (p.category === "SQL Server" ? "sql-header" : "visual-studio-header"),
    headerTitle: (p) => (p.category === "SQL Server" ? "SQL Server" : "Visual Studio"),
    headerSubtitle: (p) => (p.name.includes("2022") ? "2022" : "2019"),
    detailsTitle: (p) => `${p.name} ${p.subtitle} [${p.license}]`,
  })

  // --- Lucide Icons ---
  const lucide = {
    createIcons: () => {
      // Placeholder for Lucide icon creation logic
      console.log("Lucide icons created")
    },
  }

  // Re-create Lucide icons after all dynamic content is rendered
  lucide.createIcons()
})
