"use client";
import {
  type ElementType,
  type ComponentPropsWithoutRef,
  type ReactNode,
  useRef,
} from "react";
import { useRimEffect, type RimOptions } from "./useRimEffect";

type RimOwnProps<E extends ElementType> = RimOptions & {
  /**
   * The host element/component to render. Must be a real DOM element (or a
   * component that forwards its ref to one) since the rim attaches to the DOM.
   * Default `"div"`.
   */
  as?: E;
  children?: ReactNode;
};

export type RimProps<E extends ElementType = "div"> = RimOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof RimOwnProps<E>>;

/**
 * Drop-in wrapper that draws a glass-edge rim around its children. It owns its
 * own ref and applies the structural styles the rim needs (`position: relative`,
 * `isolation: isolate`, and NO overflow clipping) — your `style`/`className`
 * still win for anything you set explicitly.
 *
 * ```tsx
 * <Rim className="card" intensity={0.4} accentColor="180, 210, 255">
 *   <h3>Glass card</h3>
 * </Rim>
 * ```
 *
 * For a host you already control (your own card component, a list item, etc.),
 * prefer {@link useRimEffect} directly — it avoids the extra wrapper element.
 */
export function Rim<E extends ElementType = "div">({
  as,
  children,
  style,
  // RimOptions — pulled out so the rest spreads onto the host element.
  borderWidth,
  shadowScale,
  enabled,
  fadeInMs,
  accentColor,
  intensity,
  steps,
  band,
  ...rest
}: RimProps<E>) {
  const ref = useRef<HTMLElement>(null);
  useRimEffect(ref, {
    borderWidth,
    shadowScale,
    enabled,
    fadeInMs,
    accentColor,
    intensity,
    steps,
    band,
  });

  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      ref={ref}
      style={{ position: "relative", isolation: "isolate", ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
