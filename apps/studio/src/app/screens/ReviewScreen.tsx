"use client";

import { useReview } from "../hooks";
import type { AuditFinding } from "@motif/review";

function FindingsList({
  findings,
  severity,
}: {
  findings: AuditFinding[];
  severity: "errors" | "warnings" | "notes";
}) {
  return (
    <div className="findings-section">
      <h4 className={severity}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)} (
        {findings.length})
      </h4>
      {findings.length === 0 ? (
        <p style={{ color: "var(--text-dim)", fontSize: 13 }}>None</p>
      ) : (
        findings.map((f, i) => (
          <div key={i} className="finding-item">
            <span className="finding-code">{f.code}</span>
            <span style={{ flex: 1 }}>{f.message}</span>
            {f.entityType && f.entityId && (
              <span className="finding-entity">
                {f.entityType}:{f.entityId}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export function ReviewScreen() {
  const { summary, audit } = useReview();

  return (
    <>
      <div className="screen-header">
        <h2>Review</h2>
        <p>Pack health: validation, integrity, and coverage findings</p>
      </div>
      <div className="screen-body">
        {/* Summary stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{summary.counts.assets}</div>
            <div className="stat-label">Assets</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{summary.counts.stems}</div>
            <div className="stat-label">Stems</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{summary.counts.scenes}</div>
            <div className="stat-label">Scenes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{summary.counts.bindings}</div>
            <div className="stat-label">Bindings</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{summary.counts.transitions}</div>
            <div className="stat-label">Transitions</div>
          </div>
        </div>

        {/* Categories */}
        <div className="meta-section">
          <h3>Categories Present</h3>
          {summary.categoriesPresent.length === 0 ? (
            <p style={{ color: "var(--text-dim)", fontSize: 13 }}>None</p>
          ) : (
            <div className="category-list">
              {summary.categoriesPresent.map((cat) => (
                <span key={cat} className="badge badge-category">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stem role distribution */}
        <div className="meta-section">
          <h3>Stem Role Distribution</h3>
          {Object.keys(summary.stemRoleDistribution).length === 0 ? (
            <p style={{ color: "var(--text-dim)", fontSize: 13 }}>None</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(summary.stemRoleDistribution)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([role, count]) => (
                  <span key={role} className="badge badge-role">
                    {role}: {count}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Unused */}
        <div className="meta-section">
          <h3>Unused Entities</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{summary.unused.assets}</div>
              <div className="stat-label">Unused Assets</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.unused.stems}</div>
              <div className="stat-label">Unused Stems</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.unused.scenes}</div>
              <div className="stat-label">Unreferenced Scenes</div>
            </div>
          </div>
        </div>

        {/* Findings */}
        <FindingsList findings={audit.errors} severity="errors" />
        <FindingsList findings={audit.warnings} severity="warnings" />
        <FindingsList findings={audit.notes} severity="notes" />
      </div>
    </>
  );
}
