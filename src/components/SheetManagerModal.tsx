import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Plus, Check, Loader2, X, ExternalLink, RefreshCw } from 'lucide-react';
import { listBridgeSpreadsheets } from '../services/sheets';

interface SheetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  currentSpreadsheetId: string | null;
  onSelectSheet: (id: string, title?: string) => void;
  onCreateNewSheet: (title: string) => Promise<void>;
}

export const SheetManagerModal: React.FC<SheetManagerModalProps> = ({
  isOpen,
  onClose,
  accessToken,
  currentSpreadsheetId,
  onSelectSheet,
  onCreateNewSheet,
}) => {
  const [existingSheets, setExistingSheets] = useState<{ id: string; name: string; modifiedTime: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState('Dự án Xây dựng Cầu - Tiến độ & Phân công');
  const [manualSheetId, setManualSheetId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && accessToken) {
      loadSheets();
    }
  }, [isOpen, accessToken]);

  const loadSheets = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const sheets = await listBridgeSpreadsheets(accessToken);
      setExistingSheets(sheets);
    } catch (err: any) {
      console.error(err);
      setError('Không thể tải danh sách tệp Google Sheets từ Drive của bạn.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetTitle.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      await onCreateNewSheet(newSheetTitle);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo Google Sheet mới.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleManualConnect = () => {
    if (!manualSheetId.trim()) return;
    // Extract ID from full URL if pasted
    let id = manualSheetId.trim();
    const match = id.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      id = match[1];
    }
    onSelectSheet(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Cấu hình Database Google Sheet</h3>
              <p className="text-xs text-slate-500">Kết nối bảng tính theo dõi tiến độ công trình cầu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Section 1: Create a fresh structured sheet */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-2">
              <Plus className="w-4 h-4 text-amber-600" />
              Tạo Google Sheet Mới Cho Dự Án (Khuyên dùng)
            </h4>
            <p className="text-xs text-slate-600 mb-3">
              Hệ thống sẽ tự động tạo một bảng tính mới trên Google Drive của bạn với đầy đủ các cột chuẩn thi công cầu (WBS, Cọc, Dầm, Bệ trụ, Tiến độ, Kỹ sư, Khối lượng).
            </p>
            <form onSubmit={handleCreateSubmit} className="flex gap-2">
              <input
                type="text"
                value={newSheetTitle}
                onChange={(e) => setNewSheetTitle(e.target.value)}
                placeholder="Tên bảng tính..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Khởi tạo</span>
              </button>
            </form>
          </div>

          {/* Section 2: Choose existing Sheets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Chọn Bảng Tính Đã Có Trong Google Drive
              </h4>
              <button
                onClick={loadSheets}
                disabled={isLoading}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </button>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Đang quét danh sách Google Sheets...</span>
              </div>
            ) : existingSheets.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {existingSheets.map((sheet) => {
                  const isCurrent = sheet.id === currentSpreadsheetId;
                  return (
                    <div
                      key={sheet.id}
                      onClick={() => {
                        onSelectSheet(sheet.id, sheet.name);
                        onClose();
                      }}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileSpreadsheet className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span className="truncate">{sheet.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrent ? (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Đang dùng
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {new Date(sheet.modifiedTime).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-50 text-center text-xs text-slate-500 border border-dashed border-slate-200">
                Không tìm thấy bảng tính nào trong Drive. Bạn có thể nhấn nút "Khởi tạo" ở trên để tạo mới.
              </div>
            )}
          </div>

          {/* Section 3: Paste ID manually */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-700 mb-1.5">
              Hoặc Dán Link / ID Google Sheet
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualSheetId}
                onChange={(e) => setManualSheetId(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs... hoặc ID"
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="button"
                onClick={handleManualConnect}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors"
              >
                Kết nối
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
