/**
 * Reusable KPI Card component for displaying metrics
 * @param title - The title/label for the metric
 * @param value - The value to display (string or number)
 * @param subtitle - Optional subtitle text displayed below the value
 */
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export function KPICard({ title, value, subtitle }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}







