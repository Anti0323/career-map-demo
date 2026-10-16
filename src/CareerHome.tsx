import {focusRoles} from './career-focus';
import {positions,tracks,type Employee,type Position} from './data';

type Props={
  employee:Employee;
  employees:Employee[];
  current:Position;
  onEmployeeChange:(id:string)=>void;
  onChoose:(id:string)=>void;
};

const levels=Array.from({length:12},(_,index)=>12-index);

export default function CareerHome({employee,employees,current,onEmployeeChange,onChoose}:Props){
  const available=new Map(tracks.flatMap(track=>focusRoles(current,track)).filter(role=>role.kind!=='current').map(role=>[role.position.id,role]));
  const locateCurrent=()=>document.querySelector<HTMLElement>('.home-position.is-current')?.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});
  return <div className="home-page">
    <section className="home-hero"><div className="home-hero-copy"><div className="eyebrow">职业发展总览</div><h1>一张图，看见所有岗位</h1><p>营运、营拓、拓展三条序列完整展开。找到现在的位置，再看下一步可探索的岗位。</p><button type="button" className="home-find" onClick={locateCurrent}>定位我的岗位 <span aria-hidden="true">↘</span></button></div><div className="home-employee"><div className="home-employee-field"><small>员工项目</small><strong>{employee.name}</strong></div><div className="home-employee-field"><small>当前岗位</small><strong>{current.name}</strong></div><div className="home-employee-field"><small>职级</small><strong>L{current.level}</strong></div><div className="home-employee-field"><small>分公司</small><strong>浙北分公司</strong></div><div className="home-employee-field"><small>所属部门</small><strong>xx 部门</strong></div><label className="home-employee-field"><small>切换员工</small><select value={employee.id} onChange={event=>onEmployeeChange(event.target.value)}>{tracks.map(track=><optgroup label={track} key={track}>{employees.filter(person=>positions.find(position=>position.id===person.positionId)?.track===track).map(person=>{const role=positions.find(position=>position.id===person.positionId);return <option key={person.id} value={person.id}>{person.name}{role?` · L${role.level} ${role.name}`:''}</option>})}</optgroup>)}</select></label></div></section>
    <section className="home-map-section" aria-labelledby="home-map-title"><div className="home-map-title"><div><div className="eyebrow">全部岗位</div><h2 id="home-map-title">三条职业序列</h2><p>点击岗位，查看职责、技能标准和认证进度。</p></div><div className="home-map-legend" aria-label="岗位标记说明"><span><i className="current"/>当前岗位</span><span><i className="available"/>可探索岗位</span><span><i className="ordinary"/>其他岗位</span></div></div>
      <div className="home-map-scroll"><div className="home-map-grid"><div className="home-map-header"><span>职级</span>{tracks.map(track=><strong key={track}>{track}<small>{positions.filter(position=>position.track===track).length} 个岗位</small></strong>)}</div>{levels.map(level=><div className={`home-map-row ${level===current.level?'is-current-level':''}`} key={level}><span className="home-level">L{level}</span>{tracks.map(track=>{const position=positions.find(item=>item.level===level&&item.track===track);if(!position)return <div className="home-empty" key={track} aria-hidden="true"/>;const isCurrent=position.id===current.id;const reachable=available.get(position.id);return <button type="button" key={track} className={`home-position ${isCurrent?'is-current':reachable?'is-available':''}`} onClick={()=>onChoose(position.id)} aria-label={`${position.name}，L${level}，${isCurrent?'当前岗位':reachable?reachable.label:'查看岗位详情'}`}><span className="home-position-main"><strong>{position.name}</strong><small>{position.salary==='暂未提供'?'薪酬待补充':`${position.salary} 万/年`}</small></span>{(isCurrent||reachable)&&<em>{isCurrent?'当前岗位':reachable?.label}</em>}<span className="home-position-arrow" aria-hidden="true">↗</span></button>})}</div>)}</div></div><details className="home-map-footnote"><summary>查看晋升规则</summary><p>三类角色：区经理以下、区经理、大区经理。角色内可晋升 1–2 级；跨入新角色时只能进入该角色的第一级；转营拓不跨角色大类。</p></details>
    </section>
  </div>;
}
