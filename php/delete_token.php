<?php
// Идентификатор приложения
$client_id = '0dadfccaebe64f61a6d09879d0ecf2a9'; 
// Пароль приложения
$client_secret = 'ef9b83cefa254b51976e10ccedad7b12';

$query = array(
    'access_token'  => $_GET['access_token'],
    'client_id'     => $client_id,
    'client_secret' => $client_secret,
    'device_id'     => $_GET['device_id'],
    'device_name'   => 'qwe'
  );

$query = http_build_query($query);
//Формирование заголовков POST-запроса
$header = "Content-type: application/x-www-form-urlencoded";

// Выполнение POST-запроса и вывод результата
$opts = array('http' =>
                array(
                    'method'  => 'POST',
                    'header'  => $header,
                    'content' => $query
                ) 
        );

$context  = stream_context_create($opts);

$tokenInfo = file_get_contents('https://oauth.yandex.ru/revoke_token', false, $context);

$tokenInfo = json_decode($tokenInfo, true);

echo json_encode($tokenInfo);