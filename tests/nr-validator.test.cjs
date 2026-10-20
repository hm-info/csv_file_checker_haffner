const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const NR = require('../nr-validator.js');

const sample = fs.readFileSync(path.join(__dirname, '../samples/NR_Series/NR_Series_Job_Example.csv'), 'utf8');
const sampleRows = sample.split(/\r?\n/).filter(line => line !== '').map(line => line.split(';'));
const headers = sampleRows[0];
const data = sampleRows.slice(1);
const serialize = (rows = data, columns = headers, delimiter = ';') => [columns, ...rows].map(row => row.join(delimiter)).join('\n');
const changed = (field, value, index = 0) => data.map((row, i) => row.map((v, c) => i === index && headers[c] === field ? value : v));
const allIssues = result => [...result.globalIssues, ...result.rowIssues.flat()];
const errors = result => allIssues(result).filter(issue => issue.level === 'err');
const has = (result, field, level = 'err') => allIssues(result).some(issue => issue.field === field && issue.level === level);

test('30-column anonymized sample: 3 parts and 3 macros, no issues', () => {
  const result = NR.validate(sample);
  assert.equal(result.headers.length, 30);
  assert.equal(result.rows.length, 3);
  assert.equal(result.macros.flat().length, 3);
  assert.deepEqual(allIssues(result), []);
});

test('matches shuffled header names rather than column positions', () => {
  const order = headers.map((_, i) => i).reverse();
  const result = NR.validate(serialize(data.map(row => order.map(i => row[i])), order.map(i => headers[i])));
  assert.deepEqual(allIssues(result), []);
  assert.equal(result.macros[0][0].tool, '002');
});

test('automatically detects comma-separated NR files', () => {
  const result = NR.validate(serialize(data, headers, ','));
  assert.equal(result.delimiter, ',');
  assert.deepEqual(allIssues(result), []);
});

test('explicit wrong separator reports a header error', () => {
  assert.ok(errors(NR.validate(sample, { delimiter: ',' })).length > 0);
});

test('BOM, blank rows, CRLF and actual physical line numbers', () => {
  const result = NR.validate('\uFEFF\r\n' + headers.join(';') + '\r\n\r\n' + data[0].join(';') + '\r\n');
  assert.deepEqual(result.rowNumbers, [4]);
  assert.deepEqual(errors(result), []);
});

test('empty file and header-only file are invalid', () => {
  assert.ok(errors(NR.validate(' \n')).length);
  assert.ok(errors(NR.validate(headers.join(';'))).length);
});

test('headerless files are not validated as good records', () => {
  assert.ok(errors(NR.validate(data.map(row => row.join(';')).join('\n'))).length);
});

test('core headers are required; label columns may be omitted', () => {
  const core = [...NR.REQUIRED, 'nccode'];
  const rows = data.map(row => core.map(name => row[headers.indexOf(name)]));
  assert.deepEqual(allIssues(NR.validate(serialize(rows, core))), []);
  const missing = core.filter(name => name !== 'mainprofile');
  assert.ok(has(NR.validate(serialize(rows.map(row => row.filter((_, i) => core[i] !== 'mainprofile')), missing)), 'mainprofile'));
});

test('duplicate header names are rejected even with different casing', () => {
  const result = NR.validate(serialize(data.map(row => [...row, row[0]]), [...headers, 'ID']));
  assert.ok(has(result, 'ID'));
});

test('additional fields warn without imposing a 30-column hard limit', () => {
  const result = NR.validate(serialize(data.map(row => [...row, 'note']), [...headers, 'customfield']));
  assert.deepEqual(errors(result), []);
  assert.ok(has(result, 'customfield', 'warn'));
});

test('missing nccode warns that machining cannot be checked', () => {
  const index = headers.indexOf('nccode');
  const result = NR.validate(serialize(data.map(row => row.filter((_, i) => i !== index)), headers.filter((_, i) => i !== index)));
  assert.deepEqual(errors(result), []);
  assert.ok(has(result, 'nccode', 'warn'));
});

test('an empty nccode is valid for a part without machining', () => {
  assert.deepEqual(errors(NR.validate(serialize(changed('nccode', '')))), []);
});

test('missing and extra row values are errors at the physical line', () => {
  const rows = data.map(row => [...row]);
  rows[1].pop();
  const result = NR.validate(serialize(rows));
  assert.ok(result.rowIssues[1].some(issue => issue.row === 3 && issue.level === 'err'));
  rows[1].push('', 'extra');
  assert.ok(errors(NR.validate(serialize(rows))).length);
});

test('scaled lengths must be positive integer values, not decimal strings', () => {
  for (const value of ['0', '-10', '471.0', '471,0', 'abc', '2147483648']) {
    assert.ok(has(NR.validate(serialize(changed('ktnbar', value))), 'ktnbar'), value);
  }
});

