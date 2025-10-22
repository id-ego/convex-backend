import React from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import classNames from "classnames";

export type TooltipSide = "left" | "right" | "bottom" | "top";

export function Tooltip({
  children,
  tip,
  side = "bottom",
  align = "center",
  className,
  contentClassName,
  asChild = false,
  delayDuration = 0,
  maxWidthClassName = "max-w-[16rem]",
  disableHoverableContent = false,
}: {
  children: React.ReactNode;
  tip: React.ReactNode | undefined;
  side?: TooltipSide;
  align?: "start" | "end" | "center";
  className?: string;
  contentClassName?: string;
  maxWidthClassName?: string;
  asChild?: boolean;
  delayDuration?: number;
  disableHoverableContent?: boolean;
}) {
  // Some existing callsites pass in boolean so we do a truthy check
  if (!tip) {
    return <>{children}</>;
  }
  return (
    <RadixTooltip.Provider
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      <RadixTooltip.Root>
        <RadixTooltip.Trigger
          asChild={asChild}
          className={classNames(
            "focus-visible:outline-0 cursor-default",
            className,
          )}
        >
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            align={align}
            className={classNames(
              "z-50 break-words rounded-sm border bg-background-secondary shadow-xs p-1 text-center text-xs",
              maxWidthClassName,
              contentClassName,
            )}
            role="tooltip"
            sideOffset={5}
          >
            {tip}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
