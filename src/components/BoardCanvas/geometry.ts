// Pure geometry helpers for the board canvas.
// No React, no DOM — safe to unit-test in isolation.

import { HoleRef, Wire, WireEndpoint, FreeComponent, isTerminalRef } from "../../model/types";
import {
  batteryNegTerminalPos,
  batteryPosTerminalPos,
  liionNegTerminalPos,
  liionPosTerminalPos,
} from "../../model/freeComponent";
import { WIRE_PALETTE } from "../../model/wireColors";
import { LEFT_PAD, PADDING, SPACING } from "./constants";

export function holeCenter(hole: HoleRef): { x: number; y: number } {
  return {
    x: LEFT_PAD + hole.col * SPACING,
    y: PADDING + hole.row * SPACING,
  };
}

export function wireEndpointPos(
  endpoint: WireEndpoint,
  freeComponents: FreeComponent[]
): { x: number; y: number } {
  if (isTerminalRef(endpoint)) {
    const fc = freeComponents.find((c) => c.id === endpoint.componentId);
    if (!fc) return { x: 0, y: 0 };
    if (fc.subType === "18650") {
      return endpoint.terminal === "pos" ? liionPosTerminalPos(fc) : liionNegTerminalPos(fc);
    }
    return endpoint.terminal === "pos" ? batteryPosTerminalPos(fc) : batteryNegTerminalPos(fc);
  }
  return holeCenter(endpoint);
}

export function wireColor(wire: Wire, index: number): string {
  return wire.color ?? WIRE_PALETTE[index % WIRE_PALETTE.length];
}

export function arcPath(
  from: { x: number; y: number },
  to: { x: number; y: number }
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const lift = Math.max(18, dist * 0.45);
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2 - lift;
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
}
