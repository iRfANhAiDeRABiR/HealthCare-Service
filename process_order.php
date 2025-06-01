<?php
require_once 'config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get form data
    $customerName = sanitize($_POST['customer_name'] ?? '');
    $phoneNumber = sanitize($_POST['phone_number'] ?? '');
    $division = sanitize($_POST['division'] ?? '');
    $district = sanitize($_POST['district'] ?? '');
    $address = sanitize($_POST['address'] ?? '');
    $landmark = sanitize($_POST['landmark'] ?? '');
    $deliveryTime = sanitize($_POST['delivery_time'] ?? 'anytime');
    $specialInstructions = sanitize($_POST['special_instructions'] ?? '');
    $cartData = json_decode($_POST['cart_data'] ?? '[]', true);

    // Validate required fields
    if (empty($customerName) || empty($phoneNumber) || empty($division) || 
        empty($district) || empty($address) || empty($cartData)) {
        throw new Exception('All required fields must be filled');
    }

    // Validate phone number
    if (!validatePhoneNumber($phoneNumber)) {
        throw new Exception('Invalid phone number format');
    }

    // Calculate totals
    $totalMRP = 0;
    $totalAmount = 0;
    
    foreach ($cartData as $item) {
        $totalMRP += floatval($item['mrp']);
        $totalAmount += floatval($item['price']);
    }
    
    $totalSavings = $totalMRP - $totalAmount;
    $deliveryCharge = $totalAmount >= 500 ? 0 : 60;
    $finalTotal = $totalAmount + $deliveryCharge;

    // Generate order ID
    $orderId = 'BD' . time() . rand(100, 999);

    // Start transaction
    $pdo = getConnection();
    $pdo->beginTransaction();

    // Insert order
    $stmt = $pdo->prepare("
        INSERT INTO orders (
            order_id, customer_name, phone_number, division, district, address, 
            landmark, delivery_time, special_instructions, total_mrp, total_amount, 
            total_savings, delivery_charge, final_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $orderId, $customerName, $phoneNumber, $division, $district, $address,
        $landmark, $deliveryTime, $specialInstructions, $totalMRP, $totalAmount,
        $totalSavings, $deliveryCharge, $finalTotal
    ]);

    // Insert order items
    $stmt = $pdo->prepare("
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity) 
        VALUES (?, ?, ?, ?, ?)
    ");
    
    foreach ($cartData as $item) {
        $stmt->execute([
            $orderId, 
            intval($item['id']), 
            $item['name'], 
            floatval($item['price']), 
            1
        ]);
    }

    // Commit transaction
    $pdo->commit();

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Order placed successfully!',
        'order_id' => $orderId,
        'final_total' => $finalTotal
    ]);

} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($pdo)) {
        $pdo->rollback();
    }
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>