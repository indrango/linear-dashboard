// TypeScript type definitions for Linear API responses

export interface LinearState {
  name: string;
}

export interface LinearHistoryEntry {
  updatedAt: string;
  toState: LinearState | null;
  fromState: LinearState | null;
}

export interface LinearAssignee {
  name: string;
}

export interface LinearCycle {
  name: string | null;
  number: number;
}

export interface LinearIssue {
  id: string;
  number: number;
  title: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  estimate: number | null;
  assignee: LinearAssignee | null;
  cycle: LinearCycle | null;
  history: {
    nodes: LinearHistoryEntry[];
  };
}

export interface LinearPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface LinearIssuesResponse {
  issues: {
    pageInfo: LinearPageInfo;
    nodes: LinearIssue[];
  };
}

// Processed issue data for the dashboard
export interface ProcessedIssue {
  issue_id: string;
  issue_number: number;
  issue_title: string;
  assignee: string;
  sprint: string | null;
  estimate_points: number | null;
  status: "Todo" | "In Progress" | "In Review" | "Done";
  in_progress_to_in_review_days: number | null;
  in_review_to_done_days: number | null;
  backlog_to_in_progress_timestamp: string | null;
  in_progress_to_in_review_timestamp: string | null;
  in_review_to_done_timestamp: string | null;
}

// Filter types
export interface Filters {
  assignees: string[];
  statuses: string[];
  sprints: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  estimateRange: {
    min: number | null;
    max: number | null;
  };
}


