/**
 * js/core/Scene.js
 * Contenedor de objetos opacos, transparentes y luces (Sol + Luz puntual de impacto).
 */

"use strict";

class Scene {
    /**
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl) {
        this.gl = gl;
        const marsRadius = window.MARS_RADIUS || 2.0;

        /* 1. Geometrías paramétricas de alta resolución */
        this.marsGeometry = new SphereGeometry(marsRadius, 96, 96, 'mars').createMeshVAO(gl);
        this.geometriaMarte = this.marsGeometry;

        this.waterGeometry = new SphereGeometry(1.0, 64, 64, 'water').createMeshVAO(gl);
        this.geometriaAgua = this.waterGeometry;

        this.meteorGeometry = new SphereGeometry(0.32, 28, 28, 'meteor').createMeshVAO(gl);
        this.geometriaMeteoro = this.meteorGeometry;

        this.rockGeometry = new AsteroidGeometry(0.08, 16, 16, 'debris_rock').createMeshVAO(gl);
        this.geometriaRoca = this.rockGeometry;

        this.iceGeometry = new SphereGeometry(0.068, 16, 16, 'ice').createMeshVAO(gl);
        this.geometriaHielo = this.iceGeometry;

        /* 2. Mallas principales (Objetos opacos y transparentes) */
        this.marsMesh = new Mesh(this.marsGeometry, {
            meshType: 0,
            alpha: 1.0,
            shininess: 4.0,
            emissive: 0.0,
            tintColor: [1.0, 1.0, 1.0]
        });
        this.mallaMarte = this.marsMesh;

        this.waterMesh = new Mesh(this.waterGeometry, {
            meshType: 1,
            alpha: 0.76,
            shininess: 72.0,
            emissive: 0.04,
            tintColor: [1.0, 1.0, 1.0]
        });
        this.mallaAgua = this.waterMesh;

        this.meteorMesh = new Mesh(this.meteorGeometry, {
            meshType: 2,
            alpha: 1.0,
            shininess: 6.0,
            emissive: 0.45,
            tintColor: [1.25, 0.85, 0.60]
        });
        this.mallaMeteoro = this.meteorMesh;

        /* 3. Luces de la escena (Sol + Posición de luz puntual de impacto) */
        this.sunDir = Vector3.normalize([1.0, 0.45, 0.85]);
        this.direccionSol = this.sunDir;
        this.impactLightPos = [0, 0, 0];
        this.posLuzImpacto = this.impactLightPos;

        /* 4. Subsistemas cósmicos, eyección balística y partículas */
        this.cosmicBackground = new CosmicBackground(gl, 600, 1400);
        this.fondoCosmico = this.cosmicBackground;

        this.particleSystem = new ParticleSystem(gl, 900);
        this.sistemaParticulas = this.particleSystem;

        this.ballisticEjecta = new BallisticEjecta(this.rockGeometry, this.iceGeometry, 26);
        this.eyeccionBalistica = this.ballisticEjecta;
        this.sistemaBloques = this.ballisticEjecta;
    }
}

window.Scene = Scene;
window.Escena = Scene;
