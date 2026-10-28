/**
 * js/core/Geometry.js
 * Creación y bind de VBOs, IBOs y VAOs (createMeshVAO).
 */

"use strict";

class Geometry {
    /**
     * @param {Float32Array} [positions=null] - Coordenadas (x, y, z)
     * @param {Float32Array} [normals=null] - Normales (nx, ny, nz)
     * @param {Float32Array} [colors=null] - Colores (r, g, b)
     * @param {Uint16Array} [indices=null] - Índices de triángulos
     */
    constructor(positions = null, normals = null, colors = null, indices = null) {
        this.positions = positions;
        this.posiciones = positions;

        this.normals = normals;
        this.normales = normals;

        this.colors = colors;
        this.colores = colors;

        this.indices = indices;

        this.vao = null;
        this.vertexBuffer = null;
        this.bufferVertices = null;
        this.normalBuffer = null;
        this.bufferNormales = null;
        this.colorBuffer = null;
        this.bufferColores = null;
        this.indexBuffer = null;
        this.bufferIndices = null;

        this.indexCount = indices ? indices.length : 0;
        this.cantidadIndices = this.indexCount;
        this.vertexCount = positions ? positions.length / 3 : 0;
        this.cantidadVertices = this.vertexCount;
    }

    /**
     * Crea y configura el Vertex Array Object (VAO), VBOs e IBO (createMeshVAO).
     * @param {WebGL2RenderingContext} gl 
     * @returns {Geometry}
     */
    createMeshVAO(gl) {
        if (this.vao) return this;

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        const bindAttribute = (data, location, size) => {
            if (!data) return null;
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
            return buffer;
        };

        // Layout locations: 0=pos, 1=normal, 2=color
        this.vertexBuffer = bindAttribute(this.positions, 0, 3);
        this.bufferVertices = this.vertexBuffer;

        this.normalBuffer = bindAttribute(this.normals, 1, 3);
        this.bufferNormales = this.normalBuffer;

        this.colorBuffer = bindAttribute(this.colors, 2, 3);
        this.bufferColores = this.colorBuffer;

        if (this.indices) {
            this.indexBuffer = gl.createBuffer();
            this.bufferIndices = this.indexBuffer;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
            this.indexCount = this.indices.length;
            this.cantidadIndices = this.indexCount;
        }

        gl.bindVertexArray(null);
        return this;
    }

    initBuffers(gl) {
        return this.createMeshVAO(gl);
    }

    inicializarBuffers(gl) {
        return this.createMeshVAO(gl);
    }

    bind(gl) {
        if (!this.vao) this.createMeshVAO(gl);
        gl.bindVertexArray(this.vao);
    }

    vincular(gl) {
        this.bind(gl);
    }

    draw(gl, mode = gl.TRIANGLES) {
        this.bind(gl);
        if (this.indices) {
            gl.drawElements(mode, this.indexCount, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawArrays(mode, 0, this.vertexCount);
        }
        gl.bindVertexArray(null);
    }

    dibujar(gl, modo) {
        this.draw(gl, modo);
    }

    destroy(gl) {
        if (this.vao) gl.deleteVertexArray(this.vao);
        if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer);
        if (this.normalBuffer) gl.deleteBuffer(this.normalBuffer);
        if (this.colorBuffer) gl.deleteBuffer(this.colorBuffer);
        if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer);
        this.vao = null;
    }

    destruir(gl) {
        this.destroy(gl);
    }
}

window.Geometry = Geometry;
window.Geometria = Geometry;
