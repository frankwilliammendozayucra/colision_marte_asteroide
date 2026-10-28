/**
 * js/cameras/OrbitControls.js
 * Control interactivo orbital con mouse y pantallas táctiles:
 * pointerdown/move para ángulos theta (θ), phi (φ) y rueda (wheel) para zoom.
 */

"use strict";

class OrbitControls {
    /**
     * @param {HTMLElement} domElement - Elemento canvas HTML.
     * @param {Object} [options={}] - Parámetros iniciales de órbita.
     */
    constructor(domElement, options = {}) {
        this.domElement = domElement;
        this.elementoDom = domElement;

        // Ángulos esféricos y radio orbital
        this.theta = options.theta !== undefined ? options.theta : (options.teta !== undefined ? options.teta : 0.15);
        this.teta = this.theta;

        this.phi = options.phi !== undefined ? options.phi : (options.fi !== undefined ? options.fi : 0.35);
        this.fi = this.phi;

        this.radius = options.radius !== undefined ? options.radius : (options.radio !== undefined ? options.radio : 5.8);
        this.radio = this.radius;

        // Límites de distancia orbital
        this.minRadius = options.minRadius || options.radioMinimo || 3.0;
        this.radioMinimo = this.minRadius;

        this.maxRadius = options.maxRadius || options.radioMaximo || 18.0;
        this.radioMaximo = this.maxRadius;

        // Punto de enfoque objetivo y vector vertical
        this.target = options.target ? [...options.target] : (options.objetivo ? [...options.objetivo] : [0.0, 0.15, 0.0]);
        this.objetivo = this.target;

        this.up = options.up ? [...options.up] : (options.arriba ? [...options.arriba] : [0, 1, 0]);
        this.arriba = this.up;

        // Estado del puntero
        this.isDragging = false;
        this.estaArrastrando = false;
        this.lastX = 0;
        this.lastY = 0;

        this._bindEvents();
    }

    _bindEvents() {
        this._onPointerDown = (e) => {
            this.isDragging = true;
            this.estaArrastrando = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;

            if (this.domElement.setPointerCapture) {
                try {
                    this.domElement.setPointerCapture(e.pointerId);
                } catch {
                    // Ignorar si no soporta captura explícita
                }
            }
        };

        this._onPointerMove = (e) => {
            if (!this.isDragging) return;

            const deltaX = e.clientX - this.lastX;
            const deltaY = e.clientY - this.lastY;

            // Rotación suave azimutal y de elevación
            this.theta -= deltaX * 0.007;
            this.teta = this.theta;

            // Limitar phi para evitar voltear la cámara en los polos
            this.phi = Math.max(-1.45, Math.min(1.45, this.phi + deltaY * 0.007));
            this.fi = this.phi;

            this.lastX = e.clientX;
            this.lastY = e.clientY;
        };

        this._onPointerUp = (e) => {
            this.isDragging = false;
            this.estaArrastrando = false;
            if (this.domElement.releasePointerCapture) {
                try {
                    this.domElement.releasePointerCapture(e.pointerId);
                } catch {
                    // Ignorar
                }
            }
        };

        this._onWheel = (e) => {
            e.preventDefault();
            this.radius = Math.max(
                this.minRadius,
                Math.min(this.maxRadius, this.radius + e.deltaY * 0.004)
            );
            this.radio = this.radius;
        };

        this.domElement.addEventListener('pointerdown', this._onPointerDown);
        this.domElement.addEventListener('pointermove', this._onPointerMove);
        this.domElement.addEventListener('pointerup', this._onPointerUp);
        this.domElement.addEventListener('wheel', this._onWheel, { passive: false });
    }

    /**
     * Calcula la posición del ojo de la cámara sumando el temblor sísmico (camShake).
     * @param {Array<number>} [camShake=[0, 0, 0]] 
     * @returns {Array<number>} [x, y, z]
     */
    getEyePosition(camShake = [0, 0, 0]) {
        return [
            this.target[0] + this.radius * Math.cos(this.phi) * Math.sin(this.theta) + camShake[0],
            this.target[1] + this.radius * Math.sin(this.phi) + camShake[1],
            this.target[2] + this.radius * Math.cos(this.phi) * Math.cos(this.theta) + camShake[2]
        ];
    }

    obtenerPosicionOjo(temblor = [0, 0, 0]) {
        return this.getEyePosition(temblor);
    }

    /**
     * Genera la matriz de vista 4x4 (LookAt).
     * @param {Array<number>} [camShake=[0, 0, 0]] 
     * @returns {Float32Array}
     */
    getViewMatrix(camShake = [0, 0, 0]) {
        const eye = this.getEyePosition(camShake);
        return Matrix4.lookAt(eye, this.target, this.up);
    }

    obtenerMatrizVista(temblor = [0, 0, 0]) {
        return this.getViewMatrix(temblor);
    }

    destroy() {
        this.domElement.removeEventListener('pointerdown', this._onPointerDown);
        this.domElement.removeEventListener('pointermove', this._onPointerMove);
        this.domElement.removeEventListener('pointerup', this._onPointerUp);
        this.domElement.removeEventListener('wheel', this._onWheel);
    }

    destruir() {
        this.destroy();
    }
}

window.OrbitControls = OrbitControls;
window.ControlesOrbitales = OrbitControls;
