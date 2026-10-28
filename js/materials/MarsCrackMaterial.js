/**
 * js/materials/MarsCrackMaterial.js
 * Shaders MESH_VS y MESH_FS:
 * Blinn-Phong, grietas de lava, deformación de cráter, onda de choque, desertificación y evaporación.
 */

"use strict";

const MESH_VS = `#version 300 es

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec3 a_color;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

uniform float u_time;
uniform int   u_isWater;
uniform int   u_isMars;

uniform vec3  u_impactLocalDir;
uniform float u_craterDepth;
uniform float u_craterHeat;
uniform float u_shockwaveAngle;
uniform float u_shockwaveIntensity;

out vec3  v_worldPos;
out vec3  v_normal;
out vec3  v_color;
out float v_lavaGlow;
out float v_shockwaveGlow;
out float v_angularDist;

void main() {
    vec3 position = a_position;
    vec3 normal = a_normal;
    vec3 color = a_color;
    float lavaGlow = 0.0;
    float shockGlow = 0.0;

    vec3 unitPos = normalize(position);
    vec3 dirImp = normalize(u_impactLocalDir);
    float angularDist = acos(clamp(dot(unitPos, dirImp), -1.0, 1.0));

    // Procesamiento de la superficie de Marte
    if (u_isMars == 1) {
        // 1. Desertificación detrás de la onda de choque
        if (u_shockwaveAngle > 0.0) {
            float zoneMask = clamp((u_shockwaveAngle - angularDist + 0.12) / 0.25, 0.0, 1.0);
            float dunePattern = 0.5 + 0.5 * sin(position.x * 5.5 + position.z * 4.2 + position.y * 3.0);
            vec3 lightSand = vec3(0.84, 0.35, 0.16);
            vec3 darkSand = vec3(0.62, 0.21, 0.09);
            vec3 sandColor = mix(darkSand, lightSand, dunePattern);
            color = mix(color, sandColor, zoneMask * 0.92);
        }

        // 2. Deformación geométrica del cráter de impacto
        if (u_craterDepth > 0.001) {
            vec3 tangent = normalize(cross(dirImp, vec3(0.0, 1.0, 0.0)));
            vec3 bitangent = cross(dirImp, tangent);
            float azimAngle = atan(dot(unitPos, bitangent), dot(unitPos, tangent));

            float rimNoise = 1.0 + 0.07 * sin(azimAngle * 6.0) + 0.05 * cos(azimAngle * 9.0);
            float normRadius = 0.30 * rimNoise;
            float r = angularDist / normRadius;

            if (r < 1.35) {
                float heightDisp = 0.0;
                float radialSlope = 0.0;

                if (r < 0.72) {
                    float nr = r / 0.72;
                    float bowl = cos(nr * 1.570796);
                    float peak = 0.035 * exp(-nr * nr * 9.0);
                    heightDisp = (-0.17 * bowl + peak) * u_craterDepth;
                    radialSlope = (0.17 * (1.570796 / 0.72) * sin(nr * 1.570796)) * u_craterDepth;
                } else {
                    float nr = (r - 0.72) / 0.63;
                    float rim = sin(nr * 3.14159265);
                    heightDisp = (0.075 * rim) * u_craterDepth;
                    radialSlope = (-0.075 * (3.14159265 / 0.63) * cos(nr * 3.14159265)) * u_craterDepth;
                }

                position += unitPos * heightDisp;

                vec3 radialDir = unitPos - dirImp * dot(unitPos, dirImp);
                float radLen = length(radialDir);
                if (radLen > 0.0001) {
                    radialDir /= radLen;
                    normal = normalize(normal - radialDir * radialSlope * 2.2);
                }

                vec3 floorCol = vec3(0.50, 0.17, 0.08);
                vec3 rimCol = vec3(0.88, 0.40, 0.20);

                if (r < 0.72) {
                    float floorMask = 1.0 - (r / 0.72);
                    color = mix(color, floorCol, floorMask * 0.85 * u_craterDepth);
                } else {
                    float rimMask = sin(((r - 0.72) / 0.63) * 3.14159265);
                    color = mix(color, rimCol, rimMask * 0.80 * u_craterDepth);
                }

                // 3. Grietas de magma incandescente
                if (u_craterHeat > 0.001 && r < 0.90) {
                    float heatProfile = pow(max(0.0, 1.0 - r / 0.90), 1.8);
                    float fissures = 0.55 + 0.45 * sin(r * 26.0 + azimAngle * 5.0);
                    lavaGlow = heatProfile * u_craterHeat * fissures;
                    vec3 magmaCol = mix(vec3(1.0, 0.32, 0.05), vec3(1.0, 0.88, 0.45), heatProfile);
                    color = mix(color, magmaCol, min(1.0, lavaGlow * 1.1));
                }
            }
        }

        // 4. Onda de choque expansiva
        if (u_shockwaveIntensity > 0.001) {
            float waveDist = angularDist - u_shockwaveAngle;
            float ringP = exp(-(waveDist * waveDist) / (2.0 * 0.085 * 0.085));
            float ringS = 0.45 * exp(-((waveDist + 0.20) * (waveDist + 0.20)) / (2.0 * 0.055 * 0.055));
            float totalWave = (ringP + ringS) * u_shockwaveIntensity;

            position += unitPos * (totalWave * 0.075);

            vec3 radialDir = unitPos - dirImp * dot(unitPos, dirImp);
            float radLen = length(radialDir);
            if (radLen > 0.0001) {
                radialDir /= radLen;
                float waveDeriv = -(waveDist / (0.085 * 0.085)) * ringP * u_shockwaveIntensity;
                normal = normalize(normal - radialDir * waveDeriv * 0.05);
            }

            shockGlow = totalWave;
        }
    }

    // Procesamiento del océano
    if (u_isWater == 1) {
        float wave = sin(position.x * 14.0 + u_time * 3.2) * cos(position.y * 14.0 + u_time * 2.7) * 0.0045;
        float boilSurge = 0.0;
        if (u_shockwaveAngle > 0.0 && u_shockwaveIntensity > 0.001) {
            float dWave = angularDist - u_shockwaveAngle;
            boilSurge = exp(-(dWave * dWave) / (2.0 * 0.09 * 0.09)) * 0.025 * u_shockwaveIntensity;
        }

        position += normal * (wave + boilSurge);
        normal = normalize(normal + vec3(wave * 3.0, wave * 2.0, -wave * 3.0));
    }

    vec4 worldPos = u_model * vec4(position, 1.0);
    v_worldPos = worldPos.xyz;
    v_normal = normalize(mat3(u_model) * normal);
    v_color = color;
    v_lavaGlow = lavaGlow;
    v_shockwaveGlow = shockGlow;
    v_angularDist = angularDist;

    gl_Position = u_projection * u_view * worldPos;
}
`;

