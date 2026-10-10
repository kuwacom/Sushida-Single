/// <reference types="vite/client" />

declare module '*.unityweb' {
  // Unityビルドのバイナリはビルド時にdata URLへインライン化される
  const src: string;
  export default src;
}
