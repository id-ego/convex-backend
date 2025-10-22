import React, {
  useState,
  useCallback,
  useMemo,
  useContext,
  createContext,
} from "react";
import { cn } from "@ui/cn";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Button } from "@ui/Button";
import { Sheet } from "@ui/Sheet";
import { MultiSelectCombobox, MultiSelectValue } from "@ui/MultiSelectCombobox";
import { FunctionNameOption } from "@common/elements/FunctionNameOption";
import { HealthView } from "@common/features/health/components/HealthView";
import {
  Insight,
  useInsights,
  useInsightsPeriod,
  getInsightPageIdentifier,
} from "api/insights";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  itemIdentifier,
  useModuleFunctions,
} from "@common/lib/functions/FunctionsProvider";
import {
  functionIdentifierValue,
  functionIdentifierFromValue,
} from "@common/lib/functions/generateFileTree";
import { SmallInsightsSummary } from "./SmallInsightsSummary";
import { InsightsSummary } from "./InsightsSummary";
import { InsightSummaryBreakdown } from "./InsightsSummaryBreakdown";

// We need a context here so the insights components can have data provided to them without rerendering the Health page.
const InsightsContext = createContext<
  | {
      page: string;
      insights?: Insight[];
      selectedFunctions: MultiSelectValue;
      setSelectedFunctions: (selectedFunctions: MultiSelectValue) => void;
    }
  | undefined
>(undefined);

export function HealthWithInsights() {
  const { query, push } = useRouter();
  const page = (query.view as string)?.startsWith("insight:")
    ? (query.view as string)
    : query.view === "insights"
      ? "insights"
      : "home";
  const moduleFunctions = useModuleFunctions();
  const functions = useMemo(
    () => [
      ...moduleFunctions.map((value) => itemIdentifier(value)),
      functionIdentifierValue("_other"),
    ],
    [moduleFunctions],
  );
  const [selectedFunctions, setSelectedFunctions] =
    useState<MultiSelectValue>("all");

  const insights = useInsights();
  const { from } = useInsightsPeriod();

  const selectedInsight = insights?.find(
    (insight) => getInsightPageIdentifier(insight) === page,
  );

  const header = (
    <div
      className={cn(
        "sticky top-0 mx-6 flex flex-wrap items-center justify-between gap-4 pt-2",
        page === "insights" ? "max-w-[70rem]" : "",
      )}
    >
      <div className="flex items-center gap-2">
        {page.startsWith("insight") && (
          <Button
            icon={<ChevronLeftIcon className="size-5" />}
            tip="Back to Health"
            onClick={() =>
              void push(
                {
                  pathname: "/t/[team]/[project]/[deploymentName]",
                  query: {
                    team: query.team,
                    project: query.project,
                    deploymentName: query.deploymentName,
                    ...(query.lowInsightsThreshold
                      ? { lowInsightsThreshold: query.lowInsightsThreshold }
                      : {}),
                  },
                },
                undefined,
                { shallow: true },
              )
            }
            size="xs"
            variant="neutral"
            className="text-content-secondary hover:text-content-primary"
            inline
          />
        )}
        <h3 className="flex items-center gap-2 py-2">
          <Link
            href={{
              pathname: "/t/[team]/[project]/[deploymentName]",
              query: {
                team: query.team,
                project: query.project,
                deploymentName: query.deploymentName,
                ...(query.lowInsightsThreshold
                  ? { lowInsightsThreshold: query.lowInsightsThreshold }
                  : {}),
              },
            }}
            className={page !== "home" ? "text-content-link" : ""}
          >
            Health
          </Link>{" "}
          {page.startsWith("insight") && (
            <>
              <span className="animate-fadeInFromLoading">/</span>
              <Link
                href={{
                  pathname: "/t/[team]/[project]/[deploymentName]",
                  query: {
                    team: query.team,
                    project: query.project,
                    deploymentName: query.deploymentName,
                    view: "insights",
                    ...(query.lowInsightsThreshold
                      ? { lowInsightsThreshold: query.lowInsightsThreshold }
                      : {}),
                  },
                }}
                className="text-content-link"
              >
                <span className="animate-fadeInFromLoading">Insights</span>
              </Link>
            </>
          )}
          {selectedInsight && (
            <>
              <span className="animate-fadeInFromLoading">/</span>
              <div className="flex animate-fadeInFromLoading flex-wrap gap-1 text-content-primary">
                Insight Breakdown{" "}
              </div>
            </>
          )}
        </h3>
      </div>
      {page === "insights" && (
        <div className="flex animate-fadeInFromLoading flex-wrap items-center gap-4">
          <span className="text-sm text-content-secondary">
            {new Date(from).toLocaleString([], {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: undefined,
            })}{" "}
            – Now
          </span>
          <div className="min-w-[20rem]">
            <MultiSelectCombobox
              options={functions}
              selectedOptions={selectedFunctions}
              setSelectedOptions={setSelectedFunctions}
              unit="function"
              unitPlural="functions"
              label="Functions"
              labelHidden
              Option={FunctionNameOption}
              processFilterOption={(option) => {
                const id = functionIdentifierFromValue(option);
                return id.componentPath
                  ? `${id.componentPath}/${id.identifier}`
                  : id.identifier;
              }}
            />
          </div>
        </div>
      )}
    </div>
  );

  const providerValue = useMemo(
    () => ({
      page,
      insights,
      selectedFunctions,
      setSelectedFunctions,
    }),
    [page, insights, selectedFunctions, setSelectedFunctions],
  );

  return (
    <InsightsContext.Provider value={providerValue}>
      <HealthView
        header={header}
        PagesWrapper={InsightsWrapper}
        PageWrapper={PageWrapper}
      />
    </InsightsContext.Provider>
  );
}

