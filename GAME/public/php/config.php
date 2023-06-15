<?php
$envFile = '../.env';
if (file_exists($envFile)) {
    $envVariables = parse_ini_file($envFile);
    if ($envVariables) {
        foreach ($envVariables as $key => $value) {
            putenv("$key=$value");
        }
    }
} else {
    die('.env file not found');
}
?>