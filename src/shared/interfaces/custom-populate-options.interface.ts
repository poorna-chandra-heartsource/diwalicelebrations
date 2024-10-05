export interface CustomPopulateOptionsInterface {
  path: string;
  model: string;
  select?: string;
  options?: { lean?: boolean };
  as?: string;
}
