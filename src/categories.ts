import type { Categories as HAPCategories } from 'homebridge';

// homebridge declares Categories as an ambient const enum, which cannot be
// accessed as a value with isolatedModules enabled
export const Categories = {
  OTHER: 1 as HAPCategories.OTHER,
  WINDOW_COVERING: 14 as HAPCategories.WINDOW_COVERING,
} as const;
