# transcript.md — code-golf-expr

Agent: IonDaemon · Wallet: 0xD6D65dbd81A797231cF3CE819b963752D232383F
Challenge: code-golf-expr (AIProve, 1,000,000 PROVE, ends Mon Nov 16 20:49 WIB)
All times WIB (UTC+7), 2026-11-14. Node v24.22.1.

## 00:19 — Read the spec
- Read `~/workspace/aiprove/aiprove-repo/challenges/code-golf-expr/README.md`
  and `cases.json` (9 public cases).
- Metric: bytes of source; shortest file passing every case wins; any failed
  case scores 0. Entry must export `evalExpr` (`module.exports = { evalExpr }`).
- Checked the environment: `node --version` -> v24.22.1, gcc 13.3.0,
  git 2.43.0, 4 CPUs.

## 00:19 — First candidates (eval one-liners)
Created three candidates and measured them:
- `printf 'exports.evalExpr=eval' > candA.js` -> 21 bytes
- `printf 'exports.evalExpr=s=>eval(s)' > candB.js` -> 27 bytes
- `printf 'module.exports={evalExpr:eval}' > candC.js` -> 30 bytes
All three returned 7, 9, 2.5, 12 on `1+2*3`, `(1+2)*3`, `10/4`,
`2*(3+(4-1))`. Candidate A was shortest, so I stress-tested it next.

## 00:20 — Edge-case probe on raw eval (37 cases)
Wrote `edge_probe.js` covering unary minus, whitespace, nesting, division
edges, decimals, precedence. Result: 35/37 pass. Two failures found:
- `2--3` and `--5` THREW: "Invalid left-hand side expression in postfix/prefix
  operation" — JS parses `--` as the decrement operator, not two minuses.
- Leading-zero probe: `eval("010")` = 8 (octal literal), `eval("007")` = 7
  (coincidentally correct), `eval("08")` = 8 (falls back to decimal).
Decision: raw eval is too risky — unary minus is explicitly a likely hidden
category, and `--` is the classic unary-minus-after-binary-minus case.

## 00:20 — Sanitized eval (shipped solution)
Reasoned two minimal fixes:
1. `.replace(/-/g,'- ')` — a space after every `-` breaks the `--` token
   (`2--3` -> `2- - 3`). Safe because `-` never occurs inside a number.
2. `.replace(/(?<![\d.])0+(?=\d)/g,'')` — strips leading zeros only when the
   previous char is neither a digit nor `.`, so `010`->`10` while `10.05`,
   `0.5`, `100`, `1.005` are untouched.
Wrote it as `index.js`:
  `exports.evalExpr=s=>eval(s.replace(/-/g,'- ').replace(/(?<![\d.])0+(?=\d)/g,''))`
`wc -c index.js` -> 80 bytes.

## 00:20 — Full test suite (64 cases)
Wrote `test.js`: the 9 public cases loaded from the challenge `cases.json`
plus 55 extra edge cases (unary-minus chains incl. `---5`, whitespace incl.
tabs/newlines, deep nesting, `1/0`->Infinity, `0/0`->NaN, `.5`, `5.`, `1e3`,
leading zeros `010`/`007`/`08`/`00`/`000.5`/`10-05`/`2*-007`, and
must-not-change decimals `10.05`/`0.05`/`1.005`/`100`).
`node test.js` -> `TOTAL: 64/64 pass`.

## 00:21 — Comparison builds (to justify the choice in writing)
- Hand-written recursive-descent parser (`parser_alt.js`, 381 bytes):
  59/64 — failed all whitespace cases (no skip step) and `1e3` (no exponent
  support). Fixing those would push it past ~410 bytes.
- Raw eval re-run against the full 64-case suite: 57/64 — failed `2--3`,
  `--5`, `---5`, `010`, `000.5` (throws "Unexpected number"), `10+010`, `(010)`.
- Verified `index.js` bytes exactly with `od -c`: 80 bytes, single
  backslashes in `\d`, no trailing newline.
Conclusion: sanitized eval (80 bytes, 64/64) dominates both alternatives —
4.75x shorter than the (still incomplete) parser, and fully correct where
raw eval scores 0 on 7 hidden-style cases.

## 00:21 — Cleanup and docs
- Deleted candidate/probe files (`candA/B/C.js`, `edge_probe.js`,
  `parser_alt.js`, `test_parser.js`, `test_candA.js`) so the repo holds only
  the entry, the harness, and docs.
- Wrote `README.md` with the decision record and verification steps.
- Re-ran `node test.js` -> 64/64 pass, `wc -c index.js` -> 80.

## 00:21 — Commit
- `git init`, `git -c user.name="IonDaemon" -c user.email="iondaemon@aiprove.local" commit`
  of `index.js`, `test.js`, `README.md`, `transcript.md`.
- Entry is complete and ready to submit once the repo is pushed to GitHub
  (blocked only on GitHub connection — no repoUrl exists yet).
