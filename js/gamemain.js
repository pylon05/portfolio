/*
    RPG 게임

    알만툴이라고 rpg 만드는 에디터가 있음
    다음 검토까지 쓰여지는 이미지 3개정도 가져오기

    맵 구성
        맵,구조물(장애물) 이미지는 일단 인터넷에서 가져오고
        맵을 여러 덩이로 분리해서 만들듯 map tile
        그렇다면 맵을 이동할 때 맵 로드는 어떤 식으로 할지 - 일단 전체 맵의 2차원 좌표를 만들기 allmap
        현재 떠 있는 맵의 좌표값을 만들고 2차원 배열에 보관 currentmap
        벽판정(충돌판정)은 어떻게 만들지 - 이미지에 따라 좌표값 0,1로 결정
        벽판정을 만들기 위해 구조물의 함수를 생성

    고려해볼 것
    블록을 하나하나 div를 지정해서 만드니 블록 div의 개수가 너무 많아져
    이걸 맵 좌표 한개 기준 큰 이미지 하나로 만들어 div를 줄이는걸 생각해봐야 할지도
    어차피 충돌 판정은 플레이어 좌표와 보이지 않는 xy 블록 좌표값 기준으로 설정되니까

*/
window.onload=function(){
    
    /******* 플레이어, 맵, 블록 변수 생성 및 보이기 ********/

    const player={map_x: 6, map_y: 3, left: 174, top: 134, width: 12, height: 12}; //플레이어 시작점 데이터
    const all_block_data=block_data.map(obj=>({...obj})); //block_data의 값에 영향을 주지 않는 복사본 생성
    let mapx=player.map_x-1;
    let mapy=player.map_y-1;
    const dis_block_data=block_data.filter(obj => obj.map_x >= mapx && obj.map_x <= mapx+2 && obj.map_y >= mapy && obj.map_y <= mapy+2); // 화면에서 보여줄 블록 데이터 필터링
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
    let blo_left=[];
    let blo_right=[];
    let blo_top=[];
    let blo_bottom=[];
    let bl_x=[];
    for(let i=0;i<all_block_data.length;i++){  //모든 블록의 x축 절대값 좌표, 보이는 블록과 별개로 충돌 판정에 사용
        bl_x[i]=all_block_data[i].left+all_block_data[i].map_x*200;
    };
    let bl_y=[];
    for(let i=0;i<all_block_data.length;i++){  //모든 블록의 y축 절대값 좌표
        bl_y[i]=all_block_data[i].top+all_block_data[i].map_y*150;
    }
    const dis_blo_left=[];
    const dis_blo_top=[];

    let map_left=dpl_left-player.left-200; //맨 처음 맵의 left값은 보이는 x좌표-실제 x좌표 만큼 왼쪽으로 밀음
    let map_top=dpl_top-player.top-150;
    for(let i=0;i<dis_block_data.length;i++){ //맨 처음 보이는 블록 값도 map과 같은 값으로 왼쪽으로 밀음
        dis_block_data[i].left+=map_left; 
        dis_block_data[i].top+=map_top;
    }

    let map=document.getElementById("map");
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

    let blo=document.getElementById("block");
    let curblo="";
    for(let i=0;i<dis_block_data.length;i++){ // 화면에서 보여줄 블록 데이터 아이디 설정
        curblo+="<div id='("+dis_block_data[i].map_x+", "+dis_block_data[i].map_y+") blo"+i+"'></div>";
    }
    blo.innerHTML=curblo;

    /**************** 메뉴 관련 ****************/
    let menu=document.getElementById("menu");
    const menu_list_text="<div id='key_change'></div><div id='save'></div><div id='exit'></div>";
    //무슨 키가 메뉴키인지 확인하기 위해 e.key 형태로 출력
    let menukey="q";
    let okkey="z";
    let backkey="x";
    let leftkey="ArrayLeft";
    let upkey="ArrayUp";
    let rightkey="ArrayRight";
    let downkey="ArrayDown";
    
    menu_deactive(); // 실행 초기에는 아무것도 열려있지 않은 상태

    let menu_point=1; // 메뉴 포인터 순서
    function menu_list() { //메뉴 창이 활성화됐을 때
        switch(menu_point) {
            case 1: //첫번째 메뉴에 커서가 가게 함
                document.getElementById("key_change").innerHTML="<span class='active'>키 변경</span>";
                document.getElementById("save").innerHTML="<span>저장</span>";
                document.getElementById("exit").innerHTML="<span>게임 종료</span>";
                break;
            case 2: //두번째 메뉴에 커서가 가게 함
                document.getElementById("save").innerHTML="<span class='active'>저장</span>";
                document.getElementById("key_change").innerHTML="<span>키 변경</span>";
                document.getElementById("exit").innerHTML="<span>게임 종료</span>";
                break;
            case 3: //세번째 메뉴에 커서가 가게 함
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
        menu.innerHTML="<span>메뉴 열기</span><br><span>"+menukey+" 키</span>";
    }

    function menu_keyset_active() {

    }
    //키를 누를 때 돌아가는 keydown 이벤트
    window.addEventListener("keydown", function(e) {
        if (menu.id=="menu_list" && e.key == "ArrowUp"){
            menu_point--;
            if(menu_point<1) menu_point=3;
            menu_list();
        }
        if (menu.id=="menu_list" && e.key == "ArrowDown"){
            menu_point++;
            if(menu_point>3) menu_point=1;
            menu_list();
        }
    });

    /**************** 키 입력 관련 ****************/
    
    const key = {}; // 누르는 키를 저장하는 객체
    const keyPressed = {}; // 누르고 있는 키 상황을 저장하는 객체
    let LR_key;
    let UD_key;
    //1프레임마다 돌아가는 keydown, keyup 이벤트
    //키를 꾹 누를 때 한번 눌려지고 딜레이가 생기는 키를 딜레이 없이 작동하게 하는 이벤트와
    //한번만 작동되게 하고 키를 떼야 다시 작동하게 하는 이벤트가 아래에 해당
    window.addEventListener("keydown", function(e) {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown","ShiftLeft", menukey, okkey, backkey].includes(e.key)) {
            key[e.key] = true;
            e.preventDefault();
        }
        if(menu.id=="menu") {
            if (key[menukey]&&!keyPressed[menukey]) {
                keyPressed[menukey] = true; // 메뉴 키를 한번 떼야 다시 실행되게 설정
                menu.setAttribute("id", "menu_list");
                document.getElementById("menu_list").innerHTML=menu_list_text;
                menu_list(); // 메뉴 활성화 함수 호출
            }
        }
         
        if(m=document.getElementById("menu_list")){
            if((key[menukey]||key[backkey])&&!keyPressed[menukey]) { //메뉴창 닫기
                keyPressed[okkey] = true; // OK 키를 한번 떼야 다시 실행되게 설정
                menu.setAttribute("id", "menu");
                menu_deactive();
            }
            if(key[okkey]&&!keyPressed[okkey]&&menu_point==1){ //키 설정 메뉴 앞에서 OK키를 눌렀을 경우
                keyPressed[okkey] = true; // OK 키를 한번 떼야 다시 실행되게 설정
                document.getElementById("key_change").id="key_change_list";
                menu_keyset_active(); //키설정 창 열기
            }
        }
        if(id=document.getElementById("key_change_list")){
            if(key[backkey]){
                id.id="key_change";
                keyPressed[backkey] = true;
            }
                
        }

    });

    window.addEventListener("keyup", function(e) {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "ShiftLeft", menukey, okkey, backkey].includes(e.key)) {
            key[e.key] = false;
            e.preventDefault();
        }
        keyPressed[menukey] = false; // 키를 떼면 KeyPressed에서 제거
        keyPressed[okkey] = false;
        keyPressed[backkey] = false;
        
    });























    gameLoop();

    function gameLoop() {
        display(); // 프레임마다 map, player, block 갱신
        if(menu.id=="menu") move();
        console.log(map_left+" "+map_top+" "+pl_x+" "+pl_y+" "+dpl_left+" "+dpl_top+" "+LR_key+" "+UD_key+" "+pl_move);
        requestAnimationFrame(gameLoop);
    }

    function move(){
        if((key["ArrowLeft"])&&(!key["ArrowRight"])){
            LR_key=1;
            if(left_collision()==false) player_leftmove();
        }
        if((!key["ArrowLeft"])&&(key["ArrowRight"])){
            LR_key=2;
            if(right_collision()==false) player_rightmove();
        }
        if((key["ArrowLeft"])&&(key["ArrowRight"])){   //왼쪽 오른쪽 키를 동시에 눌렀을 때 왼쪽을 먼저 누르고 오른쪽 키를 누르면 오른쪽으로 가게 하고                            
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
        map.setAttribute("style","left:"+map_left+"%; top:"+map_top+"%;");
        let p=document.getElementById("player");
        for(let i=0;i<dis_block_data.length;i++){ // 보여줄 블록들의 id를 불러오고 style 설정
            let b=document.getElementById("("+dis_block_data[i].map_x+", "+dis_block_data[i].map_y+") blo"+i);
            dis_blo_left[i]=dis_block_data[i].left+(dis_block_data[i].map_x-5)*200; //블록 좌표값을 화면에 보여줄 좌표값으로 설정
            dis_blo_top[i]=dis_block_data[i].top+(dis_block_data[i].map_y-2)*150;
            b.setAttribute("style","left:"+dis_blo_left[i]+"%; top:"+dis_blo_top[i]+"%; width:"+dis_block_data[i].width+"%; height:"+dis_block_data[i].height+"%;");
        }
        p.setAttribute("style","left:"+dpl_left+"%; top:"+dpl_top+"%; width:"+player.width+"%; height:"+player.height+"%;");     
        
        if(player.top<0) console.log("맵 위쪽 로딩");
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
    }


    function blockleftmove(){
        for(let i=0;i<dis_block_data.length;i++){
            dis_block_data[i].left-=pl_move;
        }
    }
    function blockrightmove(){
        for(let i=0;i<dis_block_data.length;i++){
            dis_block_data[i].left+=pl_move;
        }
    }
    function blockupmove(){
        for(let i=0;i<dis_block_data.length;i++){
            dis_block_data[i].top-=pl_move;
        }
    }
    function blockdownmove(){
        for(let i=0;i<dis_block_data.length;i++){
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
