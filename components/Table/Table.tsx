import React, { useState } from 'react';
import styles from './Table.module.css';

// Type definitions
type SortDirection = 'asc' | 'desc';
type ColumnAlign = 'left' | 'center' | 'right';
type ColumnType = 'string' | 'number' | 'currency' | 'date' | 'boolean';
type ColumnFixed = 'left' | 'right';
type TableVariant = 'default' | 'bordered' | 'stripped' | 'minimal' | 'compact';
type TableSize = 'sm' | 'md' | 'lg';
type ActionVariant = 'default' | 'primary' | 'danger' | 'success' | 'warning';

interface Column<T = any> {
  key?: string;
  accessor?: string;
  header?: string;
  label?: string;
  render?: (row: T, rowIndex: number) => React.ReactNode;
  format?: (value: any) => React.ReactNode;
  sortFn?: (a: any, b: any, direction: SortDirection) => number;
  sortable?: boolean;
  align?: ColumnAlign;
  width?: string | number;
  fixed?: ColumnFixed;
  type?: ColumnType;
  placeholder?: string;
}

interface Action<T = any> {
  label: string;
  icon?: React.ReactNode | string;
  iconOnly?: boolean;
  variant?: ActionVariant;
  onClick: (row: T, rowIndex: number) => void;
  hidden?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
}

interface TableProps<T = any> {
  // Data
  columns?: Column<T>[];
  data?: T[];
  
  // Configuration
  variant?: TableVariant;
  size?: TableSize;
  stickyHeader?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  sortable?: boolean;
  
  // Actions
  actions?: Action<T>[];
  onRowClick?: (row: T, rowIndex: number) => void;
  onSelectionChange?: (selectedIds: Array<string | number>) => void;
  
  // Pagination
  pagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  
  // Empty State
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  
  // Styling
  className?: string;
  tableClassName?: string;
  
  // Row Expansion
  renderExpandedRow?: (row: T, rowIndex: number) => React.ReactNode;
  
  // Selection
  selectedRows?: Array<string | number>;
  
  // Sorting
  defaultSortColumn?: string;
  defaultSortDirection?: SortDirection;
  onSort?: (column: string, direction: SortDirection) => void;
  
  // Checkbox selection
  showCheckboxes?: boolean;
  showRowNumbers?: boolean;
}

