import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useFloating,
  autoUpdate,
  flip,
  offset,
  shift,
  useRole,
  useDismiss,
  useInteractions,
  useListNavigation,
  useTypeahead,
  FloatingPortal,
  FloatingFocusManager,
  FloatingOverlay,
  FloatingList,
  useListItem,
  useFloatingTree,
  FloatingTree,
  FloatingNode,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useHover,
  safePolygon,
  useClick,
  useMergeRefs,
} from "@floating-ui/react";
import classNames from "classnames";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { UrlObject } from "url";
import { Button } from "@ui/Button";
import { TooltipSide } from "@ui/Tooltip";
import { Key, KeyboardShortcut } from "@ui/KeyboardShortcut";

const ContextMenuContext = React.createContext<{
  getItemProps: (
    userProps?: React.HTMLProps<HTMLElement>,
  ) => Record<string, unknown>;
  activeIndex: number | null;
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>;
  isOpen: boolean;
}>({
  getItemProps: () => ({}),
  activeIndex: null,
  setActiveIndex: () => {},
  isOpen: false,
});

export type Target = { x: number; y: number };

type ContextMenuProps = React.PropsWithChildren<{
  target: Target | null;
  onClose: () => void;
}>;

// Based on https://codesandbox.io/s/trusting-rui-2duieo
// and https://codesandbox.io/s/admiring-lamport-5wt3yg
export function ContextMenu(props: ContextMenuProps) {
  return (
    <FloatingTree>
      <ContextMenuInner {...props} />
    </FloatingTree>
  );
}

function ContextMenuInner({ target, onClose, children }: ContextMenuProps) {
  const isOpen = target !== null;
  const onOpenChange = useCallback(
    (newIsOpen: boolean) => {
      if (!newIsOpen) {
        onClose();
      }
    },
    [onClose],
  );

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange,
    middleware: [
      offset({ mainAxis: 5, alignmentAxis: 4 }),
      flip({
        fallbackPlacements: ["left-start"],
      }),
      shift({ padding: 10 }),
    ],
    placement: "right-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });

  // Interactions
  const role = useRole(context, { role: "menu" });

  const dismiss = useDismiss(context);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listItemsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const listNavigation = useListNavigation(context, {
    listRef: listItemsRef,
    onNavigate: setActiveIndex,
    activeIndex,
  });

  const listContentRef = useRef<Array<string | null>>([]);
  const typeahead = useTypeahead(context, {
    enabled: isOpen,
    listRef: listContentRef,
    onMatch: setActiveIndex,
    activeIndex,
  });

  const { getFloatingProps, getItemProps } = useInteractions([
    role,
    dismiss,
    listNavigation,
    typeahead,
  ]);

  // Position relative to the target
  useLayoutEffect(() => {
    if (!target) {
      refs.setPositionReference(null);
      return;
    }
    const { x, y } = target;
    refs.setPositionReference({
      getBoundingClientRect() {
        return {
          width: 0,
          height: 0,
          x,
          y,
          top: y,
          right: x,
          bottom: y,
          left: x,
        };
      },
    });
  }, [refs, target]);

  // Tree events
  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();
  useEffect(() => {
    if (!tree) return;

    function handleTreeClick() {
      onClose();
    }

    tree.events.on("click", handleTreeClick);
    return () => tree.events.off("click", handleTreeClick);
  }, [tree, onClose]);

  const contextValue = useMemo(
    () => ({
      activeIndex,
      setActiveIndex,
      getItemProps,
      isOpen,
    }),
    [activeIndex, setActiveIndex, getItemProps, isOpen],
  );

  return (
    <FloatingNode id={nodeId}>
      <ContextMenuContext.Provider value={contextValue}>
        <FloatingList elementsRef={listItemsRef} labelsRef={listContentRef}>
          <FloatingPortal>
            {isOpen && (
              <FloatingOverlay className="z-50">
                <FloatingFocusManager
                  context={context}
                  initialFocus={refs.floating}
                >
                  {/* 20px = twice the padding in the `shift` middleware (https://floating-ui.com/docs/misc#handling-large-content) */}
                  <div
                    className="flex max-h-[calc(100vh-20px)] animate-fadeInFromLoading flex-col overflow-x-hidden overflow-y-auto rounded-lg border bg-background-secondary py-2 text-xs whitespace-nowrap shadow-xs outline-hidden dark:border"
                    ref={refs.setFloating}
                    style={floatingStyles}
                    {...getFloatingProps()}
                  >
                    {children}
                  </div>
                </FloatingFocusManager>
              </FloatingOverlay>
            )}
          </FloatingPortal>
        </FloatingList>
      </ContextMenuContext.Provider>
    </FloatingNode>
  );
}

