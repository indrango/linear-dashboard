# Linear Dashboard

A comprehensive dashboard for visualizing and analyzing Linear issue data, featuring real-time metrics, performance tracking, and QA feedback analysis. Built with Next.js and inspired by Linear.app's clean design.

## Features

- **Real-time Data**: Fetches data directly from Linear GraphQL API with intelligent caching
- **Two Specialized Dashboards**: 
  - **Linear Dashboard**: Track issue durations and team performance
  - **QA Feedback Dashboard**: Analyze QA feedback iterations and fix times
- **Interactive Filters**: Filter by assignee, status, cycle, date range, and estimate points
- **Data Caching**: TanStack Query integration prevents unnecessary refetches when switching between dashboards
- **Last Updated Indicator**: Visual status indicator showing data freshness with manual refresh capability
- **Analytics & Visualizations**: 
  - KPI cards with key metrics
  - Status distribution charts
  - Duration analysis by assignee
  - Timeline trends over time
- **Advanced Table Features**:
  - **Sortable Columns**: Multiple sortable columns with visual indicators
  - **Global Sorting**: Sorting applies to entire dataset before pagination
  - **Search Functionality**: Debounced search (300ms) across multiple fields
  - **Pagination**: Configurable items per page (10, 25, 50, 100)
  - **Cycle Column**: Display and sort by Linear cycles/sprints
- **Clean Design**: Linear.app-inspired UI with smooth transitions and minimal styling

## Dashboards

### Linear Dashboard

The Linear Dashboard provides a comprehensive view of issue lifecycle and team performance metrics.

#### KPI Cards

The dashboard displays five key performance indicators:

1. **Total Issues**: Count of all issues in the filtered dataset
2. **Completion Rate**: Percentage of completed issues
   - Formula: `(Completed Issues / Total Issues) × 100`
   - Rounded to 1 decimal place
3. **Avg: In Progress → Review**: Average time spent in development
   - Calculated from: `backlog_to_in_progress_timestamp` to `in_progress_to_in_review_timestamp`
   - Formula: `Sum of all durations / Number of issues with this transition`
   - Rounded to 2 decimal places, displayed in days
4. **Avg: Review → Ready to QA**: Average PR review time
   - Calculated from: `in_progress_to_in_review_timestamp` to `in_review_to_ready_to_qa_timestamp`
   - Formula: `Sum of all durations / Number of issues with this transition`
   - Rounded to 2 decimal places, displayed in days
5. **Avg: Ready to QA → Done**: Average QA completion time
   - Calculated from: `in_review_to_ready_to_qa_timestamp` to `ready_to_qa_to_done_timestamp`
   - Formula: `Sum of all durations / Number of issues with this transition`
   - Rounded to 2 decimal places, displayed in days

#### Charts

1. **Status Distribution Chart** (Pie Chart)
   - Shows the count and percentage of issues by status
   - Statuses include: Done, In Review, In QA, Ready to QA, In Progress, Todo, Backlog, Canceled, Duplicate
   - Each status has a distinct color for easy identification

2. **Average Duration by Assignee Chart** (Bar Chart)
   - Displays average durations for each phase by assignee
   - Shows top 10 assignees sorted by total duration
   - Three stacked bars per assignee:
     - **In Progress → Review** (Orange): Development time
     - **Review → Ready to QA** (Blue): PR review time
     - **Ready to QA → Done** (Green): QA completion time
   - Calculation: For each assignee, averages are calculated separately for each phase

3. **Timeline Chart** (Line Chart)
   - Shows weekly trends of issue statuses over the last 12 weeks
   - Tracks: Completed, In Review, and In Progress issues
   - Groups issues by week based on completion date or latest timestamp

#### Issue Table

