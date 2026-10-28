/**
 * js/cameras/PerspectiveCamera.js
 * Cámara de Proyección en Perspectiva para WebGL 2.0:
 * Frustum (FOV 42°, aspect ratio, near 0.1, far 200.0) y temblor/vibración (camShake).
 */

"use strict";

class PerspectiveCamera {
    /**
     * @param {number} [fov=42.0] - Campo de visión vertical en grados.
     * @param {number} [aspect=1.0] - Relación de aspecto (ancho / alto).
     * @param {number} [near=0.1] - Distancia al plano de corte cercano.
     * @param {number} [far=200.0] - Distancia al plano de corte lejano.
     */
    constructor(fov = 42.0, aspect = 1.0, near = 0.1, far = 200.0) {
        this.fov = fov;
        this.campoVision = fov;

        this.aspect = aspect;
        this.relacionAspecto = aspect;

        this.near = near;
        this.planoCercano = near;

        this.far = far;
        this.planoLejano = far;

        /* Desplazamiento de temblor por impacto sísmico */
        this.camShake = [0, 0, 0];
        this.temblorCamara = this.camShake;

        this.projectionMatrix = Matrix4.identity();
        this.matrizProyeccion = this.projectionMatrix;

        this.updateProjectionMatrix();
    }

    /**
     * Aplica o actualiza el vector de temblor de cámara (camShake).
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    setCamShake(x, y, z) {
        this.camShake[0] = x;
        this.camShake[1] = y;
        this.camShake[2] = z;
    }

    /**
     * Actualiza la relación de aspecto si la ventana o el viewport cambian.
     * @param {number} aspect 
     */
    setAspect(aspect) {
        if (this.aspect !== aspect) {
            this.aspect = aspect;
            this.relacionAspecto = aspect;
            this.updateProjectionMatrix();
        }
    }

    establecerAspecto(aspect) {
        this.setAspect(aspect);
    }

    /**
     * Recalcula la matriz de proyección en perspectiva.
     */
    updateProjectionMatrix() {
        const fovRad = (this.fov * Math.PI) / 180.0;
        this.projectionMatrix = Matrix4.perspective(
            fovRad,
            this.aspect,
            this.near,
            this.far
        );
        this.matrizProyeccion = this.projectionMatrix;
    }

    actualizarMatrizProyeccion() {
        this.updateProjectionMatrix();
    }
}

window.PerspectiveCamera = PerspectiveCamera;
window.CamaraPerspectiva = PerspectiveCamera;
