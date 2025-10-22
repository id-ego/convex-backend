import { Tab as HeadlessTab } from "@headlessui/react";
import { useRouter } from "next/router";
import { NentSwitcher } from "@common/elements/NentSwitcher";
import { Tab } from "@ui/Tab";

export function SchedulingLayout({ children }: { children: React.ReactNode }) {
  const { pathname, query } = useRouter();
  // The current path without the last part
  const pathParts = pathname.split("/");
  const basePath = pathParts.slice(0, -1).join("/");
  const currentPage = pathParts[pathParts.length - 1];

  return (
    <div className="flex h-full flex-col">
      <div className="flex w-full items-center gap-4 bg-background-secondary px-6 pt-4">
        <h3>Schedules</h3>
        {/* Negative margin accounting for the margin on NentSwitcher */}
        <div className="-mb-4 w-fit min-w-60">
          <NentSwitcher />
        </div>
      </div>
      <div className="mb-4 flex gap-2 border-b bg-background-secondary px-4 pt-2">
        <HeadlessTab.Group
          selectedIndex={currentPage.startsWith("functions") ? 0 : 1}
        >
          <Tab
            href={{
              pathname: `${basePath}/functions`,
              query,
            }}
          >
            Scheduled Functions
          </Tab>
          <Tab
            href={{
              pathname: `${basePath}/crons`,
              query,
            }}
          >
            Cron Jobs
          </Tab>
        </HeadlessTab.Group>
      </div>
      <div className="mx-6 mb-4 grow">{children}</div>
    </div>
  );
}
