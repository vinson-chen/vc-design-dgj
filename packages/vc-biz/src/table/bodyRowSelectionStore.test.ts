import { describe, expect, it } from 'vitest';
import { BodyRowSelectionStore } from './bodyRowSelectionStore';

describe('BodyRowSelectionStore', () => {
  it('applyShiftAwareBodyRowSet without shift records anchor', () => {
    const s = new BodyRowSelectionStore();
    s.setBodyRowCount(5);
    s.applyShiftAwareBodyRowSet(2, false, true);
    expect(s.getRow(2)).toBe(true);
    expect(s.getCheckedCount()).toBe(1);
  });

  it('Shift+click applies target state to inclusive range from anchor', () => {
    const s = new BodyRowSelectionStore();
    s.setBodyRowCount(6);
    s.applyShiftAwareBodyRowSet(1, false, true);
    s.applyShiftAwareBodyRowSet(4, true, true);
    expect(s.getRow(0)).toBe(false);
    expect(s.getRow(1)).toBe(true);
    expect(s.getRow(2)).toBe(true);
    expect(s.getRow(3)).toBe(true);
    expect(s.getRow(4)).toBe(true);
    expect(s.getRow(5)).toBe(false);
  });

  it('Shift+click can clear a range (反选成未选)', () => {
    const s = new BodyRowSelectionStore();
    s.setBodyRowCount(5);
    s.toggleAll(true);
    s.applyShiftAwareBodyRowSet(1, false, false);
    s.applyShiftAwareBodyRowSet(3, true, false);
    expect(s.getCheckedCount()).toBe(2);
    expect(s.getRow(0)).toBe(true);
    expect(s.getRow(1)).toBe(false);
    expect(s.getRow(2)).toBe(false);
    expect(s.getRow(3)).toBe(false);
    expect(s.getRow(4)).toBe(true);
  });

  it('Shift with no anchor behaves as single row', () => {
    const s = new BodyRowSelectionStore();
    s.setBodyRowCount(4);
    s.applyShiftAwareBodyRowSet(2, true, true);
    expect(s.getCheckedCount()).toBe(1);
    expect(s.getRow(2)).toBe(true);
  });

  it('toggleAll clears shift anchor', () => {
    const s = new BodyRowSelectionStore();
    s.setBodyRowCount(4);
    s.applyShiftAwareBodyRowSet(0, false, true);
    s.toggleAll(false);
    s.applyShiftAwareBodyRowSet(3, true, true);
    expect(s.getCheckedCount()).toBe(1);
    expect(s.getRow(3)).toBe(true);
  });

  it('remapAfterDeleteBodyRow adjusts anchor index', () => {
    const s = new BodyRowSelectionStore();
    s.setBodyRowCount(4);
    s.applyShiftAwareBodyRowSet(2, false, true);
    s.remapAfterDeleteBodyRow(0);
    s.applyShiftAwareBodyRowSet(2, true, true);
    expect(s.getRow(0)).toBe(false);
    expect(s.getRow(1)).toBe(true);
    expect(s.getRow(2)).toBe(true);
  });
});
