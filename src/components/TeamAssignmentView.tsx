import React, { useState } from 'react';
import { BridgeTask } from '../types/bridge';
import { 
  Users, 
  HardHat, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface TeamAssignmentViewProps {
  tasks: BridgeTask[];
  onSelectAssignee: (assignee: string) => void;
  onEditTask: (task: BridgeTask) => void;
}

export const TeamAssignmentView: React.FC<TeamAssignmentViewProps> = ({
  tasks,
  onSelectAssignee,
  onEditTask,
}) => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Group tasks by assignee
  const memberMap = new Map<string, { role: string; tasks: BridgeTask[] }>();

  tasks.forEach(t => {
    const name = t.assignee || 'Chưa phân công';
    if (!memberMap.has(name)) {
      memberMap.set(name, {
        role: t.assigneeRole || 'Kỹ sư hiện trường',
        tasks: []
      });
    }
    memberMap.get(name)!.tasks.push(t);
  });

  const members = Array.from(memberMap.entries()).map(([name, data]) => {
    const total = data.tasks.length;
    const completed = data.tasks.filter(t => t.status === 'Hoàn thành').length;
    const delayed = data.tasks.filter(t => t.status === 'Chậm tiến độ').length;
    const avgProgress = total > 0 
      ? Math.round(data.tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / total) 
      : 0;

    return {
      name,
      role: data.role,
      tasks: data.tasks,
      total,
      completed,
      delayed,
      avgProgress
    };
  });

  const activeMemberData = members.find(m => m.name === selectedMember) || members[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-800">
            Phân Công Nhiệm Vụ & Năng Lực Đội Ngũ Kỹ Sư Hiện Trường
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {members.length} nhân sự / tổ đội đang đảm nhiệm
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Left: Member List */}
        <div className="lg:col-span-4 p-3 space-y-2 max-h-[500px] overflow-y-auto">
          {members.map(m => {
            const isSelected = activeMemberData?.name === m.name;
            return (
              <div
                key={m.name}
                onClick={() => setSelectedMember(m.name)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-amber-500 bg-amber-50/60 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-sm">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                      <p className="text-[11px] text-slate-500">{m.role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {m.total} việc
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600 font-medium">
                      ✓ {m.completed} xong
                    </span>
                    {m.delayed > 0 && (
                      <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> {m.delayed} trễ
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-slate-700">{m.avgProgress}% tiến độ</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Assigned Tasks for Selected Member */}
        <div className="lg:col-span-8 p-4 bg-slate-50/30">
          {activeMemberData ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{activeMemberData.name}</h3>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                      {activeMemberData.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đang chịu trách nhiệm {activeMemberData.tasks.length} hạng mục xây dựng cầu
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Hoàn thành</span>
                    <span className="text-sm font-bold text-amber-600">{activeMemberData.avgProgress}%</span>
                  </div>
                  <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full" 
                      style={{ width: `${activeMemberData.avgProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Task Cards */}
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {activeMemberData.tasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => onEditTask(t)}
                    className="p-3 bg-white rounded-lg border border-slate-200 hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-500">{t.id}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                          {t.wbs}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          t.status === 'Hoàn thành' 
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'Chậm tiến độ'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 truncate">{t.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        📍 {t.location || 'Tại công trường'} • Hạn chót: {t.endDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-800">{t.progress}%</span>
                        <span className="text-[10px] text-slate-400 block">{t.actualQty}/{t.plannedQty} {t.unit}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              Chọn một nhân sự để xem danh sách nhiệm vụ được phân công.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
