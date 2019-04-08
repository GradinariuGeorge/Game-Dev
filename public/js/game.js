class GameShooter extends Phaser.Scene {


    preload() {
        this.load.atlas('nik', 'assets/sprites.png', 'assets/sprites.json');
        this.load.image('helmet', 'assets/helmet.png');
        this.load.image('earth', 'assets/scorched_earth.png');
    }

    create() {

        var self = this;
        this.refreshRate = 5;
        this.land = this.add.tileSprite(0, 0, 5000, 5000, 'earth');
        this.scoreText = this.add.text(16 , 16, '', { fontSize: '42px', fill: '#FF0000' });
        this.anims.create({
            key: 'walk_down',
            repeate: -1,
            frameRate: this.refreshRate,
            frames: this.anims.generateFrameNames('nik', {
                prefix: 'niks_',
                suffix: '.png',
                start: 1,
                end: 4,
                zeroPad: 2

            })
        });
        this.anims.create({
            key: 'walk_left',
            repeate: -1,
            frameRate: this.refreshRate,
            frames: this.anims.generateFrameNames('nik', {
                prefix: 'niks_',
                suffix: '.png',
                start: 5,
                end: 8,
                zeroPad: 2

            })
        });
        this.anims.create({
            key: 'walk_right',
            repeate: true,
            frameRate: this.refreshRate,
            frames: this.anims.generateFrameNames('nik', {
                prefix: 'niks_',
                suffix: '.png',
                start: 9,
                end: 12,
                zeroPad: 2

            })
        });
        this.anims.create({
            key: 'walk_up',
            repeate: -1,
            frameRate: this.refreshRate,
            frames: this.anims.generateFrameNames('nik', {
                prefix: 'niks_',
                suffix: '.png',
                start: 13,
                end: 16,
                zeroPad: 2

            })
        });


        this.cursors = this.input.keyboard.createCursorKeys();


        this.socket = io({transports: ['websocket'], upgrade: false});
        this.otherPlayers = this.physics.add.group();


        this.socket.on('currentPlayers', function (players) {
            console.log(players)
            Object.keys(players).forEach(function (id) {
                if (players[id].playerId === self.socket.id) {
                    console.log("Client - new player me")
                    self.addPlayer(self, players[id]);
                } else {
                    console.log("Client - new player another")
                    self.addOtherPlayers(self, players[id]);
                }
            });
        });
        this.socket.on('newPlayer', function (playerInfo) {
            console.log("Client - new player")
            self.addOtherPlayers(self, playerInfo);
        });
        this.socket.on('disconnect', function (playerId) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        });

        this.socket.on('helmetLocation', function (helmetLocation) {
            if (self.helmet) self.helmet.destroy();
            console.log(helmetLocation)
            self.helmet = self.physics.add.image(helmetLocation.x, helmetLocation.y, 'helmet').setDisplaySize(50,50);
            self.physics.add.overlap(self.nik, self.helmet, function () {
                this.socket.emit('helmetCollected');
            }, null, self);
        });
        this.socket.on('playerMoved', function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    if (playerInfo.movementDirection === "walk_left") {
                        otherPlayer.play('walk_left', true)
                    } else if (playerInfo.movementDirection === "walk_right") {
                        otherPlayer.play('walk_right', true)
                    }
                    if (playerInfo.movementDirection === "walk_up") {
                        otherPlayer.play('walk_up', true)
                    } else if (playerInfo.movementDirection === "walk_down") {
                        otherPlayer.play('walk_down', true)
                    }
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                }
            });
        });
        this.cursors = this.input.keyboard.createCursorKeys();
        this.socket.on('scoreUpdate', function (scores) {
            console.log(scores)
            if(self.socket.id===scores.playerId)
                self.scoreText.setText('Score: ' + scores.currentScore);
        });
    }

    update() {

        if (this.nik) {

            if (this.cursors.left.isDown) {
                this.nik.x--;
                this.nik.play('walk_left', true)
                this.nik.movement = "walk_left"
            } else if (this.cursors.right.isDown) {
                this.nik.x++;
                this.nik.play('walk_right', true)
                this.nik.movement = "walk_right"

            }
            if (this.cursors.up.isDown) {
                this.nik.play('walk_up', true)
                this.nik.y--;
                this.nik.movement = "walk_up"

            } else if (this.cursors.down.isDown) {
                this.nik.play('walk_down', true)
                this.nik.y++;
                this.nik.movement = "walk_down"

            }

            this.physics.world.wrap(this.nik, 5);

            // emit player movement
            var x = this.nik.x;
            var y = this.nik.y;
            if (this.nik.oldPosition && (x !== this.nik.oldPosition.x || y !== this.nik.oldPosition.y)) {
                this.socket.emit('playerMovement', {x: this.nik.x, y: this.nik.y, movement: this.nik.movement});
            }
            // save old position data
            this.nik.oldPosition = {
                x: this.nik.x,
                y: this.nik.y,
                movement: this.nik.movement
            };
        }


    }


    addPlayer(self, playerInfo) {
        console.log('me')
        self.nik = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'nik', 'niks_01.png').setOrigin(0.5, 0.5).setDisplaySize(25, 44);
        self.nik.setDrag(100);
        self.nik.setAngularDrag(100);
        self.nik.setMaxVelocity(200);
    }

    addOtherPlayers(self, playerInfo) {
        console.log('another')
        const otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'nik', 'niks_01.png').setOrigin(0.5, 0.5).setDisplaySize(25, 44);
        otherPlayer.playerId = playerInfo.playerId;
        self.otherPlayers.add(otherPlayer);
    }
}

// var config = {
//     type: Phaser.AUTO,
//     parent: 'phaser-example',
//     width: 2100,
//     height: 1000,
//     physics: {
//         default: 'arcade',
//         arcade: {
//             debug: false,
//             gravity: {y: 0}
//         }
//     },
//     scene: [GameShooter]
// };
//
// var game = new Phaser.Game(config);