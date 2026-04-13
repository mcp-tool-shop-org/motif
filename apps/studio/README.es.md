<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/studio

La aplicación Studio es la interfaz principal para la creación de paquetes de Motif. Proporciona una interfaz de control con tema oscuro para crear, editar e inspeccionar cada elemento de un paquete.

## Pantallas

| Pantalla | Propósito |
|--------|---------|
| **Project** | Metadatos del paquete, resumen de estadísticas, detección de elementos no utilizados. |
| **Assets** | Operaciones CRUD (crear, leer, actualizar, eliminar) para recursos de audio (música, efectos de sonido, ambiente, efectos especiales, voz). |
| **Stems** | Operaciones CRUD para pistas con asignación de recursos y etiquetado de roles. |
| **Scenes** | Operaciones CRUD para escenas con edición de capas integrada (agregar/eliminar/reordenar). |
| **Bindings** | Operaciones CRUD para enlaces con edición de condiciones integrada. |
| **Transitions** | Operaciones CRUD para transiciones con advertencias de validación específicas del modo. |
| **Review** | Resultados de validación en tiempo real de `@motif-studio/review`, agrupados por gravedad. |
| **Preview** | Simulación del estado de ejecución manual y secuencial con integración del motor. |

## Vista previa

La pantalla de vista previa simula el comportamiento de la banda sonora en tiempo real en función del paquete actual.

Capacidades actuales:
- Vista previa del estado de ejecución manual.
- Simulación de secuencia editable.
- Inspección de enlaces y escenas seleccionados.
- Inspección de pistas activas.
- Visibilidad de transiciones y advertencias.

Esta vista previa se basa en la simulación y no realiza la reproducción real de audio.

## Desarrollo

```bash
pnpm --filter @motif-studio/studio dev    # Next.js dev server
pnpm --filter @motif-studio/studio build  # Production build
pnpm --filter @motif-studio/studio test   # Run tests
```

## Tecnologías

- **Framework:** Next.js 15 (App Router)
- **Estado:** Zustand
- **Validación:** `@motif-studio/review` (obtenido a través del hook `useReview`)
- **Pruebas:** Vitest + Testing Library + jsdom
- **Estilo:** Variables CSS, tema oscuro (sin CSS-in-JS)
