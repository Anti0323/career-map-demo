import rules from './promotion-data.json' with { type: 'json' };
import type {Employee,Position} from './data';
export type MetricCheck={label:string;standard:string;current:string;status:'已满足'|'未满足'|'暂无数据'|'待确认'|'不适用'};
export const promotionRule=(from:Position,to:Position)=>rules.find(r=>r.track===from.track&&r.track===to.track&&r.fromLevel===from.level&&r.toLevel===to.level);
export function checkMetric(employee:Employee,key:string,threshold:number,operator:'>='|'>' ,unit:string,period:string,scope:string):MetricCheck{
 const standard=`${operator==='>='?'≥':'＞'}${threshold}${unit} · ${period} · ${scope}`;
 const metric=employee.metrics[key];
 if(!metric||metric.value===undefined)return {label:key,standard,current:'暂无数据',status:'暂无数据'};
 const current=`${metric.value}${metric.unit} · ${metric.period} · ${metric.scope}`;
 if(metric.unit!==unit||metric.period!==period||metric.scope!==scope)return {label:key,standard,current,status:'待确认'};
 return {label:key,standard,current,status:(operator==='>='?metric.value>=threshold:metric.value>threshold)?'已满足':'未满足'};
}
export function promotionMetricChecks(employee:Employee,from:Position,to:Position):MetricCheck[]{const rule=promotionRule(from,to);if(!rule)return [];
 const period=from.level===5&&from.track==='拓展'?'近三个月':'近六个月';const scope=from.level===5&&from.track==='拓展'?'个人':'个人+团队';
 const checks:MetricCheck[]=[
 {...checkMetric(employee,'accuracy',100,'>=','%',period,scope),label:'一审过会资料准确/完整度'},
 {...checkMetric(employee,'first-pass',80,'>=','%',period,scope),label:'首次过会通过率'}
 ];
 if((from.track==='拓展'&&from.level>=7)||(from.track==='营拓'&&from.level>=8)){checks.push({...checkMetric(employee,'count-completion',65,'>=','%','近六个月','主战场'),label:'数量目标完成率'});checks.push({...checkMetric(employee,'store-3000-share',40,'>=','%','近六个月','主战场'),label:'新开堂食流水3000以上占比'});}
 return checks;}