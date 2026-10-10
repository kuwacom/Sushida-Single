#!/usr/bin/env node
/**
 * # patch-domain-check
 * Unity WebGL ビルド内のブート時ドメインチェックを検出して無効化する
 *
 * ### 特徴
 * - hostname 比較とドメインリテラルのクラスタからゲートを検出する
 * - ファイル長を変えない等長パッチでオフセットずれを防ぐ
 * - ゲートが無ければ何も書き換えずに終了する(冪等)
 */
import fs from 'node:fs';
import path from 'node:path';

// ゲートのシグネチャ: hostname 系トークンと公式ドメインリテラルが近接している箇所
const GATE_WINDOW = 600;
const HOST_TOKENS = ['hostname', 'location.href', 'document.URL', 'absoluteURL'];
const DOMAIN_TOKENS = ['sushida.net', 'neutralx0', 'top.html'];

/**
 * ### findGates
 * テキスト中のドメインチェック候補位置を列挙する
 *
 * @param {string} text - 解析対象のファイル内容
 * @returns {number[]} ゲート候補の先頭オフセット配列
 */
function findGates(text) {
  const hits = [];
  for (let i = 0; i < text.length; i++) {
    const window = text.slice(i, i + GATE_WINDOW);
    const hasHost = HOST_TOKENS.some((t) => window.includes(t));
    const domainCount = DOMAIN_TOKENS.filter((t) => window.includes(t)).length;
    if (!hasHost || domainCount < 2) continue;
    hits.push(i);
    i += GATE_WINDOW - 1;
  }
  return hits;
}

/**
 * ### neutralizeWindow
 * 検出ウィンドウ内の比較式を常時 true になる式へ等長置換する
 *
 * @param {string} text - ファイル全文
 * @param {number} start - 置換対象ウィンドウの先頭オフセット
 * @returns {string} 置換後のファイル全文
 */
function neutralizeWindow(text, start) {
  // 比較の極性(=== か != か)は未知なので、条件式そのものを if(!1) へ置換する
  // ゲートウィンドウ内でドメイントークンより手方に最近接の if( を探す
  const window = text.slice(start, start + GATE_WINDOW);
  const domainPositions = DOMAIN_TOKENS.map((t) => window.indexOf(t)).filter((i) => i >= 0);
  if (domainPositions.length === 0) throw new Error(`ドメイントークンが消失 @ ${start}`);
  const domainPos = Math.min(...domainPositions);
  const ifIdxRel = window.lastIndexOf('if(', domainPos);
  if (ifIdxRel < 0) {
    throw new Error(`if( が見つからず中和不可 @ ${start}`);
  }
  const ifIdx = start + ifIdxRel;
  // if( から括弧の平衡で閉じ ) を求める
  let depth = 0;
  let closeIdx = -1;
  for (let i = ifIdx + 2; i < text.length; i++) {
    const c = text[i];
    if (c === '(') depth++;
    else if (c === ')') {
      depth--;
      if (depth === 0) {
        closeIdx = i;
        break;
      }
    }
  }
  if (closeIdx < 0) throw new Error(`括弧が不平衡 @ ${ifIdx}`);
  const segLen = closeIdx + 1 - ifIdx;
  if (segLen < 11) throw new Error(`if文が短すぎて等長パッチ不可 @ ${ifIdx}`);
  // if(!1) + コメント詰めで元の長さを厳密に維持する
  const replacement = 'if(!1)/*' + '*'.repeat(segLen - 10) + '*/';
  return text.slice(0, ifIdx) + replacement + text.slice(closeIdx + 1);
}

/**
 * ### processFile
 * 1ファイルの検出と書き換えを行う
 *
 * @param {string} file - 対象ファイルパス
 * @param {boolean} dryRun - true の場合は検出のみで書き込まない
 * @returns {void}
 */
function processFile(file, dryRun) {
  if (!fs.existsSync(file)) {
    console.log(`[skip] ${file} が見つかりません`);
    return;
  }
  const buf = fs.readFileSync(file);
  const text = buf.toString('latin1');
  const gates = findGates(text);
  if (gates.length === 0) {
    console.log(`[clean] ${path.basename(file)}: ドメインゲート無し`);
    return;
  }
  if (dryRun) {
    console.log(`[found] ${path.basename(file)}: ${gates.length} 箇所のゲート候補 @ ${gates.join(',')}`);
    return;
  }
  let out = text;
  // 後ろから置換しないとオフセットがずれるため降順で処理する
  for (const start of [...gates].sort((a, b) => b - a)) {
    out = neutralizeWindow(out, start);
  }
  if (out.length !== text.length) {
    throw new Error(`等長パッチ失敗: ${file} (${text.length} -> ${out.length})`);
  }
  fs.writeFileSync(file, Buffer.from(out, 'latin1'));
  console.log(`[patched] ${path.basename(file)}: ${gates.length} 箇所を無効化 (等長 ${text.length}B)`);
}

// 既定は src/unity の公式ブートアセットを対象にする
const args = process.argv.slice(2);
const dryRun = args.includes('--check');
const targets = args
  .filter((a) => !a.startsWith('--'))
  .map((a) => path.resolve(a));
const defaultTargets = ['UnityLoader.js', 'Web.wasm.framework.unityweb', 'Web.asm.framework.unityweb'].map(
  (f) => path.resolve('src/unity', f)
);

for (const file of targets.length > 0 ? targets : defaultTargets) {
  processFile(file, dryRun);
}
