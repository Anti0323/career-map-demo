import test from 'node:test';
import assert from 'node:assert/strict';
import positionSkills from './position-skills.json' with {type:'json'};
import {comparePositions,courseLearningRequirementMet,demoGaps,demoPromotionResults,initialData,learningRequirementMet,sanitizeData,skillGaps,routeInfo} from './logic.ts';
import {positions,requirements,skills} from './data.ts';
const p=(id:string)=>positions.find(x=>x.id===id)!;
test('plans stay isolated and invalid storage safely restores',()=>{const d=initialData();d.plans.e1.goalId='1-7';assert.equal(d.plans.e2.goalId,undefined);assert.equal(sanitizeData(d).plans.e1.goalId,'1-7');assert.equal(sanitizeData({broken:true}).employees.length,positions.length)});
test('every position has the written current duty',()=>{assert.equal(positions.every(position=>position.duties.length>0),true);assert.deepEqual(p('0-1').duties,['在指导下熟悉门店日常和巡店标准。','正在学习巡店稽核、出品品鉴和利润核算。']);assert.equal(p('0-10').duties[0].includes('统筹多个区域'),true);assert.equal(p('2-5').duties[0].includes('加盟商是否在店'),true);assert.equal(p('2-8').duties.join('').includes('5 店以上'),true);assert.equal(p('1-12').duties[0].includes('分公司'),true);});
test('stale IDs are removed',()=>{const d=initialData();d.plans.e1.favoriteSkills=['missing'];d.plans.e1.goalId='missing';assert.deepEqual(sanitizeData(d).plans.e1.favoriteSkills,[]);assert.equal(sanitizeData(d).plans.e1.goalId,undefined)});
test('default employees own every skill required by their current position',()=>{const d=initialData();for(const employee of d.employees){assert.ok(skillGaps(employee,p(employee.positionId)).every(gap=>!gap.missing),employee.id)}});
test('default employees already hold every skill of the current position',async()=>{const {theoreticalSkillCodes}=await import('./position-skill-codes.ts');const d=initialData();for(const employee of d.employees){const role=p(employee.positionId);const held=new Set(theoreticalSkillCodes(role));for(const code of held){const skill=skills.find(item=>item.code===code)!;assert.equal(employee.skills[skill.id]?.status,'已认证',`${role.name} ${code}`)}for(const [id,record] of Object.entries(employee.skills)){if(record.status!=='已认证')continue;const code=skills.find(item=>item.id===id)?.code;assert.equal(held.has(code||''),true,`${role.name} should not hold ${code}`)}}});
test('saved demos drop skills the position does not hold',()=>{const d=initialData();const employee=d.employees.find(item=>item.positionId==='0-7')!;employee.skills['skill-y5']={status:'已认证',level:1,date:employee.since};employee.skills['skill-s5']={status:'已认证',level:1,date:employee.since};const saved=sanitizeData({...d,schemaVersion:6}).employees.find(item=>item.positionId==='0-7')!;assert.equal(saved.skills['skill-y5'],undefined);assert.equal(saved.skills['skill-s5'],undefined);assert.equal(saved.skills['skill-y4-3']?.status,'已认证');});
test('初级营运督导 holds Y1, and S1 starts at 中级营运督导',()=>{const d=initialData();const junior=d.employees.find(item=>item.positionId==='0-2')!;const codes=requirements.filter(requirement=>requirement.positionId==='0-2').map(requirement=>skills.find(skill=>skill.id===requirement.skillId)?.code);assert.deepEqual(codes,['Y1']);assert.equal(junior.skills['skill-y1']?.status,'已认证');assert.equal(junior.skills['skill-s1'],undefined);const mid=d.employees.find(item=>item.positionId==='0-3')!;assert.equal(mid.skills['skill-s1']?.status,'已认证');});
test('S1 stays certified from junior to intermediate integrated supervisor',()=>{const d=initialData();const employee=d.employees.find(item=>item.positionId==='1-3')!;const currentCodes=requirements.filter(r=>r.positionId==='1-3').map(r=>skills.find(s=>s.id===r.skillId)?.code);assert.deepEqual(currentCodes,['Y1','S1','T1']);assert.equal(employee.skills['skill-s1']?.status,'已认证');const s1=skillGaps(employee,p('1-4')).find(gap=>gap.requirement.skillId==='skill-s1');assert.equal(s1?.missing,false);assert.equal(s1?.state,'已达到')});
test('missing records never count as attainment',()=>{const d=initialData();delete d.employees[0].skills['skill-y3'];assert.ok(skillGaps(d.employees[0],p('0-4')).some(x=>x.missing));assert.ok(demoGaps(d.employees[0],p('1-7')).some(x=>x.missing))});
test('soft qualities are not certification gaps or individual position deltas',()=>{const d=initialData();const group=(id:string)=>skills.find(skill=>skill.id===id)?.group;assert.ok(skillGaps(d.employees[0],p('0-4')).every(gap=>group(gap.requirement.skillId)!=='软性素质'));assert.ok(comparePositions(p('0-4'),p('0-6')).every(delta=>group(delta.skillId)!=='软性素质'))});
test('same skill requirement changes are tracked',()=>{const d=comparePositions(p('0-4'),p('0-5'));assert.ok(d.some(x=>x.type==='新增'||x.type==='层次提升'))});
test('promotion demo data includes stable passing and blocked employees',()=>{assert.deepEqual(demoPromotionResults('e1',3),[true,true,true]);assert.deepEqual(demoPromotionResults('e2',3),[false,true,true]);assert.deepEqual(demoPromotionResults('e4',3),[true,false,true]);});
test('transfer skill learning stays unmet until every named skill is certified',()=>{const d=initialData();const employee=d.employees.find(item=>item.positionId==='0-3')!;const text='学习中级营拓督导对应的拓展技能 T1、T2，完成学习与认证后再提报考核';assert.equal(learningRequirementMet(employee,text),false);assert.equal(learningRequirementMet(employee,'联系所在分公司总经理，完成 Y4-3 经营诊断评估'),undefined);const t1=skills.find(skill=>skill.code==='T1')!;const t2=skills.find(skill=>skill.code==='T2')!;employee.skills[t1.id]={status:'已认证',level:1};assert.equal(learningRequirementMet(employee,text),false);employee.skills[t2.id]={status:'已认证',level:1};assert.equal(learningRequirementMet(employee,text),true);});
test('expansion coursework unlocks submission before skill certification',()=>{const d=initialData();const employee=d.employees.find(item=>item.positionId==='2-5')!;const plan=d.plans[employee.id];const text='学习拓展区经理对应的拓展技能 T4，课程学习完成后即可提报晋升（技能认证与晋升考察同步进行）';delete plan.learning['skill-t4'];assert.equal(courseLearningRequirementMet(employee,plan,text),false);plan.learning['skill-t4']='学习中';assert.equal(courseLearningRequirementMet(employee,plan,text),false);plan.learning['skill-t4']='待认证';assert.equal(courseLearningRequirementMet(employee,plan,text),true);assert.equal(employee.skills['skill-t4'],undefined);});
test('skill assessments stay separated by job track',()=>{const s3=skills.find(skill=>skill.code==='S3')!;assert.equal(s3.assessments.营运,'培训+考试+述职评估');assert.equal(s3.assessments.营拓,'培训+考试+述职评估');assert.equal(s3.assessments.拓展,'培训+考试+月度检核');const t4=skills.find(skill=>skill.code==='T4')!;assert.equal(t4.assessments.营拓,'培训+考试+述职评估');assert.equal(t4.assessments.拓展,'培训+考试+复盘');assert.equal(skills.find(skill=>skill.code==='M1')?.assessment,'团队结果检核+带教复盘');assert.equal(skills.find(skill=>skill.code==='M2')?.assessment,'团队建设评估+案例复盘');for(const code of ['S1','Y5','T2'])assert.equal(skills.find(skill=>skill.code===code)?.course,'无需单独课程');for(const skill of skills){assert.equal(skill.assessment.includes(' + '),false,`${skill.code} assessment should not concatenate tracks`);for(const value of Object.values(skill.assessments)){assert.equal(value.includes(' + '),false,`${skill.code} track assessment should not concatenate methods`);assert.equal(value.includes('\n'),false,`${skill.code} track assessment should be one clear method`);}}});
test('operation area-manager skills follow the 技能清单 sheet',()=>{
 const codes=(id:string)=>requirements.filter(r=>r.positionId===id).map(r=>skills.find(s=>s.id===r.skillId)?.code);
 assert.deepEqual(codes('0-5'),['Y4-1','S4-1','M1']);
 assert.deepEqual(codes('0-6'),['Y4-2','S4-2']);
 assert.deepEqual(codes('0-7'),['Y4-3','S4-3','M2']);
 assert.ok(['0-5','0-6','0-7'].flatMap(codes).every(code=>!code?.startsWith('T')));
});
test('every mapped position requirement matches the 技能清单 sheet',()=>{
 for(const [positionId,items] of Object.entries(positionSkills)){
  const actual=requirements.filter(r=>r.positionId===positionId).map(r=>skills.find(s=>s.id===r.skillId)?.code);
  assert.deepEqual(actual,items.map(item=>item.code),positionId);
 }
});
test('route details match one or two level promotions and integrated transfers',()=>{
 assert.equal(routeInfo(p('0-4'),p('0-5')).kind,'同序列');
 assert.equal(routeInfo(p('0-4'),p('0-6')).kind,'无晋升路径');
 assert.equal(routeInfo(p('0-3'),p('0-5')).kind,'同序列');
 assert.equal(routeInfo(p('0-4'),p('0-7')).kind,'无晋升路径');
 assert.equal(routeInfo(p('0-4'),p('1-4')).kind,'无晋升路径');
 assert.equal(routeInfo(p('0-4'),p('1-5')).kind,'转岗探索');
 assert.equal(routeInfo(p('0-4'),p('1-6')).kind,'转岗探索');
 assert.equal(routeInfo(p('0-4'),p('1-7')).kind,'无晋升路径');
 assert.equal(routeInfo(p('2-5'),p('1-7')).kind,'无晋升路径');
 assert.equal(routeInfo(p('2-5'),p('1-6')).kind,'转岗探索');
 assert.equal(routeInfo(p('2-5'),p('0-6')).kind,'无晋升路径');
 assert.equal(routeInfo(p('1-7'),p('2-8')).kind,'无晋升路径');
});
test('metric comparison preserves threshold, period and scope',async()=>{const {checkMetric}=await import('./promotion.ts');const d=initialData();const e=d.employees[1];assert.equal(checkMetric(e,'first-pass',80,'>=','%','近三个月','个人').status,'未满足');assert.equal(checkMetric(e,'first-pass',80,'>=','%','近六个月','个人').status,'待确认');assert.equal(checkMetric(e,'missing',80,'>=','%','近三个月','个人').status,'暂无数据');e.metrics['first-pass'].value=80;assert.equal(checkMetric(e,'first-pass',80,'>','%','近三个月','个人').status,'未满足')});
