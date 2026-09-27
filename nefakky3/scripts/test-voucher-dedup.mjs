import assert from 'assert';

// Simulated cleanPromoCode & deduplicateVouchers implementation matching DataContext.tsx
const cleanPromoCode = (c) => {
  return (c || '').trim().toUpperCase().replace(/^#+/, '');
};

const deduplicateVouchers = (list) => {
  if (!list || !Array.isArray(list)) return [];
  const codeMap = new Map();
  
  for (const v of list) {
    if (!v) continue;
    const cleanCode = cleanPromoCode(v.code);
    const key = cleanCode ? `CODE:${cleanCode}` : `ID:${v.id}`;
    if (!key) continue;

    const existing = codeMap.get(key);
    if (!existing) {
      codeMap.set(key, v);
    } else {
      const existingUpdated = existing.updatedAt || 0;
      const vUpdated = v.updatedAt || 0;
      if (vUpdated > existingUpdated) {
        codeMap.set(key, { ...existing, ...v });
      } else {
        codeMap.set(key, { ...v, ...existing });
      }
    }
  }

  const finalIdMap = new Map();
  for (const v of codeMap.values()) {
    const existing = finalIdMap.get(v.id);
    if (!existing) {
      finalIdMap.set(v.id, v);
    } else {
      if ((v.updatedAt || 0) > (existing.updatedAt || 0)) {
        finalIdMap.set(v.id, v);
      }
    }
  }

  return Array.from(finalIdMap.values());
};

console.log('Testing Voucher Deduplication Logic...');

// Test 1: Duplicate code with different IDs
const test1 = [
  { id: 'promo-flashsale12', code: 'FLASHSALE12', name: 'flashsale', updatedAt: 100 },
  { id: 'v_1789125300000', code: 'FLASHSALE12', name: 'flashsale (edited)', updatedAt: 200 },
  { id: 'v4', code: 'NEFAKKY10', name: 'Voucher Pelanggan Baru 10%', updatedAt: 100 }
];
const result1 = deduplicateVouchers(test1);
assert.strictEqual(result1.length, 2, 'Should deduplicate FLASHSALE12 to 1 item');
assert.strictEqual(result1.find(v => v.code === 'FLASHSALE12').name, 'flashsale (edited)', 'Should preserve newer version');
console.log('✅ Test 1 Passed: Duplicate code with different IDs deduplicated');

// Test 2: Case sensitivity and # prefix
const test2 = [
  { id: 'v1', code: '#flashsale12', name: 'flashsale' },
  { id: 'v2', code: 'FLASHSALE12', name: 'flashsale' }
];
const result2 = deduplicateVouchers(test2);
assert.strictEqual(result2.length, 1, 'Should normalize # and case');
console.log('✅ Test 2 Passed: Normalization of # and case');

// Test 3: Duplicate ID with different codes
const test3 = [
  { id: 'same-id', code: 'PROMO1', updatedAt: 100 },
  { id: 'same-id', code: 'PROMO2', updatedAt: 200 }
];
const result3 = deduplicateVouchers(test3);
assert.strictEqual(result3.length, 1, 'Should resolve same ID to single item');
console.log('✅ Test 3 Passed: Duplicate ID resolved');

console.log('🎉 All voucher deduplication unit tests passed successfully!');
