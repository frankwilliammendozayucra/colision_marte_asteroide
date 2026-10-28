# 🪐 Marte y el Agua — Simulación 3D WebGL 2.0

Simulación interactiva 3D avanzada en **WebGL 2.0 nativo / Vanilla JavaScript** sin librerías externas (Three.js, Babylon.js, etc.). Representa la evolución y pérdida de la hidrosfera marciana a través de 5 fases temporales con shaders GLSL procedurales, deformación de cráter en vertex shader, onda de choque planetaria y física balística.

## ✨ Características

- **Pipeline Gráfico Nativo WebGL 2.0:** Shaders GLSL ES 3.00 propios, VAOs, VBOs, IBOs y Blinn-Phong hemisférico.
- **Deformación en Vertex Shader:** Modelado del cráter de impacto con pico central y onda de choque que recorre la esfera en radianes.
- **Materiales Procedurales:** Grietas de lava, ebullición oceánica y desertificación progresiva sin texturas externas.
- **Física Balística y Partículas:** 26 fragmentos de roca e hielo con gravedad radial marciana y sistema de partículas dinámico (fuego, humo y vapor).
- **Fondo Cósmico:** 600 estrellas esféricas y galaxias espirales.
- **HUD Glassmorphism:** Monitor interactivo con barras en tiempo real de agua y biosfera, control de cámara orbital y saltos a eventos clave.

## 🕹️ Controles

- **Arrastrar clic izquierdo:** Rotación orbital de la cámara ($\theta$, $\phi$).
- **Rueda del ratón:** Zoom in / out.
- **Botón "Pausar / Continuar":** Pausa o reanuda la simulación temporal.
- **Botón "Ver Colisión":** Salta al instante exacto del impacto cataclísmico.
- **Botón "Reiniciar":** Vuelve a la Fase 1 con el 100% de la hidrosfera activa.

## 🚀 Ejecución

Simplemente abre `index.html` en cualquier navegador moderno con soporte WebGL 2.0 o ejecútalo con un servidor local:

```bash
# Con Python
python -m http.server 8080

# O con npx serve
npx serve .
```
