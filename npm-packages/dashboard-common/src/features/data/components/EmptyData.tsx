import {
  PlusIcon,
  TableIcon,
  MixerHorizontalIcon,
  ChevronDownIcon,
  DotsVerticalIcon,
} from "@radix-ui/react-icons";
import { useContext } from "react";
import { CreateNewTable } from "@common/features/data/components/DataSidebar";
import { EmptySection } from "@common/elements/EmptySection";
import { useNents } from "@common/lib/useNents";
import { DeploymentInfoContext } from "@common/lib/deploymentContext";
import { useTableMetadata } from "@common/lib/useTableMetadata";
import { Loading } from "@ui/Loading";
import { Button } from "@ui/Button";
import { Sheet } from "@ui/Sheet";
import { cn } from "@ui/cn";
import { useSize } from "react-use";

// Example table data for the background
const EXAMPLE_COLUMNS = ["_id", "name", "email", "_creationTime"];

export function EmptyData() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <EmptyDataContent noTables />
    </div>
  );
}

export function EmptyDataContent({
  noTables,
  openAddDocuments,
}: {
  noTables?: boolean;
  openAddDocuments?: () => void;
}) {
  const { selectedNent } = useNents();

  const {
    useCurrentDeployment,
    useHasProjectAdminPermissions,
    useLogDeploymentEvent,
  } = useContext(DeploymentInfoContext);

  const deployment = useCurrentDeployment();
  const hasAdminPermissions = useHasProjectAdminPermissions(
    deployment?.projectId,
  );
  const canAddDocuments =
    deployment?.deploymentType !== "prod" || hasAdminPermissions;
  const tableMetadata = useTableMetadata();
  const log = useLogDeploymentEvent();

  const sizeMe = <div />;
  const [sized, { width }] = useSize(sizeMe);

  if (!tableMetadata) {
    return <Loading />;
  }

  return (
    <div className="relative h-full w-full animate-fadeIn">
      {/* Background table example */}
      {sized}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgb(0,0,0,0.3) 30%, transparent 85%)",
        }}
      >
        <div className="flex h-full w-full flex-col">
          {/* Example DataToolbar */}
          {noTables && (
            <div className="mb-2 flex flex-col" inert>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex max-w-full items-center gap-4">
                  <div className="flex max-w-full flex-col gap-1">
                    <h3 className="flex items-start gap-0.5 font-mono text-content-secondary select-none">
                      example_table
                    </h3>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="neutral" icon={<PlusIcon />}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="neutral"
                    icon={<DotsVerticalIcon className="m-[3px]" />}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Example DataFilters */}
          <div
            className="flex w-full flex-col gap-2 rounded-t border border-b-0 bg-background-secondary/50 p-2"
            inert
          >
            <div className="flex justify-between gap-2">
              <div className="flex items-center">
                <div className="flex w-full rounded-sm bg-background-secondary">
                  <Button
                    size="xs"
                    variant="neutral"
                    className="w-fit border border-border-transparent text-xs"
                    icon={<MixerHorizontalIcon className="size-3.5" />}
                  >
                    <div className="flex items-center gap-2">
                      <span>Filter & Sort</span>
                    </div>
                    <ChevronDownIcon />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-xs whitespace-nowrap">
                  <span className="h-3 w-24 bg-content-secondary/30" />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className="flex h-full w-full flex-col overflow-hidden rounded-sm rounded-t-none border bg-background-secondary"
            inert
          >
            <table className="h-full w-full table-fixed">
              <thead>
                <tr className="border-b bg-background-secondary">
                  {EXAMPLE_COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="border-r p-3 text-left text-xs font-semibold text-content-secondary select-none last:border-r-0"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array.from({ length: 20 }).map((_, i) => (
                  <tr key={i} className="group">
                    {EXAMPLE_COLUMNS.map((col) => (
                      // eslint-disable-next-line jsx-a11y/control-has-associated-label
                      <td
                        key={col}
                        className="border-r p-3 group-last:border-b-0 last:border-r-0"
                      >
                        <div className="h-3 w-full max-w-64 bg-content-secondary/30" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Sheet
          padding={false}
          className={cn(
            "h-fit w-fit bg-background-secondary/90 backdrop-blur-[2px]",
            width > 320 ? "m-6 p-2" : "m-0 p-0",
          )}
        >
          <EmptySection
            Icon={TableIcon}
            header={
              noTables
                ? "There are no tables here yet."
                : "This table is empty."
            }
            sheet={false}
            body={
              noTables
                ? "Create a table to start storing data."
                : "Create a document or run a mutation to start storing data."
            }
            action={
              noTables ? (
                <CreateNewTable tableData={tableMetadata} />
              ) : (
                <>
                  {openAddDocuments && (
                    <Button
                      inline
                      onClick={() => {
                        log("open add documents panel", { how: "empty data" });
                        openAddDocuments();
                      }}
                      size="sm"
                      disabled={
                        !canAddDocuments ||
                        !!(selectedNent && selectedNent.state !== "active")
                      }
                      tip={
                        selectedNent && selectedNent.state !== "active"
                          ? "Cannot add documents in an unmounted component."
                          : !canAddDocuments &&
                            "You do not have permission to add documents in production."
                      }
                      icon={<PlusIcon aria-hidden="true" />}
                    >
                      Add Documents
                    </Button>
                  )}
                </>
              )
            }
            learnMoreButton={{
              href: "https://docs.convex.dev/quickstarts",
              children: "Follow a quickstart guide",
            }}
          />
        </Sheet>
      </div>
    </div>
  );
}
