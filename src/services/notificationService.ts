import { BridgeTask, AppNotification, UserProfile } from '../types/bridge';

/**
 * Scans all bridge tasks against current date and user email to compute alerts:
 * 1. Overdue tasks (Chậm tiến độ hoặc quá ngày kết thúc mà chưa xong)
 * 2. Due soon tasks (Hạn kết thúc trong vòng 3 ngày tới)
 * 3. Priority tasks (Công việc khẩn cấp)
 */
export const generateTaskNotifications = (
  tasks: BridgeTask[],
  currentUserEmail?: string | null
): AppNotification[] => {
  const notifications: AppNotification[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  tasks.forEach(task => {
    // Only check tasks not yet completed
    if (task.status === 'Hoàn thành') return;

    const endDate = new Date(task.endDate);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Overdue check
    if (diffDays < 0) {
      notifications.push({
        id: `overdue-${task.id}`,
        type: 'overdue',
        title: `Quá hạn: ${task.id} - ${task.title}`,
        message: `Hạng mục ${task.wbs} đã quá hạn ${Math.abs(diffDays)} ngày (hạn: ${task.endDate}). Tiến độ hiện tại: ${task.progress}%. Phụ trách: ${task.assignee}.`,
        taskId: task.id,
        createdAt: new Date().toISOString(),
        read: false,
        priority: 'high'
      });
    } else if (diffDays >= 0 && diffDays <= 3) {
      // Due soon
      notifications.push({
        id: `due-soon-${task.id}`,
        type: 'due_soon',
        title: `Sắp đến hạn (${diffDays === 0 ? 'Hôm nay' : `còn ${diffDays} ngày`}): ${task.id}`,
        message: `Hạng mục "${task.title}" tại ${task.location || 'hiện trường'} cần hoàn thành trước ngày ${task.endDate}. Hiện đạt ${task.progress}%.`,
        taskId: task.id,
        createdAt: new Date().toISOString(),
        read: false,
        priority: diffDays <= 1 ? 'high' : 'medium'
      });
    }

    // Weather impact alert
    if (task.weatherNotes && (task.weatherNotes.toLowerCase().includes('mưa') || task.weatherNotes.toLowerCase().includes('nước') || task.weatherNotes.toLowerCase().includes('gió'))) {
      notifications.push({
        id: `weather-${task.id}`,
        type: 'system',
        title: `Cảnh báo thời tiết/thủy văn: ${task.id}`,
        message: `Tại ${task.location || task.wbs}: ${task.weatherNotes}. Cần theo dõi an toàn cẩu tháp và sà lan.`,
        taskId: task.id,
        createdAt: new Date().toISOString(),
        read: false,
        priority: 'medium'
      });
    }
  });

  // Sort by priority high first
  return notifications.sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return 0;
  });
};

/**
 * Creates an in-app notification when a task status changes or when assigned
 */
export const createActionNotification = (
  type: AppNotification['type'],
  title: string,
  message: string,
  taskId?: string,
  priority: 'high' | 'medium' | 'low' = 'medium'
): AppNotification => {
  return {
    id: `noti-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type,
    title,
    message,
    taskId,
    createdAt: new Date().toISOString(),
    read: false,
    priority
  };
};

/**
 * Triggers standard Browser Web Notification if permission granted
 */
export const sendBrowserNotification = (title: string, body: string) => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }
};
