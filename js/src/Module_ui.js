(function() {

	var ui_congrats = null;
	
	var ui_newGameUpdate=function()
	{
		this.rotation+=0.01;
	};
	
	showStartGameUI=function()
	{
		 gameState=GAME_READY;
		
		 ui_gameTitle = particleSystem.createParticle(SPP.SpriteImage);
		 ui_gameTitle.regX= ui_gameTitle.regY=0;
		 ui_gameTitle.init(0,-assetsManager.gametitle.heigh*2,Infinity,assetsManager.gametitle,topContext);
		 ui_gameTitle.scale = 2;
		 TweenLite.to(ui_gameTitle.position,0.5,{y:gameHeight*0.2});
		 
/*		ui_newGame = particleSystem.createParticle(SPP.SpriteImage);
		ui_newGame.init(gameWidth*0.618,gameHeight*0.618,Infinity,assetsManager.newgame,topContext);
		ui_newGame.scale=5;
		ui_newGame.alpha=0;
		ui_newGame.onUpdate=ui_newGameUpdate;
		TweenLite.to(ui_newGame,0.8,{scale:1,alpha:1,ease :Back.easeOut});

 		ui_startFruit = fruitSystem.createParticle(FruitGame.Fruit);
		ui_startFruit.addEventListener("dead",startGame);
		var textureObj=assetsManager.getRandomFruit();
		ui_startFruit.init(gameWidth*0.618,gameHeight*0.618,Infinity,textureObj.w,assetsManager.shadow,topContext);
		ui_startFruit.rotationStep=-0.02;
		ui_startFruit.alpha=0;
		ui_startFruit.textureObj=textureObj;
		TweenLite.to(ui_startFruit,1,{scale:1.8,alpha:1,ease :Back.easeOut}); */

		startbutton.style.display = "block";
	};
	
    hideStartGameUI=function()
	{
		startbutton.style.display = "none";
		//ui_startFruit.removeEventListener("dead",startGame);
		TweenLite.to(ui_gameTitle.position,0.5,{y:-assetsManager.gametitle.height*2});
		/*TweenLite.to(ui_newGame,0.8,{scale:8,alpha:0,onComplete:function()
		{
			ui_gameTitle.life=0;
		    ui_newGame.life=0;
	    }});*/
	};

	showScoreTextUI=function()
	{
		if(gameState==GAME_READY || gameState==GAME_OVER)
		{
			return;
		}
		bottomContext.font="46px Helvetica Neue Bold";
		bottomContext.fillText("Scores:"+score,20,20);
		bottomContext.font="42px Helvetica Neue Bold";
		bottomContext.fillText("Best:"+storage.highScore,20,80);
	};

	showScoreUI=function()
	{
		//ui_scoreIcon = particleSystem.createParticle(SPP.SpriteImage);
		//ui_scoreIcon.regX=ui_scoreIcon.regY=0;
		//ui_scoreIcon.init(10,50,Infinity,assetsManager.score,bottomContext);
		//ui_scoreIcon.scale = 3;

		ui_gameLife = particleSystem.createParticle(SPP.SpriteImage);
		ui_gameLife.regX=1;
		ui_gameLife.regY=0;
		ui_gameLife.init(gameWidth,8,Infinity,ui_gamelifeTexture,bottomContext);
		ui_gameLife.scale = 3;
	};

    hideScoreUI=function()
	{
		email.style.display = "none";
		eligible.style.display = "none";
		price.style.display = "none";
		enter.style.display = "none";
		submitButton.style.display = "none";
		replayButton.style.display = "none";
		scorelabel.style.display = "none";
		scorenum.style.display = "none";
		collectPriceButton.style.display = "none";
		replayButton.style.display = "none";

		TweenLite.to(ui_gameOver,0.8,{scale:0,ease :Back.easeIn,onComplete:null});
		TweenLite.to(ui_gameOverScore,0.8,{scale:0,ease :Back.easeIn,onComplete:null});
		if(ui_congrats) TweenLite.to(ui_congrats,0.8,{scale:0,ease :Back.easeIn,onComplete:null});

		if(ui_gameLife!=undefined)
		{
			ui_gameLife.life=0;
		}
	};

	hideGameOverScoreUI = function(){
		TweenLite.to(ui_gameOver,0.8,{scale:0,ease :Back.easeIn,onComplete:gameoverScoreUIHideComplete});
		TweenLite.to(ui_gameOverScore,0.8,{scale:0,ease :Back.easeIn,onComplete:null});
	}

	gameoverScoreUIHideComplete= function(){
		scorelabel.style.display = "none";
		scorenum.style.display = "none";
		collectPriceButton.style.display = "none";
		replayButton.style.display = "none";
	}

	collectionPriceUIHideComplete = function(){
		email.style.display = "none";
		eligible.style.display = "none";
		price.style.display = "none";
		enter.style.display = "none";
		submitButton.style.display = "none";
		replayButton.style.display = "none";
	}

	showGameOverScoreUI=function(){
		
		ui_gameLife.life=0;
		
		ui_gameOver = particleSystem.createParticle(SPP.SpriteImage);
		ui_gameOver.init(gameWidth*0.5,gameHeight*0.5 - 400,Infinity,assetsManager.gameover,topContext);
		ui_gameOver.scale=0;
		TweenLite.to(ui_gameOver,0.8,{delay:2,scale:1,ease :Back.easeOut,onComplete:null});

	    ui_gameOverScore = particleSystem.createParticle(SPP.SpriteImage);
		ui_gameOverScore.init(gameWidth*0.5, gameHeight*0.5 -100, Infinity,assetsManager.gamescorebg,topContext);
		ui_gameOverScore.scale = 0;
		TweenLite.to(ui_gameOverScore,0.8,{delay:2,scale:2,ease :Back.easeOut,onComplete:showGameOverScoreDetailUI});
	};

	showGameOverScoreDetailUI=function(){
		scorelabel.style.display = "block";
		scorenum.style.display = "block";
		collectPriceButton.style.display = "block";
		replayButton.style.display = "block";

		scorenum.innerHTML = score;
	};

	showCollectionPriceUI = function(){
		ui_congrats = particleSystem.createParticle(SPP.SpriteImage);
		ui_congrats.init(gameWidth*0.5,gameHeight*0.5 - 600,Infinity,assetsManager.congrats,topContext);
		ui_congrats.scale=0;
		TweenLite.to(ui_congrats,0.8,{delay:2,scale:2,ease :Back.easeOut,onComplete:showCollectionPriceDetailUI});
	};

	showCollectionPriceDetailUI=function(){
		email.style.display = "block";
		eligible.style.display = "block";
		price.style.display = "block";
		enter.style.display = "block";
		submitButton.style.display = "block";
		replayButton.style.display = "block";
	}

	showGameoverUI=function()
	{
		ui_gameOver = particleSystem.createParticle(SPP.SpriteImage);
		ui_gameOver.init(gameWidth*0.5,gameHeight*0.5,Infinity,assetsManager.gameover,topContext);
		ui_gameOver.scale=0;
		TweenLite.to(ui_gameOver,0.8,{delay:2,scale:1,ease :Back.easeOut,onComplete:gameOverComplete});
	};
	
	var gameoverUIHideComplete=function()
	{
		hideScoreUI();
		showStartGameUI();
	};
	hideGameoverUI=function()
	{
		TweenLite.to(ui_gameOver,0.8,{scale:0,ease :Back.easeIn,onComplete:gameoverUIHideComplete});
	};

}());