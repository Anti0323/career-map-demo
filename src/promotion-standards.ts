import {positionById,positions,type Position,type Track} from './data.ts';
import {canDevelopTo} from './career-focus.ts';
import {theoreticalSkillCodes} from './position-skill-codes.ts';

export type ReviewStep={title:string;detail:string};
export type PromotionFlowBranch={
 track:'营运'|'拓展';
 method:'述职'|'考察';
 summary:string;
 stages:ReviewStep[];
 standards:ReviewStep[];
};
export type PromotionFlow={
 branches:PromotionFlowBranch[];
 reviewers:string[];
 postRules:string[];
 /** Skill span to assess after the responsible review, such as “T1 至 T4”. */
 prerequisite?:string;
};
export type PromotionStandard={
 track:Track;
 fromLevel:number;
 toLevel:number|null;
 title:string;
 nominations:string[];
 reviewSummary:string;
 reviewSteps:ReviewStep[];
 /** Skills still missing versus 营拓主管 when a mid or senior rank transfers in. */
 prerequisiteSkills?:string[];
};

const operationsStoreCoverage=`巡店覆盖：按要求覆盖本人责任门店
纯营≤35店：门店每月覆盖率≥100%；纯营＞35店：A类门店每两月覆盖≥ 1次，其余门店每月覆盖率≥100%；`;
const integratedStoreCoverage=`巡店覆盖：按要求覆盖本人责任门店
营拓25–30店：A类门店每两月覆盖≥ 1次，其余门店每月覆盖率≥100%；营拓＜25店：门店每月覆盖率≥100%；`;
const tenure=(months:number)=>`当前岗位在职时间：在岗时长≥${months}个月`;
const reportRates=`报告填写率≥100%；
报告完整率≥100%；
抽查通过率≥100%`;
const bench=(who:string)=>`${who}前三个月均值：
K项合格率≥全国大盘均值；
品质合格率≥全国大盘均值；
食安合格率≥全国大盘均值；
超时订单占比≤全国大盘均值`;
const materials=`资料准确度≥100%；
完整度≥100%；
允许申诉≤2次`;
const passRate=`首次过会通过率≥80%`;
const meetingCount=`过会数量≥目标数×时间进度`;
const bothData=`个人和团队：
${meetingCount}；
${materials}；
${passRate}`;
const teamData=`团队：
${meetingCount}；
${materials}；
${passRate}`;
const tasting=`排除不可抗力后：
个人新品打卡正确率≥100%；
及时完成率≥100%；
区域新品打卡审核达标率≥100%；
认证判断中的区域审核率=25%`;
const tastingKeep=`个人新品打卡正确率≥100%；
及时完成率≥100%；
区域新品打卡审核达标率≥100%`;
const profit=`盈利数据每月更新率≥100%；
填写完整性≥100%；
及时性≥100%`;
const salesMix=`新开店堂食流水3000以上占比≥40%；
数量目标完成率≥90%；
申请提前晋升时，数量完成率≥65%`;
const expansionAssessmentData=`过会数量底线≥目标数×考察期月数/12；
一审过会资料准确率、完整率≥100%；
首次过会通过率≥80%`;

const seniorReview=(coverage:string):Pick<PromotionStandard,'nominations'|'reviewSummary'|'reviewSteps'>=>({
 nominations:['联系所在分公司总经理'],
 reviewSummary:`这一档起由总部高层综合评估。${coverage}`,
 reviewSteps:[{title:'评估方式',detail:'联系所在分公司总经理。'}]
});

