import { LinearIssue, LinearCycle, ProcessedIssue } from "./types";

const LINEAR_API_URL = "https://api.linear.app/graphql";

export async function fetchLinearIssues(
  apiKey: string,
  after?: string | null
): Promise<{
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: LinearIssue[];
}> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const dateFilter = sixMonthsAgo.toISOString();

  const query = `
    query Issues($after: String) {
      issues(
        first: 250
        after: $after
        filter: {
          updatedAt: { gte: "${dateFilter}" }
        }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          number
          title
          createdAt
          startedAt
          completedAt
          estimate
          assignee {
            name
          }
          state {
            name
            type
          }
          cycle {
            name
            number
          }
          labels {
            nodes {
              id
              name
              color
            }
          }
          history(first: 100) {
            nodes {
              updatedAt
              toState {
                name
                type
              }
              fromState {
                name
                type
              }
            }
          }
        }
      }
    }
  `;

  const variables = after ? { after } : {};

  const response = await fetch(LINEAR_API_URL, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Linear API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data.issues;
}

export async function getAllLinearIssues(apiKey: string): Promise<LinearIssue[]> {
  const allIssues: LinearIssue[] = [];
  let hasNext = true;
  let after: string | null = null;

  while (hasNext) {
    const result = await fetchLinearIssues(apiKey, after);
    allIssues.push(...result.nodes);
    hasNext = result.pageInfo.hasNextPage;
    after = result.pageInfo.endCursor;
  }

  return allIssues;
}

