import test from 'node:test';
import assert from 'node:assert/strict';
import {positions,tracks} from './data.ts';
import {focusRoles,promotionOutOfScope} from './career-focus.ts';
import {promotionFlow,promotionStandard} from './promotion-standards.ts';

const p=(id:string)=>positions.find(item=>item.id===id)!;

test('promotion standards follow the rank map for each next step',()=>{
 const rule=(from:string,to:string)=>promotionStandard(p(from),p(to));
 assert.equal(rule('2-5','2-6')?.title,'L5 拓展顾问 → L6 拓展区经理');
 assert.equal(rule('2-8','2-9')?.nominations.includes('靠自己带教，培养出能对质量负责的纯拓 L8'),true);
 assert.equal(rule('2-9','2-11')?.nominations[0],'联系所在分公司总经理');
 assert.equal(rule('0-1','0-2')?.reviewSteps[0].detail,'默认述职。');
 assert.equal(rule('0-1','0-2')?.nominations[0].includes('纯营≤35店'),true);
 assert.equal(rule('1-3','1-4')?.nominations.some(item=>item.includes('营拓＜25店')),true);
 assert.equal(rule('0-1','0-2')?.nominations.some(item=>item==='巡店覆盖达标、巡店质量达标'),false);
 assert.equal(rule('0-7','0-8')?.reviewSteps[0].title,'考核方式');
 assert.equal(rule('2-5','2-6')?.reviewSteps.some(step=>step.detail==='默认述职。'),false);
 assert.equal(rule('0-4','0-5')?.nominations[0].includes('K项合格率'),true);
 assert.equal(rule('0-1','0-2')?.nominations.some(item=>item.includes('报告填写率≥100%')),true);
 assert.equal(rule('2-5','2-6')?.nominations.some(item=>item.includes('在岗时长≥3个月')),true);
 assert.equal(rule('0-5','0-6')?.nominations[0],'联系所在分公司总经理');
 assert.equal(rule('0-7','0-8')?.reviewSummary.includes('总部高层'),true);
 assert.equal(rule('1-5','1-6')?.title,'L5 高级营拓督导 → L6 营拓主管');
 assert.equal(rule('1-6','1-7')?.nominations.some(item=>item.includes('主战场')),true);
 assert.equal(rule('1-6','1-7')?.reviewSummary.includes('3 个月'),true);
 assert.equal(rule('1-9','1-10')?.nominations.some(item=>item.includes('具体目标值由相关负责人确认')),true);
 assert.equal(rule('1-10','1-12')?.nominations[0],'联系所在分公司总经理');
 assert.equal(rule('2-6','2-5'),undefined);
 assert.equal(rule('0-4','1-7'),undefined);
 assert.equal(rule('0-8','1-9')?.title,'L8 初级营运大区经理 → L9 高级营拓区经理');
 assert.equal(rule('0-8','1-9')?.nominations.some(item=>item.includes('Y4-3')),true);
 assert.equal(rule('0-8','1-9')?.nominations.some(item=>item.includes('学习营拓主管对应的拓展技能 T1、T2、T3、T4')),true);
 assert.equal(rule('0-8','1-9')?.nominations.some(item=>item.includes('顾问档')),false);
 assert.equal(rule('0-8','1-9')?.nominations.some(item=>item.includes('T5')),false);
 assert.equal(rule('0-8','1-9')?.nominations.some(item=>item.includes('最佳铺')),false);
 assert.equal(rule('0-6','1-7')?.nominations.some(item=>item.includes('学习营拓主管对应的拓展技能 T1、T2、T3、T4')),true);
 assert.equal(rule('0-4','1-5')?.nominations.some(item=>item.includes('合格营运督导')),true);
 assert.equal(rule('0-4','1-5')?.nominations.some(item=>item.includes('拓展技能 T1')),true);
 assert.equal(rule('0-1','1-3')?.nominations.some(item=>item.includes('加盟商问卷满意度')),false);
 assert.equal(rule('0-1','1-3')?.nominations.some(item=>item.includes('学习初级营拓督导对应的营运技能 Y1')),true);
 assert.equal(rule('0-1','1-3')?.nominations.some(item=>item.includes('拓展技能 T1')),true);
 assert.equal(rule('2-5','1-6')?.nominations.some(item=>item.includes('顾问档')),false);
 assert.equal(rule('1-5','1-6')?.nominations.some(item=>item.includes('顾问档')),false);
 assert.equal(rule('2-5','1-6')?.nominations.some(item=>item.includes('营运技能 Y1、Y2、Y3、Y4-1')),true);
 assert.equal(rule('2-5','1-6')?.nominations.some(item=>item.includes('加盟商发展技能 S1、S4-1')),true);
 assert.equal(rule('2-5','1-6')?.nominations.some(item=>item.includes('拓展技能 T4')),true);
 assert.equal(rule('2-5','1-6')?.nominations.some(item=>item.includes('T1、T2')),false);
 assert.equal(rule('2-5','1-6')?.nominations.some(item=>item.includes('巡店')||item.includes('报告填写')),false);
 assert.equal(rule('2-5','1-6')?.reviewSteps.some(step=>step.title==='营运考察'&&step.detail.includes('报告填写')),true);
 assert.equal(rule('2-8','1-10')?.nominations.some(item=>item.includes('最佳铺')),true);
 assert.equal(rule('2-8','1-10')?.nominations.some(item=>item.includes('学习营拓主管对应的营运技能 Y1、Y2、Y3、Y4-1')),true);
 assert.equal(rule('2-8','1-10')?.nominations.some(item=>item.includes('加盟商发展技能 S1')),true);
 assert.equal(rule('2-8','1-10')?.nominations.some(item=>/拓展技能 T/.test(item)),false);
 assert.equal(rule('2-8','1-10')?.nominations.some(item=>item.includes('营拓＜25店')||item.includes('报告填写')),false);
 assert.equal(rule('2-8','1-10')?.reviewSteps.some(step=>step.detail.includes('营拓＜25店')),true);
 const entryTransfer=rule('0-1','1-3')!;
 assert.equal(entryTransfer.nominations.filter(item=>item.includes('加盟商发展技能 S1')).length,1);
 assert.equal(entryTransfer.nominations.some(item=>item.includes('中级营运督导对应的加盟商发展技能')),false);
 assert.equal(entryTransfer.nominations.some(item=>item.includes('初级营拓督导对应的加盟商发展技能 S1')),true);
});

