var canvas, canvas2, g;
var maptip;
var map; //マップデータ1 0,1:壁 2:部屋 3:通路
var areaList = []; //マップデータ2 部屋を保持
var mapNum = []; //マップデータ3 部屋の番号を保持
var mapData = []; //マップデータ4 0:何にもない 1:敵 2:プレイヤー 4:階段 8:アイテム 16:罠
let Item = []; //アイテムリスト
let playerItemList = []; //プレイヤーアイテムリスト
var roomCount = 0; //マップの部屋数
var roomCountMax = 0; //最大部屋数
var roomCoorData = []; //各部屋のデータ 最小y座標,最小x座標/最大y座標,最大x座標
var roomDoorData = []; //各部屋のデータ 部屋と通路の出入り口(y,x)
var player; //プレイヤー
var enemyList = []; //敵のリスト
const MAPWIDTH = 64; //マップの横幅
const MAPHEIGHT = 64; //マップの縦幅
const MAPDRAWWIDTH = 31; //描画するマップの横幅
const MAPDRAWHEIGHT = 31; //描画するマップの縦幅
const DRAWSIZE = 64; //マップチップのサイズ
const ANIMATIONNUM = 8; //アニメーションの数
const MIN_ROOM_SIZE = 4; //部屋の最小サイズ
const MAX_ROOM_SIZE = 8; //部屋の最大サイズ
const MIN_SPACE_BETWEEN_ROOM_AND_ROAD = 2; //部屋と通路の余白

// シーンの定義
const Scenes = {
    Field: "Field",
    Menu: "Menu",
    ItemMenu: "ItemMenu",
    doWithItem: "DoWithItem",
    selectEquipmentPart: "selectEquipmentPart",
    StatusMenu: "StatusMenu",
    Event: "Event",
    doOnStair: "DoOnStair",
    doOnTrap: "DoOnTrap",
    ItemThrow: "ItemThrow",
    Change: "Change",
};
var scrollX = scrollY = 0; //軸スクロール量
var frameCount; //プレイヤー歩行アニメーションカウント
var scene; //シーン定義
var currentEnemy = 0; //場にいる敵の数
var playerItemNumber = 0; //プレイヤーアイテム数
let selectItemNumber = 0;
var turn = 1; //ターン数(50で敵沸き)
var turnS; //ターン数表示
var leftPress, upPress, rightPress, downPress, zPress, aPress, xPress, stepFlag, directionFlag; //キー入力フラグ
leftPress = upPress = rightPress = downPress = zPress = aPress = xPress = stepFlag = directionFlag = false; //初期化
var keyDown, keyUp; //キーイベント取得
var enemySpawn = true; //敵沸きフラグ いらないかも
var turnEnemy = false; //敵の行動フラグ
var walkFlag = false; //敵の行動フラグ
var img2 = new Image(); //プレイヤーの向き
img2.src = "./playerDirection/arrow0.png";
var TalkingEvent; //メッセージイベントクラス
const stairImage = new Image(); //階段画像
stairImage.src = "./mapTip/stair.png";
const miniMap = new Image(); //ミニマップ画像
miniMap.src = "./mapTip/maptip11.png";
const miniStairImage = new Image(); //ミニマップ階段画像
miniStairImage.src = "./mapTip/miniMapStair.png";
var changeCount = 60; //マップチェンジカウント
let gameLoopFunction; //ゲームループ関数再呼び出し
let mapChangeFunction; //マップチェンジ関数再呼び出し
const NONCOORDATA = 0b0;  //未使用
const ENEMYCOORDATA = 0b01; //敵用データ
const PLAYERCOORDATA = 0b10; //プレイヤー用データ
const STAIRCOORDATA = 0b100; //階段用データ
const ITEMCOORDATA = 0b1000; //アイテム用データ
const TRAPCOORDATA = 0b10000; //未使用
const MINIMAPCOORDATA = 0b100000; //ミニマップ用データ
var menuPointer = 0; //メニュー用ポインタ
let restartEnemyProcessNumber = 0; //プレイヤーの処理が終わった後に再開させるエネミーリストの番号

onload = function () {
    // 描画コンテキストの取得
    canvas = document.getElementById("gamecanvas");
    canvas2 = document.getElementById("canvas2");
    g = canvas.getContext("2d");
    turnS = document.getElementById("turn");
    // 初期化
    player = new Character(); //プレイヤークラス
    init();
    playerItemNumber = 0;
    for (let i = 0; i < 20; i++) {
        Item[0] = new ItemList();
        Item[0].set(0, 0, getRandomInt(3));
        playerItemList[i] = Item[0];
        playerItemList[playerItemNumber].number = playerItemNumber;
        playerItemNumber++;
        Item.splice(0, 1);
    }
    // 入力処理の指定
    document.onkeydown = keydown;
    document.onkeyup = keyup;
    // ゲームループの設定 60FPS
    for (let i = 0; i < roomDoorData.length; i++) {
        for (let j = 0; j < roomDoorData[i].length; j++) {
            for (let k = 0; k < roomDoorData[i].length; k++) {
                if (j != k && roomDoorData[i][j][0] == roomDoorData[i][k][0] && roomDoorData[i][j][1] == roomDoorData[i][k][1]) {
                    roomDoorData[i].splice(k, 1);
                }
            }

        }
    }
    gameLoopFunction = setInterval(gameloop, 16);
};

function init() {

    areaList = [];
    mapNum = [];
    mapData = [];
    roomCount = 0;
    roomCountMax = 0;
    roomCoorData = [];
    roomDoorData = [];
    enemyList = [];
    currentEnemy = 0;
    turn = 1;
    turnEnemy = false;

    // マップの定義  0黒 1壁 2床(部屋) 3床(通路)
    createMap();

    // マップチップの読込
    maptip = [];
    for (var i = 0; i < 4; i++) {
        maptip[i] = new Image();
        maptip[i].src = "./mapTip/maptip" + i + ".png";
    }

    // スプライトの初期化

    enemy = new Enemy();
    enemy.init(currentEnemy);
    enemyList[currentEnemy] = enemy;
    enemyList[currentEnemy].number = currentEnemy;
    mapData[enemyList[currentEnemy].y][enemyList[currentEnemy].x] += ENEMYCOORDATA;
    currentEnemy++;
    player.init();
    player.statusInit();



    let x = getRandomInt(MAPWIDTH);
    let y = getRandomInt(MAPHEIGHT);
    while (map[y][x] != 2) {
        x = getRandomInt(MAPWIDTH);
        y = getRandomInt(MAPHEIGHT);
    }
    mapData[y][x] += STAIRCOORDATA;

    // キャラ画像読込


    Item[0] = new ItemList();
    x = getRandomInt(MAPWIDTH);
    y = getRandomInt(MAPHEIGHT);
    while ((mapData[y][x] & STAIRCOORDATA) != 0 || (map[y][x] == 0 || map[y][x] == 1 || map[y][x] == 3)) {
        x = getRandomInt(MAPWIDTH);
        y = getRandomInt(MAPHEIGHT);
    }
    Item[0].set(y, x, getRandomInt(3));
    mapData[Item[0].y][Item[0].x] += ITEMCOORDATA;



    // その他
    scrollX = 0;
    scrollY = 0;
    frameCount = 0;
    scene = Scenes.Field;
    TalkingEvent = new GameEvent();
}

function mapChangeInit() { //マップチェンジ時の初期化
    areaList = [];
    mapNum = [];
    mapData = [];
    roomCount = 0;
    roomCountMax = 0;
    roomCoorData = [];
    roomDoorData = [];
    enemyList = [];
    currentEnemy = 0;
    turn = 1;
    turnEnemy = false;

    // マップの定義  0黒 1壁 2床(部屋) 3床(通路)
    createMap();

    // マップチップの読込
    maptip = [];
    for (var i = 0; i < 4; i++) {
        maptip[i] = new Image();
        maptip[i].src = "./mapTip/maptip" + i + ".png";
    }

    // スプライトの初期化

    enemy = new Enemy();
    enemy.init(currentEnemy);
    enemyList[currentEnemy] = enemy;
    enemyList[currentEnemy].number = currentEnemy;
    mapData[enemyList[currentEnemy].y][enemyList[currentEnemy].x] += ENEMYCOORDATA;
    currentEnemy++;
    player.mapChangeInit();



    let x = getRandomInt(MAPWIDTH);
    let y = getRandomInt(MAPHEIGHT);
    while (map[y][x] != 2) {
        x = getRandomInt(MAPWIDTH);
        y = getRandomInt(MAPHEIGHT);
    }
    mapData[y][x] += STAIRCOORDATA;

    // キャラ画像読込


    Item[0] = new ItemList();
    x = getRandomInt(MAPWIDTH);
    y = getRandomInt(MAPHEIGHT);
    while ((mapData[y][x] & STAIRCOORDATA) != 0 || (map[y][x] == 0 || map[y][x] == 1 || map[y][x] == 3)) {
        x = getRandomInt(MAPWIDTH);
        y = getRandomInt(MAPHEIGHT);
    }
    Item[0].set(y, x, getRandomInt(3));
    mapData[Item[0].y][Item[0].x] += ITEMCOORDATA;



    // その他
    scrollX = 0;
    scrollY = 0;
    frameCount = 0;
    scene = Scenes.Field;
    TalkingEvent = new GameEvent();
}
// マップデータ生成
function createMap() {
    // マップを黒い背景で初期化
    map = new Array(MAPHEIGHT);
    mapNum = new Array(MAPHEIGHT);
    mapData = new Array(MAPHEIGHT);
    for (var i = 0; i < MAPHEIGHT; i++) {
        map[i] = new Array(MAPWIDTH).fill(0);
        mapNum[i] = new Array(MAPWIDTH).fill(0);
        mapData[i] = new Array(MAPWIDTH).fill(0);
    }
    // マップ中央部分にダンジョンを自動生成する範囲を設定

    //最初のエリア設定
    InitFirstArea();
    // マップ自動生成
    devideArea(getRandomInt(2) == 0);
    //歩行可能チップと歩行不可チップの間に壁を設定
    for (var i = 0; i < MAPHEIGHT - 1; i++) {
        for (var j = 0; j < MAPWIDTH; j++) {
            if ((map[i][j] == 0 && map[i + 1][j] == 2) ||
                (map[i][j] == 0 && map[i + 1][j] == 3)) {
                map[i][j] = 1;
            }
        }
    }
    createRoom();
    while (roomCount < 6) {
        for (var i = 0; i < MAPHEIGHT; i++) {
            map[i] = new Array(MAPWIDTH).fill(0);
            mapNum[i] = new Array(MAPWIDTH).fill(0);
            mapData[i] = new Array(MAPWIDTH).fill(0);
        }
        areaList = [];
        roomCount = 0;
        roomCountMax = 0;
        InitFirstArea();
        devideArea(getRandomInt(2) == 0);
        createRoom();
    }
    ConnectRooms();
    for (var i = 0; i < MAPHEIGHT - 1; i++) {
        for (var j = 0; j < MAPWIDTH; j++) {
            if ((map[i][j] == 0 && map[i + 1][j] == 2) ||
                (map[i][j] == 0 && map[i + 1][j] == 3)) {
                map[i][j] = 1;
            }
        }
    }
}