test('bar and within-bar sequence respect the C# integer range', () => {
  assert.ok(has(NR.validate(serialize(changed('ksn', '32768'))), 'ksn'));
  assert.ok(has(NR.validate(serialize(changed('ktn', '32768'))), 'ktn'));
});

test('required profile cannot be blank', () => {
  assert.ok(has(NR.validate(serialize(changed('mainprofile', '   '))), 'mainprofile'));
});

test('H0010203 decodes as H / 001 / 02 / 03 with the last ten digits intact', () => {
  const result = NR.checkMacros('H00102030500001000', 15000);
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.blocks[0], {
    code: 'H00102030500001000', tool: '001', operation: '02', accessory: '03', position: 5000, slotLength: 1000, short: false
  });
});

test('H alone is the fixed prefix; a three-digit Tool need not start with 0', () => {
  assert.deepEqual(NR.checkMacros('H10102030500001000', 15000).issues, []);
});

test('C# byte overflow in Tool code is rejected', () => {
  assert.ok(NR.checkMacros('H25602030500001000', 15000).issues.some(issue => issue.level === 'err'));
});

test('non-numeric operation/accessory and malformed lengths are rejected', () => {
  for (const macro of ['H001XX030500001000', 'H00102AA0500001000', 'H0010203050000100', 'H', 'h00102030500001000', 'garbageH00102030500001000', 'H00102030500001000H']) {
    assert.ok(NR.checkMacros(macro, 15000).issues.some(issue => issue.level === 'err'), macro);
  }
});

test('multiple 18-character macro blocks are parsed separately', () => {
  const result = NR.checkMacros('H00201010500001000H01601011000000000', 15000);
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.blocks.map(block => block.tool), ['002', '016']);
});

test('supported 13-character short macro is a warning, not a false error', () => {
  const result = NR.checkMacros('H001020305000', 15000);
  assert.ok(result.issues.some(issue => issue.level === 'warn'));
  assert.ok(!result.issues.some(issue => issue.level === 'err'));
  assert.equal(result.blocks[0].slotLength, 0);
});

test('negative or outside-part positions warn rather than inventing mechanical limits', () => {
  for (const macro of ['H0010203-012301000', 'H00102032000001000', 'H00102031490001000']) {
    const result = NR.checkMacros(macro, 15000);
    assert.ok(result.issues.some(issue => issue.level === 'warn'), macro);
    assert.ok(!result.issues.some(issue => issue.level === 'err'), macro);
  }
});

test('duplicate macros warn', () => {
  assert.ok(NR.checkMacros('H00102030500001000H00102030500001000', 15000).issues.some(issue => issue.level === 'warn'));
});

test('duplicate part IDs and bar/part pairs are errors', () => {
  assert.ok(has(NR.validate(serialize(changed('id', '1', 1))), 'id'));
  assert.ok(has(NR.validate(serialize(changed('ktn', '1', 1))), 'ktn'));
});

test('different stock lengths under the same bar number are errors', () => {
  assert.ok(has(NR.validate(serialize(changed('ksnbar', '60000', 1))), 'ksnbar'));
});

test('nonconsecutive part sequence and a reopened bar warn', () => {
  assert.ok(has(NR.validate(serialize(changed('ktn', '4', 1))), 'ktn', 'warn'));
  const rows = [...data.map(row => [...row]), [...data[1]]];
  rows[3][0] = '4'; rows[3][3] = '3';
  assert.ok(has(NR.validate(serialize(rows)), 'ksn', 'warn'));
});

test('single, pivot and arrow angle formats supported by MSC are distinguished', () => {
  for (const angle of ['45.5', '45,5', '45|90', '45|90||30|90']) {
    assert.ok(!has(NR.validate(serialize(changed('l', angle))), 'l'), angle);
  }
  assert.ok(has(NR.validate(serialize(changed('l', '45|bad'))), 'l'));
});

test('numeric-looking customer and trolley text is not restricted by TT rules', () => {
  assert.ok(!has(NR.validate(serialize(changed('trolley', 'TROLLEY-A'))), 'trolley'));
  assert.ok(!has(NR.validate(serialize(changed('colorcode', '99'))), 'colorcode'));
});

test('NR has no inherited TT405 2000-row cap', () => {
  const rows = Array.from({ length: 2001 }, (_, i) => {
    const row = [...data[2]]; row[0] = String(i + 1); row[1] = String(i + 1); row[3] = '1'; return row;
  });
  assert.equal(NR.validate(serialize(rows)).rows.length, 2001);
  assert.deepEqual(errors(NR.validate(serialize(rows))), []);
});

test('decoding replacement characters warn about file encoding', () => {
  assert.ok(allIssues(NR.validate(serialize(changed('customer', '\uFFFD')))).some(issue => issue.level === 'warn' && issue.msg.includes('Kodlama')));
});
