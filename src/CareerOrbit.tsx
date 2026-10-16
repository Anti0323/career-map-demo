import {useEffect,useRef,useState,type CSSProperties,type WheelEvent} from 'react';
import {tracks,type Position,type Track} from './data';
import {focusRoles,promotionOutOfScope} from './career-focus';

type Props={current:Position;selected:Position;goalId?:string;onChoose:(id:string)=>void};

export default function CareerOrbit({current,selected,goalId,onChoose}:Props){
  const rolesFor=(track:Track)=>focusRoles(current,track).filter(role=>role.position.id!==current.id);
  const availableTracks=tracks.filter(track=>rolesFor(track).length>0);
  const preferredTrack=availableTracks.includes(current.track)?current.track:(availableTracks[0]||current.track);
  const [active,setActive]=useState<Track>(preferredTrack);
  const [roleIndex,setRoleIndex]=useState(0);
  const pointerStart=useRef<number|null>(null);
  const suppressClick=useRef(false);
  useEffect(()=>{setActive(preferredTrack);setRoleIndex(0)},[current.id,preferredTrack]);
  const pageRole=(direction:1|-1)=>{
    const total=rolesFor(active).length;
    if(total<2)return;
    setRoleIndex(index=>(index+direction+total)%total);
  };
  const roleSlot=(index:number,total:number)=>{
    let offset=index-(roleIndex%total);
    if(offset>total/2)offset-=total;
    if(offset<-total/2)offset+=total;
    if(offset===0)return 'center';
    if(offset===-1)return 'left';
    if(offset===1)return 'right';
    return 'far';
  };
  const onWheel=(event:WheelEvent<HTMLElement>)=>{if(Math.abs(event.deltaX)>25&&Math.abs(event.deltaX)>Math.abs(event.deltaY)){pageRole(event.deltaX>0?1:-1)}};
  const transferNotice=active==='营拓'&&(current.track==='营运'||current.track==='拓展')&&current.level>=6;
  if(!availableTracks.length)return promotionOutOfScope(current)
    ?<section className="career-orbit orbit-no-roles orbit-rank-limit" aria-label="职级过高"><strong>职级过高，该系统暂不适用</strong><p>请联系分公司负责人和总部。</p></section>
    :<section className="career-orbit orbit-no-roles" aria-label="暂无下一步岗位"><strong>当前暂无可晋升岗位</strong><p>该职级已到达现有路径上限，后续岗位与发展规则待补充。</p></section>;
  return <section className="career-orbit" aria-label="职业序列旋转地图">
    <div className="orbit-stage" tabIndex={0} onKeyDown={event=>{if(event.key==='ArrowLeft'){event.preventDefault();pageRole(-1)}if(event.key==='ArrowRight'){event.preventDefault();pageRole(1)}}} onWheel={onWheel} onPointerDown={event=>{pointerStart.current=event.clientX}} onPointerCancel={()=>{pointerStart.current=null}} onPointerUp={event=>{if(pointerStart.current!==null){const delta=event.clientX-pointerStart.current;if(Math.abs(delta)>45){suppressClick.current=true;pageRole(delta<0?1:-1);window.setTimeout(()=>{suppressClick.current=false},0)}pointerStart.current=null}}} aria-label="左右滑动或使用方向键切换可晋升岗位">
      <div className="orbit-halo" aria-hidden="true"/>
      {availableTracks.map(track=>{
        const raw=availableTracks.indexOf(track)-availableTracks.indexOf(active);
        const offset=raw>1?raw-availableTracks.length:raw< -1?raw+availableTracks.length:raw;
        const roles=rolesFor(track);
        const front=offset===0;
        return <div key={track} className={`orbit-panel ${front?'front':offset<0?'left':'right'} count-${roles.length} track-${track}`} style={{'--orbit-offset':offset} as CSSProperties} onClick={()=>{if(!suppressClick.current&&!front)setActive(track)}}>
          <div className="orbit-panel-head"><div><span className="orbit-track-dot"/><span className="orbit-track-name">{track}</span></div><small>{track===current.track?'同序列晋升':roles.length?'跨序列发展':'当前无路径'}</small></div>
          <div className="orbit-roles">{roles.length?roles.map((role,index)=>{
            const position=role.position;
            const slot=front?roleSlot(index,roles.length):'center';
            return <button key={position.id} type="button" className={`orbit-role is-${slot} ${position.id===selected.id?'is-selected':''} ${goalId===position.id?'is-goal':''}`} onClick={event=>{event.stopPropagation();if(suppressClick.current)return;if(!front){setActive(track);return}if(slot!=='center'){setRoleIndex(index);onChoose(position.id);return}onChoose(position.id)}}>
              <span className="orbit-role-sheet"><span className="orbit-role-level">L{position.level}职级</span><span className="orbit-role-main"><strong>{position.name}</strong><small>{role.label}{goalId===position.id?' · 我的目标':''}</small></span><span className="orbit-role-salary">{position.salary==='暂未提供'?'薪酬待补充':`${position.salary} 万 / 年`}</span></span>
            </button>;
          }):<div className="orbit-empty">当前岗位暂无通往该路径的可晋升岗位。</div>}</div>
          <div className="orbit-panel-foot">{track===current.track?'角色内可升 1–2 级；跨角色只进入第一级':roles.length?'转营拓一体，不跨角色大类':'当前无可转岗位'}</div>
        </div>
      })}
      <button type="button" className="role-pager role-pager-prev" aria-label="上一个可晋升岗位" disabled={rolesFor(active).length<2} onClick={event=>{event.stopPropagation();pageRole(-1)}}>←</button>
      <button type="button" className="role-pager role-pager-next" aria-label="下一个可晋升岗位" disabled={rolesFor(active).length<2} onClick={event=>{event.stopPropagation();pageRole(1)}}>→</button>
    </div>
    <div className="orbit-controls"><div className="orbit-tabs" role="group" aria-label="选择可发展路径">{availableTracks.map(track=><button type="button" key={track} className={active===track?'active':''} aria-pressed={active===track} onClick={()=>{setActive(track);setRoleIndex(0)}}>{track===current.track?`${track}晋升`:`${track}转岗`}</button>)}</div></div>
    {transferNotice&&<p className="transfer-notice">您当前岗位转营拓后默认从营拓主管岗位开始成长（纯营/纯拓转向营拓序列发展，如原职级与营拓对应职级不一致，按较高职级认定，并保留较高职级对应的底薪，新增营运/拓展专业方向的技能须从基础项开始，逐项完成学习与认证）。</p>}
  </section>;
}
