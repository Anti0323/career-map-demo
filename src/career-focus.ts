import {positions,tracks,type Position,type Track} from './data.ts';

export type FocusRole={position:Position;label:string;kind:'current'|'promotion'|'transfer'};
export type RoleCategory='区经理以下'|'区经理'|'大区经理';

const categoryStarts:Record<Track,Record<RoleCategory,number>>={
  营运:{区经理以下:1,区经理:5,大区经理:8},
  营拓:{区经理以下:3,区经理:7,大区经理:10},
  拓展:{区经理以下:5,区经理:6,大区经理:9}
};
const categoryOrder:RoleCategory[]=['区经理以下','区经理','大区经理'];

export function roleCategory(position:Position):RoleCategory{
  const starts=categoryStarts[position.track];
  if(position.level>=starts.大区经理)return '大区经理';
  if(position.level>=starts.区经理)return '区经理';
  return '区经理以下';
}

const entryLevel=(track:Track,category:RoleCategory)=>categoryStarts[track][category];
const extraTransfers=new Set(['0-5>1-6','0-8>1-9','2-8>1-10']);
const blockedTransfers=new Set(['0-9>1-11']);

/** L10 及以上不在本系统晋升，营拓 L10 仍保留晋升考察。 */
export function promotionOutOfScope(position:Position){
  return position.level>=10&&!(position.track==='营拓'&&position.level===10);
}

export function canDevelopTo(current:Position,target:Position):boolean{
  if(current.id===target.id)return true;
  if(promotionOutOfScope(current))return false;
  const pair=`${current.id}>${target.id}`;
  if(blockedTransfers.has(pair))return false;
  if(extraTransfers.has(pair))return true;
  const step=target.level-current.level;
  if(step<1||step>2)return false;
  const currentCategory=roleCategory(current),targetCategory=roleCategory(target);
  if(target.track===current.track){
    if(targetCategory===currentCategory)return true;
    return categoryOrder.indexOf(targetCategory)===categoryOrder.indexOf(currentCategory)+1&&target.level===entryLevel(target.track,targetCategory);
  }
  return target.track==='营拓'&&(current.track==='营运'||current.track==='拓展')&&targetCategory===currentCategory;
}

const roleLabel=(current:Position,target:Position)=>roleCategory(current)===roleCategory(target)?`晋升 ${target.level-current.level} 级`:`进入${roleCategory(target)}角色`;

export function focusRoles(current:Position,track:Track):FocusRole[]{
  if(track===current.track){
    return positions.filter(position=>position.track===track&&canDevelopTo(current,position))
      .sort((a,b)=>a.level-b.level)
      .map(position=>({position,label:position.id===current.id?'当前岗位':roleLabel(current,position),kind:position.id===current.id?'current':'promotion'}));
  }
  if(track!=='营拓'||(current.track!=='营运'&&current.track!=='拓展'))return [];
  return positions.filter(position=>position.track===track&&canDevelopTo(current,position))
    .sort((a,b)=>a.level-b.level)
    .map(position=>({position,label:`转营拓 · 晋升 ${position.level-current.level} 级`,kind:'transfer'}));
}

export const adjacentTrack=(active:Track,direction:1|-1):Track=>tracks[(tracks.indexOf(active)+direction+tracks.length)%tracks.length];
