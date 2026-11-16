
import React, { useState, useEffect, createContext, useContext } from 'react';
import { LucideIcon, X, Upload, Camera, ChevronDown, ChevronUp, Search, Filter, MoreHorizontal, Download, CheckCircle, AlertTriangle, Info, AlertCircle, FileText, Printer } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { exportTableToPDF } from '../utils/pdfExport';

// --- ShadCN UI Utility ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Toast Context & Hook ---
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const ToastContext = createContext<{ 
  addToast: (msg: string, type?: Toast['type']) => void;
  showToast: (msg: string, type?: Toast['type']) => void;
} | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast, showToast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={cn(
              "flex items-center w-full max-w-xs p-4 rounded-lg shadow-lg text-white pointer-events-auto animate-in slide-in-from-right-full duration-300",
              toast.type === 'success' ? 'bg-green-600' : 
              toast.type === 'error' ? 'bg-red-600' : 
              toast.type === 'warning' ? 'bg-yellow-600' : 'bg-slate-800'
            )}
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 text-white">
               {toast.type === 'success' && <CheckCircle size={18} />}
               {toast.type === 'error' && <AlertCircle size={18} />}
               {toast.type === 'warning' && <AlertTriangle size={18} />}
               {toast.type === 'info' && <Info size={18} />}
            </div>
            <div className="ml-3 text-sm font-normal">{toast.message}</div>
            <button 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} 
              className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

// --- Card (ShadCN Style) ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; description?: string; onClick?: () => void }> = ({ children, className = '', title, description, onClick }) => (
  <div onClick={onClick} className={cn("bg-white rounded-xl border border-slate-200 shadow-sm text-slate-950", className)}>
    {(title || description) && (
      <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-100/50">
        {title && <h3 className="font-semibold leading-none tracking-tight">{title}</h3>}
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
    )}
    <div className="p-6 pt-6">{children}</div>
  </div>
);

// --- Button (ShadCN Style) ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  icon?: LucideIcon;
}
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'default', icon: Icon, className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-950 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-indigo-600 text-white shadow hover:bg-indigo-700",
    secondary: "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200/80",
    danger: "bg-red-500 text-white shadow-sm hover:bg-red-600",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    outline: "border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900",
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  };

  return (
    <button className={cn(baseStyle, variants[variant], sizes[size], className)} {...props}>
      {Icon && <Icon className={cn("mr-2 h-4 w-4", size === 'icon' && "mr-0")} />}
      {children}
    </button>
  );
};

// --- Input (ShadCN Style) ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="space-y-2 mb-4">
    {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-950 disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-500",
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// --- Image Upload ---
interface ImageUploadProps {
  label?: string;
  defaultImage?: string;
  onChange?: (file: File) => void;
  className?: string;
}
export const ImageUpload: React.FC<ImageUploadProps> = ({ label, defaultImage, onChange, className = '' }) => {
  const [preview, setPreview] = useState<string | undefined>(defaultImage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      if (onChange) onChange(file);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && <label className="text-sm font-medium leading-none">{label}</label>}
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200 flex-shrink-0 shadow-inner">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Camera size={28} />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <label className="cursor-pointer inline-flex items-center h-9 px-4 rounded-md text-sm font-medium transition-colors border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 shadow-sm">
            <Upload size={16} className="mr-2" />
            Choose Image
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
          <p className="text-[10px] text-slate-500">Supported formats: JPG, PNG. Max size: 2MB.</p>
        </div>
      </div>
    </div>
  );
};

// --- Badge (ShadCN Style) ---
export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple'; className?: string }> = ({ children, color = 'gray', className = '' }) => {
  const colors = {
    green: "border-transparent bg-green-500/15 text-green-700 hover:bg-green-500/25",
    red: "border-transparent bg-red-500/15 text-red-700 hover:bg-red-500/25",
    yellow: "border-transparent bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25",
    blue: "border-transparent bg-blue-500/15 text-blue-700 hover:bg-blue-500/25",
    gray: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200/80",
    purple: "border-transparent bg-purple-500/15 text-purple-700 hover:bg-purple-500/25",
  };
  return (
    <div className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2", colors[color], className)}>
      {children}
    </div>
  );
};

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
  className?: string;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', className = '' }) => {
  if (!isOpen) return null;
  
  const sizeClasses: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    '2xl': "max-w-5xl",
    '4xl': "max-w-6xl",
    full: "max-w-[95vw]"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={cn("bg-white rounded-lg shadow-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200", sizeClasses[size] || "max-w-lg", className)}>
        <div className="flex flex-col space-y-1.5 px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors rounded-sm opacity-70 ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 cursor-pointer">
              <X size={18}/>
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
        <div className="p-6 max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// --- Smart Data Table (MUI DataGrid Logic Replica) ---
