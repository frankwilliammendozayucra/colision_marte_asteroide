/**
 * js/math/Matrix4.js
 * Matrices 4x4 Column-Major para WebGL 2.0:
 * identity, multiply, translation, scaling, rotationX/Y/Z, perspective, lookAt.
 */

"use strict";

class Matrix4 {
    /**
     * Construye una matriz 4x4. Si no se especifican elementos, inicia como identidad.
     * @param {Array<number>|Float32Array} [elements] 
     */
    constructor(elements) {
        this.elements = elements ? new Float32Array(elements) : Matrix4.identity();
        this.elementos = this.elements;
    }

    /**
     * Matriz identidad 4x4 en orden por columnas (Column-Major).
     * @returns {Float32Array}
     */
    static identity() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    static identidad() {
        return Matrix4.identity();
    }

    /**
     * Multiplicación de matrices: a * b (Column-Major).
     * @param {Matrix4|Float32Array} a 
     * @param {Matrix4|Float32Array} b 
     * @returns {Float32Array}
     */
    static multiply(a, b) {
        const ae = a.elements || a.elementos || a;
        const be = b.elements || b.elementos || b;
        const out = new Float32Array(16);

        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                out[col * 4 + row] =
                    ae[0 * 4 + row] * be[col * 4 + 0] +
                    ae[1 * 4 + row] * be[col * 4 + 1] +
                    ae[2 * 4 + row] * be[col * 4 + 2] +
                    ae[3 * 4 + row] * be[col * 4 + 3];
            }
        }
        return out;
    }

    static multiplicar(a, b) {
        return Matrix4.multiply(a, b);
    }

    /**
     * Matriz de traslación espacial.
     * @param {number} tx 
     * @param {number} ty 
     * @param {number} tz 
     * @returns {Float32Array}
     */
    static translation(tx, ty, tz) {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1
        ]);
    }

    static traslacion(tx, ty, tz) {
        return Matrix4.translation(tx, ty, tz);
    }

    /**
     * Matriz de escalado.
     * @param {number} sx 
     * @param {number} sy 
     * @param {number} sz 
     * @returns {Float32Array}
     */
    static scaling(sx, sy, sz) {
        return new Float32Array([
            sx, 0,  0,  0,
            0,  sy, 0,  0,
            0,  0,  sz, 0,
            0,  0,  0,  1
        ]);
    }

    static escalado(sx, sy, sz) {
        return Matrix4.scaling(sx, sy, sz);
    }

    /**
     * Rotación sobre el eje X.
     * @param {number} rad 
     * @returns {Float32Array}
     */
    static rotationX(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return new Float32Array([
            1, 0,  0, 0,
            0, c,  s, 0,
            0, -s, c, 0,
            0, 0,  0, 1
        ]);
    }

    static rotacionX(rad) {
        return Matrix4.rotationX(rad);
    }

    /**
     * Rotación sobre el eje Y.
     * @param {number} rad 
     * @returns {Float32Array}
     */
    static rotationY(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return new Float32Array([
            c,  0, -s, 0,
            0,  1,  0, 0,
            s,  0,  c, 0,
            0,  0,  0, 1
        ]);
    }

    static rotacionY(rad) {
        return Matrix4.rotationY(rad);
    }

    /**
     * Rotación sobre el eje Z.
     * @param {number} rad 
     * @returns {Float32Array}
     */
    static rotationZ(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return new Float32Array([
            c,  s, 0, 0,
            -s, c, 0, 0,
            0,  0, 1, 0,
            0,  0, 0, 1
        ]);
    }

    static rotacionZ(rad) {
        return Matrix4.rotationZ(rad);
    }

    /**
     * Matriz de proyección en perspectiva.
     * @param {number} fovRad 
     * @param {number} aspect 
     * @param {number} near 
     * @param {number} far 
     * @returns {Float32Array}
     */
    static perspective(fovRad, aspect, near, far) {
        const f = 1.0 / Math.tan(fovRad / 2.0);
        const rangeInv = 1.0 / (near - far);
        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * rangeInv, -1,
            0, 0, (2.0 * far * near) * rangeInv, 0
        ]);
    }

    static perspectiva(fovRad, aspect, near, far) {
        return Matrix4.perspective(fovRad, aspect, near, far);
    }

    /**
     * Matriz de vista Look-At.
     * @param {Array<number>} eye 
     * @param {Array<number>} target 
     * @param {Array<number>} up 
     * @returns {Float32Array}
     */
    static lookAt(eye, target, up) {
        const zAxis = Vector3.normalize(Vector3.sub(eye, target));
        const xAxis = Vector3.normalize(Vector3.cross(up, zAxis));
        const yAxis = Vector3.cross(zAxis, xAxis);

        return new Float32Array([
            xAxis[0], yAxis[0], zAxis[0], 0,
            xAxis[1], yAxis[1], zAxis[1], 0,
            xAxis[2], yAxis[2], zAxis[2], 0,
            -Vector3.dot(xAxis, eye),
            -Vector3.dot(yAxis, eye),
            -Vector3.dot(zAxis, eye),
            1
        ]);
    }

    static mirarHacia(eye, target, up) {
        return Matrix4.lookAt(eye, target, up);
    }
}

window.Matrix4 = Matrix4;
window.Matriz4 = Matrix4;
