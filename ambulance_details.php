<?php
require_once 'config/database.php';

$ambulanceId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$ambulance = null;
$reviews = [];
$error = '';

if ($ambulanceId <= 0) {
    header('Location: ambulance.php');
    exit;
}

try {
    $pdo = getConnection();
    
    // Get ambulance details
    $stmt = $pdo->prepare("SELECT * FROM ambulance_services WHERE id = ?");
    $stmt->execute([$ambulanceId]);
    $ambulance = $stmt->fetch();
    
    if (!$ambulance) {
        header('Location: ambulance.php');
        exit;
    }
    
    // Get reviews
    $stmt = $pdo->prepare("
        SELECT * FROM ambulance_reviews 
        WHERE ambulance_id = ? 
        ORDER BY created_at DESC 
        LIMIT 10
    ");
    $stmt->execute([$ambulanceId]);
    $reviews = $stmt->fetchAll();
    
} catch (Exception $e) {
    $error = $e->getMessage();
}

// Handle review submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit_review'])) {
    try {
        $reviewerName = sanitize($_POST['reviewer_name'] ?? '');
        $reviewerPhone = sanitize($_POST['reviewer_phone'] ?? '');
        $rating = (int)($_POST['rating'] ?? 0);
        $reviewText = sanitize($_POST['review_text'] ?? '');
        $serviceDate = sanitize($_POST['service_date'] ?? '');
        
        if (empty($reviewerName) || $rating < 1 || $rating > 5) {
            throw new Exception('Please fill in all required fields with valid data');
        }
        
        // Insert review
        $stmt = $pdo->prepare("
            INSERT INTO ambulance_reviews (ambulance_id, reviewer_name, reviewer_phone, rating, review_text, service_date)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$ambulanceId, $reviewerName, $reviewerPhone, $rating, $reviewText, $serviceDate]);
        
        // Update ambulance rating
        $stmt = $pdo->prepare("
            UPDATE ambulance_services 
            SET rating = (SELECT AVG(rating) FROM ambulance_reviews WHERE ambulance_id = ?),
                total_reviews = (SELECT COUNT(*) FROM ambulance_reviews WHERE ambulance_id = ?)
            WHERE id = ?
        ");
        $stmt->execute([$ambulanceId, $ambulanceId, $ambulanceId]);
        
        header("Location: ambulance_details.php?id=$ambulanceId&review_added=1");
        exit;
        
    } catch (Exception $e) {
        $error = $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($ambulance['service_name']); ?> - Ambulance Details</title>
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .details-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }
        
        .details-header {
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            margin-bottom: 2rem;
        }
        
        .service-title {
            font-size: 2rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 1rem;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
        }
        
        @media (min-width: 1024px) {
            .details-grid {
                grid-template-columns: 2fr 1fr;
            }
        }
        
        .main-details {
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 2rem;
        }
        
        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .contact-card, .pricing-card, .equipment-card {
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
        }
        
        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #1e293b;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
            padding: 0.75rem;
            background-color: #f8fafc;
            border-radius: 0.375rem;
        }
        
        .contact-item i {
            width: 20px;
            color: #dc2626;
        }
        
        .call-button {
            display: block;
            width: 100%;
            background-color: #dc2626;
            color: white;
            padding: 1rem;
            border-radius: 0.375rem;
            text-decoration: none;
            text-align: center;
            font-weight: 600;
            margin-top: 1rem;
            transition: background-color 0.2s ease;
        }
        
        .call-button:hover {
            background-color: #b91c1c;
            color: white;
        }
        
        .info-section {
            margin-bottom: 2rem;
        }
        
        .info-title {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #1e293b;
        }
        
        .info-content {
            color: #4b5563;
            line-height: 1.6;
        }
        
        .equipment-list {
            list-style: none;
            padding: 0;
        }
        
        .equipment-list li {
            padding: 0.5rem 0;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .equipment-list li:last-child {
            border-bottom: none;
        }
        
        .equipment-list i {
            color: #10b981;
        }
        
        .reviews-section {
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            margin-top: 2rem;
        }
        
        .review-item {
            border-bottom: 1px solid #e2e8f0;
            padding: 1.5rem 0;
        }
        
        .review-item:last-child {
            border-bottom: none;
        }
        
        .review-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .reviewer-name {
            font-weight: 600;
            color: #1e293b;
        }
        
        .review-date {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .review-rating {
            color: #fbbf24;
            margin-bottom: 0.5rem;
        }
        
        .review-text {
            color: #4b5563;
            line-height: 1.6;
        }
        
        .review-form {
            background-color: #f8fafc;
            padding: 1.5rem;
            border-radius: 0.375rem;
            margin-top: 2rem;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        @media (min-width: 768px) {
            .form-row {
                grid-template-columns: 1fr 1fr;
            }
        }
        
        .rating-input {
            display: flex;
            gap: 0.25rem;
            margin-bottom: 1rem;
        }
        
        .rating-input input[type="radio"] {
            display: none;
        }
        
        .rating-input label {
            font-size: 1.5rem;
            color: #d1d5db;
            cursor: pointer;
            transition: color 0.2s ease;
        }
        
        .rating-input input[type="radio"]:checked ~ label,
        .rating-input label:hover {
            color: #fbbf24;
        }
        
        .alert {
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 0.375rem;
        }
        
        .alert-success {
            background-color: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        
        .alert-error {
            background-color: #fee2e2;
            color: #b91c1c;
            border: 1px solid #fecaca;
        }
    </style>
</head>
<body>
    <div class="details-container">
        <!-- Header -->
        <div class="details-header">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h1 class="service-title"><?php echo htmlspecialchars($ambulance['service_name']); ?></h1>
                <?php if ($ambulance['verified']): ?>
                    <span class="verified-badge">
                        <i class="fas fa-check-circle"></i> Verified Service
                    </span>
                <?php endif; ?>
            </div>
            
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <span class="badge badge-<?php echo getServiceTypeBadge($ambulance['service_type']); ?>">
                    <?php echo htmlspecialchars(ucfirst($ambulance['service_type'])); ?> Ambulance
                </span>
                <span class="badge badge-<?php echo getAvailabilityBadge($ambulance['availability']); ?>">
                    <?php echo htmlspecialchars(str_replace('_', ' ', ucfirst($ambulance['availability']))); ?>
                </span>
                <?php if ($ambulance['rating'] > 0): ?>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div class="stars" style="color: #fbbf24;">
                            <?php 
                            $rating = round($ambulance['rating']);
                            for ($i = 1; $i <= 5; $i++) {
                                echo $i <= $rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
                            }
                            ?>
                        </div>
                        <span><?php echo number_format($ambulance['rating'], 1); ?> (<?php echo $ambulance['total_reviews']; ?> reviews)</span>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Success/Error Messages -->
        <?php if (isset($_GET['review_added'])): ?>
            <div class="alert alert-success">
                Thank you for your review! It has been added successfully.
            </div>
        <?php endif; ?>
        
        <?php if ($error): ?>
            <div class="alert alert-error">
                <?php echo $error; ?>
            </div>
        <?php endif; ?>

        <!-- Main Content -->
        <div class="details-grid">
            <!-- Main Details -->
            <div class="main-details">
                <div class="info-section">
                    <h3 class="info-title">Service Description</h3>
                    <div class="info-content">
                        <?php echo $ambulance['description'] ? htmlspecialchars($ambulance['description']) : 'Professional ambulance service with trained medical staff.'; ?>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3 class="info-title">Location & Address</h3>
                    <div class="info-content">
                        <p><strong>Full Address:</strong> <?php echo htmlspecialchars($ambulance['address']); ?></p>
                        <p><strong>Area:</strong> <?php echo htmlspecialchars($ambulance['area']); ?></p>
                        <p><strong>District:</strong> <?php echo htmlspecialchars($ambulance['district']); ?></p>
                        <p><strong>Division:</strong> <?php echo htmlspecialchars($ambulance['division']); ?></p>
                    </div>
                </div>
                
                <?php if ($ambulance['equipment']): ?>
                    <div class="info-section">
                        <h3 class="info-title">Medical Equipment & Facilities</h3>
                        <ul class="equipment-list">
                            <?php 
                            $equipment = explode(',', $ambulance['equipment']);
                            foreach ($equipment as $item): 
                            ?>
                                <li>
                                    <i class="fas fa-check"></i>
                                    <?php echo htmlspecialchars(trim($item)); ?>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Sidebar -->
            <div class="sidebar">
                <!-- Contact Information -->
                <div class="contact-card">
                    <h3 class="card-title">Contact Information</h3>
                    
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <div>
                            <strong>Primary Phone</strong><br>
                            <?php echo htmlspecialchars($ambulance['phone_primary']); ?>
                        </div>
                    </div>
                    
                    <?php if ($ambulance['phone_secondary']): ?>
                        <div class="contact-item">
                            <i class="fas fa-phone"></i>
                            <div>
                                <strong>Secondary Phone</strong><br>
                                <?php echo htmlspecialchars($ambulance['phone_secondary']); ?>
                            </div>
                        </div>
                    <?php endif; ?>
                    
                    <?php if ($ambulance['email']): ?>
                        <div class="contact-item">
                            <i class="fas fa-envelope"></i>
                            <div>
                                <strong>Email</strong><br>
                                <?php echo htmlspecialchars($ambulance['email']); ?>
                            </div>
                        </div>
                    <?php endif; ?>
                    
                    <?php if ($ambulance['contact_person']): ?>
                        <div class="contact-item">
                            <i class="fas fa-user"></i>
                            <div>
                                <strong>Contact Person</strong><br>
                                <?php echo htmlspecialchars($ambulance['contact_person']); ?>
                            </div>
                        </div>
                    <?php endif; ?>
                    
                    <a href="tel:<?php echo htmlspecialchars($ambulance['phone_primary']); ?>" class="call-button">
                        <i class="fas fa-phone"></i> Call Now for Emergency
                    </a>
                </div>

                <!-- Pricing Information -->
                <?php if ($ambulance['price_per_km'] || $ambulance['base_charge']): ?>
                    <div class="pricing-card">
                        <h3 class="card-title">Pricing Information</h3>
                        
                        <?php if ($ambulance['base_charge']): ?>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>Base Charge:</span>
                                <strong>৳<?php echo number_format($ambulance['base_charge'], 0); ?></strong>
                            </div>
                        <?php endif; ?>
                        
                        <?php if ($ambulance['price_per_km']): ?>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>Per Kilometer:</span>
                                <strong>৳<?php echo number_format($ambulance['price_per_km'], 0); ?></strong>
                            </div>
                        <?php endif; ?>
                        
                        <small style="color: #6b7280; display: block; margin-top: 1rem;">
                            * Prices may vary based on distance and emergency type. Contact for exact quote.
                        </small>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Reviews Section -->
        <div class="reviews-section">
            <h3 class="card-title">Customer Reviews</h3>
            
            <?php if (empty($reviews)): ?>
                <p style="color: #6b7280; text-align: center; padding: 2rem;">
                    No reviews yet. Be the first to review this service!
                </p>
            <?php else: ?>
                <?php foreach ($reviews as $review): ?>
                    <div class="review-item">
                        <div class="review-header">
                            <span class="reviewer-name"><?php echo htmlspecialchars($review['reviewer_name']); ?></span>
                            <span class="review-date"><?php echo date('M j, Y', strtotime($review['created_at'])); ?></span>
                        </div>
                        
                        <div class="review-rating">
                            <?php 
                            for ($i = 1; $i <= 5; $i++) {
                                echo $i <= $review['rating'] ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
                            }
                            ?>
                        </div>
                        
                        <?php if ($review['review_text']): ?>
                            <div class="review-text">
                                <?php echo htmlspecialchars($review['review_text']); ?>
                            </div>
                        <?php endif; ?>
                        
                        <?php if ($review['service_date']): ?>
                            <small style="color: #6b7280;">
                                Service used on: <?php echo date('M j, Y', strtotime($review['service_date'])); ?>
                            </small>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
            
            <!-- Review Form -->
            <div class="review-form">
                <h4 style="margin-bottom: 1rem;">Add Your Review</h4>
                
                <form method="POST" action="">
                    <input type="hidden" name="submit_review" value="1">
                    
                    <div class="form-row">
                        <div>
                            <label for="reviewer_name">Your Name *</label>
                            <input type="text" id="reviewer_name" name="reviewer_name" required class="form-input">
                        </div>
                        <div>
                            <label for="reviewer_phone">Phone Number</label>
                            <input type="tel" id="reviewer_phone" name="reviewer_phone" class="form-input">
                        </div>
                    </div>
                    
                    <div>
                        <label>Rating *</label>
                        <div class="rating-input">
                            <?php for ($i = 5; $i >= 1; $i--): ?>
                                <input type="radio" id="star<?php echo $i; ?>" name="rating" value="<?php echo $i; ?>" required>
                                <label for="star<?php echo $i; ?>">★</label>
                            <?php endfor; ?>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label for="service_date">Service Date</label>
                        <input type="date" id="service_date" name="service_date" class="form-input">
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label for="review_text">Your Review</label>
                        <textarea id="review_text" name="review_text" rows="4" class="form-input" 
                                  placeholder="Share your experience with this ambulance service..."></textarea>
                    </div>
                    
                    <button type="submit" class="button button-primary">
                        <i class="fas fa-star"></i> Submit Review
                    </button>
                </form>
            </div>
        </div>

        <!-- Navigation -->
        <div style="text-align: center; margin-top: 2rem;">
            <a href="ambulance.php" class="button button-secondary">
                <i class="fas fa-arrow-left"></i> Back to Ambulance List
            </a>
        </div>
    </div>
</body>
</html>