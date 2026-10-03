import { BridgeTask, UserProfile, UserRole, ProjectInfo } from '../types/bridge';
import { 
  SHEET_HEADERS, 
  USERS_SHEET_HEADERS, 
  PROJECT_INFO_SHEET_HEADERS, 
  INITIAL_USERS, 
  INITIAL_PROJECT_INFO 
} from '../data/initialData';

export const SHEET_NAME = 'TienDoXayDungCau';
export const USERS_SHEET_NAME = 'PhanQuyenNhanSu';
export const PROJECT_INFO_SHEET_NAME = 'ThongTinDuAn';

export const taskToRow = (task: BridgeTask): (string | number)[] => {
  return [
    task.id,
    task.wbs,
    task.title,
    task.assignee,
    task.assigneeEmail || '',
    task.assigneeRole,
    task.startDate,
    task.endDate,
    task.progress,
    task.status,
    task.priority,
    task.unit,
    task.plannedQty,
    task.actualQty,
    task.location,
    task.weatherNotes || '',
    task.notes || '',
    task.updatedAt
  ];
};

export const rowToTask = (row: any[], index: number): BridgeTask => {
  return {
    id: (row[0] && String(row[0]).trim()) || `CV-${String(index + 1).padStart(2, '0')}`,
    wbs: (row[1] && String(row[1]).trim()) || 'Hạng mục chung',
    title: (row[2] && String(row[2]).trim()) || 'Công việc chưa đặt tên',
    assignee: (row[3] && String(row[3]).trim()) || 'Chưa giao',
    assigneeEmail: (row[4] && String(row[4]).trim()) || '',
    assigneeRole: (row[5] && String(row[5]).trim()) || 'Kỹ sư hiện trường',
    startDate: (row[6] && String(row[6]).trim()) || new Date().toISOString().split('T')[0],
    endDate: (row[7] && String(row[7]).trim()) || new Date().toISOString().split('T')[0],
    progress: Math.min(100, Math.max(0, Number(row[8]) || 0)),
    status: (row[9] as any) || 'Chưa bắt đầu',
    priority: (row[10] as any) || 'Trung bình',
    unit: (row[11] && String(row[11]).trim()) || 'đơn vị',
    plannedQty: Number(row[12]) || 0,
    actualQty: Number(row[13]) || 0,
    location: (row[14] && String(row[14]).trim()) || '',
    weatherNotes: (row[15] && String(row[15]).trim()) || '',
    notes: (row[16] && String(row[16]).trim()) || '',
    updatedAt: (row[17] && String(row[17]).trim()) || new Date().toISOString()
  };
};

export const userToRow = (user: UserProfile): string[] => {
  return [
    user.email,
    user.name,
    user.role,
    user.roleTitle
  ];
};

export const rowToUser = (row: any[]): UserProfile => {
  const roleStr = String(row[2] || 'TEAM_MEMBER').toUpperCase();
  let role: UserRole = 'TEAM_MEMBER';
  if (roleStr === 'ADMIN' || roleStr.includes('QUẢN TRỊ')) role = 'ADMIN';
  else if (roleStr === 'PROJECT_MANAGER' || roleStr.includes('QUẢN LÝ')) role = 'PROJECT_MANAGER';

  return {
    email: String(row[0] || '').trim(),
    name: String(row[1] || '').trim(),
    role,
    roleTitle: String(row[3] || 'Kỹ sư hiện trường').trim()
  };
};

export const projectInfoToRows = (info: ProjectInfo): (string[])[] => {
  return [
    ['Tên dự án', info.name || '', 'Tên công trình cầu giao thông'],
    ['Gói thầu', info.package || '', 'Tên gói thầu xây lắp hoặc lý trình'],
    ['Thời gian thi công', info.timeframe || '', 'Tiến độ khởi công - hoàn thành'],
    ['Chỉ huy trưởng BCH', info.chiefEngineer || '', 'Họ tên và chức vụ đại diện Nhà thầu'],
    ['Tư vấn giám sát (TVGS)', info.consultantLead || '', 'Đơn vị và Trưởng TVGS hiện trường'],
    ['Thiết bị xe máy chính', info.keyEquipment || '', 'Số mũi khoan, búa đóng, ván khuôn leo, cẩu tháp'],
    ['Vị trí công trình', info.location || 'Bà Rịa - Vũng Tàu / Đồng Nai', 'Địa điểm tuyến'],
    ['Ban QLDA / Chủ đầu tư', info.investor || 'Ban Quản lý Dự án Giao thông', 'Chủ đầu tư quản lý hợp đồng'],
    ['Cập nhật thông tin lúc', new Date().toISOString(), 'Thời điểm đồng bộ thông số dự án']
  ];
};

