<?php

$dataBasePointer = new PDO('mysql:host=localhost;dbname=photohub', 'root', '');

// Идентификатор приложения
$client_id = '0dadfccaebe64f61a6d09879d0ecf2a9';
// Пароль приложения
$client_secret = 'ef9b83cefa254b51976e10ccedad7b12';

// Если скрипт был вызван с указанием параметра "code" в URL,
// то выполняется запрос на получение токена

if (isset($_GET['code']))
{
    $device_id   = uniqid ();
    $device_name = 'qwe';

    // Формирование параметров (тела) POST-запроса с указанием кода подтверждения
    $query = array(
      'grant_type'    => 'authorization_code',
      'code'          => $_GET['code'],
      'client_id'     => $client_id,
      'client_secret' => $client_secret,
      'device_id'     => $device_id,
      'device_name'   => $device_name 
      );

    $query = http_build_query($query);

    // Формирование заголовков POST-запроса
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

    $tokenInfo = file_get_contents('https://oauth.yandex.ru/token', false, $context);

    $tokenInfo = json_decode($tokenInfo, true);
    // Инфорация о пользователе

    if (isset($tokenInfo['access_token'])) {
        $params = array(     
            'format'       => 'json',
            'oauth_token'  => $tokenInfo['access_token']
        );

        $userInfo = json_decode(file_get_contents('https://login.yandex.ru/info' . '?' . urldecode(http_build_query($params))), true);
        PutInDB($dataBasePointer, 'users', $userInfo['login']);
        
        $userInfo['access_token'] = $tokenInfo['access_token'];
        $userInfo['cur_url']      = $_SERVER['QUERY_STRING'];
        $userInfo['device_id']    = $device_id;        

        echo json_encode($userInfo);
    }
}

function PutInDB($pointerDB, $table, $value) {
    $query     = "INSERT IGNORE INTO $table SET `name` = :value";
	$resultArr = $pointerDB->prepare($query);
	$resultArr->execute(array('value' => $value));
}