import test from 'node:test';
import assert from 'node:assert/strict';
import {positions,tracks} from './data.ts';
import {focusRoles} from './career-focus.ts';
import {promotionStandard} from './promotion-standards.ts';
import {initialData} from './logic.ts';
import {factCatalog,factsInNomination,monthsInRole,nearestPromotion,nominationKind,nominationPassed,tenureShowcases} from './demo-readiness.ts';

const now=new Date('2026-10-16T12:00:00');
const position=(id:string)=>positions.find(item=>item.id===id)!;

test('every current nomination maps to tenure, skill, course, responsible review, or a business fact',()=>{
 const seen=new Set<string>();
 for(const from of positions){
  for(const target of tracks.flatMap(track=>focusRoles(from,track)).map(role=>role.position).filter(item=>item.id!==from.id)){
   const rule=promotionStandard(from,target);
   assert.ok(rule,`${from.id} → ${target.id}`);
   for(const item of rule.nominations){
    if(seen.has(item))continue;
    seen.add(item);
    const kind=nominationKind(item);
    if(kind==='facts')assert.ok(factsInNomination(item).length>0,item);
   }
  }
 }
});

test('demo employees follow the current promotion gates',()=>{
 const data=initialData();
 const advisor=data.employees.find(item=>item.positionId==='2-5')!;
 assert.equal(advisor.since,tenureShowcases['2-5']);
 assert.equal(monthsInRole(advisor.since,now)<3,true);
 const advisorNext=nearestPromotion(position('2-5'))!;
 const advisorRule=promotionStandard(position('2-5'),advisorNext)!;
 const advisorTenure=advisorRule.nominations.find(item=>item.includes('在岗时长'))!;
 assert.equal(nominationPassed(advisor,data.plans[advisor.id],advisorTenure,now),false);
 const advisorHard=advisorRule.nominations.filter(item=>nominationKind(item)!=='tenure'&&nominationKind(item)!=='responsible');
 for(const item of advisorHard)assert.equal(nominationPassed(advisor,data.plans[advisor.id],item,now),nominationKind(item)!=='skill',item.slice(0,40));

 for(const employee of data.employees){
  const number=Number(employee.id.replace(/\D/g,''));
  const role=position(employee.positionId);
  const next=nearestPromotion(role);
  if(!next)continue;
  const rule=promotionStandard(role,next)!;
  const hard=rule.nominations.filter(item=>nominationKind(item)!=='responsible');
  if(tenureShowcases[employee.positionId]){
   assert.equal(hard.filter(item=>nominationKind(item)==='tenure').every(item=>nominationPassed(employee,data.plans[employee.id],item,now)===false),true,employee.positionId);
   continue;
  }
  if(number%2===1){
   for(const item of hard)assert.equal(nominationPassed(employee,data.plans[employee.id],item,now),nominationKind(item)!=='skill',`${employee.id} ${role.name} ${item.slice(0,36)}`);
  }
 }
 const blocked=data.employees.find(employee=>employee.facts&&Object.values(employee.facts).includes(false));
 assert.ok(blocked);
 const missedKey=factCatalog.find(item=>blocked.facts?.[item.key]===false)!.key;
 const blockedRole=position(blocked.positionId);
 const blockedNext=nearestPromotion(blockedRole)!;
 const blockedRule=promotionStandard(blockedRole,blockedNext)!;
 const failing=blockedRule.nominations.find(item=>factsInNomination(item).includes(missedKey));
 assert.ok(failing);
 assert.equal(nominationPassed(blocked,data.plans[blocked.id],failing,now),false);
 blocked.facts![missedKey]=true;
 assert.equal(nominationPassed(blocked,data.plans[blocked.id],failing,now),true);
});