export const rowsToProjectInfo = (rows: any[][]): ProjectInfo => {
  const map: Record<string, string> = {};
  for (const r of rows) {
    if (r && r[0]) {
      const key = String(r[0]).trim().toLowerCase();
      map[key] = String(r[1] || '').trim();
    }
  }

  return {
    name: map['tên dự án'] || map['ten du an'] || INITIAL_PROJECT_INFO.name,
    package: map['gói thầu'] || map['goi thau'] || INITIAL_PROJECT_INFO.package,
    timeframe: map['thời gian thi công'] || map['thoi gian thi cong'] || INITIAL_PROJECT_INFO.timeframe,
    chiefEngineer: map['chỉ huy trưởng bch'] || map['chi huy truong'] || INITIAL_PROJECT_INFO.chiefEngineer,
    consultantLead: map['tư vấn giám sát (tvgs)'] || map['tvgs'] || INITIAL_PROJECT_INFO.consultantLead,
    keyEquipment: map['thiết bị xe máy chính'] || map['thiet bi'] || INITIAL_PROJECT_INFO.keyEquipment,
    location: map['vị trí công trình'] || INITIAL_PROJECT_INFO.location,
    investor: map['ban qlda / chủ đầu tư'] || INITIAL_PROJECT_INFO.investor,
    updatedAt: map['cập nhật thông tin lúc'] || new Date().toISOString()
  };
};

/**
 * Creates a brand new Google Spreadsheet with 3 tabs: 
 * 1. TienDoXayDungCau (Tasks)
 * 2. PhanQuyenNhanSu (RBAC Roles)
 * 3. ThongTinDuAn (Project Info Metadata)
 */
export const createBridgeSpreadsheet = async (
  accessToken: string,
  title: string,
  initialTasks: BridgeTask[],
  initialUsers: UserProfile[] = INITIAL_USERS,
  initialProjectInfo: ProjectInfo = INITIAL_PROJECT_INFO
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const createPayload = {
    properties: {
      title: title || `${initialProjectInfo.name} - ${initialProjectInfo.package}`
    },
    sheets: [
      {
        properties: {
          title: SHEET_NAME,
          gridProperties: {
            frozenRowCount: 1,
            columnCount: 18
          }
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: SHEET_HEADERS.map(header => ({
                  userEnteredValue: { stringValue: header },
                  userEnteredFormat: {
                    backgroundColor: { red: 0.1, green: 0.28, blue: 0.45 },
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 11 },
                    horizontalAlignment: 'CENTER'
                  }
                }))
              },
              ...initialTasks.map(task => ({
                values: taskToRow(task).map(val => {
                  if (typeof val === 'number') {
                    return { userEnteredValue: { numberValue: val } };
                  }
                  return { userEnteredValue: { stringValue: String(val) } };
                })
              }))
            ]
          }
        ]
      },
      {
        properties: {
          title: USERS_SHEET_NAME,
          gridProperties: {
            frozenRowCount: 1,
            columnCount: 4
          }
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: USERS_SHEET_HEADERS.map(header => ({
                  userEnteredValue: { stringValue: header },
                  userEnteredFormat: {
                    backgroundColor: { red: 0.18, green: 0.35, blue: 0.25 },
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 11 },
                    horizontalAlignment: 'CENTER'
                  }
                }))
              },
              ...initialUsers.map(u => ({
                values: userToRow(u).map(val => ({
                  userEnteredValue: { stringValue: String(val) }
                }))
              }))
            ]
          }
        ]
      },
      {
        properties: {
          title: PROJECT_INFO_SHEET_NAME,
          gridProperties: {
            frozenRowCount: 1,
            columnCount: 3
          }
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: PROJECT_INFO_SHEET_HEADERS.map(header => ({
                  userEnteredValue: { stringValue: header },
                  userEnteredFormat: {
                    backgroundColor: { red: 0.55, green: 0.35, blue: 0.1 },
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 11 },
                    horizontalAlignment: 'CENTER'
                  }
                }))
              },
              ...projectInfoToRows(initialProjectInfo).map(row => ({
                values: row.map(val => ({
                  userEnteredValue: { stringValue: val }
                }))
              }))
            ]
          }
        ]
      }
    ]
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(createPayload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Lỗi tạo Google Sheet: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl
  };
};

/**
 * Fetches all bridge tasks, team members & project info from a designated Google Sheet
 */
