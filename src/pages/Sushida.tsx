import { useEffect, useRef } from 'react';

// 型定義
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    UnityLoader: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    UnityProgress: any;
  }
}

let init = false;

function Sushida() {
  const gameContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (init) return;
    init = true;
    // UnityLoader と UnityProgress スクリプトをロード
    const loadScripts = async () => {
      const scriptUnityLoader = document.createElement('script');
      scriptUnityLoader.src = 'build/UnityLoader.js';
      scriptUnityLoader.async = true;
      document.body.appendChild(scriptUnityLoader);

      // UnityLoader が読み込まれたら Unity インスタンスを生成
      scriptUnityLoader.onload = () => {
        if (gameContainerRef.current) {
          const gameInstance = window.UnityLoader.instantiate(
            'gameContainer',
            'build/Web.json'
          );

          // Canvas のドラッグ禁止
          const canvas = document.getElementsByTagName('canvas')[0];
          if (canvas) {
            canvas.ondragstart = () => false;
          }
        }
      };
    };

    loadScripts();

    // クリーンアップ
    return () => {
      const existingUnityLoader = document.querySelector(
        'script[src="build/UnityLoader.js"]'
      );
      if (existingUnityLoader) existingUnityLoader.remove();
    };
  }, []);

  return (
    <div
      id="gameContainer"
      ref={gameContainerRef}
      style={{
        width: '500px',
        height: '420px',
        color: 'rgb(85, 85, 85)',
      }}
      data-darkreader-inline-color=""
    ></div>
  );
}

export default Sushida;
