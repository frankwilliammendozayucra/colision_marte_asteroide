/**
 * js/core/Renderer.js
 * Inicialización del contexto WebGL2, viewport, clear, Z-buffer y Blending.
 */

"use strict";

class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.lienzo = canvas;

        const gl = canvas.getContext('webgl2', {
            antialias: true,
            alpha: false,
            depth: true,
            stencil: false,
            powerPreference: 'high-performance'
        });

        if (!gl) {
            alert('Error: Su navegador o tarjeta gráfica no soporta WebGL 2.0.');
            throw new Error('WebGL 2.0 no disponible en este sistema.');
        }

        this.gl = gl;

        // Configuración inicial del Z-buffer y pipeline
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        gl.clearColor(0.01, 0.015, 0.03, 1.0);
    }

    /**
     * Ajusta el tamaño del lienzo y el viewport a las dimensiones del navegador.
     * @param {PerspectiveCamera} camera 
     */
    resize(camera) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const displayWidth = Math.floor(this.canvas.clientWidth * dpr);
        const displayHeight = Math.floor(this.canvas.clientHeight * dpr);

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.gl.viewport(0, 0, displayWidth, displayHeight);

            if (camera) {
                camera.setAspect(displayWidth / displayHeight);
            }
        }
    }

    redimensionar(camara) {
        this.resize(camara);
    }

    /**
     * Limpia los buffers de color y profundidad.
     */
    clear() {
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    limpiar() {
        this.clear();
    }

    /**
     * Ejecuta el pipeline completo de renderizado.
     * @param {Scene} scene 
     * @param {PerspectiveCamera} camera 
     * @param {OrbitControls} controls 
     * @param {ImpactStateMachine} state 
     * @param {Object} frameData 
     * @param {MarsCrackMaterial} marsMaterial 
     * @param {VolumetricParticleMaterial} particleMaterial 
     */
    render(scene, camera, controls, state, frameData, marsMaterial, particleMaterial) {
        const gl = this.gl;

        this.clear();

        const shake = frameData.camShake || [0, 0, 0];
        const viewMatrix = controls.getViewMatrix(shake);
        const projMatrix = camera.projectionMatrix;
        const eyePos = controls.getEyePosition(shake);

        // 1. FONDO CÓSMICO (Estrellas y galaxias)
        if (scene.cosmicBackground) {
            scene.cosmicBackground.draw(gl, particleMaterial, viewMatrix, projMatrix);
        }

        // 2. OBJETOS OPACOS (Marte y meteorito)
        gl.enable(gl.DEPTH_TEST);
        gl.depthMask(true);
        gl.disable(gl.BLEND);

        marsMaterial.use();
        marsMaterial.setCamera(viewMatrix, projMatrix, eyePos);

        const sunDir = scene.sunDir || [1.0, 0.45, 0.85];
        const impactLightPos = state.getImpactWorldPosition(0.35);
        const impactLocalDir = frameData.impactLocalDir || [0, 0, 1];
        const t = state.time || 0;

        const shockAngle = frameData.shockwaveAngle !== undefined ? frameData.shockwaveAngle : -1.0;
        const shockInt = frameData.shockwaveIntensity !== undefined ? frameData.shockwaveIntensity : 0.0;
        const craterDepth = frameData.craterDepth !== undefined ? frameData.craterDepth : 0.0;
        const craterHeat = frameData.craterHeat !== undefined ? frameData.craterHeat : 0.0;

        const humidityFactor = (state.waterPercentage || 0.0) / 100.0;
        const atmosColor = [
            0.88 * (1.0 - humidityFactor) + 0.30 * humidityFactor,
            0.38 * (1.0 - humidityFactor) + 0.68 * humidityFactor,
            0.18 * (1.0 - humidityFactor) + 1.00 * humidityFactor
        ];

        marsMaterial.setGlobalEnvironment({
            sunDir: sunDir,
            impactLightPos: impactLightPos,
            impactLocalDir: impactLocalDir,
            impactIntensity: state.impactIntensity || 0.0,
            craterDepth: craterDepth,
            craterHeat: craterHeat,
            shockwaveAngle: shockAngle,
            shockwaveIntensity: shockInt,
            time: t
        });

        // 2.1 Globo de Marte
        const angleY = state.marsAngleY !== undefined ? state.marsAngleY : 0.0;
        const marsModel = Matrix4.rotationY(angleY);

        marsMaterial.setMeshProperties({
            model: marsModel,
            isMars: 1,
            isWater: 0,
            alpha: 1.0,
            shininess: 4.0 + 6.0 * humidityFactor,
            emissive: 0.0,
            tintColor: [1.0, 1.0, 1.0],
            fresnelColor: atmosColor,
            fresnelPower: 0.35 + 0.55 * humidityFactor
        });

        const marsMesh = scene.marsMesh;
        gl.enable(gl.CULL_FACE);
        marsMesh.geometry.draw(gl);

        // 2.2 Meteorito en aproximación
        if (frameData.showMeteor) {
            const meteorPos = frameData.meteorPos || [0, 0, 0];
            let meteorModel = Matrix4.translation(meteorPos[0], meteorPos[1], meteorPos[2]);
            meteorModel = Matrix4.multiply(meteorModel, Matrix4.rotationX(t * 3.8));
            meteorModel = Matrix4.multiply(meteorModel, Matrix4.rotationY(t * 2.5));

            marsMaterial.setMeshProperties({
                model: meteorModel,
                isMars: 0,
                isWater: 0,
                alpha: 1.0,
                shininess: 6.0,
                emissive: 0.45,
                tintColor: [1.25, 0.85, 0.60],
                fresnelColor: [1.0, 0.4, 0.1],
                fresnelPower: 1.2
            });

            scene.meteorMesh.geometry.draw(gl);
        }

        // 3. CAPAS TRANSLÚCIDAS (Océano y fragmentos de hielo)
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const showWater = frameData.showWater;
        const waterPercent = state.waterPercentage !== undefined ? state.waterPercentage : 100.0;
        const waterRadius = state.waterRadius || WATER_INITIAL_RADIUS;
        const waterAlpha = state.waterAlpha !== undefined ? state.waterAlpha : 0.76;

        if (showWater && waterPercent > 0.05 && waterAlpha > 0.01) {
            gl.depthMask(false);

            let waterModel = Matrix4.rotationY(angleY);
            waterModel = Matrix4.multiply(waterModel, Matrix4.scaling(waterRadius, waterRadius, waterRadius));

            marsMaterial.setMeshProperties({
                model: waterModel,
                isMars: 0,
                isWater: 1,
                alpha: waterAlpha,
                shininess: 72.0,
                emissive: 0.04,
                tintColor: [1.0, 1.0, 1.0],
                fresnelColor: [0.45, 0.80, 1.0],
                fresnelPower: 0.95
            });

            scene.waterMesh.geometry.draw(gl);
        }

        // 3.2 Bloques y rocas eyectadas balísticamente
        gl.depthMask(true);
        if (scene.ballisticEjecta) {
            scene.ballisticEjecta.draw(gl, marsMaterial);
        }

        // 4. PARTÍCULAS VOLUMÉTRICAS (fuego, pluma piroclástica, vapor)
        gl.depthMask(false);
        const isRunning = state.running !== undefined ? state.running : true;
        const dt = state.lastDt !== undefined ? state.lastDt : 0.016;
        const activeCount = scene.particleSystem.update(isRunning ? dt : 0.0);

        if (activeCount > 0) {
            if (frameData.showMeteor) {
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            } else {
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            }
            scene.particleSystem.draw(gl, particleMaterial, viewMatrix, projMatrix, activeCount);
        }

        gl.depthMask(true);
        gl.disable(gl.BLEND);
    }

    renderizar(escena, camara, controles, estado, datosCuadro, matMarte, matPart) {
        this.render(escena, camara, controles, estado, datosCuadro, matMarte, matPart);
    }
}

window.Renderer = Renderer;
window.Renderizador = Renderer;
