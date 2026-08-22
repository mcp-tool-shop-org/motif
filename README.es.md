<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

<p align="center">
  <a href="https://www.npmjs.com/search?q=%40motif-studio"><img src="https://img.shields.io/npm/v/@motif-studio/schema?label=npm&color=cb3837" alt="npm"></a>
  <a href="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://codecov.io/gh/mcp-tool-shop-org/motif"><img src="https://codecov.io/gh/mcp-tool-shop-org/motif/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://mcp-tool-shop-org.github.io/motif/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

Estudio de banda sonora adaptativa para componer, arreglar, crear partituras y exportar música interactiva para juegos.

## ¿Qué es?

Motif es una estación de trabajo centrada en la composición y consciente de la adaptación. Combina la creación estructurada de música (clips, pistas, escenas, capas, automatización) con una lógica adaptativa que responde al estado del juego en tiempo real. El resultado: música para juegos que parece intencional, no generada aleatoriamente.

## ¿Qué no es?

Un DAW. Un secuenciador de juguete. Un generador de música con IA. Una base de datos de creación de mundos con sonido adjunto. Motif es un instrumento creativo serio para la creación de bandas sonoras adaptativas para juegos.

Motif no genera música. Sí [ingiere](#generated-cues-and-the-genre-library) audio que hayas generado en otro lugar, transformando una mezcla, sus pistas individuales y una lectura del nivel de volumen en escenas, familias de pistas y reproducción en capas. De dónde provenga el audio es asunto tuyo; el trabajo de Motif comienza una vez que la grabación existe.

## ¿Qué puede hacer?

- **Componer:** Clips con notas, instrumentos, escalas, acordes, transformaciones de motivos, variantes de intensidad.
- **Sintetizar:** Voces de sintetizador multioscilador con unísono/supersaw (16 preajustes), modulación LFO (filtro, amplitud, tono).
- **Instrumentos de muestra:** Plantillas de piano, cuerdas y guitarra a través de SampleVoice; importar, recortar, dividir, constructor de kits.
- **Arreglar:** Escenas con pistas en capas, roles de sección, curvas de intensidad; 10 preajustes de patrones de batería.
- **Mezclar y aplicar efectos:** 8 tipos de efectos (EQ, delay, reverb, compresor, chorus, distorsión, phaser, limitador); 4 ranuras de FX de inserción por pista.
- **Crear la banda sonora de un mundo:** Familias Motif, perfiles de banda sonora, familias de pistas, entradas del mapa del mundo, derivación.
- **Ingerir audio generado:** Transformar una mezcla generada en la nube + pistas Demucs + lectura LUFS en un paquete reproducible y normalizado por volumen; contenido direccionado para que las ejecuciones repetidas sean casi instantáneas.
- **Crear paquetes de género a partir de un catálogo:** Una entrada JSON por pista deriva todo un paquete: escena, familia de pistas, bloqueo de generación, enlaces y tomas A/B.
- **Automatizar:** Pistas, macros, envolventes, captura y fusión en vivo.
- **Recordar y reutilizar:** Plantillas, instantáneas, ramas, favoritos, colecciones, comparar.
- **MIDI:** Importar/exportar archivos MIDI estándar.
- **Lógica adaptativa:** Disparadores de enlaces, transiciones, resolución determinista de escenas.
- **Interpretar:** Vista previa de clips en tiempo real, clic para escuchar, metrónomo con clics programados por AudioContext.
- **Validar:** Validación de esquema, auditoría de integridad, comprobaciones de referencias cruzadas.
- **Exportar:** WAV de 24/32 bits a 44,1/48/96 kHz; paquetes en tiempo de ejecución para el consumo del motor del juego.
- **Crear:** Deshacer/rehacer (50 niveles, Ctrl+Z), guardar/cargar proyecto con guardado automático, atajos de teclado (Espacio=reproducir, ?=ayuda), BPM global y compás.
- **Fiabilidad:** Límite de errores con recuperación elegante, programación de anticipación de AudioContext para una sincronización precisa a nivel de muestra.

## Pistas generadas y la biblioteca de géneros

Motif puede crear un paquete `SoundtrackPack` reproducible a partir de audio generado. Describes un paquete en un archivo de catálogo, generas el audio como quieras y Motif lo transforma en escenas, familias de pistas y pistas en capas que puedes escuchar en Studio.

```
catalog entry  →  generation  →  collection  →  ingest  →  playable pack
   (you)          (any model)     (masters)    (Motif)      (Studio)
```

Motif se encarga de los dos últimos pasos. Solo le importa que cada grabación llegue como una mezcla, sus pistas individuales y una lectura del nivel de volumen.

**El catálogo integrado describe 24 paquetes de género: 233 pistas, dos tomas por pista.** Fantasía, tácticas, mazmorras, steampunk, piratas, western, ópera espacial, cyberpunk, mítico, páramo, oriental, nórdico, desierto, bosque, congelado, gótico, submarino, volcánico, acogedor, noir, temas emocionales, drones ambientales, tensión y menús. El catálogo y la derivación se encuentran en este repositorio; **los archivos de audio maestros no**; son grandes y se generan por usuario, por lo que tú los proporcionas y ejecutas la ingestión.

```bash
# Ingest one pack, or a whole tier
pnpm --filter @motif-studio/sample-lab ingest:library --pack fantasy-jrpg-core
pnpm --filter @motif-studio/sample-lab ingest:library --tier 2 --tier 3
```

La ingestión es **direccionada por contenido e incremental**: una grabación cuyos archivos de entrada siguen teniendo el mismo hash que la ejecución anterior se reutiliza en lugar de volver a decodificarse, por lo que volver a ejecutar un paquete terminado tarda aproximadamente un segundo en lugar de minutos, y una ejecución interrumpida se reanuda donde se detuvo. `--force` vuelve a decodificar todo para demostrar que el proceso sigue reproduciendo su propia salida; `--skip-defective` descarta una grabación con formato incorrecto, la informa y sale con un código distinto de cero en lugar de detener toda la ejecución.

Consulta [Pistas generadas y paquetes de biblioteca](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/generated-cues/) en el manual para obtener el flujo de trabajo completo, incluidos los bloqueos de generación y la curación de tomas.

## Estructura del monorepositorio

### Aplicaciones

| Aplicación | Descripción |
|-----|-------------|
| [`apps/studio`](apps/studio) | Interfaz de autor principal (Next.js, Zustand 5) |

### Paquetes principales

| Paquete | Descripción |
|---------|-------------|
| [`@motif-studio/schema`](packages/schema) | Tipos canónicos, esquemas Zod, análisis/validación |
| [`@motif-studio/asset-index`](packages/asset-index) | Indexación y auditoría de la integridad del paquete |
| [`@motif-studio/audio-engine`](packages/audio-engine) | Reproducción de muestras, gestión de voces, programación de AudioContext |
| [`@motif-studio/test-kit`](packages/test-kit) | Elementos y utilidades de prueba |

### Composición y reproducción

| Paquete | Descripción |
|---------|-------------|
| [`@motif-studio/clip-engine`](packages/clip-engine) | Secuenciación de clips, transformaciones, programación de pistas |
| [`@motif-studio/instrument-rack`](packages/instrument-rack) | Sintetizador multioscilador, voz de batería, voz de muestra, modulación LFO, 16 preajustes |
| [`@motif-studio/music-theory`](packages/music-theory) | Escalas, acordes, motivos, transformaciones de intensidad |
| [`@motif-studio/playback-engine`](packages/playback-engine) | Reproducción en tiempo real, mezcla, 8 tipos de efectos, E/S MIDI, exportación WAV (24/32 bits) |
| [`@motif-studio/sample-lab`](packages/sample-lab) | Recortar, dividir, kit, auxiliares de instrumentos, además del carril de generación: cliente de ejecución en la nube, ingestión de artefactos, normalización del volumen, creación de paquetes de biblioteca |
| [`@motif-studio/score-map`](packages/score-map) | Motivos, perfiles, familias de pistas, derivación, catálogo de bibliotecas |
| [`@motif-studio/automation`](packages/automation) | Pistas, macros, envolventes, captura |
| [`@motif-studio/library`](packages/library) | Plantillas, instantáneas, ramas, favoritos, comparar |

### Infraestructura

| Paquete | Descripción |
|---------|-------------|
| [`@motif-studio/scene-mapper`](packages/scene-mapper) | Mapeo de disparadores y evaluación determinista de enlaces |
| [`@motif-studio/runtime-pack`](packages/runtime-pack) | Exportación/importación en tiempo de ejecución con serialización determinista |
| [`@motif-studio/review`](packages/review) | Resúmenes y auxiliares de auditoría |
| [`@motif-studio/ui`](packages/ui) | Componentes de interfaz de usuario compartidos |

## Instalar

```bash
npm install @motif-studio/schema @motif-studio/clip-engine @motif-studio/runtime-pack
```

Todos los paquetes se publican en npm bajo el ámbito `@motif-studio`.

## Guía de inicio rápido (monorepositorio)

```bash
pnpm install
pnpm build
pnpm test       # 1,709 tests across all packages
pnpm dev        # Start Studio dev server
```

**Requisitos:** Node.js >= 22, pnpm >= 10

## Pruebas

Los 16 paquetes incluyen pruebas unitarias que cubren la validación de esquemas, la auditoría de integridad, las operaciones de ejemplo, la puntuación del mundo, la automatización, la gestión de bibliotecas, la reproducción, la síntesis, los efectos, MIDI, la ingesta de generación y la integración con el estudio. 1709 pruebas en todos los paquetes.

Ejecutar todo: `pnpm test`

## Manual

El [manual](https://mcp-tool-shop-org.github.io/motif/handbook/product/) es el manual de operación completo que cubre la definición del producto, la arquitectura, la navegación del estudio, los flujos de trabajo creativos y la estrategia. Puntos de entrada clave:

- [Producto: ¿Qué es Motif?](https://mcp-tool-shop-org.github.io/motif/handbook/product/)
- [Arquitectura: Descripción general del repositorio](https://mcp-tool-shop-org.github.io/motif/handbook/architecture/)
- [Flujo de trabajo: Creación de una pista desde cero](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/building-a-cue/)
- [Flujo de trabajo: Pistas generadas y paquetes de biblioteca](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/generated-cues/)
- [Flujo de trabajo: Trabajar con muestras personalizadas](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/custom-samples/)
- [Flujo de trabajo: Puntuación del mundo](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/world-scoring/)
- [Estrategia: Glosario](https://mcp-tool-shop-org.github.io/motif/handbook/strategy/glossary/)
- [Ejemplos de paquetes](examples/)

## Seguridad y confianza

**El estudio se ejecuta completamente en el navegador.** No hay servidor, no hay sincronización con la nube, no hay telemetría.

- **Datos accedidos:** Archivos de paquetes de banda sonora creados por el usuario (JSON), referencias a activos de audio, almacenamiento local del navegador
- **Datos NO accedidos:** No hay almacenamiento en el lado del servidor, no hay acceso al sistema de archivos más allá del entorno aislado del navegador
- **Red:** La aplicación Studio no realiza ninguna comunicación de red; toda la creación y reproducción se realizan en el lado del cliente.
- **Credenciales:** No lee, almacena ni transmite credenciales.
- **Telemetría:** Ninguna recopilada o enviada.
- **Permisos:** Solo API estándar del navegador (Web Audio API)

**Una excepción, y es opcional y está fuera de la aplicación:** `@motif-studio/sample-lab` incluye una herramienta de generación en línea de comandos que se comunica con un punto final de Comfy Cloud para enviar y recuperar trabajos de generación. Solo se ejecuta cuando lo invoca desde una terminal, nunca es importada por la aplicación Studio y lee sus credenciales de su propio entorno. Puede omitirla por completo y Motif seguirá funcionando completamente sin conexión.

Consulte [SECURITY.md](SECURITY.md) para informar sobre vulnerabilidades.

## Licencia

MIT

---

Creado por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
