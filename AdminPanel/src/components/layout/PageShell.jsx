/**
 * PageShell — standard page content wrapper matching the admin panel grid.
 * Wraps children in responsive padding + max-width container.
 * Pass className to append extra Tailwind utilities (e.g. "space-y-6").
 */
export default function PageShell({ children, className = "space-y-6" }) {
  return (
    <div className={`p-4 sm:p-6 lg:p-4 max-w-7xl mx-auto ${className}`}>
      {children}
    </div>
  );
}
