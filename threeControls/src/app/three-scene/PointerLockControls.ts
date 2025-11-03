import * as THREE from 'three';
import { Mapping } from 'three';

/**
 * Pointer lock controls class, instantiate it to add pointer lock controls to your three scene
 * @class
 */
export class PointerLockControls {

    /**
     * Threejs camera object
     * @public
     */
    camera;

    /**
     * Html document
     * @public
     */
    document;

    /**
     * Three Renderer
     * @public
     */
    renderer;

    /**
     * Control commands, shared object that defines camera movement
     * @public
     */
    controlCommands;

    /**
     * control mappings, matches keycodes to control commands
     * @public
     */
    controlMappings;

    /**
     * Defines movement speed and direction of the camera
     * @public
     */
    velocity;

    /**
     * Pitch object, used for transforming the camera pitch
     * @public
     */
    pitchObject: THREE.Object3D;

    /**
     * Yaw object, used for transforming the camera yaw
     * @public
     */
    yawObject: THREE.Object3D;

    /**
     * literally pi
     * @public
     */
    PI_2: number;

    /**
     * Enabled variable, defines whether or not controls will do anything. set to false on pointer lock lost event and
     * true on pointer lock gained event
     * @public
     */
    enabled = false;

    /**
     * Constructor for the pointer lock controls class
     * @param {THREE.Camera} camera - THREEjs camera object, gets manipulated by this class
     * @param {THREE.Renderer} renderer - three renderer, assigns event listeners to the renderer
     * @param {Object} controlCommands - Defined controls for three controls
     * @param {Object} controlMappings - Mapping of keybindings to control commands
     * @param {THREE.Vector3} velocity - Speed and direction the camera is traveling at/in
     * @param {Document} document - html document used to bind event listeners
     */
    constructor(camera, renderer, controlCommands, controlMappings, velocity, document) {
        this.camera = camera;
        this.renderer = renderer;
        this.controlCommands = controlCommands;
        this.controlMappings = controlMappings;
        this.velocity = velocity;
        this.document = document;

        this.camera.rotation.set(0, 0, 0);
        this.pitchObject = new THREE.Object3D();
        this.pitchObject.add(this.camera);

        this.yawObject = new THREE.Object3D();
        this.yawObject.position.y = 10;
        this.yawObject.add(this.pitchObject);

        this.PI_2 = Math.PI / 2;
        window.addEventListener('resize', () => this.onWindowResize(event), false);
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange(event), false);
    }

    /**
     * Mouse move event handler, gets called by event listener, sets camera rotation about a center point
     * @param {Event} event - html event
     */
    onMouseMove(event) {
        if (this.enabled === false) {
            return;
        }
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        this.yawObject.rotation.y -= movementX * 0.002;
        this.pitchObject.rotation.x -= movementY * 0.002;

        this.pitchObject.rotation.x = Math.max(- this.PI_2, Math.min(this.PI_2, this.pitchObject.rotation.x));
    }

    /**
     * Key down event handler, gets called by event listener, sets control commands for camera movement
     * @param event - html event
     */
    onKeyDown(event) {
        if (event.shiftKey) {
            this.controlCommands.doubleSpeed = true;
        }
        switch (event.code) {
            case this.controlMappings.moveForward: {
                this.controlCommands.moveForward = true;
                break;
            }
            case this.controlMappings.moveBackward: {
                this.controlCommands.moveBackward = true;
                break;
            }
            case this.controlMappings.moveLeft: {
                this.controlCommands.moveLeft = true;
                break;
            }
            case this.controlMappings.moveRight: {
                this.controlCommands.moveRight = true;
                break;
            }
            case this.controlMappings.jump: {
                if (this.controlCommands.canJump === true) {
                    this.velocity.y += 350;
                    this.controlCommands.canJump = false;
                }
                break;
            }
        }
    }

    /**
     * Key up event handler, gets called by event listener, sets control commands for camera movement
     * @param event - html event
     */
    onKeyUp(event) {
        this.controlCommands.doubleSpeed = event.shiftKey;
        switch (event.code) {
            case this.controlMappings.moveForward: {
                this.controlCommands.moveForward = false;
                break;
            }
            case this.controlMappings.moveBackward: {
                this.controlCommands.moveBackward = false;
                break;
            }
            case this.controlMappings.moveLeft: {
                this.controlCommands.moveLeft = false;
                break;
            }
            case this.controlMappings.moveRight: {
                this.controlCommands.moveRight = false;
                break;
            }
        }
    }

    /**
     * Window resize event handler, gets called by event listener, updates camera projection matrix and aspect ratio and sets renderer size
     * @param {Event} event - html event
     */
    onWindowResize(event): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Pointer lock change event, gets called by event listener, enables or disables the controls based on document pointer lock
     * @param {Event} event - html event
     */
    onPointerLockChange(event): void {
        const elmt = document.body;
        if (document.pointerLockElement === elmt) {
            this.enabled = true;
        } else {
            this.enabled = false;
        }
    }

    /**
     * Called when controls are no longer needed, removes event listener for mouse movement
     */
    dispose(): void {
        this.document.removeEventListener('mouseMove', this.onMouseMove, false);
    }

    /**
     * Returns yawObject of camera so it can be rendered in an animate function
     * @returns {THREE.Object3D}
     */
    getObject(): THREE.Object3D {
        return this.yawObject;
    }

    /**
     * Returns direction the camera is moving in
     * @returns {THREE.Vector3}
     */
    getDirection(): Function {
        const direction = new THREE.Vector3(0, 0, - 1);
        const rotation = new THREE.Euler(0, 0, 0, 'YXZ');

        return function (v): THREE.Vector3 {
            rotation.set(this.pitchObject.rotation.x, this.yawObject.rotation.y, 0);
            v.copy(direction).applyEuler(rotation);
            return v;
        };
    }
}
