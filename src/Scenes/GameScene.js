
export default class GameScene extends Phaser.Scene {
    constructor() {
        super("Game");
    }

    init() {
        this.ACCELERATION = 2000;
        this.DRAG = 2300;
        this.MAX_SPEED = 500;
        this.JUMP_VELOCITY = -500;
        this.GRAVITY = 1400;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.physics.world.gravity.y = this.GRAVITY;
        this.hasKey = false;

        this.my = { sprite: {}, vfx: {} };
    }

    preload() {
        this.load.setPath('assets/');
        this.load.tilemapTiledJSON('level', 'platLevel-1.tmj');
        this.load.image('monochrome_tileset', 'monochrome_tilemap_packed.png');
        this.load.image('rat', 'rat.png');
        this.load.image('diamond', 'diamond.png');
        this.load.image('key', 'key.png');
        this.load.image('door', 'door.png');
        this.load.image('sparkleRun', 'sparkleRun.png');
        this.load.image('splat08', 'splat08.png');
        this.load.image('spike', 'spike.png');
        this.load.image('boing', 'boing.png');
        this.load.audio('collection', 'collection.ogg');
        this.load.audio('jump', 'jump.ogg');
        this.load.audio('walk', 'walk.ogg');
        this.load.audio('spiked', 'spiked.ogg');
        this.load.audio('bounce', 'bounce.ogg');
    }

    create() {
        this.map = this.make.tilemap({ key: 'level' });
        this.tileset = this.map.addTilesetImage('platform-tileset-packed', 'monochrome_tileset');
        this.groundLayer = this.map.createLayer('level', this.tileset, 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });

        // Replace embedded tile visuals with image-based objects
        this.diamonds = this.map.createFromObjects('objects', {
            name: 'diamond', key: 'diamond'
        });
        this.key = this.map.createFromObjects('objects', {
            name: 'key', key: 'key'
        })?.[0];
        this.door = this.map.createFromObjects('door', {
            name: 'door', key: 'door'
        })?.[0];

        // Add spike and boing objects
        this.spikes = this.map.createFromObjects('objects', { name: 'spike', key: 'spike' });
        this.boings = this.map.createFromObjects('objects', { name: 'boing', key: 'boing' });

        if (this.spikes) {
            this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
            this.spikeGroup = this.add.group(this.spikes);
        }

        if (this.boings) {
            this.physics.world.enable(this.boings, Phaser.Physics.Arcade.STATIC_BODY);
            this.boingGroup = this.add.group(this.boings);
        }

        if (this.diamonds) {
            this.physics.world.enable(this.diamonds, Phaser.Physics.Arcade.STATIC_BODY);
            this.diamondGroup = this.add.group(this.diamonds);
            this.diamondGroup = this.add.group(this.diamonds);
        }
        if (this.key) this.physics.world.enable(this.key, Phaser.Physics.Arcade.STATIC_BODY);
        if (this.door) this.physics.world.enable(this.door, Phaser.Physics.Arcade.STATIC_BODY);

        this.my.sprite.player = this.physics.add.sprite(
            this.map.tileToWorldX(6),
            this.map.tileToWorldY(13),
            'rat'
        );
        this.my.sprite.player.setCollideWorldBounds(true);
        this.my.sprite.player.setDamping(false);
        this.my.sprite.player.setMaxVelocity(this.MAX_SPEED, 1000);
        this.physics.add.collider(this.my.sprite.player, this.groundLayer);

        this.physics.add.overlap(this.my.sprite.player, this.diamondGroup, (player, diamond) => {
            diamond.destroy();
            this.sound.play('collection');
        });

        if (this.key) {
            this.physics.add.overlap(this.my.sprite.player, this.key, () => {
                this.key.destroy();
                this.hasKey = true;
                this.sound.play('collection');
            });
        }

        if (this.door) {
            this.physics.add.overlap(this.my.sprite.player, this.door, () => {
                if (this.hasKey) {
                    this.scene.start('GameOver', { won: true });
                }
            });
        }

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Overlap with spikes = GameOver
        this.physics.add.overlap(this.my.sprite.player, this.spikeGroup, () => {
            const splat = this.add.sprite(this.my.sprite.player.x, this.my.sprite.player.y, 'splat08').setScale(0.5);
            this.sound.play('spiked');
            this.my.sprite.player.setActive(false).setVisible(false);
            this.time.delayedCall(500, () => this.scene.start('GameOver', { won: false }), [], this);
        });

        // Overlap with boing = bounce upward
        this.physics.add.overlap(this.my.sprite.player, this.boingGroup, () => {
            if (this.my.sprite.player.body.velocity.y >= 0) {
                this.sound.play('bounce');
                this.my.sprite.player.setVelocityY(this.JUMP_VELOCITY * 0.75);
            }
        });
        this.cameras.main.startFollow(this.my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');

        this.my.vfx.walking = this.add.particles(0, 0, 'sparkleRun', {
            scale: { start: 0.1, end: 0.03 },
            speed: { min: -20, max: 20 },
            lifespan: 200,
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            quantity: 2
        });
        this.my.vfx.walking.stop();
    }

    update() {
        const player = this.my.sprite.player;
        if (!player.active) return;

        if (this.cursors.left.isDown) {
            player.setAccelerationX(-this.ACCELERATION);
            player.setFlipX(false);
            this.my.vfx.walking.startFollow(player, -player.displayWidth / 2 + 5, player.displayHeight / 2 - 5);
            if (player.body.blocked.down) {
                player.setDragX(5000);
                this.my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                this.my.vfx.walking.start();
            }
        } else if (this.cursors.right.isDown) {
            player.setAccelerationX(this.ACCELERATION);
            player.setFlipX(true);
            this.my.vfx.walking.startFollow(player, player.displayWidth / 2 - 5, player.displayHeight / 2 - 5);
            if (player.body.blocked.down) {
                player.setDragX(5000);
                this.my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
                this.my.vfx.walking.start();
            }
        } else {
            player.setAccelerationX(0);
            player.setDragX(5000);
            this.my.vfx.walking.stop();
        }

        if (this.cursors.up.isDown && player.body.blocked.down) {
            player.setVelocityY(this.JUMP_VELOCITY);
            this.sound.play('jump');
        }

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}
