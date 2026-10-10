/**
 * # unityXhrShim
 * 埋め込みアセットを blob URL 経由で UnityLoader へ供給する URL 書き換え XHR
 *
 * ### 特徴
 * - モック実装を排し、実 XHR を blob URL に対して発行するため XHR の挙動がネイティブ通り
 * - URL の末尾ファイル名がアセットと一致した場合だけ blob URL へ差し替える
 * - 一致しない URL は元の URL のまま実 XHR へ渡すためランキング通信等も壊さない
 */

// ファイル名 -> 中身。テキストは生文字列、バイナリは ArrayBuffer で受け取る
export type UnityAssetTable = Record<string, string | ArrayBuffer>;

/**
 * ### installUnityXhrShim
 * アセットを blob URL 化し、XHR の URL を差し替えるシムへ置き換える(冪等)
 *
 * @param assets - ファイル名をキーにしたアセットテーブル
 */
export function installUnityXhrShim(assets: UnityAssetTable): void {
  const w = window as typeof window & { __unityXhrShimInstalled?: boolean };
  if (w.__unityXhrShimInstalled) return;
  w.__unityXhrShimInstalled = true;

  const NativeXHR = window.XMLHttpRequest;
  const blobUrls = new Map<string, string>();
  for (const [name, body] of Object.entries(assets)) {
    const mime = name.endsWith('.json') ? 'application/json' : 'application/octet-stream';
    const part: BlobPart = body;
    blobUrls.set(name, URL.createObjectURL(new Blob([part], { type: mime })));
  }

  class RewritingXHR extends NativeXHR {
    /**
     * ### open
     * アセット名に一致するリクエストを blob URL へ向き先変更する
     *
     * @param method - HTTP メソッド
     * @param url - リクエスト URL
     * @param async - 非同期フラグ(規約上常に true)
     */
    open(method: string, url: string | URL, async = true): void {
      super.open(method, rewriteUrl(blobUrls, url), async);
    }
  }

  window.XMLHttpRequest = RewritingXHR as unknown as typeof XMLHttpRequest;
}

/**
 * ### rewriteUrl
 * URL の末尾ファイル名がアセットと一致していれば blob URL へ置換する
 *
 * @param blobUrls - ファイル名をキーにした blob URL テーブル
 * @param url - 元のリクエスト URL
 * @returns 差し替え後の URL
 */
function rewriteUrl(blobUrls: Map<string, string>, url: string | URL): string {
  const raw = typeof url === 'string' ? url : url.href;
  const path = raw.split(/[?#]/)[0];
  const name = path.slice(path.lastIndexOf('/') + 1);
  return blobUrls.get(name) ?? raw;
}
