import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import styles from "./StatFilter.module.css";

// Type definitions
interface SortOption {
  label: string;
  value: string;
  key: string;
  order?: "asc" | "desc";
}

interface FilterOption {
  label: string;
  value: string;
  key?: string;
  type?: "select" | "multi-select" | "range" | "date" | "boolean";
  options?: Array<{ label: string; value: string | number | boolean }>;
}

interface DateRange {
  start: string | null;
  end: string | null;
}

interface SavedFilter {
  id: number;
  name: string;
  search: string;
  sort: string | null;
  filters: Record<string, any>;
  dateRange: DateRange;
}

interface StatFilterProps {
  // Data
  data?: any[];
  onFilterChange?: (filteredData: any[]) => void;

  // Configuration
  searchKeys?: string[];
  sortOptions?: SortOption[];
  filterOptions?: FilterOption[];

  // UI Configuration
  variant?: "default" | "minimal" | "compact";
  showSearch?: boolean;
  showSort?: boolean;
  showFilter?: boolean;
  showDateRange?: boolean;
  showQuickFilters?: boolean;

  // Placeholders
  searchPlaceholder?: string;
  sortPlaceholder?: string;
  filterPlaceholder?: string;

  // Default values
  defaultSearch?: string;
  defaultSort?: string | null;
  defaultFilters?: Record<string, any>;
  defaultDateRange?: DateRange;

  // Callbacks
  onSearchChange?: (search: string) => void;
  onSortChange?: (sort: string) => void;
  onFilterSelect?: (key: string, value: any) => void;
  onDateRangeChange?: (dateRange: DateRange) => void;
  onClear?: () => void;

  // Styling
  className?: string;

  // Advanced features
  enableSaveFilters?: boolean;
  enableReset?: boolean;
  sticky?: boolean;
}

