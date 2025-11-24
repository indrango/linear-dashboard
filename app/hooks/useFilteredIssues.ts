"use client";

import { useMemo } from "react";
import { ProcessedIssue, Filters } from "@/app/lib/types";

/**
 * Custom hook to filter issues based on filter criteria
 * Uses useMemo for performance optimization instead of useEffect
 * 
 * @param issues - Array of issues to filter
 * @param filters - Filter criteria
 * @returns Filtered array of issues
 */
export function useFilteredIssues(
  issues: ProcessedIssue[],
  filters: Filters
): ProcessedIssue[] {
  return useMemo(() => {
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

    // Filter by date range with safe date parsing
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      // Validate date
      if (!isNaN(startDate.getTime())) {
        filtered = filtered.filter((i) => {
          if (!i.backlog_to_in_progress_timestamp) return false;
          const issueDate = new Date(i.backlog_to_in_progress_timestamp);
          return !isNaN(issueDate.getTime()) && issueDate >= startDate;
        });
      }
    }

    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      // Validate date
      if (!isNaN(endDate.getTime())) {
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        filtered = filtered.filter((i) => {
          if (!i.backlog_to_in_progress_timestamp) return false;
          const issueDate = new Date(i.backlog_to_in_progress_timestamp);
          return !isNaN(issueDate.getTime()) && issueDate <= endDate;
        });
      }
    }

    // Filter by estimate range
    if (filters.estimateRange.min !== null && filters.estimateRange.min !== undefined) {
      const minValue = filters.estimateRange.min;
      filtered = filtered.filter(
        (i) =>
          i.estimate_points !== null &&
          i.estimate_points >= minValue
      );
    }

    if (filters.estimateRange.max !== null && filters.estimateRange.max !== undefined) {
      const maxValue = filters.estimateRange.max;
      filtered = filtered.filter(
        (i) =>
          i.estimate_points !== null &&
          i.estimate_points <= maxValue
      );
    }

    return filtered;
  }, [issues, filters]);
}