test('every reachable promotion has complete nomination standards',()=>{
 for(const from of positions){
  if(promotionOutOfScope(from))continue;
  const targets=tracks.flatMap(track=>focusRoles(from,track)).filter(role=>role.position.id!==from.id);
  assert.ok(targets.length>0,`${from.id} ${from.name} should have a reachable target`);
  for(const {position:to} of targets){
   const rule=promotionStandard(from,to);
   assert.ok(rule,`${from.name} → ${to.name} should have a promotion standard`);
   assert.ok(rule.nominations.length>0,`${from.name} → ${to.name} should have nomination requirements`);
  }
 }
});

test('two-level promotions accumulate every intermediate prerequisite',()=>{
 const operation=promotionStandard(p('0-1'),p('0-3'))!;
 assert.equal(operation.nominations.some(item=>item.includes('过去三个月滚动食安二错门店')),true);
 assert.equal(operation.nominations.some(item=>item.includes('完成督导带教认证')),true);
 const expansion=promotionStandard(p('2-6'),p('2-8'))!;
 assert.equal(expansion.nominations.some(item=>item.includes('在岗时长≥3个月')),true);
 assert.equal(expansion.nominations.some(item=>item.includes('在岗时长≥6个月')),true);
});

test('promotion flow uses the correct single or dual ability path',()=>{
 const operation=promotionFlow(promotionStandard(p('0-2'),p('0-3'))!);
 assert.deepEqual(operation.branches.map(branch=>[branch.track,branch.method]),[['营运','述职']]);
 assert.deepEqual(operation.branches[0].stages.map(stage=>stage.title),['联系相关负责人进行述职']);
 const expansion=promotionFlow(promotionStandard(p('2-5'),p('2-6'))!);
 assert.deepEqual(expansion.branches.map(branch=>[branch.track,branch.method]),[['拓展','考察']]);
 assert.equal(expansion.postRules.length,2);
 assert.ok(expansion.postRules.some(item=>item.includes('拓展暂代最长 3 个月')));
 assert.deepEqual(expansion.branches[0].stages.map(stage=>stage.title),[
  '联系相关负责人进行述职和（或）安排考察',
  '考察周期中（3 个月）',
  '最终述职阶段'
 ]);
 const integrated=promotionFlow(promotionStandard(p('1-7'),p('1-8'))!);
 assert.deepEqual(integrated.branches.map(branch=>[branch.track,branch.method]),[['营运','述职'],['拓展','考察']]);
 assert.equal(integrated.postRules.length,2);
 assert.equal(integrated.branches[0].stages.length,1);
 assert.equal(integrated.branches[1].stages.length,3);
 assert.equal(integrated.branches[1].stages[1].title,'考察周期中（3 到 6 个月）');
 const transfer=promotionFlow(promotionStandard(p('2-6'),p('1-7'))!);
 assert.deepEqual(transfer.branches.map(branch=>branch.track),['营运','拓展']);
 assert.equal(transfer.branches[1].stages[1].title,'考察周期中（3 个月）');
 assert.ok(transfer.branches[1].standards.some(step=>step.detail.includes('最佳建店方案能力')));
 const noFixedDuration=promotionFlow(promotionStandard(p('1-5'),p('1-6'))!);
 assert.equal(noFixedDuration.branches[1].stages[1].title,'考察周期中（按负责人安排）');
 const twoLevel=promotionFlow(promotionStandard(p('2-5'),p('2-7'))!);
 assert.equal(twoLevel.branches[0].stages[1].title,'考察周期中（3 个月 → 3 到 6 个月，分阶段进行）');
 const senior=promotionFlow(promotionStandard(p('2-9'),p('2-10'))!);
 assert.equal(senior.branches[0].stages[1].title,'考察周期中（12 个月）');
 assert.doesNotMatch(senior.branches[0].summary,/技能认证/);
 assert.match(expansion.branches[0].summary,/技能认证与晋升考察同步完成/);
 assert.deepEqual(operation.postRules,[]);
});

