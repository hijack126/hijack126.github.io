(function() {
	
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
		if(gameState==GAME_READY)
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
		//if(ui_scoreIcon!=undefined)
		//{
		//	ui_scoreIcon.life=0;
		//}
		if(ui_gameLife!=undefined)
		{
			ui_gameLife.life=0;
		}
	};
	
	showGameoverUI=function()
	{
		ui_gameOver = particleSystem.createParticle(SPP.SpriteImage);
		ui_gameOver.init(gameWidth*0.5,gameHeight*0.5,Infinity,assetsManager.gameover,topContext);
		ui_gameOver.scale=0;
		TweenLite.to(ui_gameOver,0.8,{delay:2,scale:1,ease :Back.easeOut,onComplete:gameOverComplete});
	};
	
	var gameoverUIHideComplete=function()
	{
		ui_gameOver.life=0;
		hideScoreUI();
		showStartGameUI();
	};
	hideGameoverUI=function()
	{
		TweenLite.to(ui_gameOver,0.8,{scale:0,ease :Back.easeIn,onComplete:gameoverUIHideComplete});
	};

}());