const MESH_FS = `#version 300 es
precision highp float;
precision highp int;

in vec3  v_worldPos;
in vec3  v_normal;
in vec3  v_color;
in float v_lavaGlow;
in float v_shockwaveGlow;
in float v_angularDist;

uniform vec3  u_viewPos;
uniform vec3  u_sunDir;
uniform vec3  u_impactLightPos;
uniform float u_impactIntensity;
uniform float u_alpha;
uniform float u_shininess;
uniform float u_emissive;
uniform vec3  u_tintColor;
uniform vec3  u_fresnelColor;
uniform float u_fresnelPower;

uniform int   u_isWater;
uniform float u_shockwaveAngle;

out vec4 fragColor;

void main() {
    float localAlpha = u_alpha;
    float edgeGlow = 0.0;

    // Descarte del océano evaporado tras el paso de la onda
    if (u_isWater == 1 && u_shockwaveAngle > 0.0) {
        float frontDist = v_angularDist - u_shockwaveAngle;
        if (frontDist < -0.06) {
            discard;
        }
        float edgeFactor = clamp((frontDist + 0.06) / 0.18, 0.0, 1.0);
        localAlpha *= edgeFactor;
        edgeGlow = (1.0 - edgeFactor) * 1.6;
    }

    vec3 N = normalize(v_normal);
    vec3 V = normalize(u_viewPos - v_worldPos);
    vec3 baseColor = v_color * u_tintColor;

    if (edgeGlow > 0.01) {
        baseColor = mix(baseColor, vec3(0.95, 0.98, 1.0), min(1.0, edgeGlow));
    }

    // Iluminación hemisférica ambiental
    float hemi = N.y * 0.5 + 0.5;
    vec3 skyAmb = vec3(0.18, 0.22, 0.30);
    vec3 groundAmb = vec3(0.16, 0.07, 0.04);
    vec3 ambient = mix(groundAmb, skyAmb, hemi) * baseColor;

    // Luz solar Blinn-Phong
    vec3 L_sun = normalize(u_sunDir);
    float diffSun = max(dot(N, L_sun), 0.0);
    vec3 H_sun = normalize(L_sun + V);
    float specSun = (u_shininess > 0.0) ? pow(max(dot(N, H_sun), 0.0), u_shininess) * 0.65 : 0.0;
    vec3 sunLight = diffSun * baseColor * 1.15 + vec3(specSun * 0.9, specSun * 0.95, specSun);

    // Luz puntual del impacto
    vec3 L_impVec = u_impactLightPos - v_worldPos;
    float distImp = length(L_impVec);
    vec3 L_imp = normalize(L_impVec);
    float att = 1.0 / (1.0 + 0.28 * distImp + 0.35 * distImp * distImp);
    float diffImp = max(dot(N, L_imp), 0.0);
    vec3 impCol = vec3(1.0, 0.52, 0.12);
    vec3 pointLight = diffImp * impCol * u_impactIntensity * att * 5.0;

    // Efecto Fresnel atmosférico
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0) * u_fresnelPower;
    float atmosMask = smoothstep(-0.3, 0.6, dot(N, L_sun));
    vec3 atmosphere = u_fresnelColor * fresnel * (0.30 + 0.70 * atmosMask);

    // Componentes emisivas (lava, onda de choque, ebullición)
    vec3 shockColor = mix(vec3(1.0, 0.42, 0.08), vec3(1.0, 0.92, 0.65), min(1.0, v_shockwaveGlow));
    vec3 emission = baseColor * u_emissive
                  + vec3(1.0, 0.45, 0.08) * v_lavaGlow * 1.8
                  + shockColor * v_shockwaveGlow * 2.6
                  + vec3(0.85, 0.95, 1.0) * edgeGlow * 0.8;

    // Composición final y tone mapping
    vec3 finalColor = ambient + sunLight + pointLight + atmosphere + emission;
    finalColor = finalColor / (1.0 + finalColor * 0.18);

    fragColor = vec4(finalColor, localAlpha);
}
`;