test('mid and senior transfers into 营拓 assess supervisor skills after the responsible review',()=>{
 const seniorOperations=promotionFlow(promotionStandard(p('0-7'),p('1-8'))!);
 assert.equal(seniorOperations.prerequisite,'T1 至 T4');
 const districtOperations=promotionFlow(promotionStandard(p('0-6'),p('1-7'))!);
 assert.equal(districtOperations.prerequisite,'T1 至 T4');
 const expansion=promotionFlow(promotionStandard(p('2-8'),p('1-10'))!);
 assert.equal(expansion.prerequisite,'Y1 至 Y4-1、S1');
 assert.equal(promotionFlow(promotionStandard(p('0-1'),p('1-3'))!).prerequisite,undefined);
 assert.equal(promotionFlow(promotionStandard(p('0-2'),p('0-3'))!).prerequisite,undefined);
 assert.equal(promotionFlow(promotionStandard(p('1-7'),p('1-8'))!).prerequisite,undefined);
});

test('operations certify before submission while expansion certifies during review',()=>{
 const operations=promotionStandard(p('0-1'),p('0-2'))!.nominations.join('\n');
 assert.match(operations,/营运技能 Y1.*完成学习与认证后再提报晋升/);
 const expansion=promotionStandard(p('2-5'),p('2-6'))!.nominations.join('\n');
 assert.match(expansion,/拓展技能 T4.*课程学习完成后即可提报晋升（技能认证与晋升考察同步进行）/);
 assert.doesNotMatch(expansion,/拓展技能 T4.*完成学习与认证后再提报/);
 const integrated=promotionStandard(p('1-4'),p('1-5'))!.nominations.join('\n');
 assert.match(integrated,/营运技能 Y3.*完成学习与认证后再提报晋升/);
 assert.match(integrated,/拓展技能 T3.*技能认证与晋升考察同步进行/);
});

