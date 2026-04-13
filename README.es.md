<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

<p align="center">
  <a href="https://www.npmjs.com/search?q=%40motif"><img src="https://img.shields.io/npm/v/@motif/schema?label=npm&color=cb3837" alt="npm"></a>
  <a href="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://codecov.io/gh/mcp-tool-shop-org/motif"><img src="https://codecov.io/gh/mcp-tool-shop-org/motif/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://mcp-tool-shop-org.github.io/motif/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

Estudio de composición de música adaptativa para crear, organizar, componer y exportar música interactiva para videojuegos.

## ¿Qué es?

Motif es una estación de trabajo centrada en la composición y adaptabilidad. Combina la creación musical estructurada (clips, indicaciones, escenas, capas, automatización) con una lógica adaptativa que responde al estado del juego en tiempo real. El resultado: música para videojuegos que suena intencional, no generada aleatoriamente.

## ¿Qué no es?

Un DAW (Digital Audio Workstation). Un secuenciador básico. Un generador de música con inteligencia artificial. Una base de datos de elementos para la creación de mundos con sonido adjunto. Motif es una herramienta creativa seria para la composición de música adaptativa para videojuegos.

## ¿Qué puede hacer?

- **Componer:** Clips con notas, instrumentos, escalas, acordes, transformaciones de motivos, variaciones de intensidad.
- **Sintetizar:** Voces de sintetizador con múltiples osciladores y unisono/supersaw (16 presets), modulación LFO (filtro, amplitud, tono).
- **Muestrear instrumentos:** Plantillas de piano, cuerdas, guitarra a través de SampleVoice; importar, recortar, dividir, creación de kits.
- **Organizar:** Escenas con capas, roles de sección, curvas de intensidad; 10 presets de patrones de batería.
- **Mezclar y aplicar efectos:** 8 tipos de efectos (ecualizador, delay, reverb, compresor, chorus, distorsión, phaser, limitador); 4 ranuras de efectos insertables por capa.
- **Crear un mundo:** Familias de motivos, perfiles de composición, familias de indicaciones, entradas de mapa del mundo, derivación.
- **Automatizar:** Pistas, macros, envolventes, captura en vivo y combinación.
- **Recordar y reutilizar:** Plantillas, instantáneas, ramas, favoritos, colecciones, comparación.
- **MIDI:** Importar/exportar archivos MIDI estándar.
- **Lógica adaptativa:** Enlaces de activación, transiciones, resolución de escenas determinista.
- **Reproducir:** Previsualización de clips en tiempo real, prueba con un solo clic, metrónomo con clics programados en AudioContext.
- **Validar:** Validación de esquema, auditoría de integridad, comprobaciones de referencias cruzadas.
- **Exportar:** WAV de 24/32 bits a 44.1/48/96 kHz; paquetes de tiempo de ejecución para su uso en motores de juego.
- **Crear:** Deshacer/rehacer (hasta 50 niveles, Ctrl+Z), guardar/cargar proyectos con autoguardado, atajos de teclado (Espacio=reproducir, ?=ayuda), BPM y compás globales.
- **Fiabilidad:** Manejo de errores con recuperación, programación anticipada de AudioContext para una sincronización precisa.

## Estructura de Monorepo

### Aplicaciones

| Aplicación | Descripción |
|-----|-------------|
| [`apps/studio`](apps/studio) | Interfaz de usuario principal de creación (Next.js 15, Zustand 5). |
| [`apps/docs`](apps/docs) | Sitio de documentación (Astro). |

### Paquetes principales

| Paquete | Descripción |
|---------|-------------|
| [`@motif/schema`](packages/schema) | Tipos canónicos, esquemas Zod, parse/validate. |
| [`@motif/asset-index`](packages/asset-index) | Indexación y auditoría de la integridad de los paquetes. |
| [`@motif/audio-engine`](packages/audio-engine) | Reproducción de muestras, gestión de voces, programación de AudioContext. |
| [`@motif/test-kit`](packages/test-kit) | Herramientas de prueba y configuración. |

### Composición y reproducción

