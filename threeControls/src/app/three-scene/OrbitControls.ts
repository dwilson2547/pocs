import * as THREE from 'three';

export class OrbitControls {

    //#region Global Vars

    object;
    domElement;
    document;
    enabled = true;
    target = new THREE.Vector3;

    minDistance = 0;
    maxDistance = Infinity;

    minZoom = 0;
    maxZoom = Infinity;

    minPolarAngle = 0;
    maxPolarAngle = Infinity;

    minAzimuthAngle = - Infinity; // radians
    maxAzimuthAngle = Infinity; // radians
    enableDamping = false;
    dampingFactor = 0.25;
    enableZoom = true;
    zoomSpeed = 1.0;
    enableRotate = true;
    rotateSpeed = 1.0;
    enablePan = true;
    panSpeed = 1.0;
    screenSpacePanning = false; // if true, pan in screen-space
    keyPanSpeed = 7.0;	// pixels moved per arrow key push
    autoRotate = false;
    autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
    enableKeys = true;
    keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
    mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };
    target0 = this.target.clone();
    position0: THREE.Vector3;
    zoom0;
    changeEvent = { type: 'change' };
    startEvent = { type: 'start' };
    endEvent = { type: 'end' };
    STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY_PAN: 4 };

    state = this.STATE.NONE;

    EPS = 0.000001;

    // current position in spherical coordinates
    spherical = new THREE.Spherical();
    sphericalDelta = new THREE.Spherical();

    scale = 1;
    panOffset = new THREE.Vector3();
    zoomChanged = false;
    rotateStart = new THREE.Vector2();
    rotateEnd = new THREE.Vector2();
    rotateDelta = new THREE.Vector2();
    panStart = new THREE.Vector2();
    panEnd = new THREE.Vector2();
    panDelta = new THREE.Vector2();
    dollyStart = new THREE.Vector2();
    dollyEnd = new THREE.Vector2();
    dollyDelta = new THREE.Vector2();

    //#endregion

    constructor(camera, element, document) {
        this.object = camera;
        this.domElement = element;
        this.document = document;
        this.position0 = this.object.position.clone();
        this.zoom0 = this.object.zoom;

        this.domElement.addEventListener('contextmenu', () => {
            this.onContextMenu(event);
        }, false);
        this.domElement.addEventListener('mousedown', () => {
            this.onMouseDown(event);
        }, false);
        this.domElement.addEventListener('wheel', () => {
            this.onMouseWheel(event);
        }, false);
        this.domElement.addEventListener('keydown', () => {
            this.onKeyDown(event);
        }, false);
    }

    //#region Event Handlers

    onContextMenu(event) {
        if (this.enabled === false) {
            return;
        } else {
            event.preventDefault();
        }
    }

    /**
     * Mouse down handler for OrbitControls class, checks local vars to determine movement mode then calls the appriate function
     * @param {Event} event
     * @public
     * @returns {null}
     */
    onMouseDown(event) {
        if (this.enabled === false) {
            return;
        } else {
            switch (event.button) {
                case this.mouseButtons.ORBIT: {
                    if (this.enableRotate === false) {
                        return;
                    } else {
                        this.handleMouseDownRotate(event);
                        this.state = this.STATE.ROTATE;
                    }
                    break;
                } case this.mouseButtons.ZOOM: {
                    if (this.enableZoom === false) {
                        return;
                    } else {
                        this.handleMouseDownDolly(event);
                        this.state = this.STATE.DOLLY;
                    }
                    break;
                } case this.mouseButtons.PAN: {
                    if (this.enablePan === false) {
                        return;
                    } else {
                        this.handleMouseDownPan(event);
                        this.state = this.STATE.PAN;
                    }
                    break;
                }
            }
            if (this.state !== this.STATE.NONE) {
                this.domElement.addEventListener('mousemove', () => {
                    this.onMouseMove(event);
                }, false);
                this.domElement.addEventListener('mouseup', () => {
                    this.onMouseUp(event);
                }, false);
                this.dispatchEvent(this.startEvent);
            }
        }
    }

    onMouseMove(event) {
        if (this.enabled === false) {
            return;
        } else {
            event.preventDefault();
            switch (this.state) {
                case this.STATE.ROTATE: {
                    this.handleMouseMoveRotate(event);
                    break;
                } case this.STATE.DOLLY: {
                    this.handleMouseMoveDolly(event);
                    break;
                } case this.STATE.PAN: {
                    this.handleMouseMovePan(event);
                    break;
                }
            }
        }
    }

    onMouseUp(event) {
        if (this.enabled === false) {
            return;
        } else {
            this.handleMouseUp(event);
        }
    }

    onMouseWheel(event) {
        if (this.enabled === false || this.enableZoom === false ||
            (this.state === this.STATE.NONE && this.state !== this.STATE.ROTATE)) {
            return;
        } else {
            event.preventDefault();
            event.stopPropogation();

            this.dispatchEvent(this.startEvent);
            this.handleMouseWheel(event);
            this.dispatchEvent(this.endEvent);
        }
    }

    onKeyDown(event) {
        if (this.enabled === false || this.enableKeys === false || this.enablePan === false) {
            return;
        } else {
            this.handleKeyDown(event);
        }
    }

    dispatchEvent(event) {
        // console.log(event);
    }

    //#endregion

    //#region Event Callbacks

    handleMouseDownRotate(event) {
        this.rotateStart.set(event.clientX, event.clientY);
    }

    handleMouseDownDolly(event) {
        this.dollyStart.set(event.clientX, event.clientY);
    }

    handleMouseDownPan(event) {
        this.panStart.set(event.clientX, event.clientY);
    }

    handleMouseMoveRotate(event) {
        this.rotateEnd.set(event.clientX, event.clientY);
        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

        this.rotateLeft(2 * Math.PI * this.rotateDelta.x / this.document.body.clientWidth);
        this.rotateUp(2 * Math.PI * this.rotateDelta.y / this.document.body.clientHeight);

        this.rotateStart.copy(this.rotateEnd);
        this.update();
    }

    handleMouseMoveDolly(event) {
        this.dollyEnd.set(event.clientX, event.clientY);
        this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

        if (this.dollyDelta.y > 0) {
            this.dollyIn(this.getZoomScale());
        } else if (this.dollyDelta.y < 0) {
            this.dollyOut(this.getZoomScale());
        }

        this.dollyStart.copy(this.dollyEnd);
        this.update();
    }

    handleMouseMovePan(event) {
        this.panEnd.set(event.clientX, event.clientY);
        this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed);
        this.pan(this.panDelta.x, this.panDelta.y);
        this.update();
    }

    handleMouseUp(event) {
        this.domElement.removeEventListener('mousemove', () => {
            this.onMouseMove(event);
        }, false);
        this.domElement.removeEventListener('mouseup', () => {
            this.onMouseUp(event);
        }, false);
        this.dispatchEvent(this.endEvent);
        this.state = this.STATE.NONE;
    }

    handleMouseWheel(event) {
        if (event.deltaY < 0) {
            this.dollyOut(this.getZoomScale());
        } else if (event.deltaY > 0) {
            this.dollyIn(this.getZoomScale());
        }
        this.update();
    }

    handleKeyDown(event) {
        switch (event.keyCode) {
            case this.keys.UP: {
                this.pan(0, this.keyPanSpeed);
                this.update();
                break;
            } case this.keys.BOTTOM: {
                this.pan(0, -this.keyPanSpeed);
                this.update();
                break;
            } case this.keys.LEFT: {
                this.pan(this.keyPanSpeed, 0);
                this.update();
                break;
            } case this.keys.RIGHT: {
                this.pan(-this.keyPanSpeed, 0);
                this.update();
                break;
            }
        }
    }

    //#endregion

    //#region Movement Functions

    rotateLeft(angle) {
        this.sphericalDelta.theta -= angle;
    }

    rotateUp(angle) {
        this.sphericalDelta.phi -= angle;
    }

    panLeft(distance, objectMatrix) {
        const v = new THREE.Vector3();
        v.setFromMatrixColumn(objectMatrix, 0);
        v.multiplyScalar(-distance);
        this.panOffset.add(v);
    }

    panUp(distance, objectMatrix) {
        const v = new THREE.Vector3();
        if (this.screenSpacePanning === true) {
            v.setFromMatrixColumn(objectMatrix, 1);
        } else {
            v.setFromMatrixColumn(objectMatrix, 0);
            v.crossVectors(this.object.up, v);
        }
        v.multiplyScalar(distance);
        this.panOffset.add(v);
    }

    pan(deltaX, deltaY) {
        const offset = new THREE.Vector3();

        if (this.object.isPerspectiveCamera) {
            const position = this.object.position;
            offset.copy(position).sub(this.target);
            let targetDistance = offset.length();

            targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);

            this.panLeft(2 * deltaX * targetDistance / this.document.body.clientHeight, this.object.matrix);
            this.panUp(2 * deltaY * targetDistance / this.document.body.clientHeight, this.object.matrix);
        } else if (this.object.isOrthographicCamera) {
            this.panLeft(deltaX * (this.object.right - this.object.left) /
                this.object.zoom / this.document.body.clientWidth, this.object.matrix);
            this.panUp(deltaY * (this.object.top - this.object.bottom) /
                this.object.zoom / this.document.body.clientHeight, this.object.matrix);
        } else {
            // camera neither orthographic nor perspective
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
            this.enablePan = false;
        }
    }

    dollyIn(dollyScale) {
        if (this.object.isPerspectiveCamera) {
            this.scale /= dollyScale;
        } else if (this.object.isOrthographicCamera) {
            this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale));
            this.object.updateProjectionMatrix();
            this.zoomChanged = true;
        } else {
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            this.enableZoom = false;
        }
    }

    dollyOut(dollyScale) {
        if (this.object.isPerspectiveCamera) {
            this.scale *= dollyScale;
        } else if (this.object.isOrthographicCamera) {
            this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale));
            this.object.updateProjectionMatrix();
            this.zoomChanged = true;
        } else {
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            this.enableZoom = false;
        }
    }

    //#endregion

    //#region Helper Methods

    getPolarAngle() {
        return this.spherical.phi;
    }

    getAzimuthalAngle() {
        return this.spherical.theta;
    }

    saveState() {
        this.target0.copy(this.target);
        this.position0.copy(this.object.position);
        this.zoom0 = this.object.zoom;
    }

    reset() {
        this.target.copy(this.target0);
        this.object.position.copy(this.position0);
        this.object.zoom = this.zoom0;
        this.object.updateProjectionMatrix();
        this.dispatchEvent(this.changeEvent);

        this.update();

        this.state = this.STATE.NONE;
    }

    dispose() {
        this.domElement.removeEventListener('contextmenu', () => {
            this.onContextMenu(event);
        }, false);
        this.domElement.removeEventListener('mousedown', () => {
            this.onMouseDown(event);
        }, false);
        this.domElement.removeEventListener('wheel', () => {
            this.onMouseWheel(event);
        }, false);
        this.domElement.removeEventListener('mousemove', () => {
            this.onMouseMove(event);
        }, false);
        this.domElement.removeEventListener('mouseup', () => {
            this.onMouseUp(event);
        }, false);
        this.domElement.removeEventListener('keydown', () => {
            this.onKeyDown(event);
        }, false);

    }

    getZoomScale() {
        return Math.pow(0.95, this.zoomSpeed);
    }

    getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
    }

    //#endregion

    update() {
        const offset = new THREE.Vector3();

        const quat = new THREE.Quaternion().setFromUnitVectors(this.object.up, new THREE.Vector3(0, 1, 0));
        const quatInverse = quat.clone().inverse();

        const lastPosition = new THREE.Vector3();
        const lastQuaternion = new THREE.Quaternion();

        const position = this.object.position;

        offset.copy(position).sub(this.target);
        offset.applyQuaternion(quat);

        this.spherical.setFromVector3(offset);

        if (this.autoRotate && this.state === this.STATE.NONE) {
            this.rotateLeft(this.getAutoRotationAngle());
        }

        this.spherical.theta += this.sphericalDelta.theta;
        this.spherical.phi += this.sphericalDelta.phi;

        this.spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.spherical.theta));

        this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));

        this.spherical.makeSafe();

        this.spherical.radius *= this.scale;

        this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));

        this.target.add(this.panOffset);
        offset.setFromSpherical(this.spherical);
        offset.applyQuaternion(quatInverse);

        this.object.position.copy(this.target).add(offset);

        this.object.lookAt(this.target);

        if (this.enableDamping === true) {
            this.sphericalDelta.theta *= (1 - this.dampingFactor);
            this.sphericalDelta.phi *= (1 - this.dampingFactor);

            this.panOffset.multiplyScalar(1 - this.dampingFactor);
        } else {
            this.sphericalDelta.set(0, 0, 0);
            this.panOffset.set(0, 0, 0);
        }

        this.scale = 1;

        if (this.zoomChanged
            || lastPosition.distanceToSquared(this.object.position) > this.EPS
            || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > this.EPS) {
            this.dispatchEvent(this.changeEvent);

            lastPosition.copy(this.object.position);
            lastQuaternion.copy(this.object.quaternion);
            this.zoomChanged = false;

            return true;
        }
        return false;
    }

}
