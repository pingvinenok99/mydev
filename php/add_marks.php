<?php

$dataBasePointer = new PDO('mysql:host=localhost;dbname=photohub', 'root', '');

PutMarksForImages($dataBasePointer, $_GET['login'], $_GET['image'], $_GET['mark']);

echo json_encode(GetAvgMark($dataBasePointer, $_GET['image']));

/**
 * Добавляем или изменяем оценку пользователя о картинке
 */
function PutMarksForImages($pointerDB, $login, $image, $mark) {
    $query     = "INSERT INTO marks VALUES ((SELECT id_images FROM images WHERE name = :image),
                                                 (SELECT id_user FROM users WHERE name = :login),
                                                 :mark) 
                                ON DUPLICATE KEY UPDATE id_images = (SELECT id_images FROM images WHERE name = :image),
                                                        id_user = (SELECT id_user FROM users WHERE name = :login),
                                                        mark = :mark ;";

	$resultArr = $pointerDB->prepare($query);
    $resultArr->execute(array('login' => $login, 'image' => $image, 'mark' => $mark));
}

/**
 * Получаем среднюю оценку изображения
 */
function GetAvgMark($pointerDB, $image) {
    $query     = "SELECT AVG(m.mark) FROM marks m 
                                        JOIN images im ON (im.id_images = m.id_images)
                                     WHERE im.name = :image
                                    GROUP BY im.name;";

    $resultArr = $pointerDB->prepare($query);
    $resultArr->execute(array('image' => $image));

    $result = $resultArr->fetchAll();

    return $result ? array('avg' => (int)$result[0]["0"]) : 0;
}