| Paquete | Descripción |
|---------|-------------|
| [`@motif/clip-engine`](packages/clip-engine) | Secuenciación de clips, transformaciones, programación de indicaciones. |
| [`@motif/instrument-rack`](packages/instrument-rack) | Sintetizador con múltiples osciladores, voz de batería, voz de muestra, modulación LFO, 16 presets. |
| [`@motif/music-theory`](packages/music-theory) | Escalas, acordes, motivos, transformaciones de intensidad. |
| [`@motif/playback-engine`](packages/playback-engine) | Reproducción en tiempo real, mezcla, 8 tipos de efectos, E/S MIDI, exportación WAV (24/32 bits). |
| [`@motif/sample-lab`](packages/sample-lab) | Recortar, dividir, kit, herramientas de instrumentos. |
| [`@motif/score-map`](packages/score-map) | Motivos, perfiles, familias de indicaciones, derivación. |
| [`@motif/automation`](packages/automation) | Pistas, macros, envolventes, captura. |
| [`@motif/library`](packages/library) | Plantillas, instantáneas, ramas, favoritos, comparación. |

### Infraestructura

| Paquete | Descripción |
|---------|-------------|
| [`@motif/scene-mapper`](packages/scene-mapper) | Mapeo de activadores y evaluación determinista de enlaces. |
| [`@motif/runtime-pack`](packages/runtime-pack) | Exportación/importación en tiempo de ejecución con serialización determinista. |
| [`@motif/review`](packages/review) | Resúmenes y herramientas de auditoría. |
| [`@motif/ui`](packages/ui) | Componentes de interfaz de usuario compartidos. |

## Instalación

```bash
npm install @motif/schema @motif/clip-engine @motif/runtime-pack
```

Todos los paquetes se publican en npm bajo el alcance `@motif`.

## Inicio rápido (monorepo)

```bash
pnpm install
pnpm build
pnpm test       # 1,002 tests across all packages
pnpm dev        # Start Studio dev server
```

**Requisitos:** Node.js >= 22, pnpm >= 10

## Pruebas

Los 16 paquetes incluyen pruebas unitarias que cubren la validación del esquema, la auditoría de integridad, operaciones de ejemplo, la asignación de puntuaciones a los elementos del mundo, la automatización, la gestión de bibliotecas, la reproducción, la síntesis, los efectos, el MIDI y la integración con el estudio. Hay 1002 pruebas en total, distribuidas entre todos los paquetes.

Para ejecutar todas las pruebas: `pnpm test`

## Manual de usuario

El [manual de usuario](https://mcp-tool-shop-org.github.io/motif/handbook/product/) es el manual de operación completo que cubre la definición del producto, la arquitectura, la navegación en el estudio, los flujos de trabajo creativos y la estrategia. Puntos de acceso clave:

- [Producto: ¿Qué es Motif?](https://mcp-tool-shop-org.github.io/motif/handbook/product/)
- [Arquitectura: Descripción general del repositorio](https://mcp-tool-shop-org.github.io/motif/handbook/architecture/)
- [Flujo de trabajo: Creación de un elemento desde cero](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/building-a-cue/)
- [Flujo de trabajo: Trabajo con muestras personalizadas](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/custom-samples/)
- [Flujo de trabajo: Asignación de puntuaciones a los elementos del mundo](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/world-scoring/)
- [Estrategia: Glosario](https://mcp-tool-shop-org.github.io/motif/handbook/strategy/glossary/)
- [Paquetes de ejemplo](examples/)

## Seguridad y Confianza

Motif se ejecuta **completamente en el navegador**. No hay servidor, no hay sincronización en la nube, ni telemetría.

- **Datos accedidos:** Archivos de paquetes de banda sonora creados por el usuario (JSON), referencias a activos de audio, almacenamiento local del navegador.
- **Datos NO accedidos:** No hay almacenamiento en el servidor, no hay acceso al sistema de archivos más allá del entorno de seguridad del navegador.
- **Red:** No hay tráfico de red saliente; toda la creación y reproducción se realiza en el lado del cliente.
- **Credenciales:** No lee, almacena ni transmite credenciales.
- **Telemetría:** No se recopila ni se envía información.
- **Permisos:** Solo se utilizan las API estándar del navegador (Web Audio API).

Consulte [SECURITY.md](SECURITY.md) para informar sobre vulnerabilidades.

## Licencia

MIT

---

Desarrollado por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
