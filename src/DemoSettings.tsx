import {levelLabel,positionById,positions,requirements,skills,tracks,type Employee,type Level,type Plan,type Status} from './data';
import {defaultFacts,factCatalog,monthsInRole,nearestPromotion,nextPromotionPreview,promotionSkillNeeds,relevantFacts} from './demo-readiness';

const skillLadder=['Y1','Y2','Y3','Y4-1','Y4-2','Y4-3','Y5','S1','S3','S4-1','S4-2','S4-3','S5','T1','T2','T3','T4','T5','T6','M1','M2'];
const factGroups=['拓展过程','店端过程','带教与判断'] as const;

type Props={
 employees:Employee[];
 employee:Employee;
 employeeId:string;
 plan:Plan;
 onEmployeeId:(id:string)=>void;
 onUpdateEmployee:(patch:Partial<Employee>)=>void;
 onUpdatePlan:(patch:Partial<Plan>)=>void;
 onResetEmployee:()=>void;
 onResetAll:()=>void;
};

const scrollTo=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'});

export default function DemoSettings({employees,employee,employeeId,plan,onEmployeeId,onUpdateEmployee,onUpdatePlan,onResetEmployee,onResetAll}:Props){
 const current=positionById(employee.positionId)!;
 const months=monthsInRole(employee.since);
 const needs=promotionSkillNeeds(current);
 const facts=relevantFacts(current);
 const nearest=nearestPromotion(current);
 const preview=nextPromotionPreview(employee,plan);
 const ordered=[...skills].filter(skill=>skill.group!=='软性素质').sort((a,b)=>(needs.has(a.code)?0:1)-(needs.has(b.code)?0:1)||skillLadder.indexOf(a.code)-skillLadder.indexOf(b.code));
 const setLearning=(id:string,status:Plan['learning'][string]|null)=>{
  const learning={...plan.learning};
  if(status)learning[id]=status;else delete learning[id];
  onUpdatePlan({learning});
 };
 const setFact=(key:keyof NonNullable<Employee['facts']>,value:boolean)=>onUpdateEmployee({facts:{...(employee.facts??defaultFacts(employee)),[key]:value}});
 return <>
  <section className="page-heading"><div className="eyebrow">员工与规则</div><h1>演示数据</h1><p>按当前晋升提报条件准备这位员工。任职时长、技能认证、课程完成和业务结果会直接参与岗位地图里的评估。</p></section>
  <nav className="settings-section-nav" aria-label="演示数据分区">
   <button onClick={()=>scrollTo('settings-profile')}><span>01</span>员工资料</button>
   <button onClick={()=>scrollTo('settings-skills')}><span>02</span>技能与课程</button>
   <button onClick={()=>scrollTo('settings-metrics')}><span>03</span>提报数据</button>
   <button onClick={()=>scrollTo('settings-rules')}><span>04</span>评估结果</button>
  </nav>
  <div className="settings-grid">
   <section className="settings-panel">
    <div className="panel-heading" id="settings-profile"><span>01</span><div><h2>模拟员工资料</h2><p>任职日期用来判断「在岗时长」是否达到提报要求。</p></div></div>
    <label>虚拟员工<select value={employeeId} onChange={event=>onEmployeeId(event.target.value)}>{tracks.map(track=><optgroup label={track} key={track}>{employees.filter(person=>positionById(person.positionId)?.track===track).map(person=>{const role=positionById(person.positionId);return <option value={person.id} key={person.id}>{person.name}{role?` · L${role.level} ${role.name}`:''}</option>})}</optgroup>)}</select></label>
    <div className="form-row"><label>姓名<input value={employee.name} onChange={event=>onUpdateEmployee({name:event.target.value})}/></label><label>分公司<input value={employee.branch} onChange={event=>onUpdateEmployee({branch:event.target.value})}/></label></div>
    <label>当前岗位<select value={employee.positionId} onChange={event=>onUpdateEmployee({positionId:event.target.value})}>{positions.map(position=><option value={position.id} key={position.id}>{position.track} · L{position.level} {position.name}</option>)}</select></label>
    <label>任职日期<input type="date" value={employee.since} onChange={event=>onUpdateEmployee({since:event.target.value})}/></label>
    <p className="tenure-note">当前在岗 {Math.max(0,months)} 个月。下一档若要求在岗 3 个月或 6 个月，会用这个数比较。</p>
    <div className="panel-heading compact" id="settings-skills"><span>02</span><div><h2>技能认证与课程</h2><p>当前岗位应掌握的技能默认都已认证。需要先认证再提报的下一档技能，看认证状态。拓展侧「课程完成后即可提报」的技能，把课程标成已完成。</p></div></div>
    <div className="cert-list">{ordered.map(skill=>{
     const record=employee.skills[skill.id];
     const need=needs.get(skill.code);
     const course=need==='课程'||!!plan.learning[skill.id];
     const learning=plan.learning[skill.id];
     return <div className={`cert-row${course?' has-course':''}`} key={skill.id}>
      <div><strong><span className="code-badge">{skill.code}</span>{skill.name}</strong><small>{skill.group}{need&&<em className={`need-pill need-${need}`}>{need==='课程'?'下一档课程':'下一档需认证'}</em>}</small></div>
      <select aria-label={`${skill.name}认证状态`} value={record?.status||'未认证'} onChange={event=>onUpdateEmployee({skills:{...employee.skills,[skill.id]:{...record,status:event.target.value as Status,level:event.target.value==='已认证'?(record?.level||1):record?.level,date:event.target.value==='已认证'?record?.date:undefined}}})}>{['未认证','认证中','已认证'].map(item=><option key={item}>{item}</option>)}</select>
      {requirements.some(requirement=>requirement.skillId===skill.id&&requirement.comparable)?<select aria-label={`${skill.name}认证层次`} value={record?.level||1} onChange={event=>onUpdateEmployee({skills:{...employee.skills,[skill.id]:{...record,status:record?.status||'未认证',level:Number(event.target.value) as Level}}})}>{([1,2,3] as Level[]).map(level=><option key={level} value={level}>{levelLabel(level)}</option>)}</select>:<span className="no-level">层次不适用</span>}
      {course&&<select aria-label={`${skill.name}课程状态`} value={learning==='待认证'?'课程已完成':learning==='学习中'?'学习中':'未开始'} onChange={event=>setLearning(skill.id,event.target.value==='课程已完成'?'待认证':event.target.value==='学习中'?'学习中':null)}><option>未开始</option><option>学习中</option><option>课程已完成</option></select>}
     </div>;
    })}</div>
    <div className="panel-heading compact" id="settings-metrics"><span>03</span><div><h2>提报业务数据</h2><p>只列出这位员工下一步提报里会核验的结果。改成未达标后，回到岗位地图重新评估即可看到变化。</p></div></div>
    {facts.length?factGroups.map(group=>{
     const items=facts.filter(item=>item.group===group);
     if(!items.length)return null;
     return <div key={group}><h3 className="fact-group">{group}</h3>{items.map(item=>{
      const met=employee.facts?.[item.key]??true;
      return <div className="fact-row" key={item.key}><div><strong>{item.label}</strong><small>{item.standard}</small></div><div className="fact-toggle" role="group" aria-label={item.label}><button type="button" className={met?'is-on':''} aria-pressed={met} onClick={()=>setFact(item.key,true)}>已达标</button><button type="button" className={!met?'is-off':''} aria-pressed={!met} onClick={()=>setFact(item.key,false)}>未达标</button></div></div>;
     })}</div>;
    }):<p className="tenure-note">当前岗位没有需要在这里填写的业务提报项。</p>}
    <div className="reset-actions"><button onClick={()=>{if(window.confirm(`恢复「${employee.name}」的演示资料、认证和提报数据？`))onResetEmployee()}}>恢复本员工默认数据</button><button className="danger" onClick={()=>{if(window.confirm('重置全部虚拟员工资料和计划？此操作会清除本浏览器内的全部演示修改。'))onResetAll()}}>重置全部演示数据</button></div>
   </section>
   <aside className="settings-side">
    <section className="settings-panel issues-panel"><div className="panel-heading" id="settings-rules"><span>04</span><div><h2>按当前规则的评估</h2><p>{nearest?`最近一档是 L${nearest.level} ${nearest.name}。`:'当前职级不再进入本系统的晋升评估。'}</p></div></div>
     {preview.length?preview.map(role=><details className="readiness-role" key={role.id} open={role.id===nearest?.id}><summary><span>L{role.level} {role.name}</span><em>{role.met}/{role.total} 项硬性条件</em></summary><ul>{role.items.map(item=><li key={item.text}><span>{item.label}</span><em className={item.kind==='responsible'?'review':item.passed?'met':'missed'}>{item.note}</em></li>)}</ul></details>):<p className="tenure-note">这个职级请联系分公司负责人和总部，不在演示评估范围内。</p>}
    </section>
    <div className="side-tip">数据怎么参与评估<p>任职时长看任职日期。先认证再提报的技能，看认证记录。课程完成后即可提报的技能，看课程是否已完成。过会、巡店、品鉴、带教等结果看左侧达标状态。「联系所在分公司总经理」由负责人评估，不在这里判定。</p></div>
   </aside>
  </div>
 </>;
}
