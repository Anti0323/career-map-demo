import {defaultEmployees,emptyPlan,positionById,skills,tracks,type DemoFacts,type Employee,type Plan,type Position} from './data.ts';
import {focusRoles} from './career-focus.ts';
import {promotionStandard} from './promotion-standards.ts';
import {courseLearningRequirementMet,learningRequirementMet,learningSkillCodes,type AppData} from './logic.ts';

export const factCatalog:{key:keyof DemoFacts;group:'拓展过程'|'店端过程'|'带教与判断';label:string;standard:string}[]=[
 {key:'personalMeeting',group:'拓展过程',label:'个人过会数量',standard:'≥ 目标数 × 时间进度'},
 {key:'teamMeeting',group:'拓展过程',label:'团队过会数量',standard:'≥ 目标数 × 时间进度'},
 {key:'personalMaterials',group:'拓展过程',label:'个人一审资料',standard:'准确度、完整度 ≥ 100%，申诉 ≤ 2 次'},
 {key:'teamMaterials',group:'拓展过程',label:'团队一审资料',standard:'准确度、完整度 ≥ 100%，申诉 ≤ 2 次'},
 {key:'personalPassRate',group:'拓展过程',label:'个人首次过会通过率',standard:'≥ 80%'},
 {key:'teamPassRate',group:'拓展过程',label:'团队首次过会通过率',standard:'≥ 80%'},
 {key:'battlefield',group:'拓展过程',label:'主战场与带人',standard:'已明确下一档主战场，且主战场里已经在带人'},
 {key:'personalBestShop',group:'拓展过程',label:'个人新开最佳铺占比',standard:'近 6 个月达到区域既定目标'},
 {key:'teamBestShop',group:'拓展过程',label:'团队新开最佳铺占比',standard:'近 6 个月达到区域既定目标'},
 {key:'storeCoverage',group:'店端过程',label:'个人巡店覆盖',standard:'按当前序列的门店覆盖标准达标'},
 {key:'teamStoreCoverage',group:'店端过程',label:'团队巡店覆盖',standard:'团队按个人标准覆盖责任门店'},
 {key:'reportQuality',group:'店端过程',label:'个人巡店报告',standard:'填写率、完整率、抽查通过率 ≥ 100%'},
 {key:'teamReportQuality',group:'店端过程',label:'团队巡店报告',standard:'填写率、完整率、抽查通过率 ≥ 100%'},
 {key:'foodSafetyClear',group:'店端过程',label:'食安二错门店',standard:'过去三个月滚动 ≤ 0'},
 {key:'errorRateDown',group:'店端过程',label:'二错比例',standard:'区域或团队二错比例下降'},
 {key:'personalBenchmark',group:'店端过程',label:'个人核心经营指标',standard:'K项、品质、食安不低于大盘，超时订单不高于大盘'},
 {key:'teamBenchmark',group:'店端过程',label:'团队核心经营指标',standard:'团队前三个月均值达到大盘标准'},
 {key:'tasting',group:'店端过程',label:'新品品鉴',standard:'正确率、及时率、审核达标率 ≥ 100%'},
 {key:'profit',group:'店端过程',label:'盈利数据',standard:'每月更新、完整、及时均为 100%'},
 {key:'satisfaction',group:'店端过程',label:'加盟商问卷满意度',standard:'达到分公司既定标准'},
 {key:'coachCertified',group:'带教与判断',label:'督导带教认证',standard:'已完成'},
 {key:'rootCause',group:'带教与判断',label:'问题根因',standard:'巡店时能按问题清单锁定根因'},
 {key:'qualifiedSupervisors',group:'带教与判断',label:'合格营运督导',standard:'≥ 1 名'},
 {key:'storeJudgment',group:'带教与判断',label:'在店判断',standard:'标签明确，并能讲清事实依据'},
 {key:'reviewAndPush',group:'带教与判断',label:'区域复核与推动',standard:'能复核督导的事实和判断，并推动执行'},
 {key:'keepY1Y2',group:'带教与判断',label:'Y1 与 Y2 保持',standard:'持续满足执行巡店和问题发现标准'},
 {key:'coachedL8',group:'带教与判断',label:'培养纯拓 L8',standard:'靠自己带教，培养出能对质量负责的纯拓 L8'},
 {key:'coachedL9',group:'带教与判断',label:'培养营拓 L9',standard:'团队里培养出能对质量负责的营拓 L9'}
];

/** These posts are otherwise ready, and fail only the tenure gate. */
export const tenureShowcases:Record<string,string>={
 '2-5':'2026-09-01',
 '2-7':'2026-06-01',
 '1-8':'2026-06-01'
};

