export interface Cache {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): boolean;
}
