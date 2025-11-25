"use client";

import { useState, useMemo, useEffect } from "react";
import { ProcessedIssue } from "@/app/lib/types";
import { formatDate, formatDateTime, cn } from "@/app/lib/utils";
import { useDebounce } from "@/app/hooks/useDebounce";

interface LabelOption {
  name: string;
  color: string;
}

interface IssueTableProps {
  issues: ProcessedIssue[];
  availableLabels?: LabelOption[];
}

type SortField =
  | "issue_number"
  | "issue_title"
  | "assignee"
  | "status"
  | "sprint"
  | "labels"
  | "in_progress_to_in_review_days"
  | "in_review_to_ready_to_qa_days"
  | "ready_to_qa_to_done_days"
  | "estimate_points";
type SortDirection = "asc" | "desc";

export default function IssueTable({ issues, availableLabels = [] }: IssueTableProps) {
  const [sortField, setSortField] = useState<SortField>("issue_number");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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

  const sortedIssues = useMemo(() => {
    const sorted = [...issues].sort((a, b) => {
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
          // Handle null values - convert to empty string for sorting, but treat as null for comparison
          aValue = a.sprint ? a.sprint.toLowerCase() : null;
          bValue = b.sprint ? b.sprint.toLowerCase() : null;
          break;
        case "in_progress_to_in_review_days":
          aValue = a.in_progress_to_in_review_days ?? -1;
          bValue = b.in_progress_to_in_review_days ?? -1;
          break;
        case "in_review_to_ready_to_qa_days":
          aValue = a.in_review_to_ready_to_qa_days ?? -1;
          bValue = b.in_review_to_ready_to_qa_days ?? -1;
          break;
        case "ready_to_qa_to_done_days":
          aValue = a.ready_to_qa_to_done_days ?? -1;
          bValue = b.ready_to_qa_to_done_days ?? -1;
          break;
        case "estimate_points":
          aValue = a.estimate_points ?? -1;
          bValue = b.estimate_points ?? -1;
          break;
        case "labels":
          // Sort by number of labels first, then alphabetically by first label name
          const aLabelCount = a.labels?.length ?? 0;
          const bLabelCount = b.labels?.length ?? 0;
          if (aLabelCount !== bLabelCount) {
            return sortDirection === "asc" 
              ? aLabelCount - bLabelCount 
              : bLabelCount - aLabelCount;
          }
          const aFirstLabel = a.labels?.[0]?.toLowerCase() ?? "";
          const bFirstLabel = b.labels?.[0]?.toLowerCase() ?? "";
          aValue = aFirstLabel;
          bValue = bFirstLabel;
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
  }, [issues, sortField, sortDirection]);

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

  // Helper function to get contrast color (black or white) based on background
  const getContrastColor = (hexColor: string): string => {
    // Remove # if present
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "In QA":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Ready to QA":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Todo":
      case "Backlog":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Canceled":
        return "bg-red-100 text-red-800 border-red-200";
      case "Duplicate":
        return "bg-gray-200 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header with title and search */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Issues ({filteredIssues.length})
          </h2>
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("issue_number")}
            >
              <div className="flex items-center">
                #
                <SortIcon field="issue_number" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("issue_title")}
            >
              <div className="flex items-center">
                Title
                <SortIcon field="issue_title" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("assignee")}
            >
              <div className="flex items-center">
                Assignee
                <SortIcon field="assignee" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center">
                Status
                <SortIcon field="status" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("sprint")}
            >
              <div className="flex items-center">
                Cycle
                <SortIcon field="sprint" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("labels")}
            >
              <div className="flex items-center">
                Labels
                <SortIcon field="labels" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("estimate_points")}
            >
              <div className="flex items-center">
                Estimate
                <SortIcon field="estimate_points" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("in_progress_to_in_review_days")}
            >
              <div className="flex items-center">
                In Progress → Review (days)
                <SortIcon field="in_progress_to_in_review_days" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("in_review_to_ready_to_qa_days")}
            >
              <div className="flex items-center">
                Review → Ready to QA (days)
                <SortIcon field="in_review_to_ready_to_qa_days" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("ready_to_qa_to_done_days")}
            >
              <div className="flex items-center">
                Ready to QA → Done (days)
                <SortIcon field="ready_to_qa_to_done_days" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Started
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Completed
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedIssues.map((issue) => (
            <tr
              key={issue.issue_id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {issue.issue_number}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 max-w-md truncate">
                {issue.issue_title}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {issue.assignee}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                    getStatusColor(issue.status)
                  )}
                >
                  {issue.status}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {issue.sprint || "-"}
              </td>
              <td className="px-4 py-3 text-sm">
                {issue.labels && issue.labels.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {issue.labels.map((labelName) => {
                      const label = availableLabels.find((l) => l.name === labelName);
                      return (
                        <span
                          key={labelName}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: label?.color || "#6B7280",
                            color: label ? getContrastColor(label.color) : "#FFFFFF",
                          }}
                        >
                          {labelName}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {issue.estimate_points ?? "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {issue.in_progress_to_in_review_days ?? "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {issue.in_review_to_ready_to_qa_days ?? "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {issue.ready_to_qa_to_done_days ?? "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatDate(issue.backlog_to_in_progress_timestamp)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatDate(issue.ready_to_qa_to_done_timestamp)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredIssues.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? "No issues found matching your search." : "No issues found matching the current filters."}
        </div>
      )}
      </div>

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


