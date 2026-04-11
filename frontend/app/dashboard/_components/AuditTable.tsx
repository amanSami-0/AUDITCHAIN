"use client";

type Severity = 'CRITICAL' | 'HIGH' | 'LOW' | 'MEDIUM';

interface AuditLog {
  id: string;
  timestamp: string;
  eventType: string;
  window: string;
  count: number;
  severity: Severity;
  status: 'Exceeded' | 'Within Limits';
}

const mockData: AuditLog[] = [
  { id: '1', timestamp: 'Oct 24, 2023 14:32:01', eventType: 'Failed Login Attempt', window: '15m Window', count: 142, severity: 'CRITICAL', status: 'Exceeded' },
  { id: '2', timestamp: 'Oct 24, 2023 14:30:15', eventType: 'Data Export (Bulk)', window: '1h Window', count: 12, severity: 'HIGH', status: 'Within Limits' },
  { id: '3', timestamp: 'Oct 24, 2023 14:28:44', eventType: 'Auth Token Refresh', window: '5m Window', count: 894, severity: 'LOW', status: 'Within Limits' },
];

export default function AuditTable() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#1c1c1c] border-b border-slate-800">
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Type</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Window</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Count</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Severity</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {mockData.map((log) => (
            <tr key={log.id} className="hover:bg-slate-900/40 transition-colors group">
              <td className="p-4 text-sm text-slate-400 font-mono">{log.timestamp}</td>
              <td className="p-4 text-sm font-medium text-slate-200">{log.eventType}</td>
              <td className="p-4 text-sm text-slate-500">{log.window}</td>
              <td className="p-4 text-sm text-right font-bold text-white tabular-nums">{log.count}</td>
              <td className="p-4 text-center">
                <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded border ${
                  log.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                  log.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                  'bg-blue-500/10 text-blue-500 border-blue-500/20'
                }`}>
                  {log.severity}
                </span>
              </td>
              <td className={`p-4 text-sm font-semibold ${log.status === 'Exceeded' ? 'text-red-400' : 'text-emerald-400'}`}>
                {log.status === 'Exceeded' ? '⚠ Exceeded' : '✓ Within Limits'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}