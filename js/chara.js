class Character {
    constructor() {
        this.x;
        this.y;
        this.level;
        this.atk;
        this.def;
        this.hp;
        this.maxHp;
        this.exp;
        this.direction; //向いている方角　北から時計回りに8方向(0 ~ 7)
        this.img = [9];
        this.directionDoor;
        this.walkCount;
        this.walkImage;
        this.ImageDoor;
        this.atkFlag;
        this.floorNumber; //現在の階層
        this.money; //所持金
        this.abnormalState; //状態異常
        this.iceStateCount; //凍結状態のカウント
        this.iceStateFrame = 0; //凍結状態のフレーム
    }

    init() {
        this.x = getRandomInt(MAPWIDTH);
        this.y = getRandomInt(MAPHEIGHT);
        while (map[this.y][this.x] != 2) {
            this.x = getRandomInt(MAPWIDTH);
            this.y = getRandomInt(MAPHEIGHT);
        }
        mapData[this.y][this.x] += PLAYERCOORDATA;
        this.direction = 0; //向いている方角　北から時計回りに8方向(0 ~ 7)
        for (var i = 0; i < 9; i++) {
            this.img[i] = new Image();
            this.img[i].src = "./playerImage/ex" + i + ".png";
        }
        this.directionDoor = [];
        this.walkCount = 0;
        this.walkImage = [0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1];
        this.ImageDoor = [
            [0, 0, 200, 300],
            [300, 0, 250, 300],
            [600, 0, 250, 300],
        ];
        this.floorNumber = 1;
        this.money = 0;
        this.abnormalState = false; //状態異常
        this.iceStateCount = 0; //凍結状態のカウント
        this.stateImage = new Image();
        this.stateImage.src = "./playerImage/ice2.png";
    }
    statusInit(){
        this.level = 1;
        this.atk = this.level * 2 + 99;
        this.def = 1;
        this.hp = 15;
        this.maxHp = 150;
        this.exp = 1;
        this.atkFlag = false;
    }

    mapChangeInit(){
        this.direction = 0;
        this.x = getRandomInt(MAPWIDTH);
        this.y = getRandomInt(MAPHEIGHT);
        while (map[this.y][this.x] != 2) {
            this.x = getRandomInt(MAPWIDTH);
            this.y = getRandomInt(MAPHEIGHT);
        }
        mapData[this.y][this.x] += PLAYERCOORDATA;
    }

    step(){
        turn++;
        turnEnemy = true;
        if(aPress) !aPress;
    }

    attack(){
        if (!this.checkHit()) {
            turnEnemy = true;
            zPress = false;
            directionFlag = false;
            turn++;
            return;
        }
        let attackFlag = false;
        let enemyTerms = [
            [(this.y - 1), this.x],
            [(this.y - 1), (this.x + 1)],
            [this.y, (this.x + 1)],
            [(this.y + 1), (this.x + 1)],
            [(this.y + 1), (this.x)],
            [(this.y + 1), (this.x - 1)],
            [this.y, (this.x - 1)],
            [(this.y - 1), (this.x - 1)]
        ];
        for (let i = 0; i < currentEnemy; i++) {
            if (enemyList[i].y == enemyTerms[this.direction][0] && enemyList[i].x == enemyTerms[this.direction][1]) {
                happenEvent(0, enemyList[i].name, i);
                console.log(i);
                break;
            }
        }
        if (!attackFlag) {
            turnEnemy = true;
            zPress = false;
            directionFlag = false;
            turn++;
            return;
        } else {
            return;
        }
    }

    stateConfirm(){ //状態異常処理
        //凍結状態の解除
        this.abnormalState = this.abnormalState ? false : this.abnormalState;
    }

    //壁に阻まれていないか？
    checkHit(){
        switch (this.direction) {
        case 1:
            if ((map[this.y - 1][this.x] == 0 || map[this.y - 1][this.x] == 1) || (map[this.y][this.x + 1] == 0 || map[this.y][this.x + 1] == 1)) {
                return false;
            } else return true;
        case 3:
            if ((map[this.y + 1][this.x] == 0 || map[this.y + 1][this.x] == 1) || (map[this.y][this.x + 1] == 0 || map[this.y][this.x + 1] == 1)) {
                return false;
            } else return true;
        case 5:
            if ((map[this.y + 1][this.x] == 0 || map[this.y + 1][this.x] == 1) || (map[this.y][this.x - 1] == 0 || map[this.y][this.x - 1] == 1)) {
                return false;
            } else return true;
        case 7:
            if ((map[this.y - 1][this.x] == 0 || map[this.y - 1][this.x] == 1) || (map[this.y][this.x - 1] == 0 || map[this.y][this.x - 1] == 1)) {
                return false;
            } else return true;
        default:
            return true;
    }
    }

    directionCheck(){
        this.direction = this.returnDirection();
    }

    returnDirection(){
        if (upPress && rightPress) {
            this.directionDoor[0] = -44;
            this.directionDoor[1] = 44;
            return 1;
        } else if (downPress && rightPress) {
            this.directionDoor[0] = 44;
            this.directionDoor[1] = 44;
            return 3;
        } else if (downPress && leftPress) {
            this.directionDoor[0] = 44;
            this.directionDoor[1] = -44;
            return 5;
        } else if (leftPress && upPress) {
            this.directionDoor[0] = -44;
            this.directionDoor[1] = -44;
            return 7;
        } else if (upPress) {
            this.directionDoor[0] = -44;
            this.directionDoor[1] = 0;
            return 0;
        } else if (rightPress) {
            this.directionDoor[0] = 0;
            this.directionDoor[1] = 44;
            return 2;
        } else if (downPress) {
            this.directionDoor[0] = 44;
            this.directionDoor[1] = 0;
            return 4;
        } else if (leftPress) {
            this.directionDoor[0] = 0;
            this.directionDoor[1] = -44;
            return 6;
        } else {
            switch (this.direction) {
                case 0:
                    this.directionDoor[0] = -44;
                    this.directionDoor[1] = 0;
                    break;
                case 1:
                    this.directionDoor[0] = -44;
                    this.directionDoor[1] = 44;
                    break;
                case 2:
                    this.directionDoor[0] = 0;
                    this.directionDoor[1] = 44;
                    break;
                case 3:
                    this.directionDoor[0] = 44;
                    this.directionDoor[1] = 44;
                    break;
                case 4:
                    this.directionDoor[0] = 44;
                    this.directionDoor[1] = 0;
                    break;
                case 5:
                    this.directionDoor[0] = 44;
                    this.directionDoor[1] = -44;
                    break;
                case 6:
                    this.directionDoor[0] = 0;
                    this.directionDoor[1] = -44;
                    break;
                case 7:
                    this.directionDoor[0] = -44;
                    this.directionDoor[1] = -44;
                    break;
            }
            return this.direction;
        }
    }

    walkUpper(coorData, animationData){
        if ((map[this.y - 1][this.x] == 0 || map[this.y - 1][this.x] == 1) || (mapData[this.y - 1][this.x] & ENEMYCOORDATA) != 0) { this.direction = 0; return; }
        coorData[0] = (this.y - 1 + MAPHEIGHT) % MAPHEIGHT;
        animationData[0] = -1;
        turn++;
        turnEnemy = true;
        this.direction = 0;
    }
    walkUpperRight(coorData, animationData){
        if (((map[this.y - 1][this.x + 1] == 0 ||
            map[this.y - 1][this.x + 1] == 1) ||
            (map[this.y - 1][this.x] == 0 ||
                map[this.y - 1][this.x] == 1) ||
            (map[this.y][this.x + 1] == 0 ||
                map[this.y][this.x + 1] == 1) ||
            (mapData[this.y - 1][this.x + 1] & ENEMYCOORDATA) != 0)
        ) { this.direction = 1; return; }
        coorData[0] = (this.y - 1 + MAPWIDTH) % MAPWIDTH;
        coorData[1] = (this.x + 1 + MAPWIDTH) % MAPWIDTH;
        animationData[1] = 1;
        animationData[0] = -1;
        turn++;
        turnEnemy = true;
        this.direction = 1;

    }
    walkRight(coorData, animationData){
        if ((map[this.y][this.x + 1] == 0 || map[this.y][this.x + 1] == 1) || (mapData[this.y][this.x + 1] & ENEMYCOORDATA) != 0) { this.direction = 2; return; }
        coorData[1] = (this.x + 1) % MAPWIDTH;
        animationData[1] = 1;
        turn++;
        turnEnemy = true;
        this.direction = 2;
    }
    walkLowerRight(coorData, animationData){
        if (((map[this.y + 1][this.x + 1] == 0 ||
            map[this.y + 1][this.x + 1] == 1) ||
            (map[this.y + 1][this.x] == 0 ||
                map[this.y + 1][this.x] == 1) ||
            (map[this.y][this.x + 1] == 0 ||
                map[this.y][this.x + 1] == 1) ||
            (mapData[this.y + 1][this.x + 1] & ENEMYCOORDATA) != 0)
        ) { this.direction = 3; return; }
        coorData[0] = (this.y + 1 + MAPWIDTH) % MAPWIDTH;
        coorData[1] = (this.x + 1 + MAPWIDTH) % MAPWIDTH;
        animationData[1] = 1;
        animationData[0] = 1;
        turn++;
        turnEnemy = true;
        this.direction = 3;
    }
    walkLower(coorData, animationData){
        if ((map[this.y + 1][this.x] == 0 || map[this.y + 1][this.x] == 1) || (mapData[this.y + 1][this.x] & ENEMYCOORDATA) != 0) { this.direction = 4; return; }
        coorData[0] = (this.y + 1) % MAPHEIGHT;
        animationData[0] = 1;
        turn++;
        turnEnemy = true;
        this.direction = 4;
    }
    walkUpperLeft(coorData, animationData){
        if ((map[this.y - 1][this.x - 1] == 0 ||
            map[this.y - 1][this.x - 1] == 1) ||
            (map[this.y - 1][this.x] == 0 ||
                map[this.y - 1][this.x] == 1) ||
            (map[this.y][this.x - 1] == 0 ||
                map[this.y][this.x - 1] == 1) ||
            (mapData[this.y - 1][this.x - 1] & ENEMYCOORDATA) != 0) { this.direction = 7; return; }
        coorData[0] = (this.y - 1 + MAPWIDTH) % MAPWIDTH;
        coorData[1] = (this.x - 1 + MAPWIDTH) % MAPWIDTH;
        animationData[1] = -1;
        animationData[0] = -1;
        turn++;
        turnEnemy = true;
        this.direction = 7;
    }
    walkLeft(coorData, animationData){
        if ((map[this.y][this.x - 1] == 0 || map[this.y][this.x - 1] == 1) || (mapData[this.y][this.x - 1] & ENEMYCOORDATA) != 0) { this.direction = 6; return; }
        coorData[1] = (this.x - 1 + MAPWIDTH) % MAPWIDTH;
        animationData[1] = -1;
        turn++;
        turnEnemy = true;
        this.direction = 6;
    }
    walkLowerLeft(coorData, animationData){
        if (((map[this.y + 1][this.x - 1] == 0 ||
            map[this.y + 1][this.x - 1] == 1) ||
            (map[this.y + 1][this.x] == 0 ||
                map[this.y + 1][this.x] == 1) ||
            (map[this.y][this.x - 1] == 0 ||
                map[this.y][this.x - 1] == 1) ||
            (mapData[this.y + 1][this.x - 1] & ENEMYCOORDATA) != 0)
        ) { this.direction = 5; return; }
        coorData[0] = (this.y + 1 + MAPWIDTH) % MAPWIDTH;
        coorData[1] = (this.x - 1 + MAPWIDTH) % MAPWIDTH;
        animationData[1] = -1;
        animationData[0] = 1;
        turn++;
        turnEnemy = true;
        this.direction = 5;
    }


}




