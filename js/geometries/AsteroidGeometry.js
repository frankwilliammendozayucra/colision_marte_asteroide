/**
 * js/geometries/AsteroidGeometry.js
 * Malla irregular deformada para el meteorito cataclísmico,
 * rocas ardientes y bloques de hielo eyectados.
 */

"use strict";

class AsteroidGeometry extends Geometry {
    /**
     * @param {number} [radius=0.5] 
     * @param {number} [latBands=28] 
     * @param {number} [lonBands=28] 
     * @param {string} [type='meteor'] - 'meteor', 'debris_rock', 'debris_ice'
     */
    constructor(radius = 0.5, latBands = 28, lonBands = 28, type = 'meteor') {
        const { positions, normals, colors, indices } = AsteroidGeometry.generate(radius, latBands, lonBands, type);
        super(positions, normals, colors, indices);
        this.radius = radius;
        this.radio = radius;
        this.type = type;
        this.tipo = type;
    }

    static generate(radius, latBands, lonBands, type) {
        const positions = [];
        const normals = [];
        const colors = [];
        const indices = [];

        for (let lat = 0; lat <= latBands; lat++) {
            const theta = (lat * Math.PI) / latBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= lonBands; lon++) {
                const phi = (lon * 2.0 * Math.PI) / lonBands;
                const ux = Math.cos(phi) * sinTheta;
                const uy = cosTheta;
                const uz = Math.sin(phi) * sinTheta;

                let vertexRadius = radius;
                let cr = 0.5, cg = 0.5, cb = 0.5;

                if (type === 'meteor') {
                    const noise1 = Noise3D.pseudoNoise3D(ux * 2.4, uy * 2.4, uz * 2.4);
                    const noise2 = Noise3D.pseudoNoise3D(ux * 6.0, uy * 6.0, uz * 6.0) * 0.35;
                    vertexRadius = radius * (1.0 + noise1 * 0.30 + noise2 * 0.16);

                    if (uy > 0.15 && noise1 > -0.1) {
                        cr = 0.65; cg = 0.88; cb = 0.96;
                    } else if (uy < -0.25) {
                        cr = 1.0; cg = 0.45; cb = 0.10;
                    } else {
                        const shade = 0.28 + (noise1 + 0.5) * 0.25;
                        cr = shade * 1.15; cg = shade * 0.85; cb = shade * 0.65;
                    }
                } else if (type === 'debris_rock') {
                    vertexRadius = radius * (1.0 + Noise3D.pseudoNoise3D(ux * 3.2, uy * 3.2, uz * 3.2) * 0.35);
                    cr = 0.35; cg = 0.24; cb = 0.18;
                } else if (type === 'debris_ice') {
                    vertexRadius = radius * (1.0 + Math.abs(Noise3D.pseudoNoise3D(ux * 4.0, uy * 4.0, uz * 4.0)) * 0.4);
                    cr = 0.75; cg = 0.93; cb = 1.0;
                }

                positions.push(ux * vertexRadius, uy * vertexRadius, uz * vertexRadius);
                normals.push(ux, uy, uz);
                colors.push(cr, cg, cb);
            }
        }

        for (let lat = 0; lat < latBands; lat++) {
            for (let lon = 0; lon < lonBands; lon++) {
                const first = lat * (lonBands + 1) + lon;
                const second = first + lonBands + 1;
                indices.push(
                    first, second, first + 1,
                    second, second + 1, first + 1
                );
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

    static generar(radio, bandasLat, bandasLon, tipo) {
        return AsteroidGeometry.generate(radio, bandasLat, bandasLon, tipo);
    }
}

window.AsteroidGeometry = AsteroidGeometry;
window.GeometriaAsteroide = AsteroidGeometry;
