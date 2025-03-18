class Enemy {
    constructor() {
        this.x; //x座標
        this.y; //y座標
        this.interimX; //一時的なx座標
        this.interimY; //一時的なy座標
        this.name; //名前
        this.number;
        this.level;
        this.atk;
        this.def;
        this.hp;
        this.exp;
        this.img = [9];
        this.walkPassage; //どの向きに進むか
        this.img[8] = new Image();
        this.walkCount;
        this.walkAlreadyFlag = false;
        this.scrollX; //スクロール用のx座標
        this.scrollY; //スクロール用のy座標
    }

    init(number) {
        this.x = getRandomInt(MAPWIDTH);
        this.y = getRandomInt(MAPHEIGHT);
        while ((map[this.y][this.x] == 0 || map[this.y][this.x] == 1 || map[this.y][this.x] == 3) || ((mapData[this.y][this.x] & ENEMYCOORDATA) != 0 || mapData[this.y][this.x] & PLAYERCOORDATA) != 0) {
            this.x = getRandomInt(MAPWIDTH);
            this.y = getRandomInt(MAPHEIGHT);
        }
        this.interimX = this.x;
        this.interimY = this.y;
        /*while (((map[this.y][this.x] != 2 ) || ((mapData[this.y][this.x] & ENEMYCOORDATA) != 0 && mapData[this.y][this.x] & PLAYERCOORDATA) != 0)) {
            this.x = getRandomInt(MAPWIDTH);
            this.y = getRandomInt(MAPHEIGHT);
        }*/
        this.number = number;
        this.name = "エネミー" + number;
        this.level = 1;
        this.atk = 2;
        this.def = 2;
        this.hp = 5;
        this.exp = 5;
        for (var i = 0; i < 8; i++) {
            this.img[i] = new Image();
            this.img[i].src = "./enemyImage/enemyEx_1.png";
        }
        this.walkPassage = 0;
        this.img[8].src = "./enemyImage/red.png";
        this.walkCount = 0;
        this.scrollX = 0;
        this.scrollY = 0;
    }

    spawnCheck() {
        if ((turn + 1) % 50 == 0 && enemyList.length < 5 && turnEnemy) {
            return true;
        } else return false;
    }

    rightWalkScroll() {
        this.scrollX = DRAWSIZE;
    }
    leftWalkScroll() {
        this.scrollX = -DRAWSIZE;
    }
    upWalkScroll() {
        this.scrollY = -DRAWSIZE;
    }
    downWalkScroll() {
        this.scrollY = DRAWSIZE;
    }

    //enemyの行動を決める
    enemyActDecision() {
        if (this.hp <= 0) return;
        if(this.scrollX != 0 || this.scrollY != 0){
            return;
        }
        switch (map[this.y][this.x]) {
            case 2: //部屋
                if (mapNum[this.y][this.x] == mapNum[player.y][player.x]) { //playerと同じ部屋にいる
                    if (this.attackCheck()) { //playerに攻撃する
                        happenEvent(1, this.name, this.number); //攻撃イベント発生
                        break;
                    }else{
                        this.walkToPlayer(); //playerに向かう
                    }
                }
                else { //部屋の通常巡回
                    switch (this.walkPassage) { //向いている方向に進む
                        case 0:
                            this.upWalkCheck();
                            this.leftWalkCheck();
                            this.rightWalkCheck();
                            this.downWalkCheck();
                            break;
                        case 1:
                            this.upWalkCheck();
                            this.rightWalkCheck();
                            break;
                        case 2:
                            this.rightWalkCheck();
                            this.upWalkCheck();
                            this.downWalkCheck();
                            this.leftWalkCheck();
                            break;
                        case 3:
                            this.downWalkCheck();
                            this.rightWalkCheck();
                            break;
                        case 4:
                            this.downWalkCheck();
                            this.leftWalkCheck();
                            this.rightWalkCheck();
                            this.upWalkCheck();
                            break;
                        case 5:
                            this.downWalkCheck();
                            this.leftWalkCheck();
                            break;
                        case 6:
                            this.leftWalkCheck();
                            this.upWalkCheck();
                            this.downWalkCheck();
                            this.rightWalkCheck();
                            break;
                        case 7:
                            this.upWalkCheck();
                            this.leftWalkCheck();
                            break;
                    }
                    this.passageCheckToPlayer();
                }
                break;
            case 3: //通路
                if (this.attackCheck()) { //playerに攻撃
                    happenEvent(1, this.name, this.number);
                    break;
                }
                let coorData = [
                    [(map[this.y - 1][this.x] == 2 || map[this.y - 1][this.x] == 3) && ((mapData[this.y - 1][this.x] & ENEMYCOORDATA) == 0 && (mapData[this.y - 1][this.x] & PLAYERCOORDATA) == 0), (map[this.y][this.x - 1] == 2 || map[this.y][this.x - 1] == 3) && ((mapData[this.y][this.x - 1] & ENEMYCOORDATA) == 0 && (mapData[this.y][this.x - 1] & PLAYERCOORDATA) == 0), (map[this.y][this.x + 1] == 2 || map[this.y][this.x + 1] == 3) && ((mapData[this.y][this.x + 1] & ENEMYCOORDATA) == 0 && (mapData[this.y][this.x + 1] & PLAYERCOORDATA) == 0)],
                    [false],
                    [(map[this.y][this.x + 1] == 2 || map[this.y][this.x + 1] == 3) && ((mapData[this.y][this.x + 1] & ENEMYCOORDATA) == 0 && (mapData[this.y][this.x + 1] & PLAYERCOORDATA) == 0), (map[this.y - 1][this.x] == 2 || map[this.y - 1][this.x] == 3) && ((mapData[this.y - 1][this.x] & PLAYERCOORDATA) == 0 && (mapData[this.y - 1][this.x] & ENEMYCOORDATA) == 0), (map[this.y + 1][this.x] == 2 || map[this.y + 1][this.x] == 3) && ((mapData[this.y + 1][this.x] & ENEMYCOORDATA) == 0 && (mapData[this.y + 1][this.x] & PLAYERCOORDATA) == 0)],
                    [false],
                    [(map[this.y + 1][this.x] == 2 || map[this.y + 1][this.x] == 3) && ((mapData[this.y + 1][this.x] & ENEMYCOORDATA) == 0 && (mapData[this.y + 1][this.x] & PLAYERCOORDATA) == 0), (map[this.y][this.x + 1] == 2 || map[this.y][this.x + 1] == 3) && ((mapData[this.y][this.x + 1] & ENEMYCOORDATA) == 0 && (mapData[this.y][this.x + 1] & PLAYERCOORDATA) == 0), (map[this.y][this.x - 1] == 2 || map[this.y][this.x - 1] == 3) && ((mapData[this.y][this.x - 1] & ENEMYCOORDATA) == 0 && (mapData[this.y][this.x - 1] & PLAYERCOORDATA) == 0)],
                    [false],
                    [(map[this.y][this.x - 1] == 2 || map[this.y][this.x - 1] == 3) && ((mapData[this.y][this.x - 1] & ENEMYCOORDATA) == 0 && (mapData[this.y][this.x - 1] & PLAYERCOORDATA) == 0), (map[this.y + 1][this.x] == 2 || map[this.y + 1][this.x] == 3) && ((mapData[this.y + 1][this.x] & ENEMYCOORDATA) == 0 && (mapData[this.y + 1][this.x] & PLAYERCOORDATA) == 0), (map[this.y - 1][this.x] == 2 || map[this.y - 1][this.x] == 3) && ((mapData[this.y - 1][this.x] & ENEMYCOORDATA) == 0 && (mapData[this.y - 1][this.x] & PLAYERCOORDATA) == 0)],
                    [false],
                ];
                let coorDecision = [
                    [0, 6, 2, 4],
                    [0, 0, 0, 0],
                    [2, 0, 4, 6],
                    [0, 0, 0, 0],
                    [4, 2, 6, 0],
                    [0, 0, 0, 0],
                    [6, 4, 0, 2],
                    [0, 0, 0, 0],
                ];
                for (let i = 0; i < coorData[this.walkPassage].length; i++) {
                    if (coorData[this.walkPassage][i]) {//移動できる
                        this.walkPassage = coorDecision[this.walkPassage][i]; //方向を適宜変える
                        mapData[this.y][this.x] -= ENEMYCOORDATA; //ビットを減らしておく
                        switch (this.walkPassage) { //移動する
                            case 0:
                                this.y--;
                                this.upWalkScroll();
                                break;
                            case 2:
                                this.x++;
                                this.rightWalkScroll();
                                break;
                            case 4:
                                this.y++;
                                this.downWalkScroll();
                                break;
                            case 6:
                                this.x--;
                                this.leftWalkScroll();
                                break;
                        }
                        mapData[this.y][this.x] += ENEMYCOORDATA; //移動後のマスのビットを増やす
                        break;
                    }
                    if (i == coorData[this.walkPassage].length - 1 && !(coorData[this.walkPassage][2])) {
                        this.walkPassage = coorDecision[this.walkPassage][3]; //方向を適宜変える
                        break;
                    }
                }
                this.passageCheckToPlayer();
                if (this.y - 1 == roomDoorData[mapNum[this.y][this.x]][0] && this.x == roomDoorData[mapNum[this.y][this.x]][1]) this.walkPassage = 0;
                else if (this.y == roomDoorData[mapNum[this.y][this.x]][0] && this.x + 1 == roomDoorData[mapNum[this.y][this.x]][1]) this.walkPassage = 2;
                else if (this.y + 1 == roomDoorData[mapNum[this.y][this.x]][0] && this.x == roomDoorData[mapNum[this.y][this.x]][1]) this.walkPassage = 4;
                else if (this.y == roomDoorData[mapNum[this.y][this.x]][0] && this.x - 1 == roomDoorData[mapNum[this.y][this.x]][1]) this.walkPassage = 6;
                break;
        }
        this.walkAlreadyFlag = false; //歩いたフラグを元に戻しておく
    }
    attackCheck() {
        let coorList = [
            [(mapData[this.y - 1][this.x + 1] & PLAYERCOORDATA) != 0, map[this.y][this.x + 1] == 2, map[this.y - 1][this.x] == 2, 1],
            [(mapData[this.y + 1][this.x + 1] & PLAYERCOORDATA) != 0, map[this.y][this.x + 1] == 2, map[this.y + 1][this.x] == 2, 3],
            [(mapData[this.y + 1][this.x - 1] & PLAYERCOORDATA) != 0, map[this.y][this.x - 1] == 2, map[this.y + 1][this.x] == 2, 5],
            [(mapData[this.y - 1][this.x - 1] & PLAYERCOORDATA) != 0, map[this.y][this.x - 1] == 2, map[this.y - 1][this.x] == 2, 7],
            [(mapData[this.y - 1][this.x] & PLAYERCOORDATA) != 0, true, true, 0],
            [(mapData[this.y][this.x + 1] & PLAYERCOORDATA) != 0, true, true, 2],
            [(mapData[this.y + 1][this.x] & PLAYERCOORDATA) != 0, true, true, 4],
            [(mapData[this.y][this.x - 1] & PLAYERCOORDATA) != 0, true, true, 6],
        ]
        for (let i = 0; i < coorList.length; i++) {
            if (coorList[i][0] && coorList[i][1] && coorList[i][2]) {
                this.walkPassage = coorList[i][3];
                return true;
            }
        }
        return false;
    }
    walkToPlayer() {
        if (player.x == this.x) {
            if (player.y < this.y && (mapData[this.y - 1][this.x] & PLAYERCOORDATA) == 0 && (mapData[this.y - 1][this.x] & ENEMYCOORDATA) == 0 && 
                (map[this.y - 1][this.x] == 2 || map[this.y - 1][this.x] == 3)) {
                mapData[this.y][this.x] -= ENEMYCOORDATA;
                this.y--;
                this.upWalkScroll();
                this.walkPassage = 0;
                mapData[this.y][this.x] += ENEMYCOORDATA;
            } else if (player.y > this.y && (mapData[this.y + 1][this.x] & PLAYERCOORDATA) == 0 && (mapData[this.y + 1][this.x] & ENEMYCOORDATA) == 0 &&
                (map[this.y + 1][this.x] == 2 || map[this.y + 1][this.x] == 3)) {
                mapData[this.y][this.x] -= ENEMYCOORDATA;
                this.y++;
                this.downWalkScroll();
                this.walkPassage = 4;
                mapData[this.y][this.x] += ENEMYCOORDATA;
            }
        } else if (player.y == this.y) {
            if (player.x < this.x && (mapData[this.y][this.x - 1] & PLAYERCOORDATA) == 0 && (mapData[this.y][this.x - 1] & ENEMYCOORDATA) == 0 && 
                (map[this.y][this.x - 1] == 2 || map[this.y][this.x - 1] == 3)) {
                mapData[this.y][this.x] -= ENEMYCOORDATA;
                this.x--;
                this.leftWalkScroll();
                this.walkPassage = 6;
                mapData[this.y][this.x] += ENEMYCOORDATA;
            } else if (player.x > this.x && (mapData[this.y][this.x + 1] & PLAYERCOORDATA) == 0 && (mapData[this.y][this.x + 1] & ENEMYCOORDATA) == 0 &&
                (map[this.y][this.x + 1] == 2 || map[this.y][this.x + 1] == 3)) {
                mapData[this.y][this.x] -= ENEMYCOORDATA;
                this.x++;
                this.rightWalkScroll();
                this.walkPassage = 2;
                mapData[this.y][this.x] += ENEMYCOORDATA;
            }
        } else if (player.x > this.x) {
            if (player.y == this.y && (mapData[this.y][this.x + 1] & PLAYERCOORDATA) == 0 && (mapData[this.y][this.x + 1] & ENEMYCOORDATA) == 0 &&
                (map[this.y][this.x + 1] == 2 || map[this.y][this.x + 1] == 3)) {
                mapData[this.y][this.x] -= ENEMYCOORDATA;
                this.x++;
                this.rightWalkScroll();
                this.walkPassage = 2;
                mapData[this.y][this.x] += ENEMYCOORDATA;
            }
            if (player.y < this.y && (mapData[this.y - 1][this.x + 1] & PLAYERCOORDATA) == 0 && (mapData[this.y - 1][this.x + 1] & ENEMYCOORDATA) == 0 && 
                (map[this.y - 1][this.x + 1] == 2 || map[this.y - 1][this.x + 1] == 3)) {
                mapData[this.y][this.x] -= ENEMYCOORDATA;
                this.y--;
                this.x++;
                this.rightWalkScroll();
                this.upWalkScroll();
                this.walkPassage = 0;
                mapData[this.y][this.x] += ENEMYCOORDATA;
            } else if (player.y > this.y && (mapData[this.y + 1][this.x + 1] & PLAYERCOORDATA) == 0 && (mapData[this.y + 1][this.x + 1] & ENEMYCOORDATA) == 0 &&
                (map[this.y + 1][this.x + 1] == 2 || map[this.y + 1][this.x + 1] == 3)) {
                mapData[this.y][this.x] -= ENEMYCOORDATA;
                this.y++;
                this.x++;
                this.downWalkScroll();
                this.rightWalkScroll();
                this.walkPassage = 4;
                mapData[this.y][this.x] += ENEMYCOORDATA;
            }
        } else if (player.x < this.x) {
            if (player.y == this.y && (mapData[this.y][this.x - 1] & PLAYERCOORDATA) == 0 && (mapData[this.y][this.x - 1] & ENEMYCOORDATA) == 0 &&
                (map[this.y][this.x - 1] == 2 || map[this.y][this.x - 1] == 3)) {
                mapData[this.y][this.x] -= ENEMYCOORDATA;
                this.x--;
                this.leftWalkScroll();
                this.walkPassage = 2;
                mapData[this.y][this.x] += ENEMYCOORDATA;
            }
            if (player.y < this.y && (mapData[this.y - 1][this.x - 1] & PLAYERCOORDATA) == 0 && (mapData[this.y - 1][this.x - 1] & ENEMYCOORDATA) == 0 &&
                (map[this.y - 1][this.x - 1] == 2 || map[this.y - 1][this.x - 1] == 3)) {
                mapData[this.y][this.x] -= ENEMYCOORDATA;
                this.y--;
                this.x--;
                this.upWalkScroll();
                this.leftWalkScroll();
                this.walkPassage = 0;
                mapData[this.y][this.x] += ENEMYCOORDATA;
            } else if (player.y > this.y && (mapData[this.y + 1][this.x - 1] & PLAYERCOORDATA) == 0 && (mapData[this.y + 1][this.x - 1] & ENEMYCOORDATA) == 0 &&
                (map[this.y + 1][this.x - 1] == 2 || map[this.y + 1][this.x - 1] == 3)) {
                mapData[this.y][this.x] -= ENEMYCOORDATA;
                this.y++;
                this.x--;
                this.downWalkScroll();
                this.leftWalkScroll();
                this.walkPassage = 4;
                mapData[this.y][this.x] += ENEMYCOORDATA;
            }
        }
    }
    passageCheckToPlayer() { //周りにplayerがいるかどうか
        let coorDataInRoom = [(mapData[this.y - 1][this.x] & PLAYERCOORDATA) != 0, (mapData[this.y - 1][this.x + 1] & PLAYERCOORDATA) != 0, (mapData[this.y][this.x + 1] & PLAYERCOORDATA) != 0, (mapData[this.y + 1][this.x + 1] & PLAYERCOORDATA) != 0,
        (mapData[this.y + 1][this.x] & PLAYERCOORDATA) != 0, (mapData[this.y + 1][this.x - 1] & PLAYERCOORDATA) != 0, (mapData[this.y][this.x - 1] & PLAYERCOORDATA) != 0, (mapData[this.y - 1][this.x - 1] & PLAYERCOORDATA) != 0];
        let coorDataInPassage = [(mapData[this.y - 1][this.x] & PLAYERCOORDATA) != 0, (mapData[this.y][this.x + 1] & PLAYERCOORDATA) != 0, (mapData[this.y + 1][this.x] & PLAYERCOORDATA) != 0, (mapData[this.y][this.x - 1] & PLAYERCOORDATA) != 0];
        switch (map[this.y][this.x]) {
            case 2:
                for (let i = 0; i < coorDataInRoom.length; i++) {
                    if (coorDataInRoom[i]) {
                        this.walkPassage = i;
                        break;
                    }
                }
                break;
            case 3:
                for (let i = 0; i < coorDataInPassage.length; i++) {
                    if (coorDataInPassage[i]) {
                        this.walkPassage = i * 2;
                        break;
                    }
                }
                break;
        }
    }
    walkToPassage(number){
        switch(number){
            case 0:
                break;
            case 1:
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
                break;
            case 5:
                break;
            case 6:
                if(((mapData[this.y][this.x - 1] & ENEMYCOORDATA) == 0 && (mapData[this.y][this.x - 1] & PLAYERCOORDATA) == 0) &&
                (map[this.y][this.x - 1] == 2 || map[this.y][this.x - 1] == 3)){
                    return true;
                }else{
                    return false;
                }
                break;
            case 7:
                break;
            
        }
    }
    //左に歩くか？
    leftWalkCheck() {
        if (this.walkAlreadyFlag) return; //既に歩いていたらreturn
        for (var i = 0; i < roomDoorData[mapNum[this.y][this.x]].length; i++) {
            if (roomDoorData[mapNum[this.y][this.x]][i][1] == roomCoorData[mapNum[this.y][this.x]][1] - 1) {
                if (this.y == roomDoorData[mapNum[this.y][this.x]][i][0] && ((mapData[this.y][this.x - 1] & ENEMYCOORDATA) == 0 && (mapData[this.y][this.x - 1] & PLAYERCOORDATA) == 0) &&
                    (map[this.y][this.x - 1] == 2 || map[this.y][this.x - 1] == 3)) { //左に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.x--;
                    this.leftWalkScroll();
                    this.walkPassage = 6;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((map[this.y - 1][this.x - 1] == 2 || map[this.y - 1][this.x - 1] == 3) && (map[this.y][this.x - 1] != 0 && map[this.y][this.x - 1] != 1 && map[this.y - 1][this.x] != 0 && map[this.y - 1][this.x] != 1) &&
                    (this.y > roomDoorData[mapNum[this.y][this.x]][i][0]) && ((mapData[this.y - 1][this.x - 1] & ENEMYCOORDATA) == 0 && (mapData[this.y - 1][this.x - 1] & PLAYERCOORDATA) == 0)) { //左上に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.x--;
                    this.y--;
                    this.leftWalkScroll();
                    this.upWalkScroll();
                    this.walkPassage = 7;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.y > roomDoorData[mapNum[this.y][this.x]][i][0]) &&
                    (map[this.y - 1][this.x] == 2 || map[this.y - 1][this.x] == 3) && ((mapData[this.y - 1][this.x] & ENEMYCOORDATA) == 0 && (mapData[this.y - 1][this.x] & PLAYERCOORDATA) == 0)) { //左上に移動できなかったので、上に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.y--;
                    this.upWalkScroll();
                    this.walkPassage = 0;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.y > roomDoorData[mapNum[this.y][this.x]][i][0]) &&
                    (map[this.y][this.x - 1] == 2 || map[this.y][this.x - 1] == 3) && ((mapData[this.y][this.x - 1] & ENEMYCOORDATA) == 0 && (mapData[this.y][this.x - 1] & PLAYERCOORDATA) == 0)) { //左上に移動できなかったので、左に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.x--;
                    this.leftWalkScroll();
                    this.walkPassage = 6;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.y < roomDoorData[mapNum[this.y][this.x]][i][0]) && (map[this.y + 1][this.x - 1] == 2 || map[this.y + 1][this.x - 1] == 3) && (map[this.y][this.x - 1] != 0 && map[this.y][this.x - 1] != 1 && map[this.y + 1][this.x] != 0 && map[this.y + 1][this.x] != 1) &&
                    ((mapData[this.y + 1][this.x - 1] & ENEMYCOORDATA) == 0 && (mapData[this.y + 1][this.x - 1] & PLAYERCOORDATA) == 0)) { //左下に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.x--;
                    this.y++;
                    this.leftWalkScroll();
                    this.downWalkScroll();
                    this.walkPassage = 5;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.y < roomDoorData[mapNum[this.y][this.x]][i][0]) &&
                    (map[this.y + 1][this.x] == 2 || map[this.y + 1][this.x] == 3) && ((mapData[this.y + 1][this.x] & ENEMYCOORDATA) == 0 && (mapData[this.y + 1][this.x] & PLAYERCOORDATA) == 0)) { //左下に移動できなかったので、下に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.y++;
                    this.downWalkScroll();
                    this.walkPassage = 4;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                }
            }
        }
    }
    //下に歩くか？
    upWalkCheck() {
        if (this.walkAlreadyFlag) return; //既に歩いていたらreturn
        for (var i = 0; i < roomDoorData[mapNum[this.y][this.x]].length; i++) {
            if (roomDoorData[mapNum[this.y][this.x]][i][0] == roomCoorData[mapNum[this.y][this.x]][0] - 1) {
                if (this.x == roomDoorData[mapNum[this.y][this.x]][i][1] && ((mapData[this.y - 1][this.x] & ENEMYCOORDATA) == 0 && (mapData[this.y - 1][this.x] & PLAYERCOORDATA) == 0) &&
                    (map[this.y - 1][this.x] == 2 || map[this.y - 1][this.x] == 3)) { //上に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.y--;
                    this.upWalkScroll();
                    this.walkPassage = 0;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.x < roomDoorData[mapNum[this.y][this.x]][i][1]) && (map[this.y][this.x + 1] != 0 && map[this.y][this.x + 1] != 1 && map[this.y - 1][this.x] != 0 && map[this.y - 1][this.x] != 1) &&
                    (map[this.y - 1][this.x + 1] == 2 || map[this.y - 1][this.x + 1] == 3) && ((mapData[this.y - 1][this.x + 1] & ENEMYCOORDATA) == 0 && (mapData[this.y - 1][this.x + 1] & PLAYERCOORDATA) == 0)) { //右上に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.x++;
                    this.y--;
                    this.rightWalkScroll();
                    this.upWalkScroll();
                    this.walkPassage = 1;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.x < roomDoorData[mapNum[this.y][this.x]][i][1]) &&
                    (map[this.y][this.x + 1] == 2 || map[this.y][this.x + 1] == 3) && ((mapData[this.y][this.x + 1] & ENEMYCOORDATA) == 0 && (mapData[this.y][this.x + 1] & PLAYERCOORDATA) == 0)) { //右上に移動できなかったので、右に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.x++;
                    this.rightWalkScroll();
                    this.walkPassage = 2;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.x < roomDoorData[mapNum[this.y][this.x]][i][1]) &&
                    (map[this.y - 1][this.x] == 2 || map[this.y - 1][this.x] == 3) && ((mapData[this.y - 1][this.x] & ENEMYCOORDATA) == 0 && (mapData[this.y - 1][this.x] & PLAYERCOORDATA) == 0)) { //右上に移動できなかったので、右に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.y--;
                    this.upWalkScroll();
                    this.walkPassage = 0;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.x > roomDoorData[mapNum[this.y][this.x]][i][1]) && (map[this.y - 1][this.x - 1] == 2 || map[this.y - 1][this.x - 1] == 3) && (map[this.y][this.x - 1] != 0 && map[this.y][this.x - 1] != 1 && map[this.y - 1][this.x] != 0 && map[this.y - 1][this.x] != 1) &&
                    ((mapData[this.y - 1][this.x - 1] & ENEMYCOORDATA) == 0 && (mapData[this.y - 1][this.x - 1] & PLAYERCOORDATA) == 0)) { //左上に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.x--;
                    this.y--;
                    this.leftWalkScroll();
                    this.upWalkScroll();
                    this.walkPassage = 7;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.x > roomDoorData[mapNum[this.y][this.x]][i][1]) &&
                    (map[this.y][this.x - 1] == 2 || map[this.y][this.x - 1] == 3) && ((mapData[this.y][this.x - 1] & ENEMYCOORDATA) == 0 && (mapData[this.y][this.x - 1] & PLAYERCOORDATA) == 0)) { //左上に移動できなかったので、左に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.x--;
                    this.leftWalkScroll();
                    this.walkPassage = 6;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                }
            }
        }

    }
    //右に歩くか？
    rightWalkCheck() {
        if (this.walkAlreadyFlag) return; //既に歩いていたらreturn
        for (var i = 0; i < roomDoorData[mapNum[this.y][this.x]].length; i++) {
            if (roomDoorData[mapNum[this.y][this.x]][i][1] == roomCoorData[mapNum[this.y][this.x]][3] + 1) {
                if (this.y == roomDoorData[mapNum[this.y][this.x]][i][0] && ((mapData[this.y][this.x + 1] & ENEMYCOORDATA) == 0 && (mapData[this.y][this.x + 1] & PLAYERCOORDATA) == 0) &&
                    (map[this.y][this.x + 1] == 2 || map[this.y][this.x + 1] == 3)) { //右に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.x++;
                    this.rightWalkScroll();
                    this.walkPassage = 2;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.y > roomDoorData[mapNum[this.y][this.x]][i][0]) && (map[this.y][this.x + 1] != 0 && map[this.y][this.x + 1] != 1 && map[this.y - 1][this.x] != 0 && map[this.y - 1][this.x] != 1) &&
                    (map[this.y - 1][this.x + 1] == 2 || map[this.y - 1][this.x + 1] == 3) && ((mapData[this.y - 1][this.x + 1] & ENEMYCOORDATA) == 0 && (mapData[this.y - 1][this.x + 1] & PLAYERCOORDATA) == 0)) { //右上に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.x++;
                    this.y--;
                    this.rightWalkScroll();
                    this.upWalkScroll();
                    this.walkPassage = 1;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.y > roomDoorData[mapNum[this.y][this.x]][i][0]) &&
                    (map[this.y - 1][this.x] == 2 || map[this.y - 1][this.x] == 3) && ((mapData[this.y - 1][this.x] & ENEMYCOORDATA) == 0 && (mapData[this.y - 1][this.x] & PLAYERCOORDATA) == 0)) { //右上に移動できなかったので、上に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.y--;
                    this.upWalkScroll();
                    this.walkPassage = 0;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.y < roomDoorData[mapNum[this.y][this.x]][i][0]) && (map[this.y + 1][this.x + 1] == 2 || map[this.y + 1][this.x + 1] == 3) && (map[this.y][this.x + 1] != 0 && map[this.y][this.x + 1] != 1 && map[this.y + 1][this.x] != 0 && map[this.y + 1][this.x] != 1) &&
                    ((mapData[this.y + 1][this.x + 1] & ENEMYCOORDATA) == 0 && (mapData[this.y + 1][this.x + 1] & PLAYERCOORDATA) == 0)) { //右下に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.x++;
                    this.y++;
                    this.rightWalkScroll();
                    this.downWalkScroll();
                    this.walkPassage = 3;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.y < roomDoorData[mapNum[this.y][this.x]][i][0]) &&
                    (map[this.y + 1][this.x] == 2 || map[this.y + 1][this.x] == 3) && ((mapData[this.y + 1][this.x] & ENEMYCOORDATA) == 0 && (mapData[this.y + 1][this.x] & PLAYERCOORDATA) == 0)) { //右下に移動できなかったので、下に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.y++;
                    this.downWalkScroll();
                    this.walkPassage = 4;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                }
            }
        }

    }
    //上に歩くか？
    downWalkCheck() {
        if (this.walkAlreadyFlag) return; //既に歩いていたらreturn
        for (var i = 0; i < roomDoorData[mapNum[this.y][this.x]].length; i++) {
            if (roomDoorData[mapNum[this.y][this.x]][i][0] == roomCoorData[mapNum[this.y][this.x]][2] + 1) {
                if (this.x == roomDoorData[mapNum[this.y][this.x]][i][1] && ((mapData[this.y + 1][this.x] & ENEMYCOORDATA) == 0 && (mapData[this.y + 1][this.x] & PLAYERCOORDATA) == 0) &&
                    (map[this.y + 1][this.x] == 2 || map[this.y + 1][this.x] == 3)) { //下に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.y++;
                    this.downWalkScroll();
                    this.walkPassage = 4;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if (this.x < roomDoorData[mapNum[this.y][this.x]][i][1] && (map[this.y][this.x + 1] != 0 && map[this.y][this.x + 1] != 1 && map[this.y + 1][this.x] != 0 && map[this.y + 1][this.x] != 1) &&
                    (map[this.y + 1][this.x + 1] == 2 || map[this.y + 1][this.x + 1] == 3) && ((mapData[this.y + 1][this.x + 1] & ENEMYCOORDATA) == 0 && (mapData[this.y + 1][this.x + 1] & PLAYERCOORDATA) == 0)) { //右下に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.x++;
                    this.y++;
                    this.downWalkScroll();
                    this.rightWalkScroll();
                    this.walkPassage = 3;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.x < roomDoorData[mapNum[this.y][this.x]][i][1]) &&
                    (map[this.y][this.x + 1] == 2 || map[this.y][this.x + 1] == 3) && ((mapData[this.y][this.x + 1] & ENEMYCOORDATA) == 0 && (mapData[this.y][this.x + 1] & PLAYERCOORDATA) == 0)) { //右下に移動できなかったので、右に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.x++;
                    this.rightWalkScroll();
                    this.walkPassage = 2;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.x < roomDoorData[mapNum[this.y][this.x]][i][1]) &&
                    (map[this.y + 1][this.x] == 2 || map[this.y + 1][this.x] == 3) && ((mapData[this.y + 1][this.x] & ENEMYCOORDATA) == 0 && (mapData[this.y + 1][this.x] & PLAYERCOORDATA) == 0)) { //右下に移動できなかったので、下に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.y++;
                    this.downWalkScroll();
                    this.walkPassage = 4;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.x > roomDoorData[mapNum[this.y][this.x]][i][1]) && (map[this.y + 1][this.x - 1] == 2 || map[this.y + 1][this.x - 1] == 3) && (map[this.y][this.x - 1] != 0 && map[this.y][this.x - 1] != 1 && map[this.y + 1][this.x] != 0 && map[this.y + 1][this.x] != 1) &&
                    ((mapData[this.y + 1][this.x - 1] & ENEMYCOORDATA) == 0 && (mapData[this.y + 1][this.x - 1] & PLAYERCOORDATA) == 0)) { //左下に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.x--;
                    this.y++;
                    this.leftWalkScroll();
                    this.downWalkScroll();
                    this.walkPassage = 5;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                } else if ((this.x > roomDoorData[mapNum[this.y][this.x]][i][1]) &&
                    (map[this.y][this.x - 1] == 2 || map[this.y][this.x - 1] == 3) && ((mapData[this.y][this.x - 1] & ENEMYCOORDATA) == 0 && (mapData[this.y][this.x - 1] & PLAYERCOORDATA) == 0)) { //左下に移動できなかったので、左に移動
                    mapData[this.y][this.x] -= ENEMYCOORDATA;
                    this.x--;
                    this.leftWalkScroll();
                    this.walkPassage = 6;
                    this.walkAlreadyFlag = true;
                    mapData[this.y][this.x] += ENEMYCOORDATA;
                    
                    break;
                }
            }
        }
    }

    //描画
    draw() {
        if (frameCount % 15 == 0) this.walkCount++;
        if (this.walkCount == 6) {
            this.walkCount = 0;
        }
        // マップスクロール量の更新
        if (this.scrollX > 0) this.scrollX -= DRAWSIZE / ANIMATIONNUM;
        if (this.scrollX < 0) this.scrollX += DRAWSIZE / ANIMATIONNUM;
        if (this.scrollY > 0) this.scrollY -= DRAWSIZE / ANIMATIONNUM;
        if (this.scrollY < 0) this.scrollY += DRAWSIZE / ANIMATIONNUM;

        let enemyScreenX = this.x * DRAWSIZE;
        let enemyScreenY = this.y * DRAWSIZE;

        // 視界の中心（プレイヤーの画面上の位置）
        let radius = 90; // 視界の半径

        // 敵の位置が視界円の内部か判定
        let dx = enemyScreenX - (player.x * DRAWSIZE);
        let dy = enemyScreenY - (player.y * DRAWSIZE);
        let distance = Math.sqrt(dx * dx + dy * dy);

        let enemyDrawFlag = false;
        let enemyDrawFlagPassage = false;

        let startX = Math.floor((canvas.width - MAPDRAWWIDTH * DRAWSIZE) / 2);
        let startY = Math.floor((canvas.height - MAPDRAWHEIGHT * DRAWSIZE) / 2);
        switch (map[this.y][this.x]) {
            case 2:
                for (let i = 0; i < roomDoorData[mapNum[this.y][this.x]].length; i++) {
                    if (player.y == roomDoorData[mapNum[this.y][this.x]][i][0] && player.x == roomDoorData[mapNum[this.y][this.x]][i][1] &&
                        Math.abs(player.y - this.y) < 2 && Math.abs(player.x - this.x) < 2
                    ) {
                        enemyDrawFlagPassage = true;
                        break;
                    }
                }
                if (mapNum[this.y][this.x] == mapNum[player.y][player.x] || enemyDrawFlagPassage) {
                    // マップチップの描画
                    let x = (scrollX != 0) ? scrollX / 4 : this.scrollX / 4;
                    let y = (scrollY != 0) ? scrollY / 4 : this.scrollY / 4;
                    console.log(this.x, this.y, enemyDrawFlag, enemyDrawFlagPassage);
                    g.drawImage(
                        this.img[this.walkPassage],
                        (this.walkCount % 7) * 320,
                        0,
                        320,
                        320,
                        startX + (this.x - player.x) * DRAWSIZE + Math.floor(MAPDRAWWIDTH / 2) * DRAWSIZE + x,
                        startY + (this.y - player.y) * DRAWSIZE + Math.floor(MAPDRAWHEIGHT / 2) * DRAWSIZE + y,
                        DRAWSIZE,
                        DRAWSIZE
                    );
                }
                break;
            case 3:
                enemyDrawFlag = mapNum[this.y][this.x] == mapNum[player.y][player.x] ? true : false;
                enemyDrawFlag = Math.abs(this.x - player.x) < 5 && Math.abs(this.y - player.y) < 5 ? true : false;
                for (let i = 0; i < roomDoorData[mapNum[player.y][player.x]].length; i++) {
                    if (this.y == roomDoorData[mapNum[player.y][player.x]][i][0] && this.x == roomDoorData[mapNum[player.y][player.x]][i][1]) {
                        enemyDrawFlagPassage = true;
                        break;
                    }
                }
                if ((distance < radius + DRAWSIZE / 2 && enemyDrawFlag) || enemyDrawFlagPassage) { // 一部でも円にかかっていれば描画
                    let x = (scrollX != 0) ? scrollX / 4 : this.scrollX / 4;
                    let y = (scrollY != 0) ? scrollY / 4 : this.scrollY / 4;
                    console.log(this.x, this.y, enemyDrawFlag, enemyDrawFlagPassage)
                    g.drawImage(
                        this.img[this.walkPassage],
                        (this.walkCount % 7) * 320,
                        0,
                        320,
                        320,
                        startX + (this.x - player.x) * DRAWSIZE + Math.floor(MAPDRAWWIDTH / 2) * DRAWSIZE + x,
                        startY + (this.y - player.y) * DRAWSIZE + Math.floor(MAPDRAWHEIGHT / 2) * DRAWSIZE + y,
                        DRAWSIZE,
                        DRAWSIZE
                    );
                }
                break;
        }
    }
    changeNumber(listNumber) {
        if (this.number >= listNumber) {
            this.number--;
        }
    }
}
