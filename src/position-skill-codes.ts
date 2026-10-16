import type { Position } from './data.ts';

/** Cumulative skill codes a position is expected to hold. Same sequence keeps earlier codes. */
const codesByPosition: Record<string, string> = {
  '0-1': '',
  '0-2': 'Y1',
  '0-3': 'Y1 Y2 S1',
  '0-4': 'Y1 Y2 Y3 S1 S3',
  '0-5': 'Y1 Y2 Y3 Y4-1 S1 S3 S4-1 M1',
  '0-6': 'Y1 Y2 Y3 Y4-1 Y4-2 S1 S3 S4-1 S4-2 M1',
  '0-7': 'Y1 Y2 Y3 Y4-1 Y4-2 Y4-3 S1 S3 S4-1 S4-2 S4-3 M1 M2',
  '0-8': 'Y1 Y2 Y3 Y4-1 Y4-2 Y4-3 Y5 S1 S3 S4-1 S4-2 S4-3 S5 M1 M2',
  '0-9': 'Y1 Y2 Y3 Y4-1 Y4-2 Y4-3 Y5 S1 S3 S4-1 S4-2 S4-3 S5 M1 M2',
  '0-10': 'Y1 Y2 Y3 Y4-1 Y4-2 Y4-3 Y5 S1 S3 S4-1 S4-2 S4-3 S5 M1 M2',
  '0-11': 'Y1 Y2 Y3 Y4-1 Y4-2 Y4-3 Y5 S1 S3 S4-1 S4-2 S4-3 S5 M1 M2',
  '1-3': 'Y1 S1 T1',
  '1-4': 'Y1 Y2 S1 T1 T2',
  '1-5': 'Y1 Y2 Y3 S1 S3 T1 T2 T3',
  '1-6': 'Y1 Y2 Y3 Y4-1 S1 S3 S4-1 T1 T2 T3 T4 M1',
  '1-7': 'Y1 Y2 Y3 Y4-1 Y4-2 S1 S3 S4-1 S4-2 T1 T2 T3 T4 T5 M1',
  '1-8': 'Y1 Y2 Y3 Y4-1 Y4-2 Y4-3 S1 S3 S4-1 S4-2 S4-3 T1 T2 T3 T4 T5 M1 M2',
  '1-9': 'Y1 Y2 Y3 Y4-1 Y4-2 Y4-3 S1 S3 S4-1 S4-2 S4-3 T1 T2 T3 T4 T5 M1 M2',
  '1-10': 'Y1 Y2 Y3 Y4-1 Y4-2 Y4-3 Y5 S1 S3 S4-1 S4-2 S4-3 S5 T1 T2 T3 T4 T5 T6 M1 M2',
  '1-11': 'Y1 Y2 Y3 Y4-1 Y4-2 Y4-3 Y5 S1 S3 S4-1 S4-2 S4-3 S5 T1 T2 T3 T4 T5 T6 M1 M2',
  '1-12': 'Y1 Y2 Y3 Y4-1 Y4-2 Y4-3 Y5 S1 S3 S4-1 S4-2 S4-3 S5 T1 T2 T3 T4 T5 T6 M1 M2',
  '2-5': 'S3 T1 T2 T3',
  '2-6': 'S3 S4-1 T1 T2 T3 T4 M1',
  '2-7': 'S3 S4-1 S4-2 T1 T2 T3 T4 T5 M1',
  '2-8': 'S3 S4-1 S4-2 S4-3 T1 T2 T3 T4 T5 M1 M2',
  '2-9': 'S3 S4-1 S4-2 S4-3 S5 T1 T2 T3 T4 T5 T6 M1 M2',
  '2-10': 'S3 S4-1 S4-2 S4-3 S5 T1 T2 T3 T4 T5 T6 M1 M2',
  '2-11': 'S3 S4-1 S4-2 S4-3 S5 T1 T2 T3 T4 T5 T6 M1 M2',
  '2-12': 'S3 S4-1 S4-2 S4-3 S5 T1 T2 T3 T4 T5 T6 M1 M2',
};

const chains = [
  ['Y1', 'Y2', 'Y3', 'Y4-1', 'Y4-2', 'Y4-3', 'Y5'],
  ['S1', 'S3', 'S4-1', 'S4-2', 'S4-3', 'S5'],
  ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
  ['M1', 'M2'],
];
const previousCode = new Map(chains.flatMap(chain => chain.slice(1).map((code, index) => [code, chain[index]] as const)));

export function theoreticalSkillCodes(position: Position): string[] {
  return (codesByPosition[position.id] || '').split(' ').filter(Boolean);
}

export type SkillEvolutionStep = { code: string; from?: string };

/** New target skills, each paired with the previous step when the current role already holds it. */
export function skillEvolutionSteps(current: Position, target: Position): SkillEvolutionStep[] {
  const currentSet = new Set(theoreticalSkillCodes(current));
  return theoreticalSkillCodes(target).filter(code => !currentSet.has(code)).map(code => {
    const from = previousCode.get(code);
    return from && currentSet.has(from) ? { code, from } : { code };
  });
}