function ContextMenuItem({
  icon,
  label,
  action,
  disabled,
  variant,
  shortcut,
  tip,
  tipSide,
  blankTarget = true,
  proBadge,
}: {
  icon?: ReactNode;
  label: ReactNode;
  action: (() => void) | UrlObject | string;
  disabled?: boolean;
  variant?: "neutral" | "danger";
  shortcut?: Key[];
  tip?: ReactNode;
  tipSide?: TooltipSide;
  blankTarget?: boolean;
  proBadge?: boolean;
}) {
  const menu = useContext(ContextMenuContext);
  const { itemRef: labelRef, itemText: labelText } = useTextContent();
  const item = useListItem({ label: disabled ? null : labelText });
  const tree = useFloatingTree();
  const isActive = item.index === menu.activeIndex;

  return (
    <Button
      variant="unstyled"
      className={classNames(
        "w-full flex max-w-xs gap-2 items-center px-3 py-1.5 text-left",
        "active:bg-background-tertiary disabled:active:bg-background-secondary focus:bg-background-tertiary disabled:focus:bg-background-secondary outline-hidden",
        disabled
          ? "cursor-not-allowed fill-content-tertiary text-content-tertiary"
          : variant === "danger"
            ? "text-content-errorSecondary"
            : ' "text-content-primary"',
      )}
      disabled={disabled}
      ref={item.ref}
      tabIndex={isActive ? 0 : -1}
      href={typeof action !== "function" ? action : undefined}
      target={
        typeof action !== "function"
          ? blankTarget
            ? "_blank"
            : undefined
          : undefined
      }
      {...menu.getItemProps({
        onClick: () => {
          typeof action === "function" && action();
          setTimeout(() => {
            tree?.events.emit("click");
          }, 0);
        },
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            typeof action === "function" && action();
            typeof action !== "function" && e.currentTarget.click();
            setTimeout(() => {
              tree?.events.emit("click");
            }, 0);
          }
        },
      })}
      onClickOfAnchorLink={(e) => {
        e.stopPropagation();
        setTimeout(() => {
          tree?.events.emit("click");
        }, 0);
      }}
      tip={tip}
      tipSide={tipSide}
    >
      {icon ?? null}
      <span className="flex-1 truncate overflow-hidden" ref={labelRef}>
        {label}
      </span>
      {shortcut && (
        <KeyboardShortcut
          value={shortcut}
          className="ml-auto pl-6 text-content-tertiary"
        />
      )}
      {proBadge && (
        <span
          className="rounded-sm bg-util-accent px-1.5 py-0.5 text-xs font-semibold tracking-wider text-white uppercase"
          title="Only available on the Pro plan"
        >
          Pro
        </span>
      )}
    </Button>
  );
}
ContextMenu.Item = ContextMenuItem;

type ContextMenuSubmenuProps = React.PropsWithChildren<{
  icon?: ReactNode;
  label: ReactNode;
  action?: () => void;
  disabled?: boolean;
}>;