The table displays all issues with the following information:
- **Issue number and title**: Sortable by number or title
- **Assignee**: Sortable alphabetically
- **Status**: Current issue status with color-coded badges, sortable
- **Cycle**: Linear cycle/sprint name (displays cycle name or "Cycle {number}", shows "-" if no cycle), sortable
- **Labels**: Color-coded labels with contrast text, sortable by count then alphabetically
- **Estimate points**: Story points estimate, sortable
- **Duration metrics** (all sortable):
  - In Progress → In Review (days)
  - In Review → Ready to QA (days)
  - Ready to QA → Done (days)
- **Timestamps**: Started and Completed dates

**Sorting & Pagination**:
- All sortable columns support ascending/descending order
- Sorting is applied to the **entire dataset** before pagination
- Changing sort automatically resets to page 1
- Search filtering is applied after sorting
- Pagination options: 10, 25, 50, or 100 items per page
- Search is debounced (300ms delay) for performance

### QA Feedback Dashboard

The QA Feedback Dashboard focuses specifically on issues that have received QA feedback, tracking iteration cycles and fix times.

#### QA Feedback Detection

Issues are identified as having QA feedback if they have a label containing "qa feedback" (case-insensitive).

#### QA Feedback Cycle Detection

The system detects QA feedback cycles using two patterns:

**Pattern 1 (Primary)**: "Ready to QA" → (any status change) → "Ready to QA"
- Detects when an issue leaves "Ready to QA", goes through status changes, and returns to "Ready to QA"
- This pattern indicates a complete feedback cycle

**Pattern 2 (Fallback)**: "In QA" → (any status change) → "Ready to QA"
- Used only if Pattern 1 finds no cycles
- Detects cycles starting from "In QA" state

#### KPI Cards

1. **QA Feedback Issues**: Count of issues with QA Feedback label
2. **Total QA Iterations**: Sum of all QA feedback cycles across all issues
   - Formula: `Sum of qa_feedback_iterations for all QA feedback issues`
3. **Avg QA Iterations**: Average number of iterations per issue
   - Formula: `Total Iterations / Number of issues with iterations > 0`
   - Rounded to 1 decimal place
4. **Avg Time to Fix QA**: Average time to fix QA feedback per iteration
   - Calculation: For each iteration cycle:
     - Start: `status_change_timestamp` (when work started after feedback)
     - End: `to_ready_to_qa_timestamp` (when issue returned to Ready to QA)
     - Duration: `(End - Start) / (1000 × 60 × 60 × 24)` days
   - Formula: `Sum of all iteration durations / Total number of iterations`
   - Rounded to 2 decimal places
5. **In QA with Feedback**: Count of issues currently in "In QA" status with QA Feedback label

#### QA Feedback Table

The table shows detailed information for each QA feedback issue:

- **Issue Details**: Number, title, assignee, status (all sortable)
- **Cycle**: Linear cycle/sprint name, sortable
- **Iterations**: Total number of QA feedback cycles, sortable
- **Avg Time to Fix**: Average time to fix across all iterations
  - Formula: `Sum of all iteration fix times / Number of iterations`
  - Rounded to 1 decimal place
- **Total Time to Fix**: Sum of all iteration fix times
  - Formula: `Sum of all iteration durations`
  - Rounded to 1 decimal place
- **Iteration Details**: Expandable section showing:
  - Iteration number
  - QA Feedback Given timestamp
  - Status Changed timestamp (when work started)
  - Back to Ready to QA timestamp (when fix completed)
  - Time to Fix for that iteration (rounded to 2 decimal places)

**Sorting & Pagination**:
- Sortable columns: Issue number, Title, Assignee, Status, Cycle, Iterations
- Sorting is applied to the **entire dataset** before pagination
- Changing sort automatically resets to page 1
- Search filtering is applied after sorting
- Pagination options: 10, 25, 50, or 100 items per page
- Search is debounced (300ms delay) for performance

#### Time to Fix Calculation

For each QA feedback iteration:
```
Time to Fix = (to_ready_to_qa_timestamp - status_change_timestamp) / (1000 × 60 × 60 × 24) days
```

This measures the time from when the developer started working on the feedback (status change) until the issue was ready for QA again.

## Data Processing

### Issue Duration Calculations

The system processes Linear issue history to calculate durations between state transitions:

