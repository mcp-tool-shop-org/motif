<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/test-kit

Herramientas de prueba, paquetes de ejemplo y utilidades para los paquetes de Motif.

## Qué incluye

- Archivos de configuración (fixtures) en formato JSON para pruebas (paquetes mínimos, paquetes de prueba de integridad, paquetes inválidos).
- Utilidades para cargar los archivos de configuración.
- Resolución de rutas de los archivos de configuración.

## Exportaciones principales

```ts
import { FIXTURES, loadFixture, fixturePath } from "@motif/test-kit";

const pack = loadFixture(FIXTURES.MINIMAL_PACK);
```

### Archivos de configuración (fixtures)

| Constante | Archivo de configuración | Propósito |
|----------|-------------|---------|
| `MINIMAL_PACK` | `minimal-pack.json` | Paquete válido con la configuración mínima. |
| `STARTER_PACK` | `starter-pack.json` | Paquete de inicio más completo. |
| `INVALID_MISSING_META` | `invalid-pack-missing-meta.json` | Validación del esquema: falta de metadatos. |
| `INVALID_BAD_TRANSITION` | `invalid-pack-bad-transition.json` | Validación del esquema: transición incorrecta. |
| `INVALID_EMPTY_SCENE_LAYERS` | `invalid-pack-empty-scene-layers.json` | Validación del esquema: capas vacías. |
| `INVALID_BAD_ASSET_DURATION` | `invalid-pack-bad-asset-duration.json` | Validación del esquema: duración incorrecta. |
| `INTEGRITY_VALID` | `integrity-valid-pack.json` | Integridad: paquete correcto. |
| `INTEGRITY_MISSING_ASSET_REF` | `integrity-missing-asset-ref.json` | Integridad: referencia de activo rota. |
| `INTEGRITY_MISSING_STEM_REF` | `integrity-missing-stem-ref.json` | Integridad: referencia de pista rota. |
| `INTEGRITY_MISSING_SCENE_REF` | `integrity-missing-scene-ref.json` | Integridad: referencia de escena rota. |
| `INTEGRITY_DUPLICATE_IDS` | `integrity-duplicate-ids.json` | Integridad: IDs duplicados. |
| `INTEGRITY_SELF_REFERENCE` | `integrity-self-reference-pack.json` | Integridad: entidades con referencias a sí mismas. |
| `INTEGRITY_UNUSED_ENTITIES` | `integrity-unused-entities.json` | Integridad: entidades no utilizadas. |

## Qué no incluye

- Pruebas a nivel de aplicación (estas se encuentran en el directorio `test/` de cada paquete).
- Configuración del entorno de pruebas (cada paquete tiene su propio archivo `vitest.config.ts`).
