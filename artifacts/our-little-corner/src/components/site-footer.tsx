import { useEffect } from "react";
import { useGetVisitorStats, useRecordVisit, getGetVisitorStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function SiteFooter() {
  const queryClient = useQueryClient();
  const { data: stats } = useGetVisitorStats({ query: { queryKey: getGetVisitorStatsQueryKey() } });
  const recordVisit = useRecordVisit();

  useEffect(() => {
    // Increment visitor count only once per browser session
    const visited = sessionStorage.getItem("olc_visited");
    if (!visited) {
      sessionStorage.setItem("olc_visited", "1");
      recordVisit.mutate(undefined, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetVisitorStatsQueryKey() });
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formattedCount = stats?.count != null ? stats.count.toLocaleString() : "...";

  return (
    // Sits above the fixed "Create Our Little Corner" button (which is bottom-6 ≈ 24px + ~40px tall)
    <div className="fixed bottom-[82px] right-4 z-40 flex flex-col items-end gap-0.5 pointer-events-none select-none">
      <p className="font-handwritten text-sm text-foreground/30 hover:text-foreground/70 transition-colors duration-200 pointer-events-auto cursor-default">
        Made with ❤️ by Mrs. ZNF
      </p>
      <p className="font-handwritten text-xs text-muted-foreground/35 hover:text-muted-foreground/70 transition-colors duration-200 pointer-events-auto cursor-default">
        🌸 {formattedCount} scrapbook lovers visited
      </p>
    </div>
  );
}
