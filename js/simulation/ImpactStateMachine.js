/**
 * js/simulation/ImpactStateMachine.js
 * Máquina de estados de las 5 fases temporales y controladores de botones del HUD.
 * 
 * Fases temporales:
 *  - Fase 1: Marte Primitivo (Hidrosfera Activa) [0 - 4s]
 *  - Fase 2: Entrada Atmosférica del Asteroide [4 - 7.5s]
 *  - Fase 3: Impacto Cataclísmico y Choque Térmico [7.5 - 11.2s]
 *  - Fase 4: Onda de Choque Global y Evaporación de Océanos [11.2 - 18s]
 *  - Fase 5: Marte Desértico (0% Agua / Arena Roja y Hielo Espacial) [18s+]
 */

"use strict";

const MARS_RADIUS = 2.0;
const WATER_INITIAL_RADIUS = 2.045;

window.MARS_RADIUS = MARS_RADIUS;
window.RADIO_MARTE = MARS_RADIUS;
window.WATER_INITIAL_RADIUS = WATER_INITIAL_RADIUS;
window.RADIO_INICIAL_AGUA = WATER_INITIAL_RADIUS;

class ImpactStateMachine {
    constructor() {
        this.running = true;
        this.ejecutando = true;

        this.time = 0.0;
        this.tiempo = 0.0;

        this.marsAngleY = 0.0;
        this.anguloYMarte = 0.0;

        // Porcentajes de agua y biosfera
        this.waterPercentage = 100.0;
        this.porcentajeAgua = 100.0;
        this.bioPercentage = 100.0;
        this.porcentajeBio = 100.0;

        this.waterRadius = WATER_INITIAL_RADIUS;
        this.radioAgua = WATER_INITIAL_RADIUS;
        this.waterAlpha = 0.76;
        this.alfaAgua = 0.76;

        // Parámetros de energía e impacto
        this.impactIntensity = 0.0;
        this.intensidadImpacto = 0.0;
        this.craterDepth = 0.0;
        this.profundidadCrater = 0.0;
        this.craterHeat = 0.0;
        this.calorCrater = 0.0;
        this.desertification = 0.0;
        this.desertificacion = 0.0;

        // Onda de choque
        this.shockwaveAngle = -1.0;
        this.anguloOndaChoque = -1.0;
        this.shockwaveIntensity = 0.0;
        this.intensidadOndaChoque = 0.0;

        this.explosionSpawned = false;
        this.explosionGenerada = false;
        this.camShakeIntensity = 0.0;
        this.intensidadTemblor = 0.0;

        // Configuración geométrica del impacto
        this.impactLocalAngleX = -0.35;
        this.meteorStartPos = [6.5, 4.2, 7.5];

        this._impactLocalDir = [
            0.0,
            -Math.sin(this.impactLocalAngleX),
             Math.cos(this.impactLocalAngleX)
        ];
        this._dirLocalImpacto = this._impactLocalDir;

        this._tangent1 = [1.0, 0.0, 0.0];
        this._tangent2 = Vector3.cross(this._impactLocalDir, this._tangent1);

        this.lastDt = 0.016;
        this.ultimoDt = 0.016;
    }

    getImpactLocalDirection() {
        return this._impactLocalDir;
    }

    obtenerDireccionLocalImpacto() {
        return this.getImpactLocalDirection();
    }

    getImpactWorldPosition(radialOffset = 0.0) {
        const totalRadius = MARS_RADIUS + radialOffset;
        const dir = this._impactLocalDir;
        const lx = dir[0] * totalRadius;
        const ly = dir[1] * totalRadius;
        const lz = dir[2] * totalRadius;

        const cosY = Math.cos(this.marsAngleY);
        const sinY = Math.sin(this.marsAngleY);
        return [
            lx * cosY + lz * sinY,
            ly,
            -lx * sinY + lz * cosY
        ];
    }

