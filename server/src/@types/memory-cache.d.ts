declare module 'memory-cache' {
  interface Cache {
    put(key: string, value: any, duration?: number): void;
    get(key: string): any;
    del(key: string): void;
    clear(): void;
  }

  const cache: Cache;
  export default cache;
}
