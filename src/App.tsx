import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from './services/auth';
import { 
  createBridgeSpreadsheet, 
  fetchTasksFromSheet, 
  syncAllTasksToSheet,
  syncUsersToSheet,
  syncProjectInfoToSheet 
} from './services/sheets';
import { 
  exportTasksToExcel 
} from './services/excelImportExport';
import { 
  generateTaskNotifications, 
  createActionNotification, 
  sendBrowserNotification 
} from './services/notificationService';
import { BridgeTask, UserProfile, UserRole, AppNotification, ProjectInfo } from './types/bridge';
import { INITIAL_BRIDGE_TASKS, INITIAL_USERS, INITIAL_PROJECT_INFO } from './data/initialData';
import { DIGITIZED_PHUOC_AN_TASKS, PHUOC_AN_USERS, PHUOC_AN_PROJECT_INFO } from './data/phuocAnData';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { BridgeVisualization } from './components/BridgeVisualization';
import { TaskTable } from './components/TaskTable';
import { TimelineGantt } from './components/TimelineGantt';
import { TeamAssignmentView } from './components/TeamAssignmentView';
import { TaskModal } from './components/TaskModal';
import { SheetManagerModal } from './components/SheetManagerModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { RoleManagerModal } from './components/RoleManagerModal';
import { ExcelImportModal, ImportDestinationMode } from './components/ExcelImportModal';
import { ProjectInfoModal } from './components/ProjectInfoModal';
import { 
  HardHat, 
  FileSpreadsheet, 
  Layers, 
  Calendar, 
  Users, 
  ListTodo, 
  AlertCircle,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Upload,
  Download,
  Bell,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem('bridge_spreadsheet_id') || null;
  });
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>('Dự án Cầu Phước An - Gói thầu số 40');
  const [tasks, setTasks] = useState<BridgeTask[]>(DIGITIZED_PHUOC_AN_TASKS);
  const [users, setUsers] = useState<UserProfile[]>(PHUOC_AN_USERS);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(() => {
    try {
      const saved = localStorage.getItem('bridge_project_info');
      return saved ? JSON.parse(saved) : PHUOC_AN_PROJECT_INFO;
    } catch {
      return PHUOC_AN_PROJECT_INFO;
    }
  });

  // Active Role and Profile
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(INITIAL_USERS[0]);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // UI Navigation states
  const [activeTab, setActiveTab] = useState<'table' | 'gantt' | 'team'>('table');
  const [selectedWbs, setSelectedWbs] = useState<string | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<BridgeTask | null>(null);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isProjectInfoModalOpen, setIsProjectInfoModalOpen] = useState(false);

  // Destructive Confirmation modal
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
    isDestructive?: boolean;
    confirmLabel?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Auth Initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);

        // Find or map user profile
        if (currentUser.email) {
          const matched = users.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
          if (matched) {
            setCurrentProfile(matched);
          } else {
            // Default as Admin for app owner or project manager
            const newProf: UserProfile = {
              email: currentUser.email,
              name: currentUser.displayName || currentUser.email.split('@')[0],
              role: 'ADMIN',
              roleTitle: 'Giám đốc Điều hành Dự án'
            };
            setCurrentProfile(newProf);
            setUsers(prev => [newProf, ...prev]);
          }
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Compute Notifications whenever tasks change
  useEffect(() => {
    const autoNotis = generateTaskNotifications(tasks, currentProfile.email);
    setNotifications(autoNotis);
  }, [tasks, currentProfile]);

  // When token and spreadsheetId exist, fetch tasks from sheet
  useEffect(() => {
    if (accessToken && spreadsheetId) {
      loadDataFromSheet(spreadsheetId);
    }
  }, [accessToken, spreadsheetId]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        showToast(`Đăng nhập thành công với tài khoản ${res.user.displayName || res.user.email}`, 'success');
        
        if (!spreadsheetId) {
          setIsSheetModalOpen(true);
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast('Đăng nhập thất bại hoặc bị hủy', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    showToast('Đã đăng xuất', 'info');
  };

  const loadDataFromSheet = async (sheetId: string) => {
    if (!accessToken) return;
    setIsSyncing(true);
    try {
      const result = await fetchTasksFromSheet(accessToken, sheetId);
      if (result.tasks.length > 0) {
        setTasks(result.tasks);
      }
      if (result.users && result.users.length > 0) {
        setUsers(result.users);
      }
      if (result.projectInfo) {
        setProjectInfo(result.projectInfo);
        localStorage.setItem('bridge_project_info', JSON.stringify(result.projectInfo));
      }
      setSpreadsheetTitle(result.sheetTitle);
      showToast(`Đã đồng bộ ${result.tasks.length} công việc, thông tin dự án & phân quyền từ Google Sheet`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Lỗi khi tải dữ liệu từ Google Sheet', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncToGoogleSheets = async () => {
    if (!accessToken) {
      showToast('Vui lòng đăng nhập Google để đồng bộ dữ liệu', 'error');
      await handleLogin();
      return;
    }

    setIsSyncing(true);
    try {
      let targetId = spreadsheetId;
      if (!targetId) {
        // Create new spreadsheet if none exists (creates 3 tabs: Tasks, Users, ProjectInfo)
        const result = await createBridgeSpreadsheet(
          accessToken,
          spreadsheetTitle || `${projectInfo.name} - ${projectInfo.package}`,
          tasks,
          users,
          projectInfo
        );
        targetId = result.spreadsheetId;
        setSpreadsheetId(targetId);
        localStorage.setItem('bridge_spreadsheet_id', targetId);
      } else {
        // Sync tasks, users and project info to existing sheet
        await syncAllTasksToSheet(accessToken, targetId, tasks);
        await syncUsersToSheet(accessToken, targetId, users);
        await syncProjectInfoToSheet(accessToken, targetId, projectInfo);
      }

      showToast(`Đã đồng bộ ${tasks.length} hạng mục, nhân sự và thông tin dự án lên Google Sheet!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Lỗi khi đồng bộ lên Google Sheet', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectSheet = (id: string, title?: string) => {
    setSpreadsheetId(id);
    localStorage.setItem('bridge_spreadsheet_id', id);
    if (title) setSpreadsheetTitle(title);
    if (accessToken) {
      loadDataFromSheet(id);
    }
  };

  const handleCreateNewSheet = async (title: string) => {
    if (!accessToken) {
      showToast('Vui lòng đăng nhập Google trước', 'error');
      return;
    }
    const result = await createBridgeSpreadsheet(accessToken, title, tasks, users);
    setSpreadsheetId(result.spreadsheetId);
    localStorage.setItem('bridge_spreadsheet_id', result.spreadsheetId);
    setSpreadsheetTitle(title);
    showToast('Đã tạo thành công Google Sheet mới (gồm sheet Công việc & Phân quyền)!', 'success');
  };

  // Mutating operation: Save Task (Add or Update)
  const handleSaveTask = (task: BridgeTask) => {
    const isEditing = tasks.some(t => t.id === task.id);
    const actionDesc = isEditing 
      ? `Cập nhật nhiệm vụ "${task.title}" (Mã: ${task.id}) và đồng bộ lên Google Sheet?`
      : `Thêm mới nhiệm vụ "${task.title}" (Mã: ${task.id}) và ghi vào Google Sheet?`;

    setConfirmationState({
      isOpen: true,
      title: isEditing ? 'Xác nhận cập nhật nhiệm vụ' : 'Xác nhận thêm nhiệm vụ mới',
      message: actionDesc,
      confirmLabel: isEditing ? 'Lưu thay đổi' : 'Thêm nhiệm vụ',
      isDestructive: false,
      action: async () => {
        let updated: BridgeTask[];
        if (isEditing) {
          updated = tasks.map(t => t.id === task.id ? task : t);
        } else {
          updated = [task, ...tasks];
        }
        setTasks(updated);

        // Add action notification
        const newNoti = createActionNotification(
          isEditing ? 'status_changed' : 'new_assignment',
          isEditing ? `Cập nhật: ${task.id}` : `Nhiệm vụ mới: ${task.id}`,
          `Hạng mục "${task.title}" đã được ${isEditing ? 'cập nhật' : 'phân công cho'} ${task.assignee}.`,
          task.id,
          'medium'
        );
        setNotifications(prev => [newNoti, ...prev]);
        sendBrowserNotification(newNoti.title, newNoti.message);

        if (accessToken && spreadsheetId) {
          try {
            await syncAllTasksToSheet(accessToken, spreadsheetId, updated);
            showToast('Đã lưu và đồng bộ lên Google Sheet!', 'success');
          } catch (err: any) {
            showToast('Lỗi khi đồng bộ lên Sheet: ' + err.message, 'error');
          }
        } else {
          showToast('Đã lưu cục bộ. Kết nối Google Sheet để lưu trữ vĩnh viễn.', 'info');
        }
      }
    });
  };

  // Mutating operation: Delete Task
  const handleDeleteTask = (task: BridgeTask) => {
    setConfirmationState({
      isOpen: true,
      title: 'Xóa nhiệm vụ thi công',
      message: `Bạn có chắc chắn muốn xóa hạng mục "${task.title}" (Mã: ${task.id})? Hành động này sẽ cập nhật trực tiếp lên Google Sheets và không thể hoàn tác.`,
      confirmLabel: 'Xóa vĩnh viễn',
      isDestructive: true,
      action: async () => {
        const updated = tasks.filter(t => t.id !== task.id);
        setTasks(updated);

        if (accessToken && spreadsheetId) {
          try {
            await syncAllTasksToSheet(accessToken, spreadsheetId, updated);
            showToast(`Đã xóa nhiệm vụ ${task.id} khỏi Google Sheet`, 'success');
          } catch (err: any) {
            showToast('Lỗi khi cập nhật Google Sheet: ' + err.message, 'error');
          }
        }
      }
    });
  };

  // Mutating operation: Status change
  const handleUpdateStatus = (taskId: string, newStatus: BridgeTask['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newProgress = newStatus === 'Hoàn thành' ? 100 : task.progress;
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          progress: newProgress,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    setTasks(updated);

    // Notify
    const noti = createActionNotification(
      'status_changed',
      `Trạng thái thay đổi: ${taskId}`,
      `Nhiệm vụ "${task.title}" chuyển sang "${newStatus}".`,
      taskId
    );
    setNotifications(prev => [noti, ...prev]);

    if (accessToken && spreadsheetId) {
      syncAllTasksToSheet(accessToken, spreadsheetId, updated)
        .then(() => showToast(`Đã chuyển trạng thái ${taskId} sang "${newStatus}" trên Google Sheets`, 'success'))
        .catch(err => showToast('Lỗi cập nhật Sheets: ' + err.message, 'error'));
    }
  };

  // Mutating operation: Quick Progress Slider
  const handleQuickProgressChange = (taskId: string, newProgress: number) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        let newStatus = t.status;
        if (newProgress === 100) newStatus = 'Hoàn thành';
        else if (newProgress > 0 && t.status === 'Chưa bắt đầu') newStatus = 'Đang thi công';
        return {
          ...t,
          progress: newProgress,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    setTasks(updated);

    if (accessToken && spreadsheetId) {
      syncAllTasksToSheet(accessToken, spreadsheetId, updated)
        .catch(err => console.error('Lỗi sync:', err));
    }
  };

  // Load or Reset to Digitized Phuoc An Project Data
  const handleLoadPhuocAnData = () => {
    setConfirmationState({
      isOpen: true,
      title: 'Nạp dữ liệu Tiến độ Cầu Phước An',
      message: `Bạn có muốn nạp toàn bộ 76 công việc số hóa của Dự án Cầu Phước An (Gói thầu số 40: T40-T41 đến T62, thời gian 17/08/2026 - 30/06/2027)? ${
        spreadsheetId ? 'Dữ liệu sẽ được đồng bộ trực tiếp lên Google Sheets.' : ''
      }`,
      confirmLabel: 'Nạp dữ liệu ngay',
      isDestructive: false,
      action: async () => {
        setTasks(DIGITIZED_PHUOC_AN_TASKS);
        setUsers(PHUOC_AN_USERS);
        setProjectInfo(PHUOC_AN_PROJECT_INFO);
        localStorage.setItem('bridge_project_info', JSON.stringify(PHUOC_AN_PROJECT_INFO));
        setSpreadsheetTitle(PHUOC_AN_PROJECT_INFO.name + ' - ' + PHUOC_AN_PROJECT_INFO.package);

        if (accessToken && spreadsheetId) {
          try {
            await syncAllTasksToSheet(accessToken, spreadsheetId, DIGITIZED_PHUOC_AN_TASKS);
            await syncUsersToSheet(accessToken, spreadsheetId, PHUOC_AN_USERS);
            await syncProjectInfoToSheet(accessToken, spreadsheetId, PHUOC_AN_PROJECT_INFO);
            showToast('Đã nạp và đồng bộ 76 hạng mục Cầu Phước An lên Google Sheets!', 'success');
          } catch (err: any) {
            showToast('Lỗi khi đồng bộ lên Google Sheet: ' + err.message, 'error');
          }
        } else {
          showToast('Đã nạp thành công 76 hạng mục tiến độ Cầu Phước An!', 'success');
        }
      }
    });
  };

  // Mutating operation: Import Excel tasks (Chọn sheet mới, Ghi đè, hoặc Chèn tiếp ở sau)
  const handleConfirmExcelImport = (
    importedTasks: BridgeTask[], 
    mode: ImportDestinationMode,
    newSheetTitle?: string
  ) => {
    let confirmTitle = 'Xác nhận nhập dữ liệu từ Excel';
    let confirmMsg = '';
    let confirmBtn = 'Tiến hành nhập';
    let isDestruct = false;

    if (mode === 'new_sheet') {
      confirmTitle = 'Tạo Google Sheet mới cho dữ liệu Excel';
      confirmMsg = `Khởi tạo một bảng tính Google Sheet mới với tên "${newSheetTitle || 'Dự Án Cầu Mới'}" và nạp ${importedTasks.length} công việc từ file Excel? Dữ liệu hiện tại sẽ được thay thế bằng dữ liệu của sheet mới này.`;
      confirmBtn = 'Tạo Sheet & Nhập Dữ Liệu';
    } else if (mode === 'replace') {
      confirmTitle = 'Xác nhận ghi đè toàn bộ dữ liệu';
      confirmMsg = `Bạn có chắc chắn muốn thay thế toàn bộ ${tasks.length} công việc hiện tại bằng ${importedTasks.length} công việc từ file Excel? Dữ liệu trên Google Sheet cũng sẽ được làm mới.`;
      confirmBtn = 'Ghi đè toàn bộ';
      isDestruct = true;
    } else {
      // append
      confirmTitle = 'Xác nhận chèn tiếp dữ liệu';
      confirmMsg = `Chèn tiếp ${importedTasks.length} công việc từ file Excel vào sau danh sách hiện tại (Tổng cộng sẽ thành ${tasks.length + importedTasks.length} CV)?`;
      confirmBtn = 'Chèn tiếp dữ liệu';
    }

    setConfirmationState({
      isOpen: true,
      title: confirmTitle,
      message: confirmMsg,
      confirmLabel: confirmBtn,
      isDestructive: isDestruct,
      action: async () => {
        if (mode === 'new_sheet') {
          // Option 1: Tạo Google Sheet mới
          setTasks(importedTasks);
          const proposedTitle = newSheetTitle || 'Dự Án Cầu Phước An - Nhập Mới';
          setSpreadsheetTitle(proposedTitle);

          if (accessToken) {
            try {
              const res = await createBridgeSpreadsheet(accessToken, proposedTitle, importedTasks, users);
              setSpreadsheetId(res.spreadsheetId);
              localStorage.setItem('bridge_spreadsheet_id', res.spreadsheetId);
              showToast(`Đã tạo thành công Google Sheet mới "${proposedTitle}" và lưu ${importedTasks.length} công việc!`, 'success');
            } catch (err: any) {
              showToast('Lỗi khi tạo Google Sheet mới: ' + err.message, 'error');
            }
          } else {
            showToast(`Đã tạo bảng mới với ${importedTasks.length} công việc (Đăng nhập Google để lưu lên Drive)`, 'info');
          }
        } else {
          // Option 2: replace hoặc Option 3: append
          const finalTasks = mode === 'replace' ? importedTasks : [...tasks, ...importedTasks];
          setTasks(finalTasks);

          if (accessToken && spreadsheetId) {
            try {
              await syncAllTasksToSheet(accessToken, spreadsheetId, finalTasks);
              showToast(
                mode === 'replace'
                  ? `Đã ghi đè thành công ${importedTasks.length} công việc lên Google Sheet!`
                  : `Đã chèn tiếp ${importedTasks.length} công việc vào sau dữ liệu cũ và đồng bộ lên Google Sheet!`,
                'success'
              );
            } catch (err: any) {
              showToast('Lỗi khi đồng bộ lên Google Sheet: ' + err.message, 'error');
            }
          } else {
            showToast(
              mode === 'replace'
                ? `Đã ghi đè thành công ${importedTasks.length} công việc!`
                : `Đã chèn tiếp ${importedTasks.length} công việc vào sau dữ liệu cũ!`,
              'success'
            );
          }
        }
      }
    });
  };

  // Mutating operation: Save Users & Roles
  const handleUpdateUsers = (updatedUsers: UserProfile[]) => {
    setUsers(updatedUsers);
    // Keep current profile synced
    const active = updatedUsers.find(u => u.email.toLowerCase() === currentProfile.email.toLowerCase());
    if (active) setCurrentProfile(active);

    if (accessToken && spreadsheetId) {
      syncUsersToSheet(accessToken, spreadsheetId, updatedUsers)
        .then(() => showToast('Đã lưu phân quyền người dùng lên sheet "PhanQuyenNhanSu"', 'success'))
        .catch(err => showToast('Lỗi lưu phân quyền: ' + err.message, 'error'));
    }
  };

  // Role preview switcher
  const handleSwitchActiveRole = (role: UserRole) => {
    let roleTitle = 'Kỹ sư hiện trường';
    if (role === 'ADMIN') roleTitle = 'Tổng Chỉ huy trưởng (Toàn quyền)';
    else if (role === 'PROJECT_MANAGER') roleTitle = 'Quản lý dự án / Chỉ huy phó';

    setCurrentProfile({
      ...currentProfile,
      role,
      roleTitle
    });
    showToast(`Đã chuyển sang chế độ vai trò: ${roleTitle}`, 'info');
  };

  // Export to Excel
  const handleExportExcel = () => {
    exportTasksToExcel(tasks, spreadsheetTitle || 'DuAnCau');
    showToast('Đã xuất file Excel tiến độ thi công thành công!', 'success');
  };

  // Save Project Info
  const handleSaveProjectInfo = async (info: ProjectInfo) => {
    setProjectInfo(info);
    localStorage.setItem('bridge_project_info', JSON.stringify(info));
    setSpreadsheetTitle(`${info.name} - ${info.package}`);

    if (accessToken && spreadsheetId) {
      try {
        await syncProjectInfoToSheet(accessToken, spreadsheetId, info);
        showToast('Đã lưu thông tin dự án vào sheet "ThongTinDuAn" thành công!', 'success');
      } catch (err: any) {
        showToast('Lỗi khi lưu thông tin dự án lên Google Sheet: ' + err.message, 'error');
      }
    } else {
      showToast('Đã lưu thông tin dự án. Kết nối Google Sheet để đồng bộ trực tiếp.', 'info');
    }
  };

  // Send Custom Email Reminder (Selective Recipients & Editable Content)
  const handleSendCustomEmailDigest = (recipients: string[], subject: string, body: string) => {
    if (recipients.length === 0) return;
    const to = recipients.join(';');
    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    showToast(`Đã mở hòm thư gửi nhắc việc tới ${recipients.length} kỹ sư!`, 'success');
  };

  // Filter tasks based on selected WBS or status card click
  const displayTasks = tasks.filter(t => {
    if (selectedWbs) {
      const match = t.wbs.toLowerCase().includes(selectedWbs.toLowerCase()) || 
                    selectedWbs.toLowerCase().includes(t.wbs.toLowerCase());
      if (!match) return false;
    }
    if (activeStatusFilter) {
      if (t.status !== activeStatusFilter) return false;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
      {/* Header */}
      <Navbar
        user={user}
        currentProfile={currentProfile}
        allUsers={users}
        onSwitchProfileRole={handleSwitchActiveRole}
        spreadsheetId={spreadsheetId}
        spreadsheetTitle={spreadsheetTitle}
        projectInfo={projectInfo}
        isSyncing={isSyncing}
        onSync={handleSyncToGoogleSheets}
        onOpenCreateSheetModal={() => setIsSheetModalOpen(true)}
        onOpenSelectSheetModal={() => setIsSheetModalOpen(true)}
        onOpenNewTaskModal={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportExcel={handleExportExcel}
        onOpenNotificationCenter={() => setIsNotificationModalOpen(true)}
        onOpenRoleManagerModal={() => setIsRoleModalOpen(true)}
        onOpenProjectInfoModal={() => setIsProjectInfoModalOpen(true)}
        onLoadPhuocAnData={handleLoadPhuocAnData}
        unreadCount={unreadCount}
        onLogout={handleLogout}
        onLogin={handleLogin}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-medium flex items-center gap-2.5 max-w-md ${
            toastType === 'success' 
              ? 'bg-emerald-900 text-white border-emerald-700' 
              : toastType === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            {toastType === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastType === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner if Google Sheet is not connected yet */}
        {!user ? (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-md">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Kết Nối Google Sheets Để Lưu Trữ Dữ Liệu Thi Công Thực Tế
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Đăng nhập tài khoản Google của bạn để tự động tạo một bảng tính theo dõi tiến độ thi công, chia sẻ trực tiếp với các kỹ sư và chủ đầu tư.
                </p>
              </div>
            </div>
            <button
              onClick={handleLogin}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm whitespace-nowrap shadow-sm transition-all shrink-0 cursor-pointer"
            >
              Đăng nhập Google ngay
            </button>
          </div>
        ) : !spreadsheetId ? (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Đã đăng nhập ({user.email}). Hãy kết nối hoặc tạo mới Google Sheet:
                </h4>
                <p className="text-xs text-slate-600">
                  Tạo trang tính chuẩn WBS Cầu & Phân quyền hoặc kết nối trang tính có sẵn trong Drive của bạn.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSheetModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition-colors shrink-0"
            >
              Chọn hoặc Khởi tạo Sheet
            </button>
          </div>
        ) : null}

        {/* Top Active Role Notice Bar */}
        <div className="mb-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Vai trò hiện tại:</span>
            <span className={`px-2 py-0.5 rounded font-bold ${
              currentProfile.role === 'ADMIN' ? 'bg-rose-500/20 text-rose-300' :
              currentProfile.role === 'PROJECT_MANAGER' ? 'bg-amber-500/20 text-amber-300' :
              'bg-blue-500/20 text-blue-300'
            }`}>
              {currentProfile.roleTitle}
            </span>
            <span className="text-slate-400 hidden md:inline">
              ({currentProfile.role === 'ADMIN' ? 'Toàn quyền thêm, sửa, xóa, phân quyền & Excel' :
                currentProfile.role === 'PROJECT_MANAGER' ? 'Phân công, cập nhật tiến độ tất cả hạng mục' :
                'Chỉ chỉnh sửa các nhiệm vụ được giao cho mình'})
            </span>
          </div>
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="text-amber-400 hover:text-amber-300 font-semibold underline text-xs"
          >
            Chỉnh sửa phân quyền RBAC
          </button>
        </div>

        {/* Project Information Banner */}
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                Hồ Sơ Dự Án Số Hóa
              </span>
              <h2 className="text-sm sm:text-base font-bold text-amber-400">
                {projectInfo.name}
              </h2>
              <button
                onClick={() => setIsProjectInfoModalOpen(true)}
                className="text-[11px] text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer ml-1"
                title="Chỉnh sửa thông tin dự án để tái sử dụng cho dự án khác"
              >
                (Sửa thông tin)
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              {projectInfo.package}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              📅 Tiến độ: <strong>{projectInfo.timeframe}</strong> • BCH: <strong>{projectInfo.chiefEngineer}</strong> • TVGS: <strong>{projectInfo.consultantLead}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-slate-800/90 px-3 py-2 rounded-lg border border-slate-700 shrink-0">
              <HardHat className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="max-w-xs truncate" title={projectInfo.keyEquipment}>
                Huy động: {projectInfo.keyEquipment}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/60 px-3 py-2 rounded-lg border border-emerald-500/40 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Thực tế: Bệ T41-T45 (100%), Thân T41-T44 vươn cao, Cọc T41-T45, T59, T60 (100%)</span>
            </div>
          </div>
        </div>

        {/* Dashboard Top Stats */}
        <StatsOverview
          tasks={tasks}
          onFilterByStatus={setActiveStatusFilter}
          activeStatusFilter={activeStatusFilter}
        />

        {/* Structural Bridge Visualization (Cầu & Phân đoạn WBS) */}
        <BridgeVisualization
          tasks={tasks}
          selectedWbs={selectedWbs}
          onSelectWbs={setSelectedWbs}
        />

        {/* View Switcher Tabs & Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="inline-flex p-1 bg-slate-200/80 rounded-xl">
            <button
              onClick={() => setActiveTab('table')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'table'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>Bảng Công Việc ({tasks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('gantt')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'gantt'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Tiến Độ Thi Công (Gantt)</span>
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'team'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Phân Công Kỹ Sư ({users.length})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Hide Completed Tasks Button */}
            <button
              onClick={() => setHideCompleted(!hideCompleted)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                hideCompleted
                  ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-sm ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              title={hideCompleted ? 'Đang ẩn các việc hoàn thành. Bấm để hiển thị lại toàn bộ' : 'Ẩn các công việc đã hoàn thành 100% để tập trung vào việc đang và sắp thi công'}
            >
              {hideCompleted ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                  <span>Đang Ẩn CV Hoàn Thành ({tasks.filter(t => t.status === 'Hoàn thành' || t.progress === 100).length})</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Ẩn CV Hoàn Thành ({tasks.filter(t => t.status === 'Hoàn thành' || t.progress === 100).length})</span>
                </>
              )}
            </button>

            {spreadsheetId && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                title="Mở Google Sheets trên tab mới"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Mở Google Sheet</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}

            {/* Sync to Sheet Button */}
            <button
              onClick={handleSyncToGoogleSheets}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              title="Đồng bộ toàn bộ số liệu thực tế lên Google Sheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng Bộ Lên Sheet'}</span>
            </button>

            {/* Import Excel */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nhập Excel</span>
            </button>

            {/* Add Task if Admin or PM */}
            {(currentProfile.role === 'ADMIN' || currentProfile.role === 'PROJECT_MANAGER') && (
              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Thêm Hạng Mục</span>
              </button>
            )}
          </div>
        </div>

        {/* View Contents */}
        {activeTab === 'table' && (
          <TaskTable
            tasks={displayTasks}
            currentProfile={currentProfile}
            onEditTask={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onUpdateStatus={handleUpdateStatus}
            onQuickProgressChange={handleQuickProgressChange}
            hideCompleted={hideCompleted}
            onToggleHideCompleted={() => setHideCompleted(!hideCompleted)}
          />
        )}

        {activeTab === 'gantt' && (
          <TimelineGantt
            tasks={displayTasks}
            onEditTask={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            hideCompleted={hideCompleted}
            onToggleHideCompleted={() => setHideCompleted(!hideCompleted)}
            projectInfo={projectInfo}
          />
        )}

        {activeTab === 'team' && (
          <TeamAssignmentView
            tasks={displayTasks}
            onSelectAssignee={() => {}}
            onEditTask={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BridgeTrack Pro • Hệ Thống Giám Sát Tiến Độ Thi Công & Quản Lý Dự Án Xây Dựng Cầu</span>
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Đồng bộ chuẩn 2 chiều Google Sheets API & Phân quyền RBAC
          </span>
        </div>
      </footer>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        existingTasks={tasks}
        allUsers={users}
      />

      <SheetManagerModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        accessToken={accessToken}
        currentSpreadsheetId={spreadsheetId}
        onSelectSheet={handleSelectSheet}
        onCreateNewSheet={handleCreateNewSheet}
      />

      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        title={confirmationState.title}
        message={confirmationState.message}
        confirmLabel={confirmationState.confirmLabel}
        isDestructive={confirmationState.isDestructive}
        onConfirm={async () => {
          setConfirmationState({ ...confirmationState, isOpen: false });
          await confirmationState.action();
        }}
        onCancel={() => setConfirmationState({ ...confirmationState, isOpen: false })}
      />

      <NotificationCenterModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          showToast('Đã đánh dấu đã đọc tất cả thông báo', 'info');
        }}
        onSelectTask={(taskId) => {
          const t = tasks.find(item => item.id === taskId);
          if (t) {
            setTaskToEdit(t);
            setIsTaskModalOpen(true);
          }
        }}
        onSendCustomEmailDigest={handleSendCustomEmailDigest}
        tasks={tasks}
        allUsers={users}
      />

      <RoleManagerModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        users={users}
        currentProfile={currentProfile}
        onUpdateUsers={handleUpdateUsers}
        onSwitchActiveRole={handleSwitchActiveRole}
        isGoogleConnected={!!spreadsheetId}
      />

      <ProjectInfoModal
        isOpen={isProjectInfoModalOpen}
        onClose={() => setIsProjectInfoModalOpen(false)}
        projectInfo={projectInfo}
        onSaveProjectInfo={handleSaveProjectInfo}
        isGoogleConnected={!!spreadsheetId}
      />

      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onConfirmImport={handleConfirmExcelImport}
        currentSpreadsheetTitle={spreadsheetTitle}
        hasConnectedSheet={!!spreadsheetId}
      />
    </div>
  );
}
