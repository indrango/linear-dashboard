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
          cycle {
            name
            number
          }
          history(first: 100) {
            nodes {
              updatedAt
              toState {
                name
              }
              fromState {
                name
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

export function processLinearIssues(issues: LinearIssue[]): ProcessedIssue[] {
  return issues.map((issue) => {
    const history = issue.history.nodes;
    let backlogToInProgressTs: string | null = null;
    let inProgressToInReviewTs: string | null = null;
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
      } else if (prevName === "In Review" && newName === "Done") {
        if (!inReviewToDoneTs) {
          inReviewToDoneTs = ts;
        }
      }
    }

    // Calculate durations in days
    let inProgressToInReviewDays: number | null = null;
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
      if (inProgressToInReviewTs && inReviewToDoneTs) {
        const inReviewStart = new Date(inProgressToInReviewTs);
        const doneTime = new Date(inReviewToDoneTs);
        const diffMs = doneTime.getTime() - inReviewStart.getTime();
        inReviewToDoneDays = Math.round((diffMs / (1000 * 60 * 60 * 24)) * 100) / 100;
      }
    } catch (e) {
      inReviewToDoneDays = null;
    }

    // Derive status
    let status: "Todo" | "In Progress" | "In Review" | "Done" = "Todo";
    if (inReviewToDoneTs) {
      status = "Done";
    } else if (inProgressToInReviewTs) {
      status = "In Review";
    } else if (backlogToInProgressTs) {
      status = "In Progress";
    }

    return {
      issue_id: issue.id,
      issue_number: issue.number,
      issue_title: issue.title,
      assignee: issue.assignee?.name || "Unassigned",
      sprint: issue.cycle?.name || (issue.cycle?.number ? `Cycle ${issue.cycle.number}` : null),
      estimate_points: issue.estimate,
      status,
      in_progress_to_in_review_days: inProgressToInReviewDays,
      in_review_to_done_days: inReviewToDoneDays,
      backlog_to_in_progress_timestamp: backlogToInProgressTs,
      in_progress_to_in_review_timestamp: inProgressToInReviewTs,
      in_review_to_done_timestamp: inReviewToDoneTs,
    };
  });
}


