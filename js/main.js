/**
 * js/main.js
 * Punto de entrada: inicializa escena, bucle renderLoop y máquina de 5 fases.
 */

"use strict";

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('glCanvas');

    // 1. Inicialización del motor gráfico y materiales
    const renderer = new Renderer(canvas);
    const gl = renderer.gl;

    const marsMaterial = new MarsCrackMaterial(gl);
    const particleMaterial = new VolumetricParticleMaterial(gl);

    // 2. Construcción de la escena 3D y subsistemas
    const scene = new Scene(gl);

    // 3. Configuración de cámara en perspectiva (FOV 42°) y controles orbitales
    const camera = new PerspectiveCamera(
        42.0,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        200.0
    );

    const controls = new OrbitControls(canvas, {
        theta: 0.15,
        phi: 0.35,
        radius: 5.8,
        target: [0.0, 0.15, 0.0]
    });

    // 4. Máquina de estados de 5 fases
    const stateMachine = new ImpactStateMachine();

    // 5. Elementos del HUD (Heads-Up Display)
    const phaseText = document.getElementById('phaseText');
    const waterPercentText = document.getElementById('waterPercentText');
    const waterBar = document.getElementById('waterBar');
    const bioPercentText = document.getElementById('bioPercentText');
    const bioBar = document.getElementById('bioBar');
    const btnPlayPause = document.getElementById('btnPlayPause');
    const btnImpactMoment = document.getElementById('btnImpactMoment');
    const btnReset = document.getElementById('btnReset');

    // 6. Controladores de eventos de la interfaz
    if (btnPlayPause) {
        btnPlayPause.addEventListener('click', () => {
            const isRunning = stateMachine.togglePlayPause();
            btnPlayPause.textContent = isRunning ? 'Pausar' : 'Continuar';
        });
    }

    if (btnImpactMoment) {
        btnImpactMoment.addEventListener('click', () => {
            stateMachine.reset(scene.particleSystem, scene.ballisticEjecta);
            stateMachine.time = 7.8;
            stateMachine.tiempo = 7.8;
            if (btnPlayPause) btnPlayPause.textContent = 'Pausar';
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            stateMachine.reset(scene.particleSystem, scene.ballisticEjecta);
            if (btnPlayPause) btnPlayPause.textContent = 'Pausar';
        });
    }

    // 7. Bucle de renderizado continuo (renderLoop)
    let lastTime = performance.now();

    function renderLoop(currentTime) {
        const dt = Math.min((currentTime - lastTime) / 1000.0, 0.05);
        lastTime = currentTime;

        stateMachine.lastDt = dt;
        stateMachine.ultimoDt = dt;

        // Ajuste reactivo al tamaño de ventana
        renderer.resize(camera);

        // Actualización de la máquina de estados y física
        const frameData = stateMachine.update(
            dt,
            scene.particleSystem,
            scene.ballisticEjecta
        );

        if (stateMachine.running && scene.ballisticEjecta) {
            scene.ballisticEjecta.update(dt, true, scene.particleSystem);
        }

        // Actualización de indicadores del HUD
        if (phaseText && frameData.phaseName) {
            phaseText.textContent = frameData.phaseName;
        }

        const waterVal = stateMachine.waterPercentage !== undefined ? stateMachine.waterPercentage : 100.0;
        if (waterPercentText) {
            waterPercentText.textContent = `${waterVal.toFixed(1)}%`;
        }
        if (waterBar) {
            waterBar.style.width = `${Math.max(0, Math.min(100, waterVal))}%`;
        }

        const bioVal = stateMachine.bioPercentage !== undefined ? stateMachine.bioPercentage : waterVal;
        if (bioPercentText) {
            bioPercentText.textContent = `${bioVal.toFixed(1)}%`;
        }
        if (bioBar) {
            bioBar.style.width = `${Math.max(0, Math.min(100, bioVal))}%`;
        }

        // Despacho del pipeline gráfico WebGL 2.0
        renderer.render(
            scene,
            camera,
            controls,
            stateMachine,
            frameData,
            marsMaterial,
            particleMaterial
        );

        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
});
