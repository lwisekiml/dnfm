/**
 * ============================================================
 * logic.js — 브릿지 파일 (Bridge)
 * ============================================================
 *
 * 역할:
 *   로직을 직접 담지 않고, 원본 index_legacy_prefix.html 의
 *   <script> 블록을 파싱·실행해서 그 함수들을 export 한다.
 *
 *   덕분에 logic.test.js 는 복붙한 사본이 아닌
 *   실제 원본 HTML 코드를 테스트하게 된다.
 *   원본 HTML 수정 → 테스트 즉시 반영.
 *
 * 작동 원리:
 *   1. HTML 파일 읽기
 *   2. <script>...</script> 블록 추출
 *   3. DOM API 를 흉내내는 mock 객체 준비
 *      (HTML 코드가 브라우저 API 를 참조하므로 없으면 에러 발생)
 *   4. new Function() 으로 코드 실행
 *      - exports 객체를 주입 → HTML 끝의 export 블록이 여기에 값을 채움
 *   5. exports 를 ES Module 로 re-export
 * ============================================================
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── 1. HTML 파일 읽기 ────────────────────────────────────────
const htmlPath = join(__dirname, '../dnfm_eq.html');
const html = readFileSync(htmlPath, 'utf-8');

// ── 2. <script> 블록 추출 ────────────────────────────────────
const scriptStart = html.indexOf('<script>') + '<script>'.length;
const scriptEnd   = html.lastIndexOf('</script>');
const scriptCode  = html.slice(scriptStart, scriptEnd);

// ── 3. DOM Mock ──────────────────────────────────────────────
// HTML 코드는 브라우저 환경을 가정한다.
// Node.js 에는 document, localStorage 등이 없으므로
// 에러 없이 파싱만 통과할 수 있도록 빈 mock 을 제공한다.
// (실제 DOM 조작이 일어나지 않아도 되고, 에러만 안 나면 됨)

// 어떤 프로퍼티에 접근해도 자기 자신을 돌려주는 mock 요소
const makeEl = () => new Proxy({}, {
    get(_, key) {
        // style, classList 등 자주 쓰는 것들
        if (key === 'style')    return new Proxy({}, { get: () => '', set: () => true });
        if (key === 'classList') return { add:()=>{}, remove:()=>{}, toggle:()=>false, contains:()=>false };
        if (key === 'children') return [];
        // 함수처럼 쓰이는 것들 (appendChild, addEventListener 등)
        if (typeof key === 'string') return (...args) => makeEl();
        return '';
    },
    set() { return true; },
});

const domMock = {
    document: {
        getElementById:      () => makeEl(),
        createElement:       () => makeEl(),
        querySelector:       () => null,
        querySelectorAll:    () => [],
        addEventListener:    () => {},   // DOMContentLoaded 등
        body:                makeEl(),
        activeElement:       makeEl(),
    },
    window: {
        scrollTo:       () => {},
        addEventListener: () => {},
        ontouchstart:   null,
    },
    localStorage: {
        getItem:    () => null,
        setItem:    () => {},
        removeItem: () => {},
    },
    alert:        () => {},
    confirm:      () => false,
    setTimeout:   () => 0,
    clearTimeout: () => {},
    // Blob, URL — 파일 내보내기 기능에서 사용
    Blob: class { constructor() {} },
    URL: { createObjectURL: () => '', revokeObjectURL: () => {} },
};

// ── 4. HTML 코드 실행 ─────────────────────────────────────────
const exports = {};

const fn = new Function('exports', ...Object.keys(domMock), scriptCode);
fn(exports, ...Object.values(domMock));

// ── 5. ES Module re-export ───────────────────────────────────
export const ARMOR_SETS             = exports.ARMOR_SETS;
export const ACCESSORY_SETS         = exports.ACCESSORY_SETS;
export const SPECIAL_SETS           = exports.SPECIAL_SETS;
export const ALL_SETS               = exports.ALL_SETS;
export const ARMOR_PREFIX           = exports.ARMOR_PREFIX;
export const ACCESSORY_PREFIX       = exports.ACCESSORY_PREFIX;
export const SPECIAL_PREFIX         = exports.SPECIAL_PREFIX;
export const ALL_PREFIX             = exports.ALL_PREFIX;
export const ARMOR_EXCEED_ONLY      = exports.ARMOR_EXCEED_ONLY;
export const ACCESSORY_EXCEED_ONLY  = exports.ACCESSORY_EXCEED_ONLY;
export const LEGACY_PREFIX_SETS     = exports.LEGACY_PREFIX_SETS;
export const EXCEED_TAGS            = exports.EXCEED_TAGS;
export const EXCEED_SLOTS           = exports.EXCEED_SLOTS;

// 순수 함수: 원본 그대로
export const makePrefixKey          = exports.makePrefixKey;
export const isExceedName           = exports.isExceedName;
export const getGroupKey            = exports.getGroupKey;
export const getSetType             = exports.getSetType;
export const calcTotalDistinctParts = exports.calcTotalDistinctParts;

// DOM 의존 함수: HTML 안에 _ prefix 순수 버전으로 정의해둔 것을 export
export const incrementCount  = exports._incrementCount;
export const decrementCount  = exports._decrementCount;
export const sortByName      = exports._sortByName;
export const sortByJob       = exports._sortByJob;
export const getSetType3or5  = exports._getSetType3or5;