class GameTitle extends Phaser.Scene {
    constructor() {
        super({key: 'GameTitle'});
    }

    preload() {
        this.load.image('gametitle', 'assets/fury.png');
        this.load.image('play', 'assets/play.png')
        this.load.image('background', 'assets/background.png')
    }

    create() {
        console.log('GameTitle - create');
        let background= this.add.sprite(0,0,'background')
        background.setOrigin(0,0)
        let gameTitle = this.add.sprite(160, 160, "gametitle");
        gameTitle.setOrigin(-0.5, 0);
        let playButton = this.add.image(160, 320, 'play').setDisplaySize(120,120);
        playButton.setOrigin(-6, -1);
        playButton.setInteractive().on('pointerdown', () => this.playTheGame())
    }

    playTheGame() {
        this.scene.start("GameShooter");
    }
}

