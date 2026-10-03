import React, { useState } from 'react';
import { BridgeTask, UserProfile } from '../types/bridge';
import { 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  User, 
  Calendar,
  CloudSun,
  HardHat,
  ChevronDown,
  ArrowUpDown,
  FileSpreadsheet,
  Lock,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';

interface TaskTableProps {
  tasks: BridgeTask[];
  currentProfile: UserProfile;
  onEditTask: (task: BridgeTask) => void;
  onDeleteTask: (task: BridgeTask) => void;
  onUpdateStatus: (taskId: string, newStatus: BridgeTask['status']) => void;
  onQuickProgressChange: (taskId: string, newProgress: number) => void;
  hideCompleted?: boolean;
  onToggleHideCompleted?: () => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  currentProfile,
  onEditTask,
  onDeleteTask,
  onUpdateStatus,
  onQuickProgressChange,
  hideCompleted = false,
  onToggleHideCompleted,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [wbsFilter, setWbsFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'endDate' | 'progress' | 'priority' | 'wbs'>('endDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Count completed tasks
  const completedCount = tasks.filter(t => t.status === 'Hoàn thành' || t.progress === 100).length;

  // RBAC Permission checks
  const canDelete = currentProfile.role === 'ADMIN';
  const canEditAny = currentProfile.role === 'ADMIN' || currentProfile.role === 'PROJECT_MANAGER';

  // Helper to determine if user can edit this specific task
  const canEditTask = (task: BridgeTask) => {
    if (canEditAny) return true;
    // Team member can only edit task assigned to them
    if (currentProfile.role === 'TEAM_MEMBER') {
      const matchEmail = task.assigneeEmail && currentProfile.email && 
        task.assigneeEmail.toLowerCase() === currentProfile.email.toLowerCase();
      const matchName = task.assignee && currentProfile.name &&
        task.assignee.toLowerCase().includes(currentProfile.name.toLowerCase());
      return matchEmail || matchName;
    }
    return false;
  };

  // Unique assignees and WBS categories
  const assignees = Array.from(new Set(tasks.map(t => t.assignee))).filter(Boolean);
  const wbsCategories = Array.from(new Set(tasks.map(t => t.wbs))).filter(Boolean);

  // Filtering
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.notes && task.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAssignee = assigneeFilter === 'all' || task.assignee === assigneeFilter;
    const matchesWbs = wbsFilter === 'all' || task.wbs === wbsFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesCompleted = hideCompleted ? (task.status !== 'Hoàn thành' && task.progress < 100) : true;

    return matchesSearch && matchesAssignee && matchesWbs && matchesPriority && matchesCompleted;
  });

  // Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'endDate') {
      return sortOrder === 'asc' 
        ? new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        : new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
    }
    if (sortBy === 'progress') {
      return sortOrder === 'asc' ? a.progress - b.progress : b.progress - a.progress;
    }
    if (sortBy === 'priority') {
      const order = { 'Khẩn cấp': 4, 'Cao': 3, 'Trung bình': 2, 'Thấp': 1 };
      return sortOrder === 'asc' 
        ? (order[a.priority] || 0) - (order[b.priority] || 0)
        : (order[b.priority] || 0) - (order[a.priority] || 0);
    }
    if (sortBy === 'wbs') {
      return sortOrder === 'asc' ? a.wbs.localeCompare(b.wbs) : b.wbs.localeCompare(a.wbs);
    }
    return 0;
  });

  const getStatusBadge = (status: BridgeTask['status']) => {
    switch (status) {
      case 'Hoàn thành':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành</span>;
      case 'Đang thi công':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><HardHat className="w-3.5 h-3.5" /> Đang thi công</span>;
      case 'Chậm tiến độ':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 animate-pulse"><AlertCircle className="w-3.5 h-3.5" /> Chậm tiến độ</span>;
      case 'Nghiệm thu':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"><Clock className="w-3.5 h-3.5" /> Nghiệm thu</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Chưa bắt đầu</span>;
    }
  };

  const getPriorityBadge = (priority: BridgeTask['priority']) => {
    switch (priority) {
      case 'Khẩn cấp':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Khẩn cấp</span>;
      case 'Cao':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Cao</span>;
      case 'Trung bình':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">Trung bình</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-normal bg-slate-50 text-slate-500">Thấp</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên công việc, mã CV, vị trí, kỹ sư..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* WBS filter */}
          <select
            value={wbsFilter}
            onChange={(e) => setWbsFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả hạng mục WBS</option>
            {wbsCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Assignee filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả người phụ trách</option>
            {assignees.map(eng => (
              <option key={eng} value={eng}>{eng}</option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Mọi mức ưu tiên</option>
            <option value="Khẩn cấp">Khẩn cấp</option>
            <option value="Cao">Cao</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Thấp">Thấp</option>
          </select>

          {/* Hide/Show Completed Tasks Toggle */}
          {onToggleHideCompleted && (
            <button
              onClick={onToggleHideCompleted}
              className={`p-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                hideCompleted
                  ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
              title={hideCompleted ? 'Đang ẩn các việc hoàn thành. Bấm để hiện tất cả' : 'Bấm để ẩn các công việc đã hoàn thành 100%'}
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

          {/* Sorting */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 text-xs flex items-center gap-1"
            title={`Sắp xếp: ${sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{sortOrder === 'asc' ? 'Tăng' : 'Giảm'}</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-3 w-16 text-center">Mã</th>
              <th className="py-3 px-4 min-w-[240px]">Hạng mục & Tên công việc</th>
              <th className="py-3 px-4 min-w-[160px]">Kỹ sư / Phụ trách</th>
              <th className="py-3 px-3 min-w-[150px]">Tiến độ thi công</th>
              <th className="py-3 px-3 min-w-[130px]">Khối lượng</th>
              <th className="py-3 px-3 min-w-[130px]">Thời gian</th>
              <th className="py-3 px-3 min-w-[120px]">Trạng thái</th>
              <th className="py-3 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-medium text-slate-700">Không tìm thấy công việc nào phù hợp</p>
                  <p className="text-xs text-slate-400 mt-1">Hãy thử xóa bộ lọc tìm kiếm hoặc thêm công việc mới.</p>
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => {
                const isOverdue = new Date(task.endDate) < new Date() && task.status !== 'Hoàn thành';
                const editable = canEditTask(task);

                return (
                  <tr key={task.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Task ID */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-600 bg-slate-50/30">
                      {task.id}
                    </td>

                    {/* Title & WBS */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                          {task.wbs}
                        </span>
                        {getPriorityBadge(task.priority)}
                        {task.location && (
                          <span className="flex items-center text-[11px] text-slate-600 truncate max-w-[180px]">
                            <MapPin className="w-3 h-3 text-slate-400 mr-0.5 shrink-0" />
                            {task.location}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
                        {task.title}
                      </p>
                      {task.notes && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 italic">
                          📝 {task.notes}
                        </p>
                      )}
                      {task.weatherNotes && (
                        <p className="text-[11px] text-amber-700 mt-0.5 flex items-center gap-1">
                          <CloudSun className="w-3 h-3 text-amber-500 shrink-0" />
                          {task.weatherNotes}
                        </p>
                      )}
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {task.assignee ? task.assignee.charAt(0) : '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{task.assignee}</p>
                          <p className="text-[11px] text-slate-500">{task.assigneeRole}</p>
                          {task.assigneeEmail && (
                            <p className="text-[10px] text-slate-400 truncate max-w-[130px]">{task.assigneeEmail}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Progress with Quick Slider */}
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">{task.progress}%</span>
                          {editable && <span className="text-[10px] text-slate-400">Kéo để chỉnh</span>}
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          disabled={!editable}
                          value={task.progress}
                          onChange={(e) => onQuickProgressChange(task.id, Number(e.target.value))}
                          className={`w-full h-1.5 rounded-lg appearance-none ${
                            editable ? 'cursor-pointer accent-amber-500 bg-slate-200' : 'cursor-not-allowed bg-slate-200 opacity-60'
                          }`}
                        />
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3">
                      {task.plannedQty > 0 ? (
                        <div>
                          <div className="font-medium text-slate-800">
                            {task.actualQty} / {task.plannedQty} {task.unit}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {task.plannedQty > 0 
                              ? `Đạt ${Math.round((task.actualQty / task.plannedQty) * 100)}%` 
                              : ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Schedule */}
                    <td className="py-3 px-3 text-xs">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{task.startDate}</span>
                      </div>
                      <div className={`flex items-center gap-1 font-medium mt-0.5 ${
                        isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'
                      }`}>
                        <span>đến {task.endDate}</span>
                        {isOverdue && <span className="text-[10px] bg-rose-100 text-rose-700 px-1 rounded">Quá hạn</span>}
                      </div>
                    </td>

                    {/* Status Select */}
                    <td className="py-3 px-3">
                      <select
                        value={task.status}
                        disabled={!editable}
                        onChange={(e) => onUpdateStatus(task.id, e.target.value as BridgeTask['status'])}
                        className={`text-xs font-semibold rounded-lg border py-1 px-2 focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          editable 
                            ? 'bg-white border-slate-300 cursor-pointer text-slate-800' 
                            : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                        <option value="Đang thi công">Đang thi công</option>
                        <option value="Chậm tiến độ">Chậm tiến độ</option>
                        <option value="Nghiệm thu">Nghiệm thu</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editable ? (
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Sửa chi tiết nhiệm vụ"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="p-1.5 text-slate-300" title="Chỉ xem (quyền Thành viên nhóm)">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => onDeleteTask(task)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa nhiệm vụ (Chỉ Quản trị viên)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-1">
        <span>Hiển thị <strong>{sortedTasks.length}</strong> / {tasks.length} công việc</span>
        <span className="text-[11px] text-slate-400">
          Phân quyền đang áp dụng: <strong className="text-slate-600">{currentProfile.roleTitle}</strong>
        </span>
      </div>
    </div>
  );
};
