export const AWG_SIZES = [12, 14, 16, 18, 20, 22, 24] as const;
export type AWGSize = typeof AWG_SIZES[number];

const AWG_TO_PX: Record<AWGSize, number> = {
  12: 5.5, 14: 4.5, 16: 3.5, 18: 3.0, 20: 2.5, 22: 2.0, 24: 1.5,
};

export function awgToPx(awg: AWGSize | undefined): number {
  return awg !== undefined ? (AWG_TO_PX[awg as AWGSize] ?? 2.5) : 2.5;
}
