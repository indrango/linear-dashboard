"use client";

import { useState, useEffect, useMemo } from "react";
import { ProcessedIssue, Filters } from "@/app/lib/types";
import FiltersComponent from "@/app/components/Filters";
import IssueTable from "@/app/components/IssueTable";
import KPICards from "@/app/components/KPICards";
import StatusChart from "@/app/components/Charts/StatusChart";
import DurationChart from "@/app/components/Charts/DurationChart";
import TimelineChart from "@/app/components/Charts/TimelineChart";

export default function Dashboard() {
  const [issues, setIssues] = useState<ProcessedIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<ProcessedIssue[]>([]);
  const [availableCycles, setAvailableCycles] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableLabels, setAvailableLabels] = useState<Array<{ name: string; color: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    assignees: [],
    statuses: [],
    sprints: [],
    labels: [],
    dateRange: { start: null, end: null },
    estimateRange: { min: null, max: null },
  });

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/linear");
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = await response.json();

        // Handle both old format (array) and new format (object with issues and availableCycles)
        if (Array.isArray(data)) {
          // Backward compatibility: old format
          setIssues(data);
          setFilteredIssues(data);
          const cycles = new Set(
            data.map((i) => i.sprint).filter((s): s is string => s !== null)
          );
          setAvailableCycles(Array.from(cycles).sort());
          setAvailableStatuses(["Todo", "In Progress", "In Review", "Done"]);
          const labels = new Set(
            data.flatMap((i) => i.labels || [])
          );
          // For backward compatibility, create label objects with default color
          setAvailableLabels(
            Array.from(labels)
              .map((name) => ({ name, color: "#6B7280" }))
              .sort((a, b) => a.name.localeCompare(b.name))
          );
        } else {
          // New format: object with issues, availableCycles, availableStatuses, and availableLabels
          setIssues(data.issues || []);
          setFilteredIssues(data.issues || []);
          setAvailableCycles(data.availableCycles || []);
          setAvailableStatuses(data.availableStatuses || []);
          setAvailableLabels(
            data.availableLabels?.map((label: { name: string; color: string } | string) =>
              typeof label === "string" ? { name: label, color: "#6B7280" } : label
            ) || []
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch issues");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Extract unique values for filters
  const availableAssignees = useMemo(() => {
    const assignees = new Set(issues.map((i) => i.assignee));
    return Array.from(assignees).sort();
  }, [issues]);

  // Apply filters
  useEffect(() => {
    let filtered = [...issues];

    // Filter by assignees
    if (filters.assignees.length > 0) {
      filtered = filtered.filter((i) => filters.assignees.includes(i.assignee));
    }

    // Filter by statuses
    if (filters.statuses.length > 0) {
      filtered = filtered.filter((i) => filters.statuses.includes(i.status));
    }

    // Filter by cycles
    if (filters.sprints.length > 0) {
      filtered = filtered.filter(
        (i) => i.sprint && filters.sprints.includes(i.sprint)
      );
    }

    // Filter by labels
    if (filters.labels.length > 0) {
      filtered = filtered.filter(
        (i) => i.labels && i.labels.some((label) => filters.labels.includes(label))
      );
    }

    // Filter by date range
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      filtered = filtered.filter((i) => {
        const issueDate = i.backlog_to_in_progress_timestamp
          ? new Date(i.backlog_to_in_progress_timestamp)
          : null;
        return issueDate && issueDate >= startDate;
      });
    }

    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      filtered = filtered.filter((i) => {
        const issueDate = i.backlog_to_in_progress_timestamp
          ? new Date(i.backlog_to_in_progress_timestamp)
          : null;
        return issueDate && issueDate <= endDate;
      });
    }

    // Filter by estimate range
    if (filters.estimateRange.min !== null) {
      filtered = filtered.filter(
        (i) =>
          i.estimate_points !== null &&
          i.estimate_points >= filters.estimateRange.min!
      );
    }

    if (filters.estimateRange.max !== null) {
      filtered = filtered.filter(
        (i) =>
          i.estimate_points !== null &&
          i.estimate_points <= filters.estimateRange.max!
      );
    }

    setFilteredIssues(filtered);
  }, [issues, filters]);

  if (loading) {
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
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
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
          <h1 className="text-3xl font-bold text-gray-900">Linear Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Track issue durations and team performance
          </p>
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
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Issues ({filteredIssues.length})
              </h2>
              <IssueTable issues={filteredIssues} availableLabels={availableLabels} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
