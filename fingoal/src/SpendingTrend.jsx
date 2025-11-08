
// SpendingTrend.jsx — BAR CHART (larger axes, fixed left padding)
import React, { useMemo, useState, useRef } from "react";
import { useMonth } from "./state/MonthContext";
import { getDailySeries } from "./data/txStore";

const CHART_W = 1700;   // slightly wider for spacing
const CHART_H = 420;
const PAD_X = 140;      // increased from 90 → fixes "$" cutoff
const PAD_Y = 56;

const fmtMoney = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default function SpendingTrend() {
  const { month } = useMonth();

  const {
    year,
    monthIndex,
    days,
    incomeTotals,
    outcomeTotals,
    maxIncome,
    maxOutcome,
  } = useMemo(() => getDailySeries(month), [month]);

  const maxY = Math.max(1, maxIncome, maxOutcome);
  const innerW = CHART_W - PAD_X * 2;
  const innerH = CHART_H - PAD_Y * 2;

  // ticks
  const yTicks = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const v = (i / steps) * maxY;
      const y = PAD_Y + innerH - (v / maxY) * innerH;
      return { y, v };
    });
  }, [maxY, innerH]);

  const xTicks = useMemo(() => {
    if (days <= 1) return [];
    const every = Math.max(1, Math.ceil(days / 7));
    const list = [];
    for (let d = 1; d <= days; d += every) {
      const i = d - 1;
      const x = PAD_X + (i / (days - 1)) * innerW;
      list.push({ x, d });
    }
    if (list[list.length - 1]?.d !== days) {
      list.push({ x: PAD_X + innerW, d: days });
    }
    return list;
  }, [days, innerW]);

  const groupW = days > 0 ? innerW / Math.max(1, days) : 0;
  const barWidth = groupW * 0.36;
  const gap = groupW * 0.08;
  const dayCenterX = (i) =>
    PAD_X + (days <= 1 ? 0 : (i / (days - 1)) * innerW);

  // hover
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);

  const onMove = (e) => {
    if (!svgRef.current || days <= 1) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const t = Math.min(Math.max(px - PAD_X, 0), innerW) / innerW;
    setHoverIdx(Math.round(t * (days - 1)));
  };
  const onLeave = () => setHoverIdx(null);

  const hoverX = hoverIdx != null ? dayCenterX(hoverIdx) : null;
  const incAt = hoverIdx != null ? incomeTotals[hoverIdx] || 0 : 0;
  const outAt = hoverIdx != null ? outcomeTotals[hoverIdx] || 0 : 0;

  const hoverDateLabel = useMemo(() => {
    if (hoverIdx == null) return "";
    const d = new Date(year, monthIndex, hoverIdx + 1);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [hoverIdx, year, monthIndex]);

  return (
    <div style={{ borderRadius: 20, marginTop: 20, background: "white", border: "1px solid #f2f2f2", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#111827" }}>Monthly Trend</h3>
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>
        <div style={{ color: "#10b981", fontWeight: 800 }}>
            Highest income: {fmtMoney(maxIncome)}
        </div>
        <div style={{ color: "#ef4444", fontWeight: 800 }}>
            Highest spend: {fmtMoney(maxOutcome)}
        </div>
        </div>

      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 12, marginLeft: 8 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#065f46", fontSize: 18, fontWeight: 800 }}>
          <span style={{ width: 20, height: 6, background: "#10b981", borderRadius: 3 }} />
          Income
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#7f1d1d", fontSize: 18, fontWeight: 800 }}>
          <span style={{ width: 20, height: 6, background: "#ef4444", borderRadius: 3 }} />
          Spending
        </span>
      </div>

      <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 16 }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          width="100%"
          height={CHART_H}
          style={{ display: "block", cursor: "crosshair" }}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          {/* Grid & axes */}
          {yTicks.map(({ y }, i) => (
            <line key={`gy-${i}`} x1={PAD_X} y1={y} x2={CHART_W - PAD_X} y2={y} stroke="#e5e7eb" />
          ))}
          <line x1={PAD_X} y1={CHART_H - PAD_Y} x2={CHART_W - PAD_X} y2={CHART_H - PAD_Y} stroke="#d1d5db" />
          <line x1={PAD_X} y1={PAD_Y} x2={PAD_X} y2={CHART_H - PAD_Y} stroke="#d1d5db" />

          {/* Enlarged axis labels (adjusted for padding) */}
          {yTicks.map(({ y, v }, i) => (
            <text
              key={`yl-${i}`}
              x={PAD_X - 24}   // extra spacing for $
              y={y + 10}
              textAnchor="end"
              fontSize="36"
              fill="#111827"
              style={{ fontWeight: 900 }}
            >
              {fmtMoney(Math.round(v))}
            </text>
          ))}

          {xTicks.map(({ x, d }, i) => (
            <g key={`xt-${i}`}>
              <line x1={x} y1={CHART_H - PAD_Y} x2={x} y2={CHART_H - PAD_Y + 10} stroke="#9ca3af" />
              <text
                x={x}
                y={CHART_H - PAD_Y + 42}
                fontSize="32"
                textAnchor="middle"
                fill="#111827"
                style={{ fontWeight: 900 }}
              >
                {d}
              </text>
            </g>
          ))}

          {/* Bars */}
          {Array.from({ length: Math.max(0, days) }).map((_, i) => {
            const cx = PAD_X + (i / (days - 1)) * innerW;
            const income = incomeTotals[i] || 0;
            const spend = outcomeTotals[i] || 0;

            const incH = (income / maxY) * innerH;
            const outH = (spend / maxY) * innerH;

            const incX = cx - barWidth - gap * 0.5;
            const outX = cx + gap * 0.5;
            const incY = PAD_Y + innerH - incH;
            const outY = PAD_Y + innerH - outH;

            return (
              <g key={i}>
                {income > 0 && (
                  <rect x={incX} y={incY} width={barWidth} height={incH} fill="#10b981" rx="3" />
                )}
                {spend > 0 && (
                  <rect x={outX} y={outY} width={barWidth} height={outH} fill="#ef4444" rx="3" />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