1. **In Progress → In Review**:
   - From: `backlog_to_in_progress_timestamp` (when issue moved to In Progress)
   - To: `in_progress_to_in_review_timestamp` (when issue moved to In Review)
   - Duration: `(To - From) / (1000 × 60 × 60 × 24)` days

2. **In Review → Ready to QA**:
   - From: `in_progress_to_in_review_timestamp`
   - To: `in_review_to_ready_to_qa_timestamp`
   - Duration: `(To - From) / (1000 × 60 × 60 × 24)` days

3. **Ready to QA → Done**:
   - From: `in_review_to_ready_to_qa_timestamp`
   - To: `ready_to_qa_to_done_timestamp`
   - Duration: `(To - From) / (1000 × 60 × 60 × 24)` days

4. **In Review → Done** (direct transition, skipping Ready to QA):
   - From: `in_progress_to_in_review_timestamp`
   - To: `in_review_to_done_timestamp`
   - Duration: `(To - From) / (1000 × 60 × 60 × 24)` days

All durations are rounded to 2 decimal places.

### Cycle/Sprint Data

The system extracts cycle information from Linear issues:
- **Cycle Name**: Uses `cycle.name` if available
- **Cycle Number**: Falls back to `Cycle {cycle.number}` if name is not available
- **Null Handling**: Displays "-" when no cycle is assigned
- **Sorting**: Cycle column is sortable alphabetically (null values sorted to end)

### Data Fetching