const standardDefinitions:PromotionStandard[]=[
 {track:'拓展',fromLevel:5,toLevel:6,title:'L5 拓展顾问 → L6 拓展区经理',nominations:[
  tenure(3),
  meetingCount,
  `个人一审${materials}`,
  passRate,
  '提报时明确下一档主战场，并且主战场里已经在带人'
 ],reviewSummary:'考察 3 个月。一个自然年最多提报 3 次。',reviewSteps:[
  {title:'技能标签',detail:'具备最佳建店方案能力和单点判断能力；专家团随机抽查一个考察期内点位过会视频进行判断评估。'},
  {title:'数据底线',detail:expansionAssessmentData},
  {title:'业绩结果',detail:'近 6 个月新开门店堂食流水不出现低于 2000。'},
  {title:'带教结果',detail:'新人带教通过：完成 5 个不同类型点位过会；团队内拓展顾问不出现连续 3 个月无产能。'}
 ]},
 {track:'拓展',fromLevel:6,toLevel:7,title:'L6 拓展区经理 → L7 中级拓展区经理',nominations:[
  tenure(3),
  bothData,
  '个人和团队近6个月新开最佳铺占比达到区域既定目标（具体目标值由相关负责人确认）'
 ],reviewSummary:'考察 3 到 6 个月。分公司先评，专家团再核多点位商圈规划。一个自然年最多 2 次。',reviewSteps:[
  {title:'技能标签',detail:'具备多点位商圈规划能力和人址匹配能力。'},
  {title:'数据底线',detail:expansionAssessmentData},
  {title:'业绩结果',detail:'考察期内新开门店堂食流水不出现低于 2000。'},
  {title:'带教结果',detail:'团队内拓展顾问不出现连续 3 个月无产能；新人可单独报备。'}
 ]},
 {track:'拓展',fromLevel:7,toLevel:8,title:'L7 中级拓展区经理 → L8 高级拓展区经理',nominations:[
  tenure(6),
  bothData,
  '个人和团队近6个月新开最佳铺占比达到区域既定目标（具体目标值由相关负责人确认）'
 ],reviewSummary:'考察 12 个月。一个自然年最多 2 次。',reviewSteps:[
  {title:'技能标签',detail:'具备区域规划能力和加盟商发展能力。'},
  {title:'数据底线',detail:expansionAssessmentData},
  {title:'业绩结果',detail:`${salesMix}。`},
  {title:'带教结果',detail:'团队内拓展顾问不出现连续 3 个月无产能；新人可单独报备。'}
 ]},
 {track:'拓展',fromLevel:8,toLevel:9,title:'L8 高级拓展区经理 → L9 拓展大区经理',nominations:[
  tenure(6),
  teamData,
  '团队近6个月新开最佳铺占比达到区域既定目标（具体目标值由相关负责人确认）',
  '靠自己带教，培养出能对质量负责的纯拓 L8'
 ],reviewSummary:'考察 12 个月。一个自然年最多 2 次。',reviewSteps:[
  {title:'数据底线',detail:expansionAssessmentData},
  {title:'业绩结果',detail:`${salesMix}。`},
  {title:'带教结果',detail:'培养出 1 个 L8；底线是该 L8 规划述职通过并进入考察期。'}
 ]},
 {track:'拓展',fromLevel:9,toLevel:null,title:'L9 拓展大区经理及以上',nominations:['联系所在分公司总经理'],reviewSummary:'考察 12 个月。这一档起由总部高层综合评估。覆盖拓展大区经理、高级拓展大区经理、拓展省区经理和拓展总监。',reviewSteps:[
  {title:'数据底线',detail:'统计自纯拓 L9 起至提报晋升期间的全部工作过程：过会数量底线≥目标数×考察期月数/12；一审过会资料准确率、完整率≥100%；首次过会通过率≥80%。'},
  {title:'业绩结果',detail:`${salesMix}。`}
 ]},

 {track:'营运',fromLevel:1,toLevel:2,title:'L1（见习）营运储干 → L2 初级营运督导',nominations:[
  operationsStoreCoverage,
  `巡店质量：
当月首次进店报告填写率≥100%；
报告完整率≥100%；
区域、关键设备、健康证抽查通过率≥100%`,
  '过去三个月滚动食安二错门店≤0',
  bench(''),
  tasting,
  profit
 ],reviewSummary:'营运没有单独的考察月数，也没有一年内提报次数。',reviewSteps:[
  {title:'巡店',detail:`${operationsStoreCoverage}
${reportRates}。`},
  {title:'品鉴与盈利',detail:`${tasting}
${profit}。`},
  {title:'考核',detail:'巡店月覆盖率<100%，或报告完整率<100%，或抽查通过率<100%时，绩效打 8 折。'},
  {title:'退回',detail:'第一次未达到上述标准时正式沟通并做改进计划，第二次降级或淘汰，再重新认证。'}
 ]},
 {track:'营运',fromLevel:2,toLevel:3,title:'L2 初级营运督导 → L3 中级营运督导',nominations:[
  '完成督导带教认证',
  '巡店时能按问题清单锁定根因',
  `${operationsStoreCoverage}
${reportRates}`,
  `${tastingKeep}
${profit}`,
  '加盟商问卷满意度达到分公司既定标准（具体目标值由相关负责人确认）'
 ],reviewSummary:'营运没有单独的考察月数，也没有一年内提报次数。',reviewSteps:[
  {title:'退回',detail:'第一次提醒，第二次做改善计划和目标，第三次降级。加盟商满意度未达到要求时，按两次即降级；具体目标值由相关负责人确认。'}
 ]},
 {track:'营运',fromLevel:3,toLevel:4,title:'L3 中级营运督导 → L4 高级营运督导',nominations:[
  '合格营运督导≥1名',
  `暂代区经理期间：
团队巡店月覆盖率≥100%；
${reportRates}；
区域二错门店比例下降`,
  '在店判断标签明确，并能讲清事实依据'
 ],reviewSummary:'营运没有单独的考察月数，也没有一年内提报次数。',reviewSteps:[
  {title:'认证',detail:'看待办追踪完成率、二错等基本面是否改善、分公司绩效季度排名≤30%；待办完成率的具体目标值由相关负责人确认。'},
  {title:'退回',detail:'第一次提醒，第二次做改善计划和目标，第三次降级。'}
 ]},
 {track:'营运',fromLevel:4,toLevel:5,title:'L4 高级营运督导 → L5 初级营运区经理',nominations:[
  bench('团队'),
  `团队巡店参照个人标准：按要求覆盖本人责任门店
纯营≤35店：门店每月覆盖率≥100%；纯营＞35店：A类门店每两月覆盖≥ 1次，其余门店每月覆盖率≥100%；
${reportRates}`,
  '能复核督导的事实和判断，发现区域问题并推动执行'
 ],reviewSummary:'营运没有单独的考察月数，也没有一年内提报次数。',reviewSteps:[
  {title:'退回',detail:'第一次提醒，第二次做改善计划，第三次缩小区域并重新定目标；缩小后仍不达标就退回或降级。如果退步发生在执行巡店上，第二次即降级或淘汰。'}
 ]},
 {track:'营运',fromLevel:5,toLevel:6,title:'L5 初级营运区经理 → L6 中级营运区经理',nominations:['联系所在分公司总经理'],reviewSummary:'这一档由总部高层综合评估。',reviewSteps:[
  {title:'评估方式',detail:'联系所在分公司总经理。'},
  {title:'考核重点',detail:'能判断区域问题并解决落地。能判断 1 到 2 店方案是否合理，并提出 3 到 4 店建议。'}
 ]},
 {track:'营运',fromLevel:6,toLevel:7,title:'L6 中级营运区经理 → L7 高级营运区经理',nominations:['联系所在分公司总经理'],reviewSummary:'这一档由总部高层综合评估。',reviewSteps:[
  {title:'评估方式',detail:'联系所在分公司总经理。'},
  {title:'考核重点',detail:'能给 3 到 4 店加盟商做完整经营诊断，并推动低利润门店改善。'}
 ]},
 {track:'营运',fromLevel:7,toLevel:8,title:'L7 高级营运区经理 → L8 初级营运大区经理',nominations:['联系所在分公司总经理'],reviewSummary:'这一档由总部高层综合评估。',reviewSteps:[
  {title:'评估方式',detail:'联系所在分公司总经理。'},
  {title:'考核重点',detail:'专项方向对、能落地、加盟商接受，区域内营运数据有明显改善。加盟商规划质量经点位专家团验证。'}
 ]},
 {track:'营运',fromLevel:8,toLevel:null,title:'L8 初级营运大区经理及以上',...seniorReview('覆盖初级、中级、高级营运大区经理和营运总监。')},

 {track:'营拓',fromLevel:3,toLevel:4,title:'L3 初级营拓督导 → L4 中级营拓督导',nominations:[
  '完成督导带教认证',
  '巡店时能按问题清单锁定根因',
  `${integratedStoreCoverage}
${reportRates}；
${tastingKeep}
${profit}`,
 ],reviewSummary:'这一步仍在拓展顾问档，没有单独的考察月数和次数。',reviewSteps:[
  {title:'店端',detail:`${integratedStoreCoverage}
报告填写率<100%，或报告完整率<100%，或抽查通过率<100%时，绩效打 8 折。`},
  {title:'拓展',detail:'日常仍是个人落铺，顾问档带宽一年 10 到 12 家。'}
 ]},
 {track:'营拓',fromLevel:4,toLevel:5,title:'L4 中级营拓督导 → L5 高级营拓督导',nominations:[
  '合格营运督导≥1名',
  `暂代区经理时：
团队巡店月覆盖率≥100%；
${reportRates}；
二错比例下降`,
  '在店判断能讲清事实依据',
  '持续满足 Y1 执行巡店与 Y2 问题发现标准'
 ],reviewSummary:'这一步仍在拓展顾问档，没有单独的考察月数和次数。',reviewSteps:[
  {title:'店端',detail:'Y1、Y2 继续保持。退回按营运改善问题的规则：第三次不达标降级。'}
 ]},
 {track:'营拓',fromLevel:5,toLevel:6,title:'L5 高级营拓督导 → L6 营拓主管',nominations:[
  `${integratedStoreCoverage}
${reportRates}；
${tastingKeep}
${profit}`,
 ],reviewSummary:'这一步没有单独的考察月数。Y4 从晋升初级营拓区经理时才开始考核。',reviewSteps:[
  {title:'岗位',detail:'营拓主管仍在拓展顾问档。初级区经理的 Y4-1 不在这一步考核。'}
 ]},
 {track:'营拓',fromLevel:6,toLevel:7,title:'L6 营拓主管 → L7 初级营拓区经理',nominations:[
  tenure(3),
  meetingCount,
  `个人一审${materials}`,
  passRate,
  '明确下一档主战场，并且主战场里已经在带人',
  bench('团队'),
  `团队巡店参照个人标准：按要求覆盖本人责任门店
营拓25–30店：A类门店每两月覆盖≥ 1次，其余门店每月覆盖率≥100%；营拓＜25店：门店每月覆盖率≥100%；
${reportRates}`,
 ],reviewSummary:'拓展考察 3 个月，一个自然年最多 3 次。店端按 Y4-1 同期考核。',reviewSteps:[
  {title:'技能标签',detail:'具备最佳建店方案能力和单点判断能力；专家团随机抽查一个考察期内点位过会视频进行判断评估。'},
  {title:'数据底线',detail:expansionAssessmentData},
  {title:'业绩结果',detail:'近 6 个月新开门店堂食流水不出现低于 2000。'},
  {title:'带教结果',detail:'新人带教通过：完成 5 个不同类型点位过会；团队内拓展顾问不出现连续 3 个月无产能。'},
  {title:'店端',detail:`${bench('团队')}
${integratedStoreCoverage}
${reportRates}。`}
 ]},
 {track:'营拓',fromLevel:7,toLevel:8,title:'L7 初级营拓区经理 → L8 中级营拓区经理',nominations:[
  tenure(3),
  bothData,
  '个人和团队近6个月新开最佳铺占比达到区域既定目标（具体目标值由相关负责人确认）',
  '联系所在分公司总经理，完成 Y4-2 区域问题评估'
 ],reviewSummary:'拓展考察 3 到 6 个月。分公司先评，专家团再核多点位商圈规划。一个自然年最多 2 次。',reviewSteps:[
  {title:'技能标签',detail:'具备多点位商圈规划能力和人址匹配能力。'},
  {title:'数据底线',detail:expansionAssessmentData},
  {title:'业绩结果',detail:'考察期内新开门店堂食流水不出现低于 2000。'},
  {title:'带教结果',detail:'团队内拓展顾问不出现连续 3 个月无产能；新人可单独报备。'},
  {title:'店端',detail:'Y4-2 由总部高层综合评估，联系所在分公司总经理。考核重点是能判断区域问题并解决落地。'}
 ]},
 {track:'营拓',fromLevel:8,toLevel:9,title:'L8 中级营拓区经理 → L9 高级营拓区经理',nominations:[
  tenure(6),
  bothData,
  '个人和团队近6个月新开最佳铺占比达到区域既定目标（具体目标值由相关负责人确认）',
  '联系所在分公司总经理，完成 Y4-3 经营诊断评估'
 ],reviewSummary:'拓展考察 12 个月。一个自然年最多 2 次。',reviewSteps:[
  {title:'技能标签',detail:'具备区域规划能力和加盟商发展能力。'},
  {title:'数据底线',detail:expansionAssessmentData},
  {title:'业绩结果',detail:`${salesMix}。`},
  {title:'带教结果',detail:'团队内拓展顾问不出现连续 3 个月无产能；新人可单独报备。'},
  {title:'店端',detail:'Y4-3 由总部高层综合评估，联系所在分公司总经理。考核重点是 3 到 4 店经营诊断和低利润门店改善。'}
 ]},
 {track:'营拓',fromLevel:9,toLevel:10,title:'L9 高级营拓区经理 → L10 营拓大区经理',nominations:[
  tenure(6),
  teamData,
  '团队近6个月新开最佳铺占比达到区域既定目标（具体目标值由相关负责人确认）',
  '团队里培养出能对质量负责的营拓 L9',
  '联系所在分公司总经理，完成 Y5 专项评估'
 ],reviewSummary:'拓展考察 12 个月。一个自然年最多 2 次。',reviewSteps:[
  {title:'数据底线',detail:expansionAssessmentData},
  {title:'业绩结果',detail:`${salesMix}。`},
  {title:'带教结果',detail:'培养出 1 个 L8；底线是该 L8 规划述职通过并进入考察期。'},
  {title:'店端',detail:'Y5 由总部高层综合评估，联系所在分公司总经理。考核重点是区域营运数据明显改善，专项能落地。'}
 ]},
 {track:'营拓',fromLevel:10,toLevel:null,title:'L10 营拓大区经理及以上',nominations:['联系所在分公司总经理'],reviewSummary:'拓展考察 12 个月。这一档起由总部高层综合评估。覆盖营拓大区经理、高级营拓大区经理和分公司总经理。',reviewSteps:[
  {title:'数据底线',detail:'统计自营拓 L10 起至提报晋升期间的全部工作过程：过会数量底线≥目标数×考察期月数/12；一审过会资料准确率、完整率≥100%；首次过会通过率≥80%。'},
  {title:'业绩结果',detail:`${salesMix}。`},
  {title:'店端',detail:'营运能力由总部高层综合评估，联系所在分公司总经理。'}
 ]}
];
const standards:PromotionStandard[]=standardDefinitions.map(rule=>rule.track==='营运'?{...rule,reviewSummary:`${rule.reviewSummary}考核方式默认是述职。`,reviewSteps:[{title:'考核方式',detail:'默认述职。'},...rule.reviewSteps]}:rule);

