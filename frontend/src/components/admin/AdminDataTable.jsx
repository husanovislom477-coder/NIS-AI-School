import { useState, useMemo } from 'react';
import {
  FiSearch, FiX, FiChevronUp, FiChevronDown, FiDownload,
  FiTrash2, FiCheck, FiFilter, FiMoreVertical, FiChevronLeft,
  FiChevronRight, FiEdit2, FiEye, FiPlus
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDataTable({
  title,
  subtitle,
  data = [],
  columns = [],
  isLoading = false,
  total = 0,
  page = 1,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  search = '',
  onSearchChange,
  onAddNew,
  onEdit,
  onDelete,
  onBulkDelete,
  filterOptions = [], // [{ label, key, options: [{ label, value }] }]
  activeFilters = {},
  onFilterChange,
  exportFilename = 'export.csv',
  customBulkActions = [],
  idKey = '_id',
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'

  const getId = (item) => item[idKey] || item.id || item._id;

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDir]);

  const handleSort = (key) => {
    if (sortField === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortField(null);
        setSortDir('asc');
      }
    } else {
      setSortField(key);
      setSortDir('asc');
    }
  };

  // Selection
  const allSelected = sortedData.length > 0 && selectedIds.length === sortedData.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(sortedData.map(getId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // CSV Export
  const handleExportCSV = () => {
    const itemsToExport = selectedIds.length > 0
      ? data.filter((item) => selectedIds.includes(getId(item)))
      : data;

    if (itemsToExport.length === 0) return;

    const visibleCols = columns.filter((c) => c.exportable !== false && c.key);
    const headers = visibleCols.map((c) => `"${c.label || c.key}"`).join(',');
    const rows = itemsToExport.map((row) =>
      visibleCols.map((c) => {
        let val = row[c.key];
        if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
        val = String(val ?? '').replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(total / (pageSize || 10)) || 1;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {subtitle || `Jami ${total} ta ma'lumot mavjud`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="CSV formatida yuklab olish"
          >
            <FiDownload size={14} className="text-slate-500" />
            <span>Eksport (CSV)</span>
          </button>

          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="btn-primary text-xs py-2 px-3.5 shadow-sm inline-flex items-center gap-1.5"
            >
              <FiPlus size={15} />
              <span>Yangi qo'shish</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-3.5 bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Qidirish (kalit so'z, ism, email)..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <FiX size={13} />
              </button>
            )}
          </div>

          {/* Dynamic Filter Selects */}
          <div className="flex items-center gap-2 flex-wrap">
            {filterOptions.map((f) => (
              <div key={f.key} className="flex items-center gap-1">
                <select
                  value={activeFilters[f.key] || ''}
                  onChange={(e) => onFilterChange && onFilterChange(f.key, e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">{f.label}: Barchasi</option>
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* Clear filters if any active */}
            {Object.values(activeFilters).some(Boolean) && (
              <button
                type="button"
                onClick={() => {
                  if (onFilterChange) {
                    filterOptions.forEach((f) => onFilterChange(f.key, ''));
                  }
                }}
                className="text-[11px] font-semibold text-rose-600 hover:underline px-2 py-1"
              >
                Filtrni tozalash
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                {selectedIds.length}
              </span>
              <span className="text-xs font-semibold">ta qator tanlandi</span>
            </div>

            <div className="flex items-center gap-2">
              {customBulkActions.map((act, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => act.onClick && act.onClick(selectedIds, () => setSelectedIds([]))}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-blue-300 text-blue-700 hover:bg-blue-100/50 transition-colors"
                >
                  {act.label}
                </button>
              ))}

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-blue-300 text-blue-700 hover:bg-blue-100/50 transition-colors"
              >
                Tanlanganlarni eksport qilish
              </button>

              {onBulkDelete && (
                <button
                  type="button"
                  onClick={() => onBulkDelete(selectedIds, () => setSelectedIds([]))}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                >
                  <FiTrash2 size={13} />
                  <span>Tanlanganlarni o'chirish</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="p-1 text-slate-500 hover:text-slate-800 rounded-md"
                title="Tanlovni bekor qilish"
              >
                <FiX size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table Card */}
      <div className="card overflow-hidden bg-white border border-slate-200/90 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                {columns.map((c) => {
                  const isSorted = sortField === c.key;
                  const canSort = c.sortable !== false && c.key;
                  return (
                    <th
                      key={c.key}
                      onClick={() => canSort && handleSort(c.key)}
                      className={`px-4 py-3 font-semibold uppercase tracking-wider text-[11px] text-slate-500 select-none ${
                        canSort ? 'cursor-pointer hover:bg-slate-100/80 transition-colors' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{c.label}</span>
                        {canSort && (
                          <span className="text-slate-400">
                            {isSorted ? (
                              sortDir === 'asc' ? <FiChevronUp size={13} className="text-blue-600" /> : <FiChevronDown size={13} className="text-blue-600" />
                            ) : (
                              <span className="opacity-0 hover:opacity-50">⇅</span>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
                <th className="px-4 py-3 text-right font-semibold uppercase tracking-wider text-[11px] text-slate-500">
                  Amallar
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3.5"><div className="w-4 h-4 bg-slate-200 rounded" /></td>
                    {columns.map((c, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                      </td>
                    ))}
                    <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-16 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                        <FiFilter size={20} />
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">Ma'lumot topilmadi</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Qidiruv yoki filtr mezonlariga mos hech qanday yozuv mavjud emas.
                      </p>
                      {onAddNew && (
                        <button
                          type="button"
                          onClick={onAddNew}
                          className="mt-3.5 btn-primary text-xs py-1.5 px-3"
                        >
                          <FiPlus size={14} /> Yangi qo'shish
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData.map((item, idx) => {
                  const itemId = getId(item);
                  const isSelected = selectedIds.includes(itemId);
                  return (
                    <tr
                      key={itemId || idx}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(itemId)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-slate-700">
                          {col.render ? col.render(item[col.key], item) : (item[col.key] ?? '—')}
                        </td>
                      ))}

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {onEdit && (
                            <button
                              type="button"
                              onClick={() => onEdit(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Tahrirlash"
                            >
                              <FiEdit2 size={14} />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="O'chirish"
                            >
                              <FiTrash2 size={14} />
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

        {/* Footer with pagination and page size */}
        <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Jami <strong>{total}</strong> tadan <strong>{sortedData.length}</strong> tasi ko'rsatilmoqda
            </span>
            {onPageSizeChange && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Har sahifada:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Oldingi sahifa"
              >
                <FiChevronLeft size={14} />
              </button>

              <span className="px-2.5 font-medium text-slate-700">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Keyingi sahifa"
              >
                <FiChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
