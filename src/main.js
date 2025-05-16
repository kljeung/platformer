import BootScene from './Scenes/BootScene.js';
import TitleScene from './Scenes/TitleScene.js';
import GameScene from './Scenes/GameScene.js';
import GameOverScene from './Scenes/GameOverScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    scene: [BootScene, TitleScene, GameScene, GameOverScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