- Fetches issues updated in the last 6 months from Linear API
- Processes issue history to extract state transition timestamps
- Derives current status from the latest state
- Calculates all duration metrics automatically
- Caches data client-side using TanStack Query (5-minute stale time, 10-minute cache time)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then edit `.env.local` and add your Linear API key:
   ```
   LINEAR_API_KEY=your_linear_api_key_here
   ```
   
   Get your API key from: https://linear.app/settings/api

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
linear-dashboard/
├── app/
│   ├── api/
│   │   └── linear/
│   │       └── route.ts          # API route for Linear GraphQL queries
│   ├── components/
│   │   ├── Charts/
│   │   │   ├── DurationChart.tsx # Duration analysis by assignee
│   │   │   ├── StatusChart.tsx   # Status distribution
│   │   │   └── TimelineChart.tsx # Timeline trends
│   │   ├── Filters.tsx           # Filter sidebar component
│   │   ├── IssueTable.tsx         # Main issues table
│   │   ├── KPICard.tsx            # Individual KPI card component
│   │   ├── KPICards.tsx           # Linear Dashboard KPI cards
│   │   ├── QAFeedbackKPICards.tsx # QA Feedback Dashboard KPI cards
│   │   ├── QAFeedbackTable.tsx    # QA Feedback analysis table
│   │   ├── LastUpdated.tsx        # Data freshness indicator
│   │   └── Navigation.tsx         # Navigation between dashboards
│   ├── hooks/
│   │   ├── useLinearData.ts       # TanStack Query hook for data fetching
│   │   ├── useDebounce.ts         # Debounce hook for search input
│   │   └── useFilteredIssues.ts   # Optimized filtering hook
│   ├── lib/
│   │   ├── linear.ts              # Linear API client and data processing
│   │   ├── types.ts               # TypeScript types
│   │   └── utils.ts               # Utility functions
│   ├── qa-feedback/
│   │   └── page.tsx               # QA Feedback Dashboard page
│   ├── page.tsx                   # Linear Dashboard page
│   ├── layout.tsx                 # Root layout
│   └── providers.tsx              # TanStack Query provider
└── ...
```

## Tech Stack

- **Next.js 16+** - React framework with App Router
- **TypeScript** - Type safety
- **TanStack Query (React Query)** - Data fetching and caching
- **Tailwind CSS** - Styling
- **Recharts** - Charting library
- **Headless UI** - Accessible UI components
- **date-fns** - Date utilities

## Data Caching

The application uses TanStack Query for intelligent data caching:

- **Stale Time**: 5 minutes - Data is considered fresh for 5 minutes
- **Cache Time**: 10 minutes - Cached data persists for 10 minutes after component unmounts
- **Refetch Behavior**: 
  - No automatic refetch on window focus
  - No refetch on mount if cache exists
  - Background refetch when data becomes stale and component mounts
- **Shared Cache**: Both dashboards share the same cache, preventing duplicate API calls when switching tabs

## Table Sorting & Pagination

Both the Linear Dashboard and QA Feedback Dashboard tables implement advanced sorting and pagination:

### Sorting Behavior

1. **Full Dataset Sorting**: Sorting is applied to the entire dataset before any filtering or pagination
2. **Sort Order**: Click once for ascending (↑), click again for descending (↓)
3. **Visual Indicators**: 
   - Active sort shows blue arrow (↑ or ↓)
   - Inactive sortable columns show gray sort icon
4. **Null Handling**: Null or missing values are sorted to the end
5. **Auto Reset**: Changing sort automatically resets to page 1

### Sortable Columns

**Linear Dashboard Table**:
- Issue Number, Title, Assignee, Status, Cycle, Labels, Estimate Points
- Duration columns: In Progress → Review, Review → Ready to QA, Ready to QA → Done

**QA Feedback Table**:
- Issue Number, Title, Assignee, Status, Cycle, Iterations

### Search & Filtering

- **Debounced Search**: 300ms delay prevents excessive filtering
- **Search Fields**: Title, Assignee, Issue Number, Status, Labels
- **Filter Order**: Search is applied after sorting, before pagination
- **Auto Reset**: Changing search resets to page 1

### Pagination

- **Items Per Page**: 10, 25, 50, or 100 options
- **Page Navigation**: Previous/Next buttons with page counter
- **Data Flow**: Sort → Filter → Paginate
- **Consistent Order**: All pages maintain the same sort order

## Last Updated Indicator

Each dashboard displays a "Last Updated" indicator showing:
- **Relative Time**: "X minutes ago" format
- **Visual Status**: 
  - 🟢 Green dot: Fresh (< 5 minutes)
  - 🟡 Yellow dot: Moderate (5-30 minutes)
  - 🔴 Red dot: Stale (> 30 minutes)
- **Status Badge**: Shows "Fresh", "Moderate", or "Stale" when applicable
- **Manual Refresh**: Button to trigger immediate data refresh

## Code Quality & Best Practices

The codebase follows modern React and Next.js best practices:

### Performance Optimizations

- **useMemo for Expensive Computations**: Sorting, filtering, and metric calculations use `useMemo` to prevent unnecessary recalculations
- **Debounced Search**: Search input is debounced (300ms) to reduce filtering operations
- **Optimized Filtering**: Custom `useFilteredIssues` hook uses `useMemo` for efficient filtering
- **Efficient Sorting**: Sorting algorithm handles null values and edge cases properly
- **Pagination**: Only renders visible items, reducing DOM size

### State Management

- **TanStack Query**: Centralized data fetching and caching
- **Local State**: Component-level state for UI interactions (sorting, pagination, search)
- **No Unnecessary Re-renders**: Proper dependency arrays in hooks prevent excessive updates

### Code Structure

- **TypeScript**: Full type safety with interfaces and types
- **Functional Components**: All components use functional patterns
- **Custom Hooks**: Reusable logic extracted into hooks (`useDebounce`, `useFilteredIssues`)
- **Separation of Concerns**: Clear separation between data processing, UI components, and business logic

### Error Handling

- **Date Validation**: All date operations validate dates before processing
- **Null Safety**: Proper null/undefined checks throughout
- **Error Boundaries**: ErrorBoundary component for graceful error handling
- **API Error Handling**: Comprehensive error handling for Linear API calls

### Accessibility

- **Semantic HTML**: Proper use of table elements, headings, and labels
- **Keyboard Navigation**: Sortable columns are keyboard accessible
- **Visual Indicators**: Clear visual feedback for sorting, loading, and error states

## License

MIT
