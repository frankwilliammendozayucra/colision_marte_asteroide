/**
 * js/geometries/DiscRingGeometry.js
 * Malla de anillos concéntricos para el cráter volcánico y la onda expansiva.
 */

"use strict";

class DiscRingGeometry extends Geometry {
    /**
     * @param {number} [innerRadius=0.0] 
     * @param {number} [outerRadius=1.0] 
     * @param {number} [segments=48] 
     * @param {boolean} [isCrater=false] 
     */
    constructor(innerRadius = 0.0, outerRadius = 1.0, segments = 48, isCrater = false) {
        const { positions, normals, colors, indices } = DiscRingGeometry.generate(innerRadius, outerRadius, segments, isCrater);
        super(positions, normals, colors, indices);
        this.innerRadius = innerRadius;
        this.radioInterno = innerRadius;
        this.outerRadius = outerRadius;
        this.radioExterno = outerRadius;
        this.segments = segments;
        this.segmentos = segments;
        this.isCrater = isCrater;
        this.esCrater = isCrater;
    }

    static generate(innerRadius, outerRadius, segments, isCrater) {
        const positions = [];
        const normals = [];
        const colors = [];
        const indices = [];
        const numRings = isCrater ? 10 : 3;

        for (let ring = 0; ring <= numRings; ring++) {
            const progress = ring / numRings;
            const currentRadius = innerRadius + progress * (outerRadius - innerRadius);

            for (let s = 0; s <= segments; s++) {
                const angle = (s / segments) * Math.PI * 2.0;
                const edgeNoise = Math.sin(angle * 7.0) * 0.04 + Math.cos(angle * 13.0) * 0.02;
                const px = Math.cos(angle) * (currentRadius + (isCrater ? edgeNoise * progress : 0));
                const py = Math.sin(angle) * (currentRadius + (isCrater ? edgeNoise * progress : 0));
                let pz = 0.0;
                let cr = 1.0, cg = 0.75, cb = 0.35;

                if (isCrater) {
                    pz = (progress < 0.55)
                        ? -0.05 * (1.0 - progress)
                        : 0.09 * Math.sin(progress * Math.PI);

                    cr = (1.0 - progress) * 1.0 + progress * 0.45;
                    cg = (1.0 - progress) * 0.75 + progress * 0.15;
                    cb = (1.0 - progress) * 0.25 + progress * 0.08;
                }

                positions.push(px, py, pz);
                normals.push(0, 0, 1);
                colors.push(cr, cg, cb);
            }
        }

        for (let ring = 0; ring < numRings; ring++) {
            for (let s = 0; s < segments; s++) {
                const first = ring * (segments + 1) + s;
                const second = first + (segments + 1);
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

    static generar(radioInt, radioExt, seg, esCrater) {
        return DiscRingGeometry.generate(radioInt, radioExt, seg, esCrater);
    }
}

window.DiscRingGeometry = DiscRingGeometry;
window.GeometriaDiscoAnillo = DiscRingGeometry;
