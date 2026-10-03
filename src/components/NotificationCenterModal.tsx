import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  AlertCircle, 
  Clock, 
  Mail, 
  Check, 
  Send,
  Edit3,
  Users,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';
import { AppNotification, BridgeTask, UserProfile } from '../types/bridge';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onSelectTask: (taskId: string) => void;
  onSendCustomEmailDigest: (recipients: string[], subject: string, body: string) => void;
  tasks: BridgeTask[];
  allUsers: UserProfile[];
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectTask,
  onSendCustomEmailDigest,
  tasks,
  allUsers,
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'compose_email'>('notifications');
  const [notiFilter, setNotiFilter] = useState<'all' | 'overdue' | 'due_soon'>('all');

  // Email Composition States
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [emailSent, setEmailSent] = useState(false);

  // Initialize selected emails & default email content
  useEffect(() => {
    if (isOpen) {
      // Default: select engineers who have overdue or due soon tasks
      const overdueTasks = tasks.filter(t => t.status === 'Chậm tiến độ' || (t.progress < 100 && new Date(t.endDate) < new Date()));
      const dueSoonTasks = tasks.filter(t => {
        if (t.status === 'Hoàn thành') return false;
        const diffDays = Math.ceil((new Date(t.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 5;
      });

      const urgentEmails = new Set<string>();
      [...overdueTasks, ...dueSoonTasks].forEach(t => {
        if (t.assigneeEmail) urgentEmails.add(t.assigneeEmail);
      });

      // If any found, select them; otherwise select all
      if (urgentEmails.size > 0) {
        setSelectedEmails(Array.from(urgentEmails));
      } else {
        setSelectedEmails(allUsers.map(u => u.email));
      }

      // Generate default Subject & Content
      const dateStr = new Date().toLocaleDateString('vi-VN');
      setEmailSubject(`[BCH CẦU] Thông báo & Nhắc việc tiến độ công trường ngày ${dateStr}`);

      let content = `Kính gửi các đồng chí Kỹ sư, Đội trưởng hiện trường,\n\n`;
      content += `Ban Chỉ huy công trường gửi thông báo kiểm điểm tiến độ và nhắc nhở các hạng mục quan trọng cần thúc đẩy:\n\n`;

      if (overdueTasks.length > 0) {
        content += `🔴 CÁC HẠNG MỤC CHẬM TIẾN ĐỘ / CẦN TẬP TRUNG:\n`;
        overdueTasks.forEach((t, i) => {
          content += `${i + 1}. [${t.id}] ${t.title}\n   - Phụ trách: ${t.assignee} (${t.assigneeEmail || 'N/A'})\n   - Hạn chót: ${t.endDate} | Tiến độ hiện tại: ${t.progress}%\n   - Vị trí: ${t.location}\n`;
        });
        content += `\n`;
      }

      if (dueSoonTasks.length > 0) {
        content += `🟡 CÁC HẠNG MỤC SẮP ĐẾN HẠN TRONG 5 NGÀY TỚI:\n`;
        dueSoonTasks.forEach((t, i) => {
          content += `${i + 1}. [${t.id}] ${t.title}\n   - Phụ trách: ${t.assignee}\n   - Hạn chót: ${t.endDate} | Tiến độ: ${t.progress}%\n`;
        });
        content += `\n`;
      }

      content += `Đề nghị các bộ phận liên quan tập trung nhân lực, thiết bị, tuân thủ an toàn lao động và cập nhật tiến độ kịp thời lên hệ thống.\n\nTrân trọng,\nBan Chỉ Huy Công Trường`;

      setEmailBody(content);
      setEmailSent(false);
    }
  }, [isOpen, tasks, allUsers]);

  if (!isOpen) return null;

  const filteredNotis = notifications.filter(n => {
    if (notiFilter === 'overdue') return n.type === 'overdue';
    if (notiFilter === 'due_soon') return n.type === 'due_soon';
    return true;
  });

  const overdueCount = notifications.filter(n => n.type === 'overdue').length;
  const dueSoonCount = notifications.filter(n => n.type === 'due_soon').length;

  const toggleSelectEmail = (email: string) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter(e => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  const handleSelectAllEmails = () => {
    if (selectedEmails.length === allUsers.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(allUsers.map(u => u.email));
    }
  };

  const handleSendMail = () => {
    if (selectedEmails.length === 0) return;
    onSendCustomEmailDigest(selectedEmails, emailSubject, emailBody);
    setEmailSent(true);
    setTimeout(() => {
      setEmailSent(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Trung Tâm Thông Báo & Gửi Email Nhắc Việc
              </h3>
              <p className="text-xs text-slate-500">
                Lọc danh sách người nhận, xem trước và chỉnh sửa nội dung thư trước khi gửi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Mode Tabs */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Danh sách Thông Báo ({notifications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('compose_email')}
            className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'compose_email'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Soạn & Gửi Email Nhắc Việc ({selectedEmails.length} người nhận)</span>
          </button>
        </div>

        {/* Tab 1: Notifications List */}
        {activeTab === 'notifications' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Filters */}
            <div className="px-6 py-2.5 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setNotiFilter('all')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    notiFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({notifications.length})
                </button>
                <button
                  onClick={() => setNotiFilter('overdue')}
                  className={`px-3 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
                    notiFilter === 'overdue' ? 'bg-rose-100 text-rose-800 font-bold' : 'text-slate-600 hover:text-rose-700'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  Quá hạn ({overdueCount})
                </button>
                <button
                  onClick={() => setNotiFilter('due_soon')}
                  className={`px-3 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
                    notiFilter === 'due_soon' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-600 hover:text-amber-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Sắp đến hạn ({dueSoonCount})
                </button>
              </div>

              <button
                onClick={onMarkAllAsRead}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đã xem hết</span>
              </button>
            </div>

            {/* List */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 max-h-[420px]">
              {filteredNotis.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <CheckCheck className="w-10 h-10 mx-auto text-emerald-400 mb-2 opacity-80" />
                  <p className="font-semibold text-slate-700 text-sm">Không có cảnh báo mới!</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Các hạng mục thi công đang đảm bảo mốc tiến độ đề ra.
                  </p>
                </div>
              ) : (
                filteredNotis.map(noti => {
                  const isOverdue = noti.type === 'overdue';
                  const isDueSoon = noti.type === 'due_soon';

                  return (
                    <div
                      key={noti.id}
                      onClick={() => {
                        if (noti.taskId) {
                          onSelectTask(noti.taskId);
                          onClose();
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isOverdue 
                          ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300' 
                          : isDueSoon 
                          ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isOverdue ? 'bg-rose-100 text-rose-600' : isDueSoon ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {isOverdue ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{noti.title}</h4>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{noti.message}</p>
                          </div>
                        </div>
                        {noti.taskId && (
                          <span className="font-mono text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                            {noti.taskId}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Switch to Compose */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Có {overdueCount + dueSoonCount} việc cần gửi email đôn đốc hiện trường
              </span>
              <button
                onClick={() => setActiveTab('compose_email')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Soạn Email Nhắc Kỹ Sư</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Compose Email (Choose Recipients & Edit Content) */}
        {activeTab === 'compose_email' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Step 1: Choose Recipients */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Chọn kỹ sư nhận email nhắc nhở ({selectedEmails.length}/{allUsers.length}):</span>
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllEmails}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  {selectedEmails.length === allUsers.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả kỹ sư'}
                </button>
              </div>

              {/* Recipient Checkbox Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 max-h-40 overflow-y-auto">
                {allUsers.map(u => {
                  const isChecked = selectedEmails.includes(u.email);
                  return (
                    <div
                      key={u.email}
                      onClick={() => toggleSelectEmail(u.email)}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked 
                          ? 'border-blue-500 bg-blue-50/80 text-blue-900 font-semibold' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate text-slate-900 font-medium">{u.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{u.email} • {u.roleTitle}</div>
                      </div>
                      <div className="shrink-0 text-blue-600">
                        {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Edit Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Tiêu đề Email:</span>
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                placeholder="Tiêu đề email nhắc việc..."
              />
            </div>

            {/* Step 3: Edit Body */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Nội dung thư nhắc nhở (Có thể chỉnh sửa theo yêu cầu trước khi gửi):</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Hỗ trợ định dạng văn bản trực tiếp
                </span>
              </label>
              <textarea
                rows={9}
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-mono bg-slate-50/50"
                placeholder="Nhập nội dung nhắc nhở..."
              />
            </div>

            {/* Action buttons */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {selectedEmails.length === 0 ? (
                  <span className="text-rose-600 font-medium">⚠️ Vui lòng chọn ít nhất 1 người nhận</span>
                ) : (
                  <span>Gửi tới <strong>{selectedEmails.length}</strong> địa chỉ email</span>
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('notifications')}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  disabled={selectedEmails.length === 0 || emailSent}
                  onClick={handleSendMail}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    emailSent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 cursor-pointer'
                  }`}
                >
                  {emailSent ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã gửi thành công!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Gửi Email Ngay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
