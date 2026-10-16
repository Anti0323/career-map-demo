import {positionById,skills,type Employee,type Position,type Track} from './data.ts';
import {theoreticalSkillCodes} from './position-skill-codes.ts';

const franchiseCodes:Record<Track,readonly string[]>={
 营运:['S1','S3','S4-1','S4-2','S4-3','S5'],
 营拓:['S1','S3','S4-1','S4-2','S4-3','S5'],
 拓展:['S3','S4-1','S4-2','S4-3','S5'],
};
export const abilityAxes=[
 {key:'营运' as const,codes:['Y1','Y2','Y3','Y4-1','Y4-2','Y4-3','Y5'],color:'#75b3a6'},
 {key:'加盟商发展' as const,codes:franchiseCodes.营运,color:'#d8b874'},
 {key:'拓展' as const,codes:['T1','T2','T3','T4','T5','T6'],color:'#77a980'},
];
export type AbilityAxis={key:'营运'|'加盟商发展'|'拓展';current:number;target:number;max:number};
const codeBySkillId=new Map(skills.map(skill=>[skill.id,skill.code]));

const heldCodes=(position:Position)=>new Set(theoreticalSkillCodes(position));
const axisCount=(codes:Set<string>,ladder:readonly string[])=>ladder.filter(code=>codes.has(code)).length;

function currentCodes(employee:Employee){
 const role=positionById(employee.positionId);
 const codes=role?heldCodes(role):new Set<string>();
 for(const [id,record] of Object.entries(employee.skills)){
  if(record?.status!=='已认证')continue;
  const code=codeBySkillId.get(id);
  if(code)codes.add(code);
 }
 return codes;
}

const axisCodes=(axis:(typeof abilityAxes)[number],track:Track)=>axis.key==='加盟商发展'?franchiseCodes[track]:axis.codes;

export function abilityProfile(employee:Employee,position:Position):AbilityAxis[]{
 const current=currentCodes(employee);
 const target=heldCodes(position);
 return abilityAxes.map(axis=>{
  const codes=axisCodes(axis,position.track);
  return {
   key:axis.key,
   current:axisCount(current,codes),
   target:axisCount(target,codes),
   max:codes.length,
  };
 });
}