export async function getAllCycles(apiKey: string): Promise<string[]> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const dateFilter = sixMonthsAgo.toISOString();

  const query = `
    query Cycles($after: String) {
      cycles(
        first: 100
        after: $after
        filter: {
          endsAt: { gte: "${dateFilter}" }
        }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          name
          number
        }
      }
    }
  `;

  const allCycles: string[] = [];
  let hasNext = true;
  let after: string | null = null;

  while (hasNext) {
    const variables: { after?: string } = after ? { after } : {};

    const response: Response = await fetch(LINEAR_API_URL, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.statusText}`);
    }

    const data: {
      data?: {
        cycles?: {
          nodes: LinearCycle[];
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
        };
      };
      errors?: unknown[];
    } = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const cycles = data.data?.cycles;
    if (cycles) {
      allCycles.push(
        ...cycles.nodes.map((cycle: LinearCycle) =>
          cycle.name || `Cycle ${cycle.number}`
        )
      );
      hasNext = cycles.pageInfo.hasNextPage;
      after = cycles.pageInfo.endCursor;
    } else {
      hasNext = false;
    }
  }

  return Array.from(new Set(allCycles)).sort();
}

export async function getAllWorkflowStates(apiKey: string): Promise<string[]> {
  const query = `
    query WorkflowStates {
      workflowStates {
        nodes {
          name
        }
      }
    }
  `;

  const response = await fetch(LINEAR_API_URL, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Linear API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return Array.from(new Set(data.data.workflowStates.nodes.map((state: { name: string }) => state.name) as string[])).sort();
}

export async function getAllLabels(apiKey: string): Promise<Array<{ name: string; color: string }>> {
  const query = `
    query IssueLabels($after: String) {
      issueLabels(
        first: 100
        after: $after
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          name
          color
        }
      }
    }
  `;

  const allLabels: Array<{ name: string; color: string }> = [];
  let hasNext = true;
  let after: string | null = null;

  while (hasNext) {
    const variables: { after?: string } = after ? { after } : {};

    const response: Response = await fetch(LINEAR_API_URL, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.statusText}`);
    }

    const data: {
      data?: {
        issueLabels?: {
          nodes: Array<{ id: string; name: string; color: string }>;
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
        };
      };
      errors?: unknown[];
    } = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const labels = data.data?.issueLabels;
    if (labels) {
      allLabels.push(
        ...labels.nodes.map((label: { name: string; color: string }) => ({
          name: label.name,
          color: label.color,
        }))
      );
      hasNext = labels.pageInfo.hasNextPage;
      after = labels.pageInfo.endCursor;
    } else {
      hasNext = false;
    }
  }

  // Remove duplicates by name, keeping the first occurrence
  const uniqueLabels = Array.from(
    new Map(allLabels.map((label) => [label.name, label])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  return uniqueLabels;
}

export function processLinearIssues(issues: LinearIssue[]): ProcessedIssue[] {
  return issues.map((issue) => {
    const history = issue.history.nodes;
    let backlogToInProgressTs: string | null = null;
    let inProgressToInReviewTs: string | null = null;
    let inReviewToReadyToQaTs: string | null = null;
    let readyToQaToDoneTs: string | null = null;
    let inReviewToDoneTs: string | null = null;

    // Extract transition timestamps from history
    for (const entry of history) {
      if (!entry.toState || !entry.fromState) continue;

      const prevName = entry.fromState.name;
      const newName = entry.toState.name;
      const ts = entry.updatedAt;

      if (prevName === "Todo" && newName === "In Progress") {
        if (!backlogToInProgressTs) {
          backlogToInProgressTs = ts;
        }
      } else if (prevName === "In Progress" && newName === "In Review") {
        if (!inProgressToInReviewTs) {
          inProgressToInReviewTs = ts;
        }
      } else if (prevName === "In Review" && newName === "Ready to QA") {
        if (!inReviewToReadyToQaTs) {
          inReviewToReadyToQaTs = ts;
        }
      } else if (prevName === "Ready to QA" && newName === "Done") {
        if (!readyToQaToDoneTs) {
          readyToQaToDoneTs = ts;
        }
      } else if (prevName === "In Review" && newName === "Done") {
        // Direct transition from In Review to Done (skip Ready to QA)
        if (!inReviewToDoneTs) {
          inReviewToDoneTs = ts;
        }
      }
    }

    // Calculate durations in days
    let inProgressToInReviewDays: number | null = null;
    let inReviewToReadyToQaDays: number | null = null;
    let readyToQaToDoneDays: number | null = null;
    let inReviewToDoneDays: number | null = null;

    try {
      if (backlogToInProgressTs && inProgressToInReviewTs) {
        const inProgressStart = new Date(backlogToInProgressTs);
        const inReviewStart = new Date(inProgressToInReviewTs);
        const diffMs = inReviewStart.getTime() - inProgressStart.getTime();
        inProgressToInReviewDays = Math.round((diffMs / (1000 * 60 * 60 * 24)) * 100) / 100;
      }
    } catch (e) {
      inProgressToInReviewDays = null;
    }

    try {
      if (inProgressToInReviewTs && inReviewToReadyToQaTs) {
        const inReviewStart = new Date(inProgressToInReviewTs);
        const readyToQaTime = new Date(inReviewToReadyToQaTs);
        const diffMs = readyToQaTime.getTime() - inReviewStart.getTime();
        inReviewToReadyToQaDays = Math.round((diffMs / (1000 * 60 * 60 * 24)) * 100) / 100;
      }
    } catch (e) {
      inReviewToReadyToQaDays = null;
    }

    try {
      if (inReviewToReadyToQaTs && readyToQaToDoneTs) {
        const readyToQaStart = new Date(inReviewToReadyToQaTs);
        const doneTime = new Date(readyToQaToDoneTs);
        const diffMs = doneTime.getTime() - readyToQaStart.getTime();
        readyToQaToDoneDays = Math.round((diffMs / (1000 * 60 * 60 * 24)) * 100) / 100;
      }
    } catch (e) {
      readyToQaToDoneDays = null;
    }

    // Calculate total in_review_to_done_days (backward compatibility)
    try {
      if (inReviewToReadyToQaDays !== null && readyToQaToDoneDays !== null) {
        // If we have both phases, sum them
        inReviewToDoneDays = Math.round((inReviewToReadyToQaDays + readyToQaToDoneDays) * 100) / 100;
      } else if (inProgressToInReviewTs && inReviewToDoneTs) {
        // Direct transition from In Review to Done
        const inReviewStart = new Date(inProgressToInReviewTs);
        const doneTime = new Date(inReviewToDoneTs);
        const diffMs = doneTime.getTime() - inReviewStart.getTime();
        inReviewToDoneDays = Math.round((diffMs / (1000 * 60 * 60 * 24)) * 100) / 100;
      } else if (inProgressToInReviewTs && readyToQaToDoneTs) {
        // In case we have Ready to QA to Done but missed the In Review to Ready to QA transition
        const inReviewStart = new Date(inProgressToInReviewTs);
        const doneTime = new Date(readyToQaToDoneTs);
        const diffMs = doneTime.getTime() - inReviewStart.getTime();
        inReviewToDoneDays = Math.round((diffMs / (1000 * 60 * 60 * 24)) * 100) / 100;
      }
    } catch (e) {
      inReviewToDoneDays = null;
    }

    // Derive status
    const status = issue.state.name;
    const status_type = issue.state.type;

    // Extract label names
    const labelNames = issue.labels?.nodes?.map((label) => label.name) || [];

    return {
      issue_id: issue.id,
      issue_number: issue.number,
      issue_title: issue.title,
      assignee: issue.assignee?.name || "Unassigned",
      sprint: issue.cycle?.name || (issue.cycle?.number ? `Cycle ${issue.cycle.number}` : null),
      estimate_points: issue.estimate,
      status,
      status_type,
      labels: labelNames,
      in_progress_to_in_review_days: inProgressToInReviewDays,
      in_review_to_done_days: inReviewToDoneDays,
      in_review_to_ready_to_qa_days: inReviewToReadyToQaDays,
      ready_to_qa_to_done_days: readyToQaToDoneDays,
      backlog_to_in_progress_timestamp: backlogToInProgressTs,
      in_progress_to_in_review_timestamp: inProgressToInReviewTs,
      in_review_to_done_timestamp: inReviewToDoneTs,
      in_review_to_ready_to_qa_timestamp: inReviewToReadyToQaTs,
      ready_to_qa_to_done_timestamp: readyToQaToDoneTs,
    };
  });
}


