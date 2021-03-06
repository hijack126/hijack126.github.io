var Boot=function(game){};
Boot.prototype={
    reload:function(){},
    create:function(){

        // if(window.innerWidth <= window.innerHeight){
        //     game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // }
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.renderer.renderSession.roundPixels = true;

        this.game.state.start("Preload");
    }
}

var Preload=function(game){
};

Preload.prototype={
    preload:function(){

        this.game.load.image('Monkey','assets/Monkey@1x.png');
        this.game.load.image('Penguin','assets/Penguin@1x.png');
        this.game.load.image('Rhino','assets/Rhino@1x.png');
        this.game.load.image('Tiger','assets/Tiger@1x.png');

        this.game.load.image("powerupHintClose", "assets/Powerup-Hint-Close@2x.png")
        this.game.load.image("powerupBackground", "assets/Powerup-Background@2x.png")
        this.game.load.image("powerupHintBackground", "assets/Powerup-Hint-Background@2x.png")
        this.game.load.image("starbg", 'assets/Star-Background@2x.png');
        this.game.load.image("star", 'assets/Star@2x.png');
        this.game.load.image("scoreBackground","assets/ScoreBackground.png")
        this.game.load.image("tile", "assets/Tile.png");
        this.game.load.image("header", "assets/Header.png");
        this.game.load.image("backpack", "assets/Powerup-9x9@2x.png");
        this.game.load.image("binoculars", "assets/Powerup-Same-Animal@2x.png");
        this.game.load.image("wagone", "assets/Powerup-Line@2x.png");
        this.game.load.image("help", "assets/Powerup-Hint@2x.png");
        this.game.load.image('bg', 'assets/Background@2x.png');
        
        this.game.load.bitmapFont('myfont', 'assets/fonts/font.png', 'assets/fonts/font.fnt');
    },
    create:function(){
        this.game.state.start("Main");
    }
}

var TileContainer = function(game, x, y, w, h){
    width = w;
    height = h;
    Phaser.Sprite.call(this, game, x, y, "");
    var tile = null;
    if(window.innerWidth <= window.innerHeight){
        tile = this.game.add.image(window.innerWidth/2, 340,'tile');
    }else{
        tile = this.game.add.image(200, 400,'tile');
    }
    tile.scale.setTo(0.6);//.setTo(window.devicePixelRatio / 3.7);
    tile.anchor.setTo(0.5);
    this.anchor.setTo(0.5);
    game.add.existing(this); 
}
TileContainer.prototype = Object.create(Phaser.Sprite.prototype);
TileContainer.prototype.constructor = TileContainer;

