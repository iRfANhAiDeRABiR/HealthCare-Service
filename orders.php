<?php
require_once 'config/database.php';

$orders = [];
$searchOrderId = '';

if (isset($_GET['search']) && !empty($_GET['order_id'])) {
    $searchOrderId = sanitize($_GET['order_id']);
    
    try {
        $pdo = getConnection();
        $stmt = $pdo->prepare("
            SELECT o.*, GROUP_CONCAT(oi.product_name SEPARATOR ', ') as products
            FROM orders o 
            LEFT JOIN order_items oi ON o.order_id = oi.order_id 
            WHERE o.order_id = ? 
            GROUP BY o.order_id
        ");
        $stmt->execute([$searchOrderId]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
        $error = "Error searching orders: " . $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Track Orders - HealthCare Service</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4 header-container">
                <h1 class="text-2xl font-bold text-gray-900">
                    <a href="pharmacy.php" style="text-decoration: none; color: inherit;">HealthCare Service</a>
                </h1>
                <div>
                    <a href="pharmacy.php" class="btn btn-outline btn-sm">Back to Shop</a>
                </div>
            </div>
        </div>

        <!-- Order Tracking -->
        <div class="max-w-4xl mx-auto px-4 py-8">
            <h2 class="text-xl font-bold mb-6">Track Your Order</h2>
            
            <!-- Search Form -->
            <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
                <form method="GET" action="">
                    <div class="flex gap-4">
                        <input type="text" 
                               name="order_id" 
                               placeholder="Enter your Order ID (e.g., BD1234567890123)" 
                               value="<?php echo htmlspecialchars($searchOrderId); ?>"
                               class="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
                        <button type="submit" name="search" class="btn btn-primary">Track Order</button>
                    </div>
                </form>
            </div>

            <!-- Order Results -->
            <?php if (isset($error)): ?>
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <?php echo $error; ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($orders)): ?>
                <?php foreach ($orders as $order): ?>
                    <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
                        <div class="border-b pb-4 mb-4">
                            <h3 class="text-lg font-semibold">Order #<?php echo htmlspecialchars($order['order_id']); ?></h3>
                            <p class="text-gray-600">Placed on <?php echo date('F j, Y g:i A', strtotime($order['created_at'])); ?></p>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 class="font-semibold mb-2">Customer Information</h4>
                                <p><strong>Name:</strong> <?php echo htmlspecialchars($order['customer_name']); ?></p>
                                <p><strong>Phone:</strong> <?php echo htmlspecialchars($order['phone_number']); ?></p>
                                
                                <h4 class="font-semibold mt-4 mb-2">Delivery Address</h4>
                                <p><?php echo htmlspecialchars($order['address']); ?></p>
                                <p><?php echo htmlspecialchars($order['district']); ?>, <?php echo htmlspecialchars($order['division']); ?></p>
                                <?php if ($order['landmark']): ?>
                                    <p><strong>Landmark:</strong> <?php echo htmlspecialchars($order['landmark']); ?></p>
                                <?php endif; ?>
                            </div>
                            
                            <div>
                                <h4 class="font-semibold mb-2">Order Status</h4>
                                <span class="status-badge status-<?php echo $order['status']; ?>">
                                    <?php echo ucfirst($order['status']); ?>
                                </span>
                                
                                <h4 class="font-semibold mt-4 mb-2">Order Summary</h4>
                                <p><strong>Products:</strong> <?php echo htmlspecialchars($order['products']); ?></p>
                                <p><strong>Total Amount:</strong> ৳<?php echo number_format($order['final_total'], 2); ?></p>
                                <p><strong>Delivery Time:</strong> <?php echo htmlspecialchars($order['delivery_time']); ?></p>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php elseif (isset($_GET['search'])): ?>
                <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    No order found with ID: <?php echo htmlspecialchars($searchOrderId); ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>