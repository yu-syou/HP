let ItemData = [ //listNumber name,imgName, type, usesCount, attribute, baseAttack, baseDefence, distWear
    /* type 0:武器 1:防具 2:射撃系 3:ノーマル 4:装備強化アイテム 5:食料 (6:壺 ?)
     usesCount :使用回数
     attribute :属性 0:万能 1:火 2:草 3:水
     baseAttack :基礎攻撃力(+usesCount)
     baseDefense :基礎防御力(+usesCount)
     distWear :装備中かそうでないか*/
    [0, "薬草", "herbs0", 6, 1, 0, 10, 0, false],
    [1, "薬草2", "herbs1", 6, 1, 9, 20, 0, false],
    [2, "石の剣", "stoneSword", 0, 1, 1, 1, 1, false],
    [3, "石の盾", "stoneShield", 1, 1, 1, 1, 1, false],
];
const ITEM_DESCRIPTION = [
    "HPが10回復する",
    "HPが20回復する",
    "なし",
    "なし",
];
let clashNumber = 0;

class ItemList {
    constructor() {
        this.x; //x座標
        this.y; //y座標
        this.direction; //向き
        this.ListNumber; //リスト番号
        this.name; //名前
        this.type; //種類
        this.usesCount; //使用回数
        this.attribute; //属性
        this.baseAttack; //基礎攻撃力
        this.baseDefense; //基礎防御力
        this.flagWear; //装備中か?
        this.description; //効果説明
        this.img = new Image(); //画像
        this.imgMini = new Image(); //ミニマップ用画像
        this.throwDistance; //投げる距離
        this.throwAnimationFrame; //投げるアニメーションフレーム
        this.throwFallFlag; //投げた時の衝突
        this.throwEnemyClashFlag; //投げた時の敵との衝突
        this.animationX; //アニメーション用X座標
        this.animationY; //アニメーション用Y座標
    }
    set(y, x, number) {
        this.y = y;
        this.x = x;
        this.direction = 0;
        this.ListNumber = ItemData[number][0];
        this.name = ItemData[number][1];
        this.img.src = "./itemImage/" + ItemData[number][2] + ".png";
        this.type = ItemData[number][3];
        this.usesCount = ItemData[number][4];
        this.attribute = ItemData[number][5];
        this.baseAttack = ItemData[number][6];
        this.baseDefense = ItemData[number][7];
        this.flagWear = ItemData[number][8];
        this.description = ITEM_DESCRIPTION[ItemData[number][0]];
        this.imgMini.src = "./mapTip/miniMapItem.png";
        this.throwDistance = 0;
        this.throwAnimationFrame = 0;
        this.throwFallFlag = false;
        this.throwEnemyClashFlag = false;
        this.animationX = 0;
        this.animationY = 0;
    }

