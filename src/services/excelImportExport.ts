import * as XLSX from 'xlsx';
import { BridgeTask } from '../types/bridge';

export interface ImportResult {
  tasks: BridgeTask[];
  errors: string[];
  totalRows: number;
}

/**
 * Parses an Excel (.xlsx / .xls) file into standardized BridgeTask objects
 */
export const parseExcelProject = async (file: File): Promise<ImportResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Pick the first sheet or one containing "tiến độ" / "công việc"
        const sheetName = workbook.SheetNames.find(name => 
          name.toLowerCase().includes('tiến độ') || 
          name.toLowerCase().includes('cong viec') ||
          name.toLowerCase().includes('task')
        ) || workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rawJson.length < 2) {
          return resolve({
            tasks: [],
            errors: ['Tệp Excel trống hoặc không có dòng dữ liệu công việc hợp lệ.'],
            totalRows: 0
          });
        }

        // Find header row index
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(5, rawJson.length); i++) {
          const rowText = rawJson[i].map(c => String(c || '').toLowerCase()).join(' ');
          if (rowText.includes('mã') || rowText.includes('hạng mục') || rowText.includes('công việc') || rowText.includes('tiến độ')) {
            headerRowIdx = i;
            break;
          }
        }

        const headers = rawJson[headerRowIdx].map(h => String(h || '').trim());
        const rows = rawJson.slice(headerRowIdx + 1);

        // Helper to locate column by keywords
        const getColIdx = (keywords: string[]): number => {
          return headers.findIndex(h => {
            const lower = h.toLowerCase();
            return keywords.some(k => lower.includes(k.toLowerCase()));
          });
        };

        const idCol = getColIdx(['mã', 'id', 'stt', 'code']);
        const wbsCol = getColIdx(['wbs', 'hạng mục', 'phân đoạn', 'kết cấu', 'gói thầu']);
        const titleCol = getColIdx(['tên', 'nhiệm vụ', 'công việc', 'hạng mục thi công', 'nội dung', 'task']);
        const assigneeCol = getColIdx(['phụ trách', 'kỹ sư', 'người thực hiện', 'assignee', 'chỉ huy']);
        const emailCol = getColIdx(['email', 'thư điện tử']);
        const roleCol = getColIdx(['chức danh', 'đội', 'vai trò', 'bộ phận']);
        const startCol = getColIdx(['bắt đầu', 'ngày bd', 'khởi công', 'start']);
        const endCol = getColIdx(['kết thúc', 'ngày kt', 'hoàn thành', 'hạn', 'end']);
        const progressCol = getColIdx(['tiến độ', '%', 'tỷ lệ', 'progress']);
        const statusCol = getColIdx(['trạng thái', 'tình trạng', 'status']);
        const priorityCol = getColIdx(['ưu tiên', 'priority']);
        const unitCol = getColIdx(['đơn vị', 'đvt', 'unit']);
        const plannedCol = getColIdx(['thiết kế', 'kế hoạch', 'kl tk', 'planned']);
        const actualCol = getColIdx(['thực tế', 'lũy kế', 'kl tt', 'actual']);
        const locationCol = getColIdx(['vị trí', 'lý trình', 'mặt bằng', 'location']);
        const weatherCol = getColIdx(['thời tiết', 'thủy văn', 'nước']);
        const notesCol = getColIdx(['ghi chú', 'lưu ý', 'notes']);

        const tasks: BridgeTask[] = [];
        const errors: string[] = [];

        rows.forEach((row, idx) => {
          if (!row || row.length === 0) return;
          const title = titleCol >= 0 ? String(row[titleCol] || '').trim() : '';
          if (!title) return; // Skip blank lines

          const id = idCol >= 0 && row[idCol] ? String(row[idCol]).trim() : `CV-${String(idx + 1).padStart(2, '0')}`;
          const wbs = wbsCol >= 0 && row[wbsCol] ? String(row[wbsCol]).trim() : 'Móng & Cọc';
          const assignee = assigneeCol >= 0 && row[assigneeCol] ? String(row[assigneeCol]).trim() : 'Chưa phân công';
          const assigneeEmail = emailCol >= 0 && row[emailCol] ? String(row[emailCol]).trim() : '';
          const assigneeRole = roleCol >= 0 && row[roleCol] ? String(row[roleCol]).trim() : 'Kỹ sư hiện trường';
          
          // Format dates
          let startDate = startCol >= 0 && row[startCol] ? formatExcelDate(row[startCol]) : new Date().toISOString().split('T')[0];
          let endDate = endCol >= 0 && row[endCol] ? formatExcelDate(row[endCol]) : new Date(Date.now() + 14*86400000).toISOString().split('T')[0];

          // Progress
          let rawProgress = progressCol >= 0 ? Number(row[progressCol]) : 0;
          if (rawProgress > 0 && rawProgress <= 1) rawProgress = Math.round(rawProgress * 100);
          const progress = isNaN(rawProgress) ? 0 : Math.min(100, Math.max(0, rawProgress));

          // Status
          let status: BridgeTask['status'] = 'Đang thi công';
          const rawStatus = statusCol >= 0 ? String(row[statusCol] || '').toLowerCase() : '';
          if (progress === 100 || rawStatus.includes('xong') || rawStatus.includes('hoàn thành')) {
            status = 'Hoàn thành';
          } else if (rawStatus.includes('chậm') || rawStatus.includes('trễ')) {
            status = 'Chậm tiến độ';
          } else if (rawStatus.includes('nghiệm thu')) {
            status = 'Nghiệm thu';
          } else if (progress === 0 || rawStatus.includes('chưa')) {
            status = 'Chưa bắt đầu';
          }

          // Priority
          let priority: BridgeTask['priority'] = 'Trung bình';
          const rawPri = priorityCol >= 0 ? String(row[priorityCol] || '').toLowerCase() : '';
          if (rawPri.includes('khẩn')) priority = 'Khẩn cấp';
          else if (rawPri.includes('cao')) priority = 'Cao';
          else if (rawPri.includes('thấp')) priority = 'Thấp';

          tasks.push({
            id,
            wbs,
            title,
            assignee,
            assigneeEmail,
            assigneeRole,
            startDate,
            endDate,
            progress,
            status,
            priority,
            unit: unitCol >= 0 && row[unitCol] ? String(row[unitCol]).trim() : 'm³',
            plannedQty: plannedCol >= 0 ? Number(row[plannedCol]) || 0 : 0,
            actualQty: actualCol >= 0 ? Number(row[actualCol]) || 0 : 0,
            location: locationCol >= 0 && row[locationCol] ? String(row[locationCol]).trim() : '',
            weatherNotes: weatherCol >= 0 && row[weatherCol] ? String(row[weatherCol]).trim() : '',
            notes: notesCol >= 0 && row[notesCol] ? String(row[notesCol]).trim() : '',
            updatedAt: new Date().toISOString()
          });
        });

        resolve({
          tasks,
          errors,
          totalRows: tasks.length
        });
      } catch (err: any) {
        reject(new Error(`Lỗi đọc tệp Excel: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Không thể đọc file'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Formats Excel serial numbers or standard date strings into YYYY-MM-DD
 */
function formatExcelDate(value: any): string {
  if (!value) return new Date().toISOString().split('T')[0];
  if (typeof value === 'number') {
    // Excel date epoch: Dec 30 1899
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  const str = String(value).trim();
  // check if DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * Exports current bridge tasks to a professional Excel workbook
 */
export const exportTasksToExcel = (tasks: BridgeTask[], projectName = 'Dự án Cầu') => {
  const exportData = tasks.map(t => ({
    'Mã CV': t.id,
    'Hạng mục WBS': t.wbs,
    'Tên công việc': t.title,
    'Phụ trách / Kỹ sư': t.assignee,
    'Email kỹ sư': t.assigneeEmail || '',
    'Chức danh': t.assigneeRole,
    'Ngày bắt đầu': t.startDate,
    'Ngày kết thúc': t.endDate,
    'Tiến độ (%)': t.progress,
    'Trạng thái': t.status,
    'Mức ưu tiên': t.priority,
    'Đơn vị tính': t.unit,
    'KL Thiết kế': t.plannedQty,
    'KL Lũy kế': t.actualQty,
    'Vị trí thi công': t.location,
    'Thời tiết / Thủy văn': t.weatherNotes || '',
    'Ghi chú': t.notes || '',
    'Cập nhật': t.updatedAt
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tiến Độ Xây Dựng Cầu');

  // Trigger download
  XLSX.writeFile(workbook, `${projectName}_TienDoThiCong_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Downloads a sample template Excel file for users to populate
 */
export const downloadSampleBridgeTemplate = () => {
  const sampleData = [
    {
      'Mã CV': 'CV-01',
      'Hạng mục WBS': 'Móng & Cọc',
      'Tên công việc': 'Khoan cọc khoan nhồi D1500 Trụ T1 (8 cọc)',
      'Phụ trách / Kỹ sư': 'KS. Nguyễn Văn Dũng',
      'Email kỹ sư': 'dung.nguyen@cau-bridge.vn',
      'Chức danh': 'Kỹ sư Cọc & Địa kỹ thuật',
      'Ngày bắt đầu': '2026-10-01',
      'Ngày kết thúc': '2026-10-25',
      'Tiến độ (%)': 45,
      'Trạng thái': 'Đang thi công',
      'Mức ưu tiên': 'Khẩn cấp',
      'Đơn vị tính': 'Cọc',
      'KL Thiết kế': 8,
      'KL Lũy kế': 4,
      'Vị trí thi công': 'Trụ T1 giữa sông',
      'Thời tiết / Thủy văn': 'Thủy triều ổn định',
      'Ghi chú': 'Kiểm tra độ nhớt dung dịch bentonite'
    },
    {
      'Mã CV': 'CV-02',
      'Hạng mục WBS': 'Kết cấu Dưới',
      'Tên công việc': 'Đổ bê tông bệ trụ T1 đợt 1',
      'Phụ trách / Kỹ sư': 'KS. Trần Minh Tuấn',
      'Email kỹ sư': 'tuan.tran@cau-bridge.vn',
      'Chức danh': 'Chỉ huy phó Hiện trường',
      'Ngày bắt đầu': '2026-10-15',
      'Ngày kết thúc': '2026-10-30',
      'Tiến độ (%)': 0,
      'Trạng thái': 'Chưa bắt đầu',
      'Mức ưu tiên': 'Cao',
      'Đơn vị tính': 'm³',
      'KL Thiết kế': 650,
      'KL Lũy kế': 0,
      'Vị trí thi công': 'Bệ trụ T1',
      'Thời tiết / Thủy văn': '',
      'Ghi chú': 'Bảo dưỡng nhiệt bê tông khối lớn'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mau_TienDo_XayDungCau');
  XLSX.writeFile(workbook, 'Mau_Nhap_Tien_Do_Cau.xlsx');
};
