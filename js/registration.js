/**
 * Возвращает GET-параметры
 */
function getGetParam() {
    return window
    .location
    .search
    .replace('?','')
    .split('&')
    .reduce(
        function(p,e){
            var a = e.split('=');
            p[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
            return p;
        },
        {}
    );
}

/**
 * Функция подгружает картинки
 */
function getImages() {
    $.ajax({
        type: 'POST',
        url: './php/get_figure.php',
        dataType: 'json',
        cache: false,
        async: false,
        beforeSend: function(){
            console.log('Грузим картинки. Ждите ответа.');
            },
        success: function(info_json) {
            console.log('Картинки загружены');
            },
        error:  function(xhr, str){
            //alert('Возникла ошибка: ' + xhr.responseCode + ", " + str);
            }
    });
}

/**
 * Получаем информацию о пользователе Яндекс
 */
function getInfoUser(userCode) {
    return $.ajax({
        type: 'GET',
        data: {code: userCode}, 
        url: './php/get_token.php',
        dataType: 'text',
        async: false,
        cache: false,
        beforeSend: function(){
            console.log('Получаем токен. Ждите ответа.');
            },
        success: function(info_person) {
            try {
                var output = JSON.parse(info_person);
                $('.welcome_cell').html(getExitButton(output['login']));
            } catch (e) {
                //alert("Output is not valid JSON: " + info_person);
            }

            return output;
            },
        error:  function(xhr, str){
            alert('Возникла ошибка: ' + xhr.responseCode + ", " + str);
            }
    });
}

/**
 * Кнопка выхода из аккаунта
 */
function getExitButton(login) {
    return '<div> \
                <h4 class="text-light mt-3 mr-4">Добро пожаловать, <strong>' + login + '</strong></h4> \
            </div>  \
            <div> \
                <a href="https://photohub2019.ru" onclick="delete_token()" class="brand"> \
                    <h5 class="text-light mr-3 mt-2">Выход</h5> \
                    <img src="img/icons/white_exit.png" alt="" width="30" height="32"> \
                </a> \
            </div>';
}

/**
 * Код кнопки авторизации
 */
function getAuthorizedButton() {
    return '<button class="brand" id="collapse_toggle_2" onclick="showWinAuthorization()" > \
                <h5 class="text-light mt-2 mr-4">Авторизация</h5> \
                <img src="img/icons/white_enter.png" alt="" width="28" height="30"> \
            </button>';
}

/**
 * Удаляет токен пользователя
 */
function delete_token() {
    info_person = $.cookie('user');
    info_person = info_person.split(';');

    $.ajax({
        type: 'GET',
        data: {access_token: info_person[1], device_id: info_person[2]}, 
        url: './php/delete_token.php',
        dataType: 'json',
        cache: false,
        beforeSend: function(){
            console.log('Удаляем пользователя');
            },
        success: function(info_json) {
            $('.welcome_cell').html(getAuthorizedButton());
            },
        error:  function(xhr, str){
            alert('Возникла ошибка: ' + xhr.responseCode + ", " + str);
            }
    });

    $.removeCookie('user');
}

/**
 * Проверка на авторизацию пользователя
 */
function isAuthorized() {
    return 'user' in $.cookie();
}

/**
 * Действия, до загрузки страцницы
 */
function loadPage() {

    if (isAuthorized()) {
        console.log($.cookie('user'));
        info_person = $.cookie('user').split(';');
        
        $('.welcome_cell').html(getExitButton(info_person[0]));
    }
    else { 
        // Считываем код с GET-параметра
        paramGET = getGetParam();

        var userInfo = '';

        if ('code' in paramGET) {
            console.log(paramGET['code']);

            informationUser = getInfoUser(paramGET['code']);
            userInfo = JSON.parse(informationUser.responseText);
            cookie = $.cookie('user', [userInfo['login'], userInfo['access_token'], userInfo['device_id']].join(';'), { expires: 7 });
        }
    }
    
    console.log($.cookie());
    console.log(userInfo);

    // Грузим картинки
    getImages();
}

document.addEventListener("DOMContentLoaded", loadPage());

/**
 * Меняем функционал стандартных имен из Metro 4
 */
$(document).ready(function() {

    $(".list-top").addClass("cell-2 offset-5")
    $(".select .prepend").text('Показать:')
    
    $(".list-bottom").addClass("ml-10")
    $(".list-info").addClass("text-light")
    
    $(".tag-input").on("click", ".remover", function(){
        $('.images').data('list').draw();
    });

    // Проверяем на авторизацию
    if (isAuthorized()) {
        $(".needAuthorized").show();
    } else {
        $(".needAuthorized").hide();
    }
});

/**
 * Добавление окна регистрации
 */
function showWinRegistration() {
    registrationContent = getRegistrationContent();
    $('#authorized').replaceWith(registrationContent);

    function getRegistrationContent() {
        return '<div id="registration" \
                    <div class="cell-4 offset-4 border bd-cyan border-radius-4 bg-white pl-3 pt-3 pr-3 pb-3 fg-dark"> \
                    <form data-role="validator"> \
                        <h2 class="text-light">Регистрация</h2> \
                        <hr class="thin"/> \
                        <div class="form-group" onclick="showToastsError()"> \
                            <label>Логин</label> \
                            <input type="text" disabled data-validate="required minlength=6" placeholder="Придумайте логин"/> \
                            <small>Логин должен быть больше 6 символов</small> \
                        </div> \
                        <div class="form-group" onclick="showToastsError()"> \
                            <label>Введите пароль</label> \
                            <input type="password" disabled data-validate="required" name="pass1"/> \
                        </div> \
                        <div class="form-group" onclick="showToastsError()"> \
                            <label>Повторите пароль</label> \
                            <input type="password" disabled data-validate="required compare=pass1" name="pass2"/> \
                            <span class="invalid_feedback">Пароли не совпадают</span> \
                        </div> \
                        <div class="form-group row pl-3 pr-3"> \
                            <div class="row"><div class="cell"> \
                                <button disabled onclick="showToastsError()" class="button success">Регистрация</button> \
                            </div> \
                            <div class="cell d-flex flex-row-r"> \
                                <input type="button" class="button d-flex flex-row-r" onclick="showWinAuthorization()" value="Назад"> \
                            </div> \
                        </div> \
                        </form> \
                    </div> \
                </div>';
    }
}

/**
 * Добавление окна авторизации
 */
function showWinAuthorization() {
    authorizationContent = getAuthorizationContent()
    $('#registration').replaceWith(authorizationContent)

    function getAuthorizationContent() {
        return '<div id="authorized"> \
            <div class="cell-4 offset-4 border bd-cyan border-radius-4 \
                bg-white pl-3 pt-3 pr-3 pb-3 fg-dark"> \
                <form> \
                    <h2 class="text-light">Вход</h2> \
                    <hr class="thin" /> \
                    <div class="form-group" onclick="showToastsError()"><label>Логин</label> \
                        <input type="text" disabled placeholder="Введите логин" /> \
                    </div> \
                    <div class="form-group" onclick="showToastsError()"> \
                        <label>Пароль</label> \
                        <input type="password" disabled placeholder="Введите пароль" /> \
                    </div> \
                    <div class="form-group"> \
                        <div class="row"> \
                            <div class="cell"> \
                                <button disabled class="button success">Вход</button> \
                                <input type="button" disabled class="button" \
                                    onclick="showWinRegistration()" value="Регистрация">\
                            </div> \
                            <div class="cell pt-1"> \
                                <span class="place-right">Войти через <a  href="https://oauth.yandex.ru/authorize?response_type=code&client_id=0dadfccaebe64f61a6d09879d0ecf2a9"><img src="img/icons/yandex_icon.png" width="30" height="30""></img></a></button></span> \
                            </div> \
                        </div> \
                    </div> \
                </form> \
            </div>';
    }
}

/**
 * Функция сортировки картинок
 * @param {*} item 
 */
function sortList(col, dir) {
    $('.images').data('list').sorting(col, dir, true)
}

/**
 * Функция фильтрации картинок
 * @param {*} item 
 */
function tagFilter(item) {
    var content_tags = $(".tag-input")[0].textContent;
    
    find_tags = content_tags.split('×').filter(function(el) { return el != ""; });
    
    if (find_tags.length == 0) {
        return true;
    }
    
    is_content = false;
    image_tags = item.getElementsByClassName('info')[0].textContent.split(' '); 
    find_tags.forEach(name_tag => {
        
        if (image_tags.indexOf('#' + name_tag) != -1) {
            is_content = true;
        }
    });

    return is_content;
}

/**
 * Открывает средство просмотра изображений
 * @param {*} img_element 
 */
function showImg(img_element) {
    path_to_src_image = img_element.children[0].attributes.src.value;

    list_figures = $("figure");
    result = [];

    var delimeter_index = -1;

    for (let i = 0; i < list_figures.length; i++) {
        temp = [];
        figure = list_figures[i];
        
        temp['url'] = $(figure.children[0].children[0]).attr("src");
        if (temp['url'] == path_to_src_image) {
            delimeter_index = i;
        }

        rating_img = figure.children[4].textContent;

        temp['title'] = rating_img;
        temp['caption'] = figure.children[0].children[1].children[0].textContent;
        result.push(temp);
        
    }

    arr_end = result.slice(delimeter_index - list_figures.length)
    arr_start = result.slice(0, delimeter_index);
    view_list = arr_end.concat(arr_start); 

    Lightview.show(view_list, 
    {
        controls: 'thumbnails'
    });
}

/**
 * Создает успещный toast
 * @param {*} img_element 
 */
function succesToast(name_tag, name_image) {
    var toast = Metro.toast.create;
    name_image = name_image.replace(/.*\/(\w+)\.\w+$/, '$1');
    toast("Тег \"" + name_tag + "\" успешно добавлен к картинке " + name_image, null, 5000, "bg-green fg-white");
}

/**
 * Принимает информацию из формы добавления тега
 * @param {*} val 
 */
function addTag(val, name_image) {

    var name_tag  = "#" + val[0].value;
    val[0].value = '';

    $.ajax({
        type: 'GET',
        url: './php/add_tags.php',
        dataType: 'json',
        data: {tag: name_tag, image: name_image},
        cache: false,
        success: function(info_json) {
            img_tag = $("img[src$='" + name_image + "']");
            $("img[src$='" + name_image + "']")[0].parentNode.children[1].children[0].append(' ' + name_tag);
            succesToast(name_tag, name_image);
            }
    });

    succesToast(name_tag, name_image);
}

/**
 * Создает окно для добавления тегов
 * @param {*} element 
 */
function createInfoBox(element, pathToDB) {
    name_image = element.parentElement.childNodes[1].textContent;
    
    add_tag_html = '<h4 class="text-light mb-4">Тег для картинки ' + name_image + ':<h4> \
                    <form data-role="validator" data-on-error="errorAddTag(arguments, this)" \
                            id="add_tag_form" action="javascript:void(null);" name-image="image2.jpg" onsubmit="addTag(this,\'' + pathToDB + '\')" method="post"> \
                        <input type="text" class="cell-6 offset-3" data-role="input" data-clear-button="false" \
                            data-prepend="Добавьте тег:" data-validate=\'pattern=(^[а-яА-ЯёЁa-zA-Z0-9_]{1,30}$)\'> \
                    </form>';
    Metro.infobox.create(add_tag_html);
}

/**
 * Рисует плохой toast при неправильных вводимых данных
 * @param {*} log 
 * @param {*} element 
 */
function errorAddTag(log, element) {
    name_tag = log[1];
    var toast = Metro.toast.create;
    toast("Тег \"#" + name_tag + "\" неправильного формата.\n Разрешен тег длинной 30 символов: a-z, A-Z, 0-9, '.' и '_' ", null, 5000, "bg-red fg-white");
}

/**
 * Рисует окно 'спасибо за отзыв'
 */
function thanksToast() {
    var toast = Metro.toast.create;
    toast("Спасибо за оценку!", null, 1000, "bg-yellow fg-black");
}

/**
 * Добавляет оценки пользователей о картинках
 * @param {*} mark 
 * @param {*} image 
 */
function addMark(mark, image) {
    info_person = $.cookie('user');
    info_person = info_person.split(';');

    $.ajax({
        type: 'GET',
        url: './php/add_marks.php',
        dataType: 'json',
        data: {mark: mark, image: image, login: info_person[0]},
        cache: false,
        beforeSend: function(){
            },
        success: function(info_json) {
            avg_mark = info_json['avg'];
            img_element = $("img[src$='" + image + "']");

            img_element[0].parentElement.parentElement.children[4].children[0].textContent = avg_mark;
            thanksToast();
            }
    });
}

/**
 * Временная функция
 */
function showToastsError(){
    Metro.toast.create("Регистрация на сайте пока не доступна.\nПожалуйста, войдите через Яндекс", null, 5000, "alert");
}