test('spreadsheet prerequisite signatures are present for every adjacent rank',()=>{
 const expected:[string,string,string[]][]=[
  ['0-1','0-2',['巡店覆盖','食安二错门店','新品打卡','盈利数据']],
  ['0-2','0-3',['督导带教认证','问题清单锁定根因','加盟商问卷满意度']],
  ['0-3','0-4',['合格营运督导≥1名','区域二错门店比例下降','在店判断标签明确']],
  ['0-4','0-5',['团队前三个月均值','团队巡店参照个人标准','复核督导']],
  ['0-5','0-6',['联系所在分公司总经理']],
  ['0-6','0-7',['联系所在分公司总经理']],
  ['0-7','0-8',['联系所在分公司总经理']],
  ['0-8','0-9',['联系所在分公司总经理']],
  ['1-3','1-4',['督导带教认证','营拓25–30店','盈利数据']],
  ['1-4','1-5',['合格营运督导≥1名','二错比例下降','在店判断']],
  ['1-5','1-6',['营拓25–30店','盈利数据']],
  ['1-6','1-7',['在岗时长≥3个月','首次过会通过率≥80%','团队前三个月均值']],
  ['1-7','1-8',['在岗时长≥3个月','个人和团队','联系所在分公司总经理']],
  ['1-8','1-9',['在岗时长≥6个月','个人和团队','联系所在分公司总经理']],
  ['1-9','1-10',['在岗时长≥6个月','团队近6个月新开最佳铺','联系所在分公司总经理']],
  ['1-10','1-11',['联系所在分公司总经理']],
  ['2-5','2-6',['在岗时长≥3个月','过会数量≥目标数×时间进度','主战场']],
  ['2-6','2-7',['在岗时长≥3个月','个人和团队','新开最佳铺占比']],
  ['2-7','2-8',['在岗时长≥6个月','个人和团队','新开最佳铺占比']],
  ['2-8','2-9',['在岗时长≥6个月','团队近6个月新开最佳铺','纯拓 L8']],
  ['2-9','2-10',['联系所在分公司总经理']]
 ];
 for(const [from,to,fragments] of expected){
  const text=promotionStandard(p(from),p(to))!.nominations.join('\n');
  for(const fragment of fragments)assert.ok(text.includes(fragment),`${from} → ${to} is missing ${fragment}`);
 }
});

test('submission requirements contain no explanatory rows, placeholders or duplicates',()=>{
 for(const from of positions){
  for(const to of positions){
   const rule=promotionStandard(from,to);
   if(!rule)continue;
   assert.equal(rule.nominations.some(item=>/拓展侧仍在顾问档|本步不单独考核|≥xxx|原表未写/.test(item)),false,rule.title);
   assert.equal(rule.nominations.some(item=>!item.trim()),false,rule.title);
   assert.equal(new Set(rule.nominations).size,rule.nominations.length,rule.title);
  }
 }
});

test('expansion assessment criteria preserve the spreadsheet detail for every rank',()=>{
 const cases:[string,string,string[]][]=[
  ['2-5','2-6',['最佳建店方案能力','单点判断能力','资料准确率、完整率≥100%','近 6 个月新开门店堂食流水','5 个不同类型点位']],
  ['2-6','2-7',['多点位商圈规划能力','人址匹配能力','首次过会通过率≥80%','考察期内新开门店堂食流水','新人可单独报备']],
  ['2-7','2-8',['区域规划能力','加盟商发展能力','过会数量底线≥目标数×考察期月数/12','数量目标完成率≥90%','连续 3 个月无产能']],
  ['2-8','2-9',['资料准确率、完整率≥100%','新开店堂食流水3000以上占比≥40%','培养出 1 个 L8']],
  ['2-9','2-10',['统计自纯拓 L9 起','首次过会通过率≥80%','申请提前晋升时，数量完成率≥65%']],
  ['1-8','1-9',['区域规划能力','加盟商发展能力','数据底线','带教结果']],
  ['1-9','1-10',['过会数量底线≥目标数×考察期月数/12','培养出 1 个 L8']],
  ['1-10','1-11',['统计自营拓 L10 起','新开店堂食流水3000以上占比≥40%']]
 ];
 for(const [from,to,fragments] of cases){
  const text=promotionFlow(promotionStandard(p(from),p(to))!).branches.find(branch=>branch.track==='拓展')!.standards.map(step=>`${step.title}\n${step.detail}`).join('\n');
  for(const fragment of fragments)assert.ok(text.includes(fragment),`${from} → ${to} is missing ${fragment}`);
 }
});

test('expansion assessment periods match every spreadsheet rank column',()=>{
 const cases:[string,string,string][]=[
  ['2-5','2-6','3 个月'],
  ['2-6','2-7','3 到 6 个月'],
  ['2-7','2-8','12 个月'],
  ['2-8','2-9','12 个月'],
  ['2-9','2-10','12 个月'],
  ['1-6','1-7','3 个月'],
  ['1-7','1-8','3 到 6 个月'],
  ['1-8','1-9','12 个月'],
  ['1-9','1-10','12 个月'],
  ['1-10','1-11','12 个月']
 ];
 for(const [from,to,duration] of cases){
  const branch=promotionFlow(promotionStandard(p(from),p(to))!).branches.find(item=>item.track==='拓展')!;
  assert.equal(branch.stages[1].title,`考察周期中（${duration}）`,`${from} → ${to}`);
 }
});
