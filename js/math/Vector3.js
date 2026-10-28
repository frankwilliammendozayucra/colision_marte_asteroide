/**
 * js/math/Vector3.js
 * Operaciones vectoriales tridimensionales:
 * vec3Add, vec3Sub, vec3Dot, vec3Cross, vec3Normalize, vec3Scale, vec3Length, vec3Lerp.
 */

"use strict";

class Vector3 {
    /**
     * Construye un vector 3D a partir de coordenadas o un array [x, y, z].
     * @param {number|Array<number>} x 
     * @param {number} [y=0] 
     * @param {number} [z=0] 
     */
    constructor(x = 0, y = 0, z = 0) {
        if (Array.isArray(x)) {
            this.x = x[0] || 0;
            this.y = x[1] || 0;
            this.z = x[2] || 0;
        } else {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }

    set(x, y, z) {
        if (Array.isArray(x)) {
            this.x = x[0];
            this.y = x[1];
            this.z = x[2];
        } else {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        return this;
    }

    establecer(x, y, z) {
        return this.set(x, y, z);
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    clonar() {
        return this.clone();
    }

    toArray() {
        return [this.x, this.y, this.z];
    }

    aArreglo() {
        return this.toArray();
    }

    /* ---- Operaciones vectoriales estáticas ---- */

    static add(a, b) {
        const ax = a.x !== undefined ? a.x : a[0];
        const ay = a.y !== undefined ? a.y : a[1];
        const az = a.z !== undefined ? a.z : a[2];
        const bx = b.x !== undefined ? b.x : b[0];
        const by = b.y !== undefined ? b.y : b[1];
        const bz = b.z !== undefined ? b.z : b[2];
        return [ax + bx, ay + by, az + bz];
    }

    static sumar(a, b) {
        return Vector3.add(a, b);
    }

    static sub(a, b) {
        const ax = a.x !== undefined ? a.x : a[0];
        const ay = a.y !== undefined ? a.y : a[1];
        const az = a.z !== undefined ? a.z : a[2];
        const bx = b.x !== undefined ? b.x : b[0];
        const by = b.y !== undefined ? b.y : b[1];
        const bz = b.z !== undefined ? b.z : b[2];
        return [ax - bx, ay - by, az - bz];
    }

    static restar(a, b) {
        return Vector3.sub(a, b);
    }

    static dot(a, b) {
        const ax = a.x !== undefined ? a.x : a[0];
        const ay = a.y !== undefined ? a.y : a[1];
        const az = a.z !== undefined ? a.z : a[2];
        const bx = b.x !== undefined ? b.x : b[0];
        const by = b.y !== undefined ? b.y : b[1];
        const bz = b.z !== undefined ? b.z : b[2];
        return ax * bx + ay * by + az * bz;
    }

    static punto(a, b) {
        return Vector3.dot(a, b);
    }

    static cross(a, b) {
        const ax = a.x !== undefined ? a.x : a[0];
        const ay = a.y !== undefined ? a.y : a[1];
        const az = a.z !== undefined ? a.z : a[2];
        const bx = b.x !== undefined ? b.x : b[0];
        const by = b.y !== undefined ? b.y : b[1];
        const bz = b.z !== undefined ? b.z : b[2];
        return [
            ay * bz - az * by,
            az * bx - ax * bz,
            ax * by - ay * bx
        ];
    }

    static cruz(a, b) {
        return Vector3.cross(a, b);
    }

    static length(v) {
        const vx = v.x !== undefined ? v.x : v[0];
        const vy = v.y !== undefined ? v.y : v[1];
        const vz = v.z !== undefined ? v.z : v[2];
        return Math.hypot(vx, vy, vz);
    }

    static longitud(v) {
        return Vector3.length(v);
    }

    static normalize(v) {
        const vx = v.x !== undefined ? v.x : v[0];
        const vy = v.y !== undefined ? v.y : v[1];
        const vz = v.z !== undefined ? v.z : v[2];
        const len = Math.hypot(vx, vy, vz);
        return len > 0.00001 ? [vx / len, vy / len, vz / len] : [0, 1, 0];
    }

    static normalizar(v) {
        return Vector3.normalize(v);
    }

    static scale(v, s) {
        const vx = v.x !== undefined ? v.x : v[0];
        const vy = v.y !== undefined ? v.y : v[1];
        const vz = v.z !== undefined ? v.z : v[2];
        return [vx * s, vy * s, vz * s];
    }

    static escalar(v, s) {
        return Vector3.scale(v, s);
    }

    static lerp(a, b, t) {
        const ax = a.x !== undefined ? a.x : a[0];
        const ay = a.y !== undefined ? a.y : a[1];
        const az = a.z !== undefined ? a.z : a[2];
        const bx = b.x !== undefined ? b.x : b[0];
        const by = b.y !== undefined ? b.y : b[1];
        const bz = b.z !== undefined ? b.z : b[2];
        return [
            ax + (bx - ax) * t,
            ay + (by - ay) * t,
            az + (bz - az) * t
        ];
    }

    static interpolarLineal(a, b, t) {
        return Vector3.lerp(a, b, t);
    }
}

/* Funciones auxiliares independientes especificadas en la arquitectura */
const vec3Add = Vector3.add;
const vec3Sub = Vector3.sub;
const vec3Dot = Vector3.dot;
const vec3Cross = Vector3.cross;
const vec3Normalize = Vector3.normalize;
const vec3Scale = Vector3.scale;
const vec3Length = Vector3.length;
const vec3Lerp = Vector3.lerp;

window.Vector3 = Vector3;
window.vec3Add = vec3Add;
window.vec3Sub = vec3Sub;
window.vec3Dot = vec3Dot;
window.vec3Cross = vec3Cross;
window.vec3Normalize = vec3Normalize;
window.vec3Scale = vec3Scale;
window.vec3Length = vec3Length;
window.vec3Lerp = vec3Lerp;