class MarsCrackMaterial extends ShaderProgram {
    constructor(gl) {
        super(gl, MESH_VS, MESH_FS);
    }

    setCamera(viewMatrix, projMatrix, viewPos) {
        this.setUniformMatrix4fv('u_view', viewMatrix);
        this.setUniformMatrix4fv('u_projection', projMatrix);
        this.setUniform3fv('u_viewPos', viewPos);
    }

    establecerCamara(vista, proyeccion, posVista) {
        this.setCamera(vista, proyeccion, posVista);
    }

    setGlobalEnvironment(params = {}) {
        const sun = params.sunDir || params.direccionSol;
        if (sun) this.setUniform3fv('u_sunDir', sun);

        const impactLight = params.impactLightPos || params.posLuzImpacto;
        if (impactLight) this.setUniform3fv('u_impactLightPos', impactLight);

        const localDir = params.impactLocalDir || params.dirLocalImpacto;
        if (localDir) this.setUniform3fv('u_impactLocalDir', localDir);

        const intensity = params.impactIntensity !== undefined ? params.impactIntensity : params.intensidadImpacto;
        if (intensity !== undefined) this.setUniform1f('u_impactIntensity', intensity);

        const depth = params.craterDepth !== undefined ? params.craterDepth : params.profundidadCrater;
        if (depth !== undefined) this.setUniform1f('u_craterDepth', depth);

        const heat = params.craterHeat !== undefined ? params.craterHeat : params.calorCrater;
        if (heat !== undefined) this.setUniform1f('u_craterHeat', heat);

        const angle = params.shockwaveAngle !== undefined ? params.shockwaveAngle : params.anguloOndaChoque;
        if (angle !== undefined) this.setUniform1f('u_shockwaveAngle', angle);

        const waveInt = params.shockwaveIntensity !== undefined ? params.shockwaveIntensity : params.intensidadOndaChoque;
        if (waveInt !== undefined) this.setUniform1f('u_shockwaveIntensity', waveInt);

        const time = params.time !== undefined ? params.time : params.tiempo;
        if (time !== undefined) this.setUniform1f('u_time', time);
    }

    establecerEntornoGlobal(params) {
        this.setGlobalEnvironment(params);
    }

    setMeshProperties(props = {}) {
        const model = props.model || props.modelo;
        if (model) this.setUniformMatrix4fv('u_model', model);

        const isWater = props.isWater !== undefined ? props.isWater : (props.esAgua !== undefined ? props.esAgua : (props.meshType === 1 ? 1 : 0));
        this.setUniform1i('u_isWater', isWater);

        const isMars = props.isMars !== undefined ? props.isMars : (props.esMarte !== undefined ? props.esMarte : (props.meshType === 0 ? 1 : 0));
        this.setUniform1i('u_isMars', isMars);

        const alpha = props.alpha !== undefined ? props.alpha : (props.alfa !== undefined ? props.alfa : 1.0);
        this.setUniform1f('u_alpha', alpha);

        const shininess = props.shininess !== undefined ? props.shininess : (props.brillo !== undefined ? props.brillo : 16.0);
        this.setUniform1f('u_shininess', shininess);

        const emissive = props.emissive !== undefined ? props.emissive : (props.emisivo !== undefined ? props.emisivo : 0.0);
        this.setUniform1f('u_emissive', emissive);

        const tint = props.tintColor || props.colorTinte || [1.0, 1.0, 1.0];
        this.setUniform3fv('u_tintColor', tint);

        const fresnel = props.fresnelColor || props.colorFresnel || [0.4, 0.7, 1.0];
        this.setUniform3fv('u_fresnelColor', fresnel);

        const fresnelPower = props.fresnelPower !== undefined ? props.fresnelPower : (props.potenciaFresnel !== undefined ? props.potenciaFresnel : 0.5);
        this.setUniform1f('u_fresnelPower', fresnelPower);
    }

    establecerPropiedadesMalla(props) {
        this.setMeshProperties(props);
    }
}

window.MESH_VS = MESH_VS;
window.MESH_FS = MESH_FS;
window.MarsCrackMaterial = MarsCrackMaterial;
window.MaterialGrietasMarte = MarsCrackMaterial;
