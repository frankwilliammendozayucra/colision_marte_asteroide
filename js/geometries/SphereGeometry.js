/**
 * js/geometries/SphereGeometry.js
 * Esfera paramétrica: Marte con polos y zonas verdes, capa de agua oceánica y atmósfera.
 */

"use strict";

class SphereGeometry extends Geometry {
    /**
     * @param {number} [radius=1.0] 
     * @param {number} [latBands=48] 
     * @param {number} [lonBands=48] 
     * @param {string} [type='mars'] - 'mars', 'water', 'meteor', 'ice', 'atmosphere'
     */
    constructor(radius = 1.0, latBands = 48, lonBands = 48, type = 'mars') {
        const { positions, normals, colors, indices } = SphereGeometry.generate(radius, latBands, lonBands, type);
        super(positions, normals, colors, indices);
        this.radius = radius;
        this.radio = radius;
        this.latBands = latBands;
        this.lonBands = lonBands;
        this.type = type;
        this.tipo = type;
    }

    static _calculateNoiseRadius(ux, uy, uz, radius, type) {
        if (type === 'mars') {
            let fbm = 0.0, amp = 0.52, freq = 1.0;
            for (let o = 0; o < 3; o++) {
                const fx = ux * 1.5 * freq, fy = uy * 1.5 * freq, fz = uz * 1.5 * freq;
                fbm += amp * (
                    Math.sin(fx * 3.1 + fy * 2.3) * 0.45 +
                    Math.cos(fy * 4.2 - fz * 3.7) * 0.35 +
                    Math.sin(fz * 5.8 + fx * 4.9) * 0.20
                );
                freq *= 2.15;
                amp *= 0.48;
            }
            return radius + fbm * 0.11;
        }
        if (type === 'meteor' || type === 'ice') {
            let fbm = 0.0, amp = 0.55, freq = 1.6;
            for (let o = 0; o < 3; o++) {
                const fx = ux * 1.4 * freq, fy = uy * 1.4 * freq, fz = uz * 1.4 * freq;
                fbm += amp * (
                    Math.sin(fx * 3.1 + fy * 2.3) * 0.45 +
                    Math.cos(fy * 4.2 - fz * 3.7) * 0.35 +
                    Math.sin(fz * 5.8 + fx * 4.9) * 0.20
                );
                freq *= 2.15;
                amp *= 0.48;
            }
            const ex = ux * 4.5, ey = uy * 4.5, ez = uz * 4.5;
            const craters = Math.abs(
                Math.sin(ex * 3.1 + ey * 2.3) * 0.45 +
                Math.cos(ey * 4.2 - ez * 3.7) * 0.35 +
                Math.sin(ez * 5.8 + ex * 4.9) * 0.20
            );
            return radius * (1.0 + fbm * 0.35 - craters * 0.14);
        }
        return radius;
    }

