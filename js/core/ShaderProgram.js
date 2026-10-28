/**
 * js/core/ShaderProgram.js
 * Compilación y enlazado manual (createShader, createProgram) y caché de Uniforms.
 */

"use strict";

class ShaderProgram {
    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {string} vsSource 
     * @param {string} fsSource 
     */
    constructor(gl, vsSource, fsSource) {
        this.gl = gl;
        this.program = this.createProgram(vsSource, fsSource);
        this.programa = this.program;

        // Caché de uniformes y atributos para optimizar llamadas por fotograma
        this.uniformLocations = new Map();
        this.ubicacionesUniforms = this.uniformLocations;
        this.attribLocations = new Map();
        this.ubicacionesAtributos = this.attribLocations;
    }

    /**
     * Compila un sombreador individual (Vertex o Fragment).
     * @param {number} type - gl.VERTEX_SHADER o gl.FRAGMENT_SHADER
     * @param {string} source 
     * @returns {WebGLShader}
     */
    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            const typeName = type === gl.VERTEX_SHADER ? 'VERTEX_SHADER' : 'FRAGMENT_SHADER';
            throw new Error(`[ShaderProgram] Error compilando ${typeName}:\n${info}`);
        }
        return shader;
    }

    _compilarShader(tipo, fuente) {
        return this.createShader(tipo, fuente);
    }

    /**
     * Enlaza el vertex y fragment shader en un WebGLProgram.
     * @param {string} vsSource 
     * @param {string} fsSource 
     * @returns {WebGLProgram}
     */
    createProgram(vsSource, fsSource) {
        const gl = this.gl;
        const vs = this.createShader(gl.VERTEX_SHADER, vsSource);
        const fs = this.createShader(gl.FRAGMENT_SHADER, fsSource);
        const program = gl.createProgram();

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`[ShaderProgram] Error enlazando programa:\n${info}`);
        }

        gl.detachShader(program, vs);
        gl.detachShader(program, fs);
        gl.deleteShader(vs);
        gl.deleteShader(fs);

        return program;
    }

    _crearPrograma(vs, fs) {
        return this.createProgram(vs, fs);
    }

    use() {
        this.gl.useProgram(this.program);
    }

    usar() {
        this.use();
    }

    getUniformLocation(name) {
        if (!this.uniformLocations.has(name)) {
            const loc = this.gl.getUniformLocation(this.program, name);
            this.uniformLocations.set(name, loc);
        }
        return this.uniformLocations.get(name);
    }

    obtenerUbicacionUniform(nombre) {
        return this.getUniformLocation(nombre);
    }

    getAttribLocation(name) {
        if (!this.attribLocations.has(name)) {
            const loc = this.gl.getAttribLocation(this.program, name);
            this.attribLocations.set(name, loc);
        }
        return this.attribLocations.get(name);
    }

    obtenerUbicacionAtributo(nombre) {
        return this.getAttribLocation(nombre);
    }

    setUniform1i(name, value) {
        const loc = this.getUniformLocation(name);
        if (loc !== null) this.gl.uniform1i(loc, value);
    }

    establecerUniform1i(nombre, valor) {
        this.setUniform1i(nombre, valor);
    }

    setUniform1f(name, value) {
        const loc = this.getUniformLocation(name);
        if (loc !== null) this.gl.uniform1f(loc, value);
    }

    establecerUniform1f(nombre, valor) {
        this.setUniform1f(nombre, valor);
    }

    setUniform3fv(name, value) {
        const loc = this.getUniformLocation(name);
        if (loc !== null) this.gl.uniform3fv(loc, value);
    }

    establecerUniform3fv(nombre, valor) {
        this.setUniform3fv(nombre, valor);
    }

    setUniform4fv(name, value) {
        const loc = this.getUniformLocation(name);
        if (loc !== null) this.gl.uniform4fv(loc, value);
    }

    establecerUniform4fv(nombre, valor) {
        this.setUniform4fv(nombre, valor);
    }

    setUniformMatrix4fv(name, value, transpose = false) {
        const loc = this.getUniformLocation(name);
        if (loc !== null) {
            const data = value.elements || value.elementos || value;
            this.gl.uniformMatrix4fv(loc, transpose, data);
        }
    }

    establecerUniformMatriz4fv(nombre, valor, transponer = false) {
        this.setUniformMatrix4fv(nombre, valor, transponer);
    }
}

window.ShaderProgram = ShaderProgram;
window.ProgramaShader = ShaderProgram;