const Table = <T extends Record<string, any> = any>({
  // Data
  columns = [],
  data = [],
  
  // Configuration
  variant = 'default',
  size = 'md',
  stickyHeader = false,
  selectable = false,
  expandable = false,
  sortable = false,
  
  // Actions
  actions = [],
  onRowClick,
  onSelectionChange,
  
  // Pagination
  pagination = false,
  pageSize = 10,
  currentPage: controlledPage,
  totalItems,
  onPageChange,
  
  // Empty State
  emptyMessage = 'No data available',
  loading = false,
  loadingMessage = 'Loading...',
  
  // Styling
  className = '',
  tableClassName = '',
  
  // Row Expansion
  renderExpandedRow,
  
  // Selection
  selectedRows = [],
  
  // Sorting
  defaultSortColumn,
  defaultSortDirection = 'asc',
  onSort,
  
  // Checkbox selection
  showCheckboxes = false,
  showRowNumbers = false,
}: TableProps<T>) => {
  const [localSelectedRows, setLocalSelectedRows] = useState<Array<string | number>>(selectedRows || []);
  const [expandedRows, setExpandedRows] = useState<Array<string | number>>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);
  const [localPage, setLocalPage] = useState<number>(1);
  
  // Use controlled or local state
  const currentPage = controlledPage !== undefined ? controlledPage : localPage;
  const setCurrentPage = onPageChange || setLocalPage;
  const selectedRowIds = selectedRows.length > 0 ? selectedRows : localSelectedRows;
  const setSelectedRowIds = onSelectionChange || setLocalSelectedRows;

  // Sort data
  const getSortedData = (): T[] => {
    if (!sortable || !sortColumn) return data;
    
    const column = columns.find(col => col.accessor === sortColumn || col.key === sortColumn);
    if (!column) return data;
    
    return [...data].sort((a, b) => {
      let aVal = column.accessor ? a[column.accessor] : column.key ? a[column.key] : null;
      let bVal = column.accessor ? b[column.accessor] : column.key ? b[column.key] : null;
      
      // Handle nested accessors
      if (column.accessor && column.accessor.includes('.')) {
        aVal = column.accessor.split('.').reduce((obj: any, key) => obj?.[key], a);
        bVal = column.accessor.split('.').reduce((obj: any, key) => obj?.[key], b);
      }
      
      // Custom sort function
      if (column.sortFn) {
        return column.sortFn(aVal, bVal, sortDirection);
      }
      
      // Default sort
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Paginate data
  const getPaginatedData = (): T[] => {
    if (!pagination) return getSortedData();
    const sortedData = getSortedData();
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  };

  const displayData = getPaginatedData();
  const totalPages = pagination ? Math.ceil((totalItems || data.length) / pageSize) : 1;

  // Handle sort
  const handleSort = (column: Column<T>) => {
    if (!sortable || !column.sortable) return;
    
    let newDirection: SortDirection = 'asc';
    if (sortColumn === (column.accessor || column.key)) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    
    setSortColumn(column.accessor || column.key || '');
    setSortDirection(newDirection);
    onSort?.(column.accessor || column.key || '', newDirection);
  };

  // Handle row selection
  const handleRowSelect = (rowId: string | number, checked: boolean) => {
    let newSelection: Array<string | number>;
    if (checked) {
      newSelection = [...selectedRowIds, rowId];
    } else {
      newSelection = selectedRowIds.filter(id => id !== rowId);
    }
    setSelectedRowIds(newSelection);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = displayData.map((row, index) => (row as any).id || generateRowId(row, index));
      setSelectedRowIds(allIds);
    } else {
      setSelectedRowIds([]);
    }
  };

  // Generate unique row ID
  const generateRowId = (row: T, index?: number): string | number => {
    return (row as any).id || `row-${index}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Toggle row expansion
  const toggleRowExpand = (rowId: string | number) => {
    setExpandedRows(prev =>
      prev.includes(rowId)
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    );
  };

  // Render cell content
  const renderCellContent = (row: T, column: Column<T>, rowIndex: number): React.ReactNode => {
    if (column.render) {
      return column.render(row, rowIndex);
    }
    
    let value: any;
    if (column.accessor) {
      if (column.accessor.includes('.')) {
        value = column.accessor.split('.').reduce((obj: any, key) => obj?.[key], row);
      } else {
        value = row[column.accessor];
      }
    } else if (column.key) {
      value = row[column.key];
    }
    
    if (value == null) {
      return column.placeholder || '-';
    }
    
    // Format value
    if (column.format) {
      return column.format(value);
    }
    
    // Default formatting based on type
    if (typeof value === 'number' && column.type === 'currency') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
    
    if (value instanceof Date || column.type === 'date') {
      return new Date(value).toLocaleDateString();
    }
    
    if (column.type === 'boolean') {
      return (
        <span className={`${styles.badge} ${value ? styles.success : styles.danger}`}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }
    
    return value;
  };

  // Get column classes
  const getColumnClasses = (column: Column<T>): string => {
    const classes: string[] = [];
    if (column.align) classes.push(styles[`align-${column.align}`]);
    if (column.width) classes.push(styles[`col-width-${column.width}`]);
    if (column.fixed) classes.push(styles[`fixed-${column.fixed}`]);
    return classes.join(' ');
  };

  // Check if all rows are selected
  const allSelected = displayData.length > 0 && 
    displayData.every((row, index) => selectedRowIds.includes((row as any).id || generateRowId(row, index)));

  // Check if some rows are selected
  const someSelected = displayData.some((row, index) => selectedRowIds.includes((row as any).id || generateRowId(row, index)));

  return (
    <div className={`${styles.tableContainer} ${styles[variant]} ${className}`}>
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>{loadingMessage}</p>
        </div>
      ) : displayData.length === 0 ? (
        <div className={styles.emptyState}>
          <svg className={styles.emptyIcon} viewBox="0 0 24 24" width="48" height="48">
            <path fill="currentColor" d="M20,2H4C2.9,2,2,2.9,2,4V20C2,21.1,2.9,22,4,22H20C21.1,22,22,21.1,22,20V4C22,2.9,21.1,2,20,2M20,20H4V4H20V20M9,13H15V11H9V13Z" />
          </svg>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className={`${styles.tableWrapper} ${stickyHeader ? styles.stickyHeader : ''}`}>
            <table className={`${styles.table} ${styles[size]} ${tableClassName}`}>
              <thead>
                <tr>
                  {/* Row Number Column */}
                  {showRowNumbers && (
                    <th className={`${styles.rowNumberCell} ${styles.stickyCol}`}>#</th>
                  )}
                  
                  {/* Checkbox Column */}
                  {selectable && showCheckboxes && (
                    <th className={`${styles.checkboxCell} ${styles.stickyCol}`}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={input => {
                            if (input) {
                              input.indeterminate = !allSelected && someSelected;
                            }
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        <span className={styles.checkmark}></span>
                      </label>
                    </th>
                  )}
                  
                  {/* Expand Column */}
                  {expandable && (
                    <th className={styles.expandCell}></th>
                  )}
                  
                  {/* Data Columns */}
                  {columns.map((column, index) => (
                    <th
                      key={column.key || column.accessor || index}
                      className={`
                        ${getColumnClasses(column)}
                        ${sortable && column.sortable ? styles.sortable : ''}
                        ${sortColumn === (column.accessor || column.key) ? styles.sorted : ''}
                        ${column.fixed ? styles[`fixed-${column.fixed}`] : ''}
                      `}
                      style={{ width: column.width }}
                      onClick={() => handleSort(column)}
                    >
                      <div className={styles.thContent}>
                        <span>{column.header || column.label}</span>
                        {sortable && column.sortable && (
                          <span className={styles.sortIcon}>
                            {sortColumn === (column.accessor || column.key) ? (
                              sortDirection === 'asc' ? '↑' : '↓'
                            ) : '↕'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  
                  {/* Actions Column */}
                  {actions.length > 0 && (
                    <th className={`${styles.actionsCell} ${styles.stickyRight}`}>
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              
              <tbody>
                {displayData.map((row, rowIndex) => {
                  const rowId = (row as any).id || generateRowId(row, rowIndex);
                  const isExpanded = expandedRows.includes(rowId);
                  const isSelected = selectedRowIds.includes(rowId);
                  
                  return (
                    <React.Fragment key={rowId}>
                      <tr
                        className={`
                          ${isSelected ? styles.selectedRow : ''}
                          ${onRowClick ? styles.clickableRow : ''}
                        `}
                        onClick={() => onRowClick?.(row, rowIndex)}
                      >
                        {/* Row Number */}
                        {showRowNumbers && (
                          <td className={styles.rowNumberCell}>
                            {(currentPage - 1) * pageSize + rowIndex + 1}
                          </td>
                        )}
                        
                        {/* Checkbox */}
                        {selectable && showCheckboxes && (
                          <td className={styles.checkboxCell}>
                            <label className={styles.checkboxLabel}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleRowSelect(rowId, e.target.checked);
                                }}
                              />
                              <span className={styles.checkmark}></span>
                            </label>
                          </td>
                        )}
                        
                        {/* Expand Button */}
                        {expandable && (
                          <td className={styles.expandCell}>
                            <button
                              className={styles.expandButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRowExpand(rowId);
                              }}
                            >
                              {isExpanded ? '▼' : '▶'}
                            </button>
                          </td>
                        )}
                        
                        {/* Data Cells */}
                        {columns.map((column, colIndex) => (
                          <td
                            key={`${rowId}-${column.key || column.accessor || colIndex}`}
                            className={getColumnClasses(column)}
                          >
                            {renderCellContent(row, column, rowIndex)}
                          </td>
                        ))}
                        
                        {/* Action Buttons */}
                        {actions.length > 0 && (
                          <td className={`${styles.actionsCell} ${styles.stickyRight}`}>
                            <div className={styles.actionButtons}>
                              {actions.map((action, index) => {
                                // Check if action should be visible
                                if (action.hidden && action.hidden(row)) return null;
                                
                                return (
                                  <button
                                    key={index}
                                    className={`
                                      ${styles.actionButton}
                                      ${styles[action.variant || 'default']}
                                    `}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.onClick(row, rowIndex);
                                    }}
                                    title={action.label}
                                    disabled={action.disabled && action.disabled(row)}
                                  >
                                    {action.icon && (
                                      <span className={styles.actionIcon}>
                                        {typeof action.icon === 'string' ? (
                                          <img src={action.icon} alt={action.label} />
                                        ) : (
                                          action.icon
                                        )}
                                      </span>
                                    )}
                                    {action.label && !action.iconOnly && (
                                      <span className={styles.actionLabel}>{action.label}</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        )}
                      </tr>
                      
                      {/* Expanded Row Content */}
                      {expandable && isExpanded && renderExpandedRow && (
                        <tr className={styles.expandedRow}>
                          <td
                            colSpan={
                              columns.length +
                              (selectable && showCheckboxes ? 1 : 0) +
                              (showRowNumbers ? 1 : 0) +
                              (expandable ? 1 : 0) +
                              (actions.length > 0 ? 1 : 0)
                            }
                          >
                            {renderExpandedRow(row, rowIndex)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination && totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ←
              </button>
              
              <div className={styles.pageNumbers}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`${styles.pageNumber} ${currentPage === pageNum ? styles.active : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                →
              </button>
              
              <div className={styles.pageInfo}>
                Page {currentPage} of {totalPages} • {totalItems || data.length} total
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Table;