const StatFilter: React.FC<StatFilterProps> = ({
  // Data
  data = [],
  onFilterChange,

  // Configuration
  searchKeys = [],
  sortOptions = [],
  filterOptions = [],

  // UI Configuration
  variant = "default",
  showSearch = true,
  showSort = true,
  showFilter = true,
  showDateRange = false,
  showQuickFilters = true,

  // Placeholders
  searchPlaceholder = "Search...",
  sortPlaceholder = "Sort by",
  filterPlaceholder = "Filter",

  // Default values
  defaultSearch = "",
  defaultSort = null,
  defaultFilters = {},
  defaultDateRange = { start: null, end: null },

  // Callbacks
  onSearchChange,
  onSortChange,
  onFilterSelect,
  onDateRangeChange,
  onClear,

  // Styling
  className = "",

  // Advanced features
  enableSaveFilters = false,
  enableReset = true,
  sticky = false,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(defaultSearch);
  const [activeSort, setActiveSort] = useState<string | null>(defaultSort);
  const [activeFilters, setActiveFilters] =
    useState<Record<string, any>>(defaultFilters);
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
  const [showSortPanel, setShowSortPanel] = useState<boolean>(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>(data);

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Apply all filters, search, and sort
  useEffect(() => {
    let result = [...data];

    // Apply search
    if (searchTerm && searchKeys.length > 0) {
      result = result.filter((item) => {
        return searchKeys.some((key) => {
          const value = getNestedValue(item, key);
          if (value == null) return false;
          return value
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply filters
    if (Object.keys(activeFilters).length > 0) {
      result = result.filter((item) => {
        return Object.entries(activeFilters).every(([key, value]) => {
          if (value === null || value === undefined || value === "")
            return true;

          const itemValue = getNestedValue(item, key);

          // Handle different filter types
          const filterConfig = filterOptions.find((f) => f.value === key);

          if (filterConfig?.type === "range") {
            const [min, max] = value;
            return itemValue >= min && itemValue <= max;
          }

          if (filterConfig?.type === "date") {
            const date = new Date(itemValue);
            const filterDate = new Date(value);
            return date.toDateString() === filterDate.toDateString();
          }

          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }

          if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
          ) {
            const operators = value as Record<string, any>;

            return Object.entries(operators).every(([op, val]) => {
              switch (op) {
                case "gt":
                  return itemValue > val;
                case "gte":
                  return itemValue >= val;
                case "lt":
                  return itemValue < val;
                case "lte":
                  return itemValue <= val;
                case "eq":
                  return itemValue === val;
                case "ne":
                  return itemValue !== val;
                case "in":
                  return Array.isArray(val) && val.includes(itemValue);
                case "contains":
                  return itemValue
                    ?.toString()
                    .toLowerCase()
                    .includes(String(val).toLowerCase());
                default:
                  return true;
              }
            });
          }

          return itemValue === value;
        });
      });
    }

    // Apply date range
    if (showDateRange && dateRange.start && dateRange.end) {
      result = result.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate >= new Date(dateRange.start!) &&
          itemDate <= new Date(dateRange.end!)
        );
      });
    }

    // Apply sort
    if (activeSort) {
      const sortConfig = sortOptions.find((s) => s.value === activeSort);
      if (sortConfig) {
        result.sort((a, b) => {
          const aVal = getNestedValue(a, sortConfig.key);
          const bVal = getNestedValue(b, sortConfig.key);

          if (aVal == null) return 1;
          if (bVal == null) return -1;

          const order = sortConfig.order || "asc";
          let comparison = 0;

          if (typeof aVal === "string") {
            comparison = aVal.localeCompare(bVal);
          } else {
            comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          }

          return order === "asc" ? comparison : -comparison;
        });
      }
    }

    setFilteredData(result);
    onFilterChange?.(result);
  }, [data, searchTerm, activeSort, activeFilters, dateRange]);

  // Helper to get nested object values
  const getNestedValue = (obj: any, path: string): any => {
    if (!path) return null;
    const keys = path.split(".");
    return keys.reduce((acc, key) => acc?.[key], obj);
  };

  // Handle search input
  const handleSearch = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    onSearchChange?.(e.target.value);
  };

  // Handle sort selection
  const handleSort = (sortValue: string | null): void => {
    setActiveSort(activeSort === sortValue ? null : sortValue);
    setShowSortPanel(false);
    if (sortValue) onSortChange?.(sortValue);
  };

  // Handle filter selection
  const handleFilter = (key: string, value: any): void => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };

      if (value === null || value === undefined || value === "") {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }

      return newFilters;
    });

    onFilterSelect?.(key, value);
  };

  // Handle multi-select filters
  const handleMultiFilter = (
    key: string,
    option: string | number | boolean,
  ): void => {
    setActiveFilters((prev) => {
      const current = prev[key] || [];
      const newFilters = { ...prev };

      if (current.includes(option)) {
        newFilters[key] = current.filter((v: any) => v !== option);
        if (newFilters[key].length === 0) delete newFilters[key];
      } else {
        newFilters[key] = [...current, option];
      }

      return newFilters;
    });
  };

  // Clear all filters
  const handleClearAll = (): void => {
    setSearchTerm("");
    setActiveSort(null);
    setActiveFilters({});
    setDateRange({ start: null, end: null });
    onClear?.();
  };

  // Save current filter configuration
  const handleSaveFilter = (): void => {
    const filterConfig: SavedFilter = {
      id: Date.now(),
      name: `Filter ${savedFilters.length + 1}`,
      search: searchTerm,
      sort: activeSort,
      filters: activeFilters,
      dateRange,
    };
    setSavedFilters([...savedFilters, filterConfig]);
  };

  // Load saved filter
  const handleLoadFilter = (filterConfig: SavedFilter): void => {
    setSearchTerm(filterConfig.search || "");
    setActiveSort(filterConfig.sort || null);
    setActiveFilters(filterConfig.filters || {});
    setDateRange(filterConfig.dateRange || { start: null, end: null });
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilterPanel(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get active filter count
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (searchTerm) count++;
    if (activeSort) count++;
    if (dateRange.start && dateRange.end) count++;
    count += Object.keys(activeFilters).length;
    return count;
  };

  return (
    <div
      className={`${styles.filterContainer} ${styles[variant]} ${sticky ? styles.sticky : ""} ${className}`}
    >
      {/* Search Bar */}
      {showSearch && (
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <svg
              className={styles.searchIcon}
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path
                fill="currentColor"
                d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
              />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <button
                className={styles.clearButton}
                onClick={() => setSearchTerm("")}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    fill="currentColor"
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Filters */}
      {showQuickFilters &&
        filterOptions.slice(0, 3).map(
          (filter) =>
            filter.options && (
              <div key={filter.value} className={styles.quickFilter}>
                <select
                  className={styles.filterSelect}
                  onChange={(e) =>
                    handleFilter(filter.key || filter.value, e.target.value)
                  }
                  value={activeFilters[filter.key || filter.value] || ""}
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((option) => (
                    <option
                      key={String(option.value)}
                      value={String(option.value)}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ),
        )}

      {/* Sort Button */}
      {showSort && sortOptions.length > 0 && (
        <div className={styles.sortSection} ref={sortRef}>
          <button
            className={`${styles.filterButton} ${activeSort ? styles.active : ""}`}
            onClick={() => setShowSortPanel(!showSortPanel)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M18 21L14 17H17V7H14L18 3L22 7H19V17H22M2 19V17H12V19M2 13V11H9V13M2 7V5H6V7H2Z"
              />
            </svg>
            <span>
              {sortOptions.find((s) => s.value === activeSort)?.label ||
                sortPlaceholder}
            </span>
            {activeSort && <span className={styles.activeDot} />}
          </button>

          {showSortPanel && (
            <div className={styles.dropdownPanel}>
              <div className={styles.panelHeader}>
                <h4>Sort By</h4>
                {activeSort && (
                  <button
                    className={styles.clearBtn}
                    onClick={() => handleSort(null)}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className={styles.sortOptions}>
                {sortOptions.map((option) => (
                  <label key={option.value} className={styles.sortOption}>
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      checked={activeSort === option.value}
                      onChange={() => handleSort(option.value)}
                    />
                    <span>{option.label}</span>
                    {option.order && (
                      <span className={styles.sortDirection}>
                        {option.order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Button */}
      {showFilter && filterOptions.length > 0 && (
        <div className={styles.filterSection} ref={filterRef}>
          <button
            className={`${styles.filterButton} ${Object.keys(activeFilters).length > 0 ? styles.active : ""}`}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M12 6H22V8H12M12 12H20V14H12M12 18H18V20H12M6 10V13H4V10H1L5 5L9 10M4 18V15H6V18H9L5 23L1 18H4Z"
              />
            </svg>
            <span>Filter</span>
            {Object.keys(activeFilters).length > 0 && (
              <span className={styles.filterCount}>
                {Object.keys(activeFilters).length}
              </span>
            )}
          </button>

          {showFilterPanel && (
            <div className={styles.dropdownPanel}>
              <div className={styles.panelHeader}>
                <h4>Filters</h4>
                <button className={styles.clearBtn} onClick={handleClearAll}>
                  Clear all
                </button>
              </div>

              <div className={styles.filterOptions}>
                {filterOptions.map((filter) => (
                  <div key={filter.value} className={styles.filterGroup}>
                    <label className={styles.filterLabel}>{filter.label}</label>

                    {/* Different filter types */}
                    {filter.type === "select" && filter.options && (
                      <select
                        className={styles.filterSelect}
                        onChange={(e) =>
                          handleFilter(
                            filter.key || filter.value,
                            e.target.value,
                          )
                        }
                        value={activeFilters[filter.key || filter.value] || ""}
                      >
                        <option value="">All</option>
                        {filter.options.map((option) => (
                          <option
                            key={String(option.value)}
                            value={String(option.value)}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {filter.type === "multi-select" && filter.options && (
                      <div className={styles.multiSelectGroup}>
                        {filter.options.map((option) => (
                          <label
                            key={String(option.value)}
                            className={styles.checkboxLabel}
                          >
                            <input
                              type="checkbox"
                              checked={
                                activeFilters[
                                  filter.key || filter.value
                                ]?.includes(option.value) || false
                              }
                              onChange={() =>
                                handleMultiFilter(
                                  filter.key || filter.value,
                                  option.value,
                                )
                              }
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {filter.type === "range" && (
                      <div className={styles.rangeGroup}>
                        <input
                          type="number"
                          placeholder="Min"
                          className={styles.rangeInput}
                          value={
                            activeFilters[filter.key || filter.value]?.[0] || ""
                          }
                          onChange={(e) =>
                            handleFilter(filter.key || filter.value, [
                              e.target.value,
                              activeFilters[filter.key || filter.value]?.[1] ||
                                "",
                            ])
                          }
                        />
                        <span className={styles.rangeSeparator}>-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          className={styles.rangeInput}
                          value={
                            activeFilters[filter.key || filter.value]?.[1] || ""
                          }
                          onChange={(e) =>
                            handleFilter(filter.key || filter.value, [
                              activeFilters[filter.key || filter.value]?.[0] ||
                                "",
                              e.target.value,
                            ])
                          }
                        />
                      </div>
                    )}

                    {filter.type === "date" && (
                      <input
                        type="date"
                        className={styles.dateInput}
                        value={activeFilters[filter.key || filter.value] || ""}
                        onChange={(e) =>
                          handleFilter(
                            filter.key || filter.value,
                            e.target.value,
                          )
                        }
                      />
                    )}

                    {filter.type === "boolean" && (
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={
                            activeFilters[filter.key || filter.value] || false
                          }
                          onChange={(e) =>
                            handleFilter(
                              filter.key || filter.value,
                              e.target.checked,
                            )
                          }
                        />
                        <span>Yes</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Date Range Picker */}
      {showDateRange && (
        <div className={styles.dateRangeSection}>
          <div className={styles.dateRangeWrapper}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3H18V1M17,12H12V17H17V12Z"
              />
            </svg>
            <input
              type="date"
              className={styles.dateInput}
              value={dateRange.start || ""}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              placeholder="Start date"
            />
            <span className={styles.dateSeparator}>→</span>
            <input
              type="date"
              className={styles.dateInput}
              value={dateRange.end || ""}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              placeholder="End date"
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className={styles.activeFilters}>
          {searchTerm && (
            <span className={styles.activeFilterTag}>
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm("")}>×</button>
            </span>
          )}

          {activeSort && (
            <span className={styles.activeFilterTag}>
              Sort: {sortOptions.find((s) => s.value === activeSort)?.label}
              <button onClick={() => setActiveSort(null)}>×</button>
            </span>
          )}

          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filterOptions.find(
              (f) => (f.key || f.value) === key,
            );
            if (!filter) return null;

            let displayValue: string = value;
            if (Array.isArray(value)) {
              displayValue = value.join(", ");
            } else if (typeof value === "object") {
              displayValue = JSON.stringify(value);
            }

            return (
              <span key={key} className={styles.activeFilterTag}>
                {filter.label}: {displayValue}
                <button onClick={() => handleFilter(key, null)}>×</button>
              </span>
            );
          })}

          {dateRange.start && dateRange.end && (
            <span className={styles.activeFilterTag}>
              Date: {dateRange.start} → {dateRange.end}
              <button onClick={() => setDateRange({ start: null, end: null })}>
                ×
              </button>
            </span>
          )}

          <button className={styles.clearAllBtn} onClick={handleClearAll}>
            Clear all
          </button>
        </div>
      )}

      {/* Results Count */}
      <div className={styles.resultsCount}>
        {filteredData.length} {filteredData.length === 1 ? "result" : "results"}
      </div>

      {/* Save Filter Button */}
      {enableSaveFilters && (
        <button className={styles.saveFilterBtn} onClick={handleSaveFilter}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="currentColor"
              d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V7L17,3Z"
            />
          </svg>
          Save
        </button>
      )}
    </div>
  );
};

export default StatFilter;
