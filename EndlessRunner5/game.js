let game;

// global game options
let gameOptions = {

    // platform speed range, in pixels per second
    platformSpeedRange: [100, 100],

    // mountain speed, in pixels per second
    mountainSpeed: 80,

    // spawn range, how far should be the rightmost platform from the right edge
    // before next platform spawns, in pixels
    spawnRange: [80, 300],

    // platform width range, in pixels
    platformSizeRange: [90, 300],

    // a height range between rightmost platform and next platform to be spawned
    platformHeightRange: [-5, 5],

    // a scale to be multiplied by platformHeightRange
    platformHeighScale: 20,

    // platform max and min height, as screen height ratio
    platformVerticalLimit: [0.4, 0.8],

    // player gravity
    playerGravity: 500,

    // player jump force
    jumpForce: 400,

    // player starting X position
    playerStartPosition: 200,

    // consecutive jumps allowed
    jumps: 1,

    // % of probability a coin appears on the platform
    coinPercent: 25,

    // % of probability a fire appears on the platform
    firePercent: 25
}

let gameStatus = {
    currentScore: 0,
    bestScore: 0,
    started: false,
    paused: false,
    muted: false,
    currentSpeed: 180,
}

window.onload = function() {

    // object containing configuration options
    let gameConfig = {
        type: Phaser.AUTO,
        width: 1080,
        height: 520,
        scene: [preloadGame, playGame],
        backgroundColor: 0x0c88c7,
        parent: 'game-content',
        dom: {
            createContainer: true
        },
        // physics settings
        physics: {
            default: "arcade",
            arcade: {
                debug: false
            }
        }
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
    //resize();
    //window.addEventListener("resize", resize, false);
}

// preloadGame scene
class preloadGame extends Phaser.Scene{
    constructor(){
        super("PreloadGame");
    }

    preload(){
        this.load.html('nameform', 'loginform.html');

        this.load.image("platform", "assets/platform.png");
        this.load.image("title", "assets/game-title.png");
        this.load.image("titleLogo", "assets/Logo.png");
        this.load.image("startBtn", "assets/start-btn.png");
        this.load.image('help', 'assets/helpIcon.png');
        this.load.image('sound', 'assets/Sound.png');
        this.load.image('pause', 'assets/Pause.png');
        this.load.image('road', 'assets/road.png');
        this.load.image('helpScreen', 'assets/HelpScreen.png');
        this.load.image('gameover', 'assets/game-over.png');
        this.load.image('gameoverBoard', 'assets/gameover-board.png');
        this.load.image('submitscoreBtn', 'assets/submitscore-btn.png');
        this.load.image('tryagainBtn', 'assets/tryagain-btn.png');
        this.load.image('shareSign', 'assets/share-sign.png');
        
        this.load.image('obstacle1', 'assets/obstacle1.png');
        this.load.image('obstacle2', 'assets/obstacle2.png');
        this.load.image('obstacle3', 'assets/obstacle3.png');
        this.load.image('obstacle4', 'assets/obstacle4.png');

        // this.load.spritesheet('button', 'assets/button_sprite_sheet.png', {
        //     frameWidth: 193,
        //     frameHeight: 71
        // });
        // player is a sprite sheet made by 24x48 pixels

        this.load.spritesheet("player", "assets/player.png", {
            frameWidth: 170,
            frameHeight: 210
        });

        // this.load.spritesheet("player", "assets/player.png", {
        //     frameWidth: 24,
        //     frameHeight: 48
        // });
        // this.load.spritesheet("obstacle", "assets/obstacle1.png", {
        //     frameWidth: 82,
        //     frameHeight: 32
        // });
        // mountains are a sprite sheet made by 512x512 pixels
        // this.load.spritesheet("mountain", "assets/mountain.png", {
        //     frameWidth: 512,
        //     frameHeight: 512
        // });

        this.load.image('mountain2', 'assets/bgmountain-2.png');
        this.load.image('bgtree1', 'assets/bg-tree1.png');
        this.load.image('bgtree2', 'assets/bg-tree2.png');

        this.load.audio('theme', [
            'assets/audio/technogeek.mp3'
        ]);
    }

    create(){
        // setting player animation
        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("player", {
                start: 0,
                end: 11
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "jump",
            frames: this.anims.generateFrameNumbers("player", {
                start: 12,
                end: 20
            }),
            frameRate: 10,
            repeat: 0
        });

        // setting coin animation
        // this.anims.create({
        //     key: "rotate",
        //     frames: this.anims.generateFrameNumbers("coin", {
        //         start: 0,
        //         end: 5
        //     }),
        //     frameRate: 15,
        //     yoyo: true,
        //     repeat: -1
        // });

        // // setting fire animation
        // this.anims.create({
        //     key: "burn",
        //     frames: this.anims.generateFrameNumbers("fire", {
        //         start: 0,
        //         end: 4
        //     }),
        //     frameRate: 15,
        //     repeat: -1
        // });

        this.scene.start("PlayGame");
    }
}

var scoreLable;
var music;
var playerVelocity;
var faq;
var gameover;
var gameoverBoard;
var submitscoreBtn;
var tryagainBtn;
var runningDistance = 0;
var mouseInButton = false;
var preObstcleTime = 0;
var obstacleTypes = ['obstacle1', 'obstacle2', 'obstacle3', 'obstacle4'];
var updateSpeedInterval = 0;
var resscoreLable;
var restextLable;
var titleLogo;
var title;
var startBtn;
var mutebtn;
var pausebtn;
var bt;
var shareSign;

// playGame scene
class playGame extends Phaser.Scene{

    constructor(){
        super("PlayGame");
    }

    create(data){
        //this.startGame();

        if(gameStatus.currentScore > gameStatus.bestScore) gameStatus.bestScore = gameStatus.currentScore;
        gameStatus.currentScore = 0;
        gameStatus.currentSpeed = 180;

        //if(!titleLogo)
        {
           titleLogo = this.add.image(game.config.width / 2, 100, 'titleLogo');
           titleLogo.setDepth(3);
           titleLogo.setScale(0.3);
        }

        //if(!title)
        {
            title = this.add.image(game.config.width / 2, 200, 'title');
            title.setDepth(3);
            title.setScale(0.3);
        }

        //if(!faq)
        {
           faq = this.add.image(game.config.width / 2, 240, 'helpScreen');
           faq.setScale(.5);
           faq.setDepth(4);
           faq.visible = false;
        }

        //if(!gameover)
        {
           gameover = this.add.image(game.config.width / 2, 150, 'gameover')
           gameover.setScale(.5);
           gameover.setDepth(4);
           gameoverBoard = this.add.image(game.config.width / 2, 340, 'gameoverBoard')
           gameoverBoard.setScale(.5);
           gameoverBoard.setDepth(3);
           submitscoreBtn = this.add.image(game.config.width / 2 + 100, 400, 'submitscoreBtn').setInteractive(new Phaser.Geom.Rectangle(0, -10, 170, 57), Phaser.Geom.Rectangle.Contains);
           submitscoreBtn.on('pointerup', function () {

           });
           submitscoreBtn.setDepth(4);
           submitscoreBtn.setScale(.7);
           tryagainBtn = this.add.image(game.config.width / 2 -100, 400, 'tryagainBtn').setInteractive(new Phaser.Geom.Rectangle(50, -10, 170, 57), Phaser.Geom.Rectangle.Contains);
           tryagainBtn.on('pointerup', function () {
               this.scene.scene.start("PlayGame", true);
           });
           tryagainBtn.setScale(.7);
           tryagainBtn.setDepth(4);
           restextLable = this.add.text(game.config.width / 2-80, 200, 'Your Score', { font: '28px Arial', fill: '#666666' });
           restextLable.setDepth(4);
           resscoreLable = this.add.text(game.config.width / 2-30, 240, '0', { font: '28px Arial', fill: '#000000' });
           resscoreLable.setDepth(4);

           shareSign = this.add.image(game.config.width / 2, 690, 'shareSign').setInteractive(new Phaser.Geom.Rectangle(50, -40, 546, 63), Phaser.Geom.Rectangle.Contains);
           shareSign.setDepth(4);

           gameover.visible = false;
           gameoverBoard.visible = false;
           submitscoreBtn.visible = false;
           tryagainBtn.visible = false;
           restextLable.visible = false;
           resscoreLable.visible = false;
           shareSign.visible = false;
        }

        //if(!scoreLable)
        {
           scoreLable = this.add.text(10, 10, 'aaa', { font: '48px Arial', fill: '#000000' });
           scoreLable.setDepth(4);
           scoreLable.visible = false;
        }
    
        //if(!startBtn)
        {
            startBtn = this.add.image(game.config.width / 2, 460, 'startBtn').setInteractive(new Phaser.Geom.Rectangle(0, -40, 211, 190), Phaser.Geom.Rectangle.Contains);
            startBtn.setScale(0.7);
            startBtn.setDepth(3);
            startBtn.on('pointerup', function () {
                  this.startGame();
            }, this);
        }

        //if(!mutebtn)
        {
            mutebtn = this.add.image(1000, 50, 'sound').setInteractive(new Phaser.Geom.Rectangle(-25, 0, 45, 35), Phaser.Geom.Rectangle.Contains);
            mutebtn.setDepth(3);
            mutebtn.on('pointerup', function () {
                this.muteGame();
            }, this);
            mutebtn.on('pointerover', function () {
                mouseInButton = true;
            }, this);
            mutebtn.on('pointerout', function () {
                mouseInButton = false;
            }, this);
            mutebtn.visible  = false;
        }

        //if(!pausebtn)
        {
            pausebtn = this.add.image(900, 50, 'pause').setInteractive(new Phaser.Geom.Rectangle(-15, 0, 30, 36), Phaser.Geom.Rectangle.Contains);
            pausebtn.setDepth(3);
            pausebtn.on('pointerup', function () {
                this.pauseGame();
            }, this);
            pausebtn.on('pointerover', function () {
                mouseInButton = true;
            }, this);
            pausebtn.on('pointerout', function () {
                mouseInButton = false;
            }, this);
            pausebtn.visible  = false;
        }

        //if(!bt)
        {
            bt = this.add.image(800, 50, 'help').setInteractive(new Phaser.Geom.Rectangle(-15, 0, 30, 61), Phaser.Geom.Rectangle.Contains);
            bt.setDepth(3);
            bt.on('pointerup', function () {
                this.showFAQ();
            }, this);
            bt.on('pointerover', function () {
                mouseInButton = true;
            }, this);
            bt.on('pointerout', function () {
                mouseInButton = false;
            }, this);
            bt.visible  = false;
        }

        this.input.on('gameobjectover', function (pointer, gameObject) {
            gameObject.alpha = 0.1;
        });
    
        this.input.on('gameobjectout', function (pointer, gameObject) {
            gameObject.alpha = 1;
        });

        // group with all active mountains.
        this.mountainGroup = this.add.group();
        this.bgtree2Group = this.add.group();

        // // group with all active platforms.
        this.platformGroup = this.add.group({
            // once a platform is removed, it's added to the pool
            // removeCallback: function(platform){
            //     platform.scene.platformPool.add(platform)
            // }
        });

        // // platform pool
        // this.platformPool = this.add.group({
        //     // once a platform is removed from the pool, it's added to the active platforms group
        //     removeCallback: function(platform){
        //         platform.scene.platformGroup.add(platform)
        //     }
        // });

        this.obstacleGroup = this.add.group({
            removeCallback: function(obstacle){
                obstacle.scene.obstaclePool.add(obstacle)
            }
        });

        this.obstaclePool = this.add.group({
            removeCallback: function(obstacle){
                obstacle.scene.obstacleGroup.add(obstacle)
            }
        });

        // adding a mountain
        this.addMountains()

        // keeping track of added platforms
        this.addedPlatforms = 0;

        // number of consecutive jumps made by the player so far
        this.playerJumps = 0;

        // adding a platform to the game, the arguments are platform width, x position and y position
        this.addPlatform();

        // adding the player;
        this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height * 0.6, "player");
        this.player.setGravityY(gameOptions.playerGravity);
        this.player.setDepth(2);
        this.player.setScale(.8);
        this.player.visible = false;

        // the player is not dying
        this.dying = false;

        // setting collisions between the player and the platform group
        this.platformCollider = this.physics.add.collider(this.player, this.platformGroup, function(){
            // play "run" animation if the player is on a platform
            if(!this.player.anims.isPlaying){
                this.player.anims.play("run");
            }
        }, null, this);

        // setting collisions between the player and the fire group
        this.obstacleCollider =  this.physics.add.overlap(this.player, this.obstacleGroup, function(player, fire){
            this.dying = true;
            this.player.anims.stop();
            this.player.setFrame(2);
            this.player.body.setVelocityY(-200);
            this.physics.world.removeCollider(this.obstacleCollider);
            this.physics.world.removeCollider(this.platformCollider);
        }, null, this);

        if(!music){
            music = this.sound.add('theme');
            music.play();
        }

        if(data == true) this.startGame();
    }

    startGame(){
        titleLogo.visible = false;
        title.visible = false;
        startBtn.visible = false;

        this.player.visible = true;
        scoreLable.visible  = true;
        bt.visible  = true;
        mutebtn.visible = true;
        pausebtn.visible = true;
       // checking for input
       this.input.on("pointerdown", this.jump, this);

       gameStatus.started = true;

        // var element = this.add.dom(400, 600).createFromCache('nameform');
        // element.setPerspective(800);

        // this.tweens.add({
        //     targets: element,
        //     y: 300,
        //     duration: 3000,
        //     ease: 'Power3'
        // });
    }

    showFAQ(){
         if(gameStatus.paused && !faq.visible) return;

         faq.visible = !faq.visible;
        this.pauseGame();
    }

    muteGame() {
        gameStatus.muted = !gameStatus.muted;
        music.setMute(gameStatus.muted);
    }

    pauseGame(){
        gameStatus.paused = !gameStatus.paused;
        if(gameStatus.paused){

            this.platformGroup.getChildren().forEach(function(platform){
                platform.body.setVelocityX(0);
            }, this);

            this.bgtree2Group.getChildren().forEach(function(mountain){
                mountain.body.setVelocityX(0);
            });

            this.obstacleGroup.getChildren().forEach(function(obstacle){
                obstacle.body.setVelocityX(0);
            });

            this.player.anims.stop();
            playerVelocity = this.player.body.velocity.y;
            this.player.body.setVelocityY(0);
            this.player.setGravityY(0);

            music.pause();
        }else{

            this.platformGroup.getChildren().forEach(function(platform){
                platform.body.setVelocityX(gameStatus.currentSpeed * -1);
            }, this);

            this.bgtree2Group.getChildren().forEach(function(mountain){
                mountain.body.setVelocityX(gameOptions.mountainSpeed * -1);
            });

            this.obstacleGroup.getChildren().forEach(function(obstacle){
                obstacle.body.setVelocityX(gameStatus.currentSpeed * -1);
            });

            this.player.anims.play();
            this.player.body.setVelocityY(playerVelocity);
            this.player.setGravityY(gameOptions.playerGravity);

            music.resume();
        }
    }

    updateScore() {
        var spd = gameStatus.currentSpeed / 100;
        gameStatus.currentScore += Math.round(spd);
        scoreLable.text = gameStatus.currentScore;

        if(updateSpeedInterval > 100){
           this.updateGameSpeed(gameStatus.currentSpeed + 3);
           updateSpeedInterval = 0;
        }

        updateSpeedInterval++;
    }

    updateGameSpeed(speed){
        this.platformGroup.getChildren().forEach(function(platform){
            platform.body.setVelocityX(speed * -1);
        }, this);

        this.obstacleGroup.getChildren().forEach(function(obstacle){
            obstacle.body.setVelocityX(speed* -1);
        });

        gameStatus.currentSpeed = speed;
    }

    // the core of the script: platform are added from the pool or created on the fly
    addPlatform(){
        this.addedPlatforms ++;
        let platform;
      
        platform = this.add.image(0, game.config.height, "road");
        this.physics.add.existing(platform);
        platform.body.setImmovable(true);
        platform.body.setVelocityX(gameStatus.currentSpeed * -1);
        platform.setDepth(2);
        platform.body.offset.y = 23;
        this.platformGroup.add(platform);

        let platform2 = this.add.image(platform.width -2 , game.config.height, "road");
        this.physics.add.existing(platform2);
        platform2.body.setImmovable(true);
        platform2.body.setVelocityX(gameStatus.currentSpeed * -1);
        platform2.setDepth(2);
        platform2.body.offset.y = 23;
        this.platformGroup.add(platform2);
    }

    // adding mountains
    addMountains() {
        let mountain = this.physics.add.image(0, game.config.height, "mountain2");
        mountain.setScale(.5);
        mountain.setOrigin(0, 1.3);

        this.addBGTree();
    }

    addObstcles() {
        if(Phaser.Math.Between(1, 2000) <= gameOptions.firePercent){
            if(preObstcleTime > 20000/gameStatus.currentSpeed)
            {
                if(this.obstaclePool.getLength()){
                    let obstacle = this.obstaclePool.getFirst();
                    obstacle.x = game.config.width + Phaser.Math.Between(1, 3);
                    //obstacle.y = game.config.height - 82;
                    obstacle.setVelocityX(gameStatus.currentSpeed * -1);
                    obstacle.alpha = 1;
                    obstacle.active = true;
                    obstacle.visible = true;
                    this.obstaclePool.remove(obstacle);
                }
                else{
                    var typeIndex = Phaser.Math.Between(0, 3);
                    var currentOb = obstacleTypes[typeIndex];

                    var obHeight = game.config.height;
                    var obSizeW = 46;
                    var obSizeH = 27;

                    switch(typeIndex){
                        case 0:
                            obHeight = game.config.height - 85
                            break;
                        case 1:
                            obHeight = game.config.height - 110
                            obSizeW = 52;
                            obSizeH = 62;
                            break;
                        case 2:
                            obHeight = game.config.height - 110
                            obSizeW = 52;
                            obSizeH = 72;
                            break;
                        case 3:
                            obHeight = game.config.height - 70
                            obSizeW = 110;
                            obSizeH = 30;
                            break;
                    }

                    let obstacle = this.physics.add.sprite(game.config.width + Phaser.Math.Between(1, 3), obHeight, currentOb);
                    obstacle.setScale(0.8);
                    obstacle.setImmovable(true);
                    obstacle.setVelocityX(gameStatus.currentSpeed * -1);
                    obstacle.setSize(obSizeW, obSizeH, true)
                    //obstacle.anims.play("burn");
                    obstacle.setDepth(2);
                    this.obstacleGroup.add(obstacle);
                }

                preObstcleTime = 0;
            }
        }
        preObstcleTime++;
    }

    addBGTree() {
        let bgtree1 = this.physics.add.sprite(0, game.config.height, "bgtree1");
        bgtree1.setOrigin(0.5, .6);

        let bgtree2 = this.physics.add.sprite(0, game.config.height, "bgtree2");
        bgtree2.setOrigin(0.5, .5);
        let bgtree22 = this.physics.add.sprite(bgtree2.width - 2, game.config.height, "bgtree2");
        bgtree22.setOrigin(0.5, .5);

        this.bgtree2Group.add(bgtree2);
        this.bgtree2Group.add(bgtree22);

        bgtree2.body.setVelocityX(gameOptions.mountainSpeed * -1)
        bgtree22.body.setVelocityX(gameOptions.mountainSpeed * -1)
    }

    // addMountains(){
    //     let rightmostMountain = this.getRightmostMountain();
    //     if(rightmostMountain < game.config.width * 2) {
    //         let mountain = this.physics.add.sprite(rightmostMountain + Phaser.Math.Between(100, 350), game.config.height + Phaser.Math.Between(0, 100), "mountain2");
    //         mountain.setOrigin(0.5, 1);
    //         mountain.body.setVelocityX(gameOptions.mountainSpeed * -1)
    //         this.mountainGroup.add(mountain);
    //         if(Phaser.Math.Between(0, 1)){
    //             mountain.setDepth(1);
    //         }
    //         mountain.setFrame(Phaser.Math.Between(0, 3))
    //         this.addMountains()
    //     }
    // }

    // getting rightmost mountain x position
    // getRightmostMountain(){
    //     let rightmostMountain = -200;
    //     this.mountainGroup.getChildren().forEach(function(mountain){
    //         rightmostMountain = Math.max(rightmostMountain, mountain.x);
    //     })
    //     return rightmostMountain;
    // }

    getRightmostRoad(){
        let rightmostRoad = -200;
        this.platformGroup.getChildren().forEach(function(road){
            rightmostRoad = Math.max(rightmostRoad, road.x);
        })
        return rightmostRoad;
    }

    getRightmostTree(){
        let rightmostTree = -200;
        this.bgtree2Group.getChildren().forEach(function(tree){
            rightmostTree = Math.max(rightmostTree, tree.x);
        })
        return rightmostTree;
    }

    // the player jumps when on the ground, or once in the air as long as there are jumps left and the first jump was on the ground
    // and obviously if the player is not dying
    jump(){
        if(faq.visible){
            this.showFAQ();
            return;
        }

        if(mouseInButton) return;

        if((!this.dying) && (this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps))){
            if(this.player.body.touching.down){
                this.playerJumps = 0;
            }

            this.player.anims.play("jump");
            this.player.setVelocityY(gameOptions.jumpForce * -1);
            this.playerJumps ++;

            // stops animation
            //this.player.anims.stop();
        }
    }

    gameOver(){

        gameStatus.started = false;
        gameover.visible = true;
        gameoverBoard.visible = true;
        submitscoreBtn.visible = true;
        tryagainBtn.visible = true;
        restextLable.visible = true;
        resscoreLable.text = gameStatus.currentScore;
        resscoreLable.visible = true;
        shareSign.visible = true;

        //this.scene.start("PlayGame");
        //scoreLable.visible = false;
    }

    update(){

        if(gameStatus.paused) return;

        // game over
        if(this.player.y > game.config.height){
            this.gameOver();
        }

        this.player.x = gameOptions.playerStartPosition;

        // recycling platforms
        this.platformGroup.getChildren().forEach(function(platform){
            if(platform.x < -platform.width/2){
                let rightmostTree = this.getRightmostRoad();
                platform.x = rightmostTree + platform.width - 2;
            }
        }, this);

        this.obstacleGroup.getChildren().forEach(function(obstacle){
            if(obstacle.x < - obstacle.displayWidth / 2){
                this.obstacleGroup.killAndHide(obstacle);
                this.obstacleGroup.remove(obstacle);
            }
        }, this);

        // recycling mountains
        // this.mountainGroup.getChildren().forEach(function(mountain){
        //     if(mountain.x < - mountain.displayWidth){
        //         let rightmostMountain = this.getRightmostMountain();
        //         mountain.x = rightmostMountain + Phaser.Math.Between(100, 350);
        //         mountain.y = game.config.height + Phaser.Math.Between(0, 100);
        //         mountain.setFrame(Phaser.Math.Between(0, 3))
        //         if(Phaser.Math.Between(0, 1)){
        //             mountain.setDepth(1);
        //         }
        //     }
        // }, this);

        // recycling trees
        this.bgtree2Group.getChildren().forEach(function(tree){
            if(tree.x < - tree.width/2){
                let rightmostTree = this.getRightmostTree();
                tree.x = rightmostTree + tree.width - 2;
            }
        }, this);

        if(!gameStatus.started) return;

        //adding obstcles
        this.addObstcles();

        runningDistance++;

        if(runningDistance > 10){
            runningDistance = 0;
            this.updateScore();
        }
    }
};

function resize(){
    let canvas = document.querySelector("canvas");
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let windowRatio = windowWidth / windowHeight;
    let gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