var Main=function(game){
};
Main.prototype={
    preload:function(){
      
    },
    create:function(){
        var me=this;
 
        me.game.add.image(0, 0,'bg');
        me.game.add.image(0, 0,'header').scale.setTo(0.66);//.scale.setTo(window.devicePixelRatio / 3.3);
        me.tween = null;
        me.popup;
        me.tileTypes=['Monkey','Penguin','Rhino','Tiger'];
        me.score = 0;
        me.maxScore = 600;
        me.maxMoves = 20;
        me.currentStage = 0;
        me.stageMoves = 10;
        me.offsety = 215;
        me.activeTile1 = null;
        me.activeTile2 = null;
        me.canMove = false;
        //me.tileWidth=66;
        //me.tileHeight=66;
        me.tiles=me.game.add.group();
        me.tileGrid=[[null,null,null,null,null,null,null],
                     [null,null,null,null,null,null,null],
                     [null,null,null,null,null,null,null],
                     [null,null,null,null,null,null,null],
                     [null,null,null,null,null,null,null],
                     [null,null,null,null,null,null,null],
                     [null,null,null,null,null,null,null]]

        var w1 = game.width;
        me.tileWidth = (Math.floor(w1/7) - 5);
        me.tileHeight =  me.tileWidth;

        if(window.innerWidth <= window.innerHeight){
            me.offsety = 215 - 60; 
        }

        me.tileContainer = new TileContainer(me.game, 20 , me.offsety, w1, w1);
        //me.tileContainer.scale.setTo(0.6);//.setTo(window.devicePixelRatio / 4.2);
        me.tileContainer.addChild(me.tiles);

        var seed=Date.now();
        me.random=new Phaser.RandomDataGenerator([seed]);

        me.initTiles();
        me.createScore();
        me.createEquipmentList(game.height - 50);
        me.createMoveCount(game.height - 60);

        me.popup = game.add.sprite(game.world.centerX, game.world.centerY, 'powerupHintBackground');

        var scoreFont="40px CaveatBrush-Regular";
        var label1 = me.game.add.text(-100,-250,"Special Equipment",{font:scoreFont,fill:"#000"});
        me.popup.addChild(me.game.add.bitmapText(-180,-350, 'myfont', 'Special Equipment', 52));
        me.popup.addChild(me.game.add.bitmapText(-200,-270, 'myfont', 'Earn these items when you execute combos.', 26));
        me.popup.addChild(me.game.add.bitmapText(-250,-230, 'myfont', 'Tap the item and anywhere on the board to use them!', 26));

        me.popup.addChild(game.add.sprite(-200, -150, 'backpack'));
        me.popup.addChild(me.game.add.bitmapText(-80,-130, 'myfont', 'This backpack will clear way\n animals in a 3x3 space', 24));
        me.popup.addChild(game.add.sprite(-200, 0, 'binoculars'));
        me.popup.addChild(me.game.add.bitmapText(-80, 20, 'myfont', 'The binoculars will clear all the\n selected animals on the borad', 24));
        me.popup.addChild(game.add.sprite(-200, 150, 'wagone'));
        me.popup.addChild(me.game.add.bitmapText(-80, 170, 'myfont', 'The wagone will clear all animals in\n a horizontal and vertical line', 24));

        me.popup.anchor.set(0.5);
        me.popup.scale.setTo(0.0);
        me.popupClose = game.add.sprite(game.world.centerX + 160, game.world.centerY - 220, 'powerupHintClose');
        me.popupClose.anchor.set(0.5);
        me.popupClose.scale.setTo(0.0);
        me.popupClose.inputEnabled = true;
        me.popupClose.events.onInputDown.add(function(){
            me.closeEquipmentHelp(); 
        }, this);
    },
    update:function(){
        var me=this;

        if(me.activeTile1&&!me.activeTile2){
            var hoverX=me.game.input.x;
            var hoverY=me.game.input.y - me.offsety;
            var hoverPosX=Math.floor(hoverX/(me.tileWidth + 3));
            var hoverPosY=Math.floor(hoverY/(me.tileHeight));
            var difX=(hoverPosX-me.startPosX);
            var difY=(hoverPosY-me.startPosY);
            if(!(hoverPosY>me.tileGrid[0].length-1||hoverPosY<0)&&!(hoverPosX>me.tileGrid.length-1||hoverPosX<0)){
                if((Math.abs(difY)==1&&difX==0)||(Math.abs(difX)==1&&difY==0)){
                    me.canMove=false;
                    me.activeTile2=me.tileGrid[hoverPosX][hoverPosY];
                    me.swapTiles();
                    me.game.time.events.add(500,function(){
                        me.checkMatch(true);
                    });
                }
            }
        }
    },
    gameOver:function(){
        this.game.state.start('GameOver');
    },
    initTiles:function(){
        var me=this;
        for(var i=0;i<me.tileGrid.length;i++){
            for(var j=0;j<me.tileGrid.length;j++){
                var tile=me.addTile(i,j);
                me.tileGrid[i][j]=tile;
            }
        }
        me.game.time.events.add(600,function(){
            me.checkMatch(false);
        });
    },
    addTile:function(x,y){
        var me=this;
        var tileToAdd=me.tileTypes[me.random.integerInRange(0,me.tileTypes.length-1)];
        var tile = me.tiles.create((x*me.tileWidth)+me.tileWidth/2, 0, tileToAdd);
        //tile.scale.setTo(window.devicePixelRatio / 3);
        me.game.add.tween(tile).to({y:y*me.tileHeight+me.tileHeight/2},500,Phaser.Easing.Linear.In,true);
        tile.anchor.setTo(0.5);
        tile.inputEnabled=true;
        tile.tileType=tileToAdd;
        tile.vPosition = {x:x, y:y};
        tile.events.onInputDown.add(me.tileDown,me);
        return tile;
    },
    tileDown:function(tile,pointer){
        var me=this;

        if(me.selectedEquiment>-1){
            me.useEquipment(tile.vPosition.x, tile.vPosition.y, tile.tileType, me.tileGrid);
        }
        else if(me.canMove){
            me.activeTile1=tile;
            me.startPosX=Math.floor((tile.x-me.tileWidth/2)/me.tileWidth);
            me.startPosY=Math.floor((tile.y-me.tileHeight/2)/me.tileHeight);
        }
    },
    tileUp:function(){
        var me=this;
        me.activeTile1=null;
        me.activeTile2=null;
    },
    swapTiles:function(){
        var me=this;
        if(me.activeTile1&&me.activeTile2){
            var tile1Pos={
                x:Math.floor( (me.activeTile1.x-me.tileWidth/2)/me.tileWidth),
                y:Math.floor((me.activeTile1.y-me.tileHeight/2)/me.tileHeight)
            };
            var tile2Pos={
                x:Math.floor((me.activeTile2.x-me.tileWidth/2)/me.tileWidth),
                y:Math.floor((me.activeTile2.y-me.tileHeight/2)/me.tileHeight)
            };
            me.tileGrid[tile1Pos.x][tile1Pos.y]=me.activeTile2;
            me.tileGrid[tile2Pos.x][tile2Pos.y]=me.activeTile1;
            me.game.add.tween(me.activeTile1).to({x:tile2Pos.x*me.tileWidth+(me.tileWidth/2),y:tile2Pos.y*me.tileHeight+(me.tileHeight/2)},200,Phaser.Easing.Linear.In,true);
            me.game.add.tween(me.activeTile2).to({x:tile1Pos.x*me.tileWidth+(me.tileWidth/2),y:tile1Pos.y*me.tileHeight+(me.tileHeight/2)},200,Phaser.Easing.Linear.In,true);
            me.activeTile1=me.tileGrid[tile1Pos.x][tile1Pos.y];
            me.activeTile2=me.tileGrid[tile2Pos.x][tile2Pos.y];
        }
    },
    checkMatch:function(isHover){
        var me=this;
        var matches=me.getMatches(me.tileGrid);
        if(matches.length>0){

            for(var a = 0; a< matches.length; a++){
               if(matches[a].length == 4)
               {
                  this.equimentAmout[0] += 1;
                  this.backpackLabel.text = this.equimentAmout[0];
               }else if(matches[a].length == 5){
                  this.equimentAmout[1] += 1;
                  this.binocularsLabel.text =  this.equimentAmout[1];
               }else if(matches[a].length == 6){
                  this.equimentAmout[2] += 1;
                  this.wagonehudLabel.text =  this.equimentAmout[2];
               }
            }

            me.removeTileGroup(matches);
            //me.resetTile();
            //me.fillTile();
            me.game.time.events.add(500,function(){
                me.tileUp();
            });
            me.game.time.events.add(600,function(){
                me.checkMatch(false);
            });

            if(isHover) me.updateMoveCount(-1);
        }
        else{
            me.swapTiles();
            me.game.time.events.add(500,function(){me.tileUp();me.canMove=true;});}
    },
    getMatches:function(tileGrid){
        var matches=[];
        var groups=[];
        for(var i=0;i<tileGrid.length;i++){
            var tempArr=tileGrid[i];
            groups=[];
            for(var j=0;j<tempArr.length;j++){
                if(j<tempArr.length-2)
                if(tileGrid[i][j]&&tileGrid[i][j+1]&&tileGrid[i][j+2]){
                    if(tileGrid[i][j].tileType==tileGrid[i][j+1].tileType&&tileGrid[i][j+1].tileType==tileGrid[i][j+2].tileType){
                        if(groups.length>0){
                            if(groups.indexOf(tileGrid[i][j])==-1){
                                matches.push(groups);groups=[];
                            }
                        }
                        if(groups.indexOf(tileGrid[i][j])==-1){
                            groups.push(tileGrid[i][j]);
                        }
                        if(groups.indexOf(tileGrid[i][j+1])==-1){
                            groups.push(tileGrid[i][j+1]);
                        }
                        if(groups.indexOf(tileGrid[i][j+2])==-1){
                            groups.push(tileGrid[i][j+2]);
                        }
                    }
                }
            }
            if(groups.length>0)matches.push(groups);
        }
        for(j=0;j<tileGrid.length;j++){
            var tempArr=tileGrid[j];
            groups=[];
            for(i=0;i<tempArr.length;i++){
                if(i<tempArr.length-2)
                if(tileGrid[i][j]&&tileGrid[i+1][j]&&tileGrid[i+2][j]){
                    if(tileGrid[i][j].tileType==tileGrid[i+1][j].tileType&&tileGrid[i+1][j].tileType==tileGrid[i+2][j].tileType){
                        if(groups.length>0){
                            if(groups.indexOf(tileGrid[i][j])==-1){
                                matches.push(groups);groups=[];
                            }
                        }
                        if(groups.indexOf(tileGrid[i][j])==-1){
                            groups.push(tileGrid[i][j]);
                        }
                        if(groups.indexOf(tileGrid[i+1][j])==-1){
                            groups.push(tileGrid[i+1][j]);
                        }
                        if(groups.indexOf(tileGrid[i+2][j])==-1){
                            groups.push(tileGrid[i+2][j]);
                        }
                    }
                }
            }
            if(groups.length>0)matches.push(groups);
        }
        return matches;
    },
    removeTileGroup:function(matches){
        var me=this;
        for(var i=0;i<matches.length;i++){
            var tempArr=matches[i];
            for(var j=0;j<tempArr.length;j++){
                var tiletoRemove = tempArr[j];
                var tilePos = this.getTilePos(this.tileGrid, tiletoRemove);

                var s = game.add.tween(tiletoRemove.scale);
                s.to({x: 0, y:0}, 500, Phaser.Easing.Linear.None);
                //s.onComplete.add(function(){}, this);
                // setTimeout(() => {
    
                //     me.tiles.remove(tiletoRemove);
                //     me.incrementScore();
                //     if(tilePos.x!=-1&&tilePos.y!=-1){
                //         me.tileGrid[tilePos.x][tilePos.y]=null;
                //     }
                // }, 500);
                s.start();               
            }
        }

        // timeSinceLastIncrement =  game.time.now + 500;
        // while(timeSinceLastIncrement > game.time.now){}
     
        setTimeout(() => {
            for(var i=0;i<matches.length;i++){
                var tempArr=matches[i];
                for(var j=0;j<tempArr.length;j++){
                    var tiletoRemove = tempArr[j];
                    var tilePos = me.getTilePos(me.tileGrid, tiletoRemove);
        
                    me.tiles.remove(tiletoRemove);
                    me.incrementScore();
                    if(tilePos.x!=-1&&tilePos.y!=-1){
                        me.tileGrid[tilePos.x][tilePos.y]=null;
                    }
                }
            } 
    
            me.resetTile();
            me.fillTile();
        }, 500);
    },
    getTilePos:function(tileGrid,tile){
        var pos={x:-1,y:-1};for(var i=0;i<tileGrid.length;i++){
            for(var j=0;j<tileGrid[i].length;j++){
                if(tile==tileGrid[i][j]){
                    pos.x=i;
                    pos.y=j;
                    break;
                }
            }
        }
        return pos;
    },
    resetTile:function(){
        var me=this;
        for(var i=0;i<me.tileGrid.length;i++){
            for(var j=me.tileGrid[i].length-1;j>0;j--){
                if(me.tileGrid[i][j]==null&&me.tileGrid[i][j-1]!=null){
                    var tempTile=me.tileGrid[i][j-1];
                    me.tileGrid[i][j]=tempTile;
                    me.tileGrid[i][j-1]=null;
                    tempTile.vPosition.y = j;
                    me.game.add.tween(tempTile).to({y:(me.tileHeight*j)+(me.tileHeight/2)},200,Phaser.Easing.Linear.In,true);
                    j=me.tileGrid[i].length;
                }
            }
        }
    },
    fillTile:function(){
        var me=this;
        for(var i=0;i<me.tileGrid.length;i++){
            for(var j=0;j<me.tileGrid.length;j++){
                if(me.tileGrid[i][j]==null){
                    var tile=me.addTile(i,j);
                    me.tileGrid[i][j]=tile;
                }
            }
        }
    },
    createScore:function(){
        var me=this;
        if(window.innerWidth <= window.innerHeight){
            me.game.add.image(10, 110,'scoreBackground').scale.setTo(0.5);
            me.scoreLabel=me.game.add.bitmapText(75,120, 'myfont', '0', 25);
        }else{
            me.game.add.image(10, 140,'scoreBackground').scale.setTo(0.5);
            me.scoreLabel=me.game.add.bitmapText(75,150, 'myfont', '0', 25);
        }
      
        var scoreFont="20px CaveatBrush-Regular";
        me.scoreLabel.anchor.setTo(0.5,0);
        me.scoreLabel.align='center';

        var defaultConfig= {
            width: 160,
            height: 20,
            x: game.width - 100,
            y: 160,
            bg: {
              color: '#651828'
            },
            bar: {
              color: '#FEFF03'
            },
            animationDuration: 200,
            flipped: false
          };

        me.myScoreBar = new ScoreBar(this.game, defaultConfig);
        me.myScoreBar.setPercent(0); 
    },
    incrementScore:function(){
        var me=this;
        me.score+=10;
        me.scoreLabel.text=me.score;
        me.myScoreBar.setPercent(me.score/me.maxScore * 100);

        if(me.score >= me.maxScore){

        }
    },
    createMoveCount:function(y){
        this.game.add.bitmapText(15,y-20, 'myfont', 'Moves Left:', 20);
        this.moveLabel = this.game.add.bitmapText(50,y+10, 'myfont', '0', 35);
        this.moveLabel.anchor.setTo(0.5,0);
        this.moveLabel.align='center';

        this.moveLabel.text = this.stageMoves;
    },
    updateMoveCount:function(move){
        this.stageMoves += move;
        this.moveLabel.text = this.stageMoves;
        if(this.stageMoves < 1){
            this.gameOver();
        }
    },
    createEquipmentList:function(y){

        this.eqbg = game.add.image(100, y-40, 'powerupHintBackground').scale.setTo(0.5, 0.1);

        this.equipmentType = ['backpack','binoculars','wagon'];
        this.equimentAmout = [1,1,1];
        this.selectedEquiment = -1;

        var badgeFont="10px Arial";
        
        var badgeY = y - 40;

        this.backpackhud = game.add.sprite(150, y, 'backpack');
        this.backpackhud.anchor.set(0.5);
        this.backpackhud.scale.setTo(0.6);
        this.backpackhud.inputEnabled = true;

        //var backpackhudBadge = game.add.graphics(0, 0);
        //backpackhudBadge.beginFill(0xFF0000, 1);
        //backpackhudBadge.drawCircle(180, badgeY, 20);
        game.add.image(160, badgeY, 'powerupBackground').scale.setTo(0.7);
        this.backpackLabel=this.game.add.text(170,badgeY+12,"0",{font:badgeFont,fill:"#fff"});
        this.backpackLabel.anchor.setTo(0.5);
        this.backpackLabel.align='center';
        this.backpackLabel.text = this.equimentAmout[0];

        this.binocularshud =  game.add.sprite(230, y, 'binoculars');
        this.binocularshud.anchor.set(0.5);
        this.binocularshud.scale.setTo(0.6);
        this.binocularshud.inputEnabled = true;
        // var binocularshudBadge = game.add.graphics(0, 0);
        // binocularshudBadge.beginFill(0xFF0000, 1);
        // binocularshudBadge.drawCircle(260, badgeY, 20);
        game.add.image(250, badgeY, 'powerupBackground').scale.setTo(0.7);
        this.binocularsLabel=this.game.add.text(260,badgeY+12,"0",{font:badgeFont,fill:"#fff"});
        this.binocularsLabel.anchor.setTo(0.5);
        this.binocularsLabel.align='center';
        this.binocularsLabel.text = this.equimentAmout[1];

        this.wagonehud =  game.add.sprite(310, y, 'wagone');
        this.wagonehud.anchor.set(0.5);
        this.wagonehud.scale.setTo(0.6);
        this.wagonehud.inputEnabled = true;
        // var wagonehudBadge = game.add.graphics(0, 0);
        // wagonehudBadge.beginFill(0xFF0000, 1);
        // wagonehudBadge.drawCircle(340, badgeY, 20);
        game.add.image(330, badgeY, 'powerupBackground').scale.setTo(0.7);
        this. wagonehudLabel=this.game.add.text(340,badgeY+12,"0",{font:badgeFont,fill:"#fff"});
        this.wagonehudLabel.anchor.setTo(0.5);
        this.wagonehudLabel.align='center';
        this.wagonehudLabel.text = this.equimentAmout[2];

        this.help =  game.add.sprite(380, y-35, 'help');
        this.help.anchor.set(0.5);
        this.help.scale.setTo(0.5);
        this.help.inputEnabled = true;
        this.help.events.onInputDown.add(function(){
            this.showEquipmentHelp(); 
        }, this);

        this.backpackhud.events.onInputOver.add(this.chooseBackpack, this);
        this.binocularshud.events.onInputOver.add(this.chooseBinoculars, this);
        this.wagonehud.events.onInputOver.add(this.chooseWagone, this);
    },
    chooseBackpack:function(){
        this.selectedEquiment = 0;

        if(this.selectedEquiment < 0 ||
            this.equimentAmout[this.selectedEquiment] < 1){
                this.selectedEquiment = -1;
                return;
        }
    },
    chooseBinoculars:function(){
        this.selectedEquiment = 1;
        if(this.selectedEquiment < 0 ||
            this.equimentAmout[this.selectedEquiment] < 1){
                this.selectedEquiment = -1;
                return;
        }
    },
    chooseWagone:function(){
        this.selectedEquiment = 2;
        if(this.selectedEquiment < 0 ||
            this.equimentAmout[this.selectedEquiment] < 1){
                this.selectedEquiment = -1;
                return;
        }
    },
    useEquipment:function(row, col, tileType, tileGrid){

        if(this.selectedEquiment < 0 ||
        this.equimentAmout[this.selectedEquiment] < 1) return;

        switch(this.selectedEquiment)
        {
            case 0:
               this.useBackpack(row, col, tileGrid);
               break;
            case 1:
               this.useBinoculars(tileType, tileGrid);
               break;
            case 2:
                this.useWagone(row, col, tileGrid);
                break;
            default:
                break;
        }

        this.equimentAmout[this.selectedEquiment]--;
        this.selectedEquiment = -1;

        this.backpackLabel.text = this.equimentAmout[0];
        this.binocularsLabel.text = this.equimentAmout[1];
        this.wagonehudLabel.text = this.equimentAmout[2];
    },
    useBackpack:function(row, col, tileGrid){
        var matches=[];
        var groups=[];

        if(tileGrid[row-1][col -1]){
            groups.push(tileGrid[row-1][col -1]);
         }
         if(tileGrid[row-1][col]){
            groups.push(tileGrid[row-1][col]);
         }
         if(tileGrid[row][col-1]){
            groups.push(tileGrid[row][col -1]);
         }
         if(tileGrid[row][col]){
            groups.push(tileGrid[row][col]);
         }
         if(tileGrid[row+1][col]){
            groups.push(tileGrid[row+1][col]);
         }
         if(tileGrid[row+1][col-1]){
            groups.push(tileGrid[row+1][col -1]);
         }
         if(tileGrid[row-1][col+1]){
            groups.push(tileGrid[row-1][col+1]);
         }
         if(tileGrid[row][col+1]){
            groups.push(tileGrid[row][col+1]);
         }
         if(tileGrid[row+1][col+1]){
            groups.push(tileGrid[row+1][col+1]);
         }

         matches.push(groups);
         
         this.removeTileGroup(matches);
         //this.resetAllTiles();
    },
    useBinoculars:function(tileType, tileGrid){
        var matches=[];
        var groups=[];
        for(var i=0;i<tileGrid.length;i++){
            var tempArr=tileGrid[i];
            groups=[];
            for(var j=0;j<tempArr.length;j++){
                if(tileGrid[i][j].tileType == tileType){
                    groups.push(tileGrid[i][j]);
                }
            }
            matches.push(groups);
        }
        this.removeTileGroup(matches);
        //this.resetAllTiles();
    },
    useWagone:function(row, col, tileGrid){
        var matches=[];
        var groups=[];
        for(var i=0;i<tileGrid.length;i++){
            var tempArr=tileGrid[i];
            groups=[];
            for(var j=0;j<tempArr.length;j++){
                if(i== row || j==col){
                    groups.push(tileGrid[i][j]);
                }
            }
            matches.push(groups);
        }

        this.removeTileGroup(matches);
        //this.resetAllTiles();
    },
    resetAllTiles:function(){
        var me=this;
        this.resetTile();
        this.fillTile();
        this.game.time.events.add(500,function(){
            me.tileUp();
        });
        this.game.time.events.add(600,function(){
            me.checkMatch(false);
        });
    },
    showEquipmentHelp:function(){

        if ((this.tween !== null && this.tween.isRunning) || this.popup.scale.x === 1)
        {
            return;
        }
        
        this.tween = game.add.tween(this.popup.scale).to( { x: 0.6, y: 0.6 }, 1000, Phaser.Easing.Elastic.Out, true);
        game.add.tween(this.popupClose.scale).to( { x: 0.5, y: 0.5 }, 1000, Phaser.Easing.Elastic.Out, true);
    },
    closeEquipmentHelp:function(){
        if (this.tween && this.tween.isRunning || this.popup.scale.x === 0.1)
        {
            return;
        }
    
        //  Create a tween that will close the window, but only if it's not already tweening or closed
        this.tween = game.add.tween(this.popup.scale).to( { x: 0, y: 0 }, 500, Phaser.Easing.Elastic.In, true);
        this.tween = game.add.tween(this.popupClose.scale).to( { x: 0, y: 0 }, 500, Phaser.Easing.Elastic.In, true);
        this.tween = null;
    },
    gameOver:function(){
        this.game.state.start("Preload");
    },
    congraduation:function(){
        this.game.state.start("Preload");
    },
    onResize:function(){
        this.tileContainer.width = game.width/2;
        this.tileContainer.height = this.tileContainer.width;
        this.tileWidth=this.tileContainer.width/6;
        this.tileHeight=this.tileContainer.width/6;
    },
};

