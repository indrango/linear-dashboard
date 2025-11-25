"use client";

import { useState, useMemo } from "react";
import { Filters } from "@/app/lib/types";
import FiltersComponent from "@/app/components/Filters";
import IssueTable from "@/app/components/IssueTable";
import KPICards from "@/app/components/KPICards";
import StatusChart from "@/app/components/Charts/StatusChart";
import DurationChart from "@/app/components/Charts/DurationChart";
import TimelineChart from "@/app/components/Charts/TimelineChart";
import LastUpdated from "@/app/components/LastUpdated";
import { useLinearData } from "@/app/hooks/useLinearData";
import { useFilteredIssues } from "@/app/hooks/useFilteredIssues";

export default function Dashboard() {
  const { data, isLoading, error, lastUpdated, isStale, refetch, isRefetching } = useLinearData();
  const [filters, setFilters] = useState<Filters>({
    assignees: [],
    statuses: [],
    sprints: [],
    labels: [],
    dateRange: { start: null, end: null },
    estimateRange: { min: null, max: null },
  });

  const issues = data?.issues || [];
  const availableCycles = data?.availableCycles || [];
  const availableStatuses = data?.availableStatuses || [];
  const availableLabels = data?.availableLabels || [];

  // Extract unique values for filters
  const availableAssignees = useMemo(() => {
    const assignees = new Set(issues.map((i) => i.assignee));
    return Array.from(assignees).sort();
  }, [issues]);

  // Apply filters using custom hook (optimized with useMemo)
  const filteredIssues = useFilteredIssues(issues, filters);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading issues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Error Loading Data
            </h2>
            <p className="text-red-700">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Linear Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Track issue durations and team performance
              </p>
            </div>
            <LastUpdated
              lastUpdated={lastUpdated}
              isStale={isStale}
              isRefetching={isRefetching}
              onRefresh={() => refetch()}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              availableAssignees={availableAssignees}
              availableStatuses={availableStatuses}
              availableCycles={availableCycles}
              availableLabels={availableLabels}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* KPI Cards */}
            <KPICards issues={filteredIssues} />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatusChart issues={filteredIssues} />
              <DurationChart issues={filteredIssues} />
            </div>
            <TimelineChart issues={filteredIssues} />

            {/* Issues Table */}
            <IssueTable issues={filteredIssues} availableLabels={availableLabels} />

          </div>
        </div>
      </div>
    </div>
  );
}
