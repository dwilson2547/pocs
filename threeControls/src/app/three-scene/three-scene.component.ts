import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { PointerLockControls } from './PointerLockControls';
import * as dat from 'dat.gui';
import { OrbitControls } from './OrbitControls';

@Component({
  selector: 'app-three-scene',
  templateUrl: './three-scene.component.html',
  styleUrls: ['./three-scene.component.css']
})
export class ThreeSceneComponent implements OnInit, OnDestroy {

  camera;
  scene;
  renderer;
  controls;
  objects = [];
  raycaster: THREE.Raycaster;
  sceneDiv;
  instructionsDiv;
  prevTime;
  controlsEnabled = false;
  velocity = new THREE.Vector3();
  orbitControls: OrbitControls;
  pointerLockControls: PointerLockControls;
  crosshair;
  gui: dat.GUI;
  controlMappings = {
    moveForward: 'KeyW',
    moveBackward: 'KeyS',
    moveRight: 'KeyD',
    moveLeft: 'KeyA',
    jump: 'Space',
    doubleSpeed: 'Shift'
  };

  controlOptions = {
    crosshairSize: 0.02,
    crosshairColor: 0x000000,
    type: {
      pointerLock: true,
      orbit: false
    }
  };

  controlCommands = {
    moveForward: false,
    moveBackward: false,
    moveUp: false,
    moveDown: false,
    moveRight: false,
    moveLeft: false,
    canJump: false,
    doubleSpeed: false
  };

  constructor() { }

  ngOnInit() {
    this.sceneDiv = document.getElementById('mainScene');
    this.instructionsDiv = document.getElementById('instructionsDiv');
    this.init();
    this.setupMenu();
  }

  ngOnDestroy() {
    this.gui.destroy();
    document.body.removeChild(this.renderer.domElement);
  }

  setupMenu() {
    this.gui = new dat.GUI();
    this.gui.add(this.controlOptions, 'crosshairSize', 0.001, 0.1).name('Crosshair Size').onChange(() => {
      this.changeCrosshairSize(this.controlOptions.crosshairSize);
    });
    this.gui.addColor(this.controlOptions, 'crosshairColor').name('Crosshair Color').onChange(() => {
      this.changeCrosshairColor(this.controlOptions.crosshairColor);
    });
    const controlsFolder = this.gui.addFolder('Controls');
    controlsFolder.add(this.controlOptions.type, 'pointerLock').name('Pointer Lock').onChange(() => {
      this.setControls('pointerLock');
    });
    controlsFolder.add(this.controlOptions.type, 'orbit').name('Orbit').onChange(() => {
      this.setControls('orbit');
    });
  }

  pointerLockChange(event) {
    const elmt = document.body;
    if (document.pointerLockElement !== elmt) {
      this.velocity = new THREE.Vector3;
      this.instructionsDiv.style.display = '';
      this.sceneDiv.style.display = '';
    }
  }

  setControls(type) {
    console.log(type);
  }

  @HostListener('document:pointerlockchange', ['$event']) onPointerLockChange(event) {
    this.pointerLockChange(event);
  }

  @HostListener('document:keydown', ['$event']) keyDown(event) {
    this.controls.onKeyDown(event);
  }

  @HostListener('document:keyup', ['$event']) keyUp(event) {
    this.controls.onKeyUp(event);
  }

  @HostListener('document:mousemove', ['$event']) mouseMove(event) {
    this.controls.onMouseMove(event);
  }

  requestPointerLock(event) {
    event.preventDefault();
    this.instructionsDiv.style.display = 'none';
    this.sceneDiv.style.display = 'none';
    document.body.requestPointerLock = document.body.requestPointerLock;
    document.body.requestPointerLock();
  }