var ScoreBar = function(game, providedConfig) {
    this.game = game;
   
    this.setupConfiguration(providedConfig);
    if(window.innerWidth <= window.innerHeight){
        this.setPosition(this.config.x, this.config.y - 30);
    }else{
        this.setPosition(this.config.x, this.config.y);
    }
  
    this.drawBackground();
    this.drawScoreBar();
};
ScoreBar.prototype.constructor = ScoreBar;

ScoreBar.prototype.setupConfiguration = function (providedConfig) {
    this.config = this.mergeWithDefaultConfiguration(providedConfig);
};

ScoreBar.prototype.drawBackground = function() {
   
    this.game.add.image(this.x - 95, this.y-25,'starbg').scale.setTo(0.7);
    this.game.add.image(this.x - 30, this.y-50,'star').scale.setTo(0.7);
    this.game.add.image(this.x, this.y-50,'star').scale.setTo(0.7); 
    this.game.add.image(this.x + 60, this.y-50,'star').scale.setTo(0.7);
 
    var bmd = this.game.add.bitmapData(this.config.width, this.config.height);
    bmd.ctx.fillStyle = this.config.bg.color;
    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, this.config.width, this.config.height);
    bmd.ctx.fill();
   
    this.bgSprite = this.game.add.sprite(this.x, this.y, bmd);
    this.bgSprite.anchor.set(0.5);
};