export const fetchTasksFromSheet = async (
  accessToken: string,
  spreadsheetId: string
): Promise<{ tasks: BridgeTask[]; users: UserProfile[]; projectInfo?: ProjectInfo; sheetTitle: string }> => {
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!metaRes.ok) {
    const errorData = await metaRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Không thể truy cập Google Sheet ID: ${spreadsheetId}`);
  }

  const metaData = await metaRes.json();
  const sheets = metaData.sheets || [];
  
  const targetSheet = sheets.find((s: any) => s.properties?.title === SHEET_NAME) || sheets[0];
  const sheetName = targetSheet?.properties?.title || 'Sheet1';

  // Read range A2:R
  const range = `'${sheetName}'!A2:R1000`;
  const valuesRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueRenderOption=UNFORMATTED_VALUE`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  let tasks: BridgeTask[] = [];
  if (valuesRes.ok) {
    const valuesData = await valuesRes.json();
    const rows: any[][] = valuesData.values || [];
    tasks = rows
      .filter(row => row && row.length > 0 && String(row[0] || '').trim() !== '')
      .map((row, idx) => rowToTask(row, idx));
  }

  // Check if USERS_SHEET_NAME exists
  let users: UserProfile[] = [];
  const userSheet = sheets.find((s: any) => s.properties?.title === USERS_SHEET_NAME);
  if (userSheet) {
    const userRange = `'${USERS_SHEET_NAME}'!A2:D100`;
    const userValuesRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(userRange)}?valueRenderOption=UNFORMATTED_VALUE`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    if (userValuesRes.ok) {
      const userData = await userValuesRes.json();
      const userRows: any[][] = userData.values || [];
      users = userRows
        .filter(r => r && r[0] && String(r[0]).trim() !== '')
        .map(r => rowToUser(r));
    }
  }

  // Check if PROJECT_INFO_SHEET_NAME exists
  let projectInfo: ProjectInfo | undefined;
  const infoSheet = sheets.find((s: any) => s.properties?.title === PROJECT_INFO_SHEET_NAME);
  if (infoSheet) {
    const infoRange = `'${PROJECT_INFO_SHEET_NAME}'!A2:C20`;
    const infoValuesRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(infoRange)}?valueRenderOption=UNFORMATTED_VALUE`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    if (infoValuesRes.ok) {
      const infoData = await infoValuesRes.json();
      const infoRows: any[][] = infoData.values || [];
      if (infoRows.length > 0) {
        projectInfo = rowsToProjectInfo(infoRows);
      }
    }
  }

  return {
    tasks,
    users,
    projectInfo,
    sheetTitle: metaData.properties?.title || 'Dự án Cầu'
  };
};

/**
 * Syncs the entire task list to Google Sheet (ensuring sheet exists and writing A1:R)
 */
export const syncAllTasksToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  tasks: BridgeTask[]
): Promise<void> => {
  // Check if target sheet exists, if not create it
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (metaRes.ok) {
    const metaData = await metaRes.json();
    const exists = (metaData.sheets || []).some((s: any) => s.properties?.title === SHEET_NAME);
    if (!exists) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: SHEET_NAME,
                  gridProperties: { frozenRowCount: 1, columnCount: 18 }
                }
              }
            }
          ]
        })
      });
    }
  }

  // Clear existing content from A2:R1000 first
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAME}'!A2:R1000:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  const values = [
    SHEET_HEADERS,
    ...tasks.map(task => taskToRow(task))
  ];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAME}'!A1:R${values.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: `'${SHEET_NAME}'!A1:R${values.length}`,
        majorDimension: 'ROWS',
        values
      })
    }
  );

  if (!updateRes.ok) {
    const errorData = await updateRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Không thể lưu dữ liệu lên Google Sheet');
  }
};

/**
 * Sync users & roles to Google Sheet tab 'PhanQuyenNhanSu'
 */
export const syncUsersToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  users: UserProfile[]
): Promise<void> => {
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (metaRes.ok) {
    const metaData = await metaRes.json();
    const exists = (metaData.sheets || []).some((s: any) => s.properties?.title === USERS_SHEET_NAME);
    if (!exists) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: USERS_SHEET_NAME,
                  gridProperties: { frozenRowCount: 1, columnCount: 4 }
                }
              }
            }
          ]
        })
      });
    }
  }

  const values = [
    USERS_SHEET_HEADERS,
    ...users.map(u => userToRow(u))
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${USERS_SHEET_NAME}'!A1:D${values.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: `'${USERS_SHEET_NAME}'!A1:D${values.length}`,
        majorDimension: 'ROWS',
        values
      })
    }
  );
};

/**
 * Sync Project Info to Google Sheet tab 'ThongTinDuAn'
 */
export const syncProjectInfoToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  info: ProjectInfo
): Promise<void> => {
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (metaRes.ok) {
    const metaData = await metaRes.json();
    const exists = (metaData.sheets || []).some((s: any) => s.properties?.title === PROJECT_INFO_SHEET_NAME);
    if (!exists) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: PROJECT_INFO_SHEET_NAME,
                  gridProperties: { frozenRowCount: 1, columnCount: 3 }
                }
              }
            }
          ]
        })
      });
    }
  }

  const rows = projectInfoToRows(info);
  const values = [
    PROJECT_INFO_SHEET_HEADERS,
    ...rows
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${PROJECT_INFO_SHEET_NAME}'!A1:C${values.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: `'${PROJECT_INFO_SHEET_NAME}'!A1:C${values.length}`,
        majorDimension: 'ROWS',
        values
      })
    }
  );
};

/**
 * List spreadsheets created or accessible by user via Google Drive API
 */
export const listBridgeSpreadsheets = async (
  accessToken: string
): Promise<{ id: string; name: string; modifiedTime: string }[]> => {
  const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc&pageSize=15`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.files || [];
};
