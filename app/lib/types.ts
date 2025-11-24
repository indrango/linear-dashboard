// TypeScript type definitions for Linear API responses

export interface LinearState {
  name: string;
  type: string;
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

export interface LinearLabel {
  id: string;
  name: string;
  color: string;
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
  state: LinearState;
  cycle: LinearCycle | null;
  labels: {
    nodes: LinearLabel[];
  };
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
export interface QAFeedbackCycle {
  qa_feedback_timestamp: string;      // When QA feedback label was assigned
  status_change_timestamp: string;    // When status changed (work started)
  to_ready_to_qa_timestamp: string;    // When back to Ready to QA (fix complete)
  pattern_type?: "ready_to_qa" | "in_qa"; // Which pattern detected this cycle
}

export interface ProcessedIssue {
  issue_id: string;
  issue_number: number;
  issue_title: string;
  assignee: string;
  sprint: string | null;
  estimate_points: number | null;
  status: string;
  status_type: string;
  labels: string[];
  in_progress_to_in_review_days: number | null;
  in_review_to_done_days: number | null;
  in_review_to_ready_to_qa_days: number | null;
  ready_to_qa_to_done_days: number | null;
  backlog_to_in_progress_timestamp: string | null;
  in_progress_to_in_review_timestamp: string | null;
  in_review_to_done_timestamp: string | null;
  in_review_to_ready_to_qa_timestamp: string | null;
  ready_to_qa_to_done_timestamp: string | null;
  qa_feedback_iterations: number;
  qa_feedback_cycles: QAFeedbackCycle[];
  // Comparison fields for pattern analysis
  qa_feedback_iterations_ready_to_qa: number;
  qa_feedback_iterations_in_qa: number;
  qa_feedback_cycles_ready_to_qa: QAFeedbackCycle[];
  qa_feedback_cycles_in_qa: QAFeedbackCycle[];
}

// Filter types
export interface Filters {
  assignees: string[];
  statuses: string[];
  sprints: string[];
  labels: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  estimateRange: {
    min: number | null;
    max: number | null;
  };
}