const nominationSide=(text:string):'营运'|'拓展'|'共用'=> {
 const operations=/巡店|督导|品鉴|打卡|盈利|Y4|Y5|二错|K项|品质|食安|超时|在店判断|根因/.test(text);
 const expansion=/过会|资料准确|主战场|最佳铺|落铺|点位|商圈|顾问档|培养/.test(text);
 if(operations&&!expansion)return '营运';
 if(expansion&&!operations)return '拓展';
 return '共用';
};
const skillGroupName=(code:string)=>code.startsWith('Y')?'营运技能':code.startsWith('T')?'拓展技能':code.startsWith('S')?'加盟商发展技能':'团队管理技能';
const learningLines=(from:Position,reference:Position,referenceName:string)=>{
 const held=new Set(theoreticalSkillCodes(from));
 const missing=theoreticalSkillCodes(reference).filter(code=>!held.has(code));
 return ['Y','S','T','M'].flatMap(prefix=>{
  const codes=missing.filter(code=>code.startsWith(prefix));
  if(!codes.length)return [];
  const courseBeforePromotion=from.track==='拓展'&&reference.track==='拓展'||prefix==='T';
  return [courseBeforePromotion
   ?`学习${referenceName}对应的${skillGroupName(prefix)} ${codes.join('、')}，课程学习完成后即可提报晋升（技能认证与晋升考察同步进行）`
   :`学习${referenceName}对应的${skillGroupName(prefix)} ${codes.join('、')}，完成学习与认证后再提报晋升`];
 });
};