export function monthsInRole(since:string,now=new Date()){
 const start=new Date(`${since}T00:00:00`);
 if(Number.isNaN(start.getTime()))return 0;
 return (now.getFullYear()-start.getFullYear())*12+now.getMonth()-start.getMonth()-(now.getDate()<start.getDate()?1:0);
}

export function reachablePromotions(position:Position){
 return tracks.flatMap(track=>focusRoles(position,track)).map(role=>role.position).filter(target=>target.id!==position.id);
}
export function nearestPromotion(position:Position){
 return reachablePromotions(position).filter(target=>target.track===position.track).sort((a,b)=>a.level-b.level)[0];
}

export type NominationKind='tenure'|'course'|'skill'|'responsible'|'facts';
export function nominationKind(text:string):NominationKind{
 if(/在岗时长≥\s*\d+\s*个月/.test(text))return 'tenure';
 if(text.includes('技能认证与晋升考察同步进行'))return 'course';
 if(/学习.+技能/.test(text))return 'skill';
 if(/联系所在分公司总经理/.test(text))return 'responsible';
 return 'facts';
}

export function factsInNomination(text:string):(keyof DemoFacts)[]{
 const keys: (keyof DemoFacts)[]=[];
 const add=(key:keyof DemoFacts)=>{if(!keys.includes(key))keys.push(key)};
 const teamScope=/^团队/.test(text.trim())||text.includes('团队巡店')||text.includes('团队前三个月');
 const bothScope=text.includes('个人和团队');
 const personal=(key:keyof DemoFacts,teamKey:keyof DemoFacts)=>{
  if(bothScope||!teamScope)add(key);
  if(bothScope||teamScope)add(teamKey);
 };
 if(text.includes('过会数量'))personal('personalMeeting','teamMeeting');
 if(text.includes('资料准确')||text.includes('允许申诉')||/完整度≥/.test(text))personal('personalMaterials','teamMaterials');
 if(text.includes('首次过会通过率'))personal('personalPassRate','teamPassRate');
 if(text.includes('主战场'))add('battlefield');
 if(text.includes('最佳铺'))personal('personalBestShop','teamBestShop');
 if(text.includes('纯拓 L8'))add('coachedL8');
 if(text.includes('营拓 L9'))add('coachedL9');
 if(text.includes('巡店覆盖')||text.includes('团队巡店')||/覆盖率|覆盖≥|每月覆盖/.test(text))personal('storeCoverage','teamStoreCoverage');
 if(text.includes('报告填写')||text.includes('报告完整')||text.includes('抽查通过'))personal('reportQuality','teamReportQuality');
 if(text.includes('食安二错门店'))add('foodSafetyClear');
 if(text.includes('二错比例下降')||text.includes('区域二错'))add('errorRateDown');
 if(text.includes('K项合格率'))add(text.includes('团队')?'teamBenchmark':'personalBenchmark');
 if(text.includes('新品打卡')||text.includes('及时完成率')||text.includes('区域审核率'))add('tasting');
 if(text.includes('盈利数据'))add('profit');
 if(text.includes('督导带教认证'))add('coachCertified');
 if(text.includes('锁定根因'))add('rootCause');
 if(text.includes('问卷满意度'))add('satisfaction');
 if(text.includes('合格营运督导'))add('qualifiedSupervisors');
 if(text.includes('在店判断'))add('storeJudgment');
 if(text.includes('复核督导'))add('reviewAndPush');
 if(text.includes('持续满足 Y1'))add('keepY1Y2');
 return keys;
}

function blankFacts():DemoFacts{
 return Object.fromEntries(factCatalog.map(item=>[item.key,true])) as DemoFacts;
}

export function defaultFacts(employee:Pick<Employee,'id'|'positionId'>):DemoFacts{
 const facts=blankFacts();
 if(tenureShowcases[employee.positionId])return facts;
 const number=Number(employee.id.replace(/\D/g,''))||1;
 if(number%2===1)return facts;
 const position=positionById(employee.positionId);
 const next=position&&nearestPromotion(position);
 const rule=position&&next?promotionStandard(position,next):undefined;
 const used=[...new Set((rule?.nominations??[]).flatMap(factsInNomination))];
 if(!used.length)return facts;
 facts[used[(Math.floor(number/2)-1)%used.length]]=false;
 return facts;
}

export function readFacts(value:unknown,employee:Pick<Employee,'id'|'positionId'>):DemoFacts{
 const facts=defaultFacts(employee);
 if(!value||typeof value!=='object')return facts;
 for(const item of factCatalog){
  const saved=(value as Partial<DemoFacts>)[item.key];
  if(typeof saved==='boolean')facts[item.key]=saved;
 }
 return facts;
}

