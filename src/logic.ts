import {defaultEmployees,emptyPlan,heldSkills,positions,requirements,skills,type Employee,type Plan,type Position,type Requirement,type SkillRecord,type Level} from './data.ts';
import {theoreticalSkillCodes} from './position-skill-codes.ts';
import {canDevelopTo,roleCategory} from './career-focus.ts';
import {presentDemo,readFacts} from './demo-readiness.ts';
export type AppData={schemaVersion:9;employees:Employee[];plans:Record<string,Plan>};
export const STORAGE_KEY='goodme.career-map.demo.v6';
const legacySkillIds:Record<string,string>={'skill-001':'skill-y1','skill-002':'skill-y1','skill-003':'skill-y1','skill-004':'skill-y2','skill-005':'skill-y3','skill-006':'skill-y4-1','skill-007':'skill-y5','skill-008':'skill-s1','skill-009':'skill-s3','skill-010':'skill-s3','skill-011':'skill-s4-1','skill-012':'skill-s5','skill-016':'skill-m1','skill-017':'skill-m2','skill-026':'skill-y3','skill-027':'skill-s5','skill-028':'skill-t1','skill-029':'skill-t1','skill-030':'skill-t2','skill-031':'skill-t3','skill-032':'skill-t4','skill-033':'skill-t5','skill-034':'skill-t6','skill-035':'skill-s4-1'};
const migrateSkillId=(id:string)=>legacySkillIds[id]||id;
export const initialData=():AppData=>presentDemo({schemaVersion:9,employees:structuredClone(defaultEmployees),plans:Object.fromEntries(defaultEmployees.map(e=>[e.id,emptyPlan()]))});
const codeBySkillId=new Map(skills.map(skill=>[skill.id,skill.code]));
function migrateHeldSkills(positionId:string,since:string,saved:Employee['skills'],dropBeyondPosition:boolean):Employee['skills']{
 if(!dropBeyondPosition)return saved;
 const role=positions.find(item=>item.id===positionId);
 if(!role)return saved;
 const allowed=new Set(theoreticalSkillCodes(role));
 const kept=Object.fromEntries(Object.entries(saved).filter(([id])=>allowed.has(codeBySkillId.get(id)||'')));
 return {...heldSkills(role,since),...kept};
}
export function sanitizeData(value:unknown):AppData{
 const fallback=initialData(); if(!value||typeof value!=='object')return fallback;
 const raw=value as {schemaVersion?:number;employees?:Employee[];plans?:AppData['plans']};if(![6,7,8,9].includes(raw.schemaVersion??0)||!Array.isArray(raw.employees))return fallback;
 const employeeIds=new Set(defaultEmployees.map(e=>e.id)); const positionIds=new Set(positions.map(p=>p.id));const skillIds=new Set(skills.map(s=>s.id));
 const employees=defaultEmployees.map(def=>{const saved=raw.employees?.find(e=>e?.id===def.id);if(!saved)return fallback.employees.find(e=>e.id===def.id)!;const migrated=Object.fromEntries(Object.entries(saved.skills||{}).map(([id,record])=>[migrateSkillId(id),record] as [string,SkillRecord]).filter(([id,r])=>skillIds.has(id)&&r&&['未认证','认证中','已认证'].includes(r.status)&&(!r.level||[1,2,3].includes(r.level))));const positionId=positionIds.has(saved.positionId)?saved.positionId:def.positionId;const since=typeof saved.since==='string'?saved.since:def.since;return {...def,name:def.name,branch:typeof saved.branch==='string'?saved.branch:def.branch,positionId,since,skills:migrateHeldSkills(positionId,since,migrated,raw.schemaVersion!==9),metrics:saved.metrics&&typeof saved.metrics==='object'?saved.metrics:def.metrics,facts:readFacts(saved.facts,{id:def.id,positionId})}});
 const plans:Record<string,Plan>={};for(const id of employeeIds){const saved=raw.plans?.[id];const favorites=Array.isArray(saved?.favoriteSkills)?saved.favoriteSkills.map(migrateSkillId).filter(x=>skillIds.has(x)):[];const learning=Object.fromEntries(Object.entries(saved?.learning||{}).map(([key,value])=>[migrateSkillId(key),value]).filter(([key,v])=>skillIds.has(key)&&['计划学习','学习中','待认证'].includes(v)));plans[id]={goalId:saved?.goalId&&positionIds.has(saved.goalId)?saved.goalId:undefined,favoritePositions:Array.isArray(saved?.favoritePositions)?saved.favoritePositions.filter(x=>positionIds.has(x)):[],favoriteSkills:[...new Set(favorites)],learning}}return {schemaVersion:9,employees,plans};
}
export function readData():AppData{try{return sanitizeData(JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'))}catch{return initialData()}}
export function writeData(data:AppData):boolean{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));return true}catch{return false}}
export type SkillGap={requirement:Requirement;record?:SkillRecord;state:'已达到'|'待提升'|'认证中'|'未认证'|'待确认';missing:boolean};
const certifiable=(skillId:string)=>skills.find(skill=>skill.id===skillId)?.group!=='软性素质';
export function skillGaps(employee:Employee,position:Position):SkillGap[]{return requirements.filter(r=>r.positionId===position.id&&certifiable(r.skillId)).map(requirement=>{const record=employee.skills[requirement.skillId];let state:SkillGap['state']='未认证';if(!requirement.confirmed)state='待确认';else if(record?.status==='认证中')state='认证中';else if(record?.status==='已认证')state=(record.level||0)>=requirement.level?'已达到':'待提升';return {requirement,record,state,missing:!record||record.status!=='已认证'||(record.level||0)<requirement.level}})}
export function demoGaps(employee:Employee,position:Position):SkillGap[]{return skillGaps(employee,position).map(g=>{if(g.state!=='待确认')return g;const r=g.record;return {...g,state:r?.status==='已认证'?((r.level||0)>=g.requirement.level?'已达到':'待提升'):r?.status==='认证中'?'认证中':'未认证'} as SkillGap})}
export type RequirementDelta={skillId:string;before?:Level;after?:Level;beforeRaw?:string;afterRaw?:string;type:'共通'|'新增'|'层次提升'|'层次降低'|'要求变化'|'不适用'};
export function comparePositions(from:Position,to:Position):RequirementDelta[]{
 const a=new Map(requirements.filter(r=>r.positionId===from.id&&certifiable(r.skillId)).map(r=>[r.skillId,r]));
 const b=new Map(requirements.filter(r=>r.positionId===to.id&&certifiable(r.skillId)).map(r=>[r.skillId,r]));
 return [...new Set([...a.keys(),...b.keys()])].map(skillId=>{
  const first=a.get(skillId),second=b.get(skillId);
  const type:RequirementDelta['type']=!first?'新增':!second?'不适用':first.kind!==second.kind?'要求变化':first.comparable&&second.comparable&&second.level>first.level?'层次提升':first.comparable&&second.comparable&&second.level<first.level?'层次降低':first.raw!==second.raw?'要求变化':'共通';
  return {skillId,before:first?.level,after:second?.level,beforeRaw:first?.raw,afterRaw:second?.raw,type};
 });
}
export function routeInfo(from:Position,to:Position):{kind:'同序列'|'转岗探索'|'无晋升路径'|'当前岗位';description:string}{
 if(from.id===to.id)return {kind:'当前岗位',description:'当前岗位：可查看岗位职责与能力准备情况。'};
 const step=to.level-from.level;
 if(canDevelopTo(from,to)){
  if(from.track===to.track){const crossed=roleCategory(from)!==roleCategory(to);return {kind:'同序列',description:crossed?`沿${from.track}路径进入${roleCategory(to)}角色的起始岗位；跨角色时只能进入第一级。`:`沿${from.track}路径在${roleCategory(from)}角色内晋升 ${step} 级；具体考察标准请以下方岗位要求为准。`};}
  return {kind:'转岗探索',description:`从${from.track}转入营拓一体，并在${roleCategory(from)}角色范围内晋升 ${step} 级；转岗不跨角色大类。`};
 }
 return {kind:'无晋升路径',description:'该岗位不在当前可发展范围内，仍可浏览岗位职责与技能标准。'};
}
export function accessibleSummary(employee:Employee,position:Position){const gaps=skillGaps(employee,position);const confirmed=gaps.filter(x=>x.requirement.confirmed&&x.requirement.kind==='必备'&&['门店营运','加盟商发展','点位拓展','团队管理'].includes(skills.find(s=>s.id===x.requirement.skillId)?.group||''));return {met:confirmed.filter(x=>x.state==='已达到').length,count:confirmed.length,unknown:gaps.filter(x=>!x.requirement.confirmed).length,excluded:gaps.length-confirmed.length-gaps.filter(x=>!x.requirement.confirmed).length}}

