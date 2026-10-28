/**
 * js/objects/ParticleSystem.js
 * Gestor de buffers dinámicos (gl.DYNAMIC_DRAW) para la pluma piroclástica,
 * fuego de impacto y columnas de vapor de agua.
 */

"use strict";

class ParticleSystem {
    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {number} [maxParticles=1000] 
     */
    constructor(gl, maxParticles = 1000) {
        this.gl = gl;
        this.maxParticles = maxParticles;
        this.maxParticulas = maxParticles;
        this.nextParticleIdx = 0;
        this.siguienteIndiceParticula = 0;

        // Estructura en memoria CPU para cada partícula
        this.particles = Array.from({ length: maxParticles }, () => ({
            active: false,
            activa: false,
            pos: [0, 0, 0],
            vel: [0, 0, 0],
            color: [1, 1, 1, 1],
            size: 20,
            tamano: 20,
            growRate: 0.8,
            tasaCrecimiento: 0.8,
            age: 0,
            edad: 0,
            life: 1.0,
            vida: 1.0
        }));
        this.particulas = this.particles;

        // Arreglos continuos para bufferSubData
        this.posData = new Float32Array(maxParticles * 3);
        this.datosPosicion = this.posData;
        this.colData = new Float32Array(maxParticles * 4);
        this.datosColor = this.colData;
        this.sizeData = new Float32Array(maxParticles);
        this.datosTamano = this.sizeData;

        this.vao = null;
        this.posBuf = null;
        this.colBuf = null;
        this.sizeBuf = null;

        this._initBuffers();
    }

    _initBuffers() {
        const gl = this.gl;
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        const createDynamicBuffer = (byteLength, location, size) => {
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, byteLength, gl.DYNAMIC_DRAW);
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
            return buffer;
        };

        this.posBuf = createDynamicBuffer(this.posData.byteLength, 0, 3);
        this.bufferPosiciones = this.posBuf;

        this.colBuf = createDynamicBuffer(this.colData.byteLength, 1, 4);
        this.bufferColores = this.colBuf;

        this.sizeBuf = createDynamicBuffer(this.sizeData.byteLength, 2, 1);
        this.bufferTamanos = this.sizeBuf;

        gl.bindVertexArray(null);
    }

    _inicializarBuffers() {
        this._initBuffers();
    }

    /**
     * Emite una nueva partícula volumétrica.
     * @param {Array<number>} pos 
     * @param {Array<number>} vel 
     * @param {Array<number>} color 
     * @param {number} size 
     * @param {number} life 
     * @param {number} [growRate=0.8] 
     */
    spawn(pos, vel, color, size, life, growRate = 0.8) {
        for (let k = 0; k < this.maxParticles; k++) {
            const idx = (this.nextParticleIdx + k) % this.maxParticles;
            const p = this.particles[idx];

            if (!p.active) {
                p.active = true;
                p.activa = true;

                p.pos[0] = pos[0]; p.pos[1] = pos[1]; p.pos[2] = pos[2];
                p.vel[0] = vel[0]; p.vel[1] = vel[1]; p.vel[2] = vel[2];
                p.color[0] = color[0]; p.color[1] = color[1]; p.color[2] = color[2]; p.color[3] = color[3];

                p.size = size;
                p.tamano = size;
                p.growRate = growRate;
                p.tasaCrecimiento = growRate;
                p.age = 0;
                p.edad = 0;
                p.life = life;
                p.vida = life;

                this.nextParticleIdx = (idx + 1) % this.maxParticles;
                this.siguienteIndiceParticula = this.nextParticleIdx;
                return;
            }
        }
    }

    generar(pos, vel, color, tamano, vida, tasaCrecimiento = 0.8) {
        this.spawn(pos, vel, color, tamano, vida, tasaCrecimiento);
    }

    /**
     * Integra cinemática y actualiza los buffers dinámicos con gl.bufferSubData.
     * @param {number} dt 
     * @returns {number} Cantidad de partículas activas
     */
    update(dt) {
        let activeCount = 0;

        for (let i = 0; i < this.maxParticles; i++) {
            const p = this.particles[i];
            if (!p.active) continue;

            p.age += dt;
            p.edad = p.age;

            if (p.age >= p.life) {
                p.active = false;
                p.activa = false;
                continue;
            }

            p.pos[0] += p.vel[0] * dt;
            p.pos[1] += p.vel[1] * dt;
            p.pos[2] += p.vel[2] * dt;

            const progress = p.age / p.life;
            const alphaCurve = Math.sin(progress * Math.PI);

            this.posData.set(p.pos, activeCount * 3);
            this.colData.set([
                p.color[0],
                p.color[1],
                p.color[2],
                p.color[3] * alphaCurve
            ], activeCount * 4);
            this.sizeData[activeCount] = p.size * (1.0 + progress * p.growRate);

            activeCount++;
        }

        if (activeCount > 0) {
            const gl = this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.posData.subarray(0, activeCount * 3));

            gl.bindBuffer(gl.ARRAY_BUFFER, this.colBuf);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.colData.subarray(0, activeCount * 4));

            gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuf);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.sizeData.subarray(0, activeCount));
        }

        return activeCount;
    }

    actualizar(dt) {
        return this.update(dt);
    }

    draw(gl, material, viewMatrix, projMatrix, activeCount) {
        if (activeCount <= 0) return;

        material.use();
        material.setCamera(viewMatrix, projMatrix);

        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.POINTS, 0, activeCount);
        gl.bindVertexArray(null);
    }

    dibujar(gl, material, matrizVista, matrizProyeccion, cantidadActivas) {
        this.draw(gl, material, matrizVista, matrizProyeccion, cantidadActivas);
    }

    reset() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles[i].active = false;
            this.particles[i].activa = false;
        }
        this.nextParticleIdx = 0;
        this.siguienteIndiceParticula = 0;
    }

    reiniciar() {
        this.reset();
    }

    destroy() {
        const gl = this.gl;
        if (this.vao) gl.deleteVertexArray(this.vao);
        if (this.posBuf) gl.deleteBuffer(this.posBuf);
        if (this.colBuf) gl.deleteBuffer(this.colBuf);
        if (this.sizeBuf) gl.deleteBuffer(this.sizeBuf);
    }

    destruir() {
        this.destroy();
    }
}

window.ParticleSystem = ParticleSystem;
window.SistemaParticulas = ParticleSystem;
