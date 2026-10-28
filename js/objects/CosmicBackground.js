/**
 * js/objects/CosmicBackground.js
 * Generador estático de las 600 estrellas y las 2 galaxias espirales (populateSpiralGalaxy).
 */

"use strict";

class CosmicBackground {
    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {number} [numStars=600] 
     * @param {number} [totalPoints=1400] 
     */
    constructor(gl, numStars = 600, totalPoints = 1400) {
        this.gl = gl;
        this.numStars = numStars;
        this.cantidadEstrellas = numStars;
        this.totalPoints = totalPoints;
        this.totalPuntos = totalPoints;

        this.posData = new Float32Array(this.totalPoints * 3);
        this.datosPosicion = this.posData;
        this.colData = new Float32Array(this.totalPoints * 4);
        this.datosColor = this.colData;
        this.sizeData = new Float32Array(this.totalPoints);
        this.datosTamano = this.sizeData;

        this.vao = null;
        this.posBuf = null;
        this.colBuf = null;
        this.sizeBuf = null;

        this._generateCosmos();
        this._initBuffers();
    }

    _generateCosmos() {
        // 1. Campo esférico de 600 estrellas lejanas
        for (let i = 0; i < this.numStars; i++) {
            const theta = Math.acos(2.0 * Math.random() - 1.0);
            const phi = Math.random() * Math.PI * 2.0;
            const radius = 38.0 + Math.random() * 15.0;

            this.posData.set([
                radius * Math.sin(theta) * Math.cos(phi),
                radius * Math.cos(theta),
                radius * Math.sin(theta) * Math.sin(phi)
            ], i * 3);

            const brightness = 0.6 + Math.random() * 0.4;
            this.colData.set([brightness, brightness, brightness + 0.1, 1.0], i * 4);
            this.sizeData[i] = 35.0 + Math.random() * 65.0;
        }


    }

    /**
     * Construye una estructura galáctica con brazos espirales logarítmicos.
     * @param {number} startIndex 
     * @param {number} count 
     * @param {Array<number>} centerPos 
     * @param {number} normalTilt 
     * @param {Array<number>} coreColor 
     * @param {Array<number>} armColor 
     * @param {number} radiusScale 
     */
    populateSpiralGalaxy(startIndex, count, centerPos, normalTilt, coreColor, armColor, radiusScale) {
        for (let i = 0; i < count; i++) {
            const idx = startIndex + i;
            const arm = i % 2;
            const t = Math.pow(Math.random(), 0.75);
            const angle = t * Math.PI * 3.5 + (arm * Math.PI) + (Math.random() - 0.5) * 0.55;
            const dist = t * radiusScale;

            const lx = Math.cos(angle) * dist;
            const ly = Math.sin(angle) * dist * 0.62;
            const lz = (Math.random() - 0.5) * 0.4;

            this.posData.set([
                centerPos[0] + lx,
                centerPos[1] + ly * Math.cos(normalTilt) - lz * Math.sin(normalTilt),
                centerPos[2] + ly * Math.sin(normalTilt) + lz * Math.cos(normalTilt)
            ], idx * 3);

            const mixFactor = 1.0 - t;
            this.colData.set([
                coreColor[0] * mixFactor + armColor[0] * t,
                coreColor[1] * mixFactor + armColor[1] * t,
                coreColor[2] * mixFactor + armColor[2] * t,
                (1.0 - t * 0.65) * 0.85
            ], idx * 4);

            this.sizeData[idx] = (1.0 - t) * 280.0 + 95.0;
        }
    }

    _poblarGalaxiaEspiral(startIndex, count, centerPos, normalTilt, coreColor, armColor, radiusScale) {
        this.populateSpiralGalaxy(startIndex, count, centerPos, normalTilt, coreColor, armColor, radiusScale);
    }

    _initBuffers() {
        const gl = this.gl;
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        const bindStaticBuffer = (data, location, size) => {
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
            return buffer;
        };

        this.posBuf = bindStaticBuffer(this.posData, 0, 3);
        this.bufferPosiciones = this.posBuf;

        this.colBuf = bindStaticBuffer(this.colData, 1, 4);
        this.bufferColores = this.colBuf;

        this.sizeBuf = bindStaticBuffer(this.sizeData, 2, 1);
        this.bufferTamanos = this.sizeBuf;

        gl.bindVertexArray(null);
    }

    _inicializarBuffers() {
        this._initBuffers();
    }

    draw(gl, material, viewMatrix, projMatrix) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.depthMask(false);

        material.use();
        material.setCamera(viewMatrix, projMatrix);

        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.POINTS, 0, this.totalPoints);
        gl.bindVertexArray(null);

        gl.depthMask(true);
        gl.disable(gl.BLEND);
    }

    dibujar(gl, material, matrizVista, matrizProyeccion) {
        this.draw(gl, material, matrizVista, matrizProyeccion);
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

window.CosmicBackground = CosmicBackground;
window.FondoCosmico = CosmicBackground;
