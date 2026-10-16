import json,re
from pathlib import Path
import openpyxl
root=Path(__file__).resolve().parent.parent
sheet=openpyxl.load_workbook(root/'营运拓展营拓技能清单-TO庚涛.xlsx',data_only=True)['技能清单']
roles={
 '营运':{2:11,3:10,4:9,5:8,6:7,7:6,8:5},
 '营拓':{3:11,4:10,5:9,6:8,7:7,8:6,10:5},
 '拓展':{5:9,6:8,7:7,8:6,9:5}
}
cols={'营运':[('E','F','店'),('H','I','人')],'营拓':[('K','L','店'),('N','O','人'),('Q','R','点')],'拓展':[('T','U','人'),('W','X','点'),('Z','AA','团队')]}
output={}
for track,levels in roles.items():
 for level,row in levels.items():
  items=[]
  for codecol,textcol,axis in cols[track]:
   raw_code=sheet[f'{codecol}{row}'].value
   raw_description=sheet[f'{textcol}{row}'].value
   if not raw_code or not raw_description or raw_code=='/':continue
   codes=[c.strip() for c in str(raw_code).splitlines() if c.strip()]
   description=str(raw_description).strip()
   if codes==['T1','T2','T3']:
    descriptions=['摸排执行能力；单点盈利测算能力','点位带看能力','提出最佳铺及可选区间']
   else:descriptions=[description]*len(codes)
   for code,desc in zip(codes,descriptions):
    items.append({'code':code,'axis':axis,'description':desc,'source':f'营运拓展营拓技能清单-TO庚涛.xlsx｜技能清单!{codecol}{row}:{textcol}{row}'})
  output[f"{['营运','营拓','拓展'].index(track)}-{level}"]=items
# 纯营明细表明确 S1 对 L2 即为必备；总表将它排在 L3 行，需补回初级督导。
output['0-2'].append({
 'code':'S1',
 'axis':'人',
 'description':'● 上传下达，加盟商需求响应',
 'source':'营运拓展营拓技能清单-TO庚涛.xlsx｜纯营技能清单!C10:H10'
})
output['1-3'].insert(1,{
 'code':'S1',
 'axis':'人',
 'description':'● 上传下达，加盟商需求响应',
 'source':'营运拓展营拓技能清单-TO庚涛.xlsx｜营拓技能清单!C10:H10'
})
(root/'src'/'position-skills.json').write_text(json.dumps(output,ensure_ascii=False,indent=2))
print(sum(len(x) for x in output.values()),'coded role skill statements')
