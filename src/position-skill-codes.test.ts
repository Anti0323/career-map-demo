import test from 'node:test';
import assert from 'node:assert/strict';
import { positions } from './data.ts';
import { skillEvolutionSteps, theoreticalSkillCodes } from './position-skill-codes.ts';

const p = (id: string) => positions.find(item => item.id === id)!;

test('初级营运大区经理 holds the full Y and S ladder', () => {
  assert.deepEqual(theoreticalSkillCodes(p('0-8')), ['Y1', 'Y2', 'Y3', 'Y4-1', 'Y4-2', 'Y4-3', 'Y5', 'S1', 'S3', 'S4-1', 'S4-2', 'S4-3', 'S5', 'M1', 'M2']);
});

test('team management starts at the stated rank on each track', () => {
  const codes = (id: string) => theoreticalSkillCodes(p(id));
  assert.deepEqual(codes('0-4').filter(code => code.startsWith('M')), []);
  assert.deepEqual(codes('0-5').filter(code => code.startsWith('M')), ['M1']);
  assert.deepEqual(codes('0-7').filter(code => code.startsWith('M')), ['M1', 'M2']);
  assert.deepEqual(codes('1-5').filter(code => code.startsWith('M')), []);
  assert.deepEqual(codes('1-6').filter(code => code.startsWith('M')), ['M1']);
  assert.deepEqual(codes('1-8').filter(code => code.startsWith('M')), ['M1', 'M2']);
  assert.deepEqual(codes('2-5').filter(code => code.startsWith('M')), []);
  assert.deepEqual(codes('2-6').filter(code => code.startsWith('M')), ['M1']);
  assert.deepEqual(codes('2-8').filter(code => code.startsWith('M')), ['M1', 'M2']);
});

test('area-manager promotion shows the previous skill evolving into the next one', () => {
  assert.deepEqual(skillEvolutionSteps(p('0-4'), p('0-5')), [
    { code: 'Y4-1', from: 'Y3' },
    { code: 'S4-1', from: 'S3' },
    { code: 'M1' },
  ]);
});

test('the next rank pairs with the skill just held', () => {
  assert.deepEqual(skillEvolutionSteps(p('0-5'), p('0-6')), [
    { code: 'Y4-2', from: 'Y4-1' },
    { code: 'S4-2', from: 'S4-1' },
  ]);
});

test('higher ranks with the same ladder have nothing new to show', () => {
  assert.deepEqual(skillEvolutionSteps(p('0-8'), p('0-11')), []);
});

test('a move into expansion skills has no previous skill to pair', () => {
  assert.deepEqual(skillEvolutionSteps(p('0-4'), p('1-5')), [
    { code: 'T1' },
    { code: 'T2' },
    { code: 'T3' },
  ]);
});
