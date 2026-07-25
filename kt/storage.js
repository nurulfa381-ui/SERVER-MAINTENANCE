window.SHStorage={
key:"serverHeroV5State",
legacyKeys:["serverHeroV4Locked","serverHeroV4State"],
defaults(){return{
lang:null,
student:null,
projector:false,
theme:"dark",
unlocked:1,
completedKP:[],
ktScores:{},
xp:0,
coins:0,
badges:[],
achievements:[],
history:[],
lastLogin:null
}},
load(){
try{
let raw=localStorage.getItem(this.key);
if(!raw){
for(const k of this.legacyKeys){
raw=localStorage.getItem(k);
if(raw)break;
}
}
const d=raw?JSON.parse(raw):null;
return d?{...this.defaults(),...d}:this.defaults();
}catch(e){return this.defaults()}
},
save(s){
s.lastLogin=new Date().toISOString();
localStorage.setItem(this.key,JSON.stringify(s));
},
clear(){localStorage.removeItem(this.key)},
exportJSON(state){
const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
const a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="server-hero-progress.json";
a.click();
URL.revokeObjectURL(a.href);
},
exportCSV(state){
const score=n=>Number(state.ktScores?.[String(n)]??state.ktScores?.[`kt${String(n).padStart(2,"0")}`]??state.ktScores?.[`KT${String(n).padStart(2,"0")}`]??0);
const allScores=Array.from({length:10},(_,i)=>score(i+1));
const rows=[["Nama","ID","KP Selesai","KT Lulus","Purata","XP","Coin","Level",...allScores.map((_,i)=>`KT${String(i+1).padStart(2,"0")}`)],
[
state.student?.name||"",
state.student?.id||"",
Math.min((state.completedKP||[]).filter(n=>n>=1&&n<=10).length,10),
allScores.filter(v=>v>=60).length,
allScores.filter(v=>v>0).length?Math.round(allScores.filter(v=>v>0).reduce((a,b)=>a+b,0)/allScores.filter(v=>v>0).length):0,
state.xp||0,
state.coins||0,
1+Math.floor((state.xp||0)/500),
...allScores
]];
const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
const a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="server-hero-report.csv";
a.click();
URL.revokeObjectURL(a.href);
}
};
