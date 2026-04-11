export default function StatGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card title="ACTIVE ALERTS" value="18" sub="+4 since last hour" color="text-red-500" />
      <Card title="EVENTS SCANNED" value="1.2M" sub="Total volume (24h)" />
      <Card title="AVG SEVERITY" value="Med" sub="Stability index: 94.2%" />
      <Card title="STORAGE STATUS" value="62%" sub="System: Healthy" isProgress />
    </div>
  );
}

function Card({ title, value, sub, color = "text-white", isProgress = false }: any) {
  return (
    <div className="bg-[#161616] p-5 rounded-xl border border-slate-800 space-y-3">
      <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">{title}</p>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      {isProgress && (
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full" style={{ width: value }} />
        </div>
      )}
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}