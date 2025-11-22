"use client";

import { useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Filters as FiltersType } from "@/app/lib/types";
import { cn } from "@/app/lib/utils";

interface FiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  availableAssignees: string[];
  availableStatuses: string[];
  availableCycles: (string | null)[];
}

export default function Filters({
  filters,
  onFiltersChange,
  availableAssignees,
  availableStatuses,
  availableCycles,
}: FiltersProps) {
  const updateFilter = <K extends keyof FiltersType>(
    key: K,
    value: FiltersType[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof FiltersType) => {
    if (key === "assignees") {
      updateFilter("assignees", []);
    } else if (key === "statuses") {
      updateFilter("statuses", []);
    } else if (key === "sprints") {
      updateFilter("sprints", []);
    } else if (key === "dateRange") {
      updateFilter("dateRange", { start: null, end: null });
    } else if (key === "estimateRange") {
      updateFilter("estimateRange", { min: null, max: null });
    }
  };

  const resetAllFilters = () => {
    onFiltersChange({
      assignees: [],
      statuses: [],
      sprints: [],
      dateRange: { start: null, end: null },
      estimateRange: { min: null, max: null },
    });
  };

  const hasActiveFilters =
    filters.assignees.length > 0 ||
    filters.statuses.length > 0 ||
    filters.sprints.length > 0 ||
    filters.dateRange.start !== null ||
    filters.dateRange.end !== null ||
    filters.estimateRange.min !== null ||
    filters.estimateRange.max !== null;

  const MultiSelect = ({
    label,
    options,
    selected,
    onChange,
    onClear,
  }: {
    label: string;
    options: string[];
    selected: string[];
    onChange: (value: string[]) => void;
    onClear: () => void;
  }) => {
    const handleChange = (value: string) => {
      if (selected.includes(value)) {
        onChange(selected.filter((s) => s !== value));
      } else {
        onChange([...selected, value]);
      }
    };

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
        <Listbox value={selected} onChange={() => { }} multiple>
          {({ open }) => (
            <>
              <Listbox.Button
                className={cn(
                  "relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm",
                  selected.length > 0 && "border-blue-500"
                )}
              >
                <span className="block truncate">
                  {selected.length === 0
                    ? `All ${label}`
                    : `${selected.length} selected`}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Transition
                show={open}
                as="div"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              >
                <Listbox.Options static>
                  {options.map((option) => {
                    const isSelected = selected.includes(option);
                    return (
                      <div
                        key={option}
                        onClick={() => handleChange(option)}
                        className={cn(
                          "relative cursor-pointer select-none py-2 pl-3 pr-9",
                          isSelected
                            ? "bg-blue-100 text-blue-900 border-l-2 border-blue-600"
                            : "text-gray-900 hover:bg-gray-50"
                        )}
                      >
                        <span
                          className={cn(
                            isSelected ? "font-semibold" : "font-normal",
                            "block truncate"
                          )}
                        >
                          {option}
                        </span>
                        {isSelected && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-700 font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </Listbox.Options>
              </Transition>
            </>
          )}
        </Listbox>
        {selected.length > 0 && (
          <button
            onClick={onClear}
            className="mt-1 text-xs text-blue-600 hover:text-blue-800"
          >
            Clear
          </button>
        )}
      </div>
    );
  };

  const statusOptions = availableStatuses;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">Filters</h2>

      <MultiSelect
        label="Assignee"
        options={availableAssignees}
        selected={filters.assignees}
        onChange={(value) => updateFilter("assignees", value)}
        onClear={() => clearFilter("assignees")}
      />

      <MultiSelect
        label="Status"
        options={statusOptions}
        selected={filters.statuses}
        onChange={(value) => updateFilter("statuses", value)}
        onClear={() => clearFilter("statuses")}
      />

      <MultiSelect
        label="Cycle"
        options={availableCycles.filter((s): s is string => s !== null)}
        selected={filters.sprints}
        onChange={(value) => updateFilter("sprints", value)}
        onClear={() => clearFilter("sprints")}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Date Range
        </label>
        <div className="space-y-2">
          <input
            type="date"
            value={filters.dateRange.start || ""}
            onChange={(e) =>
              updateFilter("dateRange", {
                ...filters.dateRange,
                start: e.target.value || null,
              })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="date"
            value={filters.dateRange.end || ""}
            onChange={(e) =>
              updateFilter("dateRange", {
                ...filters.dateRange,
                end: e.target.value || null,
              })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {(filters.dateRange.start || filters.dateRange.end) && (
          <button
            onClick={() => clearFilter("dateRange")}
            className="mt-1 text-xs text-blue-600 hover:text-blue-800"
          >
            Clear
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Estimate Points
        </label>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.estimateRange.min ?? ""}
            onChange={(e) =>
              updateFilter("estimateRange", {
                ...filters.estimateRange,
                min: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.estimateRange.max ?? ""}
            onChange={(e) =>
              updateFilter("estimateRange", {
                ...filters.estimateRange,
                max: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {(filters.estimateRange.min !== null ||
          filters.estimateRange.max !== null) && (
            <button
              onClick={() => clearFilter("estimateRange")}
              className="mt-1 text-xs text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          )}
      </div>

      {hasActiveFilters && (
        <button
          onClick={resetAllFilters}
          className="w-full mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );
}

