export const AWG_SIZES = [12, 14, 16, 18, 20, 22, 24] as const;
export type AWGSize = typeof AWG_SIZES[number];

const AWG_TO_PX: Record<AWGSize, number> = {
  12: 7.5, 14: 6.5, 16: 5.5, 18: 5.0, 20: 4.5, 22: 4.0, 24: 3.5,
};

export function awgToPx(awg: AWGSize | undefined): number {
  return awg !== undefined ? (AWG_TO_PX[awg as AWGSize] ?? 2.5) : 2.5;
}