    put() {
        const canItemPut = [
            [0, 0],
            [-1, 0], [-1, 1], [0, 1], [1, 1],
            [1, 0], [1, -1], [0, -1], [-1, -1],
        ];
        let i = 0;
        let flag = false;
        while (!(flag) && i < canItemPut.length) {
            if ((mapData[player.y + canItemPut[i][0]][player.x + canItemPut[i][1]] & ITEMCOORDATA) == 0 &&
                (mapData[player.y + canItemPut[i][0]][player.x + canItemPut[i][1]] & STAIRCOORDATA) == 0 &&
                (mapData[player.y + canItemPut[i][0]][player.x + canItemPut[i][1]] & TRAPCOORDATA) == 0 &&
                (map[player.y + canItemPut[i][0]][player.x + canItemPut[i][1]] != 0) &&
                (map[player.y + canItemPut[i][0]][player.x + canItemPut[i][1]] != 1)) {
                menuPointer = 0;
                flag = true;
                this.y = player.y + canItemPut[i][0];
                this.x = player.x + canItemPut[i][1];
            }
            i++;
        }
        scene = Scenes.Event;
        if (flag) { happenEvent(4, this.name, selectItemNumber); }
        else { happenEvent(5, "アイテムを置く場所がない", 0); }
    }
    clashWall() {
        const canItemPut = [
            [0, 0],
            [-1, 0], [-1, 1], [0, 1], [1, 1],
            [1, 0], [1, -1], [0, -1], [-1, -1],
        ];
        let i = 0;
        let flag = false;
        while (!(flag) && i < canItemPut.length) {
            if ((mapData[this.y + canItemPut[i][0]][this.x + canItemPut[i][1]] & ITEMCOORDATA) == 0 &&
                (mapData[this.y + canItemPut[i][0]][this.x + canItemPut[i][1]] & STAIRCOORDATA) == 0 &&
                (mapData[this.y + canItemPut[i][0]][this.x + canItemPut[i][1]] & TRAPCOORDATA) == 0 &&
                (map[this.y + canItemPut[i][0]][this.x + canItemPut[i][1]] != 0) &&
                (map[this.y + canItemPut[i][0]][this.x + canItemPut[i][1]] != 1)) {
                menuPointer = 0;
                flag = true;
                this.y += canItemPut[i][0];
                this.x += canItemPut[i][1];
            }
            i++;
        }
        scene = Scenes.Event;
    }

    throwBegin() { //投げる
        scene = Scenes.ItemThrow;
        this.throwDistance = 0;
        this.throwAnimationFrame = 10;
        this.y = player.y;
        this.x = player.x;
        this.direction = player.direction;
    }

    throw() {
        const throwDirection = [
            [0, -1, 0, -10],
            [1, -1, 10, -10], [1, 0, 10, 0], [1, 1, 10, 10], [0, 1, 0, 10],
            [-1, 1, -10, 10], [-1, 0, -10, 0], [-1, -1, -10, -10],
        ];
        if (this.throwAnimationFrame == 10) {
            switch (map[this.y + throwDirection[this.direction][1]][this.x + throwDirection[this.direction][0]]) {
                case 0:
                case 1:
                    this.throwFallFlag = true;
                    break;
                case 2:
                case 3:
                    if (mapData[this.y + throwDirection[this.direction][1]][this.x + throwDirection[this.direction][0]] & ENEMYCOORDATA != 0) {
                        for (let i = 0; i < enemyList.length; i++) {
                            if (enemyList[i].y == this.y + throwDirection[this.direction][1] && enemyList[i].x == this.x + throwDirection[this.direction][0]) {
                                clashNumber = i;
                                this.throwEnemyClashFlag = true;
                                break;
                            }
                        }
                    }
                    break;
            }
        }
        this.throwAnimationFrame--;
        if (!this.throwFallFlag) {
            this.animationX += (throwDirection[this.direction][2] / 10) * 7;
            this.animationY += (throwDirection[this.direction][3] / 10) * 7;
        }

        if (this.throwFallFlag || this.throwDistance >= 10) {
            happenEvent(8, this.name, selectItemNumber);
        }
        if(this.throwEnemyClashFlag){
            happenEvent(9, enemyList[clashNumber].name, selectItemNumber);
        }
        console.log(this.animationX, this.animationY);
        let distanceX = this.x - player.x < 0 ? 5 - (player.x - this.x) : this.x - player.x + 5;
        let distanceY = this.y - player.y < 0 ? 5 - (player.y - this.y) : this.y - player.y + 5;
        g.drawImage(
            this.img,
            distanceX * DRAWSIZE + this.animationX - 25,
            distanceY * DRAWSIZE + this.animationY - 25,
            DRAWSIZE,
            DRAWSIZE);
        if (this.throwAnimationFrame == 0) {
            this.y += throwDirection[this.direction][1];
            this.x += throwDirection[this.direction][0];
            this.throwDistance++;
            this.throwAnimationFrame = 10;
            this.animationX = 0;
            this.animationY = 0;
            
        }
    }

}