function ContextMenuSubmenu({
  icon,
  label,
  children,
  action,
  disabled = false,
}: ContextMenuSubmenuProps) {
  // Item in the parent menu
  const parent = useContext(ContextMenuContext);
  const { itemRef: labelRef, itemText: labelText } = useTextContent();
  const item = useListItem({ label: labelText });
  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();
  const parentId = useFloatingParentNodeId();

  // Submenu
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const elementsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);

  const { floatingStyles, refs, context } = useFloating<HTMLButtonElement>({
    nodeId,
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "right-start",
    middleware: [
      offset({ mainAxis: 0, alignmentAxis: 0 }),
      flip(),
      shift({ padding: 10 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Interactions
  const hover = useHover(context, {
    enabled: true,
    delay: { open: 75 },
    handleClose: safePolygon({ blockPointerEvents: true }),
  });
  const click = useClick(context, {
    event: "mousedown",
    toggle: false,
    ignoreMouse: true,
  });
  const role = useRole(context, { role: "menu" });
  const dismiss = useDismiss(context, { bubbles: true });
  const listNavigation = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    nested: true,
    onNavigate: setActiveIndex,
  });
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    onMatch: isOpen ? setActiveIndex : undefined,
    activeIndex,
  });
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [hover, click, role, dismiss, listNavigation, typeahead],
  );

  // Tree events
  useEffect(() => {
    if (!tree) return;

    function handleTreeClick() {
      setIsOpen(false);
    }

    function onSubMenuOpen(event: { nodeId: string; parentId: string }) {
      if (event.nodeId !== nodeId && event.parentId === parentId) {
        setIsOpen(false);
      }
    }

    tree.events.on("click", handleTreeClick);
    tree.events.on("menuopen", onSubMenuOpen);

    return () => {
      tree.events.off("click", handleTreeClick);
      tree.events.off("menuopen", onSubMenuOpen);
    };
  }, [tree, nodeId, parentId]);

  useEffect(() => {
    if (isOpen && tree) {
      tree.events.emit("menuopen", { parentId, nodeId });
    }
  }, [tree, isOpen, nodeId, parentId]);

  const contextValue = useMemo(
    () => ({ activeIndex, setActiveIndex, getItemProps, isOpen }),
    [activeIndex, setActiveIndex, getItemProps, isOpen],
  );

  const isClickable = action !== undefined;

  return (
    <FloatingNode id={nodeId}>
      <Button
        role="menuitem"
        ref={useMergeRefs([refs.setReference, item.ref])}
        variant="unstyled"
        className={classNames(
          "w-full flex max-w-xs gap-2 items-center px-3 py-1.5 text-left",
          "outline-hidden text-content-primary",
          "active:bg-background-tertiary focus:bg-background-tertiary",
          !isClickable && "cursor-default hover:bg-background-tertiary",
          "disabled:text-content-tertiary disabled:hover:bg-background-secondary disabled:cursor-not-allowed",
        )}
        disabled={disabled}
        tabIndex={item.index === parent.activeIndex ? 0 : -1}
        {...getReferenceProps(parent.getItemProps())}
        onClick={
          isClickable
            ? () => {
                action?.();
                tree?.events.emit("click");
              }
            : undefined
        }
      >
        {icon ?? null}
        <span className="flex-1 truncate overflow-hidden" ref={labelRef}>
          {label}
        </span>
        {!disabled && (
          <span className="ml-auto shrink-0 text-content-primary">
            <ChevronRightIcon className="ml-2" />
          </span>
        )}
      </Button>

      <ContextMenuContext.Provider value={contextValue}>
        <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
          {!disabled && isOpen && (
            <FloatingPortal>
              {/* 20px = twice the padding in the `shift` middleware (https://floating-ui.com/docs/misc#handling-large-content) */}
              <div
                className="z-50 overflow-hidden rounded-lg border bg-background-secondary shadow-md outline-hidden"
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
              >
                <div className="flex max-h-[calc(100vh-20px)] flex-col overflow-x-hidden overflow-y-auto py-2 text-xs whitespace-nowrap">
                  {children}
                </div>
              </div>
            </FloatingPortal>
          )}
        </FloatingList>
      </ContextMenuContext.Provider>
    </FloatingNode>
  );
}
ContextMenuSubmenu.displayName = "ContextMenuSubmenu";
ContextMenu.Submenu = ContextMenuSubmenu;

function useTextContent(): {
  itemRef: (element: HTMLElement) => void;
  itemText: string | undefined;
} {
  const [itemText, setItemText] = useState<string | undefined>(undefined);
  const itemRef = useCallback(
    (element: HTMLElement) =>
      setItemText(element ? element.innerText : undefined),
    [],
  );

  return {
    itemRef,
    itemText,
  };
}
