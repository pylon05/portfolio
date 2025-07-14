$(document).ready(function(){
    // setInterval(동작,시간/1000);
    /* let point=0;
    setInterval(function(){
        point-=1;
        let pan=document.getElementsByClassName("pan")[0];
        pan.setAttribute("style","left:"+point+"px;");
    },20/1000); */

    //jQuery.animate("목적하는 모양");
    /* 되감기는 방식
    setInterval(function(){
        $(".pan").delay(2000);
        $(".pan").animate({"left":"-400px"});
        $(".pan").delay(2000);
        $(".pan").animate({"left":"-800px"});
        $(".pan").delay(2000);
        $(".pan").animate({"left":"0px"});
    },1/1000);
    */

   /* setInterval(function(){
        $(".pan").animate({"left":"-400px"},function(){
            $(".pan").css("left","0px").append($(".pan>div:first-child"));
        });
   },2000); */

   /*setInterval(function(){
        $(".pan").animate({"top":"-200px"},function(){
            $(".pan").css("top","0px").append($(".pan>div:first-child"));
        });
   },2000);*/
    setInterval(function(){
        $(".pan div:first-child").fadeOut().next().fadeIn().end().appendTo(".pan");
        //.next() : 지금 선택된 요소의 바로 다음 형제를 선택하는 명령어
        //.end() : next()등으로 선택이 변경된 것을 이전 것으로 되돌려 선택하는 명령어
        //A.append(B) : A의 append 위치로 B를 이동시킴
        //A.appendTo(B) : B의 append 위치로 A를 이동시킴킴
    },2000);
    
});


//window.onload(function(){});