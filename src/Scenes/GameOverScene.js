export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create(data) {
        this.add.text(400, 250, data.won ? 'ESCAPED!' : 'IMPALED!', 
            { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 350, 'Press R to restart', 
            { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        this.input.keyboard.once('keydown-R', () => {
            this.scene.start('Title');
        });
    }
}
