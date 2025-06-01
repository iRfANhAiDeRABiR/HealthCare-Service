<?php
require_once 'config/database.php';

// Initialize variables
$ambulances = [];
$divisions = [];
$serviceTypes = [];
$error = '';

// Get filter parameters
$searchTerm = isset($_GET['search']) ? sanitize($_GET['search']) : '';
$divisionFilter = isset($_GET['division']) ? sanitize($_GET['division']) : '';
$districtFilter = isset($_GET['district']) ? sanitize($_GET['district']) : '';
$serviceTypeFilter = isset($_GET['service_type']) ? sanitize($_GET['service_type']) : '';
$availabilityFilter = isset($_GET['availability']) ? sanitize($_GET['availability']) : '';
$sortBy = isset($_GET['sort']) ? sanitize($_GET['sort']) : 'service_name';
$sortOrder = isset($_GET['order']) && strtolower($_GET['order']) === 'desc' ? 'DESC' : 'ASC';

try {
    $pdo = getConnection();
    
    // Get unique divisions for filter dropdown
    $stmt = $pdo->query("SELECT DISTINCT division FROM ambulance_services ORDER BY division");
    $divisions = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Get unique service types for filter dropdown
    $stmt = $pdo->query("SELECT DISTINCT service_type FROM ambulance_services ORDER BY service_type");
    $serviceTypes = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Build the main query
    $query = "SELECT * FROM ambulance_services WHERE 1=1";
    $params = [];
    
    // Add search filter
    if (!empty($searchTerm)) {
        $query .= " AND (service_name LIKE ? OR address LIKE ? OR district LIKE ? OR area LIKE ? OR contact_person LIKE ?)";
        $searchParam = "%$searchTerm%";
        $params = array_merge($params, [$searchParam, $searchParam, $searchParam, $searchParam, $searchParam]);
    }
    
    // Add division filter
    if (!empty($divisionFilter)) {
        $query .= " AND division = ?";
        $params[] = $divisionFilter;
    }
    
    // Add district filter
    if (!empty($districtFilter)) {
        $query .= " AND district LIKE ?";
        $params[] = "%$districtFilter%";
    }
    
    // Add service type filter
    if (!empty($serviceTypeFilter)) {
        $query .= " AND service_type = ?";
        $params[] = $serviceTypeFilter;
    }
    
    // Add availability filter
    if (!empty($availabilityFilter)) {
        $query .= " AND availability = ?";
        $params[] = $availabilityFilter;
    }
    
    // Add sorting
    $allowedSortFields = ['service_name', 'division', 'district', 'service_type', 'rating', 'price_per_km'];
    if (in_array($sortBy, $allowedSortFields)) {
        $query .= " ORDER BY $sortBy $sortOrder";
    } else {
        $query .= " ORDER BY service_name ASC";
    }
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $ambulances = $stmt->fetchAll();
    
} catch (Exception $e) {
    $error = $e->getMessage();
}

// Function to get service type badge class
function getServiceTypeBadge($type) {
    $badges = [
        'basic' => 'badge-blue',
        'advanced' => 'badge-green',
        'icu' => 'badge-red',
        'neonatal' => 'badge-purple',
        'cardiac' => 'badge-orange'
    ];
    return $badges[$type] ?? 'badge-gray';
}

