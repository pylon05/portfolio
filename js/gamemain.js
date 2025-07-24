/*
    RPG 게임

    알만툴이라고 rpg 만드는 에디터가 있음
    다음 검토까지 쓰여지는 이미지 3개정도 가져오기

    맵 구성
        맵을 여러 덩이로 분리해서 만들듯 map tile
        그렇다면 맵을 이동할 때 맵 로드는 어떤 식으로 할지 - 일단 전체 맵의 2차원 좌표를 만들기 allmap
        현재 떠 있는 맵의 좌표값을 만들고 2차원 배열에 보관 currentmap
        벽판정(충돌판정)은 어떻게 만들지 - 이미지에 따라 좌표값 0,1로 결정
        벽판정을 만들기 위해 구조물의 함수를 생성

    고려해볼 것
    블록을 하나하나 div를 지정해서 만드니 블록 div의 개수가 너무 많아져 렉이 걸릴 수 있을듯
    이걸 맵 좌표 한개 기준 큰 이미지 하나로 만들어 div를 줄이는걸 생각해봐야 할듯
    혹시 이후에 변경할 걸 고려해서 충돌 판정은 플레이어 좌표와 xy 블록 좌표값 기준으로 설정되게 바꿔놓기

*/
window.onload=function(){
    
    /******* 플레이어, 맵, 블록 변수 생성 ********/

    const player={map_x: 3, map_y: 4, left: 4, top: 54, width: 12, height: 12}; //플레이어 시작점 데이터
    const all_block_data=block_data.map(obj=>({...obj}));  
    let pl_left;
    let pl_right;
    let pl_top;
    let pl_bottom;
    let pl_x; //플레이어의 x축 위치 좌표
    let pl_y; //플레이어의 y축 위치 좌표
    let dpl_left=44; // 이동 범위 안에서의 플레이어의 left(x)값
    let dpl_top=44;
    let pl_speed=3;
    let pl_move=0;
    const blo_left=[];
    const blo_right=[];
    const blo_top=[];
    const blo_bottom=[];
    const bl_x=[];
    for(let i=0;i<all_block_data.length;i++){  //모든 블록의 x축 절대값 좌표, 보이는 블록과 별개로 충돌 판정에 사용
        bl_x[i]=all_block_data[i].left+all_block_data[i].map_x*200;
    };
    const bl_y=[];
    for(let i=0;i<all_block_data.length;i++){  //모든 블록의 y축 절대값 좌표
        bl_y[i]=all_block_data[i].top+all_block_data[i].map_y*150;
    }
    const dis_blo_left=[];
    const dis_blo_top=[];

    /* 플레이어가 있는 맵 좌표가 맵의 경계선을 넘어 갔을 때 재실행 */
    let block_num; //블록의 개수 체크는 사용하는 다른 곳이 있기 때문에 전역 변수로 지정
    let map_left;
    let map_top;
    let mapx;
    let mapy;
    let copy_block_data;
    let dis_block_data;
    function display_data_setting(){
        mapx=player.map_x-1;
        mapy=player.map_y-1;
        copy_block_data=block_data.map(obj=>({...obj})); //block_data의 값에 영향을 주지 않게 복사본 생성
        dis_block_data=copy_block_data.filter(obj => obj.map_x >= mapx && obj.map_x <= mapx+2 && obj.map_y >= mapy && obj.map_y <= mapy+2); // 화면에서 보여줄 블록 데이터 필터링
        
        block_num=dis_block_data.length;
        map_left=dpl_left-player.left-200; //맨 처음 맵의 left값은 보이는 x좌표-실제 x좌표 만큼 왼쪽으로 밀음
        map_top=dpl_top-player.top-150;
        for(let i=0;i<block_num;i++){ //맨 처음 보이는 블록 값도 map과 같은 값으로 왼쪽으로 밀음
            dis_block_data[i].left+=map_left;
            dis_block_data[i].top+=map_top;
        }
        map_div_setting(); //맵에 'div id='+map의 x좌표+map의 y좌표를 줌
        block_div_setting(); //블록에 'div id='+번호 를 줌
        
    }
    
    display_data_setting();

    /******* 맵,블록 아이디 불러오기 후 div 생성 ********/

    
    function map_div_setting(){
        let map=document.getElementById("map"); //맵 id 불러오고 div 생성
        let curmap="";
        let map_num;
        for(let i=mapx;i<=mapx+2;i++){
            curmap+="<div>";
            for(let j=mapy;j<=mapy+2;j++){
                curmap+="<div id='"+i+" "+j+"' style='background-color:";
                map_num=i*8+j;
                if(map_num%6==0) curmap+="#2dc;'>";
                if(map_num%6==1) curmap+="#5ab;'>";
                if(map_num%6==2) curmap+="#88a;'>";
                if(map_num%6==3) curmap+="#a50;'>";
                if(map_num%6==4) curmap+="#c29;'>";
                if(map_num%6==5) curmap+="#f08;'>";
                curmap+="</div>";
            }
            curmap+="</div>";
        }
        map.innerHTML=curmap;
    }
    

    function block_div_setting(){
        let blo=document.getElementById("block");
        let curblo="";
        for(let i=0;i<block_num;i++){ // 화면에서 보여줄 블록 데이터 아이디 설정
            curblo+="<div id='("+dis_block_data[i].map_x+", "+dis_block_data[i].map_y+") blo"+i+"'></div>";
        }
        blo.innerHTML=curblo;
    }

    let p=document.getElementById("player"); // 플레이어 아이디 불러오기

    /**************** 메뉴 관련 ****************/
    let menu=document.getElementById("menu");
    const menu_list_text="<div id='key_change'></div><div id='save'></div><div id='exit'></div>";
    
    //각 키 데이터는 e.code 형태로 저장하고 무슨 키가 배정되어있는지는 e.key가 보기 쉬우므로 따로 변수로 바꿔서 저장
    //shiftLeft키+e.key 형태로 영문 키가 같이 눌리면 대문자로 판정되어 다른 키로 인식되어서 움직이지 않음
    let menukey="KeyQ";
    let Akey="KeyZ";
    let Bkey="KeyX";
    let leftkey="ArrowLeft";
    let upkey="ArrowUp";
    let rightkey="ArrowRight";
    let downkey="ArrowDown";

    let show_menukey="q";
    let show_Akey="z";
    let show_Bkey="x";
    let show_leftkey="ArrowLeft";
    let show_upkey="ArrowUp";
    let show_rightkey="ArrowRight";
    let show_downkey="ArrowDown";

    menu_deactive();

    let menu_point=1; // 메뉴 포인터 순서
    function menu_list() { //메뉴 창이 활성화됐을 때
        menu.innerHTML=menu_list_text;
        switch(menu_point) {
            case 1: //첫번째 메뉴에 커서가 가게 함
                document.getElementById("key_change").innerHTML="<span class='active'>키 변경</span>";
                document.getElementById("save").innerHTML="<span>저장</span>";
                document.getElementById("exit").innerHTML="<span>게임 종료</span>";
                break;
            case 2:
                document.getElementById("save").innerHTML="<span class='active'>저장</span>";
                document.getElementById("key_change").innerHTML="<span>키 변경</span>";
                document.getElementById("exit").innerHTML="<span>게임 종료</span>";
                break;
            case 3: 
                document.getElementById("exit").innerHTML="<span class='active'>게임 종료</span>";
                document.getElementById("key_change").innerHTML="<span>키 변경</span>";
                document.getElementById("save").innerHTML="<span>저장</span>";
                break;
            default: //그 외 이상한 값이 들어갔을 때
                console.log("menu_point 값이 이상함 : "+menu_point);
                break;
        }
    }
    function menu_deactive() {
        menu.innerHTML="메뉴 "+show_menukey+" 키";
    }

    let key_set_point=1;
    
    function key_set_list() {
        const key_set_list_text="<div id='left_key'><span>left</span><span>"+leftkey+"</span></div>"
                           +"<div id='up_key'><span>up</span><span>"+upkey+"</span></div>"
                           +"<div id='right_key'><span>right</span><span>"+rightkey+"</span></div>"
                           +"<div id='down_key'><span>down</span><span>"+downkey+"</span></div>"
                           +"<div id='A_key'><span>A</span><span>"+Akey+"</span></div>"
                           +"<div id='B_key'><span>B</span><span>"+Bkey+"</span></div>"
                           +"<div id='menu_key'><span>메뉴</span><span>"+menukey+"</span></div>"
                           +"<div id='comment'>변경하고 싶은 키 커서에서 A키를 누르세요.</div>";
        menu.innerHTML=key_set_list_text;
        switch(key_set_point){
            case 1:
                document.getElementById("left_key").innerHTML="<span class='active'>left</span><span>"+leftkey+"</span>";
                document.getElementById("up_key").innerHTML="<span>up</span><span>"+upkey+"</span>";
                document.getElementById("menu_key").innerHTML="<span>메뉴</span><span>"+menukey+"</span>";
                break;
            case 2:
                document.getElementById("left_key").innerHTML="<span>left</span><span>"+leftkey+"</span>";
                document.getElementById("up_key").innerHTML="<span class='active'>up</span><span>"+upkey+"</span>";
                document.getElementById("right_key").innerHTML="<span>right</span><span>"+rightkey+"</span>";
                break;
            case 3:
                document.getElementById("up_key").innerHTML="<span>up</span><span>"+upkey+"</span>";
                document.getElementById("right_key").innerHTML="<span class='active'>right</span><span>"+rightkey+"</span>";
                document.getElementById("down_key").innerHTML="<span>down</span><span>"+downkey+"</span>";
                break;
            case 4:
                document.getElementById("right_key").innerHTML="<span>right</span><span>"+rightkey+"</span>";
                document.getElementById("down_key").innerHTML="<span class='active'>down</span><span>"+downkey+"</span>";
                document.getElementById("A_key").innerHTML="<span>A</span><span>"+Akey+"</span>";
                break;
            case 5:
                document.getElementById("down_key").innerHTML="<span>down</span><span>"+downkey+"</span>";
                document.getElementById("A_key").innerHTML="<span class='active'>A</span><span>"+Akey+"</span>";
                document.getElementById("B_key").innerHTML="<span>B</span><span>"+Bkey+"</span>";
                break;
            case 6:
                document.getElementById("A_key").innerHTML="<span>A</span><span>"+Akey+"</span>";
                document.getElementById("B_key").innerHTML="<span class='active'>B</span><span>"+Bkey+"</span>";
                document.getElementById("menu_key").innerHTML="<span>메뉴</span><span>"+menukey+"</span>";
                break;
            case 7:
                document.getElementById("left_key").innerHTML="<span>left</span><span>"+leftkey+"</span>";
                document.getElementById("B_key").innerHTML="<span>B</span><span>"+Bkey+"</span>";
                document.getElementById("menu_key").innerHTML="<span class='active'>메뉴</span><span>"+menukey+"</span>";
                break;
            default: //그 외 이상한 값이 들어갔을 때
                console.log("keySet_point 값이 이상함 : "+key_set_point);
                break;
        }
    }
    

    /**************** 전체 키 입력 관련 ****************/
    
    const key = {}; // 누르는 키를 저장하는 객체
    const keyPressed = {}; // 누르고 있는 키 상황을 저장하는 객체
    let LR_key;
    let UD_key;

    window.addEventListener("keydown", function(e) {
        if ([leftkey, upkey, rightkey, downkey, "ShiftLeft", menukey, Akey, Bkey].includes(e.code)) {
            key[e.code] = true;
            e.preventDefault();
        }
        if(menu.id=="menu") {
            if (key[menukey]&&!keyPressed[menukey]) {
                keyPressed[menukey] = true; // 메뉴 키를 한번 떼야 다시 실행되게 설정
                menu.id="menu_list";
                menu_list(); // 메뉴 리스트 함수 호출
            }
        }
         
        if(menu.id=="menu_list"){
            if(key[menukey]&&!keyPressed[menukey]) { // 메뉴 키를 눌러서 메뉴창 닫기
                keyPressed[menukey] = true; // 메뉴 키를 한번 떼야 다시 실행되게 설정
                menu.id="menu";
                menu_deactive();
            }
            if(key[Bkey]&&!keyPressed[Bkey]) { // 취소 키를 눌러서 메뉴창 닫기
                keyPressed[Bkey] = true; // 취소 키를 한번 떼야 다시 실행되게 설정
                menu.id="menu";
                menu_deactive();
            }

            if(key[Akey]&&!keyPressed[Akey]&&menu_point==1){ //키 설정 메뉴 앞에서 OK키를 눌렀을 경우
                keyPressed[Akey] = true; // OK 키를 한번 떼야 다시 실행되게 설정
                menu.id="key_set_list";
                key_set_list(); //키설정 창 열기
            }
        }

        if (menu.id=="menu_list" && key[upkey]){
            menu_point--;
            if(menu_point<1) menu_point=3;
            menu_list();
        }
        if (menu.id=="menu_list" && key[downkey]){
            menu_point++;
            if(menu_point>3) menu_point=1;
            menu_list();
        }

        if(menu.id=="key_set_list"){
            if(key[upkey]){
                key_set_point--;
                if(key_set_point<1) key_set_point=7;
                key_set_list();
            }
            if(key[downkey]){
                key_set_point++;
                if(key_set_point>7) key_set_point=1;
                key_set_list();
            }
            if(key[Bkey]&&!keyPressed[Bkey]){
                keyPressed[Bkey] = true;
                menu.id="menu_list";
                menu_list();
            }
            if(key[Akey]&&!keyPressed[Akey]){
                keyPressed[Akey] = true;
                switch(key_set_point){
                    case 1:
                        document.getElementById("comment").innerHTML="바꿀 left키를 입력하세요";
                        menu.id="key_changing";
                        break;
                    case 2:
                        document.getElementById("comment").innerHTML="바꿀 up키를 입력하세요";
                        menu.id="key_changing";
                        break;
                    case 3:
                        document.getElementById("comment").innerHTML="바꿀 right키를 입력하세요";
                        menu.id="key_changing";
                        break;
                    case 4:
                        document.getElementById("comment").innerHTML="바꿀 down키를 입력하세요";
                        menu.id="key_changing";
                        break;
                    case 5:
                        document.getElementById("comment").innerHTML="바꿀 A키를 입력하세요";
                        menu.id="key_changing";
                        break;
                    case 6:
                        document.getElementById("comment").innerHTML="바꿀 B키를 입력하세요";
                        menu.id="key_changing";
                        break;
                    case 7:
                        document.getElementById("comment").innerHTML="바꿀 menu키를 입력하세요";
                        menu.id="key_changing";
                        break;
                    default:
                        console.log("key_set_point 에 예상치 못한 값 발생 : "+key_set_point);
                        break;
                }
            }
        }

        if(menu.id=="key_changing"){
            if(!keyPressed[Akey]){
                switch(key_set_point){
                    case 1:
                        keyPressed[e.code]=true;
                        leftkey=e.code;
                        show_leftkey=e.key;
                        menu.id="key_set_list";
                        key_set_list();
                        break;
                    case 2:
                        keyPressed[e.code]=true;
                        upkey=e.code;
                        menu.id="key_set_list";
                        key_set_list();
                        break;
                    case 3:
                        keyPressed[e.code]=true;
                        rightkey=e.code;
                        menu.id="key_set_list";
                        key_set_list();
                        break;
                    case 4:
                        keyPressed[e.code]=true;
                        downkey=e.code;
                        menu.id="key_set_list";
                        key_set_list();
                        break;
                    case 5:
                        keyPressed[e.code]=true;
                        Akey=e.code;
                        menu.id="key_set_list";
                        key_set_list();
                        break;
                    case 6:
                        keyPressed[e.code]=true;
                        Bkey=e.code;
                        menu.id="key_set_list";
                        key_set_list();
                        break;
                    case 7:
                        keyPressed[e.code]=true;
                        menukey=e.code;
                        menu.id="key_set_list";
                        key_set_list();
                        break;
                    default:
                        console.log("key_set_point 에 예상치 못한 값 발생 : "+key_set_point);
                        break;
                }
            }
            
        }


    });

    window.addEventListener("keyup", function(e) {
        if ([leftkey, upkey, rightkey, downkey, "ShiftLeft", menukey, Akey, Bkey].includes(e.code)) {
            key[e.code] = false;
            e.preventDefault();
        }
        keyPressed[e.code] = false;
        
    });




















    

    gameLoop();

    function gameLoop() {
        display(); // 프레임마다 map, player, block 갱신
        if(menu.id=="menu") move();
        // console.log(map_left+" "+map_top+" "+pl_x+" "+pl_y+" "+dpl_left+" "+dpl_top+" "+pl_move);
        requestAnimationFrame(gameLoop);
    }

    function move(){
        if((key[leftkey])&&(!key[rightkey])){
            LR_key=1;
            if(left_collision()==false) player_leftmove();
        }
        if((!key[leftkey])&&(key[rightkey])){
            LR_key=2;
            if(right_collision()==false) player_rightmove();
        }
        if((key[leftkey])&&(key[rightkey])){   //왼쪽 오른쪽 키를 동시에 눌렀을 때 왼쪽을 먼저 누르고 오른쪽 키를 누르면 오른쪽으로 가게 하고                            
            if(LR_key==1){          //오른쪽 키를 먼저 누르고 왼쪽 키를 누르면 왼쪽으로 가게 함
                if(right_collision()==false) player_rightmove();
            }
            if(LR_key==2){
                if(left_collision()==false) player_leftmove();
            }  
        }
        if((key["ArrowUp"])&&(!key["ArrowDown"])){
            UD_key=1;
            if(up_collision()==false) player_upmove();
        }
        if(!(key["ArrowUp"])&&(key["ArrowDown"])){
            UD_key=2;
            if(down_collision()==false) player_downmove();
        }
        if((key["ArrowUp"])&&(key["ArrowDown"])) {   //위쪽 아래쪽 키를 동시에 눌렀을 때 위쪽을 먼저 누르고 아래쪽 키를 누르면 아래쪽으로 가게 하고
            if(UD_key==1) {          //아래쪽 키를 먼저 누르고 위쪽 키를 누르면 위쪽으로 가게 함
                if(down_collision()==false) player_downmove();
            }
            if(UD_key==2){
                if(up_collision()==false) player_upmove();
            }  
        }
        
    }
    function display(){
        document.getElementById("map").setAttribute("style","left:"+map_left+"%; top:"+map_top+"%;");
        for(let i=0;i<block_num;i++){ // 보여줄 블록들의 id를 불러오고 style 설정
            let b=document.getElementById("("+dis_block_data[i].map_x+", "+dis_block_data[i].map_y+") blo"+i);
            dis_blo_left[i]=dis_block_data[i].left+dis_block_data[i].map_x*200-mapx*200; //블록 좌표값을 화면에 보여줄 좌표값으로 설정
            dis_blo_top[i]=dis_block_data[i].top+dis_block_data[i].map_y*150-mapy*150;
            b.setAttribute("style","left:"+dis_blo_left[i]+"%; top:"+dis_blo_top[i]+"%; width:"+dis_block_data[i].width+"%; height:"+dis_block_data[i].height+"%;");
        }
        p.setAttribute("style","left:"+dpl_left+"%; top:"+dpl_top+"%; width:"+player.width+"%; height:"+player.height+"%;");
    }

    function player_block_check(){ // 플레이어와 블록의 위치값을 체크해서 이동/충돌 판정을 확인할 때 사용
        pl_x=player.left+player.map_x*200;
        pl_y=player.top+player.map_y*150;
        pl_left=pl_x;
        pl_right=pl_left+player.width;
        pl_top=pl_y;
        pl_bottom=pl_top+player.height;
        for(let i=0;i<all_block_data.length;i++){
            blo_left[i]=bl_x[i];
            blo_right[i]=blo_left[i]+all_block_data[i].width;
            blo_top[i]=bl_y[i];
            blo_bottom[i]=blo_top[i]+all_block_data[i].height;
        }
    }
    
    function player_leftmove(){
        pl_move=pl_speed;
        if(key["ShiftLeft"]) pl_move*=2;
        player_block_check();
        if(dpl_left>0&&dpl_left<pl_move) pl_move=dpl_left; // 현재 스피드보다 플레이어 왼쪽 이동범위와 플레이어 왼쪽 간격이 더 좁을 경우
        // 그 속도로 움직이면 플레이어가 이동범위를 뚫은 것 같이 보이기에 그 간격만큼만 이동
        for(let i=0;i<all_block_data.length;i++){
            if(pl_left<blo_right[i]+pl_move&&pl_right>blo_left[i]&&pl_top<blo_bottom[i]&&pl_bottom>blo_top[i]){
                pl_move=pl_left-blo_right[i];
            }
        } // 현재 스피드보다 블록의 오른쪽과 플레이어 왼쪽의 간격이 좁을 경우 그 속도로 움직이면 블록을 뚫고 들어가기에 그 간격만큼만 이동, 위 조건보다 우선순위
        player.left-=pl_move;
        if(dpl_left<=0) {map_left+=pl_move; blockrightmove();}
        if(dpl_left>0) dpl_left-=pl_move; // 플레이어가 맵을 벗어나지 않도록
        if(player.left<0) {
            player.left+=200;
            player.map_x-=1;
            display_data_setting();
        }
    }
    function player_rightmove(){
        pl_move=pl_speed;
        if(key["ShiftLeft"]) pl_move*=2;
        player_block_check();
        if(dpl_left<88&&dpl_left>88-pl_move) pl_move=88-dpl_left;
        for(let i=0;i<all_block_data.length;i++){
            if(pl_left<blo_right[i]&&pl_right>blo_left[i]-pl_move&&pl_top<blo_bottom[i]&&pl_bottom>blo_top[i]){
                pl_move=blo_left[i]-pl_right;
            }
        }
        player.left+=pl_move;
        if(dpl_left>=88) {map_left-=pl_move; blockleftmove();}
        if(dpl_left<88) dpl_left+=pl_move;
        if(player.left>200) {
            player.left-=200;
            player.map_x+=1;
            display_data_setting();
        }
    }
    function player_upmove(){
        pl_move=pl_speed;
        if(key["ShiftLeft"]) pl_move*=2;
        player_block_check();
        if(dpl_top>0&&dpl_top<pl_move) pl_move=dpl_top;
        for(let i=0;i<all_block_data.length;i++){
            if(pl_left<blo_right[i]&&pl_right>blo_left[i]&&pl_top<blo_bottom[i]+pl_move&&pl_bottom>blo_top[i]){
                pl_move=pl_top-blo_bottom[i];
            }
        }
        player.top-=pl_move;
        if(dpl_top<=0) {map_top+=pl_move; blockdownmove();}
        if(dpl_top>0) dpl_top-=pl_move;
        if(player.top<0){
            player.top+=150;
            player.map_y-=1;
            display_data_setting();
        }
    }
    function player_downmove(){
        pl_move=pl_speed;
        if(key["ShiftLeft"]) pl_move*=2;
        player_block_check();
        if(dpl_top<88&&dpl_top>88-pl_move) pl_move=88-dpl_top;
        for(let i=0;i<all_block_data.length;i++){
            if(pl_left<blo_right[i]&&pl_right>blo_left[i]&&pl_top<blo_bottom[i]&&pl_bottom>blo_top[i]-pl_move){
                pl_move=blo_top[i]-pl_bottom;
            }
        }
        player.top+=pl_move;
        if(dpl_top>=88) {map_top-=pl_move; blockupmove();}
        if(dpl_top<88) dpl_top+=pl_move;
        if(player.top>150){
            player.top-=150;
            player.map_y+=1;
            display_data_setting();
        }
    }


    function blockleftmove(){
        for(let i=0;i<block_num;i++){
            dis_block_data[i].left-=pl_move;
        }
    }
    function blockrightmove(){
        for(let i=0;i<block_num;i++){
            dis_block_data[i].left+=pl_move;
        }
    }
    function blockupmove(){
        for(let i=0;i<block_num;i++){
            dis_block_data[i].top-=pl_move;
        }
    }
    function blockdownmove(){
        for(let i=0;i<block_num;i++){
            dis_block_data[i].top+=pl_move;
        }
    }

    function left_collision(){
        let col=false;
        player_block_check();
        for(let i=0;i<all_block_data.length;i++){
            if(pl_left<=blo_right[i]&&pl_right>blo_left[i]&&pl_top<blo_bottom[i]&&pl_bottom>blo_top[i])
            {
                col=true; // 한 블록이라도 플레이어와 충돌 범위 근처에 있으면 true
            }
        }
        return col;
    }
    function right_collision(){
        let col=false;
        player_block_check();
        for(let i=0;i<all_block_data.length;i++){
            if(pl_left<blo_right[i]&&pl_right>=blo_left[i]&&pl_top<blo_bottom[i]&&pl_bottom>blo_top[i])
            {
                col=true;
            }
        }
        return col;
    }
    function up_collision(){
        let col=false;
        player_block_check();
        for(let i=0;i<all_block_data.length;i++){
            if(pl_left<blo_right[i]&&pl_right>blo_left[i]&&pl_top<=blo_bottom[i]&&pl_bottom>blo_top[i])
            {
                col=true;
            }
        }
        return col;
    }
    function down_collision(){
        let col=false;
        player_block_check();
        for(let i=0;i<all_block_data.length;i++){
            if(pl_left<blo_right[i]&&pl_right>blo_left[i]&&pl_top<blo_bottom[i]&&pl_bottom>=blo_top[i])
            {
                col=true;
            }
        }
        return col;
    }

};

/* 그 외 알아두면 좋을 것들
객체 2개끼리 합치기
let obj={...dis_block_data, ...o2};
*/