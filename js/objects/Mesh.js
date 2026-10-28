/**
 * js/objects/Mesh.js
 * Clase que une una Geometry + Material y ejecuta gl.drawElements(gl.TRIANGLES).
 * Hereda de Object3D para soporte de transformaciones jerárquicas TRS.
 */

"use strict";

class Mesh extends Object3D {
    /**
     * @param {Geometry} geometry 
     * @param {Object} [properties={}] 
     */
    constructor(geometry, properties = {}) {
        super();
        this.geometry = geometry;
        this.geometria = geometry;

        this.meshType = properties.meshType !== undefined ? properties.meshType : (properties.tipoMalla !== undefined ? properties.tipoMalla : 0);
        this.tipoMalla = this.meshType;

        this.alpha = properties.alpha !== undefined ? properties.alpha : (properties.alfa !== undefined ? properties.alfa : 1.0);
        this.alfa = this.alpha;

        this.shininess = properties.shininess !== undefined ? properties.shininess : (properties.brillo !== undefined ? properties.brillo : 16.0);
        this.brillo = this.shininess;

        this.emissive = properties.emissive !== undefined ? properties.emissive : (properties.emisivo !== undefined ? properties.emisivo : 0.0);
        this.emisivo = this.emissive;

        this.tintColor = properties.tintColor ? [...properties.tintColor] : (properties.colorTinte ? [...properties.colorTinte] : [1.0, 1.0, 1.0]);
        this.colorTinte = this.tintColor;

        this.cullFace = properties.cullFace !== undefined ? properties.cullFace : (properties.descartarCarasTraseras !== undefined ? properties.descartarCarasTraseras : true);
        this.descartarCarasTraseras = this.cullFace;
    }

    /**
     * Dibuja la malla asociando sus uniformes al material y despachando gl.drawElements(gl.TRIANGLES).
     * @param {WebGL2RenderingContext} gl 
     * @param {MarsCrackMaterial|ShaderProgram} material 
     * @param {Float32Array|Matrix4} [overrideMatrix=null] 
     */
    draw(gl, material, overrideMatrix = null) {
        if (!this.visible || !this.geometry) return;

        if (this.cullFace) {
            gl.enable(gl.CULL_FACE);
        } else {
            gl.disable(gl.CULL_FACE);
        }

        const modelMatrix = overrideMatrix || this.getMatrix();
        material.setMeshProperties({
            model: modelMatrix,
            meshType: this.meshType,
            alpha: this.alpha,
            shininess: this.shininess,
            emissive: this.emissive,
            tintColor: this.tintColor
        });

        this.geometry.draw(gl, gl.TRIANGLES);
    }

    dibujar(gl, material, matrizReemplazo = null) {
        this.draw(gl, material, matrizReemplazo);
    }
}

window.Mesh = Mesh;
window.Malla = Mesh;
