let game;

// global game options
let gameOptions = {

    // platform speed range, in pixels per second
    platformSpeedRange: [300, 300],

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
    playerGravity: 900,

    // player jump force
    jumpForce: 400,

    // player starting X position
    playerStartPosition: 200,

    // consecutive jumps allowed
    jumps: 2,

    // % of probability a coin appears on the platform
    coinPercent: 25,

    // % of probability a fire appears on the platform
    firePercent: 25
}

window.onload = function() {

    // object containing configuration options
    let gameConfig = {
        type: Phaser.AUTO,
        width: 1334,
        height: 750,
        scene: [preloadGame, playGame],
        backgroundColor: 0x0c88c7,

        // physics settings
        physics: {
            default: "arcade"
        }
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
    resize();
    window.addEventListener("resize", resize, false);
}

// preloadGame scene
class preloadGame extends Phaser.Scene{
    constructor(){
        super("PreloadGame");
    }
    preload(){
        this.load.image("platform", "platform.png");

        this.load.spritesheet('button', 'button_sprite_sheet.png', {
            frameWidth: 193,
            frameHeight: 71
        });

        this.load.image('help', 'helpIcon.png');

        // player is a sprite sheet made by 24x48 pixels
        this.load.spritesheet("player", "player.png", {
            frameWidth: 24,
            frameHeight: 48
        });

        this.load.spritesheet("obstacle", "obstacle-short-3.png", {
            frameWidth: 28,
            frameHeight: 35
        });

        // mountains are a sprite sheet made by 512x512 pixels
        this.load.spritesheet("mountain", "mountain.png", {
            frameWidth: 512,
            frameHeight: 512
        });
    }
    create(){
        // setting player animation
        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("player", {
                start: 0,
                end: 1
            }),
            frameRate: 8,
            repeat: -1
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

// playGame scene
class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
    }

    create(){

        var bt = this.add.image(300, 80, 'help').setInteractive();
        bt.setScale(.2);
        bt.on('pointerup', function () {
            //this.events.preventDefault();
            this.scene.pause();
            console.log("sssssssssss");
        }, this);

        // group with all active mountains.
        this.mountainGroup = this.add.group();

        // group with all active platforms.
        this.platformGroup = this.add.group({

            // once a platform is removed, it's added to the pool
            removeCallback: function(platform){
                platform.scene.platformPool.add(platform)
            }
        });

        // platform pool
        this.platformPool = this.add.group({

            // once a platform is removed from the pool, it's added to the active platforms group
            removeCallback: function(platform){
                platform.scene.platformGroup.add(platform)
            }
        });

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
        this.addPlatform(game.config.width * 2, game.config.width / 2, game.config.height * gameOptions.platformVerticalLimit[1]);

        //var button = this.game.add.sprite();

        // adding the player;
        this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height * 0.7, "player");
        this.player.setGravityY(gameOptions.playerGravity);
        this.player.setDepth(2);

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
        this.physics.add.overlap(this.player, this.obstacleGroup, function(player, fire){

            this.dying = true;
            this.player.anims.stop();
            this.player.setFrame(2);
            this.player.body.setVelocityY(-200);
            this.physics.world.removeCollider(this.platformCollider);

        }, null, this);

        // checking for input
        this.input.on("pointerdown", this.jump, this);
    }

    // adding mountains
    addMountains(){
        let rightmostMountain = this.getRightmostMountain();
        if(rightmostMountain < game.config.width * 2){
            let mountain = this.physics.add.sprite(rightmostMountain + Phaser.Math.Between(100, 350), game.config.height + Phaser.Math.Between(0, 100), "mountain");
            mountain.setOrigin(0.5, 1);
            mountain.body.setVelocityX(gameOptions.mountainSpeed * -1)
            this.mountainGroup.add(mountain);
            if(Phaser.Math.Between(0, 1)){
                mountain.setDepth(1);
            }
            mountain.setFrame(Phaser.Math.Between(0, 3))
            this.addMountains()
        }
    }

    // getting rightmost mountain x position
    getRightmostMountain(){
        let rightmostMountain = -200;
        this.mountainGroup.getChildren().forEach(function(mountain){
            rightmostMountain = Math.max(rightmostMountain, mountain.x);
        })
        return rightmostMountain;
    }

    // the core of the script: platform are added from the pool or created on the fly
    addPlatform(platformWidth, posX, posY){
        this.addedPlatforms ++;
        let platform;
      
        platform = this.add.tileSprite(posX, posY, platformWidth, 32, "platform");
        this.physics.add.existing(platform);
        platform.body.setImmovable(true);
        platform.body.setVelocityX(Phaser.Math.Between(gameOptions.platformSpeedRange[0], gameOptions.platformSpeedRange[1]) * -1);
        platform.setDepth(2);
        this.platformGroup.add(platform);

        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);

        // if this is not the starting platform...
        // if(this.addedPlatforms > 1){
        //     // is there a coin over the platform?
        //     if(Phaser.Math.Between(1, 100) <= gameOptions.coinPercent){
        //         if(this.coinPool.getLength()){
        //             let coin = this.coinPool.getFirst();
        //             coin.x = posX;
        //             coin.y = posY - 96;
        //             coin.alpha = 1;
        //             coin.active = true;
        //             coin.visible = true;
        //             this.coinPool.remove(coin);
        //         }
        //         else{
        //             let coin = this.physics.add.sprite(posX, posY - 96, "coin");
        //             coin.setImmovable(true);
        //             coin.setVelocityX(platform.body.velocity.x);
        //             coin.anims.play("rotate");
        //             coin.setDepth(2);
        //             this.coinGroup.add(coin);
        //         }
        //     }

        //     // is there a fire over the platform?
        //     if(Phaser.Math.Between(1, 100) <= gameOptions.firePercent){
        //         if(this.firePool.getLength()){
        //             let fire = this.firePool.getFirst();
        //             fire.x = posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth);
        //             fire.y = posY - 46;
        //             fire.alpha = 1;
        //             fire.active = true;
        //             fire.visible = true;
        //             this.firePool.remove(fire);
        //         }
        //         else{
        //             let fire = this.physics.add.sprite(posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth), posY - 46, "fire");
        //             fire.setImmovable(true);
        //             fire.setVelocityX(platform.body.velocity.x);
        //             fire.setSize(8, 2, true)
        //             fire.anims.play("burn");
        //             fire.setDepth(2);
        //             this.fireGroup.add(fire);
        //         }
        //     }
        // }
    }

    // the player jumps when on the ground, or once in the air as long as there are jumps left and the first jump was on the ground
    // and obviously if the player is not dying
    jump(){
        if((!this.dying) && (this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps))){
            if(this.player.body.touching.down){
                this.playerJumps = 0;
            }
            this.player.setVelocityY(gameOptions.jumpForce * -1);
            this.playerJumps ++;

            // stops animation
            this.player.anims.stop();
        }
    }

    update(){
        // game over
        if(this.player.y > game.config.height){
            this.scene.start("PlayGame");
        }

        this.player.x = gameOptions.playerStartPosition;

        // recycling platforms
        let minDistance = game.config.width;
        let rightmostPlatformHeight = 0;

        this.platformGroup.getChildren().forEach(function(platform){
            if(platform.x < -10){
                platform.x = game.config.width;
            }
        }, this);

        this.obstacleGroup.getChildren().forEach(function(obstacle){
            if(obstacle.x < - obstacle.displayWidth / 2){
                this.obstacleGroup.killAndHide(obstacle);
                this.obstacleGroup.remove(obstacle);
            }
        }, this);

        // recycling mountains
        this.mountainGroup.getChildren().forEach(function(mountain){
            if(mountain.x < - mountain.displayWidth){
                let rightmostMountain = this.getRightmostMountain();
                mountain.x = rightmostMountain + Phaser.Math.Between(100, 350);
                mountain.y = game.config.height + Phaser.Math.Between(0, 100);
                mountain.setFrame(Phaser.Math.Between(0, 3))
                if(Phaser.Math.Between(0, 1)){
                    mountain.setDepth(1);
                }
            }
        }, this);

        //adding obstcles
        if(Phaser.Math.Between(1, 2000) <= gameOptions.firePercent){
            if(this.obstaclePool.getLength()){
                let obstacle = this.obstaclePool.getFirst();
                obstacle.x = game.config.width + Phaser.Math.Between(1, 3);
                obstacle.y = game.config.height - 182;
                obstacle.alpha = 1;
                obstacle.active = true;
                obstacle.visible = true;
                this.obstaclePool.remove(obstacle);
            }
            else{
                let obstacle = this.physics.add.sprite(game.config.width + Phaser.Math.Between(1, 3), game.config.height - 182, "obstacle");
                obstacle.setImmovable(true);
                obstacle.setVelocityX(Phaser.Math.Between(gameOptions.platformSpeedRange[0], gameOptions.platformSpeedRange[1]) * -1);

                ///obstacle.setVelocityX(platform.body.velocity.x);
                obstacle.setSize(8, 2, true)
                //obstacle.anims.play("burn");
                obstacle.setDepth(2);
                this.obstacleGroup.add(obstacle);
            }
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
