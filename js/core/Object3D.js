/**
 * js/core/Object3D.js
 * Nodo base con posición, rotación, escala y matriz de modelo (u_model).
 */

"use strict";

class Object3D {
    constructor() {
        this.position = [0, 0, 0];
        this.posicion = this.position;

        this.rotation = [0, 0, 0];
        this.rotacion = this.rotation;

        this.scale = [1, 1, 1];
        this.escala = this.scale;

        this.matrix = Matrix4.identity();
        this.matriz = this.matrix;

        this.autoUpdateMatrix = true;
        this.autoActualizarMatriz = true;

        this.visible = true;
    }

    setPosition(x, y, z) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
        return this;
    }

    establecerPosicion(x, y, z) {
        return this.setPosition(x, y, z);
    }

    setRotation(x, y, z) {
        this.rotation[0] = x;
        this.rotation[1] = y;
        this.rotation[2] = z;
        return this;
    }

    establecerRotacion(x, y, z) {
        return this.setRotation(x, y, z);
    }

    setScale(x, y, z) {
        if (y === undefined && z === undefined) {
            this.scale[0] = x;
            this.scale[1] = x;
            this.scale[2] = x;
        } else {
            this.scale[0] = x;
            this.scale[1] = y;
            this.scale[2] = z;
        }
        return this;
    }

    establecerEscala(x, y, z) {
        return this.setScale(x, y, z);
    }

    /**
     * Calcula la matriz de modelo (u_model) combinando Traslación * Rotación * Escala.
     * @returns {Float32Array}
     */
    updateMatrix() {
        let m = Matrix4.translation(this.position[0], this.position[1], this.position[2]);

        if (this.rotation[1] !== 0) {
            m = Matrix4.multiply(m, Matrix4.rotationY(this.rotation[1]));
        }
        if (this.rotation[0] !== 0) {
            m = Matrix4.multiply(m, Matrix4.rotationX(this.rotation[0]));
        }
        if (this.rotation[2] !== 0) {
            m = Matrix4.multiply(m, Matrix4.rotationZ(this.rotation[2]));
        }

        if (this.scale[0] !== 1 || this.scale[1] !== 1 || this.scale[2] !== 1) {
            m = Matrix4.multiply(m, Matrix4.scaling(this.scale[0], this.scale[1], this.scale[2]));
        }

        this.matrix = m;
        this.matriz = this.matrix;
        return this.matrix;
    }

    actualizarMatriz() {
        return this.updateMatrix();
    }

    getMatrix() {
        if (this.autoUpdateMatrix) {
            this.updateMatrix();
        }
        return this.matrix;
    }

    obtenerMatriz() {
        return this.getMatrix();
    }
}

window.Object3D = Object3D;
window.Objeto3D = Object3D;