function transferStandard(from:Position,to:Position,arriving:PromotionStandard):PromotionStandard{
 const own=from.track==='营运'?'营运':'拓展';
 const other=own==='营运'?'拓展':'营运';
 const supervisor=standards.find(item=>item.track==='营拓'&&item.fromLevel===5&&item.toLevel===6);
 const picked=(rule:PromotionStandard,side:'营运'|'拓展'|'共用')=>rule.nominations.filter(item=>nominationSide(item)===side);
 const supervisorRole=positionById('1-6')??to;
 const ownItems=[...picked(arriving,'共用'),...picked(arriving,own)].filter(item=>!/不单独考核|仍在顾问档/.test(item));
 const skillTarget=from.level>=6?supervisorRole:to;
 const skillName=from.level>=6?'营拓主管':to.name;
 const otherItems=learningLines(from,skillTarget,skillName);
 const operationsExam=from.track==='拓展'?picked(from.level>=6?(supervisor??arriving):arriving,'营运'):[];
 const nominations=unique([...ownItems,...otherItems]);
 const held=new Set(theoreticalSkillCodes(from));
 const prerequisiteSkills=from.level>=6?theoreticalSkillCodes(supervisorRole).filter(code=>!held.has(code)):[];
 return {
  ...arriving,
  title:`L${from.level} ${from.name} → L${to.level} ${to.name}`,
  nominations,
  prerequisiteSkills:prerequisiteSkills.length?prerequisiteSkills:undefined,
  reviewSummary:`${from.track==='拓展'?'转营拓先完成营运技能学习与认证再提报，覆盖率、报告等营运数据在提报后考察。':'转营拓按原序列对应要求提报，拓展新技能先完成课程，认证与晋升考察同步进行。'}${arriving.reviewSummary}`,
  reviewSteps:from.track==='拓展'
   ?[{title:'营运考察',detail:`提报后考察营运侧，不作为提报条件。\n${operationsExam.join('\n')}`},...arriving.reviewSteps]
   :arriving.reviewSteps
 };
}

