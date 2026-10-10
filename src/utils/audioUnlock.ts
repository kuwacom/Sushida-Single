/**
 * # audioUnlock
 * ブラウザのオートプレイ制限による Unity サウンド初期化の停滞を防ぐ
 *
 * ### 特徴
 * - 生成されたすべての AudioContext を記録する
 * - 最初のユーザー操作で suspended 状態のコンテキストを resume する
 * - file:// 直接起動のように操作なしで開いた場合の黒画面停滞を回避する
 */

type AudioContextCtor = new (contextOptions?: AudioContextOptions) => AudioContext;

const trackedContexts: AudioContext[] = [];

/**
 * ### installAudioUnlock
 * AudioContext コンストラクタをラップしてインスタンスを捕捉し、
 * ユーザー操作発生時に resume を行うリスナーを登録する
 */
export function installAudioUnlock(): void {
  const w = window as typeof window & { webkitAudioContext?: AudioContextCtor };
  const wrap = (Ctor: AudioContextCtor): AudioContextCtor =>
    class UnlockableAudioContext extends Ctor {
      constructor(options?: AudioContextOptions) {
        super(options);
        trackedContexts.push(this);
      }
    };

  if (typeof w.AudioContext === 'function') {
    w.AudioContext = wrap(w.AudioContext);
  }
  if (typeof w.webkitAudioContext === 'function') {
    w.webkitAudioContext = wrap(w.webkitAudioContext);
  }

  const unlock = (): void => {
    for (const ctx of trackedContexts) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => undefined);
      }
    }
  };
  // キャプチャ段階で先に拾い、ゲーム側ハンドラより先に解錠する
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
  window.addEventListener('touchstart', unlock, true);
}
