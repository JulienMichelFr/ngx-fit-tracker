export interface Stats {
  average: number;
  difference: number;
  max: { value: number; date: Date };
  min: { value: number; date: Date };
  current: number;
}
