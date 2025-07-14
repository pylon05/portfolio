$(document).ready(function(){
    $(".main").mouseover(function(){
        $(this).find(".sub").stop().slideDown(50);
    });
    $(".main").mouseout(function(){
        $(this).find(".sub").stop().slideUp(50);
    });
});