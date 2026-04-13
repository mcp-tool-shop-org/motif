import type { SiteConfig } from '@mcptoolshop/site-theme';

export const config: SiteConfig = {
  title: 'Motif',
  description: 'Adaptive soundtrack studio for composing, arranging, scoring, and exporting interactive game music',
  logoBadge: 'SW',
  brandName: 'Motif',
  repoUrl: 'https://github.com/mcp-tool-shop-org/motif',
  footerText: 'MIT Licensed — built by <a href="https://github.com/mcp-tool-shop-org" style="color:var(--color-muted);text-decoration:underline">mcp-tool-shop-org</a>',

  hero: {
    badge: 'Adaptive game music',
    headline: 'Motif',
    headlineAccent: 'composition meets adaptation.',
    description: 'A composition-first workstation for authoring adaptive game soundtracks — clips, cues, scenes, layers, automation — with deterministic runtime logic.',
    primaryCta: { href: '#usage', label: 'Get started' },
    secondaryCta: { href: 'handbook/', label: 'Read the Handbook' },
    previews: [
      { label: 'npm', code: 'npm install @motif-studio/schema @motif-studio/clip-engine' },
      { label: 'Clone', code: 'git clone https://github.com/mcp-tool-shop-org/motif.git' },
      { label: 'Dev', code: 'pnpm install && pnpm build && pnpm dev' },
    ],
  },

  sections: [
    {
      kind: 'features',
      id: 'features',
      title: 'What It Can Do',
      subtitle: 'A serious creative instrument for adaptive game score authoring.',
      features: [
        { title: 'Compose', desc: 'Clips with notes, multi-oscillator synth (unison/supersaw), sample instruments, LFO modulation, and intensity variants — structured music authoring, not random generation.' },
        { title: 'Score Worlds', desc: 'Motif families, score profiles, cue families, world map entries, and derivation chains for game-wide musical coherence.' },
        { title: 'Mix and Effect', desc: '8 effect types (EQ, delay, reverb, compressor, chorus, distortion, phaser, limiter) with 4 insert FX slots per stem. MIDI import/export. 24/32-bit WAV rendering.' },
      ],
    },
    {
      kind: 'features',
      id: 'more-features',
      title: 'Studio to Runtime',
      subtitle: 'Author in Studio, export for your game engine.',
      features: [
        { title: 'Adaptive Logic', desc: 'Trigger bindings, transitions, and deterministic scene resolution — music responds to game state predictably.' },
        { title: '1,116 Tests', desc: 'Schema validation, synthesis, effects, MIDI, sample operations, world scoring, automation, library management — all tested.' },
        { title: 'Zero Network', desc: 'Runs entirely in the browser. No server, no cloud sync, no telemetry. Your music stays local.' },
      ],
    },
    {
      kind: 'code-cards',
      id: 'usage',
      title: 'Getting Started',
      cards: [
        { title: 'Setup', code: 'git clone https://github.com/mcp-tool-shop-org/motif.git\ncd motif\npnpm install\npnpm build' },
        { title: 'Run Studio', code: 'pnpm dev\n# Open http://localhost:3000' },
      ],
    },
    {
      kind: 'data-table',
      id: 'packages',
      title: 'Monorepo Packages',
      columns: ['Package', 'Role'],
      rows: [
        ['@motif-studio/schema', 'Canonical types and Zod validation'],
        ['@motif-studio/asset-index', 'Pack integrity indexing and auditing'],
        ['@motif-studio/audio-engine', 'Sample playback and voice management'],
        ['@motif-studio/clip-engine', 'Clip sequencing, transforms, cue scheduling'],
        ['@motif-studio/instrument-rack', 'Multi-oscillator synth, drum voice, sample voice, LFO modulation'],
        ['@motif-studio/music-theory', 'Scales, chords, motifs, intensity'],
        ['@motif-studio/playback-engine', 'Real-time playback, mixing, 8 FX types, MIDI I/O, WAV export'],
        ['@motif-studio/sample-lab', 'Trim, slice, kit, instrument helpers'],
        ['@motif-studio/score-map', 'Motifs, profiles, cue families, derivation'],
        ['@motif-studio/automation', 'Lanes, macros, envelopes, capture'],
        ['@motif-studio/library', 'Templates, snapshots, branches, favorites'],
        ['@motif-studio/scene-mapper', 'Trigger mapping and scene resolution'],
        ['@motif-studio/runtime-pack', 'Runtime export/import'],
        ['@motif-studio/review', 'Summaries and audit helpers'],
        ['@motif-studio/ui', 'Shared UI components'],
        ['@motif-studio/test-kit', 'Fixtures and test utilities'],
      ],
    },
  ],
};
