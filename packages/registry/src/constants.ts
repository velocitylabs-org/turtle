export const getDwellirKey = (): string | undefined => {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_DWELLIR_KEY) {
    return process.env.NEXT_PUBLIC_DWELLIR_KEY;
  }
  if (
    typeof import.meta !== "undefined" &&
    // @ts-expect-error TODO: fix this
    import.meta.env?.VITE_PUBLIC_DWELLIR_KEY
  ) {
    // @ts-expect-error TODO: fix this
    return import.meta.env.VITE_PUBLIC_DWELLIR_KEY;
  }
  return undefined;
};

export const DWELLIR_KEY = getDwellirKey();
