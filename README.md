# Linear Dashboard

A clean, elegant dashboard for visualizing Linear issue data, inspired by Linear.app's design.

## Features

- **Real-time Data**: Fetches data directly from Linear GraphQL API
- **Interactive Filters**: Filter by assignee, status, sprint, date range, and estimate points
- **Analytics Dashboard**: 
  - KPI cards showing key metrics
  - Status distribution chart
  - Duration analysis by assignee
  - Timeline trends over time
- **Sortable Table**: View all issues with sortable columns
- **Clean Design**: Linear.app-inspired UI with smooth transitions and minimal styling

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
│   │   ├── Filters.tsx           # Filter sidebar component
│   │   ├── IssueTable.tsx        # Main issues table
│   │   ├── KPICards.tsx          # Metrics cards
│   │   └── Charts/
│   │       ├── StatusChart.tsx   # Status distribution
│   │       ├── DurationChart.tsx # Duration by assignee
│   │       └── TimelineChart.tsx # Timeline trends
│   ├── lib/
│   │   ├── linear.ts             # Linear API client
│   │   ├── types.ts              # TypeScript types
│   │   └── utils.ts              # Utility functions
│   ├── page.tsx                  # Main dashboard page
│   └── layout.tsx                # Root layout
└── ...
```

## Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Charting library
- **Headless UI** - Accessible UI components
- **date-fns** - Date utilities

## Data Processing

The dashboard automatically:
- Fetches issues from Linear API (last 6 months)
- Calculates durations between state transitions
- Derives current status from timestamps
- Processes data for analytics and visualizations

## License

MIT
