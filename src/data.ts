import positionDetails from './position-details.json' with { type: 'json' };
import sourced from './source-data.json' with { type: 'json' };
import {theoreticalSkillCodes} from './position-skill-codes.ts';
export type Track = '营运' | '营拓' | '拓展';
export type Level = 1 | 2 | 3;
export type SkillGroup = '门店营运'|'加盟商发展'|'点位拓展'|'团队管理'|'通用能力'|'软性素质';
export type Status = '未认证'|'认证中'|'已认证';
export type Position = { id:string; track:Track; level:number; name:string; salary:string; positioning:string; duties:string[]; outcome:string; scope:string; source:string; detailConfirmed:boolean };
export type Skill = { id:string; code:string; name:string; group:SkillGroup; definition:string; course:string; assessment:string; assessments:Partial<Record<Track,string>>; verification:string; source:string };
export type Requirement = {positionId:string;skillId:string;level:Level;kind:'必备'|'加分';raw:string;source:string;confirmed:boolean;comparable:boolean};
export type SkillRecord = {status:Status;level?:Level;date?:string;steps?:Record<string,boolean>};
export type Metric = {value?:number;unit:string;period:string;scope:string};
export type DemoFacts = {
 personalMeeting:boolean; teamMeeting:boolean;
 personalMaterials:boolean; teamMaterials:boolean;
 personalPassRate:boolean; teamPassRate:boolean;
 battlefield:boolean; personalBestShop:boolean; teamBestShop:boolean;
 storeCoverage:boolean; teamStoreCoverage:boolean;
 reportQuality:boolean; teamReportQuality:boolean;
 foodSafetyClear:boolean; errorRateDown:boolean;
 personalBenchmark:boolean; teamBenchmark:boolean;
 tasting:boolean; profit:boolean; satisfaction:boolean;
 coachCertified:boolean; rootCause:boolean; qualifiedSupervisors:boolean;
 storeJudgment:boolean; reviewAndPush:boolean; keepY1Y2:boolean;
 coachedL8:boolean; coachedL9:boolean;
};
export type Employee = {id:string;name:string;branch:string;positionId:string;since:string;skills:Record<string,SkillRecord>;metrics:Record<string,Metric>;facts?:DemoFacts};
export type Plan = {goalId?:string;favoritePositions:string[];favoriteSkills:string[];learning:Record<string,'计划学习'|'学习中'|'待认证'>};
export type RuleIssue = {id:string;topic:string;sources:string[];variants:string[];assumption:string;status:'待确认'|'资料缺失'};
const source='员工职业发展地图-Codex开发Prompt.md §3（转录截图初始展示表；原截图未提供）';
const rows:[number,[string,string]?,[string,string]?,[string,string]?][]=[
[12,undefined,['分公司总经理','暂未提供'],['拓展总监（跨多省）','暂未提供']],
[11,['营运总监（跨省）','暂未提供'],['高级营拓大区经理','100+'],['拓展省区经理','100+']],
[10,['高级营运大区经理','50+'],['营拓大区经理','90+'],['高级拓展大区经理','100+']],
[9,['中级营运大区经理','45+'],['高级营拓区经理','65–75'],['拓展大区经理','80+']],
[8,['初级营运大区经理','40+'],['中级营拓区经理','43–50'],['高级拓展区经理','57–70']],
[7,['高级营运区经理','28–33'],['初级营拓区经理','40–45'],['中级拓展区经理','33–37']],
[6,['中级营运区经理','24–29'],['营拓主管','27–35'],['拓展区经理','30–35']],
[5,['初级营运区经理','22–27'],['高级营拓督导','22–26'],['拓展顾问','20–25']],
[4,['高级营运督导','17–19'],['中级营拓督导','20–25']],
[3,['中级营运督导','15–18'],['初级营拓督导','18–24']],
[2,['初级营运督导','14–16']],
[1,['（见习）营运储干','暂未提供']]
];
export const tracks:Track[]=['营运','营拓','拓展'];
export const positions:Position[]=rows.flatMap(([level,...cells])=>cells.flatMap((cell,index)=>{if(!cell)return [];const track=tracks[index];return [{id:`${index}-${level}`,track,level,name:cell[0],salary:cell[1],positioning:`${track}序列 L${level} 岗位。具体岗位定位待原始资料核对。`,duties:[],outcome:'标准待补充',scope:'标准待补充',source,detailConfirmed:false}]}));
for(const position of positions){const detail=positionDetails[position.id as keyof typeof positionDetails];if(detail)Object.assign(position,detail)}
const currentDuties:Record<string,string[]>={
'0-1':['在指导下熟悉门店日常和巡店标准。','正在学习巡店稽核、出品品鉴和利润核算。'],
'0-2':['按要求覆盖责任门店，完成巡店稽核、出品品鉴和门店利润核算，并把结果如实记录下来。'],
'0-3':['巡店时找到门店问题根因并提出改善方案。','同时把公司要求传达到加盟商，并响应加盟商需求。'],
'0-4':['为单店制定改善方案并陪伴落地。','判断加盟商是否在店。'],
'0-5':['复核督导的事实和判断，发现区域问题并推动执行到位。','对 1 到 2 店加盟商提出发展建议。'],
'0-6':['判断区域问题并解决落地。','判断 1 到 2 店方案是否合理，并提出 3 到 4 店的发展或调优建议。'],
'0-7':['对 3 到 4 店加盟商做完整经营诊断，判断其调优方案是否合理，并提出 5 店以上的发展规划。'],
'0-8':['按区域门店竞争力制定专项。','做区域加盟商发展与资产调优规划。'],
'0-9':['把已定专项和加盟商规划落到更大的营运区域，对区域营运结果负责。'],
'0-10':['统筹多个区域的营运专项和加盟商资产调优，对整体经营结果负责。'],
'0-11':['跨省统筹营运专项与加盟商发展规划，对多省门店经营结果负责。'],
'1-3':['按标准巡店、品鉴并核算利润，同时响应加盟商需求。','完成点位摸排和单点盈利测算。'],
'1-4':['找到门店问题根因并提出改善方案。','独立完成点位带看。'],
'1-5':['制定单店改善方案并陪伴落地，判断加盟商是否在店。','对点位提出最佳铺和可选区间。'],
'1-6':['复核团队的巡店判断并推动区域动作，对 1 到 2 店加盟商提出发展建议。','拿出最佳建店方案。'],
'1-7':['判断区域问题并落地，判断 1 到 2 店方案并提出 3 到 4 店建议。','同时做多点位商圈规划和人址匹配。'],
'1-8':['对 3 到 4 店做经营诊断并判断调优方案，提出 5 店以上规划。','拓展侧继续做多点位商圈规划。'],
'1-9':['在经营诊断和多点位规划之上，对更大营拓区域的店端结果和开店质量负责。'],
'1-10':['制定区域营运专项和加盟商资产调优规划。','完成区县容量、商圈优先级和点位批次规划。'],
'1-11':['统筹多个营拓区域的专项、加盟商规划和区县开店节奏。'],
'1-12':['对分公司的营运专项、加盟商资产调优和区县拓展规划全面负责。'],
'2-5':['判断加盟商是否在店，完成摸排、单点盈利测算和点位带看。','对点位提出最佳铺及可选区间。'],
'2-6':['对 1 到 2 店加盟商提出发展建议。','制定最佳建店方案。'],
'2-7':['判断 1 到 2 店方案并提出 3 到 4 店建议，做多点位商圈规划和人址匹配。','复核带教是否拿到结果。'],
'2-8':['判断 3 到 4 店方案并提出 5 店以上发展规划。','继续带教团队拿结果。'],
'2-9':['制定区域加盟商与资产调优规划，以及区县开店规划。','建设继任梯队，管理编制和人才状态。'],
'2-10':['统筹更大范围的区县规划和加盟商资产调优，保持梯队与编制健康。'],
'2-11':['对全省的区县规划、加盟商发展和人才梯队负责。'],
'2-12':['跨多省统筹区县规划、加盟商资产调优和人才梯队。']
};
for(const position of positions){const duties=currentDuties[position.id];if(duties)position.duties=duties}
export const positionById=(id:string)=>positions.find(p=>p.id===id);
export const skills:Skill[]=sourced.skills.map(s=>({id:s.id,code:s.code,name:s.name,group:s.group as SkillGroup,definition:s.definition,course:s.course,assessment:s.assessment,assessments:(s.assessments||{}) as Partial<Record<Track,string>>,verification:s.verification,source:s.source}));
export const requirements:Requirement[]=sourced.requirements.map(r=>({...r,kind:r.kind as '必备'|'加分',level:r.level as Level}));
export const issues:RuleIssue[]=[
{id:'missing',topic:'初版岗位展示信息',sources:['截图 PNG 未找到','营运拓展营拓技能清单-TO庚涛.xlsx','拓展晋升标准-TO庚涛.xlsx','营拓职级体系及26年拓展绩效解读-TOBP.pdf'],variants:['部分岗位展示信息仍待核对'],assumption:'先展示现有岗位与年薪参考区间',status:'资料缺失'},
{id:'level',topic:'营拓职级与岗位映射',sources:['营运拓展营拓技能清单-TO庚涛.xlsx｜营拓技能清单!L1:M2','营拓职级体系及26年拓展绩效解读-TOBP.pdf｜第14–15页','拓展晋升标准-TO庚涛.xlsx｜Sheet1!D3:F3'],variants:['一种口径为 L8 龙门、L9 大区','另一种口径为 L9 龙门、L10 大区经理'],assumption:'地图按当前展示的职级排列；技能不按职级自动平移',status:'待确认'},
{id:'period',topic:'带教晋升考察周期',sources:['营拓职级体系及26年拓展绩效解读-TOBP.pdf｜第25–26页','拓展晋升标准-TO庚涛.xlsx｜Sheet1!B12:E14'],variants:['部分周期与适用职级不同'],assumption:'不自动套用相邻岗位规则',status:'待确认'},
{id:'accuracy',topic:'资料完整准确度',sources:['拓展晋升标准-TO庚涛.xlsx｜Sheet1!B11:E14','同表 G11 备注'],variants:['正文 100%','过渡期备注 90%'],assumption:'不将过渡期要求设为永久现行要求',status:'待确认'},
{id:'codes',topic:'技能编码与名称',sources:['营运拓展营拓技能清单-TO庚涛.xlsx｜认证方式!C11:C16','同工作簿｜营拓技能清单!C10:C14'],variants:['加盟商能力部分用 Y 编码','其他表用 S 编码'],assumption:'保留原始编码，待逐项核对映射',status:'待确认'},
{id:'salary',topic:'薪酬展示口径',sources:['员工职业发展地图-Codex开发Prompt.md｜§3','营拓职级体系及26年拓展绩效解读-TOBP.pdf｜第14、16、18页'],variants:['岗位地图展示年薪区间','其他测算口径含绩效收入'],assumption:'地图展示年薪参考区间',status:'待确认'},
{id:'high',topic:'高职级技能与晋升细则',sources:['营运拓展营拓技能清单-TO庚涛.xlsx｜三张技能矩阵','营拓职级体系及26年拓展绩效解读-TOBP.pdf｜第14页'],variants:['部分 L8 以上岗位缺少可直接对应的技能矩阵'],assumption:'只导入明确可对应的低中职级要求；高职级显示标准待补充',status:'资料缺失'},
{id:'transfer',topic:'转营拓一体评审条件',sources:['营拓职级体系及26年拓展绩效解读-TOBP.pdf｜第14、16、18页','营运拓展营拓技能清单-TO庚涛.xlsx｜技能清单!A4:AC11'],variants:['转岗所需认证与具体评审条件待确认'],assumption:'营运或拓展可转营拓，但不跨区经理以下、区经理、大区经理三个角色大类',status:'待确认'}
];
const demoNames=['林','周','许','陈','顾','沈','陆','苏','叶','江','程','宋','唐','温','季','乔','白','梁','夏','秦','韩','谢','何','孟','傅','于','齐','罗','蒋'].map(surname=>`${surname}xx`);
const branchByTrack:Record<Track,string>={'营运':'营运示范区','营拓':'营拓示范区','拓展':'拓展示范区'};
const demoPositions=[...positions].sort((a,b)=>tracks.indexOf(a.track)-tracks.indexOf(b.track)||a.level-b.level);
const demoEmployees:Employee[]=demoPositions.map((position,index)=>({
 id:`e${index+1}`,
 name:demoNames[index]||`演示员工${index+1}`,
 branch:branchByTrack[position.track],
 positionId:position.id,
 since:`${2026-Math.min(5,Math.floor(position.level/3))}-0${index%9+1}-01`,
 skills:{},
 metrics:(index%4===1?{'first-pass':{value:72,unit:'%',period:'近三个月',scope:'个人'}}:{}) as Record<string,Metric>
}));
export function heldSkills(position:Position,date:string):Employee['skills']{
 const earlier=positions.filter(item=>item.track===position.track&&item.level<=position.level);
 const records:Employee['skills']={};
 for(const code of theoreticalSkillCodes(position)){
  const skill=skills.find(item=>item.code===code);
  if(!skill)continue;
  const levels=requirements.filter(requirement=>requirement.skillId===skill.id&&earlier.some(item=>item.id===requirement.positionId)).map(requirement=>requirement.level);
  records[skill.id]={status:'已认证',level:(levels.length?Math.max(...levels):1) as Level,date};
 }
 return records;
}
export const defaultEmployees:Employee[]=demoEmployees.map(employee=>({
 ...employee,
 skills:heldSkills(positionById(employee.positionId)!,employee.since)
}));
export const emptyPlan=():Plan=>({favoritePositions:[],favoriteSkills:[],learning:{}});
export const levelLabel=(level?:Level)=>level===1?'提出判断':level===2?'独立完成':level===3?'能带教':'暂无记录';
