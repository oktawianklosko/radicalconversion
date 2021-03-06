const menuState = {
  preload: function () {
    game.load.image('menu', 'assets/menu.png');
    game.load.audio('music', 'assets/music.wav');
  },
  create: function () {
    game.add.image(0, 0, 'menu');
      game.input.onDown.add(() => { game.state.start('main'); });

    }

  };





const mainState = {

  create: function () {

    music = game.add.audio("music");
    music.play('',0,1,true);

    this.powerlevel = 1;

    game.add.image(0, 0, 'background');

    this.ship = game.add.sprite(400, 550, 'ship');
    game.physics.enable(this.ship, Phaser.Physics.ARCADE);

    this.aliens = game.add.group();
    this.aliens.enableBody = true;
    this.aliens.physicsBodyType = Phaser.Physics.ARCADE;

    this.powerup = game.add.sprite(game.world.randomX, this.ship.position.y, 'powerup');
    game.physics.enable(this.powerup, Phaser.Physics.ARCADE);




    for (let i = 0; i < 40; i++) {
      let c = this.aliens.create(100 + (i % 8) * 80, 80 + Math.floor(i / 8) * 60, 'enemy');
      c.body.immovable = true;
    }

    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

    this.bullets2 = game.add.group();
    this.bullets2.enableBody = true;
    this.bullets2.physicsBodyType = Phaser.Physics.ARCADE;

    for (let i = 0; i < 20; i++) {
      let b = this.bullets.create(0, 0, 'bullet');
      b.exists = false;
      b.visible = false;
      b.checkWorldBounds = true;
      b.events.onOutOfBounds.add((bullet) => { bullet.kill(); });
    }

    //Create second bullet group
    for (let i = 0; i < 20; i++) {
      let b = this.bullets2.create(0, 0, 'bullet2');
      b.exists = false;
      b.visible = false;
      b.checkWorldBounds = true;
      b.events.onOutOfBounds.add((bullet2) => { bullet2.kill(); });
    }

    this.bulletTime = 0;

    this.highScore = localStorage.getItem('invadershighscore');
    if (this.highScore === null) {
      localStorage.setItem('invadershighscore', 0);
      this.highScore = 0;
    }

    this.score = 0;
    this.scoreDisplay = game.add.text(200, 20, `Score: ${this.score} \nHighScore: ${this.highScore}`, { font: '20px AR DESTINE', fill: '#ffffff' });

    this.fireSound = game.add.audio('fire');

    this.cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);



  },

  fire: function () {
    if (game.time.now > this.bulletTime) {
      this.fireSound.play();
      let bullet = this.bullets.getFirstExists(false);
      if (bullet) {
        bullet.reset(this.ship.x + (this.ship.width / 2), this.ship.y - (this.ship.height + 5));
        bullet.body.velocity.y = -1500;
        this.bulletTime = game.time.now + 150;
      }
    }
    if (this.powerlevel > 1) {
      this.bullets.kill();
      this.fireSound.play();
      let bullet2 = this.bullets2.getFirstExists(false);
      if (bullet2) {
        bullet2.reset(this.ship.x + (this.ship.width / 2), this.ship.y - (this.ship.height + 5));
        bullet2.body.velocity.y = -1500;
        this.bulletTime = game.time.now + 5000;
      }
    }


  },

  gameOver: function () {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('invadershighscore', this.highScore);
    }
    game.state.start('gameover');
    game.sound.stopAll();
    music = game.add.audio("music2");



  },

  hit: function (bullet, enemy) {
    this.score = this.score + 20;
    bullet.kill();
    enemy.kill();
    if (this.aliens.countLiving() === 0) {
      this.score = this.score + 100;
      this.gameOver();
    }
    this.scoreDisplay.text = `Score: ${this.score} \nHighScore: ${this.highScore}`;
  },

  preload: function () {
    game.load.image('ship', 'assets/ship.png');
    game.load.image('enemy', 'assets/enemy.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.audio('fire', 'assets/fire.mp3');
    game.load.audio('music', 'assets/music.wav')
    game.load.image('powerup', 'assets/powerup.png')
    game.load.image('background', 'assets/background.png')
    game.load.image('ship2', 'assets/ship2.png')
    game.load.image('bullet2', 'assets/bullet2.png')
  },

  shipGotHit: function (alien, ship) {
    this.ship.kill();
    if (this.ship.kill) {
      this.gameOver();
    }
  },

  bulletpowerup: function (powerup, ship, powerlevel) {
      this.powerup.kill();
    if (this.powerup.kill) {
      this.powerlevel = 2;
    }
  },

  update: function () {

    game.physics.arcade.overlap(this.bullets, this.aliens, this.hit, null, this);
    game.physics.arcade.overlap(this.aliens, this.ship, this.shipGotHit, null, this);
    game.physics.arcade.overlap(this.powerup, this.ship, this.bulletpowerup, null, this);
    game.physics.arcade.overlap(this.bullets2, this.aliens, this.hit, null, this);

    this.ship.body.velocity.x = 0;
    this.aliens.forEach(
      (alien) => {
        alien.body.position.y = alien.body.position.y + 0.2;
        if (alien.y + alien.height > game.height) { this.gameOver(); }
        if (alien.x + alien.width > game.width) { this.gameover(); }
      }
    );

    if (this.cursors.left.isDown) {
      this.ship.body.velocity.x = -400;
    } else if (this.cursors.right.isDown) {
      this.ship.body.velocity.x = 400;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      this.fire();
    }
  }
};

const gameoverState = {
  preload: function () {
    game.load.image('gameover', 'assets/gameover.png');
  },
  create: function () {
    const gameOverImg = game.cache.getImage('gameover');
    game.add.sprite(
      game.world.centerX - gameOverImg.width / 2,
      game.world.centerY - gameOverImg.height / 2,
      'gameover');
      game.input.onDown.add(() => { game.state.start('main'); });
    }

  };

  const game = new Phaser.Game(800, 600);
  game.state.add('menu', menuState);
  game.state.add('main', mainState);
  game.state.add('gameover', gameoverState);
  game.state.start('menu');
