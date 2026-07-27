(function(){
  const KEY = "c05ServerMaintenanceState";
  const TEACHER_PIN = "0505";
  const ADMIN_PIN = "2019";
  const cleanId = value => String(value || "").trim().toUpperCase();
  const ktKey = n => `kt${String(Number(n)).padStart(2,"0")}`;
  const clamp = value => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

  function defaults(){
    return {
      lang:"ms", student:null, xp:0, coins:0, level:1,
      unlockedKP:1, unlocked:1, completedKP:[], completedKT:[],
      practiceScores:{}, practiceBestScores:{}, practiceAttempts:{},
      officialKTScores:{}, officialKTLocked:{}, officialRecords:{},
      ktScores:{}, ktBestScores:{}, ktAttempts:{},
      badges:[], projector:false, audio:true
    };
  }

  function asObject(v){ return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
  function asArray(v){ return Array.isArray(v) ? v : []; }

  function normalize(raw){
    const state = {...defaults(), ...asObject(raw)};
    state.completedKP = asArray(state.completedKP);
    state.badges = asArray(state.badges);
    state.practiceScores = asObject(state.practiceScores);
    state.practiceBestScores = asObject(state.practiceBestScores);
    state.practiceAttempts = asObject(state.practiceAttempts);
    state.officialKTScores = asObject(state.officialKTScores);
    state.officialKTLocked = asObject(state.officialKTLocked);
    state.officialRecords = asObject(state.officialRecords);

    // Migrasi keputusan latihan daripada versi lama.
    const legacyScores = asObject(state.ktScores);
    const legacyBest = asObject(state.ktBestScores);
    const legacyAttempts = asObject(state.ktAttempts);
    for(let i=1;i<=10;i++){
      const key=ktKey(i), aliases=[key,String(i),`KT${String(i).padStart(2,"0")}`];
      const latest = aliases.map(k=>Number(legacyScores[k]||0)).reduce((a,b)=>Math.max(a,b),0);
      const best = aliases.map(k=>Number(legacyBest[k]||0)).reduce((a,b)=>Math.max(a,b),latest);
      if(latest>0 && !Object.prototype.hasOwnProperty.call(state.practiceScores,key)) state.practiceScores[key]=latest;
      if(best>0) state.practiceBestScores[key]=Math.max(Number(state.practiceBestScores[key]||0),best);
      const attempts=aliases.map(k=>Number(legacyAttempts[k]||0)).reduce((a,b)=>Math.max(a,b),0);
      if(attempts>0) state.practiceAttempts[key]=Math.max(Number(state.practiceAttempts[key]||0),attempts);
    }

    syncCurrentOfficial(state);
    recomputeOfficialProgress(state);
    exposePracticeAliases(state);
    return state;
  }

  function exposePracticeAliases(state){
    state.ktScores={...state.practiceScores};
    state.ktBestScores={...state.practiceBestScores};
    state.ktAttempts={...state.practiceAttempts};
  }

  function ensureRecord(state, student){
    const id=cleanId(student?.id);
    if(!id) return null;
    const old=asObject(state.officialRecords[id]);
    state.officialRecords[id]={
      name:String(student?.name || old.name || "").trim(),
      id,
      className:String(student?.className || old.className || "").trim(),
      scores:asObject(old.scores), locked:asObject(old.locked),
      attempts:asObject(old.attempts), history:asArray(old.history)
    };
    return state.officialRecords[id];
  }

  function syncCurrentOfficial(state){
    const id=cleanId(state.student?.id);
    if(!id){ state.officialKTScores={}; state.officialKTLocked={}; return; }
    const rec=ensureRecord(state,state.student);
    state.officialKTScores={...rec.scores};
    state.officialKTLocked={...rec.locked};
  }

  function recomputeOfficialProgress(state){
    state.completedKT=[];
    for(let i=1;i<=10;i++) if(Number(state.officialKTScores[ktKey(i)]||0)>=60 && state.officialKTLocked[ktKey(i)]) state.completedKT.push(i);
    let unlocked=1;
    for(let i=1;i<=9;i++){
      const key=ktKey(i);
      if(Number(state.officialKTScores[key]||0)>=60 && state.officialKTLocked[key]) unlocked=i+1;
      else break;
    }
    state.unlockedKP=unlocked;
    state.unlocked=unlocked;
  }

  const API={
    key:KEY, teacherPin:TEACHER_PIN, adminPin:ADMIN_PIN, defaults,
    load(){
      try{return normalize(JSON.parse(localStorage.getItem(KEY)||"{}"));}
      catch(e){console.error("Gagal membaca data C05:",e);return defaults();}
    },
    save(state){
      try{
        // Tangkap keputusan latihan daripada halaman KT lama, tetapi jangan jadikannya rasmi.
        const incoming=asObject(state.ktScores);
        for(let i=1;i<=10;i++){
          const key=ktKey(i), val=Math.max(Number(incoming[key]||0),Number(incoming[String(i)]||0),Number(incoming[`KT${String(i).padStart(2,"0")}`]||0));
          if(val>0){state.practiceScores=asObject(state.practiceScores);state.practiceBestScores=asObject(state.practiceBestScores);state.practiceScores[key]=val;state.practiceBestScores[key]=Math.max(Number(state.practiceBestScores[key]||0),val);}
        }
        syncCurrentOfficial(state); recomputeOfficialProgress(state); exposePracticeAliases(state);
        localStorage.setItem(KEY,JSON.stringify(state)); return true;
      }catch(e){console.error("Gagal menyimpan data C05:",e);return false;}
    },
    reset(){localStorage.removeItem(KEY);return defaults();},
    activateStudent(state,student){
      state.student={name:String(student.name||"").trim(),id:cleanId(student.id),avatar:student.avatar||"👨‍💻",className:String(student.className||"").trim()};
      ensureRecord(state,state.student); syncCurrentOfficial(state); recomputeOfficialProgress(state); this.save(state); return state;
    },
    completeKP(state,kp){kp=Number(kp);if(Number.isInteger(kp)&&kp>=1&&kp<=10&&!state.completedKP.includes(kp))state.completedKP.push(kp);this.save(state);return state;},
    saveKTResult(state,kt,score){
      kt=Number(kt);if(!Number.isInteger(kt)||kt<1||kt>10)return state;
      const key=ktKey(kt),mark=clamp(score);
      state.practiceScores=asObject(state.practiceScores);state.practiceBestScores=asObject(state.practiceBestScores);state.practiceAttempts=asObject(state.practiceAttempts);
      state.practiceScores[key]=mark;state.practiceBestScores[key]=Math.max(Number(state.practiceBestScores[key]||0),mark);state.practiceAttempts[key]=(Number(state.practiceAttempts[key]||0)+1);
      this.save(state);return state;
    },
    saveOfficialResult(state,student,kt,score,note=""){
      kt=Number(kt);if(!Number.isInteger(kt)||kt<1||kt>10)return{ok:false,message:"KT tidak sah."};
      const id=cleanId(student?.id);if(!id||!String(student?.name||"").trim())return{ok:false,message:"Nama dan ID pelajar diperlukan."};
      const record=ensureRecord(state,{...student,id});const key=ktKey(kt);
      if(record.locked[key])return{ok:false,locked:true,message:`KT${String(kt).padStart(2,"0")} telah rasmi dan dikunci.`};
      const mark=clamp(score),isOfficial=mark>=60;
      record.scores[key]=mark;record.attempts[key]=(Number(record.attempts[key]||0)+1);record.locked[key]=isOfficial;
      record.history.push({kt,score:mark,status:isOfficial?"RASMI":"BELUM RASMI",note:String(note||""),date:new Date().toISOString()});
      if(cleanId(state.student?.id)===id){syncCurrentOfficial(state);recomputeOfficialProgress(state);}
      this.save(state);
      return{ok:true,locked:isOfficial,official:isOfficial,message:isOfficial?`Markah ${mark}% kini RASMI dan telah dikunci.`:`Markah ${mark}% belum rasmi dan masih boleh dikemas kini.`};
    },
    adminUnlockOfficial(state,studentId,kt,pin){
      if(String(pin)!==ADMIN_PIN)return{ok:false,message:"PIN Admin tidak sah."};
      const id=cleanId(studentId),key=ktKey(kt),rec=state.officialRecords?.[id];
      if(!rec)return{ok:false,message:"Rekod pelajar tidak ditemui."};
      rec.locked[key]=false;rec.history=asArray(rec.history);rec.history.push({kt:Number(kt),action:"ADMIN_UNLOCK",date:new Date().toISOString()});
      if(cleanId(state.student?.id)===id){syncCurrentOfficial(state);recomputeOfficialProgress(state);}this.save(state);
      return{ok:true,message:"Kunci markah telah dibuka oleh Admin."};
    },
    getOfficialRecord(state,id){return state.officialRecords?.[cleanId(id)]||null;},
    getPracticeScore(state,kt){return Number(state.practiceBestScores?.[ktKey(kt)]||0);},
    getOfficialScore(state,kt){return Number(state.officialKTScores?.[ktKey(kt)]||0);},
    isOfficialLocked(state,kt){return Boolean(state.officialKTLocked?.[ktKey(kt)]);},
    isKTCompetent(state,kt){return this.getOfficialScore(state,kt)>=60&&this.isOfficialLocked(state,kt);},
    getKTStatus(state,kt){const score=this.getOfficialScore(state,kt);return this.isOfficialLocked(state,kt)&&score>=60?"RASMI · TERAMPIL":score>0?"BELUM RASMI":"BELUM DINILAI";},
    getProgress(state){return Math.round((asArray(state.completedKT).length/10)*100);},
    exportJSON(state){const b=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=`c05-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(u);},
    exportCSV(state){
      const rows=[["Nama","ID","KT","Markah Latihan","Markah Rasmi","Status Rasmi","Dikunci"]];
      Object.values(state.officialRecords||{}).forEach(rec=>{for(let i=1;i<=10;i++){const key=ktKey(i);rows.push([rec.name,rec.id,`KT${String(i).padStart(2,"0")}`,cleanId(state.student?.id)===rec.id?Number(state.practiceBestScores?.[key]||0):"",Number(rec.scores?.[key]||0),rec.locked?.[key]?"RASMI":"BELUM RASMI",rec.locked?.[key]?"YA":"TIDAK"]);}});
      const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n"),b=new Blob([csv],{type:"text/csv;charset=utf-8"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=`c05-markah-rasmi-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(u);
    }
  };
  window.C05Storage=API;window.SHStorage=API;
})();
