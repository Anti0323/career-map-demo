import CareerOrbit from './CareerOrbit';
import CareerHome from './CareerHome';
import MySkills from './MySkills';
import AbilityRadar from './AbilityRadar';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {emptyPlan,heldSkills,levelLabel,positionById,positions,requirements,skills,tracks,type Employee,type Level,type Plan,type Position,type SkillGroup,type Status} from './data';
import {focusRoles,promotionOutOfScope} from './career-focus';
import {initialData,readData,writeData,type AppData,type SkillGap} from './logic';
import {clausePassed,nominationPassed,restoreDemo} from './demo-readiness';
import DemoSettings from './DemoSettings';
import {promotionFlow,promotionStandard,type PromotionStandard} from './promotion-standards';
import {skillEvolutionSteps,theoreticalSkillCodes} from './position-skill-codes';
import './styles.css';
type RequirementRun={key:string;step:number;results:boolean[];responsiblePassed:boolean[]};
const requirementListeners=new Set<()=>void>();
let requirementRun:RequirementRun|null=null;
let requirementTimer=0;
const emitRequirement=()=>{requirementListeners.forEach(listener=>listener())};
function stepRequirement(){
 if(!requirementRun||requirementRun.step>=requirementRun.results.length)return;
 requirementRun={...requirementRun,step:requirementRun.step+1};
 emitRequirement();
 if(requirementRun.step<requirementRun.results.length)requirementTimer=window.setTimeout(stepRequirement,100);
}
const requirementEvalStore={
 subscribe(listener:()=>void){requirementListeners.add(listener);return()=>{requirementListeners.delete(listener)}},
 get(){return requirementRun},
 clear(){window.clearTimeout(requirementTimer);if(!requirementRun)return;requirementRun=null;emitRequirement()},
 start(next:RequirementRun){window.clearTimeout(requirementTimer);requirementRun=next;emitRequirement();if(next.step<next.results.length)requirementTimer=window.setTimeout(stepRequirement,100)}
};
const groups:SkillGroup[]=['门店营运','加盟商发展','点位拓展','团队管理','通用能力'];
const skillLadder=['Y1','Y2','Y3','Y4-1','Y4-2','Y4-3','Y5','S1','S3','S4-1','S4-2','S4-3','S5','T1','T2','T3','T4','T5','T6','M1','M2'];
const getSkill=(id:string)=>skills.find(s=>s.id===id)!;
const cleanSkillDescription=(value:string)=>value.replace(/^\s*●\s*/,'').replace(/\n\s*●\s*/g,'；').replace(/\n\s*/g,'').trim();
const displayField=(value:string,fallback:string)=>!value||value==='/'||value.includes('资料未提供')?fallback:value;
const assessmentFor=(skill:typeof skills[number],position:Position)=>displayField(skill.assessments[position.track]||skill.assessment,'方式待补充').replace(/\s*\+\s*/g,'、');
const progressionTerms=new Set(['了解','熟知','提出','复核','判断','推动','落地','解决','改善','规划','带教','独立']);
const splitDutyItems=(items:string[])=>items.flatMap(item=>item.split(/\s*●\s*/).map(part=>part.replace(/\s*\n\s*/g,'').trim()).filter(Boolean));
const splitBulletItems=(items:string[])=>items.flatMap(item=>item.split(/●/).map(part=>part.replace(/\s*\n\s*/g,'').trim()).filter(Boolean));
const ProgressionText=({text}:{text:string})=><>{text.split(/(了解|熟知|提出|复核|判断|推动|落地|解决|改善|规划|带教|独立)/g).map((part,index)=>progressionTerms.has(part)?<strong className="progression-keyword" key={`${part}-${index}`}>{part}</strong>:part)}</>;
const CodeBadge=({code}:{code:string})=><span className={`code-badge ${code==='无编码'?'uncoded':''}`}>{code==='无编码'?'未编码':code}</span>;
const Toggle=({on,children,onClick}:{on:boolean;children:React.ReactNode;onClick:()=>void})=><button type="button" className={`seg ${on?'active':''}`} onClick={onClick}>{children}</button>;
const EmployeeOptions=({employees,showPosition=false}:{employees:Employee[];showPosition?:boolean})=><>{tracks.map(track=><optgroup label={track} key={track}>{employees.filter(item=>positionById(item.positionId)?.track===track).map(item=>{const role=positionById(item.positionId);return <option value={item.id} key={item.id}>{item.name}{showPosition&&role?` · L${role.level} ${role.name}`:''}</option>})}</optgroup>)}</>;
const requirementTitle=(text:string)=>{
 const rules:[RegExp,string][]=[
  [/学习.*拓展技能/,'拓展技能'],[/学习.*营运技能/,'营运技能'],[/学习.*加盟商发展技能/,'加盟商发展'],[/在职时间|在岗时长/,'任职时间'],[/过会数量/,'过会进度'],[/资料准确|报告填写|报告完整|抽查通过/,'资料与报告质量'],[/首次过会通过率/,'首次过会通过率'],[/主战场|在带人/,'主战场与带教'],[/巡店覆盖/,'巡店覆盖'],[/食安|二错门店/,'食品安全'],[/K项|品质合格率|超时订单/,'核心经营指标'],[/新品打卡|品鉴/,'新品品鉴'],[/盈利数据/,'盈利数据'],[/带教|培养/,'人才带教'],[/最佳铺/,'最佳铺表现'],[/联系所在分公司总经理/,'负责人评估']
 ];
 return rules.find(([pattern])=>pattern.test(text))?.[1]??'提报要求';
};
const isResponsibleRequirement=(text:string)=>/联系所在分公司总经理|负责人评估|总部高层综合评估/.test(text);
const requirementDetails=(text:string)=>{
 const parts=text.split(/\n|；/).map(part=>part.trim().replace(/[。；]$/,'')).filter(Boolean).map((part,index)=>{
  const colon=part.indexOf('：');
  return index===0&&colon>=0?part.slice(colon+1).trim():part;
 }).filter(Boolean);
 return parts.reduce<string[]>((details,part)=>{
  const scenario=part.match(/^(营拓|纯营)/)?.[1];
  const previous=details.at(-1);
  if(scenario&&previous?.startsWith(scenario)){details[details.length-1]=`${previous}；${part}`;return details}
  details.push(part);
  return details;
 },[]);
};
function App(){
 const [data,setData]=useState<AppData>(readData);const [employeeId,setEmployeeId]=useState('e1');const employee=data.employees.find(e=>e.id===employeeId)||data.employees[0];const plan=data.plans[employee.id]||{favoritePositions:[],favoriteSkills:[],learning:{}} as Plan;const current=positionById(employee.positionId)!;
 const nextRoles=[current.track,...tracks.filter(track=>track!==current.track)].flatMap(track=>focusRoles(current,track)).filter(role=>role.position.id!==current.id);const defaultTarget=nextRoles[0]?.position||current;
 const [page,setPage]=useState<'home'|'map'|'skills'|'list'|'settings'>('home');const [mobileMoreOpen,setMobileMoreOpen]=useState(false);const [selectedId,setSelectedId]=useState(defaultTarget.id);const selected=positionById(selectedId)||defaultTarget;
 const [skillId,setSkillId]=useState<string>();const [mobileDetail,setMobileDetail]=useState(false);const [notice,setNotice]=useState('');const [storageOK,setStorageOK]=useState(true);const [promotionDialog,setPromotionDialog]=useState(false);const [promotionMode,setPromotionMode]=useState<'submit'|'review'>('submit');const [dialogSession,setDialogSession]=useState(0);const [dialogInitialStep,setDialogInitialStep]=useState(0);const [promotionResults,setPromotionResults]=useState<boolean[]>([]);const [promotionStates,setPromotionStates]=useState<Record<string,'evaluating'|'not-ready'>>({});const [promotionSubmitted,setPromotionSubmitted]=useState<Record<string,true>>({});const [confirmSubmit,setConfirmSubmit]=useState(false);const [submitGate,setSubmitGate]=useState<{title:string;detail:string}|null>(null);const detailRef=useRef<HTMLElement>(null);const lastSkillButton=useRef<HTMLElement|null>(null);
 useEffect(()=>{setStorageOK(writeData(data))},[data]);
 useEffect(()=>{window.scrollTo({top:0,behavior:'auto'})},[page]);
 useEffect(()=>{setSelectedId(defaultTarget.id);setMobileDetail(false)},[employeeId,current.id,defaultTarget.id]);
 useEffect(()=>{detailRef.current?.scrollTo({top:0,behavior:'auto'})},[selectedId]);
 useEffect(()=>{if(!skillId)return;function esc(e:KeyboardEvent){if(e.key==='Escape')setSkillId(undefined)}document.addEventListener('keydown',esc);return()=>document.removeEventListener('keydown',esc)},[skillId]);
 useEffect(()=>{if(!skillId&&lastSkillButton.current)lastSkillButton.current.focus()},[skillId]);
 const promotionRule=promotionStandard(current,selected);const promotionChecks=(promotionRule?.nominations??[]).map((detail,index)=>({title:`提报要求 ${index+1}`,detail}));
 useEffect(()=>{setPromotionDialog(false);setConfirmSubmit(false);setSubmitGate(null)},[selectedId,employee.id]);
 const updateEmployee=(patch:Partial<Employee>)=>setData(prev=>({...prev,employees:prev.employees.map(e=>{if(e.id!==employee.id)return e;const role=patch.positionId?positionById(patch.positionId):undefined;const acquired=role?heldSkills(role,new Date().toLocaleDateString('en-CA')):{};return {...e,...patch,skills:patch.skills||{...e.skills,...acquired}}})}));
 const updatePlan=(patch:Partial<Plan>)=>setData(prev=>({...prev,plans:{...prev.plans,[employee.id]:{...(prev.plans[employee.id]??emptyPlan()),...patch}}}));
 const flash=(message:string)=>{setNotice(message);window.setTimeout(()=>setNotice(''),3500)};
 const promotionKey=`${employee.id}:${selected.id}`;const promotionState=promotionStates[promotionKey];
 const promotionInProcess=!!promotionSubmitted[promotionKey];
 const requestPromotion=()=>{
  const otherKey=Object.keys(promotionSubmitted).find(key=>key.startsWith(`${employee.id}:`)&&key!==promotionKey);
  if(otherKey){
   const otherName=positionById(otherKey.slice(employee.id.length+1))?.name??'其他岗位';
   setSubmitGate(plan.goalId===selected.id
    ?{title:'请先取消已有提报',detail:`你已提报「${otherName}」。请先取消该提报，再为「${selected.name}」重新提报。`}
    :{title:'请先处理已有提报',detail:`你已提报「${otherName}」。请先取消该提报，再把「${selected.name}」设为发展目标，然后重新提报。`});
   return;
  }
  if(plan.goalId!==selected.id){setSubmitGate({title:'请先设为发展目标',detail:`提报晋升前，需要先把「${selected.name}」设为发展目标。同一时间只能设置一个发展目标。`});return}
  setConfirmSubmit(true);
 };
 useEffect(()=>{requirementEvalStore.clear()},[promotionKey]);
 const openPromotionDialog=(mode:'submit'|'review',initialStep=0)=>{setPromotionMode(mode);setDialogInitialStep(initialStep);setDialogSession(session=>session+1);setPromotionDialog(true)};
 const evaluateRequirements=()=>{const items=promotionRule?.nominations??[];if(!items.length){flash('请选择更高职级的目标岗位');return}requirementEvalStore.start({key:promotionKey,step:0,results:items.map(item=>nominationPassed(employee,plan,item)),responsiblePassed:items.map(()=>false)})};
 const satisfyRequirements=()=>{const items=promotionRule?.nominations??[];if(!items.length){flash('请选择更高职级的目标岗位');return}requirementEvalStore.start({key:promotionKey,step:items.length,results:items.map(()=>true),responsiblePassed:items.map(()=>true)})};
 const startPromotion=()=>{if(!promotionRule){flash('请选择更高职级的目标岗位');return}if(promotionState==='evaluating'){openPromotionDialog('review');return}const results=(promotionRule?.nominations??[]).map(item=>nominationPassed(employee,plan,item));setPromotionResults(results);openPromotionDialog('submit',promotionState==='not-ready'?promotionChecks.length:0)};
 const choosePosition=(id:string,focusSkills=false)=>{setPage('map');setSelectedId(id);setMobileDetail(true);window.requestAnimationFrame(()=>{if(focusSkills)document.getElementById('position-skills')?.scrollIntoView({behavior:'smooth',block:'start'});else if(window.innerWidth>700)detailRef.current?.scrollIntoView({behavior:'smooth',block:'start'})})};
 const setGoal=()=>{if(plan.goalId===selected.id){updatePlan({goalId:undefined});flash('已取消主要目标');return}if(plan.goalId&&!window.confirm(`将主要目标从「${positionById(plan.goalId)?.name}」改为「${selected.name}」？原收藏与学习计划会保留。`))return;updatePlan({goalId:selected.id});flash('主要目标已更新')};
 const togglePositionFavorite=()=>updatePlan({favoritePositions:plan.favoritePositions.includes(selected.id)?plan.favoritePositions.filter(x=>x!==selected.id):[...plan.favoritePositions,selected.id]});
 const openSkill=(id:string,e:React.MouseEvent)=>{lastSkillButton.current=e.currentTarget as HTMLElement;setSkillId(id)};
 const certifySkill=(id:string,position=selected)=>{if(getSkill(id).group==='软性素质'||!theoreticalSkillCodes(position).includes(getSkill(id).code)){flash('该岗位暂不考核这项技能');return}const requirement=requirements.find(r=>r.positionId===position.id&&r.skillId===id);const previous=employee.skills[id];const level=Math.max(previous?.level||1,requirement?.level||1) as Level;setSkillId(undefined);updateEmployee({skills:{...employee.skills,[id]:{...previous,status:'已认证',level,date:new Date().toLocaleDateString('en-CA')}}});flash('演示认证已通过，能力图已更新')};
 const softSummary=selected.level>=6?'该岗位重视稳定可靠的执行、基于事实的判断，以及面对门店和加盟商问题时主动承担、持续改善的工作方式。软性素质通过日常工作表现综合观察，无需逐项认证。':'该岗位要求员工认真做事、诚信协作并对结果负责；主动担当、求真务实和持续改善会让工作表现更出色。软性素质通过日常工作表现综合观察，无需逐项认证。';
 const currentDutyItems=splitDutyItems(current.duties).slice(0,6);const dutyChars=currentDutyItems.reduce((sum,item)=>sum+item.length,0);const dutyFit=!currentDutyItems.length?'':dutyChars<=42?'is-sparse':dutyChars>=100||currentDutyItems.length>=4?'is-dense':'is-balanced';
 const skillAccessPosition=page==='map'?selected:page==='list'&&plan.goalId?(positionById(plan.goalId)||current):current;
 const openSkillCodes=new Set(theoreticalSkillCodes(skillAccessPosition));
 const courseOnlySkill=(id:string)=>!openSkillCodes.has(getSkill(id).code);
 const promotionAssessmentSkill=(id:string)=>{const code=getSkill(id).code;return skillAccessPosition.id!==current.id&&(current.track==='拓展'||code.startsWith('T'))&&openSkillCodes.has(code)&&!theoreticalSkillCodes(current).includes(code)};
 const skillByCode=new Map(skills.map(skill=>[skill.code,skill]));
 const evolutionGap=(skillId:string):SkillGap=>{
  const skill=getSkill(skillId);
  const listed=requirements.find(requirement=>requirement.skillId===skillId);
  const requirement=listed??{positionId:selected.id,skillId,level:1 as Level,kind:'必备' as const,raw:skill.definition,source:skill.source,confirmed:true,comparable:false};
  const record=employee.skills[skillId];
  let state:SkillGap['state']='未认证';
  if(!requirement.confirmed)state='待确认';
  else if(record?.status==='认证中')state='认证中';
  else if(record?.status==='已认证')state=(record.level||0)>=requirement.level?'已达到':'待提升';
  return {requirement,record,state,missing:!record||record.status!=='已认证'||(record.level||0)<requirement.level};
 };
 const evolutionRows=skillEvolutionSteps(current,selected).flatMap(step=>{
  const targetSkill=skillByCode.get(step.code);
  const sourceSkill=step.from?skillByCode.get(step.from):undefined;
  if(!targetSkill)return [];
  return [{key:`${step.from??'new'}-${step.code}`,group:targetSkill.group,currentGap:sourceSkill?evolutionGap(sourceSkill.id):undefined,targetGap:evolutionGap(targetSkill.id)}];
 });
 const evolutionScope=`${employee.id}:${current.id}:${selected.id}`;
 const learnedEvolutionKeys=evolutionRows.filter(row=>row.targetGap&&!row.targetGap.missing).map(row=>row.key);
 const learnedEvolutionKey=learnedEvolutionKeys.join('|');
 const [leavingEvolution,setLeavingEvolution]=useState<{scope:string;keys:string[]}>({scope:'',keys:[]});
 const previousLearned=useRef<{scope:string;keys:string}|null>(null);
 useEffect(()=>{
  const previous=previousLearned.current;
  previousLearned.current={scope:evolutionScope,keys:learnedEvolutionKey};
  if(!previous||previous.scope!==evolutionScope){setLeavingEvolution({scope:evolutionScope,keys:[]});return}
  const before=new Set(previous.keys?previous.keys.split('|'):[]);
  const newly=learnedEvolutionKeys.filter(key=>!before.has(key));
  if(!newly.length)return;
  setLeavingEvolution(state=>({scope:evolutionScope,keys:[...new Set([...(state.scope===evolutionScope?state.keys:[]),...newly])]}));
  const timer=window.setTimeout(()=>setLeavingEvolution(state=>state.scope===evolutionScope?{scope:evolutionScope,keys:[]}:state),480);
  return()=>window.clearTimeout(timer);
 },[evolutionScope,learnedEvolutionKey]);
 const leavingEvolutionKeys=leavingEvolution.scope===evolutionScope?leavingEvolution.keys:[];
 const visibleEvolutionRows=evolutionRows.filter(row=>{const learned=!!row.targetGap&&!row.targetGap.missing;return !learned||leavingEvolutionKeys.includes(row.key)});
 const focusGoal=plan.goalId?positionById(plan.goalId):undefined;
 return <div className="app">
 <header className="topbar"><div className="brand"><span className="brand-mark" aria-hidden="true"><span/><span/><span/><span/></span><span>职业发展地图</span></div><nav aria-label="主导航"><button className={page==='home'?'nav-on':''} onClick={()=>{setPage('home');setMobileDetail(false);setMobileMoreOpen(false)}}>首页</button><button className={page==='map'?'nav-on':''} onClick={()=>{setPage('map');setMobileDetail(false);setMobileMoreOpen(false)}}>岗位地图</button><button className={page==='skills'?'nav-on':''} onClick={()=>{setPage('skills');setMobileDetail(false);setMobileMoreOpen(false)}}>我的技能</button><button className={page==='list'?'nav-on':''} onClick={()=>{setPage('list');setMobileMoreOpen(false)}}>营拓技能</button></nav><button className={`settings-link ${page==='settings'?'nav-on':''}`} onClick={()=>{setPage('settings');setMobileMoreOpen(false)}}>演示数据 <span aria-hidden="true">↗</span></button></header>
 <main>
 {page==='home'&&<CareerHome employee={employee} employees={data.employees} current={current} onEmployeeChange={setEmployeeId} onChoose={choosePosition}/>}
 {page==='map'&&<><section className="hero"><div><div className="eyebrow">岗位地图</div><h1>看见下一步，也看见怎么到达</h1><p>从当前岗位出发，只展示此刻可达的方向；选择目标后，对照岗位职责、能力要求与技能进化。</p></div></section>
 <section className="employee-card"><div className="avatar">{employee.name.slice(0,1)}</div><div className="employee-main"><div className="employee-label">当前员工 <span className="demo-pill">演示资料</span></div><div className="employee-name">{employee.name}<span>{employee.branch}</span></div><div className="employee-meta"><span>{current.name} · L{current.level}</span><span>任职自 {employee.since}</span><span>已认证 {Object.entries(employee.skills).filter(([id,record])=>record.status==='已认证'&&getSkill(id)?.group!=='软性素质').length} 项</span></div></div><div className="employee-goal"><span>发展目标</span><strong>{focusGoal?`${focusGoal.name} · L${focusGoal.level}`:'尚未设置'}</strong></div><label className="employee-switch">切换虚拟员工<select value={employeeId} onChange={e=>setEmployeeId(e.target.value)}><EmployeeOptions employees={data.employees} showPosition/></select></label></section>
 <section className="journey-overview" aria-label="当前岗位与发展方向"><div className="journey-current"><div className="journey-kicker">当前岗位 · L{current.level}职级</div><div className="journey-current-head"><div><h2>{current.name}</h2>{promotionOutOfScope(current)&&<p className="rank-limit-note">职级过高，晋升系统暂不适用，请联系分公司负责人和总部。</p>}</div></div><div className={`journey-duties ${dutyFit}`}><h3>当前职责 <span>{currentDutyItems.length} 项</span></h3>{currentDutyItems.length?<ul>{currentDutyItems.map((d,i)=><li key={`${d}-${i}`}>{d}</li>)}</ul>:<p>该岗位职责待补充，可在我的技能中查看已掌握的能力。</p>}</div><button className="journey-link" onClick={()=>{setPage('skills');setMobileDetail(false)}}>查看我的技能档案 <span aria-hidden="true">↗</span></button></div>{promotionOutOfScope(current)?<div className="journey-ability"><AbilityRadar employee={employee} position={current}/></div>:<div className="journey-next"><div className="journey-kicker">晋升路径</div><p>只展示目前可晋升或可转移的岗位。选择后，下方立即生成岗位与技能对照。</p><CareerOrbit current={current} selected={selected} goalId={plan.goalId} onChoose={choosePosition}/></div>}</section>
 {nextRoles.length>0&&<div className="workspace">
 <aside ref={detailRef} className={`detail ${mobileDetail?'mobile-open':''}`}><div className="detail-mobile-back"><button onClick={()=>setMobileDetail(false)}>← 返回地图</button></div><div className="detail-top"><div className="eyebrow">目标岗位 · L{selected.level}职级</div><div className="detail-title"><h2>{selected.name}</h2><span className={`track-chip track-${selected.track}`}>{selected.track}</span></div><p className="detail-salary">{selected.salary}<small> 万元/年 · 年薪参考</small></p><div className="detail-flags">{plan.goalId===selected.id&&<span>✦ 我的目标</span>}{promotionState==='evaluating'&&<span className="promotion-status evaluating">提报评估中</span>}{promotionState==='not-ready'&&<span className="promotion-status blocked">暂不满足提报条件</span>}</div><section className="detail-portrait"><h3>岗位画像</h3><p>{selected.positioning}</p><div className="portrait-grid"><div className="portrait-card"><span>核心职责</span>{selected.duties.length?<ul className="duty-list">{splitBulletItems(selected.duties).map((d,i)=><li key={i}>{d}</li>)}</ul>:<p>标准待补充</p>}</div><div className="portrait-side"><div className="detail-actions portrait-actions"><button className="primary" onClick={setGoal}>{plan.goalId===selected.id?'取消主要目标':'设为发展目标'}</button><button onClick={togglePositionFavorite}>{plan.favoritePositions.includes(selected.id)?'♥ 已收藏':'♡ 收藏岗位'}</button></div></div></div></section></div>
 <AbilityRadar employee={employee} position={selected}/>
 <div className="detail-body">
 <section className="detail-section">{softSummary&&<PromotionRequirements items={promotionRule?.nominations??['选择更高职级的目标岗位后，这里显示提报要求。']} softSummary={softSummary} promotionKey={promotionKey} inProcess={promotionInProcess} detailState={detail=>clausePassed(employee,plan,detail)} onEvaluate={evaluateRequirements} onSatisfy={satisfyRequirements} onSubmit={requestPromotion} onReview={()=>openPromotionDialog('review')} onCancel={()=>setPromotionSubmitted(states=>{const next={...states};delete next[promotionKey];return next})}/>}</section>
 <section className="detail-section skill-requirements skill-evolution" id="position-skills"><h3>技能进化</h3><p className="skill-evolution-intro">左边是当前岗位里与新技能衔接的上一项。如果当前岗位还没有这条技能，会标明需要学习新技能。</p><div className="skill-evolution-head"><div><small>当前所在岗位</small><strong>{current.name}</strong><span>L{current.level}</span></div><div><small>当前目标岗位</small><strong>{selected.name}</strong><span>L{selected.level}</span></div></div><div className="skill-evolution-list">{(visibleEvolutionRows.length?visibleEvolutionRows.map(row=><div className={`skill-evolution-row${leavingEvolutionKeys.includes(row.key)?' is-leaving':''}`} key={row.key}><div className="skill-evolution-type">{row.group}</div><div className="skill-evolution-cell current-skill">{row.currentGap?<SkillRequirementRow gap={row.currentGap} position={current} relation="当前岗位" onOpen={e=>openSkill(row.currentGap!.requirement.skillId,e)}/>:<div className="skill-evolution-empty is-learn">需要学习新技能</div>}</div><span className="skill-evolution-arrow" aria-hidden="true">⟶</span><div className="skill-evolution-cell target-skill">{row.targetGap?<SkillRequirementRow gap={row.targetGap} position={selected} relation="目标岗位" onOpen={e=>openSkill(row.targetGap!.requirement.skillId,e)}/>:<div className="skill-evolution-empty">目标岗位无此项要求</div>}</div></div>):<p className="skill-evolution-same">暂无需学习的新技能</p>)}</div><p className="small-note">当前岗位技能与此前学过的技能统一记录在“我的技能”中。</p></section>
 </div></aside></div>}</>}
 {page==='skills'&&<MySkills employee={employee} current={current} goal={focusGoal} plan={plan} onOpen={openSkill} onOpenPlan={()=>setPage('list')}/>} 
 {page==='list'&&<LearningPlan employee={employee} current={current} goal={focusGoal} plan={plan} onOpenSkill={openSkill} onUpdateLearning={(id,status)=>{const learning={...plan.learning};if(status)learning[id]=status;else delete learning[id];updatePlan({learning})}}/>}
 {page==='settings'&&<DemoSettings employees={data.employees} employee={employee} employeeId={employeeId} plan={plan} onEmployeeId={setEmployeeId} onUpdateEmployee={updateEmployee} onUpdatePlan={updatePlan} onResetEmployee={()=>{const record=restoreDemo(employee.id);if(!record)return;setData(prev=>({...prev,employees:prev.employees.map(item=>item.id===employee.id?record.employee:item),plans:{...prev.plans,[employee.id]:record.plan}}));flash('已恢复本员工默认数据')}} onResetAll={()=>{setData(initialData());flash('已重置全部演示数据')}}/>}
 </main><footer><span>职业发展地图</span><span>演示数据 · 仅供原型评审</span><span>体验版</span></footer><nav className="mobile-tabbar" aria-label="移动端主导航"><button className={page==='home'?'nav-on':''} onClick={()=>{setPage('home');setMobileMoreOpen(false)}}><i aria-hidden="true">⌂</i><span>首页</span></button><button className={page==='map'?'nav-on':''} onClick={()=>{setPage('map');setMobileDetail(false);setMobileMoreOpen(false)}}><i aria-hidden="true">◇</i><span>岗位</span></button><button className={page==='skills'?'nav-on':''} onClick={()=>{setPage('skills');setMobileMoreOpen(false)}}><i aria-hidden="true">✓</i><span>技能</span></button><button className={page==='list'?'nav-on':''} onClick={()=>{setPage('list');setMobileMoreOpen(false)}}><i aria-hidden="true">≡</i><span>目录</span></button><button className={page==='settings'?'nav-on':''} aria-expanded={mobileMoreOpen} onClick={()=>setMobileMoreOpen(open=>!open)}><i aria-hidden="true">•••</i><span>更多</span></button>{mobileMoreOpen&&<div className="mobile-more-menu"><button onClick={()=>{setPage('settings');setMobileMoreOpen(false)}}>演示数据 <span aria-hidden="true">→</span></button></div>}</nav>{!storageOK&&<div className="toast toast-warning">浏览器存储不可用，刷新后修改可能丢失。</div>}{notice&&<div className="toast toast-success" role="status">{notice}</div>}{confirmSubmit&&<div className="dialog-backdrop promotion-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setConfirmSubmit(false)}}><section className="promotion-dialog confirm-submit-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-submit-title"><div className="promotion-dialog-head"><div><span>晋升提报</span><h2 id="confirm-submit-title">确认提报这个岗位？</h2><p>提报后，相关负责人会在 48 小时内评估是否进入流程。</p></div><button type="button" onClick={()=>setConfirmSubmit(false)} aria-label="关闭确认">×</button></div><div className="promotion-dialog-actions"><button type="button" className="confirm-cancel" onClick={()=>setConfirmSubmit(false)}>取消</button><button type="button" onClick={()=>{setPromotionSubmitted(states=>({...states,[promotionKey]:true}));setConfirmSubmit(false)}}>确认提报</button></div></section></div>}{submitGate&&<div className="dialog-backdrop promotion-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSubmitGate(null)}}><section className="promotion-dialog confirm-submit-dialog" role="dialog" aria-modal="true" aria-labelledby="submit-gate-title"><div className="promotion-dialog-head"><div><span>晋升提报</span><h2 id="submit-gate-title">{submitGate.title}</h2><p>{submitGate.detail}</p></div><button type="button" onClick={()=>setSubmitGate(null)} aria-label="关闭提醒">×</button></div><div className="promotion-dialog-actions"><button type="button" onClick={()=>setSubmitGate(null)}>知道了</button></div></section></div>}{promotionDialog&&<PromotionDialog key={dialogSession} mode={promotionMode} rule={promotionRule} checks={promotionChecks} initialStep={dialogInitialStep} results={promotionResults} targetKey={promotionKey} onClose={()=>setPromotionDialog(false)} onEvaluated={(key,passed)=>{setPromotionStates(states=>({...states,[key]:passed?'evaluating':'not-ready'}));flash(passed?'提报评估中，可查看考察流程':'有基本要求尚未满足')}}/>}
 {skillId&&<SkillDialog id={skillId} employee={employee} position={skillAccessPosition} plan={plan} courseOnly={courseOnlySkill(skillId)} promotionAssessment={promotionAssessmentSkill(skillId)} onClose={()=>setSkillId(undefined)} onCertify={()=>certifySkill(skillId,skillAccessPosition)} onLearning={status=>{const learning={...plan.learning};if(status)learning[skillId]=status;else delete learning[skillId];updatePlan({learning})}}/>} 
 </div>
}
function LearningPlan({employee,current,goal,plan,onOpenSkill,onUpdateLearning}:{employee:Employee;current:Position;goal?:Position;plan:Plan;onOpenSkill:(id:string,event:React.MouseEvent<HTMLButtonElement>)=>void;onUpdateLearning:(id:string,status:Plan['learning'][string]|null)=>void}){
 const [group,setGroup]=useState('全部');
 const [status,setStatus]=useState('全部');
 const [query,setQuery]=useState('');
 const currentCodes=new Set(theoreticalSkillCodes(current));
 const context=goal??current;
 const contextCodes=new Set(theoreticalSkillCodes(context));
 const targetIds=new Set((goal?theoreticalSkillCodes(goal):[]).filter(code=>!currentCodes.has(code)).map(code=>skills.find(skill=>skill.code===code)?.id).filter((id):id is string=>!!id));
 const allSkills=[...skills].filter(skill=>skill.group!=='软性素质').sort((a,b)=>groups.indexOf(a.group)-groups.indexOf(b.group)||skillLadder.indexOf(a.code)-skillLadder.indexOf(b.code)||a.name.localeCompare(b.name,'zh-CN'));
 const learningState=(id:string)=>plan.learning[id]||'计划学习';
 const filtered=allSkills.filter(skill=>(group==='全部'||skill.group===group)&&(status==='全部'||learningState(skill.id)===status)&&(!query.trim()||`${skill.code}${skill.name}${skill.course}`.toLowerCase().includes(query.trim().toLowerCase())));
 const grouped=groups.map(name=>({name,items:filtered.filter(skill=>skill.group===name)})).filter(section=>section.items.length);
 const resetFilters=()=>{setGroup('全部');setStatus('全部');setQuery('')};
 const SkillItem=({skill}:{skill:typeof skills[number]})=>{const courseOnly=!contextCodes.has(skill.code);const record=employee.skills[skill.id];const state=learningState(skill.id);const inList=state==='学习中'||state==='待认证';const early=state==='待认证';const certified=record?.status==='已认证';const nextLevel=positions.filter(role=>role.track===context.track&&theoreticalSkillCodes(role).includes(skill.code)).sort((a,b)=>a.level-b.level)[0]?.level;const limit=courseOnly?(nextLevel?`达到 L${nextLevel} 后可考核认证`:'当前序列仅开放课程学习'):'';return <article className={`list-item ${courseOnly?'is-course-only':'is-certifiable'}`} key={skill.id}><div className="list-icon"><CodeBadge code={skill.code}/></div><div className="list-item-main"><div className="item-kicker">{skill.group}{targetIds.has(skill.id)&&<span className="target-gap-pill">目标新增</span>}<span className={courseOnly?'access-course':'access-certify'}>{courseOnly?'仅课程':'可认证'}</span></div><h3><button onClick={event=>onOpenSkill(skill.id,event)}>{skill.name}<span aria-hidden="true">↗</span></button></h3><p>{displayField(skill.course,'课程待补充').replace(/\n+/g,'、')}</p><div className="list-state-line">{state!=='计划学习'&&<span className={`learning-pill learning-${state}`}>{state}</span>}<span>认证：{record?.status||'未认证'}{certified?` · ${levelLabel(record.level)}`:''}</span></div>{limit&&<span className="course-only-note">{limit}</span>}</div>{!certified&&<div className="list-item-actions skill-plan-actions"><button type="button" className={inList?'is-on':''} aria-pressed={inList} onClick={()=>onUpdateLearning(skill.id,inList?null:'学习中')}>{inList?'已加入学习清单':'加入学习清单'}</button><details className="skill-more-actions"><summary aria-label={`${skill.name}更多操作`}>•••</summary><button type="button" className={early?'is-on early-cert':''} aria-pressed={early} onClick={event=>{onUpdateLearning(skill.id,early?'学习中':'待认证');event.currentTarget.closest('details')?.removeAttribute('open')}}>{early?'取消提前认证':'申请提前认证'}</button></details></div>}</article>};
 return <><section className="page-heading plan-heading"><div className="eyebrow">技能目录</div><h1>全部技能</h1><p>按类别浏览全部技能，可用关键词、类别和学习状态筛选。</p></section><div className="list-main"><div className="list-heading"><span>{filtered.length} / {allSkills.length} 项</span></div><div className="list-filters"><label className="list-search"><span aria-hidden="true">⌕</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="搜索技能名称或编码" aria-label="搜索技能"/></label><select value={group} onChange={event=>setGroup(event.target.value)} aria-label="按技能类别筛选"><option>全部</option>{groups.map(name=><option key={name}>{name}</option>)}</select><select value={status} onChange={event=>setStatus(event.target.value)} aria-label="按学习状态筛选"><option>全部</option>{['计划学习','学习中','待认证'].map(name=><option key={name}>{name}</option>)}</select>{(query||group!=='全部'||status!=='全部')&&<button className="filter-reset" onClick={resetFilters}>清除</button>}</div><div className="list-items">{grouped.length?grouped.map(section=><section className="list-skill-group" key={section.name}><div className="list-group-head"><h3>{section.name}</h3><span>{section.items.length} 项</span></div>{section.items.map(skill=><SkillItem skill={skill} key={skill.id}/>)}</section>):<div className="empty-list"><strong>没有符合条件的技能</strong><span>换个关键词或清除筛选后再试。</span><button onClick={resetFilters}>清除筛选</button></div>}</div></div></>;
}
function PromotionRequirements({items,softSummary,promotionKey,inProcess,detailState,onEvaluate,onSatisfy,onSubmit,onReview,onCancel}:{items:string[];softSummary:string;promotionKey:string;inProcess:boolean;detailState?:(detail:string)=>boolean|undefined;onEvaluate:()=>void;onSatisfy:()=>void;onSubmit:()=>void;onReview:()=>void;onCancel:()=>void}){
 const snapshot=useSyncExternalStore(requirementEvalStore.subscribe,requirementEvalStore.get,requirementEvalStore.get);
 const run=snapshot?.key===promotionKey?snapshot:null;
 const running=!!run&&run.step<run.results.length;
 const passed=!!run&&!running&&run.results.length>0&&run.results.every(Boolean);
 const hasResult=!!run&&!running;
 const responsibleOpen=(item:string,index:number)=>isResponsibleRequirement(item)&&!run?.responsiblePassed?.[index];
 const responsibleReviewPending=hasResult&&items.some((item,index)=>responsibleOpen(item,index))&&!inProcess;
 const otherRequirementsPassed=hasResult&&items.every((item,index)=>isResponsibleRequirement(item)||run.results[index]);
 const showSubmit=inProcess||passed||(responsibleReviewPending&&otherRequirementsPassed);
 const metCount=run?items.filter((item,index)=>index<run.step&&(isResponsibleRequirement(item)?!!run.responsiblePassed?.[index]:run.results[index])).length:0;
 const requirementEntries=items.map((item,index)=>({item,index}));
 return <div className={`promotion-readiness ${hasResult?(passed&&!responsibleReviewPending?'is-ready':responsibleReviewPending&&otherRequirementsPassed?'is-responsible-pending':'has-gaps'):''}`}>
  <div className="requirement-head"><div><div className="requirement-title-row"><h4>晋升提报条件</h4><button type="button" className="requirement-satisfy" onClick={onSatisfy}>一键满足（仅当前功能展示用）</button></div><p>满足全部硬性条件后，可发起晋升提报。</p></div><div className="requirement-head-actions"><button type="button" className="requirement-evaluate" onClick={onEvaluate} disabled={running}>{running?'评估中…':run?'重新评估':'开始评估'}</button></div></div>
  {run&&<div className="requirement-summary"><strong>已满足 {metCount} / {items.length} 项</strong><span><i style={{width:`${Math.round(metCount/items.length*100)}%`}}/></span></div>}
  <div className="requirement-list">{requirementEntries.map(({item,index})=>{const done=!!run&&index<run.step;const active=running&&index===run?.step;const responsiblePending=done&&responsibleOpen(item,index);const itemPassed=responsiblePending?undefined:done?(isResponsibleRequirement(item)?true:run.results[index]):undefined;const state=active?'is-evaluating':responsiblePending?'is-responsible-review':itemPassed===true?'is-met':itemPassed===false?'is-missed':'';const label=active?'评估中':responsiblePending?'负责人评估中':itemPassed===true?'已满足':itemPassed===false?'未满足':'待评估';const details=requirementDetails(item);return <article className={`requirement-item ${state}`} key={`${item}-${index}`}><span className="requirement-state" aria-label={label}>{active||responsiblePending?'':itemPassed===true?'✓':itemPassed===false?'!':index+1}</span><div className="requirement-copy"><div><strong>{requirementTitle(item)}</strong>{(itemPassed!==undefined||responsiblePending)&&<em>{responsiblePending?'负责人评估中':itemPassed?'已满足':'待补齐'}</em>}</div><div className="requirement-detail">{details.map((detail,detailIndex)=>{const clause=itemPassed===false?detailState?.(detail):undefined;const detailPassed=itemPassed===true?true:itemPassed===false?(clause??detailIndex!==index%details.length):undefined;return <span className={detailPassed===true?'is-met':detailPassed===false?'is-missed':''} key={`${detail}-${detailIndex}`}>{detailPassed!==undefined&&<i aria-hidden="true">{detailPassed?'✓':'!'}</i>}{detail}</span>})}</div></div></article>})}</div>
  <aside className="soft-quality-summary"><span className="soft-quality-icon" aria-hidden="true">✦</span><div><strong>软性素质</strong><p>{softSummary}</p><small>由日常工作表现综合观察，无需逐项认证</small></div></aside>
  {showSubmit&&<div className="requirement-actions"><div><strong>{inProcess?'提报已提交':responsibleReviewPending?'负责人评估中':'所有硬性条件已满足'}</strong><span>{inProcess?'可随时查看当前考察流程。':responsibleReviewPending?'负责人完成评估后即可提报。':'现在可以发起晋升提报。'}</span></div><div>{inProcess&&<button type="button" className="requirement-cancel" onClick={onCancel}>取消提报</button>}{responsibleReviewPending?<span className="requirement-submit-tip" tabIndex={0} data-tooltip="负责人评估中，暂时无法提报晋升"><button type="button" className="requirement-submit" disabled>提报晋升<span aria-hidden="true">→</span></button></span>:<button type="button" className={`requirement-submit ${inProcess?'is-review':''}`} onClick={inProcess?onReview:onSubmit}>{inProcess?'查看流程':'提报晋升'}<span aria-hidden="true">→</span></button>}</div></div>}
 </div>;
}
function SkillRequirementRow({gap,position,relation,onOpen}:{gap:SkillGap;position:Position;relation?:'当前岗位'|'目标岗位';onOpen:(event:React.MouseEvent<HTMLButtonElement>)=>void}){
 const skill=getSkill(gap.requirement.skillId);
 const standard=gap.requirement.comparable?levelLabel(gap.requirement.level):cleanSkillDescription(gap.requirement.raw);
 const assessment=assessmentFor(skill,position);
 return <button className={`skill-row ${relation==='目标岗位'?'is-new-requirement':'is-current-requirement'}`} onClick={onOpen}><CodeBadge code={skill.code}/><span className="skill-row-copy"><strong>{skill.name}</strong></span><span className="skill-row-meta"><small className="skill-meta-line"><i aria-hidden="true">·</i><span><b className="skill-meta-label">岗位要求：</b><ProgressionText text={standard}/></span></small><small className="skill-meta-line"><i aria-hidden="true">·</i><span><b className="skill-meta-label">认证方式：</b>{assessment}</span></small></span><em className={gap.missing?'missing':'met'}>{gap.state}</em><span className="skill-row-open" aria-hidden="true">↗</span></button>;
}
function SkillDialog({id,employee,position,plan,courseOnly,promotionAssessment,onClose,onCertify,onLearning}:{id:string;employee:Employee;position:typeof positions[number];plan:Plan;courseOnly:boolean;promotionAssessment:boolean;onClose:()=>void;onCertify:()=>void;onLearning:(s:Plan['learning'][string]|null)=>void}){
 const skill=getSkill(id);const record=employee.skills[id];const required=requirements.find(r=>r.positionId===position.id&&r.skillId===id);
 const assessment=assessmentFor(skill,position);
 const positionRequiresSkill=!!required||theoreticalSkillCodes(position).includes(skill.code);
 const certified=record?.status==='已认证';
 const canCertify=!courseOnly&&!promotionAssessment&&skill.group!=='软性素质'&&(record?.status!=='已认证'||(record.level||0)<(required?.level||1));
 const standard=required?(required.comparable?levelLabel(required.level):cleanSkillDescription(required.raw)):positionRequiresSkill?`该岗位需要掌握「${skill.name}」`:'该岗位未要求';
 const courseItems=displayField(skill.course,'课程待补充').split(/\n+/).map(item=>item.trim()).filter(Boolean);
 const steps=Object.entries(record?.steps||{});const completed=steps.filter(([,done])=>done).length;
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{ref.current?.focus();const node=ref.current;const handler=(e:KeyboardEvent)=>{if(e.key!=='Tab'||!node)return;const els=[...node.querySelectorAll<HTMLElement>('button,select,[tabindex]')].filter(x=>!x.hasAttribute('disabled'));if(!els.length)return;const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}};node?.addEventListener('keydown',handler);return()=>node?.removeEventListener('keydown',handler)},[]);
 return <div className="dialog-backdrop skill-drawer-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="dialog skill-dialog skill-drawer" role="dialog" aria-modal="true" aria-labelledby="skill-title" tabIndex={-1} ref={ref}>
  <div className="dialog-head"><div><div className="eyebrow">技能标准与认证</div><h2 id="skill-title"><CodeBadge code={skill.code}/>{skill.name}</h2><div className="skill-dialog-tags"><span className="track-chip">{skill.group}</span><span className={`skill-cert-status ${certified?'is-certified':''}`}>{record?.status||'未认证'}</span></div></div><button className="close" onClick={onClose} aria-label="关闭技能详情">×</button></div>
  <div className="dialog-content">
   <section className="dialog-standard">
    <div className="skill-section-head"><div><h3>「{position.name}」的能力要求</h3></div><em className={positionRequiresSkill?'is-required':'is-optional'}>{positionRequiresSkill?'该岗位要求':'该岗位未要求'}</em></div>
    {positionRequiresSkill?<div className="skill-standard-value"><ProgressionText text={standard}/></div>:<p className="skill-standard-empty">该技能不是该岗位的必备项，可作为后续发展能力提前了解。</p>}
    <div className="skill-definition"><span>能力定义</span>{skill.definition.includes('●')?<ul>{skill.definition.split(/\n/).map(line=>line.trim()).filter(Boolean).reduce<string[]>((items,line)=>{if(line.startsWith('●'))items.push(line.replace(/^●\s*/,''));else if(items.length)items[items.length-1]+=`\n${line}`;else items.push(line);return items},[]).map(item=><li key={item}><ProgressionText text={item}/></li>)}</ul>:<p><ProgressionText text={skill.definition}/></p>}</div>
   </section>
   <section className="skill-progress-panel">
    <div className="skill-section-head"><div><h3>我的认证进度</h3></div></div>
    <div className="dialog-facts"><div><small>认证状态</small><strong>{certified?`${record?.status} · ${required?.comparable?levelLabel(record.level):'认证通过'}`:record?.status||'未认证'}</strong></div><div><small>认证日期</small><strong>{certified?(record?.date||'暂无'):'暂无'}</strong></div></div>
    {steps.length>0&&<div className="cert-steps"><span>已完成 {completed} / {steps.length} 个认证步骤</span><div>{steps.map(([name,done])=><span className={done?'done':''} key={name}>{done?'✓':'○'} {name}</span>)}</div></div>}
    <p className="small-note">进度为演示记录，完成学习步骤后仍需通过正式认证。</p>
   </section>
   <section className="cert-route">
    <div className="skill-section-head"><div><h3>如何获得认证</h3></div></div>
    <div className="cert-route-list">
     <article><div className="cert-route-step-title"><span>1.</span><strong>学习课程</strong></div><div className="cert-route-step-content"><div className="skill-course-links">{courseItems.map(course=>course==='无需单独课程'?<span className="skill-course-none" key={course}>{course}</span>:<button type="button" className="skill-course-link" title="课程链接待配置" key={course}>{course}<span aria-hidden="true">↗</span></button>)}</div></div></article>
     {courseOnly
      ?<article><div className="cert-route-step-title"><span>2.</span><strong>考核与认证</strong></div><div className="cert-route-step-content"><span className="cert-route-locked">暂不适用</span></div></article>
      :promotionAssessment
      ?<><article><div className="cert-route-step-title"><span>2.</span><strong>考核与认证</strong></div><div className="cert-route-step-content"><span className="cert-route-promotion">与晋升考察同步进行</span><p>{assessment}</p></div></article><article><div className="cert-route-step-title"><span>3.</span><strong>结果验证</strong></div><div className="cert-route-step-content"><p>{displayField(skill.verification,'验证标准待补充')}</p></div></article></>
      :<><article><div className="cert-route-step-title"><span>2.</span><strong>评估方式</strong></div><div className="cert-route-step-content"><p>{assessment}</p></div></article><article><div className="cert-route-step-title"><span>3.</span><strong>结果验证</strong></div><div className="cert-route-step-content"><p>{displayField(skill.verification,'验证标准待补充')}</p></div></article></>}
    </div>
   </section>
  </div>
  <div className="dialog-actions">{canCertify&&<button className="certify-action" onClick={onCertify}>立即认证（演示）</button>}{!certified&&<div className="skill-plan-actions">{(()=>{const state=plan.learning[id]||'计划学习';const inList=state==='学习中'||state==='待认证';const early=state==='待认证';return <><button type="button" className={inList?'is-on':''} aria-pressed={inList} onClick={()=>onLearning(inList?null:'学习中')}>{inList?'已加入学习清单':'加入学习清单'}</button><button type="button" className={early?'is-on early-cert':''} aria-pressed={early} onClick={()=>onLearning(early?'学习中':'待认证')}>{promotionAssessment?(early?'课程已完成':'标记课程已完成'):(early?'已申请提前认证':'申请提前认证')}</button></>})()}</div>}</div>
 </div></div>
}
function PromotionDialog({mode,rule,checks,initialStep,results,targetKey,onClose,onEvaluated}:{mode:'submit'|'review';rule?:PromotionStandard;checks:{title:string;detail:string}[];initialStep:number;results:boolean[];targetKey:string;onClose:()=>void;onEvaluated:(key:string,passed:boolean)=>void}){
 const [step,setStep]=useState(initialStep);
 const onEvaluatedRef=useRef(onEvaluated);
 onEvaluatedRef.current=onEvaluated;
 const reviewing=mode==='review'&&!!rule;
 const passed=results.length>0&&results.every(Boolean);
 const checking=!reviewing&&step<checks.length;
 useEffect(()=>{
  if(reviewing||step>=checks.length)return;
  const timer=window.setTimeout(()=>{
   const next=step+1;
   if(next===checks.length)onEvaluatedRef.current(targetKey,results.every(Boolean));
   setStep(next);
  },850);
  return()=>window.clearTimeout(timer);
 },[reviewing,step,checks.length,targetKey,results]);
 const flow=rule?promotionFlow(rule):undefined;
 return <div className="dialog-backdrop promotion-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className={`promotion-dialog ${reviewing?'is-review':''}`} role="dialog" aria-modal="true" aria-labelledby="promotion-title"><div className="promotion-dialog-head"><div><span>{reviewing?'晋升流程':'晋升提报'}</span><h2 id="promotion-title">{reviewing?rule.title:checking?'正在自动评估':passed?'基本要求已满足':'暂不满足提报条件'}</h2><p>{reviewing?'相关负责人48 小时内快速评估，通过后开启晋升流程。（注：营拓岗两条分支全部通过。）':checking?'正在核验目标岗位的提报要求，请稍候。':passed?'提报要求已通过。点击「评估中」可查看晋升流程。':'以下提报要求尚未达到，补齐后可重新发起提报。'}</p></div><button onClick={onClose} aria-label={reviewing?'关闭晋升流程':'关闭晋升评估'}>×</button></div>{reviewing&&flow?<div className="promotion-flow"><div className="promotion-flow-summary"><span>当前进度</span><strong>负责人评估中</strong><p>后续节点已列出，只有前一步通过后才能进入下一步。</p></div><ol className="promotion-flow-list"><li className="promotion-flow-stage is-active"><span className="flow-node">1</span><div className="flow-stage-body"><div className="flow-stage-title"><strong>相关负责人评估</strong><em>进行中</em></div><p>负责人核对晋升提报、岗位编制和基本条件，预计 48 小时内完成。</p></div></li>{flow.prerequisite&&<li className="promotion-flow-stage is-locked"><span className="flow-node">2</span><div className="flow-stage-body"><div className="flow-stage-title"><strong>完成前置技能学习</strong><em>待开始</em></div><p>负责人评估通过后，需完成 {flow.prerequisite} 技能的考核。转营拓默认从营拓主管岗位开始成长，考核通过后再进入能力验证。</p></div></li>}<li className="promotion-flow-stage is-locked"><span className="flow-node">{flow.prerequisite?3:2}</span><div className="flow-stage-body"><div className="flow-stage-title"><strong>能力验证</strong><em>待开始</em></div><div className={`promotion-branches ${flow.branches.length>1?'is-dual':''}`}>{flow.branches.map(branch=><article className={`promotion-branch branch-${branch.track}`} key={branch.track}><div className="promotion-branch-head"><span>{branch.track}分支</span><strong>{branch.method}</strong></div><ol className="promotion-branch-process">{branch.stages.map((stage,index)=><li key={stage.title}><span>{index+1}</span><div><strong>{stage.title}</strong><p>{stage.detail}</p></div></li>)}</ol>{branch.track==='拓展'&&<section className="promotion-branch-criteria"><h5>考察通过评估标准</h5><div className="promotion-branch-standards">{branch.standards.map(item=><article key={`${branch.track}-${item.title}`}><strong>{item.title}</strong><p>{item.detail}</p></article>)}</div></section>}</article>)}</div></div></li><li className="promotion-flow-stage is-locked"><span className="flow-node">{flow.prerequisite?4:3}</span><div className="flow-stage-body"><div className="flow-stage-title"><strong>相关部门审核</strong><em>待开始</em></div><p>能力验证通过后，由相关部门联合复核材料与结果。</p><div className="flow-reviewers">{flow.reviewers.map(item=><span key={item}>{item}</span>)}</div></div></li><li className="promotion-flow-stage is-locked"><span className="flow-node">{flow.prerequisite?5:4}</span><div className="flow-stage-body"><div className="flow-stage-title"><strong>晋升通过</strong><em>待完成</em></div><p>审核通过后更新岗位、职级与对应权限，晋升流程完成。</p></div></li></ol></div>:<div className="promotion-checks">{checks.map((item,index)=>{const complete=index<step;const active=index===step&&checking;const itemPassed=results[index];const state=complete?(itemPassed?'done':'failed'):active?'active':'pending';return <div className={`promotion-check ${state}`} key={item.title}><span className="promotion-check-icon">{complete?(itemPassed?'✓':'×'):''}</span><div><strong>{item.title}</strong><span>{item.detail}</span><small>{complete?(itemPassed?'已满足':'未满足 · 当前为演示评估结果'):active?'评估中…':'等待评估'}</small></div></div>})}</div>}{!reviewing&&step===checks.length&&(passed?<div className="promotion-result"><span>✓</span><div><strong>提报评估中</strong><small>点击岗位上的「评估中」查看晋升流程</small></div></div>:<div className="promotion-result failed"><span>!</span><div><strong>{results.filter(result=>!result).length} 项提报要求待补齐</strong><small>暂未进入考察，条件更新后可再次评估</small></div></div>)}<div className="promotion-dialog-actions"><button className="primary" onClick={onClose} disabled={checking}>{checking?'正在评估…':'知道了'}</button></div></section></div>;
}
export default App;
