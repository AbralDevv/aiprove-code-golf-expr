const {evalExpr} = require('./index.js');
const pub = require('/home/hatch/workspace/aiprove/aiprove-repo/challenges/code-golf-expr/cases.json');
const extra = [
  ['-5', -5], ['-5+3', -2], ['2*-3', -6], ['2--3', 5], ['-(1+2)', -3],
  ['--5', 5], ['---5', -5], ['3- -2', 5], ['-(-(-7))', -7], ['+5', 5], ['2*+3', 6],
  [' 1 + 2 ', 3], ['1\t+\n2', 3], ['  (  2  +  3  )  *  4  ', 20],
  ['((1+2)*((3)))', 9], ['((((5))))', 5], ['1+(2*(3+(4*(5+6))))', 95],
  ['1/3', 1/3], ['1/0', Infinity], ['0/0', NaN], ['5/2', 2.5],
  ['-7/2', -3.5], ['10/(2*5)', 1], ['0.3/0.1', 0.3/0.1],
  ['.5+.5', 1], ['5.', 5], ['0.1+0.2', 0.1+0.2], ['1e3', 1000],
  ['1000000*1000000', 1e12], ['0.5*0.5', 0.25],
  ['2+3*4-5/5', 13], ['100/10/2', 5], ['2*3/4', 1.5],
  ['10-2*3', 4], ['(10-2)*3', 24],
  ['0', 0], ['42', 42], ['0.0', 0],
  // leading-zero / octal-trap cases
  ['010', 10], ['007', 7], ['08', 8], ['00', 0], ['000.5', 0.5],
  ['10+010', 20], ['2*007', 14], ['(010)', 10], ['10-05', 5],
  ['-007', -7], ['2*-007', -14], ['10.05', 10.05], ['0.05', 0.05],
  ['1.005', 1.005], ['100', 100], ['1000+007', 1007], ['0.5', 0.5],
];
const all = pub.map(c => [c.in, c.out]).concat(extra);
let fail = 0;
for (const [input, expected] of all) {
  let got;
  try { got = evalExpr(input); } catch (e) { got = 'THREW:' + e.message; }
  const ok = Object.is(got, expected) || (typeof got === 'number' && typeof expected === 'number' && Math.abs(got - expected) < 1e-9);
  if (!ok) { fail++; console.log('FAIL', JSON.stringify(input), 'got', got, 'want', expected); }
}
console.log(`public: ${pub.length} cases, extra: ${extra.length} cases`);
console.log(`TOTAL: ${all.length - fail}/${all.length} pass`);
process.exit(fail ? 1 : 0);
