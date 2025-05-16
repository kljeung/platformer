export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('Title');
    }

    create() {
        this.add.text(400, 200, 'MONOCHROMANIA', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 300, 'Press SPACE to start', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Game');
        });
    }
}
