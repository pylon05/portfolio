$(document).ready(function(){
    window.addEventListener("wheel",function(e){
        e.preventDefault(); // 휠의 기본기능 제거
    },{passive:false}); // 경고메시지 제거

    let posY=0;
    let wrap=document.getElementById("wrap");
    wrap.addEventListener("wheel",function(e){
        //e.deltaY값이 -이면 상승,+이면 하락
        if($(".pan").is(":animated")){
            return;
        }

        if(e.deltaY>0&&posY>-300){
            posY-=100;
        }
        if(e.deltaY<0&&posY<0){
            posY+=100;
        }
        $(".pan").animate({"top":posY+"%"},1000);
        console.log(posY);
    });
});