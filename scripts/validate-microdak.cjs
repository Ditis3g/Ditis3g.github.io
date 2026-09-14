const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const input = process.argv[2] || path.resolve(__dirname, '../data/microdak.json');
const d = JSON.parse(fs.readFileSync(input, 'utf8').replace(/^\uFEFF/, ''));
const isCount = x => Number.isSafeInteger(x) && x >= 0;
const ids = new Set();
assert.match(d.updated, /^\d{4}-\d{2}-\d{2}$/);
for (const p of d.parts) {
  assert(!ids.has(p.id), `Duplicate ID: ${p.id}`); ids.add(p.id);
  assert(['material','reserve'].includes(p.kind), p.id + ': invalid kind');
  assert(['핵심 전장','기구·주변 부품','배송·세금','개발·예비비'].includes(p.category), p.id + ': invalid category');
  assert(Number.isSafeInteger(p.qty) && p.qty > 0, p.id + ': qty must be a positive integer');
  for (const field of ['unit_krw','estimate_krw','low_krw','high_krw']) assert(isCount(p[field]), `${p.id}: invalid ${field}`);
  assert.equal(p.qty * p.unit_krw, p.estimate_krw, p.id + ': qty × unit cost differs from estimate');
  assert(p.low_krw <= p.estimate_krw && p.estimate_krw <= p.high_krw, p.id + ': invalid range');
  assert(p.received_qty === null || isCount(p.received_qty), p.id + ': invalid received quantity');
  assert(p.actual_krw === null || isCount(p.actual_krw), p.id + ': invalid actual cost');
  assert(p.remaining_krw === null || isCount(p.remaining_krw), p.id + ': invalid remaining cost');
  assert(!p.actual_final || p.remaining_krw === null || p.remaining_krw === 0, p.id + ': settled item cannot have remaining cost');
  assert.equal(typeof p.actual_final, 'boolean', p.id + ': final must be boolean');
  assert(!p.actual_final || p.actual_krw !== null, p.id + ': cannot settle unknown cost');
  assert(['unrecorded','planned','ordered','received'].includes(p.order_status), p.id + ': invalid order state');
  assert(p.kind !== 'reserve' || p.received_qty === null, p.id + ': reserve has no inventory');
  assert(typeof p.note === 'string' && typeof p.purchase_note === 'string');
}
for (const e of d.additional_expenses || []) {
  assert(typeof e.id === 'string' && !ids.has(e.id), 'Invalid or duplicate expense ID'); ids.add(e.id);
  assert(typeof e.name === 'string' && e.name.length > 0, e.id + ': missing name');
  assert(isCount(e.actual_krw), e.id + ': invalid actual cost');
  assert.match(e.updated, /^\d{4}-\d{2}-\d{2}$/);
}
const groupedIds = d.purchase_groups.flatMap(g => g.part_ids);
assert.equal(new Set(groupedIds).size, groupedIds.length, 'Purchase group duplicates');
assert.deepEqual([...groupedIds].sort(), d.parts.filter(p=>p.kind==='material').map(p=>p.id).sort(), 'Purchase groups must cover each material exactly once');
for (const item of [...d.hardware,...d.software]) assert(['done','progress','blocked','pending'].includes(item.state), item.title + ': invalid work state');
const testIds = new Set();
for (const t of d.tests) {
  assert(!testIds.has(t.id), 'Duplicate test ID: ' + t.id); testIds.add(t.id);
  assert(['PC','실물'].includes(t.environment), t.id + ': invalid environment');
  assert(['passed','issue','pending','running','failed'].includes(t.state), t.id + ': invalid test state');
}
const total = f => d.parts.reduce((sum,p)=>sum+p[f],0);
console.log(JSON.stringify({valid:true,items:d.parts.length,materials:d.parts.filter(p=>p.kind==='material').length,budget:total('estimate_krw'),low:total('low_krw'),high:total('high_krw'),actualEntered:d.parts.filter(p=>p.actual_krw!==null).length,physicalPassed:d.tests.filter(t=>t.environment==='실물'&&t.state==='passed').length},null,2));