function InsightsWrapper({ children }: { children: React.ReactNode }) {
  const { insights, selectedFunctions, page } =
    useContext(InsightsContext) || {};
  return (
    <div
      className={cn(
        "flex min-h-0 grow gap-6 transition-transform duration-500 motion-reduce:transition-none",
        page === "home" && "translate-x-0",
        page === "insights" && "-translate-x-[calc(100%+1.5rem)]",
        page?.startsWith("insight:") && "-translate-x-[calc(200%+3rem)]",
      )}
    >
      {children}
      <div
        // @ts-expect-error https://github.com/facebook/react/issues/17157
        inert={page !== "insights" ? "inert" : undefined}
        className="mb-6 flex w-full shrink-0 px-6"
      >
        <Sheet
          padding={false}
          className="scrollbar h-fit max-h-full w-full max-w-[70rem] min-w-0 overflow-auto"
        >
          <InsightsSummary
            insights={insights?.filter((insight) => {
              if (!selectedFunctions) return true;
              if (selectedFunctions === "all") return true;

              return (
                selectedFunctions.includes(
                  functionIdentifierValue(
                    insight.functionId,
                    insight.componentPath ?? undefined,
                  ),
                ) || selectedFunctions.includes("_other")
              );
            })}
          />
        </Sheet>
      </div>
      <div
        // @ts-expect-error https://github.com/facebook/react/issues/17157
        inert={!page.startsWith("insight:") ? "inert" : undefined}
        className="scrollbar flex w-full shrink-0 overflow-y-auto px-6"
      >
        <InsightSummaryBreakdown
          insight={
            insights
              ? insights?.find(
                  (insight) => getInsightPageIdentifier(insight) === page,
                ) || null
              : undefined
          }
        />
      </div>
    </div>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  const { query, push } = useRouter();
  const onViewAll = useCallback(() => {
    void push(
      {
        pathname: "/t/[team]/[project]/[deploymentName]",
        query: {
          team: query.team,
          project: query.project,
          deploymentName: query.deploymentName,
          view: "insights",
          ...(query.lowInsightsThreshold
            ? { lowInsightsThreshold: query.lowInsightsThreshold }
            : {}),
        },
      },
      undefined,
      { shallow: true },
    );
  }, [query, push]);
  const { page } = useContext(InsightsContext) || {};
  return (
    <div
      className="scrollbar flex w-full shrink-0 grow flex-col gap-4 overflow-y-auto px-6 pb-4"
      // @ts-expect-error https://github.com/facebook/react/issues/17157
      inert={page !== "home" ? "inert" : undefined}
    >
      {children}
      <div className="max-w-[88rem]">
        <SmallInsightsSummary onViewAll={onViewAll || (() => {})} />
      </div>
    </div>
  );
}
