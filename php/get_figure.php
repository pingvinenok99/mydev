<?php

header('Content-Type: application/json;charset=utf-8');

$dataBasePointer = new PDO('mysql:host=localhost;dbname=photohub', 'root', '');
$imageArr = GetImageFromDisk($dataBasePointer);

file_put_contents('../data/info.json', $imageArr);

print($imageArr);

/**
 * Проверяет, что это картинка
 */
function IsImage ($__nameFile) {
    return preg_match("/.*\.jpg/i", $__nameFile);
}

/**
 * Грузит картинки локально
 */
function GetLocalImages($pointerDB) {
    $directory = 'img/celebrities';
    $scanned_directory = array_diff(scandir('../'.$directory), array('..', '.'));
    $result = array();

    foreach ($scanned_directory as $value) {
        $temp = [];

        $pathToImg = $directory.'/'.$value;

        $temp['url']  = $pathToImg;
        $temp['name'] = preg_replace('/(.*)\.\w+$/i', '$1', $value);

        $result[] = $temp;
    }

    return $result;
}

/**
 * Возвращает масив путей до изображений в JSON формате
 */
function GetImageFromDisk($pointerDB) {

    $li_template = "<li class='box_img'>
                        <figure class='text-center'>
                            <div class='img-container thumbs thumbnail' onclick='showImg(this)'>
                                <img src='\$pathToImage' class='popoverqwe lightview' data-lightview-title='The title goes above the caption'>
                                    <div class='caption' >
                                        <span class='info'>\$tags</span>
                                    </div>
                            </div>
                            <figcaption class='painting-name h5 text-normal d-flex flex-justify-between'>
                                <span class='cell-4 offset-4'>\$nameImage</span>
                                <button class='button light mini rounded needAuthorized' onclick='createInfoBox(this, \$pathToTagsDB)'>Добавь тег!</button>
                            </figcaption>
                            <figcaption class='painting-input-new-tag'>
                                <span class='invalid_feedback'>Разрешен тег длинной 30 символов: a-z, A-Z, 0-9, '.' и '_'</span>
                            </figcaption>
                            <figcaption class='painting-rating needAuthorized'>
                                <input id='rating-events' data-role='rating' data-value='\$avgMark' data-round-func='round' data-star-color='yellow' data-on-star-click='addMark(arguments[0],\$pathToMarksDB)'>
                            </figcaption>
                            <figcaption class='painting-avg_rating'>Средняя оценка: <strong class='avgMark'>\$showAvgMark</strong>
                            </figcaption>
                        </figure>
                    </li>";

    $result = array(
        'header' => array('template' => $li_template), 
        'data' => []); 

    $images_info = GetLocalImages($pointerDB);
    
    //Сюда накидываются параметры для картинок
    foreach ($images_info as $image_info) {

        $avgMark = GetAvgMark($pointerDB, $image_info['url']);
        $tags    = GetImageTags($pointerDB, $image_info['url']);

        $temp = array(
                        "pathToImage"   => $image_info['url'],
                        "nameImage"     => $image_info['name'],
                        "tags"          => $tags,
                        'pathToTagsDB'  => '"'.$image_info['url'].'"',
                        'pathToMarksDB' => '"'.$image_info['url'].'"',
                        "avgMark"       => $avgMark,
                        "showAvgMark"   => $avgMark
                );
        
        PutInDB($pointerDB, 'images', $image_info['url']);

        array_push($result['data'], $temp);
    }

    return json_encode($result);
}

/**
 * Возвращает теги к картинке
 */
function GetImageTags($pointerDB, $image) {
    $query     = "SELECT DISTINCT t.name 
                    FROM tags t JOIN image_tags it ON (it.id_tags = t.id_tag)
                                JOIN images im ON (im.id_images = it.id_images)
                        WHERE im.name = :image";

	$resultArr = $pointerDB->prepare($query);
    $resultArr->execute(array('image' => $image));
    
    $result = $resultArr->fetchAll();

    $tagsArr = array();

    foreach ($result as $tags) {
        $tagsArr[] = $tags['name'];
    }

    return join(' ', $tagsArr);
}

/**
 * Возвращает среднюю оценку к картинке
 */
function GetAvgMark($pointerDB, $image) {
    $query     = "SELECT AVG(m.mark) FROM marks m 
                                        JOIN images im ON (im.id_images = m.id_images)
                                     WHERE im.name = :image
                                    GROUP BY im.name;";

    $resultArr = $pointerDB->prepare($query);
    $resultArr->execute(array('image' => $image));

    $result = $resultArr->fetchAll();

    return $result ? (int)$result[0]["0"] : 0;
}

/**
 * Функция добавление в таблицу
 */
function PutInDB($pointerDB, $table, $value) {
    $query     = "INSERT IGNORE INTO $table SET `name` = :value";
	$resultArr = $pointerDB->prepare($query);
	$resultArr->execute(array('value' => $value));
}