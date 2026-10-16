import test from 'node:test';
import assert from 'node:assert/strict';
import {abilityAxes,abilityProfile} from './ability.ts';
import {defaultEmployees,positionById,positions,tracks} from './data.ts';
import {theoreticalSkillCodes} from './position-skill-codes.ts';

test('three axes use the skill ladders as their scales',()=>{
 const employee=defaultEmployees[0];
 const current=abilityProfile(employee,positionById('0-4')!);
 const target=abilityProfile(employee,positionById('1-7')!);
 assert.deepEqual(current.map(axis=>axis.key),['营运','加盟商发展','拓展']);
 assert.deepEqual(current.map(axis=>axis.max),[7,6,6]);
 assert.deepEqual(current.map(axis=>axis.current),target.map(axis=>axis.current));
 assert.notDeepEqual(current.map(axis=>axis.target),target.map(axis=>axis.target));
 assert.deepEqual(current.map(axis=>axis.target),[3,2,0]);
 assert.deepEqual(target.map(axis=>axis.target),[5,4,5]);
 assert.ok(current.every(axis=>axis.current<=axis.max&&axis.target<=axis.max));
});
test('senior integrated roles cover all three ladders',()=>{
 const profile=abilityProfile(defaultEmployees[0],positionById('1-11')!);
 assert.deepEqual(profile.map(axis=>axis.target),[7,6,6]);
 assert.ok(profile.every(axis=>axis.target===axis.max));
});
test('entry integrated roles start above zero on all three axes',()=>{
 const profile=abilityProfile(defaultEmployees[0],positionById('1-3')!);
 assert.ok(profile.every(axis=>axis.target>0));
});
test('senior expansion roles are strong on franchise development',()=>{
 for(const id of ['2-9','2-10','2-11','2-12']){
  const profile=abilityProfile(defaultEmployees[0],positionById(id)!);
  const operations=profile.find(axis=>axis.key==='营运')!;
  const franchise=profile.find(axis=>axis.key==='加盟商发展')!;
  const expansion=profile.find(axis=>axis.key==='拓展')!;
  assert.equal(operations.target,0,id);
  assert.equal(franchise.target,franchise.max,id);
  assert.equal(expansion.target,expansion.max,id);
 }
});
test('every position contour matches its skill codes',()=>{
 for(const position of positions){
  const codes=new Set(theoreticalSkillCodes(position));
  const profile=abilityProfile(defaultEmployees[0],position);
  for(const axis of abilityAxes){
   const ladder=axis.key==='加盟商发展'&&position.track==='拓展'?axis.codes.filter(code=>code!=='S1'):axis.codes;
   const expected=ladder.filter(code=>codes.has(code)).length;
   const actual=profile.find(item=>item.key===axis.key)!;
   assert.equal(actual.target,expected,`${position.name} ${axis.key}`);
   assert.equal(actual.max,ladder.length);
  }
 }
});
test('every position has a stable target profile independent from employee',()=>{
 for(const position of positions){
  const first=abilityProfile(defaultEmployees[0],position).map(axis=>axis.target);
  const second=abilityProfile(defaultEmployees.at(-1)!,position).map(axis=>axis.target);
  assert.deepEqual(first,second,position.name);
  assert.ok(abilityProfile(defaultEmployees[0],position).every(axis=>axis.target>=0&&axis.target<=axis.max),position.name);
 }
});
test('all position paths rise monotonically and senior roles reach the ladder top',()=>{
 for(const track of tracks){
  const path=positions.filter(position=>position.track===track).sort((a,b)=>a.level-b.level);
  const scores=path.map(position=>abilityProfile(defaultEmployees[0],position).map(axis=>axis.target));
  for(let index=1;index<scores.length;index++){
   scores[index].forEach((score,axis)=>assert.ok(score>=scores[index-1][axis],`${track} ${path[index].name}`));
  }
 }
 const integratedTop=abilityProfile(defaultEmployees[0],positionById('1-12')!);
 assert.deepEqual(integratedTop.map(axis=>axis.target),integratedTop.map(axis=>axis.max));
 const operationsTop=abilityProfile(defaultEmployees[0],positionById('0-8')!);
 assert.deepEqual(operationsTop.map(axis=>axis.target),[7,6,0]);
});
test('there is exactly one ready-to-switch virtual employee for every position',()=>{
 assert.equal(defaultEmployees.length,positions.length);
 assert.deepEqual(new Set(defaultEmployees.map(employee=>employee.positionId)),new Set(positions.map(position=>position.id)));
});
