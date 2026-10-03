import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  HardHat, 
  Layers, 
  CalendarCheck,
  Percent
} from 'lucide-react';
import { BridgeTask } from '../types/bridge';

interface StatsOverviewProps {
  tasks: BridgeTask[];
  onFilterByStatus: (status: string | null) => void;
  activeStatusFilter: string | null;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  tasks, 
  onFilterByStatus,
  activeStatusFilter
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Hoàn thành').length;
  const inProgressTasks = tasks.filter(t => t.status === 'Đang thi công').length;
  const delayedTasks = tasks.filter(t => t.status === 'Chậm tiến độ').length;
  const inspectingTasks = tasks.filter(t => t.status === 'Nghiệm thu').length;

  // Weighted overall progress based on task progress
  const averageProgress = totalTasks > 0
    ? Math.round(tasks.reduce((acc, t) => acc + (t.progress || 0), 0) / totalTasks)
    : 0;

  // Key WBS breakdown count
  const wbsCategories = Array.from(new Set(tasks.map(t => t.wbs))).filter(Boolean);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mb-6">
      {/* Total Progress Card */}
      <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-xl border border-slate-700/80 text-white shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Tiến độ bình quân</span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight text-amber-400">{averageProgress}%</span>
            <span className="text-xs text-slate-400">lũy kế</span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${averageProgress}%` }}
            />
          </div>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>{totalTasks} đầu việc dự án</span>
          <span>{wbsCategories.length} phân đoạn</span>
        </div>
      </div>

      {/* In Progress */}
      <button
        onClick={() => onFilterByStatus(activeStatusFilter === 'Đang thi công' ? null : 'Đang thi công')}
        className={`p-4 rounded-xl border text-left transition-all ${
          activeStatusFilter === 'Đang thi công'
            ? 'bg-blue-900/40 border-blue-500 ring-2 ring-blue-500/30'
            : 'bg-white hover:bg-slate-50 border-slate-200'
        } shadow-sm flex flex-col justify-between`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Đang thi công</span>
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <HardHat className="w-4 h-4" />
          </div>
        </div>
        <div className="my-2">
          <span className="text-3xl font-bold text-blue-600">{inProgressTasks}</span>
          <span className="text-xs text-slate-500 ml-1.5">hạng mục</span>
        </div>
        <span className="text-[11px] text-slate-500">Mũi cọc, dầm, bệ trụ</span>
      </button>

      {/* Delayed */}
      <button
        onClick={() => onFilterByStatus(activeStatusFilter === 'Chậm tiến độ' ? null : 'Chậm tiến độ')}
        className={`p-4 rounded-xl border text-left transition-all ${
          activeStatusFilter === 'Chậm tiến độ'
            ? 'bg-rose-900/40 border-rose-500 ring-2 ring-rose-500/30'
            : 'bg-white hover:bg-slate-50 border-slate-200'
        } shadow-sm flex flex-col justify-between`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-600">Chậm tiến độ</span>
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="my-2">
          <span className="text-3xl font-bold text-rose-600">{delayedTasks}</span>
          <span className="text-xs text-slate-500 ml-1.5">cần thúc đẩy</span>
        </div>
        <span className="text-[11px] text-rose-500 font-medium">
          {delayedTasks > 0 ? 'Cần bù khối lượng ngay' : 'Không có công việc trễ'}
        </span>
      </button>

      {/* Inspecting / Acceptance */}
      <button
        onClick={() => onFilterByStatus(activeStatusFilter === 'Nghiệm thu' ? null : 'Nghiệm thu')}
        className={`p-4 rounded-xl border text-left transition-all ${
          activeStatusFilter === 'Nghiệm thu'
            ? 'bg-purple-900/40 border-purple-500 ring-2 ring-purple-500/30'
            : 'bg-white hover:bg-slate-50 border-slate-200'
        } shadow-sm flex flex-col justify-between`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Đang nghiệm thu</span>
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="my-2">
          <span className="text-3xl font-bold text-purple-600">{inspectingTasks}</span>
          <span className="text-xs text-slate-500 ml-1.5">hồ sơ KCS</span>
        </div>
        <span className="text-[11px] text-slate-500">Chờ TVGS / Chủ đầu tư</span>
      </button>

      {/* Completed */}
      <button
        onClick={() => onFilterByStatus(activeStatusFilter === 'Hoàn thành' ? null : 'Hoàn thành')}
        className={`p-4 rounded-xl border text-left transition-all ${
          activeStatusFilter === 'Hoàn thành'
            ? 'bg-emerald-900/40 border-emerald-500 ring-2 ring-emerald-500/30'
            : 'bg-white hover:bg-slate-50 border-slate-200'
        } shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Đã hoàn thành</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="my-2">
          <span className="text-3xl font-bold text-emerald-600">{completedTasks}</span>
          <span className="text-xs text-slate-500 ml-1.5">đã bàn giao</span>
        </div>
        <span className="text-[11px] text-emerald-600 font-medium">
          {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% tổng số việc` : '0%'}
        </span>
      </button>
    </div>
  );
};
