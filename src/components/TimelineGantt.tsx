import React, { useState } from 'react';
import { BridgeTask, ProjectInfo } from '../types/bridge';
import { Calendar, ChevronLeft, ChevronRight, HardHat, AlertCircle, Clock, Eye, EyeOff } from 'lucide-react';

interface TimelineGanttProps {
  tasks: BridgeTask[];
  onEditTask: (task: BridgeTask) => void;
  hideCompleted?: boolean;
  onToggleHideCompleted?: () => void;
  projectInfo?: ProjectInfo;
}

export const TimelineGantt: React.FC<TimelineGanttProps> = ({ 
  tasks, 
  onEditTask,
  hideCompleted = false,
  onToggleHideCompleted,
  projectInfo,
}) => {
  const completedCount = tasks.filter(t => t.status === 'Hoàn thành' || t.progress === 100).length;

  const displayTasks = hideCompleted
    ? tasks.filter(t => t.status !== 'Hoàn thành' && t.progress < 100)
    : tasks;

  // Find project start and end dates
  const dates = displayTasks.flatMap(t => [new Date(t.startDate), new Date(t.endDate)]).filter(d => !isNaN(d.getTime()));
  
  const minDate = dates.length > 0 
    ? new Date(Math.min(...dates.map(d => d.getTime())))
    : new Date('2026-08-17');
    
  const maxDate = dates.length > 0
    ? new Date(Math.max(...dates.map(d => d.getTime())))
    : new Date('2027-06-30');

  // Add 4 days buffer
  const startTime = minDate.getTime() - 4 * 24 * 3600 * 1000;
  const endTime = maxDate.getTime() + 7 * 24 * 3600 * 1000;
  const totalDuration = Math.max(1, endTime - startTime);

  // Reference date: current local time or project active date
  const today = new Date('2026-09-28').getTime();
  const todayPosition = Math.min(100, Math.max(0, ((today - startTime) / totalDuration) * 100));

  // Generate milestone months for visual axis
  const quarters = [
    { label: 'Q3/2026 (T8 - T9)', percent: 8 },
    { label: 'Q4/2026 (T10 - T12)', percent: 35 },
    { label: 'Q1/2027 (T1 - T3)', percent: 65 },
    { label: 'Q2/2027 (T4 - T6)', percent: 92 },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-800">
              Tiến Độ Thi Công Chi Tiết {projectInfo?.name ? `(${projectInfo.name})` : ''}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hiển thị {displayTasks.length}/{tasks.length} công việc • {projectInfo?.timeframe || '17/08/2026 - 30/06/2027'} • {projectInfo?.package || 'Phân đoạn thi công cầu'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs flex-wrap">
          {onToggleHideCompleted && (
            <button
              onClick={onToggleHideCompleted}
              className={`p-1 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                hideCompleted
                  ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
              title={hideCompleted ? 'Đang ẩn các việc hoàn thành. Bấm để hiện lại' : 'Ẩn các việc đã hoàn thành để tập trung việc đang và sắp làm'}
            >
              {hideCompleted ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                  <span>Đang ẩn CV hoàn thành ({completedCount})</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Ẩn CV hoàn thành ({completedCount})</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span className="text-slate-600">Hoàn thành</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-slate-600">Đang thi công</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-400"></div>
            <span className="text-slate-600">Chưa bắt đầu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-4 border-l-2 border-red-500 border-dashed"></div>
            <span className="text-red-600 font-semibold">Hôm nay</span>
          </div>
        </div>
      </div>

      {/* Gantt Timeline Canvas */}
      <div className="overflow-x-auto">
        <div className="min-w-[850px] relative">
          {/* Header Month / Timeline Marks */}
          <div className="h-8 bg-slate-100/90 rounded-lg flex items-center px-4 text-xs font-semibold text-slate-700 mb-2 justify-between border border-slate-200">
            {quarters.map((q, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>{q.label}</span>
              </span>
            ))}
          </div>

          {/* Today Indicator Line */}
          {todayPosition >= 0 && todayPosition <= 100 && (
            <div 
              className="absolute top-9 bottom-0 w-0.5 border-l-2 border-dashed border-red-500 z-10 pointer-events-none"
              style={{ left: `${todayPosition}%` }}
              title="Mốc thời gian hiện tại"
            >
              <span className="absolute -top-7 -left-7 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                Hôm nay
              </span>
            </div>
          )}

          {/* Task Gantt Bars */}
          <div className="space-y-1.5 py-1 max-h-[550px] overflow-y-auto pr-1">
            {displayTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Không có công việc nào cần hiển thị.
              </div>
            ) : (
              displayTasks.map(task => {
                const taskStart = new Date(task.startDate).getTime();
                const taskEnd = new Date(task.endDate).getTime();
                
                const leftPercent = Math.max(0, Math.min(100, ((taskStart - startTime) / totalDuration) * 100));
                const widthPercent = Math.max(1.5, Math.min(100 - leftPercent, ((taskEnd - taskStart) / totalDuration) * 100));

                let barColor = 'bg-blue-500';
                if (task.status === 'Hoàn thành') barColor = 'bg-emerald-500';
                else if (task.status === 'Chậm tiến độ') barColor = 'bg-rose-500';
                else if (task.status === 'Chưa bắt đầu') barColor = 'bg-amber-400';
                else if (task.status === 'Nghiệm thu') barColor = 'bg-purple-500';

                return (
                  <div
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className="flex items-center group cursor-pointer hover:bg-slate-50/80 rounded py-1 px-1 transition-colors"
                  >
                    {/* Left Task Label */}
                    <div className="w-56 shrink-0 flex items-center justify-between pr-3">
                      <div className="truncate">
                        <span className="font-mono text-[11px] font-bold text-slate-500 mr-1.5">{task.id}</span>
                        <span className="text-xs text-slate-700 font-medium group-hover:text-amber-600 transition-colors">
                          {task.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 shrink-0 ml-1">
                        {task.progress}%
                      </span>
                    </div>

                    {/* Timeline Bar Area */}
                    <div className="flex-1 relative h-6 bg-slate-100 rounded-md overflow-hidden">
                      <div
                        className={`absolute top-1 bottom-1 rounded-sm shadow-xs transition-all ${barColor} flex items-center px-1.5 justify-between`}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                      >
                        {widthPercent > 8 && (
                          <span className="text-[10px] text-white font-bold truncate drop-shadow-xs">
                            {task.assignee}
                          </span>
                        )}
                        {widthPercent > 15 && (
                          <span className="text-[10px] text-white/90 font-medium drop-shadow-xs">
                            {task.startDate} → {task.endDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
