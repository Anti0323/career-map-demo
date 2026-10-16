import json
from pathlib import Path
import openpyxl
root=Path(__file__).resolve().parent.parent
s=openpyxl.load_workbook(root/'营运拓展营拓技能清单-TO庚涛.xlsx',data_only=True)['技能清单']
rows={'营运':{2:11,3:10,4:9,5:8,6:7,7:6,8:5},'营拓':{3:11,4:10,5:9,6:8,7:7,8:6,10:5},'拓展':{5:9,6:8,7:7,8:6,9:5}}
cols={'营运':['F','I'],'营拓':['L','O','R'],'拓展':['U','X','AA']}
items={}
for track,levels in rows.items():
 for level,row in levels.items():
  if level>=8:continue
  b=str(s[f'B{row}'].value or s[f'B{9 if row>=9 else 6}'].value or '')
  duties=[str(s[f'{c}{row}'].value).strip() for c in cols[track] if s[f'{c}{row}'].value not in (None,'/')]
  id=f"{['营运','营拓','拓展'].index(track)}-{level}"
  items[id]={'positioning':b,'duties':duties,'outcome':b.split('，')[-1] if '负责' in b else '标准待补充','scope':'单店' if row>=9 else '区域','source':f'营运拓展营拓技能清单-TO庚涛.xlsx｜技能清单!B{row}、'+','.join(f'{c}{row}' for c in cols[track]),'detailConfirmed':True}
(root/'src'/'position-details.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
print(len(items),'position details')