  createCrosshair(size) {
    const material = new THREE.LineBasicMaterial({ color: this.controlOptions.crosshairColor });
    const x = size;
    const y = size;
    const geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, y, 0));
    geometry.vertices.push(new THREE.Vector3(0, -y, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(x, 0, 0));
    geometry.vertices.push(new THREE.Vector3(-x, 0, 0));
    const crosshair = new THREE.Line(geometry, material);
    crosshair.position.z = -1.3;
    return crosshair;
  }

  changeCrosshairColor(color) {
    this.crosshair.material.color.set(color);
  }

  changeCrosshairSize(size) {
    this.camera.remove(this.crosshair);
    this.crosshair = this.createCrosshair(size);
    this.camera.add(this.crosshair);
  }

  init() {
    document.addEventListener('pointerlockchange', () => this.pointerLockChange(event), false);

    this.renderer = new THREE.WebGLRenderer();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    this.scene.add(light);

    this.crosshair = this.createCrosshair(0.02);

    this.camera.add(this.crosshair);

    this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);

    this.controls = this.pointerLockControls = new PointerLockControls(this.camera, this.renderer, this.controlCommands,
      this.controlMappings, this.velocity, document);

    // this.controls = this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement, document);
    // this.orbitControls.enableDamping = true;
    // this.orbitControls.dampingFactor = 0.25;
    // this.orbitControls.screenSpacePanning = false;
    // this.orbitControls.enabled = true;

    this.scene.add(this.controls.getObject());

    //#region other misc shit

    let floorGeometry: any = new THREE.PlaneBufferGeometry(2000, 2000, 100, 100);
    floorGeometry.rotateX(- Math.PI / 2);
    // vertex displacement
    const position = floorGeometry.attributes['position'];
    const vertex = new THREE.Vector3();
    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);
      vertex.x += Math.random() * 20 - 10;
      vertex.y += Math.random() * 2;
      vertex.z += Math.random() * 20 - 10;
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices
    let count = floorGeometry.attributes.position.count;
    let colors = [];
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
      colors.push(color.r, color.g, color.b);
    }
    floorGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.scene.add(floor);
    // objects
    let boxGeometry: any = new THREE.BoxBufferGeometry(20, 20, 20);
    boxGeometry = boxGeometry.toNonIndexed(); // ensure each face has unique vertices
    count = boxGeometry.attributes.position.count;
    colors = [];
    for (let i = 0; i < count; i++) {
      color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
      colors.push(color.r, color.g, color.b);
    }
    boxGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    for (let i = 0; i < 500; i++) {
      const boxMaterial = new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, vertexColors: THREE.VertexColors });
      boxMaterial.color.setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.x = Math.floor(Math.random() * 20 - 10) * 20;
      box.position.y = Math.floor(Math.random() * 20) * 20 + 10;
      box.position.z = Math.floor(Math.random() * 20 - 10) * 20;
      this.scene.add(box);
      this.objects.push(box);
    }

    //#endregion


    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.animate();
  }

  /**
   * Animate function, requests animation frame and renders camera updates
   */
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    if (this.controls.enabled === true) {
      if (this.controlOptions.type.orbit) {
        this.controls.update();
      } else if (this.controlOptions.type.pointerLock) {
        this.raycaster.ray.origin.copy(this.controls.getObject().position);
        this.raycaster.ray.origin.y -= 10;
        const intersections = this.raycaster.intersectObjects(this.objects);
        const onObject = intersections.length > 0;
        const time = performance.now();
        if (!this.prevTime) {
          this.prevTime = time;
        }
        let delta = (time - this.prevTime) / 1000;
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
        const direction = new THREE.Vector3();
        direction.z = Number(this.controlCommands.moveForward) - Number(this.controlCommands.moveBackward);
        direction.x = Number(this.controlCommands.moveLeft) - Number(this.controlCommands.moveRight);
        direction.normalize(); // this ensures consistent movements in all directions
        if (this.controlCommands.moveForward || this.controlCommands.moveBackward) { this.velocity.z -= direction.z * 400.0 * delta; }
        if (this.controlCommands.moveLeft || this.controlCommands.moveRight) { this.velocity.x -= direction.x * 400.0 * delta; }
        if (onObject === true) {
          this.velocity.y = Math.max(0, this.velocity.y);
          this.controlCommands.canJump = true;
        }
        if (this.controlCommands.doubleSpeed) {
          delta = delta * 2;
        }
        this.controls.yawObject.translateX(this.velocity.x * delta);
        this.controls.yawObject.translateY(this.velocity.y * delta);
        this.controls.yawObject.translateZ(this.velocity.z * delta);
        if (this.controls.getObject().position.y < 10) {
          this.velocity.y = 0;
          this.controls.getObject().position.y = 10;
          this.controlCommands.canJump = true;
        }
        this.prevTime = time;
      }
    }
    this.renderer.render(this.scene, this.camera);
  }

}
