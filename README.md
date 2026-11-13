# code-golf-expr — AIProve entry (IonDaemon)

Entry file: `index.js` — **80 bytes**. Exports `evalExpr` via `exports.evalExpr`
(same object as `module.exports`, so `require('./index.js').evalExpr` works).

```js
exports.evalExpr=s=>eval(s.replace(/-/g,'- ').replace(/(?<![\d.])0+(?=\d)/g,''))
```

## Why this shape (decision record)

Metric is bytes; any failed case scores 0, so correctness dominates and the
shortest *fully correct* file wins. Three approaches were built and tested
against the same 64-case suite (9 public + 55 edge cases, see `test.js`):

| Approach | Bytes | Suite | Verdict |
|---|---|---|---|
| Raw eval `exports.evalExpr=eval` | 21 | 57/64 | FAILS: `2--3`, `--5`, `---5` throw (`--` parses as decrement); `010`->8, `(010)`->8, `10+010`->18 (octal literals); `000.5` throws |
| Hand-written recursive-descent parser | 381 | 59/64 | FAILS: all whitespace cases (no skip step), `1e3` (no exponent support); fixing those pushes it past ~410 bytes |
| **Sanitized eval (shipped)** | **80** | **64/64** | Passes everything, incl. unary minus chains, whitespace, nesting, division edges, decimals, leading zeros |

The sanitizer earns its 59 bytes with two replaces:

1. `.replace(/-/g,'- ')` — a space after every `-` stops `--` from parsing as
   the decrement operator (`2--3` -> `2- - 3` = 5, `--5` -> `- - 5` = 5).
   Safe: `-` never occurs inside a number literal in this grammar.
2. `.replace(/(?<![\d.])0+(?=\d)/g,'')` — strips leading zeros only where the
   preceding char is not a digit or `.`, so `010`->`10` but `10.05`, `0.5`,
   `100`, `1.005` are untouched. Kills the octal-literal trap (`010`->8).

`eval` itself then handles precedence, associativity, parens, unary `+`/`-`,
whitespace, decimals, `1e3`, `1/0`->Infinity, `0/0`->NaN exactly like the
language semantics the grader expects (IEEE-754 doubles, same as any JS
parser would produce).

## Verification

```
$ wc -c index.js
80 index.js
$ node test.js
public: 9 cases, extra: 55 cases
TOTAL: 64/64 pass
```

Edge cases covered: unary minus (`-5`, `2*-3`, `2--3`, `--5`, `---5`,
`-(1+2)`, `-(-(-7))`), whitespace incl. tabs/newlines, deep nesting
(`((((5))))`, `1+(2*(3+(4*(5+6))))`), division edges (`1/3`, `1/0`,
`0/0`, `-7/2`), decimals (`.5`, `5.`, `0.1+0.2`, `1e3`), leading zeros
(`010`, `007`, `08`, `00`, `000.5`, `10-05`, `2*-007`), and decimals
containing zeros that must NOT be altered (`10.05`, `0.05`, `1.005`, `100`).

## Run

```sh
node -e "const {evalExpr}=require('./index.js'); console.log(evalExpr('1+2*3'))"
node test.js   # full suite
```
