"use client";

import { useStudioStore, type Section } from "../store";
import { useReview } from "../hooks";
import { examplePacks } from "../seed-data";

interface NavGroup {
  label: string;
  items: { section: Section; label: string; icon: string }[];
}

const navGroups: NavGroup[] = [
  {
    label: "Create",
    items: [
      { section: "arrangement", label: "Arrangement", icon: "♫" },
      { section: "clips", label: "Clip Editor", icon: "✎" },
      { section: "scenes", label: "Scenes", icon: "◧" },
      { section: "mixer", label: "Mixer", icon: "≡" },
    ],
  },
  {
    label: "Pack",
    items: [
      { section: "project", label: "Project", icon: "◉" },
      { section: "assets", label: "Assets", icon: "♪" },
      { section: "stems", label: "Stems", icon: "⫾" },
      { section: "bindings", label: "Bindings", icon: "⇌" },
      { section: "transitions", label: "Transitions", icon: "↝" },
    ],
  },
  {
    label: "Quality",
    items: [
      { section: "review", label: "Review", icon: "✓" },
      { section: "export", label: "Export", icon: "↗" },
    ],
  },
  {
    label: "Advanced",
    items: [
      { section: "sample-lab", label: "Sample Lab", icon: "⌥" },
      { section: "score-map", label: "Score Map", icon: "♩" },
      { section: "automation", label: "Automation", icon: "⚙" },
      { section: "library", label: "Library", icon: "◫" },
      { section: "preview", label: "Preview", icon: "▷" },
      { section: "performance", label: "Performance", icon: "⏱" },
      { section: "cues", label: "Cues", icon: "🔔" },
    ],
  },
];

export function SidebarNav() {
  const section = useStudioStore((s) => s.section);
  const setSection = useStudioStore((s) => s.setSection);
  const pack = useStudioStore((s) => s.pack);
  const loadPack = useStudioStore((s) => s.loadPack);
  const { audit } = useReview();

  const totalWarnings = audit.errors.length + audit.warnings.length;

  const handlePackSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = examplePacks.find((p) => p.id === e.target.value);
    if (selected) loadPack(selected.pack);
  };

  return (
    <nav className="nav-rail">
      <div className="nav-brand">♫ Motif</div>
      <div className="nav-items">
        {navGroups.map((group) => (
          <div key={group.label} className="nav-group">
            <div className="nav-group-label">{group.label}</div>
            {group.items.map((item) => (
              <button
                key={item.section}
                className={`nav-item ${section === item.section ? "active" : ""}`}
                onClick={() => setSection(item.section)}
                style={section === item.section ? { borderLeft: "3px solid #4a9eff" } : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.section === "review" && totalWarnings > 0 && (
                  <span
                    className={`nav-badge ${audit.errors.length > 0 ? "error" : ""}`}
                  >
                    {totalWarnings}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="nav-pack-switcher">
        <label className="nav-pack-label">Soundtrack Pack</label>
        <select
          className="nav-pack-select"
          value={pack.meta.id}
          onChange={handlePackSwitch}
        >
          {examplePacks.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
