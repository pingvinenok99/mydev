<?php

$dataBasePointer = new PDO('mysql:host=localhost;dbname=photohub', 'root', '');

PutInDB($dataBasePointer, 'tags', $_GET['tag']);
PutTagsForImages($dataBasePointer, $_GET['image'], $_GET['tag']);

$result = array('result' => 'ok');
echo json_encode($result);

/**
 * Кладем информацию о картинке
 */
function PutTagsForImages($pointerDB, $images, $tag) {
    $query     = "INSERT INTO image_tags VALUES ((SELECT id_images FROM images WHERE name = :image), (SELECT id_tag FROM tags WHERE name = :tag))";

	$resultArr = $pointerDB->prepare($query);
	$resultArr->execute(array('image' => $images, 'tag' => $tag));
}

/**
 * Функция кладет информацию в базу
 */
function PutInDB($pointerDB, $table, $value) {
    $query     = "INSERT IGNORE INTO $table SET `name` = :value";
    
	$resultArr = $pointerDB->prepare($query);
	$resultArr->execute(array('value' => $value));
}