    static generate(radius, latBands, lonBands, type) {
        const positions = [], normals = [], colors = [], indices = [];
        const eps = 0.008;

        for (let lat = 0; lat <= latBands; lat++) {
            const theta = (lat * Math.PI) / latBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= lonBands; lon++) {
                const phi = (lon * 2.0 * Math.PI) / lonBands;
                const ux = Math.cos(phi) * sinTheta;
                const uy = cosTheta;
                const uz = Math.sin(phi) * sinTheta;

                const r = SphereGeometry._calculateNoiseRadius(ux, uy, uz, radius, type);
                const px = ux * r, py = uy * r, pz = uz * r;
                positions.push(px, py, pz);

                if (type === 'water' || type === 'atmosphere') {
                    normals.push(ux, uy, uz);
                } else if (type === 'mars' || type === 'meteor' || type === 'ice') {
                    const theta2 = theta + eps, phi2 = phi + eps;
                    const ux1 = Math.cos(phi) * Math.sin(theta2), uy1 = Math.cos(theta2), uz1 = Math.sin(phi) * Math.sin(theta2);
                    const ux2 = Math.cos(phi2) * sinTheta, uy2 = uy, uz2 = Math.sin(phi2) * sinTheta;
                    const r1 = SphereGeometry._calculateNoiseRadius(ux1, uy1, uz1, radius, type);
                    const r2 = SphereGeometry._calculateNoiseRadius(ux2, uy2, uz2, radius, type);

                    const p1 = [ux1 * r1 - px, uy1 * r1 - py, uz1 * r1 - pz];
                    const p2 = [ux2 * r2 - px, uy2 * r2 - py, uz2 * r2 - pz];

                    let nx = p1[1] * p2[2] - p1[2] * p2[1];
                    let ny = p1[2] * p2[0] - p1[0] * p2[2];
                    let nz = p1[0] * p2[1] - p1[1] * p2[0];

                    if (nx * ux + ny * uy + nz * uz < 0) { nx = -nx; ny = -ny; nz = -nz; }
                    const len = Math.hypot(nx, ny, nz);
                    normals.push(
                        len > 0.00001 ? nx / len : ux,
                        len > 0.00001 ? ny / len : uy,
                        len > 0.00001 ? nz / len : uz
                    );
                } else {
                    normals.push(ux, uy, uz);
                }

                let cr = 1.0, cg = 1.0, cb = 1.0;
                if (type === 'mars') {
                    const h = (r - radius) / 0.11;
                    const latAbs = Math.abs(uy);

                    if (latAbs + h * 0.15 > 0.88) {
                        // Casquetes polares glaciares
                        cr = 0.92; cg = 0.94; cb = 0.98;
                    } else if (h < -0.15) {
                        // Cuencas y lechos antiguos
                        cr = 0.44; cg = 0.18; cb = 0.10;
                    } else if (h < 0.15) {
                        // Planicies y vegetación / biosfera primitiva
                        const tt = (h + 0.15) / 0.30;
                        cr = 0.58 + tt * 0.24; cg = 0.22 + tt * 0.11; cb = 0.11 + tt * 0.05;
                    } else {
                        // Tierras altas y montañas rojizas
                        const tt = Math.min(1.0, (h - 0.15) / 0.6);
                        cr = 0.82 + tt * 0.14; cg = 0.33 + tt * 0.20; cb = 0.16 + tt * 0.12;
                    }
                } else if (type === 'water') {
                    const latF = Math.abs(uy);
                    cr = 0.04 + latF * 0.10; cg = 0.52 + latF * 0.15; cb = 0.85 + latF * 0.10;
                } else if (type === 'meteor') {
                    const h = (r / radius) - 1.0;
                    const s = 0.28 + (h + 0.25) * 0.55;
                    cr = s * 1.1; cg = s * 0.92; cb = s * 0.82;
                } else if (type === 'ice') {
                    const h = (r / radius) - 1.0;
                    const tt = Math.max(0.0, Math.min(1.0, (h + 0.25) / 0.50));
                    cr = 0.45 + tt * 0.52; cg = 0.80 + tt * 0.18; cb = 0.96 + tt * 0.04;
                } else if (type === 'atmosphere') {
                    cr = 0.35; cg = 0.68; cb = 1.0;
                }

                colors.push(cr, cg, cb);
            }
        }

        for (let lat = 0; lat < latBands; lat++) {
            for (let lon = 0; lon < lonBands; lon++) {
                const v0 = lat * (lonBands + 1) + lon;
                const v1 = v0 + lonBands + 1;
                indices.push(v0, v1, v0 + 1, v1, v1 + 1, v0 + 1);
            }
        }

        const res = {
            positions: new Float32Array(positions),
            normals: new Float32Array(normals),
            colors: new Float32Array(colors),
            indices: new Uint16Array(indices)
        };
        res.posiciones = res.positions;
        res.normales = res.normals;
        res.colores = res.colors;
        return res;
    }

    static generar(radio, latBands, lonBands, tipo) {
        return SphereGeometry.generate(radio, latBands, lonBands, tipo);
    }
}

window.SphereGeometry = SphereGeometry;
window.GeometriaEsfera = SphereGeometry;
