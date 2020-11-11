let game;

// global game options
let gameOptions = {

    // platform speed range, in pixels per second
    platformSpeedRange: [100, 100],

    // mountain speed, in pixels per second
    mountainSpeed: 80,

    cloudSpeed: 20,

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
    jumpForce: 460,

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
        scene: [preloadGame, playGame],
        backgroundColor: 0xf4f4e2,
        width: 1280,
        height: 720,
        scale:{
            mode: Phaser.Scale.FIT,
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
    //window.addEventListener("resize", resize, false);
    //resize();
}

// preloadGame scene
class preloadGame extends Phaser.Scene{
    constructor(){
        super("PreloadGame");
    }

    preload(){

        this.add.text( game.config.width / 2, game.config.height / 2, 'Loading...', { fontFamily: 'bahnschrift, Montserrat', fontSize: 60, fill: '#666666' }).setOrigin(0.5);

        this.load.html('nameform', 'loginform.html');

        this.load.image("platform", "assets/platform.png");
        this.load.image("title", "assets/game-title.png");
        this.load.image("titleLogo", "assets/Logo.png");
        this.load.image("startBtn", "assets/start-btn.png");
        this.load.image('help', 'assets/helpIcon.png');
        this.load.image('sound', 'assets/Sound.png');
        this.load.image('muted', 'assets/muted.png');
        this.load.image('pause', 'assets/Pause.png');
        this.load.image('play', 'assets/play.png');
        this.load.image('road', 'assets/road.png');
        this.load.image('helpScreen', 'assets/HelpScreen.png');
        this.load.image('gameover', 'assets/game-over.png');
        this.load.image('gameoverBoard', 'assets/gameover-board.png');
        this.load.image('submitscoreBtn', 'assets/submitscore-btn.png');
        this.load.image('submitscoreBtnS','assets/submitscore-btn-s.png');
        this.load.image('tryagainBtn', 'assets/tryagain-btn.png');
        this.load.image('shareSign', 'assets/share-sign.png');
        this.load.image('rd', 'assets/r-d.png');

        this.load.image('obstacle1', 'assets/Obstacle-1.png');
        this.load.image('obstacle2', 'assets/Obstacle-2.png');
        this.load.image('obstacle3', 'assets/Obstacle-3.png');
        this.load.image('obstacle4', 'assets/Obstacle-4.png');
        this.load.image('obstacle5', 'assets/Obstacle-5.png');
        this.load.image('obstacle6', 'assets/Obstacle-6.png');
        this.load.image('obstacle7', 'assets/Obstacle-7.png');
        this.load.image('obstacle8', 'assets/Obstacle-8.png');
        this.load.image('obstacle9', 'assets/Obstacle-9.png');
        this.load.image('obstacle10', 'assets/Obstacle-10.png');

        this.load.spritesheet("player", "assets/player.png", {
            frameWidth: 170,
            frameHeight: 210
        });

        this.load.image('clouds', 'assets/bg-clouds.png');
        this.load.image('mountain1', 'assets/bgmountain-1.png');
        this.load.image('mountain2', 'assets/bgmountain-2.png');
        this.load.image('bgtree1', 'assets/bg-tree1.png');
        this.load.image('bgtree2', 'assets/bg-tree2.png');

        //var styles = '@font-face { font-family: "bahnschrift"; src: url("assets/fonts/bahnschrift.ttf") format("opentype"); }\n';

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
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: "jump",
            frames: this.anims.generateFrameNumbers("player", {
                start: 13,
                end: 15
            }),
            frameRate: 6,
            repeat: 0
        });

       

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
var submitscoreBtnS;
var tryagainBtn;
var runningDistance = 0;
var mouseInButton = false;
var preObstcleTime = 0;
var submitText = 'To be eligible for the Mountain Trail Game Leaderboard,\nsubmit the screenshot of your score and\nsend it to enquiry@themindsetchallengecarnival.com\nbefore 23:59hrs, 13 December 2020.\n\nThe top 5 winners name will be displayed\non the Leaderboard by 12:00hrs on 18 December 2020.';
var obstacleLables = [
    'Fear',
    'Depression',
    'Anxiety',
    'Stress',
    'Panic Disorder',
    'PTSD',
    'shame', 
    'guilt',
    'self-blame',
    'addictions'
];
var obstacleTypes = ['obstacle1', 'obstacle2', 'obstacle3', 'obstacle4','obstacle5', 'obstacle6', 'obstacle7', 'obstacle8', 'obstacle9', 'obstacle10'];
var gameOverByText = ['Robert Schuller',
'John Green',
'',
'Unknown',
'Unknown',
'Glenn Close',
'',
'',
'Emery Lord',
'Albus Dumbledore from Harry Potter\n and the Prisoner of Azkaban',
'Leonard Cohen',
'Unknown',
'Bill Clinton',
'Mariska Hargitay'];
var gameOverText = ['"Tough times never last, but\n tough people do!"',
'"There is hope, even when your brain\n tells you there isnt."',
'"I fight for my health every day in\n ways most people dont understand.\nIm not lazy. Im a warrior."',
'"Dont let your struggle become your\n identity."',
'"The strongest people are those who win\n battles we know nothing about."',
'"What mental health needs are more\n sunlight, more candor, and more unashamed conversation."',
'Dr. Lauren Fogel Mersy -"Beingable to\n be your true\nself is one of the strongest components\n of good mental health."',
'"Today I refuse to stress myself out\n over things I cant control and change."',
'"My dark days made me stronger.Or maybe\n I already was strong,and they made me prove it."',
'"Happiness can be found even in the\n darkest of times\nif one only remembers to turn on the light."',
'"There is a crack in everything, thats\n how the light gets in"',
'"Its okay to not be okay"',
'"Mental illness is nothing to be\n ashamed of, but stigma and\n bias shame us all."',
'"Healing takes time, and asking for\n help is a courageous step."'];
var updateSpeedInterval = 0;
var resscoreLable;
var gameovertextLable;
var gameovertextbyLable;
var restextLable;
var titleLogo;
var title;
var startBtn;
var rd;
var mutebtn;
var mutedbtn;
var pausebtn;
var playbtn;
var bt;
var shareSign;
var screenMaskGraphics;
var submitTextLableContain;

// playGame scene
class playGame extends Phaser.Scene{

    constructor(){
        super("PlayGame");
    }

    create(data){

        var rect = new Phaser.Geom.Rectangle(0, 0, 1920, 140);
        var graphics = this.add.graphics({ fillStyle: { color: 0xffffff } });
        graphics.fillRectShape(rect);
        graphics.setDepth(2);

        titleLogo = this.add.image(game.config.width / 2, 70, 'titleLogo');
        titleLogo.setScale(.7);
        titleLogo.setDepth(3);

        if(gameStatus.currentScore > gameStatus.bestScore) gameStatus.bestScore = gameStatus.currentScore;
        gameStatus.currentScore = 0;
        gameStatus.currentSpeed = 180;

        var screenMask =  new Phaser.Geom.Rectangle(0, 140, 1280, 768);
        screenMaskGraphics = this.add.graphics({ fillStyle: { color: 0x000000 } });
        screenMaskGraphics.alpha = 0.5;
        screenMaskGraphics.fillRectShape(screenMask);
        screenMaskGraphics.setDepth(3);
        screenMaskGraphics.visible = false;

        //if(!title)
        {
            title = this.add.image(game.config.width / 2, 300, 'title');
            title.setDepth(3);
            title.setScale(0.6);
        }

        //if(!faq)
        {
           faq = this.add.image(game.config.width / 2, 460, 'helpScreen');
           faq.setScale(.6);
           faq.setDepth(4);
           faq.visible = false;
        }

        //if(!gameover)
        {
           gameover = this.add.image(game.config.width / 2, 220, 'gameover')
           gameover.setScale(.7);
           gameover.setDepth(4);
           gameoverBoard = this.add.image(game.config.width / 2, 470, 'gameoverBoard')
           gameoverBoard.setScale(.7);
           gameoverBoard.setDepth(3);
           submitscoreBtn = this.add.image(game.config.width / 2 + 110, 600, 'submitscoreBtn').setInteractive({ cursor: 'pointer' }, new Phaser.Geom.Rectangle(0, -10, 170, 57), Phaser.Geom.Rectangle.Contains);
           submitscoreBtn.on('pointerup', function () {
              this.submitScore();
           },this);
           submitscoreBtn.setDepth(4);
           submitscoreBtn.setScale(.8);

           submitscoreBtnS = this.add.image(game.config.width / 2 + 110, 600, 'submitscoreBtnS').setInteractive({ cursor: 'pointer' }, new Phaser.Geom.Rectangle(0, -10, 170, 57), Phaser.Geom.Rectangle.Contains);
           submitscoreBtnS.on('pointerup', function () {
           },this);
           submitscoreBtnS.setDepth(4);
           submitscoreBtnS.setScale(.8);

           tryagainBtn = this.add.image(game.config.width / 2 -110, 600, 'tryagainBtn').setInteractive({ cursor: 'pointer' }, new Phaser.Geom.Rectangle(50, -10, 170, 57), Phaser.Geom.Rectangle.Contains);
           tryagainBtn.on('pointerup', function () {
               this.scene.scene.start("PlayGame", true);
           });
           tryagainBtn.setScale(.8);
           tryagainBtn.setDepth(4);

           restextLable = this.add.text(game.config.width / 2, 310, 'Your Score', {fontFamily: 'bahnschrift semiBold SemiCondensed, Montserrat', fontSize: 50, fill: '#4f4f4f' }).setOrigin(0.5);
           restextLable.setDepth(4);
           resscoreLable = this.add.text(game.config.width / 2, 360, '0', { fontFamily: 'bahnschrift semiBold SemiCondensed, Montserrat', fontSize: 40, fill: '#000000' }).setOrigin(0.5);
           resscoreLable.setDepth(4);
           gameovertextLable = this.add.text(game.config.width / 2, 450, 'Your Score', { fontFamily: 'bahnschrift regular, Montserrat', fontSize: 18, fill: '#4f4f4f',align: 'center', lineSpacing: 1 }).setOrigin(0.5);
           gameovertextLable.setDepth(4);
           gameovertextbyLable = this.add.text(game.config.width / 2, 510, 'unknown', {  fontFamily: 'bahnschrift light, Montserrat', fontSize: 18, fill: '#4f4f4f',align: 'center', lineSpacing: 1 }).setOrigin(0.5);
           gameovertextbyLable.setDepth(4);

           submitTextLableContain = this.add.container(game.config.width / 2, 420);
           var text = this.add.text(0, 0, 'To be eligible for the Mountain Trail Game Leaderboard,\nsubmit the screenshot of your score and send it to', { fontFamily: 'bahnschrift light', fontSize: 18, lineSpacing: 1, align: 'center', fill: '#4f4f4f' }).setOrigin(0.5);
           var text1 = this.add.text(0, 45, 'enquiry@themindsetchallengecarnival.com\nbefore 23:59hrs, 25 December 2020.', { fontFamily: 'bahnschrift regular, Montserrat', fontSize: 18, align: 'center', lineSpacing: 1, fill: '#4f4f4f' }).setOrigin(0.5);
           var text2 = this.add.text(0, 90, 'Top 5 winners names will be displayed on the Leaderboard', { fontFamily: 'bahnschrift light, Montserrat, Montserrat', fontSize: 18, align: 'center', fill: '#4f4f4f' }).setOrigin(0.5);
           var text3 = this.add.text(0, 110, 'by 12:00hrs on 29 December 2020.', { fontFamily: 'bahnschrift regular, Montserrat', fontSize: 18, align: 'center', fill: '#4f4f4f' }).setOrigin(0.5);
           submitTextLableContain.add(text);
           submitTextLableContain.add(text1);
           submitTextLableContain.add(text2);
           submitTextLableContain.add(text3);
           submitTextLableContain.setDepth(4);

           shareSign = this.add.image(game.config.width / 2, 680, 'shareSign').setInteractive({ cursor: 'pointer' },new Phaser.Geom.Rectangle(50, -40, 546, 63), Phaser.Geom.Rectangle.Contains);
           shareSign.setScale(.8);
           shareSign.setDepth(4);
           shareSign.on('pointerup', function () {
               $(".social-media-container").show();
           }, this);

           gameover.visible = false;
           gameoverBoard.visible = false;
           submitscoreBtn.visible = false;
           submitscoreBtnS.visible = false;
           tryagainBtn.visible = false;
           restextLable.visible = false;
           resscoreLable.visible = false;
           gameovertextLable.visible = false;
           gameovertextbyLable.visible = false;
           shareSign.visible = false;
           submitTextLableContain.visible = false;
        }

        scoreLable = this.add.text(40, 180, '0', {  fontFamily: 'bahnschrift regular, Montserrat', fontSize: 42, fill: '#000000' });
        scoreLable.setDepth(4);
        scoreLable.visible = false;
    
        //if(!startBtn)
        {
            startBtn = this.add.image(game.config.width / 2, game.config.height - 150, 'startBtn').setInteractive({ cursor: 'pointer' }, new Phaser.Geom.Rectangle(0, -40, 211, 190), Phaser.Geom.Rectangle.Contains);
            startBtn.setScale(.9);
            startBtn.setDepth(3);
            startBtn.on('pointerup', function () {
                  this.startGame();
            }, this);

            rd =  this.add.image(game.config.width / 2, game.config.height - 95, 'rd')
            rd.setScale(0.8);
            rd.setDepth(3);
        }

        // this.input.on('gameobjectover', function (pointer, gameObject) {
        //     gameObject.alpha = 0.1;
        // });
    
        // this.input.on('gameobjectout', function (pointer, gameObject) {
        //     gameObject.alpha = 1;
        // });

        // group with all active mountains.
        this.mountainGroup = this.add.group();
        this.bgtree2Group = this.add.group();
        this.bgcloud2Group = this.add.group();

        // this.obLabelGroup = this.add.group({
        //     removeCallback: function(lable){
        //         lable.scene.obLabelPool.add(lable)
        //     }
        // });

        // this.obLabelPool = this.add.group({
        //     removeCallback: function(lable){
        //         lable.scene.obLabelGroup.add(lable)
        //     }
        // });

        // // group with all active platforms.
        this.platformGroup = this.add.group({});

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
        this.addMountains();

        // keeping track of added platforms
        //this.addedPlatforms = 0;

        // number of consecutive jumps made by the player so far
        this.playerJumps = 0;

        // adding a platform to the game, the arguments are platform width, x position and y position
        this.addPlatform();

        // adding the player;
        this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height * 0.6, "player");
        this.player.setGravityY(gameOptions.playerGravity);
        //this.player.body.setImmovable();
        this.player.setDepth(2);
        //this.player.setScale(.8);
        this.player.visible = false;

        // the player is not dying
        this.dying = false;

        // setting collisions between the player and the platform group
        this.platformCollider = this.physics.add.collider(this.player, this.platformGroup, function(){
            // play "run" animation if the player is on a platform
            if(!this.player.anims.isPlaying && !this.dying){
                this.player.anims.play("run");
            }
        }, null, this);

        // setting collisions between the player and the fire group
        this.obstacleCollider =  this.physics.add.overlap(this.player, this.obstacleGroup, function(player, fire){
            this.gameOver();
        }, null, this);

        if(!music){
            music = this.sound.add('theme');
            music.play();
        }

        if(data == true) this.startGame();
    }

    startGame(){

        title.visible = false;
        startBtn.visible = false;
        rd.visible = false;

        this.player.visible = true;
        scoreLable.visible  = true;

        var touchIconRect = new Phaser.Geom.Rectangle(20, 0, 170, 155);

        //if(!mutebtn)
        {
            mutebtn = this.add.image(1000, 210, 'sound').setInteractive({ cursor: 'pointer' }, touchIconRect, Phaser.Geom.Rectangle.Contains);        
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

            mutedbtn = this.add.image(1000, 210, 'muted').setInteractive({ cursor: 'pointer' }, touchIconRect, Phaser.Geom.Rectangle.Contains);        
            mutedbtn.setDepth(3);
            mutedbtn.on('pointerup', function () {
                this.muteGame();
            }, this);
            mutedbtn.on('pointerover', function () {
                mouseInButton = true;
            }, this);
            mutedbtn.on('pointerout', function () {
                mouseInButton = false;
            }, this);
            mutedbtn.visible  = false;
        }

        //if(!pausebtn)
        {
            pausebtn = this.add.image(1200, 210, 'pause').setInteractive({ cursor: 'pointer' }, touchIconRect, Phaser.Geom.Rectangle.Contains);
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

            playbtn = this.add.image(1200, 210, 'play').setInteractive({ cursor: 'pointer' }, touchIconRect, Phaser.Geom.Rectangle.Contains);
            playbtn.setDepth(3);
            playbtn.on('pointerup', function () {
                this.pauseGame();
            }, this);
            playbtn.on('pointerover', function () {
                mouseInButton = true;
            }, this);
            playbtn.on('pointerout', function () {
                mouseInButton = false;
            }, this);
            playbtn.visible = false;
        }

        //if(!bt)
        {
            bt = this.add.image(1100, 210, 'help').setInteractive({ cursor: 'pointer' }, touchIconRect, Phaser.Geom.Rectangle.Contains);
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
        }

        // bt.visible  = true;
        // mutebtn.visible = true;
        // pausebtn.visible = true;

        this.platformGroup.getChildren().forEach(function(platform){
            platform.body.setVelocityX(gameStatus.currentSpeed * -1);
        }, this);

        this.bgtree2Group.getChildren().forEach(function(mountain){
            mountain.body.setVelocityX(gameOptions.mountainSpeed * -1);
        });

        this.bgcloud2Group.getChildren().forEach(function(mountain){
            mountain.body.setVelocityX(gameOptions.cloudSpeed * -1);
        });

        this.obstacleGroup.getChildren().forEach(function(obstacle){
            obstacle.body.setVelocityX(gameStatus.currentSpeed * -1);
        });

        // this.obLabelGroup.getChildren().forEach(function(label){
        //     label.body.setVelocityX(gameStatus.currentSpeed * -1);
        // });

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

    submitScore(){
       gameovertextLable.visible = false;
       gameovertextbyLable.visible = false;
       submitTextLableContain.visible = true;

       submitscoreBtn.visible = false;
       submitscoreBtnS.visible = true;
    }

    showFAQ(){
         if(gameStatus.paused && !faq.visible) return;

         faq.visible = !faq.visible;
         screenMaskGraphics.visible = faq.visible;
        this.pauseGame();
    }

    muteGame() {
        gameStatus.muted = !gameStatus.muted;
        music.setMute(gameStatus.muted);

        mutebtn.visible = !gameStatus.muted;
        mutedbtn.visible = gameStatus.muted;
    }

    pauseGame(){
        gameStatus.paused = !gameStatus.paused;

        playbtn.visible = gameStatus.paused;
        pausebtn.visible = !gameStatus.paused;

        if(gameStatus.paused){

            this.platformGroup.getChildren().forEach(function(platform){
                platform.body.setVelocityX(0);
            }, this);

            this.bgtree2Group.getChildren().forEach(function(mountain){
                mountain.body.setVelocityX(0);
            });

            this.bgcloud2Group.getChildren().forEach(function(mountain){
                mountain.body.setVelocityX(0);
            });

            this.obstacleGroup.getChildren().forEach(function(obstacle){
                obstacle.body.setVelocityX(0);
            });

            // this.obLabelGroup.getChildren().forEach(function(label){
            //     label.body.setVelocityX(0);
            // });

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

            this.bgcloud2Group.getChildren().forEach(function(mountain){
                mountain.body.setVelocityX(gameOptions.cloudSpeed * -1);
            });

            this.obstacleGroup.getChildren().forEach(function(obstacle){
                obstacle.body.setVelocityX(gameStatus.currentSpeed * -1);
            });

            // this.obLabelGroup.getChildren().forEach(function(label){
            //     label.body.setVelocityX(gameStatus.currentSpeed * -1);
            // });

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

        if(updateSpeedInterval > 40){
           this.updateGameSpeed(gameStatus.currentSpeed + 50);
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

        // this.obLabelGroup.getChildren().forEach(function(label){
        //     label.body.setVelocityX(speed* -1);
        // });

        gameStatus.currentSpeed = speed;
    }

    // the core of the script: platform are added from the pool or created on the fly
    addPlatform(){
        //this.addedPlatforms ++;
        let platform;
      
        platform = this.physics.add.image(0, game.config.height, "road");
        //this.physics.add.existing(platform);
        platform.body.setImmovable();
        //platform.body.setVelocityX(gameStatus.currentSpeed * -1);
        platform.setDepth(2);
        platform.body.offset.y = 23;
        this.platformGroup.add(platform);

        let platform2 = this.physics.add.image(platform.width -2 , game.config.height, "road");
        //this.physics.add.existing(platform2);
        platform2.body.setImmovable();
        //platform2.body.setVelocityX(gameStatus.currentSpeed * -1);
        platform2.setDepth(2);
        platform2.body.offset.y = 23;
        this.platformGroup.add(platform2);
    }

    // adding mountains
    addMountains() {

        let mountain = this.physics.add.image(0, game.config.height, "mountain2");
        mountain.setScale(.4);
        mountain.setOrigin(0, 1.7);

        let mountain1 = this.physics.add.image(0, game.config.height, "mountain1");
        mountain1.setScale(.4);
        mountain1.setOrigin(0, 1.4);

        this.addBGTree();
    }

    addObstcles() {
        if(Phaser.Math.Between(1, 2000) <= gameOptions.firePercent){
            if(preObstcleTime > 30000 / gameStatus.currentSpeed)
            {
                if(this.obstaclePool.getLength() > 8){
                    let obstacle = this.obstaclePool.children.entries[Phaser.Math.Between(0, this.obstaclePool.getLength()-1)];
                    obstacle.x = game.config.width + Phaser.Math.Between(1, 3);
                    //obstacle.y = game.config.height - 82;
                    obstacle.setVelocityX(gameStatus.currentSpeed * -1);
                    obstacle.alpha = 1;
                    obstacle.active = true;
                    obstacle.visible = true;
                    obstacle.setDepth(2);
                    this.obstaclePool.remove(obstacle);

                    // let container = this.obLabelPool.children.entries[Phaser.Math.Between(0, this.obLabelPool.getLength()-1)];
                    // container.x = obstacle.x;
                    // container.y = obstacle.y;
                    // container.body.setVelocityX(gameStatus.currentSpeed * -1);
                    // container.visible =true;
                    // container.setDepth(2.1);
                    // this.obLabelPool.remove(container);
                }
                else{
                    var typeIndex = Phaser.Math.Between(0, 9);
                    var currentOb = obstacleTypes[typeIndex];

                    var obHeight = game.config.height;
                    var obSizeW = 42;
                    var obSizeH = 27;

                    switch(typeIndex){
                        case 0:
                        case 1:
                            obHeight = game.config.height - 85
                            break;
                        case 5:
                        case 6:
                        case 7:
                            obHeight = game.config.height - 110
                            obSizeW = 50;
                            obSizeH = 60;
                            break;
                        case 2:
                        case 3:
                        case 4:
                            obHeight = game.config.height - 110
                            obSizeW = 50;
                            obSizeH = 70;
                            break;
                        case 8:
                        case 9:
                            obHeight = game.config.height - 70
                            obSizeW = 110;
                            obSizeH = 30;
                            break;
                    }

                    let obstacle = this.physics.add.sprite(game.config.width + Phaser.Math.Between(1, 3), obHeight, currentOb);
                    obstacle.setImmovable();
                    obstacle.setVelocityX(gameStatus.currentSpeed * -1);
                    obstacle.setSize(obSizeW, obSizeH, true)
                    obstacle.setDepth(2);
                    this.obstacleGroup.add(obstacle);

                    // var container = this.add.container(obstacle.x, obstacle.y);

                    // var r1 = this.add.rectangle(0, 0, 90, 20, 0xffffff);//.setStrokeStyle(1, 0x000000);
                    // var txt = this.add.text(0, 0, obstacleLables[Phaser.Math.Between(0, 9)], { font: '12px bahnschrift', fill: '#000000' }).setOrigin(0.5);
                    // container.add(r1);
                    // container.add(txt);
                    // this.physics.add.existing(container);
                    // container.setDepth(2.1);
                    // container.body.setImmovable(true);
                    // container.body.setVelocityX(gameStatus.currentSpeed * -1);

                    // this.obLabelGroup.add(container);
                }

                preObstcleTime = 0;
            }
        }
        preObstcleTime++;
    }

    addBGTree() {
        let bgtree1 = this.physics.add.sprite(0, game.config.height, "bgtree1");
        bgtree1.setOrigin(0, 1.2);
        bgtree1.setScale(.4);

        let bgtree2 = this.physics.add.sprite(0, game.config.height, "bgtree2");
        bgtree2.setOrigin(0,.5);
        let bgtree22 = this.physics.add.sprite(bgtree2.width -2, game.config.height, "bgtree2");
        bgtree22.setOrigin(0, .5);
        let bgtree222 = this.physics.add.sprite(bgtree2.width * 2 -2, game.config.height, "bgtree2");
        bgtree222.setOrigin(0, .5);

        this.bgtree2Group.add(bgtree2);
        this.bgtree2Group.add(bgtree22);
        this.bgtree2Group.add(bgtree222);

        let clouds = this.physics.add.image(0, game.config.height, "clouds");
        //clouds.setScale(.5);
        clouds.setOrigin(0, 3);
        let clouds22 = this.physics.add.sprite(clouds.width, game.config.height, "clouds");
        clouds22.setOrigin(0, 3);
        //clouds22.setScale(.5);
        let clouds222 = this.physics.add.sprite(clouds.width * 2, game.config.height, "clouds");
        clouds222.setOrigin(0, 3);
        //clouds222.setScale(.5);

        this.bgcloud2Group.add(clouds);
        this.bgcloud2Group.add(clouds22);
        this.bgcloud2Group.add(clouds222);

        clouds.body.setImmovable();
        clouds22.body.setImmovable();
        clouds222.body.setImmovable();
        clouds.body.setVelocityX(gameOptions.cloudSpeed * -1);
        clouds22.body.setVelocityX(gameOptions.cloudSpeed * -1);
        clouds222.body.setVelocityX(gameOptions.cloudSpeed * -1);

        //bgtree2.body.setVelocityX(gameOptions.mountainSpeed * -1)
        //bgtree22.body.setVelocityX(gameOptions.mountainSpeed * -1)
    }

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

    getRightmostClound(){
        let rightmostClound = -200;
        this.bgcloud2Group.getChildren().forEach(function(clound){
            rightmostClound = Math.max(rightmostClound, clound.x);
        })
        return rightmostClound;
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

        this.dying = true;
        this.player.anims.stop();
        this.player.setFrame(21);
        this.player.body.setVelocityY(-200);
        //this.player.angle += 31;
        this.physics.world.removeCollider(this.obstacleCollider);
        //this.physics.world.removeCollider(this.platformCollider);

        this.platformGroup.getChildren().forEach(function(platform){
            platform.body.setVelocityX(0);
        }, this);

        this.bgtree2Group.getChildren().forEach(function(mountain){
            mountain.body.setVelocityX(0);
        });

        this.bgcloud2Group.getChildren().forEach(function(mountain){
            mountain.body.setVelocityX(0);
        });

        this.obstacleGroup.getChildren().forEach(function(obstacle){
            obstacle.body.setVelocityX(0);
        });

        // this.obLabelGroup.getChildren().forEach(function(label){
        //     label.body.setVelocityX(0);
        // });

        gameStatus.started = false;
        gameover.visible = true;
        gameoverBoard.visible = true;
        submitscoreBtn.visible = true;
        tryagainBtn.visible = true;
        restextLable.visible = true;
        resscoreLable.text = gameStatus.currentScore;
        resscoreLable.visible = true;
        shareSign.visible = true;
        screenMaskGraphics.visible = true;

        var txtIdx = Phaser.Math.Between(0, 13);
        gameovertextLable.text = gameOverText[txtIdx];
        gameovertextLable.visible = true;
        gameovertextbyLable.text = gameOverByText[txtIdx];
        gameovertextbyLable.visible = true;

        pausebtn.visible =false;
        mutebtn.visible = false;
        mutedbtn.visible = false;
        playbtn.visible =false;
        bt.visible =false;

        this.obstacleGroup.clear();
        // this.obLabelGroup.clear();

        //this.scene.start("PlayGame");
        //scoreLable.visible = false;
    }

    update(){

        if(gameStatus.paused) return;

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

        // this.obLabelGroup.getChildren().forEach(function(label){
        //     if(label.x < - label.displayWidth / 2){
        //         this.obLabelGroup.killAndHide(label);
        //         this.obLabelGroup.remove(label);
        //     }
        // }, this);

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
            if(tree.x < - tree.width){
                let rightmostTree = this.getRightmostTree();
                tree.x = rightmostTree + tree.width - 2550;
            }
        }, this);

        this.bgcloud2Group.getChildren().forEach(function(clound){
            if(clound.x < - clound.width){
                let rightmostClound = this.getRightmostClound();
                clound.x = rightmostClound + clound.width;
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

// function resize(){
//     let canvas = document.querySelector("canvas");
//     let windowWidth = window.innerWidth;
//     let windowHeight = window.innerHeight;
//     let windowRatio = windowWidth / windowHeight;
//     let gameRatio = game.config.width / game.config.height;

//     if(windowRatio < gameRatio){
//         canvas.style.width = windowWidth + "px";
//         canvas.style.height = (windowWidth / gameRatio) + "px";
//     }
//     else{
//         canvas.style.width = (windowHeight * gameRatio) + "px";
//         canvas.style.height = windowHeight + "px";
//     }
// }
