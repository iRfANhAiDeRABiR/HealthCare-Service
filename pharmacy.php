<?php
require_once 'config/database.php';

// Fetch products from database
try {
    $pdo = getConnection();
    $stmt = $pdo->query("SELECT * FROM products ORDER BY id");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    $products = [];
    $error = "Error fetching products: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HealthCare Service Bangladesh</title>
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4 header-container">
                <h1 class="text-2xl font-bold text-gray-900"><a href="index.html"style="text-decoration: none; color: inherit;">HealthCare Service Bangladesh</a></h1>
                <div class="relative">
                    <button class="btn btn-outline btn-sm cart-button" onclick="handleCheckout()">
                        <i class="fas fa-shopping-bag"></i>
                        <span class="cart-count">0</span>
                        Items
                    </button>
                </div>
            </div>
        </div>

        <!-- Products Grid -->
        <div class="max-w-7xl mx-auto px-4 py-8">
            <?php if (isset($error)): ?>
                <div class="error-message">
                    <p><?php echo $error; ?></p>
                </div>
            <?php endif; ?>
            
            <div class="products-grid" id="productsContainer">
                <?php foreach ($products as $product): ?>
                    <div class="card">
                        <?php if ($product['is_special_offer']): ?>
                            <div class="special-offer-badge">
                                <span class="badge badge-red">SPECIAL OFFER</span>
                            </div>
                        <?php endif; ?>
                        
                        <div class="card-content">
                            <div class="product-image-container">
                                <img src="<?php echo htmlspecialchars($product['image']); ?>" 
                                     alt="<?php echo htmlspecialchars($product['name']); ?>" 
                                     class="product-image"
                                     onerror="this.src='assets/images/placeholder.svg'">
                            </div>
                            
                            <h3 class="product-title"><?php echo htmlspecialchars($product['name']); ?></h3>
                            
                            <div class="medicine-info">
                                <div class="category-manufacturer">
                                    <span class="category-badge"><?php echo htmlspecialchars($product['category']); ?></span>
                                    <span class="manufacturer-text"><?php echo htmlspecialchars($product['manufacturer']); ?></span>
                                </div>
                            </div>
                            
                            <div class="price-info">
                                <div class="price-row">
                                    <span class="text-xs text-gray-500">MRP</span>
                                    <span class="text-xs text-gray-500 line-through">৳<?php echo number_format($product['mrp'], 2); ?></span>
                                    <span class="text-xs text-green-600 font-medium"><?php echo $product['discount']; ?>% off</span>
                                </div>
                                <div class="product-price">৳<?php echo number_format($product['price'], 2); ?></div>
                            </div>
                            
                            <button class="btn btn-sm add-to-bag-btn" 
                                    data-id="<?php echo $product['id']; ?>"
                                    data-name="<?php echo htmlspecialchars($product['name']); ?>"
                                    data-price="<?php echo $product['price']; ?>"
                                    data-mrp="<?php echo $product['mrp']; ?>"
                                    onclick="addToCart(this)">
                                + Add to Cart
                            </button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Checkout Modal -->
        <div id="checkoutModal" class="modal-overlay" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🛒 Checkout - Delivery Information</h2>
                    <button class="close-btn" onclick="closeCheckoutModal()">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="order-summary">
                        <h3>Order Summary</h3>
                        <div id="orderItems"></div>
                        <div class="total-section">
                            <div class="total-row">
                                <span>Total MRP:</span>
                                <span id="totalMRP">৳0</span>
                            </div>
                            <div class="total-row savings">
                                <span>Total Savings:</span>
                                <span id="totalSavings">৳0</span>
                            </div>
                            <div class="total-row">
                                <span>Delivery Charge:</span>
                                <span id="deliveryCharge">৳60</span>
                            </div>
                            <div class="total-row final">
                                <span>Final Amount:</span>
                                <span id="finalAmount">৳0</span>
                            </div>
                            <div class="delivery-info">
                                <small>🚚 Free delivery on orders above ৳500</small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="delivery-form">
                        <h3>Delivery Information</h3>
                        <form id="deliveryForm" method="POST" action="process_order.php">
                            <input type="hidden" id="cartData" name="cart_data">
                            
                            <div class="form-group">
                                <label for="customerName">Full Name *</label>
                                <input type="text" id="customerName" name="customer_name" required 
                                       placeholder="Enter your full name">
                            </div>
                            
                            <div class="form-group">
                                <label for="phoneNumber">Phone Number *</label>
                                <input type="tel" id="phoneNumber" name="phone_number" required 
                                       placeholder="01XXXXXXXXX" pattern="01[0-9]{9}">
                                <small>Enter 11-digit Bangladeshi mobile number</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="division">Division *</label>
                                <select id="division" name="division" required>
                                    <option value="">Select Division</option>
                                    <option value="Dhaka">Dhaka</option>
                                    <option value="Chittagong">Chittagong</option>
                                    <option value="Rajshahi">Rajshahi</option>
                                    <option value="Khulna">Khulna</option>
                                    <option value="Barisal">Barisal</option>
                                    <option value="Sylhet">Sylhet</option>
                                    <option value="Rangpur">Rangpur</option>
                                    <option value="Mymensingh">Mymensingh</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="district">District *</label>
                                <input type="text" id="district" name="district" required 
                                       placeholder="Enter your district">
                            </div>
                            
                            <div class="form-group">
                                <label for="address">Full Address *</label>
                                <textarea id="address" name="address" required rows="3" 
                                          placeholder="House/Flat No, Road, Area, Thana/Upazila"></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="landmark">Landmark (Optional)</label>
                                <input type="text" id="landmark" name="landmark" 
                                       placeholder="Near mosque, school, market etc.">
                            </div>
                            
                            <div class="form-group">
                                <label for="deliveryTime">Preferred Delivery Time</label>
                                <select id="deliveryTime" name="delivery_time">
                                    <option value="anytime">Anytime (9 AM - 9 PM)</option>
                                    <option value="morning">Morning (9 AM - 12 PM)</option>
                                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                                    <option value="evening">Evening (5 PM - 9 PM)</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="specialInstructions">Special Instructions (Optional)</label>
                                <textarea id="specialInstructions" name="special_instructions" rows="2" 
                                          placeholder="Any special delivery instructions"></textarea>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="closeCheckoutModal()">Cancel</button>
                    <button type="button" class="btn-primary" onclick="confirmOrder()">Confirm Order</button>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="bg-white border-t mt-16">
            <div class="max-w-7xl mx-auto px-4 py-8">
                <div class="footer-grid">
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-4">About HealthCare Service</h3>
                        <p class="text-sm text-gray-600">
                            Your trusted partner for premium health medicines and wellness products in Bangladesh.
                        </p>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-4">Categories</h3>
                        <ul class="space-y-2 text-sm text-gray-600">
                            <li>Pain Relief</li>
                            <li>Cardiovascular</li>
                            <li>Diabetes</li>
                            <li>Antibiotics</li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-4">Customer Service</h3>
                        <ul class="space-y-2 text-sm text-gray-600">
                            <li><a href="contact.php">Contact Us</a></li>
                            <li><a href="orders.php">Track Orders</a></li>
                            <li>FAQ</li>
                            <li>Returns</li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-4">Connect</h3>
                        <ul class="space-y-2 text-sm text-gray-600">
                            <li>Newsletter</li>
                            <li>Social Media</li>
                            <li>Blog</li>
                            <li>Reviews</li>
                        </ul>
                    </div>
                </div>
                <div class="border-t mt-8 pt-8 text-center text-sm text-gray-600">
                    <p>&copy; 2025 HealthCare Service Bangladesh. All rights reserved.</p>
                </div>
            </div>
        </footer>
    </div>

    <script src="assets/js/script.js"></script>
</body>
</html>