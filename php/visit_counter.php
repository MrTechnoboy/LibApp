<?php
// visit_counter.php

// Check if visit_count cookie exists
if (isset($_COOKIE['visit_count'])) {
    // Increment the visit_count value
    $visitCount = intval($_COOKIE['visit_count']) + 1;
} else {
    // If cookie does not exist, it's the first visit
    $visitCount = 1;
}

// Set the updated visit count in a cookie (expires in 30 days)
setcookie('visit_count', $visitCount, time() + (3600 * 24),"/",$_SERVER['HTTP_HOST'],true,true); // 1 day expiration

// Return the visit count as a JSON response
header("Content-Type: application/json");
echo json_encode(["visitCount" => $visitCount]);
?>