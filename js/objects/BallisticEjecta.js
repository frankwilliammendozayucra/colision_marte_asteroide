/**
 * js/objects/BallisticEjecta.js
 * Física parabólica de los 26 fragmentos de roca/hielo y sus estelas (ejectaList).
 */

"use strict";

class BallisticEjecta {
    /**
     * @param {Geometry|AsteroidGeometry} rockGeometry 
     * @param {Geometry|AsteroidGeometry} iceGeometry 
     * @param {number} [numEjecta=26] 
     */
    constructor(rockGeometry, iceGeometry, numEjecta = 26) {
        this.rockGeometry = rockGeometry;
        this.geometriaRoca = rockGeometry;
        this.iceGeometry = iceGeometry;
        this.geometriaHielo = iceGeometry;
        this.numEjecta = numEjecta;
        this.cantidadEyecta = numEjecta;

        this.ejectaList = [];
        this.listaEyecta = this.ejectaList;
    }

    /**
     * Inicializa los fragmentos eyectados alrededor del punto de colisión.
     * @param {Array<number>} impactWorldPos 
     * @param {Array<number>} impactNormal 
     */
    init(impactWorldPos, impactNormal) {
        this.ejectaList = [];
        this.listaEyecta = this.ejectaList;

        const upRef = Math.abs(impactNormal[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        const t1 = Vector3.normalize(Vector3.cross(upRef, impactNormal));
        const t2 = Vector3.cross(impactNormal, t1);

        for (let i = 0; i < this.numEjecta; i++) {
            const isIce = (i % 4 === 0);
            const angle = (i / this.numEjecta) * Math.PI * 2.0 + (Math.random() - 0.5) * 0.25;
            const dispersion = 0.55 + Math.random() * 0.75;
            const elevation = 0.65 + Math.random() * 0.65;

            const dir = Vector3.normalize([
                impactNormal[0] * elevation + (t1[0] * Math.cos(angle) + t2[0] * Math.sin(angle)) * dispersion,
                impactNormal[1] * elevation + (t1[1] * Math.cos(angle) + t2[1] * Math.sin(angle)) * dispersion,
                impactNormal[2] * elevation + (t1[2] * Math.cos(angle) + t2[2] * Math.sin(angle)) * dispersion
            ]);

            const speed = 1.15 + Math.random() * 1.45;
            const frag = {
                active: true,
                activa: true,
                isIce,
                esHielo: isIce,
                pos: [
                    impactWorldPos[0] + dir[0] * 0.25,
                    impactWorldPos[1] + dir[1] * 0.25,
                    impactWorldPos[2] + dir[2] * 0.25
                ],
                vel: [dir[0] * speed, dir[1] * speed, dir[2] * speed],
                scale: isIce ? (1.1 + Math.random() * 0.9) : (0.7 + Math.random() * 1.1),
                escala: 1.0,
                rotSpeed: [Math.random() * 5, Math.random() * 5, Math.random() * 5],
                velocidadRotacion: [0, 0, 0],
                age: 0,
                edad: 0,
                maxLife: 4.5 + Math.random() * 3.0,
                vidaMaxima: 5.0
            };
            frag.escala = frag.scale;
            frag.velocidadRotacion = frag.rotSpeed;
            frag.vidaMaxima = frag.maxLife;

            this.ejectaList.push(frag);
        }
    }

    inicializar(posMundo, normal) {
        this.init(posMundo, normal);
    }

    /**
     * Integra la trayectoria balística sujeta a la gravedad marciana y emite estelas.
     * @param {number} dt 
     * @param {boolean} isRunning 
     * @param {ParticleSystem} particleSystem 
     */
    update(dt, isRunning, particleSystem) {
        if (!isRunning) return;

        for (let i = 0; i < this.ejectaList.length; i++) {
            const ej = this.ejectaList[i];
            if (!ej.active) continue;

            ej.age += dt;
            ej.edad = ej.age;

            if (ej.age >= ej.maxLife) {
                ej.active = false;
                ej.activa = false;
                continue;
            }

            // Gravedad radial hacia el centro de Marte
            const toCenter = Vector3.normalize(ej.pos);
            ej.vel[0] -= toCenter[0] * 0.22 * dt;
            ej.vel[1] -= toCenter[1] * 0.22 * dt;
            ej.vel[2] -= toCenter[2] * 0.22 * dt;

            ej.pos[0] += ej.vel[0] * dt;
            ej.pos[1] += ej.vel[1] * dt;
            ej.pos[2] += ej.vel[2] * dt;

            if (particleSystem) {
                // Estela blanca / azulada para hielo o roca
                particleSystem.spawn(
                    [ej.pos[0], ej.pos[1], ej.pos[2]],
                    [-ej.vel[0] * 0.08, -ej.vel[1] * 0.08, -ej.vel[2] * 0.08],
                    ej.isIce ? [0.85, 0.95, 1.0, 0.75] : [0.95, 0.93, 0.90, 0.82],
                    135.0 * ej.scale,
                    0.85,
                    1.4
                );

                if (!ej.isIce && Math.random() < 0.45) {
                    particleSystem.spawn(
                        [ej.pos[0], ej.pos[1], ej.pos[2]],
                        [0, 0, 0],
                        [1.0, 0.65, 0.15, 0.95],
                        95.0 * ej.scale,
                        0.25,
                        0.5
                    );
                }
            }
        }
    }

    actualizar(dt, corriendo, particulas) {
        this.update(dt, corriendo, particulas);
    }

    /**
     * Dibuja los fragmentos balísticos en vuelo.
     * @param {WebGL2RenderingContext} gl 
     * @param {MarsCrackMaterial} material 
     */
    draw(gl, material) {
        for (let i = 0; i < this.ejectaList.length; i++) {
            const ej = this.ejectaList[i];
            if (!ej.active) continue;

            let model = Matrix4.translation(ej.pos[0], ej.pos[1], ej.pos[2]);
            model = Matrix4.multiply(model, Matrix4.rotationX(ej.age * ej.rotSpeed[0]));
            model = Matrix4.multiply(model, Matrix4.rotationY(ej.age * ej.rotSpeed[1]));
            model = Matrix4.multiply(model, Matrix4.scaling(ej.scale, ej.scale, ej.scale));

            if (ej.isIce) {
                material.setMeshProperties({
                    model: model,
                    meshType: 2,
                    alpha: 1.0,
                    shininess: 90.0,
                    emissive: 0.45,
                    tintColor: [0.85, 0.96, 1.1]
                });
                if (this.iceGeometry) this.iceGeometry.draw(gl);
            } else {
                material.setMeshProperties({
                    model: model,
                    meshType: 2,
                    alpha: 1.0,
                    shininess: 8.0,
                    emissive: 0.85,
                    tintColor: [1.2, 0.7, 0.35]
                });
                if (this.rockGeometry) this.rockGeometry.draw(gl);
            }
        }
    }

    dibujar(gl, material) {
        this.draw(gl, material);
    }

    reset() {
        this.ejectaList = [];
        this.listaEyecta = this.ejectaList;
    }

    reiniciar() {
        this.reset();
    }
}

window.BallisticEjecta = BallisticEjecta;
window.EyeccionBalistica = BallisticEjecta;