    obtenerPosicionMundoImpacto(despl = 0.0) {
        return this.getImpactWorldPosition(despl);
    }

    getPointOnShockwaveRing(angle) {
        const phi = Math.random() * Math.PI * 2.0;
        const sinA = Math.sin(angle);
        const cosA = Math.cos(angle);
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);

        const dir = this._impactLocalDir;
        const t1 = this._tangent1;
        const t2 = this._tangent2;
        const lx = cosA * dir[0] + sinA * (cosP * t1[0] + sinP * t2[0]);
        const ly = cosA * dir[1] + sinA * (cosP * t1[1] + sinP * t2[1]);
        const lz = cosA * dir[2] + sinA * (cosP * t1[2] + sinP * t2[2]);

        const cosY = Math.cos(this.marsAngleY);
        const sinY = Math.sin(this.marsAngleY);
        return [
            lx * cosY + lz * sinY,
            ly,
            -lx * sinY + lz * cosY
        ];
    }

    obtenerPuntoEnAnilloOndaMundo(angulo) {
        return this.getPointOnShockwaveRing(angulo);
    }

    togglePlayPause() {
        this.running = !this.running;
        this.ejecutando = this.running;
        return this.running;
    }

    alternarReproduccionPausa() {
        return this.togglePlayPause();
    }

    reset(particleSystem, ballisticEjecta) {
        this.running = true;
        this.ejecutando = true;

        this.time = 0.0;
        this.tiempo = 0.0;

        this.marsAngleY = 0.0;
        this.anguloYMarte = 0.0;

        this.waterPercentage = 100.0;
        this.porcentajeAgua = 100.0;
        this.bioPercentage = 100.0;
        this.porcentajeBio = 100.0;

        this.waterRadius = WATER_INITIAL_RADIUS;
        this.radioAgua = WATER_INITIAL_RADIUS;
        this.waterAlpha = 0.76;
        this.alfaAgua = 0.76;

        this.impactIntensity = 0.0;
        this.intensidadImpacto = 0.0;
        this.craterDepth = 0.0;
        this.profundidadCrater = 0.0;
        this.craterHeat = 0.0;
        this.calorCrater = 0.0;
        this.desertification = 0.0;
        this.desertificacion = 0.0;

        this.shockwaveAngle = -1.0;
        this.anguloOndaChoque = -1.0;
        this.shockwaveIntensity = 0.0;
        this.intensidadOndaChoque = 0.0;

        this.explosionSpawned = false;
        this.explosionGenerada = false;
        this.camShakeIntensity = 0.0;
        this.intensidadTemblor = 0.0;

        if (particleSystem) particleSystem.reset();
        if (ballisticEjecta) ballisticEjecta.reset();
    }

    reiniciar(particulas, bloques) {
        this.reset(particulas, bloques);
    }

    /**
     * Avanza la simulación dt segundos y devuelve el estado visual para el renderizador y el HUD.
     * @param {number} dt 
     * @param {ParticleSystem} [particleSystem] 
     * @param {BallisticEjecta} [ballisticEjecta] 
     * @returns {Object} frameData
     */
    update(dt, particleSystem, ballisticEjecta) {
        if (this.running) {
            this.time += dt;
            this.tiempo = this.time;

            this.marsAngleY += dt * 0.32;
            this.anguloYMarte = this.marsAngleY;

            this.camShakeIntensity = Math.max(0.0, this.camShakeIntensity - dt * 0.45);
            this.intensidadTemblor = this.camShakeIntensity;
        }

        const t = this.time;
        let phaseName = '';
        let showMeteor = false;
        let meteorPos = [0, 0, 0];

        const impactWorldPos = this.getImpactWorldPosition(0.015);
        const impactNormal = Vector3.normalize(impactWorldPos);

        let shockwaveAngle = -1.0;
        let shockwaveIntensity = 0.0;

        /* FASE 1: Marte Primitivo [0 - 4s] */
        if (t < 4.0) {
            phaseName = 'Fase 1: Marte Primitivo (Hidrosfera Activa)';

            this.waterPercentage = 100.0;
            this.bioPercentage = 100.0;
            this.waterRadius = WATER_INITIAL_RADIUS;
            this.waterAlpha = 0.76;
            this.impactIntensity = 0.0;
            this.craterDepth = 0.0;
            this.craterHeat = 0.0;
            this.desertification = 0.0;
            shockwaveAngle = -1.0;
        }
        /* FASE 2: Entrada Atmosférica del Asteroide [4 - 7.5s] */
        else if (t < 7.5) {
            phaseName = 'Fase 2: Entrada Atmosférica del Asteroide';
            showMeteor = true;

            const progress = (t - 4.0) / 3.5;
            const start = this.meteorStartPos;
            const end = impactWorldPos;

            meteorPos = [
                start[0] * (1.0 - progress) + end[0] * progress,
                start[1] * (1.0 - progress) + end[1] * progress,
                start[2] * (1.0 - progress) + end[2] * progress
            ];

            this.impactIntensity = progress * progress * 1.8;
            this.craterDepth = 0.0;
            this.craterHeat = 0.0;
            this.desertification = 0.0;
            shockwaveAngle = -1.0;

            if (this.running && particleSystem) {
                for (let i = 0; i < 6; i++) {
                    const jitter = () => (Math.random() - 0.5) * 0.38;
                    particleSystem.spawn(
                        [meteorPos[0] + jitter(), meteorPos[1] + jitter(), meteorPos[2] + jitter()],
                        [jitter() * 1.4, jitter() * 1.4, jitter() * 1.4],
                        [1.0, 0.48 + Math.random() * 0.4, 0.12, 0.95],
                        150.0 + Math.random() * 90.0,
                        0.45 + Math.random() * 0.35,
                        0.8
                    );
                }
            }
        }
        /* FASES 3 Y 4: Impacto y Onda de Choque Global [7.5 - 18s] */
        else if (t < 18.0) {
            const progress = (t - 7.5) / 10.5;

            phaseName = (progress < 0.35)
                ? 'Fase 3: Impacto Cataclísmico y Choque Térmico'
                : 'Fase 4: Onda de Choque Global y Evaporación de Océanos';

            this.craterDepth = Math.min(1.0, progress * 4.0);
            this.craterHeat = Math.max(0.0, 1.0 - progress * 1.6);

            shockwaveAngle = progress * (Math.PI + 0.15);
            shockwaveIntensity = Math.sin(Math.min(1.0, progress) * Math.PI) * 1.35
                               + (1.0 - progress) * 0.45;

            const clampedAngle = Math.min(Math.PI, shockwaveAngle);
            this.waterPercentage = ((1.0 + Math.cos(clampedAngle)) * 0.5) * 100.0;
            this.bioPercentage = this.waterPercentage;
            this.waterRadius = WATER_INITIAL_RADIUS;
            this.waterAlpha = 0.76;

            this.desertification = Math.min(1.0, progress * 1.5);
            this.impactIntensity = 7.0 * Math.pow(Math.max(0.0, 1.0 - progress * 2.5), 1.6);

            // Explosión inicial única
            if (this.running && !this.explosionSpawned) {
                this.explosionSpawned = true;
                this.explosionGenerada = true;
                this.camShakeIntensity = 0.32;

                if (ballisticEjecta && ballisticEjecta.init) {
                    ballisticEjecta.init(impactWorldPos, impactNormal);
                }

                if (particleSystem) {
                    for (let i = 0; i < 140; i++) {
                        const rndDir = Vector3.normalize([
                            impactNormal[0] + (Math.random() - 0.5) * 1.5,
                            impactNormal[1] + (Math.random() - 0.5) * 1.5,
                            impactNormal[2] + (Math.random() - 0.5) * 1.5
                        ]);
                        const speed = 1.2 + Math.random() * 2.8;
                        particleSystem.spawn(
                            [impactWorldPos[0], impactWorldPos[1], impactWorldPos[2]],
                            [rndDir[0] * speed, rndDir[1] * speed, rndDir[2] * speed],
                            [1.0, 0.35 + Math.random() * 0.55, 0.08, 1.0],
                            160.0 + Math.random() * 130.0,
                            1.0 + Math.random() * 1.1,
                            1.8
                        );
                    }
                }
            }

            // Emisión sobre el frente de la onda
            if (this.running && clampedAngle > 0.08 && clampedAngle < Math.PI - 0.08) {
                if (particleSystem) {
                    for (let i = 0; i < 4; i++) {
                        const ringPt = this.getPointOnShockwaveRing(clampedAngle);
                        const spd = 0.28 + Math.random() * 0.45;
                        particleSystem.spawn(
                            [ringPt[0] * MARS_RADIUS, ringPt[1] * MARS_RADIUS, ringPt[2] * MARS_RADIUS],
                            [ringPt[0] * spd, ringPt[1] * spd, ringPt[2] * spd],
                            [0.82, 0.95, 1.0, 0.65],
                            115.0 + Math.random() * 85.0,
                            1.6 + Math.random() * 1.2,
                            -0.12
                        );
                    }
                }
            }
        }
        /* FASE 5: Marte Desértico Final (0% Agua) [18s+] */
        else {
            phaseName = 'Fase 5: Marte Desértico (0% Agua / Arena Roja y Hielo Espacial)';

            this.craterDepth = 1.0;
            this.craterHeat = 0.0;
            this.desertification = 1.0;
            this.impactIntensity = 0.0;
            this.waterPercentage = 0.0;
            this.bioPercentage = 0.0;
            this.waterAlpha = 0.0;

            shockwaveAngle = Math.PI + 0.5;
            shockwaveIntensity = 0.0;
        }

        // Sincronizar propiedades en español e inglés
        this.porcentajeAgua = this.waterPercentage;
        this.porcentajeBio = this.bioPercentage;
        this.radioAgua = this.waterRadius;
        this.alfaAgua = this.waterAlpha;
        this.intensidadImpacto = this.impactIntensity;
        this.profundidadCrater = this.craterDepth;
        this.calorCrater = this.craterHeat;
        this.desertificacion = this.desertification;
        this.anguloOndaChoque = shockwaveAngle;
        this.shockwaveAngle = shockwaveAngle;
        this.intensidadOndaChoque = shockwaveIntensity;
        this.shockwaveIntensity = shockwaveIntensity;

        const shake = this.camShakeIntensity > 0.001 ? [
            Math.sin(t * 55.0) * this.camShakeIntensity,
            Math.cos(t * 62.0) * this.camShakeIntensity,
            Math.sin(t * 48.0) * this.camShakeIntensity
        ] : [0, 0, 0];

        return {
            phaseName,
            nombreFase: phaseName,
            showMeteor,
            mostrarMeteoro: showMeteor,
            meteorPos,
            posMeteoro: meteorPos,
            impactLocalDir: this._impactLocalDir,
            dirLocalImpacto: this._impactLocalDir,
            impactWorldPos,
            posMundoImpacto: impactWorldPos,
            shockwaveAngle,
            anguloOndaChoque: shockwaveAngle,
            shockwaveIntensity,
            intensidadOndaChoque: shockwaveIntensity,
            craterDepth: this.craterDepth,
            profundidadCrater: this.craterDepth,
            craterHeat: this.craterHeat,
            calorCrater: this.craterHeat,
            showWater: this.waterPercentage > 0.05,
            mostrarAgua: this.waterPercentage > 0.05,
            camShake: shake,
            temblorCamara: shake
        };
    }

    actualizar(dt, particulas, bloques) {
        return this.update(dt, particulas, bloques);
    }
}

window.ImpactStateMachine = ImpactStateMachine;
window.MaquinaEstadosImpacto = ImpactStateMachine;
