declare module '*.css';
declare module '*.scss';
declare module '*.png';
declare module '*.jpg';

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  }
}