const skillCodePattern=/[YTSM]\d+(?:-\d+)?/g;

/** Skill codes named by a transfer learning requirement, such as “学习…拓展技能 T1、T2”. */
export function learningSkillCodes(text:string):string[]|undefined{
 if(!/学习.+技能/.test(text))return undefined;
 return [...text.matchAll(skillCodePattern)].map(match=>match[0]);
}

export function certifiedSkillCodes(employee:Employee):Set<string>{
 const certified=new Set<string>();
 for(const [id,record] of Object.entries(employee.skills)){
  if(record?.status!=='已认证')continue;
  const code=skills.find(skill=>skill.id===id)?.code;
  if(code)certified.add(code);
 }
 return certified;
}

/** Whether every skill named in a learning requirement is already certified. Other requirements return undefined. */
export function learningRequirementMet(employee:Employee,text:string):boolean|undefined{
 const codes=learningSkillCodes(text);
 if(!codes?.length)return undefined;
 const certified=certifiedSkillCodes(employee);
 return codes.every(code=>certified.has(code));
}

/** Expansion skills only require completed coursework before submission; certification happens during promotion review. */
export function courseLearningRequirementMet(employee:Employee,plan:Plan,text:string):boolean|undefined{
 if(!text.includes('技能认证与晋升考察同步进行'))return undefined;
 const codes=learningSkillCodes(text);
 if(!codes?.length)return undefined;
 const certified=certifiedSkillCodes(employee);
 return codes.every(code=>{
  if(certified.has(code))return true;
  const skillId=skills.find(skill=>skill.code===code)?.id;
  return !!skillId&&plan.learning[skillId]==='待认证';
 });
}

/** Stable development-only readiness data: odd-numbered employees pass, even-numbered employees fail one check. */
export function demoPromotionResults(employeeId:string,checkCount:number):boolean[]{
 const count=Math.max(0,Math.floor(checkCount));
 const employeeNumber=Number(employeeId.replace(/\D/g,''))||1;
 if(employeeNumber%2===1)return Array.from({length:count},()=>true);
 const failedIndex=Math.floor(employeeNumber/2-1)%Math.max(1,count);
 return Array.from({length:count},(_,index)=>index!==failedIndex);
}