function prepareSkills(employee:Employee,plan:Plan,from:Position,to:Position){
 const rule=promotionStandard(from,to);
 for(const item of rule?.nominations??[]){
  const codes=learningSkillCodes(item);
  if(!codes?.length||!item.includes('技能认证与晋升考察同步进行'))continue;
  for(const code of codes){
   const skill=skills.find(item=>item.code===code);
   if(!skill||employee.skills[skill.id]?.status==='已认证'||plan.learning[skill.id])continue;
   plan.learning[skill.id]='待认证';
  }
 }
}

export function restoreDemo(id:string){
 const base=defaultEmployees.find(item=>item.id===id);
 return base?prepareDemo(structuredClone(base)):undefined;
}

export function prepareDemo(employee:Employee,plan:Plan=emptyPlan()){
 const nextEmployee=structuredClone(employee);
 const nextPlan=structuredClone(plan);
 const since=tenureShowcases[nextEmployee.positionId];
 if(since)nextEmployee.since=since;
 const position=positionById(nextEmployee.positionId);
 const next=position&&nearestPromotion(position);
 if(position&&next)prepareSkills(nextEmployee,nextPlan,position,next);
 nextEmployee.facts=defaultFacts(nextEmployee);
 return {employee:nextEmployee,plan:nextPlan};
}

export function presentDemo(data:AppData):AppData{
 const plans={...data.plans};
 const employees=data.employees.map(employee=>{
  if(employee.facts)return {...employee,facts:readFacts(employee.facts,employee)};
  const prepared=prepareDemo(employee,plans[employee.id]??emptyPlan());
  plans[employee.id]=prepared.plan;
  return prepared.employee;
 });
 return {...data,schemaVersion:9,employees,plans};
}

export function nominationPassed(employee:Employee,plan:Plan,text:string,now=new Date()){
 const months=text.match(/在岗时长≥\s*(\d+)\s*个月/);
 if(months)return monthsInRole(employee.since,now)>=Number(months[1]);
 const course=courseLearningRequirementMet(employee,plan,text);
 if(course!==undefined)return course;
 const learned=learningRequirementMet(employee,text);
 if(learned!==undefined)return learned;
 if(nominationKind(text)==='responsible')return true;
 const keys=factsInNomination(text);
 if(!keys.length)return false;
 const facts=employee.facts??defaultFacts(employee);
 return keys.every(key=>facts[key]);
}

export function clausePassed(employee:Employee,plan:Plan,detail:string):boolean|undefined{
 if(nominationKind(detail)!=='facts')return nominationPassed(employee,plan,detail);
 const keys=factsInNomination(detail);
 if(!keys.length)return undefined;
 const facts=employee.facts??defaultFacts(employee);
 return keys.every(key=>facts[key]);
}

export type SkillNeed='认证'|'课程';
export function promotionSkillNeeds(position:Position){
 const needs=new Map<string,SkillNeed>();
 for(const target of reachablePromotions(position)){
  const rule=promotionStandard(position,target);
  for(const item of rule?.nominations??[]){
   const codes=learningSkillCodes(item);
   if(!codes?.length)continue;
   const mode:SkillNeed=item.includes('技能认证与晋升考察同步进行')?'课程':'认证';
   for(const code of codes){
    const previous=needs.get(code);
    if(!previous||mode==='认证')needs.set(code,mode);
   }
  }
 }
 return needs;
}

export function relevantFacts(position:Position){
 const used=new Set<keyof DemoFacts>();
 for(const target of reachablePromotions(position)){
  const rule=promotionStandard(position,target);
  for(const item of rule?.nominations??[])for(const key of factsInNomination(item))used.add(key);
 }
 return factCatalog.filter(item=>used.has(item.key));
}

export function nextPromotionPreview(employee:Employee,plan:Plan,now=new Date()){
 const position=positionById(employee.positionId);
 if(!position)return [];
 return reachablePromotions(position).flatMap(target=>{
  const rule=promotionStandard(position,target);
  if(!rule)return [];
  const items=rule.nominations.map(text=>{
   const kind=nominationKind(text);
   const passed=nominationPassed(employee,plan,text,now);
   const months=text.match(/在岗时长≥\s*(\d+)\s*个月/);
   const note=kind==='responsible'?'负责人评估':kind==='tenure'&&months?`在岗 ${Math.max(0,monthsInRole(employee.since,now))} 个月 / 要求 ${months[1]} 个月`:passed?'已满足':'未满足';
   return {text,kind,passed,note,label:text.split('\n')[0].replace(/：$/,'').slice(0,48)};
  });
  const hard=items.filter(item=>item.kind!=='responsible');
  return [{id:target.id,name:target.name,level:target.level,track:target.track,title:rule.title,items,met:hard.filter(item=>item.passed).length,total:hard.length}];
 });
}
