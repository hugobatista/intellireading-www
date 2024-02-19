/* eslint-disable */
$(document).ready(function () {

    // toggle mobile menu
    $('[data-toggle="toggle-nav"]').on('click', function () {
        $(this).closest('nav').find($(this).attr('data-target')).toggleClass('hidden');
        return false;
    });

    // feather icons
    feather.replace();

    // smooth scroll
    var scroll = new SmoothScroll('a[href*="#"]');


    var uploadForm = document.getElementById("upload-form");
    uploadForm.action = metaguideEpubUrl;

});
/* eslint-enable */
