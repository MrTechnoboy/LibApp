<?php
// Handle preflight requests for CORS (if any)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: https://applib.free.nf");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    http_response_code(204); // No Content
    exit;
}

// Enable CORS for all origins (you can restrict this later if needed)
header("Access-Control-Allow-Origin: https://applib.free.nf");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Visit counter logic
if (isset($_COOKIE['visit_count'])) {
    $visitCount = intval($_COOKIE['visit_count']) + 1; // Increment counter
} else {
    $visitCount = 1; // First-time visitor
}

// Set a cookie to store the current counter
setcookie('visit_count', $visitCount, time() + (3600 * 24), "/", "", false, true); // Cookie valid for 1 day

// Respond with the updated visit count
echo json_encode([
    "visitCount" => $visitCount
]);
?>