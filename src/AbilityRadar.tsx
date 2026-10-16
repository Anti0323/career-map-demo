import {abilityProfile,abilityAxes} from './ability';
import type {Employee,Position} from './data';

const CX=180,CY=135,R=115;
const angles=[-Math.PI/2,Math.PI/6,Math.PI*5/6];
const labelPoints:[[number,number],[number,number],[number,number]]=[[180,12],[305,218],[55,218]];
type Point=[number,number];
const point=(index:number,ratio:number):Point=>[CX+Math.cos(angles[index])*R*ratio,CY+Math.sin(angles[index])*R*ratio];
const midpoint=(a:Point,b:Point):Point=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
const reuleauxPath=(ratio:number)=>{
 const [top,right,left]=angles.map((_,index)=>point(index,ratio));
 const radius=Math.sqrt(3)*R*ratio;
 return `M ${top[0]} ${top[1]} A ${radius} ${radius} 0 0 1 ${right[0]} ${right[1]} A ${radius} ${radius} 0 0 1 ${left[0]} ${left[1]} A ${radius} ${radius} 0 0 1 ${top[0]} ${top[1]} Z`;
};
const arcMidpoint=(index:number):Point=>{
 const start=point(index,1);
 const end=point((index+1)%3,1);
 const center=point((index+2)%3,1);
 const mid=midpoint(start,end);
 const dx=mid[0]-center[0],dy=mid[1]-center[1];
 const length=Math.hypot(dx,dy)||1;
 const radius=Math.hypot(start[0]-center[0],start[1]-center[1]);
 return [center[0]+dx/length*radius,center[1]+dy/length*radius];
};
const contourPath=(values:number[])=>{
 const ratios=values.map(value=>.1+.9*value);
 if(Math.max(...ratios)-Math.min(...ratios)<.0001)return reuleauxPath(ratios[0]);
 const vertices=ratios.map((ratio,index)=>point(index,ratio));
 const commands=vertices.map((start,index)=>{
  const end=vertices[(index+1)%3];
  const mid=midpoint(start,end);
  const bulge=arcMidpoint(index);
  const strength=(ratios[index]+ratios[(index+1)%3])/2;
  const outward:Point=[mid[0]+(bulge[0]-mid[0])*strength,mid[1]+(bulge[1]-mid[1])*strength];
  const control1:Point=[start[0]*0.42+outward[0]*0.58,start[1]*0.42+outward[1]*0.58];
  const control2:Point=[end[0]*0.42+outward[0]*0.58,end[1]*0.42+outward[1]*0.58];
  return `C ${control1.join(' ')} ${control2.join(' ')} ${end.join(' ')}`;
 });
 return `M ${vertices[0].join(' ')} ${commands.join(' ')} Z`;
};

export default function AbilityRadar({employee,position}:{employee:Employee;position:Position}){
 const profile=abilityProfile(employee,position);
 const current=profile.map(axis=>axis.current/axis.max);
 const target=profile.map(axis=>axis.target/axis.max);
 return <section className="ability-radar" aria-label="营运、加盟商发展、拓展三维能力图">
  <div className="ability-heading"><div><h3>三维能力轮廓</h3></div></div>
  <div className="radar-legend"><span><i className="current"/>我的当前能力</span><span><i className="target"/>目标岗位能力</span></div>
  <svg key={position.id} viewBox="0 0 360 230" role="img" aria-label={`当前与${position.name}的营运、加盟商发展和拓展能力轮廓对比`}>
   <defs>
    <linearGradient id="radarCurrent" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#2d8274" stopOpacity=".42"/><stop offset="1" stopColor="#68a895" stopOpacity=".16"/></linearGradient>
    <linearGradient id="radarTarget" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d0a253" stopOpacity=".36"/><stop offset="1" stopColor="#e3c58d" stopOpacity=".14"/></linearGradient>
    <filter id="contourShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#203c30" floodOpacity=".12"/></filter>
   </defs>
   <path d={reuleauxPath(1)} className="radar-shell"/>
   {[.8,.6,.4,.2].map(level=><path key={level} d={reuleauxPath(level)} className="radar-grid"/>)}
   {abilityAxes.map((axis,index)=>{const [x,y]=point(index,1);return <line key={axis.key} x1={CX} y1={CY} x2={x} y2={y} className="radar-axis"/>})}
   <path className="radar-contour target-shape" d={contourPath(target)} fill="url(#radarTarget)" filter="url(#contourShadow)"/>
   <path className="radar-contour current-shape" d={contourPath(current)} fill="url(#radarCurrent)" filter="url(#contourShadow)"/>
   {abilityAxes.map((axis,index)=><text key={axis.key} x={labelPoints[index][0]} y={labelPoints[index][1]} textAnchor="middle" className="radar-label">{axis.key}</text>)}
  </svg>
  <p className="radar-reading-note">轮廓越靠外，代表该方向覆盖的能力要求越高。</p>
 </section>
}
