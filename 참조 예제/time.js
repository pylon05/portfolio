window.onload=function(){
    //interval : 특정 시간마다 주어진 동작을 반복하도록 하는 명령
    //setInterval("동작",시간);
    //시간은 n/1000초
    let spans=document.getElementsByTagName("span");
    let times=[2,3,5,9,3,0];
    console.log(spans);
    console.log(times);
    
    setInterval(function(){
        
        times[5]++;

        for(let i=1;i<times.length;i++){
            
            if(times[0]>=3||(times[0]>=2&&times[1]>=4)){
                times=[0,0,0,0,0,0];
            }
            if(i%2==1){
                if((times[times.length-i])>=10){
                    (times[times.length-i])-=10;
                    (times[times.length-i-1])++;
                }
            }
            if(i%2==0){
                if((times[times.length-i])>=6){
                    (times[times.length-i])-=6;
                    (times[times.length-i-1])++;
                }
            }
            
        }

        //화면에 보이는 숫자를 변경해주는 기능
        for(let i=0;i<6;i++){
            spans[i].innerHTML=times[i];
        }

    },200);

    let time=document.getElementsByTagName("h1")[1];
    let times2=[2,3,5,9,3,0];
    
    setInterval(function(){
        times2[5]++;
        
        if(times2[5]>=10){
            times2[5]-=10;
            times2[4]++;
        }
        if(times2[4]>=6){
            times2[4]-=6;
            times2[3]++;
        }
        if(times2[3]>=10){
            times2[3]-=10;
            times2[2]++;
        }
        if(times2[2]>=6){
            times2[2]-=6;
            times2[1]++;
        }
        if(times2[1]>=10){
            times2[1]-=10;
            times2[0]++;
        }
        if(times2[0]>=2&&times2[1]>=4){
            times2=[0,0,0,0,0,0];
        }

        time.innerHTML=times2[0]+""+times2[1]+":"+times2[2]+""+times2[3]+":"+times2[4]+""+times2[5];
    },200);
};