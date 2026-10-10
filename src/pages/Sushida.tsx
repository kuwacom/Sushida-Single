import { useEffect, useRef } from 'react';

import unityLoaderSource from '../unity/UnityLoader.js?raw';
import webJsonSource from '../unity/Web.json?raw';
import webDataUrl from '../unity/Web.data.unityweb';
import wasmCodeUrl from '../unity/Web.wasm.code.unityweb';
import wasmFrameworkUrl from '../unity/Web.wasm.framework.unityweb';
import asmCodeUrl from '../unity/Web.asm.code.unityweb';
import asmMemoryUrl from '../unity/Web.asm.memory.unityweb';
import asmFrameworkUrl from '../unity/Web.asm.framework.unityweb';
import { installUnityXhrShim, type UnityAssetTable } from '../utils/unityXhrShim';
import { installAudioUnlock } from '../utils/audioUnlock';

interface UnityLoaderStatic {
  instantiate(elementId: string, jsonUrl: string): unknown;
}

declare global {
  interface Window {
    UnityLoader: UnityLoaderStatic;
  }
}

let init = false;

// 埋め込みバイナリは data URL で降ってくるため fetch で実バイトへ戻す
const binaryAssets: ReadonlyArray<readonly [string, string]> = [
  ['Web.data.unityweb', webDataUrl],
  ['Web.wasm.code.unityweb', wasmCodeUrl],
  ['Web.wasm.framework.unityweb', wasmFrameworkUrl],
  ['Web.asm.code.unityweb', asmCodeUrl],
  ['Web.asm.memory.unityweb', asmMemoryUrl],
  ['Web.asm.framework.unityweb', asmFrameworkUrl],
];

/**
 * ### decodeDataUrl
 * data URL の base64 を素の JS だけで ArrayBuffer へ展開する
 *
 * @param dataUrl - vite がインライン化した data URL
 * @returns デコード済みバイナリ
 */
function decodeDataUrl(dataUrl: string): ArrayBuffer {
  // file:// では fetch(data:) がブロックされる環境があるため atob で自前展開する
  const comma = dataUrl.indexOf(',');
  if (comma < 0 || !dataUrl.slice(0, comma).includes('base64')) {
    throw new Error('base64 形式の data URL 以外は扱えない');
  }
  const binary = atob(dataUrl.slice(comma + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * ### buildAssetTable
 * 埋め込みアセットをシム用テーブルへ組み立てる
 *
 * @returns ファイル名をキーにしたアセットテーブル
 */
async function buildAssetTable(): Promise<UnityAssetTable> {
  const binaries = binaryAssets.map(([name, url]) => [name, decodeDataUrl(url)] as const);
  // file:// ではページ自身への WWW 取得が独自オリジン扱いで拒否されるため
  // 空ページを blob で応答できるようにしておく(クエリ解析のフォールバック)
  const pageName = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  return {
    'Web.json': webJsonSource,
    [pageName]: STUB_PAGE_HTML,
    'index.html': STUB_PAGE_HTML,
    'play.html': STUB_PAGE_HTML,
    ...Object.fromEntries(binaries),
  };
}

// ゲームがページ取得を parse してもクエリ無しの通常モードとして扱える最小構成
const STUB_PAGE_HTML =
  '<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>';

function Sushida() {
  const gameContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (init) return;
    init = true;

    let loaderScript: HTMLScriptElement | null = null;
    const boot = async () => {
      // オートプレイ制限によるサウンド初期化の停滞を先回りして回避する
      installAudioUnlock();
      // XHR シムを先に差し込み、UnityLoader の通信をすべてメモリ内へ向ける
      installUnityXhrShim(await buildAssetTable());
      loaderScript = document.createElement('script');
      loaderScript.dataset.unityLoader = 'true';
      loaderScript.textContent = unityLoaderSource;
      document.body.appendChild(loaderScript);
      window.UnityLoader.instantiate('gameContainer', 'build/Web.json');

      // Canvas のドラッグ禁止
      const canvas = document.getElementsByTagName('canvas')[0];
      if (canvas) {
        canvas.ondragstart = () => false;
      }
    };

    boot().catch((error: unknown) => {
      console.error('Unity の起動に失敗しました', error);
      // file:// 直接起動時に真っ白で原因が分からなくならないよう画面へ出す
      const box = gameContainerRef.current;
      if (box) {
        box.style.width = '560px';
        box.style.color = '#c0392b';
        box.textContent = `起動に失敗しました: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    });

    // クリーンアップ
    return () => {
      loaderScript?.remove();
    };
  }, []);

  return (
    <div style={{ padding: 8 }}>
      <div
        id="gameContainer"
        ref={gameContainerRef}
        style={{
          width: '500px',
          height: '420px',
          color: 'rgb(85, 85, 85)',
        }}
      ></div>
      {/* ブラウザのオートプレイ制限の解除とキー入力反映のため、公式サイトと同じ案内を出す */}
      <p style={{ fontSize: 12, color: '#666', margin: '8px 0 0' }}>
        動かない場合はゲーム画面を一度クリックしてください
      </p>
    </div>
  );
}

export default Sushida;
