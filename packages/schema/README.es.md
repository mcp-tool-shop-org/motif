<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/schema

Tipos canónicos y validación para los paquetes de banda sonora de Motif.

## Incluye:

- Tipos de TypeScript para todas las entidades principales de la banda sonora.
- Esquemas Zod para el análisis y la validación.
- Funciones de validación seguras con informes de errores estructurados.
- Aplicación de la versión del esquema (`schemaVersion: "1"`).

## Entidades principales:

- `SoundtrackPackMeta`: Identidad y versión del paquete.
- `AudioAsset`: Referencia a un archivo de audio con tipo, duración y puntos de bucle.
- `Stem`: Capa reproducible asociada a un archivo de audio con un rol.
- `Scene`: Estado musical compuesto de capas de audio.
- `SceneLayerRef`: Referencia a una capa de audio dentro de una escena.
- `TriggerCondition` / `TriggerBinding`: Mapeo entre el estado de ejecución y la escena.
- `TransitionRule`: Cómo la música transita entre escenas.
- `SoundtrackPack`: El documento completo del paquete.
- `RuntimeMusicState`: Estructura del estado del juego para la evaluación de disparadores.

## Exportaciones principales:

```ts
import {
  parseSoundtrackPack,
  safeParseSoundtrackPack,
  validateSoundtrackPack,
} from "@motif/schema";
```

### `parseSoundtrackPack(input: unknown): SoundtrackPack`

Análisis estricto. Lanza una excepción si los datos no son válidos.

### `safeParseSoundtrackPack(input: unknown)`

Devuelve `{ success: true, data }` o `{ success: false, errors }`. Nunca lanza una excepción.

### `validateSoundtrackPack(input: unknown): ValidationResult<SoundtrackPack>`

Devuelve `{ ok, data?, issues }` con un array estructurado de `ValidationIssue[]`.

Cada problema incluye `path`, `code` y `message` para la depuración.

## Reglas de validación:

- Se imponen los campos obligatorios.
- Se imponen los valores de las enumeraciones (tipo de archivo de audio, rol de la capa de audio, categoría de la escena, operador del disparador, modo de transición).
- `durationMs > 0`.
- `loopStartMs >= 0` si está presente.
- `loopEndMs > loopStartMs` si ambos están presentes.
- `priority` debe ser un entero.
- Los disparadores deben tener al menos una condición.
- Las escenas deben tener al menos una capa.
- `durationMs` es obligatorio para las transiciones `crossfade` y `cooldown-fade`.
- `schemaVersion` debe ser `"1"`.

## Alcance:

Este paquete valida la estructura y la corrección a nivel de campo.

Las comprobaciones de integridad de referencias cruzadas (por ejemplo, "la escena hace referencia a una capa de audio inexistente") son gestionadas por paquetes de nivel superior.