const unique=(items:string[])=>[...new Set(items)];
const withSkillPreparation=(from:Position,to:Position,rule:PromotionStandard):PromotionStandard=>({
 ...rule,
 nominations:unique([...rule.nominations,...learningLines(from,to,to.name)])
});
const incrementalStandard=(track:Track,fromLevel:number)=>{
 const exact=standards.find(item=>item.track===track&&item.fromLevel===fromLevel&&item.toLevel===fromLevel+1);
 if(exact)return exact;
 return standards.find(item=>item.track===track&&item.toLevel===null&&fromLevel>=item.fromLevel);
};

function combinedStandard(from:Position,to:Position):PromotionStandard|undefined{
 const steps=unique(Array.from({length:to.level-from.level},(_,index)=>incrementalStandard(from.track,from.level+index)).filter((item):item is PromotionStandard=>!!item).map(item=>item.title))
  .map(title=>standards.find(item=>item.title===title)!);
 if(!steps.length)return undefined;
 return {
  track:from.track,
  fromLevel:from.level,
  toLevel:to.level,
  title:`L${from.level} ${from.name} → L${to.level} ${to.name}`,
  nominations:unique(steps.flatMap(item=>item.nominations)),
  reviewSummary:steps.map(item=>item.reviewSummary).filter((item,index,items)=>items.indexOf(item)===index).join('；'),
  reviewSteps:steps.flatMap(item=>item.reviewSteps.map(step=>({...step,title:`${item.fromLevel}→${item.toLevel??'高阶'} · ${step.title}`})))
 };
}