// Function to get availability badge class
function getAvailabilityBadge($availability) {
    $badges = [
        '24/7' => 'badge-green',
        'day_only' => 'badge-yellow',
        'emergency_only' => 'badge-red'
    ];
    return $badges[$availability] ?? 'badge-gray';
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ambulance Services in Bangladesh - HealthCare Service</title>
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .ambulance-header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 2rem 0;
            text-align: center;
        }
        
        .ambulance-header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .ambulance-header p {
            font-size: 1.125rem;
            opacity: 0.9;
        }
        
        .search-filters {
            background-color: white;
            padding: 1.5rem;
            margin: -1rem 1rem 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .filter-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        @media (min-width: 768px) {
            .filter-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        
        @media (min-width: 1024px) {
            .filter-grid {
                grid-template-columns: repeat(6, 1fr);
            }
        }
        
        .ambulance-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 1.5rem;
            padding: 0 1rem;
        }
        
        @media (min-width: 768px) {
            .ambulance-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        @media (min-width: 1024px) {
            .ambulance-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        
        .ambulance-card {
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .ambulance-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .card-header {
            background-color: #f8fafc;
            padding: 1rem;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .service-name {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }
        
        .service-badges {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        .badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .badge-blue { background-color: #dbeafe; color: #1e40af; }
        .badge-green { background-color: #d1fae5; color: #065f46; }
        .badge-red { background-color: #fee2e2; color: #b91c1c; }
        .badge-purple { background-color: #e9d5ff; color: #7c3aed; }
        .badge-orange { background-color: #fed7aa; color: #c2410c; }
        .badge-yellow { background-color: #fef3c7; color: #92400e; }
        .badge-gray { background-color: #f3f4f6; color: #374151; }
        
        .card-body {
            padding: 1rem;
        }
        
        .contact-info {
            margin-bottom: 1rem;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
        }
        
        .contact-item i {
            width: 16px;
            color: #6b7280;
        }
        
        .location-info {
            margin-bottom: 1rem;
        }
        
        .location-text {
            font-size: 0.875rem;
            color: #4b5563;
            line-height: 1.4;
        }
        
        .pricing-info {
            background-color: #f8fafc;
            padding: 0.75rem;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
        }
        
        .price-item {
            display: flex;
            justify-content: space-between;
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
        }
        
        .price-item:last-child {
            margin-bottom: 0;
        }
        
        .rating-section {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .stars {
            color: #fbbf24;
        }
        
        .rating-text {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .verified-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            background-color: #d1fae5;
            color: #065f46;
            padding: 0.25rem 0.5rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .card-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .btn-call {
            flex: 1;
            background-color: #dc2626;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            text-decoration: none;
            text-align: center;
            font-weight: 500;
            transition: background-color 0.2s ease;
        }
        
        .btn-call:hover {
            background-color: #b91c1c;
            color: white;
        }
        
        .btn-details {
            background-color: #6b7280;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.2s ease;
        }
        
        .btn-details:hover {
            background-color: #4b5563;
            color: white;
        }
        
        .no-results {
            text-align: center;
            padding: 3rem 1rem;
            color: #6b7280;
        }
        
        .emergency-banner {
            background-color: #fee2e2;
            border: 1px solid #fecaca;
            color: #b91c1c;
            padding: 1rem;
            margin: 1rem;
            border-radius: 0.5rem;
            text-align: center;
        }
        
        .emergency-banner strong {
            display: block;
            font-size: 1.125rem;
            margin-bottom: 0.5rem;
        }
        
        .stats-section {
            background-color: white;
            padding: 1.5rem;
            margin: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
        
        @media (min-width: 768px) {
            .stats-grid {
                grid-template-columns: repeat(4, 1fr);
            }
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            font-size: 1.5rem;
            font-weight: 700;
            color: #dc2626;
        }
        
        .stat-label {
            font-size: 0.875rem;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="ambulance-header">
        <div class="container">
            <h1><i class="fas fa-ambulance"></i> Ambulance Services</h1>
            <p>Find reliable ambulance services across Bangladesh</p>
        </div>
    </header>

    <!-- Emergency Banner -->
    <div class="emergency-banner">
        <strong><i class="fas fa-exclamation-triangle"></i> Emergency: Call 999</strong>
        For immediate emergency assistance, call the national emergency number 999
    </div>

    <!-- Statistics Section -->
    <div class="stats-section">
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number"><?php echo count($ambulances); ?></div>
                <div class="stat-label">Total Services</div>
            </div>
            <div class="stat-item">
                <div class="stat-number"><?php echo count($divisions); ?></div>
                <div class="stat-label">Divisions Covered</div>
            </div>
            <div class="stat-item">
                <div class="stat-number"><?php echo count(array_filter($ambulances, function($a) { return $a['availability'] === '24/7'; })); ?></div>
                <div class="stat-label">24/7 Services</div>
            </div>
            <div class="stat-item">
                <div class="stat-number"><?php echo count(array_filter($ambulances, function($a) { return $a['verified']; })); ?></div>
                <div class="stat-label">Verified Services</div>
            </div>
        </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters">
        <form method="GET" action="ambulance.php">
            <div class="filter-grid">
                <div>
                    <input type="text" name="search" placeholder="Search services..." 
                           value="<?php echo htmlspecialchars($searchTerm); ?>" class="form-input">
                </div>
                
                <div>
                    <select name="division" class="form-input">
                        <option value="">All Divisions</option>
                        <?php foreach ($divisions as $division): ?>
                            <option value="<?php echo htmlspecialchars($division); ?>" 
                                    <?php echo $divisionFilter === $division ? 'selected' : ''; ?>>
                                <?php echo htmlspecialchars($division); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <div>
                    <input type="text" name="district" placeholder="District..." 
                           value="<?php echo htmlspecialchars($districtFilter); ?>" class="form-input">
                </div>
                
                <div>
                    <select name="service_type" class="form-input">
                        <option value="">All Types</option>
                        <?php foreach ($serviceTypes as $type): ?>
                            <option value="<?php echo htmlspecialchars($type); ?>" 
                                    <?php echo $serviceTypeFilter === $type ? 'selected' : ''; ?>>
                                <?php echo htmlspecialchars(ucfirst($type)); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <div>
                    <select name="availability" class="form-input">
                        <option value="">All Availability</option>
                        <option value="24/7" <?php echo $availabilityFilter === '24/7' ? 'selected' : ''; ?>>24/7</option>
                        <option value="day_only" <?php echo $availabilityFilter === 'day_only' ? 'selected' : ''; ?>>Day Only</option>
                        <option value="emergency_only" <?php echo $availabilityFilter === 'emergency_only' ? 'selected' : ''; ?>>Emergency Only</option>
                    </select>
                </div>
                
                <div>
                    <select name="sort" class="form-input">
                        <option value="service_name" <?php echo $sortBy === 'service_name' ? 'selected' : ''; ?>>Name</option>
                        <option value="division" <?php echo $sortBy === 'division' ? 'selected' : ''; ?>>Division</option>
                        <option value="rating" <?php echo $sortBy === 'rating' ? 'selected' : ''; ?>>Rating</option>
                        <option value="price_per_km" <?php echo $sortBy === 'price_per_km' ? 'selected' : ''; ?>>Price</option>
                    </select>
                </div>
            </div>
            
            <div style="display: flex; gap: 0.5rem; justify-content: center;">
                <button type="submit" class="button button-primary">
                    <i class="fas fa-search"></i> Search
                </button>
                <a href="ambulance.php" class="button button-secondary">
                    <i class="fas fa-refresh"></i> Clear
                </a>
            </div>
        </form>
    </div>

    <!-- Results -->
    <main style="padding-bottom: 2rem;">
        <?php if ($error): ?>
            <div class="alert alert-error" style="margin: 1rem;">
                <?php echo $error; ?>
            </div>
        <?php endif; ?>

        <?php if (empty($ambulances)): ?>
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: #d1d5db;"></i>
                <h3>No ambulance services found</h3>
                <p>Try adjusting your search criteria or browse all services.</p>
            </div>
        <?php else: ?>
            <div class="ambulance-grid">
                <?php foreach ($ambulances as $ambulance): ?>
                    <div class="ambulance-card">
                        <div class="card-header">
                            <div class="service-name">
                                <?php echo htmlspecialchars($ambulance['service_name']); ?>
                                <?php if ($ambulance['verified']): ?>
                                    <span class="verified-badge">
                                        <i class="fas fa-check-circle"></i> Verified
                                    </span>
                                <?php endif; ?>
                            </div>
                            <div class="service-badges">
                                <span class="badge <?php echo getServiceTypeBadge($ambulance['service_type']); ?>">
                                    <?php echo htmlspecialchars(ucfirst($ambulance['service_type'])); ?>
                                </span>
                                <span class="badge <?php echo getAvailabilityBadge($ambulance['availability']); ?>">
                                    <?php echo htmlspecialchars(str_replace('_', ' ', ucfirst($ambulance['availability']))); ?>
                                </span>
                            </div>
                        </div>
                        
                        <div class="card-body">
                            <div class="contact-info">
                                <div class="contact-item">
                                    <i class="fas fa-phone"></i>
                                    <span><?php echo htmlspecialchars($ambulance['phone_primary']); ?></span>
                                </div>
                                <?php if ($ambulance['phone_secondary']): ?>
                                    <div class="contact-item">
                                        <i class="fas fa-phone"></i>
                                        <span><?php echo htmlspecialchars($ambulance['phone_secondary']); ?></span>
                                    </div>
                                <?php endif; ?>
                                <?php if ($ambulance['contact_person']): ?>
                                    <div class="contact-item">
                                        <i class="fas fa-user"></i>
                                        <span><?php echo htmlspecialchars($ambulance['contact_person']); ?></span>
                                    </div>
                                <?php endif; ?>
                            </div>
                            
                            <div class="location-info">
                                <div class="contact-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span class="location-text">
                                        <?php echo htmlspecialchars($ambulance['area'] . ', ' . $ambulance['district'] . ', ' . $ambulance['division']); ?>
                                    </span>
                                </div>
                            </div>
                            
                            <?php if ($ambulance['price_per_km'] || $ambulance['base_charge']): ?>
                                <div class="pricing-info">
                                    <?php if ($ambulance['base_charge']): ?>
                                        <div class="price-item">
                                            <span>Base Charge:</span>
                                            <span><strong>৳<?php echo number_format($ambulance['base_charge'], 0); ?></strong></span>
                                        </div>
                                    <?php endif; ?>
                                    <?php if ($ambulance['price_per_km']): ?>
                                        <div class="price-item">
                                            <span>Per KM:</span>
                                            <span><strong>৳<?php echo number_format($ambulance['price_per_km'], 0); ?></strong></span>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>
                            
                            <?php if ($ambulance['rating'] > 0): ?>
                                <div class="rating-section">
                                    <div class="stars">
                                        <?php 
                                        $rating = round($ambulance['rating']);
                                        for ($i = 1; $i <= 5; $i++) {
                                            echo $i <= $rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
                                        }
                                        ?>
                                    </div>
                                    <span class="rating-text">
                                        <?php echo number_format($ambulance['rating'], 1); ?> 
                                        (<?php echo $ambulance['total_reviews']; ?> reviews)
                                    </span>
                                </div>
                            <?php endif; ?>
                            
                            <div class="card-actions">
                                <a href="tel:<?php echo htmlspecialchars($ambulance['phone_primary']); ?>" class="btn-call">
                                    <i class="fas fa-phone"></i> Call Now
                                </a>
                                <a href="ambulance_details.php?id=<?php echo $ambulance['id']; ?>" class="btn-details">
                                    <i class="fas fa-info-circle"></i> Details
                                </a>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </main>

    <!-- Navigation -->
    <div style="text-align: center; padding: 2rem;">
        <a href="index.html" class="button button-secondary">
            <i class="fas fa-home"></i> Back to Home
        </a>
    </div>
</body>
</html>