function InitFirstArea() {
    var area = new Area();
    area.firstX = getRandomInt(10) + 10;
    area.firstY = getRandomInt(10) + 10;
    area.endX = getRandomInt(5) + 45;
    area.endY = getRandomInt(5) + 45;
    area.size = (area.endX - area.firstX) * (area.endY - area.firstY);
    areaList.push(area);
}
// 指定領域を指定した方向に分割し、部屋を生成する
function devideArea(hr) {
    var parentArea = new Area();
    parentArea = areaList.slice(-1)[0]; //末尾エリアを取り出す
    if (parentArea == null) return;
    areaList.pop();

    //分割方向に応じる
    var childArea = new Area();
    hr ? childArea = DivideHorizontally(parentArea) : childArea = DivideVertially(parentArea);

    if (childArea != null) {

        if (parentArea.size > childArea.size) { //親領域が大きければ、次に分割されるのは親領域
            areaList.push(childArea);
            areaList.push(parentArea);
        } else { //でなければ次に分割されるのは子領域
            areaList.push(parentArea);
            areaList.push(childArea);
        }
        if (getRandomInt(2) == 0) devideArea(!hr);
        else devideArea(hr);

    }
}
//並行分割
function DivideHorizontally(area) {
    if (!(checkAreaSize(area.endY - area.firstY))) { //十分な高さに対応していない
        areaList.push(area);
        return null;
    }
    var divideLine = CalculateDivideLine(area.firstY, area.endY);
    var childArea = new Area();
    //子エリアSectionの上下左右座標を登録する
    childArea.firstX = area.firstX;
    childArea.firstY = divideLine;
    childArea.endX = area.endX;
    childArea.endY = area.endY;
    childArea.size = (childArea.endX - childArea.firstX) * (childArea.endY - childArea.firstY);
    //親エリアのSectionの下座標を分割ラインに設定する
    area.endY = divideLine;
    return childArea;
}
//垂直分割
function DivideVertially(area) {
    if (!(checkAreaSize(area.endX - area.firstX))) { //十分な高さに対応していない
        areaList.push(area);
        return null;
    }
    var divideLine = CalculateDivideLine(area.firstX, area.endX);
    var childArea = new Area();
    //子エリアSectionの上下左右座標を登録する
    childArea.firstX = divideLine;
    childArea.firstY = area.firstY;
    childArea.endX = area.endX;
    childArea.endY = area.endY;
    childArea.size = (childArea.endX - childArea.firstX) * (childArea.endY - childArea.firstY);
    //親エリアのSectionの下座標を分割ラインに設定する
    area.endX = divideLine;
    return childArea;
}
//領域が分割できるか
function checkAreaSize(size) {
    //分割に必要となる最低限の大きさ計算
    //最小の部屋サイズ＋区画のマージンを*2（2分割するため）＋1（道幅）
    var min = (MIN_ROOM_SIZE + MIN_SPACE_BETWEEN_ROOM_AND_ROAD) * 2 + 1;
    //渡ってきたsizeと最低限の大きさを比較してboolを返却
    if (size >= min) return true;
    else return false;
}
function CalculateDivideLine(start, end) {
    //分割する最小値を計算
    //startに部屋の最小サイズと部屋と通路までの余白を足して算出
    var min = start + (MIN_ROOM_SIZE + MIN_SPACE_BETWEEN_ROOM_AND_ROAD);

    //分割する最大値を計算
    //endから部屋の最小サイズと部屋と通路までの余白の合計を引いて算出
    var max = end - (MIN_ROOM_SIZE + MIN_SPACE_BETWEEN_ROOM_AND_ROAD);

    //最小値から最大値の間をランダムで取得しintを返す
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function MapDraw(area) {
    for (var i = area.firstY; i < area.endY; i++) {
        for (var j = area.firstX; j < area.endX; j++) {
            map[j][i] = 2;
        }
    }
}

function createRoom() {
    areaList.forEach(function (sp) {
        createRoomIn(sp);
        roomCount++;
        roomCountMax++;
    });
}
function createRoomIn(area) {
    var roomLeft = area.firstX + MIN_SPACE_BETWEEN_ROOM_AND_ROAD;
    var roomRight = area.endX - MIN_SPACE_BETWEEN_ROOM_AND_ROAD + 1;
    // 部屋の左辺と右辺の位置をランダムに調整　参照渡し
    var xlist = [roomLeft, roomRight];
    AdjustRoomSidePosition(xlist);

    var roomTop = area.firstY + MIN_SPACE_BETWEEN_ROOM_AND_ROAD;
    var roomBottom = area.endY - MIN_SPACE_BETWEEN_ROOM_AND_ROAD + 1;
    //部屋の上辺と下辺の位置をランダムに調整　参照渡し
    var ylist = [roomTop, roomBottom];
    AdjustRoomSidePosition(ylist);

    area.roomFirstX = xlist[0];
    area.roomFirstY = ylist[0];
    area.roomEndX = xlist[1];
    area.roomEndY = ylist[1];
    area.roomNumber = roomCount;

    if (!roomCoorData[roomCount]) roomCoorData[roomCount] = [];
    roomCoorData[roomCount][0] = area.roomFirstX;
    roomCoorData[roomCount][1] = area.roomFirstY;
    roomCoorData[roomCount][2] = area.roomEndX - 1;
    roomCoorData[roomCount][3] = area.roomEndY - 1;


    for (var y = ylist[0]; y < ylist[1]; y++) {
        for (var x = xlist[0]; x < xlist[1]; x++) {
            map[x][y] = 2;
            mapNum[x][y] = roomCount;
        }
    }
}

function AdjustRoomSidePosition(list) {
    if (list[0] + MIN_ROOM_SIZE < list[1]) {
        // 与えられた範囲内でランダムな部屋の辺の位置を計算
        //ランダムの最大値取得
        var maxRange = Math.min(list[0] + MAX_ROOM_SIZE, list[1]);
        //ランダムの最小値取得
        var minRange = list[0] + MIN_ROOM_SIZE;
        var position = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;//ポジション計算
        var diff = Math.floor(Math.random() * (list[1] - position)); //ずらす値を計算
        //水平（垂直）に座標をずらす
        list[0] += diff;
        list[1] = position + diff;
    }
}

//各部屋から通路を繋げる
function ConnectRooms() {
    for (var i = 0; i < areaList.length - 1; i++) {
        var parentArea = areaList[i];
        var childArea = areaList[i + 1];
        CreateRoadBetweenAreas(parentArea, childArea);

        //孫エリアとの接続を試みる
        if (i < areaList.length - 2) {
            //孫エリア取得
            var grandchildArea = new Area();
            grandchildArea = areaList[i + 2];
            //親と孫の接続関係を調べる
            CreateRoadBetweenAreas(parentArea, grandchildArea, true);
        }
    }
}
function CreateRoadBetweenAreas(parentArea, childArea, isGrandChild = false) {
    //上下でエリアが繋がっている場合
    if (parentArea.endY == childArea.firstY || parentArea.firstY == childArea.endY) {
        //縦に道を作る
        CreateVerticalRoad(parentArea, childArea, isGrandChild);
    }
    //左右でエリアが繋がっている場合
    else if (parentArea.endX == childArea.firstX || parentArea.firstX == childArea.endX) {
        //横に道を作る
        CreateHorizontalRoad(parentArea, childArea, isGrandChild);
    }
}

function CreateVerticalRoad(parentArea, childArea, isGrandChild) {
    //親の部屋からの座標Xをランダムで取得
    var xStart;
    isGrandChild && parentArea.roadFirstX != null ? xStart = parentArea.roadFirstX : xStart = Math.floor(Math.random() * (parentArea.roomEndX - parentArea.roomFirstX)) + parentArea.roomFirstX;
    //子の部屋からの座標Xをランダムで取得
    var xEnd;
    isGrandChild && childArea.roadFirstX != null ? xEnd = childArea.roadFirstX : xEnd = Math.floor(Math.random() * (childArea.roomEndX - childArea.roomFirstX)) + childArea.roomFirstX;
    //接続するY座標を取得　親が上なら子のSection.Topを、そうでなければ親のSection.Topを取得
    var connectY;
    parentArea.endY == childArea.firstY ? connectY = childArea.firstY : connectY = parentArea.firstY;

    //部屋から接続部分まで道を作る
    //parentAreaがchildAreaよりも下にある場合
    if (parentArea.firstY > childArea.firstY) {
        //各エリアに幅1マス分の道の矩形をセットする
        roomRoadSet(parentArea, xStart, connectY, xStart + 1, parentArea.roomFirstY, 0);
        roomRoadSet(childArea, xEnd, childArea.roomEndY, xEnd + 1, connectY, 1);
    }
    //childAreaがparentAareaよりも下にある場合
    else {
        //各エリアに幅1マス分の道の矩形をセットする
        roomRoadSet(parentArea, xStart, parentArea.roomEndY, xStart + 1, connectY, 2);
        roomRoadSet(childArea, xEnd, connectY, xEnd + 1, childArea.roomFirstY, 3);
    }
    //各エリアの部屋から接続部分までのRoadを描画する
    DrawRoadFromRoomToConnectLine(parentArea);
    DrawRoadFromRoomToConnectLine(childArea);

    //接続部分の道を描画する
    DrawVerticalRoad(xStart, xEnd, connectY);
}

function CreateHorizontalRoad(parentArea, childArea, isGrandChild) {
    var yStart;
    isGrandChild && parentArea.roadFirstY != null ? yStart = parentArea.roadFirstY : yStart = Math.floor(Math.random() * (parentArea.roomEndY - parentArea.roomFirstY)) + parentArea.roomFirstY;
    var yEnd;
    isGrandChild && childArea.roadFirstY != null ? yEnd = childArea.roadFirstY : yEnd = Math.floor(Math.random() * (childArea.roomEndY - childArea.roomFirstY)) + childArea.roomFirstY;
    var connectX;
    parentArea.endX == childArea.firstX ? connectX = childArea.firstX : connectX = parentArea.firstX;
    if (parentArea.firstX > childArea.firstX) {
        roomRoadSet(parentArea, connectX, yStart, parentArea.roomFirstX, yStart + 1, 4);
        roomRoadSet(childArea, childArea.roomEndX, yEnd, connectX, yEnd + 1, 5);
    }
    else {
        connectX = childArea.firstX;
        roomRoadSet(parentArea, parentArea.roomEndX, yStart, connectX, yStart + 1, 6);
        roomRoadSet(childArea, connectX, yEnd, childArea.roomFirstX, yEnd + 1), 7;
    }
    DrawRoadFromRoomToConnectLine(parentArea);
    DrawRoadFromRoomToConnectLine(childArea);
    DrawHorizontalRoad(yStart, yEnd, connectX);
}
function roomRoadSet(area, fX, fY, eX, eY, num) {
    area.roadFirstX = fX;
    area.roadFirstY = fY;
    area.roadEndX = eX;
    area.roadEndY = eY;
    area.coorNum = num;
}
function DrawRoadFromRoomToConnectLine(area) {
    if (!roomDoorData[area.roomNumber]) roomDoorData[area.roomNumber] = [];
    if (!roomDoorData[area.roomNumber][roomDoorData[area.roomNumber].length]) roomDoorData[area.roomNumber][roomDoorData[area.roomNumber].length] = [];
    switch (area.coorNum) {
        case 0:
            roomDoorData[area.roomNumber][roomDoorData[area.roomNumber].length - 1][0] = area.roadFirstX;
            roomDoorData[area.roomNumber][roomDoorData[area.roomNumber].length - 1][1] = area.roadEndY - 1;
            roomDoorData[area.roomNumber][roomDoorData[area.roomNumber].length - 1][2] = area.coorNum;
            break;
        case 1:
            roomDoorData[area.roomNumber][roomDoorData[area.roomNumber].length - 1][0] = area.roadFirstX;
            roomDoorData[area.roomNumber][roomDoorData[area.roomNumber].length - 1][1] = area.roadFirstY;
            roomDoorData[area.roomNumber][roomDoorData[area.roomNumber].length - 1][2] = area.coorNum;
            break;
        case 4:
            roomDoorData[area.roomNumber][roomDoorData[area.roomNumber].length - 1][0] = area.roadEndX - 1;
            roomDoorData[area.roomNumber][roomDoorData[area.roomNumber].length - 1][1] = area.roadFirstY;
            roomDoorData[area.roomNumber][roomDoorData[area.roomNumber].length - 1][2] = area.coorNum;
            break;
        case 5:
            roomDoorData[area.roomNumber][roomDoorData[area.roomNumber].length - 1][0] = area.roadFirstX;
            roomDoorData[area.roomNumber][roomDoorData[area.roomNumber].length - 1][1] = area.roadFirstY;
            roomDoorData[area.roomNumber][roomDoorData[area.roomNumber].length - 1][2] = area.coorNum;
            break;
    }

    //部屋を通路で繋げる
    for (var y = 0; y < (area.roadEndY - area.roadFirstY); y++) {
        for (var x = 0; x < (area.roadEndX - area.roadFirstX); x++) {
            map[x + area.roadFirstX][y + area.roadFirstY] = 3;
        }
    }
}
//
function DrawVerticalRoad(xStart, xEnd, y) {
    //xの1ループのみで完結。
    //エリア分割によって開始位置と終了位置が逆になっている場合があるのでそれぞれ判定してループ開始
    for (var x = Math.min(xStart, xEnd); x <= Math.max(xStart, xEnd); x++) {
        //マップデータを上書き
        map[x][y] = 3;
    }
}
function DrawHorizontalRoad(yStart, yEnd, x) {
    for (var y = Math.min(yStart, yEnd); y <= Math.max(yStart, yEnd); y++) {
        map[x][y] = 3;
    }
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

var keyReleased = true; // キー押しっぱなし防止用
function keydown(e) {
    keyDown = e.keyCode;
    switch (keyDown) {
        case 37:
            leftPress = true;
            break;
        case 38:
            upPress = true;
            break;
        case 39:
            rightPress = true;
            break;
        case 40:
            downPress = true;
            break;
        case 65: //a
            if (scene == Scenes.Field && keyReleased) { 
                scene = Scenes.Menu; menuPointer = 0;
                keyReleased = false;
            }
            else if (scene == Scenes.Menu && keyReleased) {
                scene = Scenes.Field;
                keyReleased = false;
            }
            break;
        case 67: //c
            if (!directionFlag) directionFlag = true;
            else directionFlag = false;
            break;
        case 70: //f
            if (player.abnormalState) {
                player.abnormalState = false;
            }
            else {
                player.abnormalState = true;
                player.iceStateCount = 10;
                player.iceStateFrame = 10;
            }
            break;
        case 81: //q
            stepFlag = true;
            break;
        case 83: //s
            console.log(player.y, player.x);
            break;
        case 87: //w
            console.log(Item);
            break;
        case 88: //x
            xPress = true;
            break
        case 90: //z
            if(scene != Scenes.FieldkeyReleased){
                zPress = true;
                keyReleased = false;
            } 
            break;
    }

}
function keyup(e) {
    keyUp = e.keyCode;
    keyReleased = true;
    switch (keyUp) {
        case 37:
            leftPress = false;
            break;
        case 38:
            upPress = false;
            break;
        case 39:
            rightPress = false;
            break;
        case 40:
            downPress = false;
            break;
        case 65: //a
            break;
        case 67: //c
            break;
        case 81: //q
            stepFlag = false;
            break;
        case 83: //s
            break;
        case 87: //w
            break;
        case 90: //z
            zPress = false;
            break;
    }
}

function happenEvent(data, name, number) {


    switch (data) {
        case 0:
            const damage = Math.floor(player.atk / (enemyList[number].def * (15 / 16)));
            gameEventSet(data, [(name + "に" + damage + "のダメージ！")], 30, number);
            player.walkCount = 0;
            scene = Scenes.Event;
            enemyList[number].hp -= damage; //仮想的にダメージを与える
            player.atkFlag = true;
            restartEnemyProcessNumber = number;
            break;
        case 1:
            gameEventSet(data, [(name + "はプレイヤーに攻撃した")], 30, number);
            enemyList[number].walkCount = 0;
            player.stateConfirm(); //状態異常処理
            scene = Scenes.Event;
            break;
        case 2:
            gameEventSet(data, [(name + "をやっつけた")], 30, number);
            scene = Scenes.Event;
            break;
        case 3:
            gameEventSet(data, [(name + "を食べた"), ("HPが" + playerItemList[number].baseAttack + "回復した")], 30, number);
            scene = Scenes.Event;
            break;
        case 4:
            gameEventSet(data, [(name + "を置いた")], 30, number);
            scene = Scenes.Event;
            break;
        case 5:
            gameEventSet(data, [(name)], 30, 0);
            scene = Scenes.Event;
            break;
        case 6:
            gameEventSet(data, [(name + "を拾った")], 30, 0);
            playerItemList[playerItemNumber] = Item[number];
            playerItemList[playerItemNumber].number = playerItemNumber;
            playerItemNumber++;
            mapData[Item[number].y][Item[number].x] -= ITEMCOORDATA;
            Item.splice(number, 1);
            scene = Scenes.Field;
            break;
        case 7:
            gameEventSet(data, [(name + "に乗った"), ("持ち物が多くて拾えない")], 30, 0);
            scene = Scenes.Field;
            break;
        case 8:
            gameEventSet(data, [(name + "が落ちた")], 30, selectItemNumber);
            scene = Scenes.Event;
            Item[Item.length] = new ItemList();
            Item[Item.length - 1].set(playerItemList[selectItemNumber].y, playerItemList[selectItemNumber].x, playerItemList[number].ListNumber);
            Item[Item.length - 1].clashWall();
            playerItemList.splice(number, 1);
            playerItemNumber--;
            mapData[Item[Item.length - 1].y][Item[Item.length - 1].x] += ITEMCOORDATA;
            break;
        case 9:
            gameEventSet(data, [(name + "に当たった")], 30, selectItemNumber);
            scene = Scenes.Event;
            break;
    }
}

function gameEventSet(type, message, time, number) {
    TalkingEvent.type.push(type);
    TalkingEvent.message.push(message);
    TalkingEvent.time.push(time);
    TalkingEvent.number.push(number);
}



function gameloop() {

    if (scrollX == 0 && scrollY == 0 && scene == Scenes.Field || player.abnormalState) inputCheck();

    // マップスクロール量の更新
    if (scrollX > 0) scrollX -= DRAWSIZE / ANIMATIONNUM;
    if (scrollX < 0) scrollX += DRAWSIZE / ANIMATIONNUM;
    if (scrollY > 0) scrollY -= DRAWSIZE / ANIMATIONNUM;
    if (scrollY < 0) scrollY += DRAWSIZE / ANIMATIONNUM;

    frameCount++;

    if ((scrollX != 0 || scrollY != 0) || (scene != Scenes.Field && scene != Scenes.Change) || player.abnormalState) {
        if (turnEnemy && TalkingEvent.type.length == 0 && scene != Scenes.doOnStair) {
            if (enemy.spawnCheck()) {
                enemy = new Enemy();
                enemy.init(currentEnemy);
                enemyList[currentEnemy] = enemy;
                enemyList[currentEnemy].number = currentEnemy;
                mapData[enemyList[currentEnemy].y][enemyList[currentEnemy].x] += ENEMYCOORDATA;
                currentEnemy++;
            }
            enemyList.forEach(function (sp) { //行動
                sp.enemyActDecision();
            });
            turnEnemy = false;
        }
        draw();
        return;
    }





    if (turnEnemy) {
        enemyList.forEach(function (sp) { //行動
            sp.enemyActDecision();
        });
    }
    turnEnemy = false;

    draw();

}
function inputCheck() {
    // フィールド 方向キーをチェック


    let coorData = [player.y, player.x];
    let animationData = [0, 0];
    var animx = 0;
    var animy = 0;

    if (player.abnormalState) {
        player.iceStateFrame--;
        if (player.iceStateFrame == 0) {
            player.iceStateFrame = 10;
            player.iceStateCount--;
            turn++;
            turnEnemy = true;
        }
        if (player.iceStateCount == 0) {
            player.abnormalState = false;
            return;
        }
        return;
    }

    if (stepFlag) {
        player.step();
        return;
    }

    if ((zPress && directionFlag) || zPress) { //向いている向きに攻撃
        player.attack();
        return;
    }
    if (directionFlag) {
        player.directionCheck();
        img2.src = "./playerDirection/arrow" + player.direction + ".png";
        return;
    }
    if (upPress) {
        if (leftPress) player.walkUpperLeft(coorData, animationData);
        else if (rightPress) player.walkUpperRight(coorData, animationData);
        else player.walkUpper(coorData, animationData);
    } else if (downPress) {
        if (leftPress) player.walkLowerLeft(coorData, animationData);
        else if (rightPress) player.walkLowerRight(coorData, animationData);
        else player.walkLower(coorData, animationData);
    } else if (leftPress) {
        player.walkLeft(coorData, animationData);
    } else if (rightPress) {
        player.walkRight(coorData, animationData);
    }


    // 当たり判定
    let onSteppingFlag = (coorData[0] == player.y && coorData[1] == player.x) ? false : true;
    mapData[player.y][player.x] -= PLAYERCOORDATA;
    scrollY = animationData[0] * DRAWSIZE;
    scrollX = animationData[1] * DRAWSIZE;
    player.y = coorData[0];
    player.x = coorData[1];
    mapData[player.y][player.x] += PLAYERCOORDATA;

    if ((mapData[player.y][player.x] & STAIRCOORDATA) != 0 && onSteppingFlag) { //階段を踏んだ
        menuPointer = 0;
        scene = Scenes.doOnStair;
    }
    if ((mapData[player.y][player.x] & ITEMCOORDATA) != 0 && onSteppingFlag) { //アイテムを拾う処理
        let itemPickUpFlag = false; //アイテムを拾えるか?
        for (let i = 0; i < Item.length; i++) {
            if (Item[i].x == player.x && Item[i].y == player.y && playerItemNumber + 1 < 21) {
                itemPickUpFlag = true;
                TalkingEvent = new GameEvent();
                happenEvent(6, Item[i].name, i);
                break;
            }
        }
        if (!itemPickUpFlag) {
            for (let i = 0; i < Item.length; i++) {
                if (Item[i].x == player.x && Item[i].y == player.y) {
                    happenEvent(7, Item[i].name, i);
                    break;
                }
            }
        }
    }
    mapSet();
}

function draw() {
    // マップの描画
    turnS.innerHTML = turn;
    let startX = Math.floor((canvas.width - MAPDRAWWIDTH * DRAWSIZE) / 2);
    let startY = Math.floor((canvas.height - MAPDRAWHEIGHT * DRAWSIZE) / 2);







    for (var i = 0; i < MAPDRAWHEIGHT; i++) {
        for (var j = 0; j < MAPDRAWWIDTH; j++) {
            // 始点の算出
            let x = (player.x - Math.floor(MAPDRAWWIDTH / 2) + j + MAPWIDTH) % MAPWIDTH;
            let y = (player.y - Math.floor(MAPDRAWHEIGHT / 2) + i + MAPHEIGHT) % MAPHEIGHT;
            // マップチップの描画
            g.drawImage(
                maptip[map[y][x]],
                startX + j * DRAWSIZE + scrollX,
                startY + i * DRAWSIZE + scrollY,
                DRAWSIZE,
                DRAWSIZE
            );
            if ((mapData[y][x] & STAIRCOORDATA) != 0) {
                g.drawImage(
                    stairImage,
                    startX + j * DRAWSIZE + scrollX,
                    startY + i * DRAWSIZE + scrollY,
                    DRAWSIZE,
                    DRAWSIZE
                );
            }
        }
    }
    //敵キャラ描画
    enemyList.forEach(function (sp) {
        sp.draw();
    });
    g.globalCompositeOperation = "destination-atop";
    g.fillStyle = "rgba(0, 0, 0, 0.5)"; // 半透明の黒
    g.globalCompositeOperation = "source-over";
    // クリッピングを設定
    g.beginPath();
    g.rect(0, 0, canvas.width, canvas.height); // 全体を指定

    if (map[player.y][player.x] == 3) {
        g.arc(canvas.width / 2, canvas.height / 2, 95, 0, Math.PI * 2); // 視界部分（くり抜き）
        g.closePath();
        g.fill("evenodd"); // 円形部分以外を塗りつぶす
    } else if (map[player.y][player.x] == 2) {
        let coorData = [4, 3, 2, 1, 0];
        let xData = player.x - roomCoorData[mapNum[player.y][player.x]][1];
        let yData = player.y - roomCoorData[mapNum[player.y][player.x]][0];
        let x = xData < 5
            ? 64 * (coorData[xData])
            : 0;
        let y = yData < 5
            ? 64 * (coorData[yData]) - 32
            : 0;
        coorData = [6, 7, 8, 9, 10];
        x += xData < 5 ? scrollX : 0;
        y += yData < 5 ? scrollY : 0;
        xData = roomCoorData[mapNum[player.y][player.x]][3] - player.x;
        yData = roomCoorData[mapNum[player.y][player.x]][2] - player.y;
        let roomLengthX = xData < 5
            ? 64 * coorData[xData] + 32
            : 740;
        let roomLengthY = yData < 5
            ? 64 * coorData[yData] + 32
            : 740;
        roomLengthX = roomLengthX - x + scrollX;
        roomLengthY = roomLengthY - y + scrollY;
        g.rect(x, y, roomLengthX, roomLengthY);
        g.closePath();
        g.fill("evenodd"); // 円形部分以外を塗りつぶす
    }



    for (var i = 0; i < MAPHEIGHT; i++) {
        for (var j = 0; j < MAPWIDTH; j++) {
            if ((mapData[i][j] & MINIMAPCOORDATA) != 0) {
                g.drawImage(
                    miniMap,
                    j * 10,
                    i * 10,
                    10,
                    10
                );
            }
            if ((mapData[i][j] & ENEMYCOORDATA) != 0) {
                g.drawImage(
                    enemyList[0].img[8],
                    j * 10,
                    i * 10,
                    10,
                    10
                );
            }
            if ((mapData[i][j] & PLAYERCOORDATA) != 0) {
                g.drawImage(
                    player.img[8],
                    j * 10,
                    i * 10,
                    10,
                    10
                );
            }
            if ((mapData[i][j] & STAIRCOORDATA) != 0) {
                g.drawImage(
                    miniStairImage,
                    j * 10,
                    i * 10,
                    10,
                    10
                );
            }
        }
    }



    if (scene != Scenes.Change) {
        Item.forEach(function (sp) {
            var x =
                Math.abs(sp.x - player.x) < Math.abs(sp.x - player.x - MAPWIDTH)
                    ? sp.x - player.x
                    : sp.x - player.x - MAPWIDTH;
            var y =
                Math.abs(sp.y - player.y) < Math.abs(sp.y - player.y - MAPHEIGHT)
                    ? sp.y - player.y
                    : sp.y - player.y - MAPHEIGHT;
            g.drawImage(
                sp.img,
                Math.floor((canvas.width - DRAWSIZE) / 2) + x * DRAWSIZE + scrollX,
                Math.floor((canvas.height - DRAWSIZE) / 2) + y * DRAWSIZE - DRAWSIZE / 6 + scrollY + 10,
                DRAWSIZE,
                DRAWSIZE
            );
            g.drawImage(
                sp.imgMini,
                sp.x * 10,
                sp.y * 10,
                10,
                10,
            );
        });

        if (directionFlag) {
            g.drawImage(
                img2,
                Math.floor((canvas.width - DRAWSIZE) / 2) + player.directionDoor[1],
                Math.floor((canvas.height - DRAWSIZE) / 2) - DRAWSIZE / 6 + player.directionDoor[0],
                DRAWSIZE,
                DRAWSIZE
            );
        }
        g.drawImage(
            player.img[player.direction],
            player.ImageDoor[player.walkImage[player.walkCount]][0],
            player.ImageDoor[player.walkImage[player.walkCount]][1],
            player.ImageDoor[player.walkImage[player.walkCount]][2],
            player.ImageDoor[player.walkImage[player.walkCount]][3],
            Math.floor((canvas.width - DRAWSIZE) / 2) + 10,
            Math.floor((canvas.height - DRAWSIZE) / 2) - DRAWSIZE / 6 + 5,
            DRAWSIZE - 20,
            DRAWSIZE
        );
        if (player.abnormalState) {
            g.drawImage(
                player.stateImage,
                Math.floor((canvas.width - DRAWSIZE) / 2) - 5,
                Math.floor((canvas.height - DRAWSIZE) / 2) - DRAWSIZE / 6 - 5,
                DRAWSIZE,
                DRAWSIZE + 20
            );
        } else {
            if (frameCount % 4 == 0) player.walkCount++;
            if (player.walkCount == player.walkImage.length) {
                player.walkCount = 0;
            }
        }

    }


    if (TalkingEvent.length != 0) {
        for (let i = TalkingEvent.count; i < TalkingEvent.count + 1; i++) {
            switch (TalkingEvent.type[i]) {
                case 6:
                    if (TalkingEvent.time[i] != 0) {
                        TalkingEvent.time[i]--;
                        drawMessage(TalkingEvent.message[i]);
                    } else if (TalkingEvent.time[i] == 0) {
                        TalkingEvent.count++;
                    }
                    if (TalkingEvent.message.length == TalkingEvent.count) {
                        TalkingEvent = new GameEvent();
                    }
                    break;
                case 7:
                    if (TalkingEvent.time[i] != 0) {
                        TalkingEvent.time[i]--;
                        drawMessage(TalkingEvent.message[i]);
                        break;
                    } else if (TalkingEvent.time[i] == 0) {
                        TalkingEvent.count++;
                    }
                    if (TalkingEvent.message.length == TalkingEvent.count) {
                        TalkingEvent = new GameEvent();
                    }
                    break;
            }
        }
    }




    if (scene == Scenes.Event) {
        // イベントメッセージの描画
        let imageDoorList = [
            [-1 * Math.PI / 180, 0],
            [-1 * Math.PI / 180, Math.PI / 180],
            [0, Math.PI / 180],
            [Math.PI / 180, Math.PI / 180],
            [Math.PI / 180, 0],
            [Math.PI / 180, -1 * Math.PI / 180],
            [0, -1 * Math.PI / 180],
            [-1 * Math.PI / 180, -1 * Math.PI / 180],
        ];
        for (let i = TalkingEvent.count; i < TalkingEvent.count + 1; i++) {
            switch (TalkingEvent.type[i]) {
                case 0:
                    if (TalkingEvent.time[i] != 0) {
                        TalkingEvent.time[i]--;
                        drawMessage(TalkingEvent.message[i]);
                        break;
                    } else if (TalkingEvent.time[i] == 0) {
                        TalkingEvent.count++;
                        const damage = Math.floor(player.atk / (enemyList[0].def * (15 / 16)));
                        if (enemyList[TalkingEvent.number[i]].hp <= 0) {
                            enemyList[TalkingEvent.number[i]].hp = 0;
                            happenEvent(2, enemyList[TalkingEvent.number[i]].name, TalkingEvent.number[i]);
                            restartEnemyProcessNumber = 0;
                        }
                        player.atkFlag = false;

                    }
                    if (TalkingEvent.message.length == TalkingEvent.count) {
                        scene = Scenes.Field;
                        turnEnemy = true;
                        TalkingEvent = new GameEvent();
                    }
                    break;
                case 1:
                    if (TalkingEvent.time[i] != 0) {
                        TalkingEvent.time[i]--;
                        drawMessage(TalkingEvent.message[i]);
                        break;
                    } else if (TalkingEvent.time[i] == 0) {
                        TalkingEvent.count++;
                        const damage = Math.floor(enemyList[0].atk * (enemyList[0].atk / 8.5));
                        player.hp--;
                    }
                    if (TalkingEvent.message.length == TalkingEvent.count) {
                        scene = Scenes.Field;
                        TalkingEvent = new GameEvent();
                    }
                    break;
                case 2:
                    if (TalkingEvent.time[i] != 0) {
                        TalkingEvent.time[i]--;
                        drawMessage(TalkingEvent.message[i]);
                        break;
                    } else if (TalkingEvent.time[i] == 0) {
                        TalkingEvent.count++;
                    }
                    if (TalkingEvent.message.length == TalkingEvent.count) {
                        mapData[enemyList[TalkingEvent.number[i]].y][enemyList[TalkingEvent.number[i]].x] -= ENEMYCOORDATA;
                        enemyList.splice(TalkingEvent.number[i], 1);
                        enemyList.forEach(function (sp) {
                            sp.changeNumber(TalkingEvent.number[i]);
                        });
                        currentEnemy--;
                        scene = Scenes.Field;
                        TalkingEvent = new GameEvent();
                    }
                    break;
                case 3:
                    if (TalkingEvent.time[i] != 0) {
                        TalkingEvent.time[i]--;
                        drawMessage(TalkingEvent.message[i]);
                        break;
                    } else if (TalkingEvent.time[i] == 0) {
                        TalkingEvent.count++;
                    }
                    if (TalkingEvent.message.length == TalkingEvent.count) {
                        turn++;
                        turnEnemy = true;
                        player.hp = player.hp + playerItemList[TalkingEvent.number[i]].baseAttack >= player.maxHp ? player.maxHp : player.hp + playerItemList[TalkingEvent.number[i]].baseAttack;
                        playerItemList.splice(TalkingEvent.number[i], 1);
                        playerItemNumber--;
                        scene = Scenes.Field;
                        TalkingEvent = new GameEvent();
                    }
                    break;
                case 4:
                    if (TalkingEvent.time[i] != 0) {
                        TalkingEvent.time[i]--;
                        drawMessage(TalkingEvent.message[i]);
                        break;
                    } else if (TalkingEvent.time[i] == 0) {
                        TalkingEvent.count++;
                    }
                    if (TalkingEvent.message.length == TalkingEvent.count) {
                        turn++;
                        turnEnemy = true;
                        Item[Item.length] = new ItemList();
                        Item[Item.length - 1].set(playerItemList[selectItemNumber].y, playerItemList[selectItemNumber].x, playerItemList[TalkingEvent.number[i]].ListNumber);
                        playerItemList.splice(TalkingEvent.number[i], 1);
                        playerItemNumber--;
                        scene = Scenes.ItemMenu;
                        TalkingEvent = new GameEvent();
                        mapData[Item[Item.length - 1].y][Item[Item.length - 1].x] += ITEMCOORDATA;
                    }
                    break;
                case 5:
                    if (TalkingEvent.time[i] != 0) {
                        TalkingEvent.time[i]--;
                        drawMessage(TalkingEvent.message[i]);
                        break;
                    } else if (TalkingEvent.time[i] == 0) {
                        TalkingEvent.count++;
                    }
                    if (TalkingEvent.message.length == TalkingEvent.count) {
                        scene = Scenes.ItemMenu;
                        TalkingEvent = new GameEvent();
                    }
                    break;
                case 6:
                    break;
                case 7:
                    break;
                case 8:
                    if (TalkingEvent.time[i] != 0) {
                        TalkingEvent.time[i]--;
                        drawMessage(TalkingEvent.message[i]);
                        break;
                    } else if (TalkingEvent.time[i] == 0) {
                        TalkingEvent.count++;
                    }
                    if (TalkingEvent.message.length == TalkingEvent.count) {
                        turn++;
                        turnEnemy = true;
                        scene = Scenes.Field;
                        TalkingEvent = new GameEvent();
                    }
                    break;
                case 9:
                    if (TalkingEvent.time[i] != 0) {
                        TalkingEvent.time[i]--;
                        drawMessage(TalkingEvent.message[i]);
                        break;
                    } else if (TalkingEvent.time[i] == 0) {
                        TalkingEvent.count++;
                    }
                    if (TalkingEvent.message.length == TalkingEvent.count) {
                        turn++;
                        turnEnemy = true;
                        playerItemList.splice(selectItemNumber, 1);
                        playerItemNumber--;
                        scene = Scenes.Field;
                        TalkingEvent = new GameEvent();
                    }
                    break;
            }
        }
    }
    if (scene == Scenes.doOnStair) { //階段を踏んだ時の処理
        OnStairMessageWindow();
        if (upPress) {
            menuPointer--;
            if (menuPointer == -1) menuPointer = 1;
            else if (menuPointer == 2) menuPointer = 0;
            upPress = false;
        } if (downPress) {
            menuPointer++;
            if (menuPointer == 2) menuPointer = 0;
            downPress = false;
        }
        if (zPress && menuPointer == 0) {
            scene = Scenes.Change;
            player.floorNumber++;
            clearInterval(gameLoopFunction);
            mapChangeFunction = setInterval(changeMap, 16);
        } else if ((zPress && menuPointer == 1) || xPress) {
            scene = Scenes.Field;
            zPress = false;
            xPress = false;
            menuPointer = selectItemNumber;
        }
    }
    if (scene == Scenes.Menu) { //メニュー画面
        if (upPress) {
            menuPointer--;
            if (menuPointer == -1) menuPointer = 1;
            else if (menuPointer == 2) menuPointer = 0;
            upPress = false;
        } if (downPress) {
            menuPointer++;
            if (menuPointer == 2) menuPointer = 0;
            downPress = false;
        }
        openMenu();
        if (zPress && playerItemNumber > 0 && menuPointer == 0) {
            scene = Scenes.ItemMenu;
        } else if (zPress && menuPointer == 1) {
            scene = Scenes.StatusMenu;
        }
        if (xPress) {
            scene = Scenes.Field;
            xPress = false;
            menuPointer = selectItemNumber;
        }
        zPress = false;
    }
    if (scene == Scenes.ItemMenu) { //アイテムメニュー
        if (leftPress) {
            if (menuPointer <= 9 && playerItemNumber > 10) menuPointer = 10;
            else if (menuPointer > 9) menuPointer = 0;
            leftPress = false;
        } if (upPress) {
            menuPointer--;
            if (menuPointer == -1) menuPointer = playerItemNumber < 10 ? playerItemNumber - 1 : 9;
            else if (menuPointer == 9) menuPointer = playerItemNumber - 1;
            upPress = false;
        } if (rightPress) {
            if (menuPointer <= 9 && playerItemNumber > 10) menuPointer = 10;
            else menuPointer = 0;
            rightPress = false;
        } if (downPress) {
            menuPointer++;
            if (playerItemNumber < 10 && menuPointer == playerItemNumber) {
                menuPointer = 0;
            } else if (playerItemNumber == 10 && menuPointer == playerItemNumber) {
                menuPointer = 0;
            } else if (10 < playerItemNumber && menuPointer == playerItemNumber) {
                menuPointer = 10;
            } else if (menuPointer == 20) menuPointer = 10;
            downPress = false;
        }
        if (playerItemNumber != 0) {
            openItemMenu();
        }
        if (zPress) {
            scene = Scenes.doWithItem;
            selectItemNumber = menuPointer;
            menuPointer = 0;
            zPress = false;
        }
        if (xPress) {
            scene = Scenes.Field;
            xPress = false;
            menuPointer = selectItemNumber;
        }
    }
    if (scene == Scenes.StatusMenu) { //ステータスメニュー
        if (leftPress) {
            if (menuPointer <= 9 && playerItemNumber > 10) menuPointer = 10;
            else if (menuPointer > 9) menuPointer = 0;
            leftPress = false;
        } if (rightPress) {
            if (menuPointer <= 9 && playerItemNumber > 10) menuPointer = 10;
            else menuPointer = 0;
            rightPress = false;
        }
        if (xPress) {
            scene = Scenes.Field;
            xPress = false;
            menuPointer = selectItemNumber;
        }
    }
    if (scene == Scenes.doWithItem) { //アイテムを使うかどうか
        switch (playerItemList[selectItemNumber].type) { //アイテムの種類によって処理を変える
            case 0:
            case 1: //装備アイテム
                switch (playerItemList[selectItemNumber].flagWear) {
                    case true:
                        if (upPress) {
                            menuPointer = menuPointer - 1 == -1 ? 4 : menuPointer - 1;
                            upPress = false;
                        } else if (downPress) {
                            menuPointer = menuPointer + 1 == 5 ? 0 : menuPointer + 1;
                            downPress = false;
                        }
                        if (zPress) {
                            switch (menuPointer) {
                                case 0: //装備
                                    menuPointer = 0;
                                    scene = Scenes.selectEquipmentPart;
                                    break;
                                case 1: //外す
                                    playerItemList[selectItemNumber].flagWear = false;
                                    break;
                                case 2: //発動
                                    break;
                                case 3: //投げる
                                    playerItemList[selectItemNumber].throwBegin();
                                    break;
                                case 4: //置く
                                    playerItemList[selectItemNumber].put();
                                    break;
                            }
                            zPress = false;
                        }
                        break;
                    case false:
                        if (upPress) {
                            menuPointer = menuPointer - 1 == -1 ? 3 : menuPointer - 1;
                            upPress = false;
                        } else if (downPress) {
                            menuPointer = menuPointer + 1 == 4 ? 0 : menuPointer + 1;
                            downPress = false;
                        }
                        if (zPress) {
                            switch (menuPointer) {
                                case 0: //装備
                                    menuPointer = 0;
                                    scene = Scenes.selectEquipmentPart;
                                    break;
                                case 1: //発動
                                    scene = Scenes.itemUseSelect;
                                    break;
                                case 2: //投げる
                                    playerItemList[selectItemNumber].throwBegin();
                                    break;
                                case 3: //置く
                                    const canItemPut = [
                                        [0, 0],
                                        [-1, 0], [-1, 1], [0, 1], [1, 1],
                                        [1, 0], [1, -1], [0, -1], [-1, -1],
                                    ];
                                    let i = 0;
                                    let flag = false;
                                    while (!flag && i < canItemPut.length) {
                                        if ((mapData[player.y + canItemPut[i][0]][player.x + canItemPut[i][1]] & ITEMCOORDATA) == 0 &&
                                            (mapData[player.y + canItemPut[i][0]][player.x + canItemPut[i][1]] & STAIRCOORDATA) == 0 &&
                                            (mapData[player.y + canItemPut[i][0]][player.x + canItemPut[i][1]] & TRAPCOORDATA) == 0 &&
                                            (map[player.y + canItemPut[i][0]][player.x + canItemPut[i][1]] != 0) &&
                                            (map[player.y + canItemPut[i][0]][player.x + canItemPut[i][1]] != 1)) {
                                            menuPointer = 0;
                                            flag = true;
                                            playerItemList[selectItemNumber].y = player.y + canItemPut[i][0];
                                            playerItemList[selectItemNumber].x = player.x + canItemPut[i][1];
                                        }
                                        i++;
                                    }
                                    scene = Scenes.Event;
                                    if (flag) { happenEvent(4, playerItemList[selectItemNumber].name, selectItemNumber); }
                                    else { happenEvent(5, "アイテムを置く場所がない", 0); }
                                    break;
                            }
                            zPress = false;
                        }
                        break;

                }
                if (xPress) {
                    scene = Scenes.ItemMenu;
                    xPress = false;
                    menuPointer = selectItemNumber;
                }
                openDoWithItem(playerItemList[selectItemNumber].type, playerItemList[selectItemNumber].flagWear);
                break;
            case 6: //回復アイテム
                if (upPress) {
                    menuPointer = menuPointer - 1 == -1 ? 2 : menuPointer - 1;
                    upPress = false;
                } else if (downPress) {
                    menuPointer = menuPointer + 1 == 3 ? 0 : menuPointer + 1;
                    downPress = false;
                }
                if (xPress) {
                    scene = Scenes.ItemMenu;
                    xPress = false;
                    menuPointer = selectItemNumber;
                }
                if (zPress) {
                    switch (menuPointer) {
                        case 0: //使う
                            happenEvent(3, playerItemList[selectItemNumber].name, selectItemNumber);
                            zPress = false;
                            break;
                        case 1: //投げる
                            playerItemList[selectItemNumber].throwBegin();
                            break;
                        case 2: //置く
                            playerItemList[selectItemNumber].put();
                            break;
                    }
                }
                openDoWithItem(playerItemList[selectItemNumber].type, false);
                break;
        }
    }
    if (scene == Scenes.selectEquipmentPart) { //装備部位選択
        switch (playerItemList[selectItemNumber].type) {
            case 0:
            case 1:
                if (upPress) {
                    menuPointer = menuPointer - 1 == -1 ? 1 : menuPointer - 1;
                    upPress = false;
                } else if (downPress) {
                    menuPointer = menuPointer + 1 == 2 ? 0 : menuPointer + 1;
                    downPress = false;
                }
                if (xPress) {
                    scene = Scenes.ItemMenu;
                    xPress = false;
                    menuPointer = selectItemNumber;
                }
                if (zPress) {
                    if ((playerItemList[selectItemNumber].type == 0 && menuPointer == 0) ||
                        (playerItemList[selectItemNumber].type == 1 && menuPointer == 1)) {
                        for (let i = 0; i < playerItemList.length; i++) {
                            if (playerItemList[i].type == playerItemList[selectItemNumber].type && playerItemList[i].flagWear) {
                                playerItemList[i].flagWear = false;
                                break;
                            }
                        }
                        playerItemList[selectItemNumber].flagWear = true;
                    }
                    else {
                        let partNumber;
                        if (playerItemList[selectItemNumber].ListNumber == 2) partNumber = 3;
                        else partNumber = 2;
                        for (let i = 0; i < playerItemList.length; i++) {
                            if (playerItemList[i].type != playerItemList[selectItemNumber].type && playerItemList[i].flagWear) {
                                playerItemList[i].flagWear = false;
                                break;
                            }
                        }
                        playerItemList[selectItemNumber].set(0, 0, partNumber);
                        playerItemList[selectItemNumber].flagWear = true;
                    }


                    scene = Scenes.ItemMenu;
                    zPress = false;
                }
                selectEquipmentPartWindow();
                break;
            case 2:
                if (zPress) {
                    for (let i = 0; i < playerItemList.length; i++) {
                        if (playerItemList[i].type == playerItemList[selectItemNumber].type && playerItemList[i].flagWear) {
                            playerItemList[i].flagWear = false;
                            break;
                        }
                    }
                    playerItemList[selectItemNumber].flagWear = true;
                    scene = Scenes.ItemMenu;
                    zPress = false;
                }
                if (xPress) {
                    scene = Scenes.ItemMenu;
                    xPress = false;
                    menuPointer = selectItemNumber;
                }
                break;
        }
    }
    if (scene == Scenes.ItemThrow) {
        playerItemList[selectItemNumber].throw();
    }

    // HPの描画
    drawStatus();

}

// HP表示
function drawStatus() {
    //階層を表示
    drawFloorString();
    //レベルを表示
    drawLevelString();
    //所持金を表示
    drawMoneyString();
    //HPバーを表示
    drawMaxHpBar(player.maxHp, canvas.width / 2 - 30, 65);
    //現在Hpの割合をバーに表示
    drawCurrentHpBar(player.hp, player.maxHp, canvas.width / 2 - 30, 65);
    //HPの文字列を表示
    drawHPString(player.hp, player.maxHp, canvas.width / 2 - 100, 60);
}

function drawFloorString() {
    g.font = "bold 32pt DotGothic16";
    g.fillStyle = "rgb(255, 255, 255)";
    g.fillText(player.floorNumber + "F", 30, 60);
}
function drawLevelString() {
    g.font = "bold 32pt DotGothic16";
    g.fillStyle = "rgb(255, 255, 255)";
    g.fillText("Lv." + player.level, 100, 60);
}

function drawMoneyString() {
    g.font = "bold 32pt DotGothic16";
    g.fillStyle = "rgb(255, 255, 255)";
    g.fillText(player.money + "G", 500, 60);
}

function drawMaxHpBar(maxHp, x, y) {
    g.fillStyle = "rgb(0, 255, 0)";
    let baseBarLength = 100;
    let barExtension = maxHp - 15; //初期HPからの長さ分HPバーを延長
    g.fillRect(x, y, baseBarLength + barExtension, 10);
}
function drawCurrentHpBar(hp, maxHp, x, y) {
    g.fillStyle = "rgb(255, 0, 0)";
    let baseBarLength = 100 + maxHp - 15; //元の長さ
    let currentHpBarLength = baseBarLength * (hp / maxHp); //hpと被ダメージの割合から長さを算出
    // 失われたHPを赤で表示
    g.fillStyle = "rgb(255, 0, 0)";
    g.fillRect(x + currentHpBarLength, y, baseBarLength - currentHpBarLength, 10);
}
function drawHPString(hp, maxHp, x, y) {
    g.font = "bold 32pt DotGothic16";
    g.fillStyle = "rgb(255, 255, 255)";
    g.fillText("HP", x, y) //
    x += 70;
    if (hp < maxHp / 2) g.fillStyle = "rgb(255, 0, 0)";
    else g.fillStyle = "rgb(255, 255, 255)";
    g.fillText(player.hp, x, y);
    g.fillStyle = "rgb(255, 255, 255)";
    let hpStringPadding = 50 + 65 * (Math.log(hp) / Math.log(1000));
    g.fillText("/" + player.maxHp, x + hpStringPadding, y);
}

// イベントメッセージ描画
function drawMessage(message) {
    var WindowMargin = 10;
    var WindowWidth = canvas.width - WindowMargin * 2;
    var WindowHeight = canvas.height / 4;
    drawWindow(WindowMargin, canvas.height - WindowHeight - WindowMargin, WindowWidth, WindowHeight, WindowMargin);
    for (var i = 0; i < message.length; i++) {
        drawString(message[i], WindowMargin * 3, canvas.height - WindowHeight + WindowMargin + 24 * (i + 1));
    }
}
// メッセージウィンドウ描画
function drawWindow(x, y, WindowWidth, WindowHeight, WindowMargin = 10, frameColor = "rgba(255,255,255)") {
    g.fillStyle = frameColor;
    g.fillRect(x, y, WindowWidth, WindowHeight);
    g.fillStyle = "rgb(0,0,0)";
    g.fillRect(x + WindowMargin, y + WindowMargin, WindowWidth - WindowMargin * 2, WindowHeight - WindowMargin * 2);
}
// 文字列描画
function drawString(string, x, y, color = "rgb(255,255,255)") {
    g.font = "bold 19pt DotGothic16";
    g.fillStyle = color;
    g.fillText(string, x, y);
}

//階段イベント
function OnStairMessageWindow() {
    var WindowMargin = 10;
    var WindowWidth = canvas.width - WindowMargin * 40;
    var WindowHeight = canvas.height / 3;
    drawMenuWindow(WindowMargin, WindowHeight - WindowMargin, WindowWidth, WindowHeight, WindowMargin);
    drawStairString(WindowMargin + 40, WindowHeight + 35);
}
function drawStairString(x, y, color = "rgba(255,255,255, 1)") {
    g.font = "bold 16pt DotGothic16";
    g.fillStyle = color;
    g.fillText("降りる", x + 30, y);
    g.fillText("そのまま", x + 30, y + 35);
    g.fillText(">", x, (y + 35 * menuPointer));
}

//メニュー画面
function openMenu() {
    var WindowMargin = 10;
    var WindowWidth = canvas.width - WindowMargin * 40;
    var WindowHeight = canvas.height / 3;
    drawMenuWindow(WindowMargin, WindowHeight - WindowMargin, WindowWidth, WindowHeight, WindowMargin);
    drawMenuString(WindowMargin + 40, WindowHeight + 35);
}
//メニューウィンドウ描画
function drawMenuWindow(x, y, WindowWidth, WindowHeight, WindowMargin = 10, frameColor = "rgba(255, 255, 255, 0.5)") {
    g.fillStyle = frameColor;
    g.fillRect(x, y, WindowWidth, WindowHeight);
    g.fillStyle = "rgba(0, 0, 0, 0.7)";
    g.fillRect(x + WindowMargin, y + WindowMargin, WindowWidth - WindowMargin * 2, WindowHeight - WindowMargin * 2);
}

// メニュー文字列描画
function drawMenuString(x, y, color = "rgba(255,255,255, 1)") {
    g.font = "bold 16pt DotGothic16";
    g.fillStyle = color;
    g.fillText("アイテム", x + 30, y);
    g.fillText("状態", x + 30, y + 35);
    g.fillText(">", x, (y + 35 * menuPointer));
}

//アイテムメニュー画面
function openItemMenu() {
    var WindowMargin = 10;
    var WindowWidth = canvas.width - WindowMargin * 40;
    var WindowHeight = canvas.height / 4;
    drawItemMenuWindow(WindowMargin, WindowHeight - WindowMargin, WindowWidth, WindowHeight * 3, WindowMargin);
    drawItemMenuString(true, menuPointer, WindowMargin + 40, WindowHeight + 35);
    drawItemMenuWindow(WindowMargin + WindowWidth + 60, WindowHeight - WindowMargin, WindowWidth, WindowHeight * 2, WindowMargin)
    drawSubItemMenu(WindowMargin + WindowWidth + 60, WindowHeight - WindowMargin);
}
//アイテムメニューウィンドウ描画
function drawItemMenuWindow(x, y, WindowWidth, WindowHeight, WindowMargin = 10, frameColor = "rgba(255,255,255, 0.5)") {
    g.fillStyle = frameColor;
    g.fillRect(x, y, WindowWidth, WindowHeight);
    g.fillStyle = "rgba(0,0,0,0.7)";
    g.fillRect(x + WindowMargin, y + WindowMargin, WindowWidth - WindowMargin * 2, WindowHeight - WindowMargin * 2);
}
// アイテムメニュー文字列描画
function drawItemMenuString(CANSELECT, selectNumber, x, y, color = "rgba(255,255,255, 1)") {
    g.font = "bold 16pt DotGothic16";
    g.fillStyle = color;
    let wearEquipmentString = [
        "Atk",
        "Def",
        "Acc",
    ];
    if (selectNumber < 10) {
        g.fillText("-1-", x + 70, y);
        y += 40;
        let ListNumber = playerItemList.length > 10 ? 10 : playerItemList.length;
        for (let i = 0; i < ListNumber; i++) {
            if (playerItemList[i].flagWear) g.fillText(playerItemList[i].name + "(" + wearEquipmentString[playerItemList[i].type] + ")", x + 30, y + 35 * i);
            else g.fillText(playerItemList[i].name, x + 30, y + 35 * i);
        }
        if (CANSELECT) g.fillText(">", x, (y + 35 * selectNumber));
    }
    else {
        g.fillText("-2-", x + 70, y);
        y += 40;
        for (let i = 10; i < playerItemList.length; i++) {
            if (playerItemList[i].flagWear) g.fillText(playerItemList[i].name + "(" + wearEquipmentString[playerItemList[i].type] + ")", x + 30, y + 35 * (i - 10));
            else g.fillText(playerItemList[i].name, x + 30, y + 35 * (i - 10));
        }
        if (CANSELECT) g.fillText(">", x, (y + 35 * (selectNumber - 10)));
    }
}
//サブアイテムメニュー描画
function drawSubItemMenu(x, y) {

    g.drawImage(
        playerItemList[menuPointer].img,
        x + 40,
        y + 40,
        DRAWSIZE - 20,
        DRAWSIZE
    );
    g.font = "bold 16pt DotGothic16";
    g.fillStyle = "rgba(255,255,255, 1)";
    g.fillText(playerItemList[menuPointer].name, x + 120, y + 50);
    switch (playerItemList[menuPointer].type) {
        case 0:
        case 1:
            g.fillText(("攻:" + playerItemList[menuPointer].baseAttack), x + 100, y + 100);
            g.fillText(("守:" + playerItemList[menuPointer].baseDefense), x + 160, y + 100);
            break;
    }
    g.fillText(("説明"), x + 40, y + 150);
    g.fillText(playerItemList[menuPointer].description, x + 40, y + 180);
}

function openDoWithItem(type, flagWear) {
    var WindowMargin = 10;
    var WindowWidth = canvas.width - WindowMargin * 40;
    var WindowHeight = canvas.height / 4;
    drawItemMenuWindow(WindowMargin, WindowHeight - WindowMargin, WindowWidth, WindowHeight * 3, WindowMargin);
    drawItemMenuString(false, selectItemNumber, WindowMargin + 40, WindowHeight + 35);
    drawDoWithItemWindow(type, WindowMargin + WindowWidth + 60, WindowHeight - WindowMargin, WindowWidth / 1.8, WindowHeight + 50, WindowMargin)
    drawDoWithItemString(type, flagWear, WindowMargin + WindowWidth + 60, WindowHeight - WindowMargin + 40);
}
function drawDoWithItemWindow(type, x, y, WindowWidth, WindowHeight, WindowMargin = 10, frameColor = "rgba(255,255,255, 0.5)") {
    g.fillStyle = frameColor;
    g.fillRect(x, y, WindowWidth, WindowHeight);
    g.fillStyle = "rgba(0,0,0,0.7)";
    g.fillRect(x + WindowMargin, y + WindowMargin, WindowWidth - WindowMargin * 2, WindowHeight - WindowMargin * 2);
}
function drawDoWithItemString(type, flagWear, x, y) {
    switch (type) {
        case 0:
        case 1:
            switch (flagWear) {
                case true:
                    let equipmentStringOne = [
                        "装備",
                        "外す",
                        "発動",
                        "投げる",
                        "置く",
                    ];
                    g.font = "bold 16pt DotGothic16";
                    g.fillStyle = "rgba(255,255,255, 1)";
                    for (let i = 0; i < equipmentStringOne.length; i++) {
                        g.fillText(equipmentStringOne[i], x + 50, (y + 35 * i));
                    }
                    g.fillText(">", x + 20, (y + 35 * menuPointer));
                    break;
                case false:
                    let equipmentStringTwo = [
                        "装備",
                        "発動",
                        "投げる",
                        "置く",
                    ];
                    g.font = "bold 16pt DotGothic16";
                    g.fillStyle = "rgba(255,255,255, 1)";
                    for (let i = 0; i < equipmentStringTwo.length; i++) {
                        g.fillText(equipmentStringTwo[i], x + 50, (y + 35 * i));
                    }
                    g.fillText(">", x + 20, (y + 35 * menuPointer));
                    break;
            }
            break;
        case 6:
            let foodString = [
                "食べる",
                "投げる",
                "置く",
            ]
            g.font = "bold 16pt DotGothic16";
            g.fillStyle = "rgba(255,255,255, 1)";
            for (let i = 0; i < foodString.length; i++) {
                g.fillText(foodString[i], x + 50, (y + 35 * i));
            }
            g.fillText(">", x + 20, (y + 35 * menuPointer));
            break;
    }
}

function selectEquipmentPartWindow() {
    var WindowMargin = 10;
    var WindowWidth = canvas.width - WindowMargin * 40;
    var WindowHeight = canvas.height / 4;
    drawItemMenuWindow(WindowMargin, WindowHeight - WindowMargin, WindowWidth, WindowHeight * 3, WindowMargin);
    drawItemMenuString(false, selectItemNumber, WindowMargin + 40, WindowHeight + 35);
    drawSelectEquipmentPartWindow(WindowMargin + WindowWidth + 60, WindowHeight - WindowMargin, WindowWidth / 1.8, WindowHeight + 50, WindowMargin)
    drawSelectEquipmentPartString(WindowMargin + WindowWidth + 60, WindowHeight - WindowMargin + 40);
}
function drawSelectEquipmentPartWindow(x, y, WindowWidth, WindowHeight, WindowMargin = 10, frameColor = "rgba(255,255,255, 0.5)") {
    g.fillStyle = frameColor;
    g.fillRect(x, y, WindowWidth, WindowHeight);
    g.fillStyle = "rgba(0,0,0,0.7)";
    g.fillRect(x + WindowMargin, y + WindowMargin, WindowWidth - WindowMargin * 2, WindowHeight - WindowMargin * 2);
}
function drawSelectEquipmentPartString(x, y) {
    let equipmentString = [
        "攻撃",
        "防御",
    ];
    g.font = "bold 16pt DotGothic16";
    g.fillStyle = "rgba(255,255,255, 1)";
    for (let i = 0; i < equipmentString.length; i++) {
        g.fillText(equipmentString[i], x + 50, (y + 35 * i));
    }
    g.fillText(">", x + 20, (y + 35 * menuPointer));
}


function changeMap() {
    changeCount--;
    if (changeCount != 0) {
        g.beginPath();
        g.fillStyle = 'rgb( 0, 0, 0)';
        g.fillRect(0, 0, 640, 640);
        return;
    } else if (changeCount == 0) {
        scene = Scenes.Field;
        changeCount = 60;
        mapChangeInit();
        clearInterval(mapChangeFunction);
        gameLoopFunction = setInterval(gameloop, 16);
        return;
    }
}

function mapSet() {
    switch (map[player.y][player.x]) {
        case 2:
            for (let i = roomCoorData[mapNum[player.y][player.x]][0]; i <= roomCoorData[mapNum[player.y][player.x]][2]; i++) {
                for (let j = roomCoorData[mapNum[player.y][player.x]][1]; j <= roomCoorData[mapNum[player.y][player.x]][3]; j++) {
                    if ((mapData[i][j] & MINIMAPCOORDATA) == 0) {
                        mapData[i][j] += MINIMAPCOORDATA;
                    }
                }
            }
            let numberX = mapNum[player.y][player.x];
            for (i = 0; i < roomDoorData[numberX].length; i++) {
                if ((mapData[roomDoorData[numberX][i][0]][roomDoorData[numberX][i][1]] & MINIMAPCOORDATA) == 0) {
                    mapData[roomDoorData[numberX][i][0]][roomDoorData[numberX][i][1]] += MINIMAPCOORDATA;
                }
            }
            break;
        case 3:
            let MINIMAPDATA = [ //上、右上、右、右下、下、左下、左、左上
                [player.y - 1, player.x],
                [player.y - 1, player.x + 1],
                [player.y, player.x + 1],
                [player.y + 1, player.x + 1],
                [player.y + 1, player.x],
                [player.y + 1, player.x - 1],
                [player.y, player.x - 1],
                [player.y - 1, player.x - 1],
            ];
            for (let i = 0; i < 8; i++) {
                if ((map[MINIMAPDATA[i][0]][MINIMAPDATA[i][1]] == 2 || map[MINIMAPDATA[i][0]][MINIMAPDATA[i][1]] == 3) && (mapData[MINIMAPDATA[i][0]][MINIMAPDATA[i][1]] & MINIMAPCOORDATA) == 0) {
                    mapData[MINIMAPDATA[i][0]][MINIMAPDATA[i][1]] += MINIMAPCOORDATA;
                }
            }
            break;
    }
}




