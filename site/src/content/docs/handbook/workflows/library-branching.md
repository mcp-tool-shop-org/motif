---
title: Library, Branching, and Reuse
description: Templates, snapshots, branches, favorites, collections, and compare
sidebar:
  order: 4
---

The Library system makes recall and reuse first-class creative actions. Instead of losing good ideas to iteration, Motif preserves them — and makes it easy to build new work from existing material.

## Templates

Templates capture the shape of an entity as a reusable starting point. `instantiateTemplate(template, newId)` returns new entity data with a fresh ID — changes don't affect the template.

**When to use**: When you find yourself creating the same kind of entity repeatedly with similar settings.

## Snapshots

A snapshot freezes the state of an entity at a moment in time. `restoreSnapshot(snapshot)` returns a copy for reverting or creating new entities.

**When to use**: Before destructive changes. About to rework a combat scene? Snapshot it first.

## Branches

A branch creates a new, independent entity from a snapshot — diverging from the original while preserving lineage. `traceLineage` walks the full chain back to the root entity.

**When to use**: When you want to try something radically different without losing the original.

## Favorites and Collections

Favorites are lightweight bookmarks referencing any entity. Collections are named groups of favorites for organizing into meaningful sets ("Combat sounds", "Ready to ship").

## Compare

`compareEntities(a, b, entityKind, labelA, labelB)` produces a field-by-field diff showing identical, changed, onlyA, and onlyB fields. Use it to compare snapshots, branches against their origin, or templates before choosing one.

## The Reuse Philosophy

1. **Recall is a creative act.** Finding and reusing a great idea should be as natural as composing a new one.
2. **Divergence, not duplication.** Branches and templates produce starting points, not clones.
3. **Lineage matters.** Snapshot-to-branch relationships are preserved. You can always trace how music evolved.
4. **Lightweight bookmarking.** Mark freely, organize loosely. Don't overthink taxonomy.
5. **Comparison is underrated.** Seeing exactly what changed is the fastest way to evaluate creative decisions.