ScoreBar.prototype.drawScoreBar = function() {

    var bmd = this.game.add.bitmapData(this.config.width, this.config.height);
    bmd.ctx.fillStyle = this.config.bar.color;
    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, this.config.width, this.config.height);
    bmd.ctx.fill();
   
    this.barSprite = this.game.add.sprite(this.x - this.bgSprite.width/2, this.y, bmd);
    this.barSprite.anchor.y = 0.5;
};

ScoreBar.prototype.setPosition = function (x, y) {
    this.x = x;
    this.y = y;
   
    if(this.bgSprite !== undefined && this.barSprite !== undefined){
      this.bgSprite.position.x = x;
      this.bgSprite.position.y = y;
   
      this.barSprite.position.x = x - this.config.width/2;
      this.barSprite.position.y = y;
    }
};

ScoreBar.prototype.mergeWithDefaultConfiguration = function(newConfig) {
    var defaultConfig= {
      width: 250,
      height: 40,
      x: 0,
      y: 0,
      bg: {
        color: '#651828'
      },
      bar: {
        color: '#FEFF03'
      }
    };
   
    return mergeObjetcs(defaultConfig, newConfig);
};
   
function mergeObjetcs(targetObj, newObj) {
    for (var p in newObj) {
      try {
        targetObj[p] = newObj[p].constructor==Object ? mergeObjetcs(targetObj[p], newObj[p]) : newObj[p];
      } catch(e) {
        targetObj[p] = newObj[p];
      }
    }
    return targetObj;
}

ScoreBar.prototype.setPercent = function(newValue){
    if(newValue < 0) newValue = 0;   if(newValue > 100) newValue = 100;
    var newWidth =  (newValue * this.config.width) / 100;
    this.setWidth(newWidth);
};
   
ScoreBar.prototype.setWidth = function(newWidth){
   this.game.add.tween(this.barSprite).to( { width: newWidth }, this.config.animationDuration, Phaser.Easing.Linear.None, true);    
};
