export default class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        this.load.setPath('../assets/');
    }

    create() {
        this.scene.start('Title');
    }
}
