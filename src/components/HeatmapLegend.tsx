const HeatmapLegend = () => {
  return (
    <section className="rounded-xl bg-slate-900/85 p-3 shadow-lg ring-1 ring-white/10" aria-label="Heatmap legend">
      <h2 className="text-sm font-semibold text-slate-100">Heatmap Legend</h2>
      <div className="mt-2 h-3 rounded bg-gradient-to-r from-red-600 via-yellow-300 to-emerald-700" />
      <div className="mt-2 flex justify-between text-xs text-slate-300">
        <span>Poor</span>
        <span>Acceptable</span>
        <span>Best</span>
      </div>
      <p className="mt-2 text-xs text-slate-400">Heatmap shading is clipped to the selected player&apos;s area.</p>
    </section>
  );
};

export default HeatmapLegend;
