<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/studio

L'application Studio est la principale interface de création pour les packs Motif. Elle fournit une interface de contrôle à thème sombre pour créer, modifier et examiner chaque élément d'un pack.

## Écrans

| Écran | Objectif |
|--------|---------|
| **Project** | Métadonnées du pack, aperçu des statistiques, détection des éléments inutilisés. |
| **Assets** | Opérations CRUD (Création, Lecture, Mise à jour, Suppression) pour les ressources audio (musique, effets sonores, ambiance, effets spéciaux, voix). |
| **Stems** | Opérations CRUD pour les pistes avec affectation de ressources et étiquetage des rôles. |
| **Scenes** | Opérations CRUD pour les scènes avec édition des calques intégrée (ajout/suppression/réorganisation). |
| **Bindings** | Opérations CRUD pour les liaisons avec édition des conditions intégrée. |
| **Transitions** | Opérations CRUD pour les transitions avec avertissements de validation spécifiques au mode. |
| **Review** | Résultats de validation en direct provenant de `@motif/review`, regroupés par gravité. |
| **Preview** | Simulation de l'état d'exécution manuel et séquentiel avec intégration du moteur. |

## Aperçu

L'écran d'aperçu simule le comportement de la bande sonore en temps réel par rapport à la version actuelle du pack.

Fonctionnalités actuelles :
- Aperçu de l'état d'exécution manuel.
- Simulation de séquence modifiable.
- Inspection des liaisons et des scènes sélectionnées.
- Inspection des pistes actives.
- Visibilité des transitions et des avertissements.

Cet aperçu est basé sur une simulation et ne reproduit pas la lecture réelle de l'audio.

## Développement

```bash
pnpm --filter @motif/studio dev    # Next.js dev server
pnpm --filter @motif/studio build  # Production build
pnpm --filter @motif/studio test   # Run tests
```

## Pile technologique

- **Framework :** Next.js 15 (App Router)
- **Gestion de l'état :** Zustand
- **Validation :** `@motif/review` (dérivée via le hook `useReview`)
- **Tests :** Vitest + Testing Library + jsdom
- **Style :** Variables CSS, thème sombre (pas de CSS-in-JS)