export function promotionStandard(from:Position,to:Position):PromotionStandard|undefined{
 if(to.id===from.id||to.level<=from.level)return undefined;
 if(from.track!==to.track&&!canDevelopTo(from,to))return undefined;
 const sameTrack=standards.filter(item=>item.track===(from.track===to.track?from.track:to.track));
 const exact=from.track===to.track?sameTrack.find(item=>item.fromLevel===from.level&&item.toLevel===to.level):undefined;
 if(exact)return withSkillPreparation(from,to,exact);
 if(from.track!==to.track){
  let arriving=sameTrack.find(item=>item.toLevel===to.level)??sameTrack.find(item=>item.toLevel===null&&to.level>=item.fromLevel);
  if(!arriving&&to.track==='营拓'){
   const sameLevelTarget=positions.find(item=>item.track===from.track&&item.level===to.level);
   const sourceRule=sameLevelTarget?promotionStandard(from,sameLevelTarget):undefined;
   if(sourceRule)arriving={...sourceRule,nominations:[],reviewSteps:[],reviewSummary:'转入营拓入门岗位，按目标岗位技能要求完成准备。',track:'营拓',fromLevel:Math.max(1,to.level-1),toLevel:to.level};
  }
  return arriving?transferStandard(from,to,arriving):undefined;
 }
 if(to.level-from.level>1){const combined=combinedStandard(from,to);return combined?withSkillPreparation(from,to,combined):undefined}
 const senior=sameTrack.find(item=>item.toLevel===null&&from.level>=item.fromLevel);
 if(senior)return withSkillPreparation(from,to,senior);
 const fallback=sameTrack.find(item=>item.toLevel===to.level)??sameTrack.find(item=>item.toLevel===null&&to.level>=item.fromLevel);
 return fallback?withSkillPreparation(from,to,fallback):undefined;
}