interface Column<T> {
  field: keyof T | string;
  headerName: string;
  width?: string;
  renderCell?: (row: T) => React.ReactNode;
}

interface SmartDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  loading?: boolean;
  exportTitle?: string;
  exportSubtitle?: string;
  onExportPDF?: (filteredData: T[]) => void;
  onExportCSV?: (filteredData: T[]) => void;
}

export function SmartDataTable<T extends { id?: string | number } | Record<string, any>>({ 
  columns, 
  data, 
  actions, 
  loading = false,
  exportTitle = 'Administrative Data Record',
  exportSubtitle,
  onExportPDF,
  onExportCSV
}: SmartDataTableProps<T>) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const itemsPerPage = 10;

  // Handling Sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter Data
  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort Data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = (a as any)[sortField];
    const bVal = (b as any)[sortField];
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Default PDF exporter
  const handleDefaultPDFExport = () => {
    if (onExportPDF) {
      onExportPDF(filteredData);
      setShowExportMenu(false);
      return;
    }

    const headers = columns.map(c => c.headerName);
    const rows = filteredData.map(row => 
      columns.map(col => {
        const val = (row as any)[col.field];
        if (typeof val === 'object' && val !== null) return '';
        return String(val ?? '');
      })
    );

    exportTableToPDF({
      title: exportTitle,
      subtitle: exportSubtitle || `Total Records: ${filteredData.length} • Generated on ${new Date().toLocaleDateString()}`,
      headers,
      rows,
      orientation: columns.length > 5 ? 'landscape' : 'portrait'
    });
    setShowExportMenu(false);
  };

  // Default CSV exporter
  const handleDefaultCSVExport = () => {
    if (onExportCSV) {
      onExportCSV(filteredData);
      setShowExportMenu(false);
      return;
    }

    const headers = columns.map(c => `"${c.headerName}"`).join(',');
    const rows = filteredData.map(row => 
      columns.map(col => {
        const val = (row as any)[col.field];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between py-2 gap-3 flex-wrap">
        <div className="relative max-w-sm w-full">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
           <input
             placeholder="Filter..."
             className="pl-9 h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-950"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-2 relative">
           <Button 
             variant="outline" 
             size="sm" 
             icon={FileText}
             onClick={handleDefaultPDFExport}
             className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
           >
             Export PDF
           </Button>

           <div className="relative">
             <Button 
               variant="outline" 
               size="sm" 
               icon={Download}
               onClick={() => setShowExportMenu(!showExportMenu)}
             >
               Export
             </Button>

             {showExportMenu && (
               <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in-50 duration-150">
                 <button
                   onClick={handleDefaultPDFExport}
                   className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                 >
                   <FileText size={14} className="text-red-500" />
                   Download PDF (.pdf)
                 </button>
                 <button
                   onClick={handleDefaultCSVExport}
                   className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                 >
                   <Download size={14} className="text-green-600" />
                   Download CSV (.csv)
                 </button>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                {columns.map((col, colIdx) => (
                  <th 
                    key={`th-${String(col.field)}-${colIdx}`} 
                    className="h-10 px-4 align-middle font-medium cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    style={{ width: col.width }}
                    onClick={() => handleSort(String(col.field))}
                  >
                    <div className="flex items-center gap-1">
                      {col.headerName}
                      {sortField === col.field && (
                        sortDirection === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>
                      )}
                    </div>
                  </th>
                ))}
                {actions && <th key="th-actions-col" className="h-10 px-4 align-middle font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr key="smart-table-loading-row">
                   <td colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center text-slate-500">Loading...</td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => {
                  const rawId = (row as any)?.id ?? (row as any)?.studentId ?? (row as any)?.rollNo ?? (row as any)?.seatNo ?? (row as any)?.name;
                  const globalIdx = (currentPage - 1) * itemsPerPage + rowIndex;
                  const rowKey = rawId != null && String(rawId).trim() !== ''
                    ? `row-${String(rawId)}-${globalIdx}`
                    : `row-${globalIdx}`;

                  return (
                    <tr key={rowKey} className="hover:bg-slate-50/50 transition-colors">
                      {columns.map((col, colIndex) => (
                        <td key={`${rowKey}-cell-${String(col.field)}-${colIndex}`} className="p-4 align-middle">
                          {col.renderCell ? col.renderCell(row) : (row as any)[col.field]}
                        </td>
                      ))}
                      {actions && (
                        <td key={`${rowKey}-action-cell`} className="p-4 align-middle text-right">
                          {actions(row)}
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr key="smart-table-no-results-row">
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center text-slate-500">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-xs text-slate-500">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedData.length)} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm font-medium">
             Page {currentPage} of {totalPages || 1}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
