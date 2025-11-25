"use client";

import { useState, useMemo, useEffect } from "react";
import { ProcessedIssue } from "@/app/lib/types";
import { formatDate } from "@/app/lib/utils";
import { useDebounce } from "@/app/hooks/useDebounce";

interface QAFeedbackTableProps {
  issues: ProcessedIssue[];
  availableLabels: Array<{ name: string; color: string }>;
}

type SortField =
  | "issue_number"
  | "issue_title"
  | "assignee"
  | "status"
  | "sprint"
  | "qa_feedback_iterations";
type SortDirection = "asc" | "desc";

export default function QAFeedbackTable({ issues, availableLabels }: QAFeedbackTableProps) {
  const [sortField, setSortField] = useState<SortField>("issue_number");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter issues with QA Feedback label
  const qaFeedbackIssues = useMemo(() => {
    return issues.filter(issue => 
      issue.labels.some(label => 
        label.toLowerCase().includes("qa feedback") || 
        label.toLowerCase() === "qa feedback"
      )
    );
  }, [issues]);

  // Search filtering function
  const matchesSearch = (issue: ProcessedIssue, query: string): boolean => {
    if (!query.trim()) return true;
    const lowerQuery = query.toLowerCase();
    
    return (
      issue.issue_title.toLowerCase().includes(lowerQuery) ||
      issue.assignee.toLowerCase().includes(lowerQuery) ||
      issue.issue_number.toString().includes(lowerQuery) ||
      issue.status.toLowerCase().includes(lowerQuery) ||
      (issue.labels && issue.labels.some(label => label.toLowerCase().includes(lowerQuery)))
    );
  };

  // Sorting function
  const sortedIssues = useMemo(() => {
    const sorted = [...qaFeedbackIssues].sort((a, b) => {
      let aValue: string | number | null;
      let bValue: string | number | null;

      switch (sortField) {
        case "issue_number":
          aValue = a.issue_number;
          bValue = b.issue_number;
          break;
        case "issue_title":
          aValue = a.issue_title.toLowerCase();
          bValue = b.issue_title.toLowerCase();
          break;
        case "assignee":
          aValue = a.assignee.toLowerCase();
          bValue = b.assignee.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "sprint":
          aValue = a.sprint ? a.sprint.toLowerCase() : null;
          bValue = b.sprint ? b.sprint.toLowerCase() : null;
          break;
        case "qa_feedback_iterations":
          aValue = a.qa_feedback_iterations ?? -1;
          bValue = b.qa_feedback_iterations ?? -1;
          break;
        default:
          return 0;
      }

      if (aValue === null || aValue === -1) return 1;
      if (bValue === null || bValue === -1) return -1;

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [qaFeedbackIssues, sortField, sortDirection]);

  // Apply search filter
  const filteredIssues = useMemo(() => {
    return sortedIssues.filter(issue => matchesSearch(issue, debouncedSearchQuery));
  }, [sortedIssues, debouncedSearchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIssues = filteredIssues.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // Reset to page 1 when sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <span className="text-gray-400 text-xs ml-1">
          <svg
            className="w-4 h-4 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </span>
      );
    }
    return (
      <span className="text-blue-600 text-xs ml-1">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  // Calculate time to fix for each iteration
  const getTimeToFix = (cycle: {
    qa_feedback_timestamp: string;
    status_change_timestamp: string;
    to_ready_to_qa_timestamp: string;
  }) => {
    // Time to fix = from when status changed (work started) to when back to Ready to QA
    try {
      const start = new Date(cycle.status_change_timestamp);
      const end = new Date(cycle.to_ready_to_qa_timestamp);
      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 0;
      }
      const diffMs = end.getTime() - start.getTime();
      if (diffMs < 0) {
        return 0; // Invalid: end before start
      }
      return Math.round((diffMs / (1000 * 60 * 60 * 24)) * 100) / 100;
    } catch {
      return 0;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              QA Feedback Analysis
            </h3>
            <div className="text-sm text-gray-600">
              {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} with QA Feedback
            </div>
          </div>
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-500">
          {searchQuery ? "No issues found matching your search." : "No issues with QA Feedback label found"}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("issue_number")}
                >
                  <div className="flex items-center">
                    #
                    <SortIcon field="issue_number" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("issue_title")}
                >
                  <div className="flex items-center">
                    Title
                    <SortIcon field="issue_title" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("assignee")}
                >
                  <div className="flex items-center">
                    Assignee
                    <SortIcon field="assignee" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("sprint")}
                >
                  <div className="flex items-center">
                    Cycle
                    <SortIcon field="sprint" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("qa_feedback_iterations")}
                >
                  <div className="flex items-center">
                    Iterations
                    <SortIcon field="qa_feedback_iterations" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Avg Time to Fix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Total Time to Fix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Iteration Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedIssues.map((issue) => {
                const cycles = issue.qa_feedback_cycles || [];
                const timesToFix = cycles.map(getTimeToFix);
                const avgTimeToFix = timesToFix.length > 0
                  ? (timesToFix.reduce((a, b) => a + b, 0) / timesToFix.length).toFixed(1)
                  : "N/A";
                const totalTimeToFix = timesToFix.reduce((a, b) => a + b, 0).toFixed(1);

                return (
                  <tr key={issue.issue_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {issue.issue_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                      {issue.issue_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {issue.assignee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {issue.sprint || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                        {issue.qa_feedback_iterations || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {avgTimeToFix !== "N/A" ? `${avgTimeToFix} days` : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {totalTimeToFix !== "0.0" ? `${totalTimeToFix} days` : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {cycles.length > 0 ? (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800">
                            View {cycles.length} iteration{cycles.length !== 1 ? 's' : ''}
                          </summary>
                          <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-200">
                            {cycles.map((cycle, idx) => {
                              const timeToFix = getTimeToFix(cycle);
                              return (
                                <div key={idx} className="text-xs">
                                  <div className="font-medium text-gray-900">
                                    Iteration {idx + 1}
                                  </div>
                                  <div className="text-gray-600 mt-1">
                                    <div>QA Feedback Given: {formatDate(cycle.qa_feedback_timestamp)}</div>
                                    <div>Status Changed: {formatDate(cycle.status_change_timestamp)}</div>
                                    <div>Back to Ready to QA: {formatDate(cycle.to_ready_to_qa_timestamp)}</div>
                                    <div className="font-semibold text-orange-600 mt-1">
                                      Time to Fix: {timeToFix} days
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      ) : (
                        <span className="text-gray-400">No iterations</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredIssues.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredIssues.length)} of {filteredIssues.length} issues
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