const skillChains=[['Y1','Y2','Y3','Y4-1','Y4-2','Y4-3','Y5'],['S1','S3','S4-1','S4-2','S4-3','S5'],['T1','T2','T3','T4','T5','T6'],['M1','M2']];
const formatSkillSpan=(codes:string[])=>{
 const present=new Set(codes);
 const parts:string[]=[];
 for(const chain of skillChains){
  const picked=chain.filter(code=>present.has(code));
  let index=0;
  while(index<picked.length){
   let end=index;
   while(end+1<picked.length&&chain.indexOf(picked[end+1])===chain.indexOf(picked[end])+1)end++;
   parts.push(index===end?picked[index]:`${picked[index]} 至 ${picked[end]}`);
   index=end+1;
  }
 }
 return parts.join('、');
};

export function promotionFlow(rule:PromotionStandard):PromotionFlow{
 const operations=rule.reviewSteps.filter(step=>/店端|营运|述职|考核方式/.test(step.title));
 const expansion=rule.reviewSteps.filter(step=>!/店端|营运|述职|考核方式/.test(step.title));
 const hasExpansionSkillAssessment=expansion.some(step=>/技能标签/.test(step.title));
 const durations=[...rule.reviewSummary.matchAll(/考察\s*([^。；]+个月)/g)].map(match=>match[1].replace(/\s+/g,' ')).filter((item,index,items)=>items.indexOf(item)===index);
 const duration=durations.length>1?`${durations.join(' → ')}，分阶段进行`:durations[0]??'按负责人安排';
 const operationsBranch:PromotionFlowBranch={
  track:'营运',
  method:'述职',
  summary:'围绕岗位营运能力、经营结果与团队管理进行述职，由营运负责人按对应职级标准评估。',
  stages:[{title:'联系相关负责人进行述职',detail:'联系营运负责人确认述职时间、材料和参评人员，完成目标岗位能力述职。'}],
  standards:operations.length?operations:rule.track==='营运'?rule.reviewSteps:[{title:'营运能力述职',detail:'按目标岗位对应的营运能力标准完成述职并通过评估。'}]
 };
 const expansionBranch:PromotionFlowBranch={
  track:'拓展',
  method:'考察',
  summary:`${rule.reviewSummary}${hasExpansionSkillAssessment?' 拓展技能认证与晋升考察同步完成。':''}`,
  stages:[
   {title:'联系相关负责人进行述职和（或）安排考察',detail:'由拓展负责人根据岗位要求确认先述职、直接安排考察，或两者同时进行。'},
   {title:`考察周期中（${duration}）`,detail:`在考察周期内按目标岗位标准完成业务实践与数据检核${hasExpansionSkillAssessment?'，并同步完成拓展技能认证':''}。`},
   {title:'最终述职阶段',detail:'汇总考察结果和业务案例完成最终述职，确认拓展能力是否达到晋升标准。'}
  ],
  standards:expansion.length?expansion:rule.track==='拓展'?rule.reviewSteps:[{title:'拓展能力考察',detail:'按目标岗位对应的拓展提名与晋升成功标准完成考察。'}]
 };
 const expansionPostRules=[
  '晋升通过后，若连续 3 个月首次过会通过率低于 80%或资料准确率低于 100%（含 2 次申诉机会）：第一次提醒，第二次制定整改计划或缩小地盘，第三次退回或降级。',
  '拓展暂代最长 3 个月；暂代结束后需提报晋升或退回原岗位。'
 ];
 const prerequisite=rule.prerequisiteSkills?.length?formatSkillSpan(rule.prerequisiteSkills):undefined;
 if(rule.track==='营拓')return {branches:[operationsBranch,expansionBranch],reviewers:['营运负责人','拓展负责人 / 点位专家团','人力 BP'],postRules:expansionPostRules,prerequisite};
 if(rule.track==='营运')return {branches:[operationsBranch],reviewers:['营运负责人','相关业务部门','人力 BP'],postRules:[]};
 return {branches:[expansionBranch],reviewers:['拓展负责人 / 点位专家团','相关业务部门','人力 BP'],postRules:expansionPostRules};
}
