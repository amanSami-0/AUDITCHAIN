import AuditTable from './_components/AuditTable';
import StatGrid from './_components/StatGrid';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-slate-200 p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Aggregated Audit Data</h1>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base">
              Real-time system audit events and security thresholds. Monitoring active sessions and protocol integrity.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-transparent border border-slate-800 rounded-md hover:bg-slate-900 transition-colors">
              Export CSV
            </button>
            <button className="px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-md hover:bg-orange-500 transition-colors shadow-lg shadow-orange-900/20">
              Advanced Filter
            </button>
          </div>
        </div>

        {/* The Table Section */}
        <section className="bg-[#161616] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <AuditTable />
        </section>

        {/* Statistics Cards */}
        <StatGrid />
      </div>
    </div>
  );
}