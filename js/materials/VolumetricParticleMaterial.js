/**
 * js/materials/VolumetricParticleMaterial.js
 * Shaders PARTICLE_VS y PARTICLE_FS:
 * Point Sprites con perfil gaussiano y bordes de humo/fuego/vapor orgánico.
 */

"use strict";

const PARTICLE_VS = `#version 300 es

layout(location = 0) in vec3  a_position;
layout(location = 1) in vec4  a_color;
layout(location = 2) in float a_size;

uniform mat4 u_view;
uniform mat4 u_projection;

out vec4 v_color;

void main() {
    vec4 viewPos = u_view * vec4(a_position, 1.0);
    gl_Position = u_projection * viewPos;

    // Escala por profundidad para perspectiva realista
    gl_PointSize = a_size / max(-viewPos.z, 0.1);
    v_color = a_color;
}
`;

const PARTICLE_FS = `#version 300 es
precision highp float;

in vec4 v_color;
out vec4 fragColor;

void main() {
    vec2 coord = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(coord, coord);

    if (r2 > 1.0) discard;

    // Perfil gaussiano del núcleo y desvanecimiento orgánico en bordes
    float glow = exp(-r2 * 2.8);
    float edgeAlpha = 1.0 - smoothstep(0.4, 1.0, r2);

    vec3 coreColor = mix(v_color.rgb, vec3(1.0, 0.98, 0.95), glow * 0.40);
    fragColor = vec4(coreColor, v_color.a * edgeAlpha);
}
`;

class VolumetricParticleMaterial extends ShaderProgram {
    constructor(gl) {
        super(gl, PARTICLE_VS, PARTICLE_FS);
    }

    setCamera(viewMatrix, projMatrix) {
        this.setUniformMatrix4fv('u_view', viewMatrix);
        this.setUniformMatrix4fv('u_projection', projMatrix);
    }

    establecerCamara(vista, proyeccion) {
        this.setCamera(vista, proyeccion);
    }

    setMeshProperties() {}
    establecerPropiedadesMalla() {}
}

window.PARTICLE_VS = PARTICLE_VS;
window.PARTICLE_FS = PARTICLE_FS;
window.VolumetricParticleMaterial = VolumetricParticleMaterial;
window.MaterialParticulasVolumetricas = VolumetricParticleMaterial;
