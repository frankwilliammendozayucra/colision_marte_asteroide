/**
 * js/math/Noise3D.js
 * Funciones pseudoNoise3D, hashNoise y fbm para relieve marciano,
 * cráteres, asteroides y fracturas.
 */

"use strict";

class Noise3D {
    /**
     * Función hash determinista para coordenadas enteras o discretas.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns {number} Valor en rango [0, 1]
     */
    static hashNoise(x, y, z) {
        let n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
        return n - Math.floor(n);
    }

    /**
     * Ruido pseudo-aleatorio continuo tridimensional a base de armónicos trigonométricos.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns {number} Valor continuo en rango aproximado [-1, 1]
     */
    static pseudoNoise3D(x, y, z) {
        return Math.sin(x * 3.7 + y * 2.3) * 0.45 +
               Math.cos(y * 4.5 - z * 3.1) * 0.35 +
               Math.sin(z * 6.2 + x * 5.1) * 0.20;
    }

    static get(x, y, z) {
        return Noise3D.pseudoNoise3D(x, y, z);
    }

    static obtener(x, y, z) {
        return Noise3D.pseudoNoise3D(x, y, z);
    }

    /**
     * Ruido Fractal Browniano (fBm - Fractional Brownian Motion)
     * para modelado de relieve geológico de Marte, rocas y fracturas.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {number} [octaves=3] 
     * @returns {number}
     */
    static fbm(x, y, z, octaves = 3) {
        let total = 0.0;
        let amp = 0.55;
        let freq = 1.0;

        for (let i = 0; i < octaves; i++) {
            total += Noise3D.pseudoNoise3D(x * freq, y * freq, z * freq) * amp;
            freq *= 2.1;
            amp *= 0.5;
        }
        return total;
    }
}

const hashNoise = Noise3D.hashNoise;
const pseudoNoise3D = Noise3D.pseudoNoise3D;

window.Noise3D = Noise3D;
window.Ruido3D = Noise3D;
window.hashNoise = hashNoise;
window.pseudoNoise3D = pseudoNoise3D;
