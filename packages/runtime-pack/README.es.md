<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/runtime-pack

Exportación e importación en tiempo de ejecución para paquetes de banda sonora de Motif.

## Qué incluye

- Eliminación de datos innecesarios de los paquetes de creación para generar paquetes de tiempo de ejecución.
- Serialización de paquetes de tiempo de ejecución.
- Verificación de la importación/exportación en ambos sentidos.

## Estado

Paquete provisional. La lógica de exportación en tiempo de ejecución se ampliará en la Fase 20 (Publicación, Empaquetado e Integración en Tiempo de Ejecución) para incluir perfiles de exportación, agrupación de recursos y manifiestos del motor.

## Qué no incluye

- Modelo de datos de creación (ver `@motif-studio/schema`).
- Empaquetado de archivos de audio.
- SDKs de reproducción específicos para cada motor.
