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
  }, []);

  const formattedCount = stats?.count
    ? stats.count.toLocaleString()
    : "...";

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-1 pointer-events-none select-none">
      <p
        className="font-handwritten text-sm text-foreground/30 hover:text-foreground/60 transition-colors pointer-events-auto"
        data-testid="text-footer-credit"
      >
        Made with ❤️ by Mrs. ZNF
      </p>
      <p
        className="font-handwritten text-xs text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors pointer-events-auto"
        data-testid="text-visitor-count"
      >
        🌸 {formattedCount} scrapbook lovers visited
      </p>
    </div>
  );
}
