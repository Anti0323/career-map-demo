import {useState,type MouseEvent} from 'react';
import {levelLabel,skills,type Employee,type Plan,type Position,type Skill,type SkillGroup} from './data';

type SkillState='已认证'|'认证中'|'学习计划';
type Props={employee:Employee;current:Position;goal?:Position;plan:Plan;onOpen:(id:string,event:MouseEvent<HTMLButtonElement>)=>void;onOpenPlan:()=>void};

const groups:SkillGroup[]=['门店营运','加盟商发展','点位拓展','团队管理','通用能力'];
const ladder=['Y1','Y2','Y3','Y4-1','Y4-2','Y4-3','Y5','S1','S3','S4-1','S4-2','S4-3','S5','T1','T2','T3','T4','T5','T6','M1','M2'];
const knownSkill=(id:string)=>skills.find(skill=>skill.id===id&&skill.group!=='软性素质');
const badge=(skill:Skill)=><span className={`code-badge ${skill.code==='无编码'?'uncoded':''}`}>{skill.code==='无编码'?'未编码':skill.code}</span>;
const sortSkills=(items:Skill[])=>[...items].sort((a,b)=>groups.indexOf(a.group)-groups.indexOf(b.group)||ladder.indexOf(a.code)-ladder.indexOf(b.code)||a.name.localeCompare(b.name,'zh-CN'));
const displayDate=(date?:string)=>date?new Date(`${date}T00:00:00`).toLocaleDateString('zh-CN'):'认证日期待补充';

export default function MySkills({employee,current,goal,plan,onOpen,onOpenPlan}:Props){
  const [stateFilter,setStateFilter]=useState<'全部'|SkillState>('全部');
  const [view,setView]=useState<'board'|'list'>('board');
  const certified=sortSkills(Object.entries(employee.skills).filter(([id,record])=>record.status==='已认证'&&knownSkill(id)).map(([id])=>knownSkill(id)!));
  const inProgress=sortSkills(Object.entries(employee.skills).filter(([id,record])=>record.status==='认证中'&&knownSkill(id)).map(([id])=>knownSkill(id)!));
  const planned=sortSkills(Object.keys(plan.learning).map(knownSkill).filter((skill):skill is Skill=>skill!==undefined&&!certified.some(item=>item.id===skill.id)&&!inProgress.some(item=>item.id===skill.id)));
  const sections=[
    {state:'学习计划' as const,title:'准备学习',description:'已安排学习的技能',items:planned},
    {state:'认证中' as const,title:'认证进行中',description:'正在完成考核或等待认证结果',items:inProgress},
    {state:'已认证' as const,title:'已经掌握',description:'已完成认证的历史技能记录',items:certified}
  ].filter(section=>stateFilter==='全部'||section.state===stateFilter);
  const SkillCard=({skill,state}:{skill:Skill;state:SkillState})=>{const record=employee.skills[skill.id];return <button type="button" className={`my-skill-card state-card-${state}`} onClick={event=>onOpen(skill.id,event)} aria-label={`查看${skill.name}详情`}><div className="my-skill-card-top"><span className={`my-skill-state state-${state}`}>{state}</span><span className="my-skill-arrow" aria-hidden="true">↗</span></div><div className="my-skill-title">{badge(skill)}<strong>{skill.name}</strong></div><span className="my-skill-group">{skill.group}</span><div className="my-skill-meta">{state==='已认证'?<><span>{levelLabel(record?.level)}</span><span>{record?.date?`认证于 ${displayDate(record.date)}`:'认证日期待补充'}</span></>:state==='认证中'?<><span>{levelLabel(record?.level)}</span><span>查看认证步骤</span></>:<><span>{plan.learning[skill.id]||'计划学习'}</span><span>尚未形成认证记录</span></>}</div></button>};
  return <div className="my-skills-page">
    <section className="page-heading my-skills-heading"><div className="eyebrow">个人技能档案</div><h1>我的技能</h1><p>记录已经学会、正在认证和准备学习的技能。岗位变化时，这些记录会继续保留。</p></section>
    <section className="skills-context-card"><span className="skills-context-avatar" aria-hidden="true">{employee.name.slice(0,1)}</span><div><small>当前员工</small><strong>{employee.name}</strong><span>{current.name} · L{current.level}</span></div><div className="skills-context-goal"><small>发展目标</small><strong>{goal?`${goal.name} · L${goal.level}`:'尚未设置'}</strong></div><button type="button" onClick={onOpenPlan}>查看营拓技能 <span aria-hidden="true">→</span></button></section>
    <section className="my-skills-summary" aria-label="技能记录概览">{([{state:'学习计划',count:planned.length,label:'学习计划'},{state:'认证中',count:inProgress.length,label:'认证中'},{state:'已认证',count:certified.length,label:'已认证技能'}] as const).map(item=><button type="button" className={stateFilter===item.state?'active':''} onClick={()=>setStateFilter(stateFilter===item.state?'全部':item.state)} aria-pressed={stateFilter===item.state} key={item.state}><strong>{item.count}</strong><span>{item.label}</span><i aria-hidden="true">查看 ↗</i></button>)}</section>
    <div className="my-skills-toolbar"><div><strong>{stateFilter==='全部'?'全部技能记录':stateFilter}</strong><span>{sections.reduce((total,section)=>total+section.items.length,0)} 项</span></div><div className="view-switch" role="group" aria-label="技能展示方式"><button type="button" className={view==='board'?'active':''} aria-pressed={view==='board'} onClick={()=>setView('board')}>看板</button><button type="button" className={view==='list'?'active':''} aria-pressed={view==='list'} onClick={()=>setView('list')}>列表</button></div>{stateFilter!=='全部'&&<button type="button" onClick={()=>setStateFilter('全部')}>清除筛选</button>}</div>
    <div className={`my-skills-board view-${view}`}>{sections.map((section,index)=><section className={`my-skills-section section-${section.state}`} key={section.state}><div className="my-skills-section-head"><div><span>{String(index+1).padStart(2,'0')}</span><h2>{section.title}</h2></div><p>{section.description}</p></div>{section.items.length?<div className="my-skills-grid">{section.items.map(skill=><SkillCard key={skill.id} skill={skill} state={section.state}/>)}</div>:<div className="my-skills-empty"><strong>暂无{section.state}技能</strong><span>可以前往营拓技能目录添加。</span></div>}</section>)}</div>
  </div>;
}
