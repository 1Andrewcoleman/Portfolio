<?php
if($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];
    $to = 'andrewc31@icloud.com'; // Your email address
    $subject = 'New Message From Website';

    $body = "";
    $body .= "From: ".$name. "\r\n";
    $body .= "Email: ".$email. "\r\n";
    $body .= "Message: ".$message. "\r\n";

    // Headers
    $headers = "From: ".$email;

    if(mail($to, $subject, $body, $headers)) {
        echo 'Email has been sent to '.$to;
    } else {
        echo 'There was a problem sending the email.';
    }
}
?>
