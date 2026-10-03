import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  X, 
  Download, 
  Loader2, 
  Layers, 
  ArrowRight,
  Info,
  PlusCircle,
  RefreshCw,
  FolderPlus
} from 'lucide-react';
import { BridgeTask } from '../types/bridge';
import { parseExcelProject, downloadSampleBridgeTemplate } from '../services/excelImportExport';

export type ImportDestinationMode = 'new_sheet' | 'replace' | 'append';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (
    tasks: BridgeTask[], 
    mode: ImportDestinationMode, 
    newSheetTitle?: string
  ) => void;
  currentSpreadsheetTitle?: string;
  hasConnectedSheet?: boolean;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onConfirmImport,
  currentSpreadsheetTitle,
  hasConnectedSheet,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedTasks, setParsedTasks] = useState<BridgeTask[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  
  // 3 distinct options requested by user:
  // 1. 'new_sheet': Tạo và ghi vào Google Sheet mới tinh
  // 2. 'replace': Ghi đè toàn bộ dữ liệu hiện tại
  // 3. 'append': Chèn tiếp vào sau dữ liệu cũ
  const [importMode, setImportMode] = useState<ImportDestinationMode>('append');
  const [newSheetTitle, setNewSheetTitle] = useState<string>('Dự Án Cầu - Đợt Nhập Mới');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setIsProcessing(true);
    setErrors([]);
    setParsedTasks([]);

    // Propose default new sheet title based on file name
    const rawName = selected.name.replace(/\.[^/.]+$/, "");
    setNewSheetTitle(`Dự Án Cầu - ${rawName}`);

    try {
      const result = await parseExcelProject(selected);
      if (result.tasks.length === 0) {
        setErrors(result.errors.length ? result.errors : ['Không tìm thấy công việc thi công nào trong tệp Excel.']);
      } else {
        setParsedTasks(result.tasks);
      }
    } catch (err: any) {
      setErrors([err.message || 'Lỗi khi đọc file Excel']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteImport = () => {
    if (parsedTasks.length === 0) return;
    onConfirmImport(parsedTasks, importMode, newSheetTitle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Nhập Dữ Liệu Thi Công Từ File Excel
              </h3>
              <p className="text-xs text-slate-500">
                Tự động nhận diện WBS, Hạng mục, Khối lượng, Tiến độ, Kỹ sư phụ trách
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

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Sample template download button */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Info className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Chưa có file mẫu? Tải tệp Excel mẫu chuẩn dự án cầu để điền dữ liệu.</span>
            </div>
            <button
              type="button"
              onClick={downloadSampleBridgeTemplate}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Tải file Excel mẫu</span>
            </button>
          </div>

          {/* Drag & Drop Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-7 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-amber-50/20"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            {file ? (
              <div>
                <p className="font-bold text-slate-800 text-sm">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB • Bấm để chọn file khác</p>
              </div>
            ) : (
              <div>
                <p className="font-bold text-slate-800 text-sm">Nhấp hoặc kéo thả file Excel vào đây</p>
                <p className="text-xs text-slate-500 mt-1">Hỗ trợ định dạng .xlsx, .xls (Microsoft Excel / WPS Office)</p>
              </div>
            )}
          </div>

          {/* Loading status */}
          {isProcessing && (
            <div className="p-4 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              <span>Đang phân tích cấu trúc cột và dữ liệu công việc...</span>
            </div>
          )}

          {/* Error messages */}
          {errors.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-1">
              {errors.map((err, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {/* Options: Mode Selection (Chọn Sheet mới / Ghi đè / Chèn tiếp) */}
          {parsedTasks.length > 0 && (
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Lựa chọn cách xử lý dữ liệu khi nhập:
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: Tạo Sheet Mới */}
                  <label className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    importMode === 'new_sheet'
                      ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="importMode"
                        value="new_sheet"
                        checked={importMode === 'new_sheet'}
                        onChange={() => setImportMode('new_sheet')}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                          <FolderPlus className="w-3.5 h-3.5 text-blue-600" />
                          <span>Tạo Sheet Mới</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Khởi tạo một Google Sheet độc lập mới chứa toàn bộ dữ liệu Excel này.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Ghi đè dữ liệu cũ */}
                  <label className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    importMode === 'replace'
                      ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="importMode"
                        value="replace"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="mt-0.5 accent-rose-600"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                          <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
                          <span>Ghi Đè Dữ Liệu</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Thay thế toàn bộ công việc cũ bằng dữ liệu mới từ file Excel.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Option 3: Chèn tiếp ở sau dữ liệu cũ */}
                  <label className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    importMode === 'append'
                      ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="importMode"
                        value="append"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                        className="mt-0.5 accent-emerald-600"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Chèn Tiếp Ở Sau</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Nối tiếp các công việc mới vào cuối bảng dữ liệu hiện có.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Title input when New Sheet mode is selected */}
              {importMode === 'new_sheet' && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên bảng tính Google Sheet mới sẽ tạo:
                  </label>
                  <input
                    type="text"
                    value={newSheetTitle}
                    onChange={e => setNewSheetTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    placeholder="VD: Dự Án Cầu Phước An - Giai Đoạn 2"
                  />
                </div>
              )}

              {/* Preview Parsed Data Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Đã đọc thành công {parsedTasks.length} nhiệm vụ từ file
                  </h4>
                  <span className="text-slate-500 text-[11px]">
                    Xem trước 5 công việc đầu tiên
                  </span>
                </div>

                {/* Preview table mini */}
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                      <tr>
                        <th className="py-2 px-2.5">Mã</th>
                        <th className="py-2 px-2.5">Hạng mục WBS</th>
                        <th className="py-2 px-2.5">Tên công việc</th>
                        <th className="py-2 px-2.5">Phụ trách</th>
                        <th className="py-2 px-2.5">Tiến độ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedTasks.slice(0, 5).map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2.5 font-mono text-slate-500">{t.id}</td>
                          <td className="py-1.5 px-2.5 text-slate-600">{t.wbs}</td>
                          <td className="py-1.5 px-2.5 font-medium text-slate-800 truncate max-w-[220px]">{t.title}</td>
                          <td className="py-1.5 px-2.5 text-slate-600">{t.assignee}</td>
                          <td className="py-1.5 px-2.5 font-bold text-amber-600">{t.progress}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedTasks.length > 5 && (
                  <p className="text-[11px] text-slate-400 text-right italic">
                    ...và còn {parsedTasks.length - 5} công việc khác trong file
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {parsedTasks.length > 0 ? (
              <span>Chế độ: <strong>{
                importMode === 'new_sheet' ? 'Tạo Sheet Mới' :
                importMode === 'replace' ? 'Ghi Đè Toàn Bộ' : 'Chèn Tiếp Ở Sau'
              }</strong></span>
            ) : 'Vui lòng chọn file Excel để bắt đầu'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={parsedTasks.length === 0}
              onClick={handleExecuteImport}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Thực Hiện Nhập ({parsedTasks.length} CV)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
