'use client'
import {useMemo, useState} from 'react'

type Stage = {id:number; title:string; subtitle:string; status:'idle'|'running'|'done'|'error'; output:string}
type FinalPack = {matchScore:number; keywords:string[]; redFlags?:string[]; resumeText:string; coverLetter:string}
const stageMeta=[
 ['Recruiter Match','Score, missing keywords & instant red flags'],
 ['Experience Rewrite','Natural language + Google XYZ formula'],
 ['ATS + Hiring Manager','Find skipped sections and sharpen them'],
 ['Final Application Pack','ATS-ready Word resume + tailored cover letter']
]
const initialStages:Stage[]=stageMeta.map((x,i)=>({id:i+1,title:x[0],subtitle:x[1],status:'idle',output:''}))
export default function Home(){
 const [file,setFile]=useState<File|null>(null); const [job,setJob]=useState(''); const [stages,setStages]=useState(initialStages); const [running,setRunning]=useState(false); const [final,setFinal]=useState<FinalPack|null>(null); const [original,setOriginal]=useState(''); const [reviewTab,setReviewTab]=useState('overview')
 const ready=!!file && job.trim().length>80
 const progress=useMemo(()=>stages.filter(s=>s.status==='done').length,[stages])
 async function run(){ if(!ready||running)return; setRunning(true); setFinal(null); setOriginal(''); setReviewTab('overview'); setStages(initialStages)
   const fd=new FormData(); fd.append('resume',file!); fd.append('jobDescription',job)
   try{ const r=await fetch('/api/tailor',{method:'POST',body:fd}); if(!r.ok) throw new Error(await r.text()); const data=await r.json(); setStages(data.stages); setOriginal(data.originalResume||''); setFinal(data.final); setReviewTab('overview') }
   catch(e){setStages(s=>s.map((x,i)=>i===0?{...x,status:'error',output:String(e)}:x))} finally{setRunning(false)}
 }
 async function downloadResume(){if(!final)return; const r=await fetch('/api/document',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(final)}); const blob=await r.blob(); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download='Tailored_Resume.docx';a.click();URL.revokeObjectURL(url)}
 function downloadCover(){if(!final)return; const blob=new Blob([final.coverLetter||''],{type:'text/plain;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download='Tailored_Cover_Letter.txt';a.click();URL.revokeObjectURL(url)}
 const activeStage=typeof reviewTab==='string'&&reviewTab.startsWith('stage-')?stages[Number(reviewTab.split('-')[1])-1]:null
 return <main><header className="top"><div className="brand"><span className="mark">RT</span><div><strong>Resume Tailor</strong><small>AI APPLICATION STUDIO</small></div></div><div className="badge">ATS + Recruiter Workflow</div></header>
 <section className="hero"><div><p className="eyebrow">FROM JOB DESCRIPTION → INTERVIEW-READY APPLICATION</p><h1>Make your resume fit the <em>role</em>, not the other way around.</h1><p className="lead">Upload your current CV, paste the exact job description, and run a four-stage review that balances ATS keywords with human readability.</p></div><div className="hero-card"><div className="metric"><b>{progress}/4</b><span>stages complete</span></div><div className="line"><i style={{width:`${progress*25}%`}}/></div><span className="tiny">Your original resume is never overwritten.</span></div></section>
 <section className="workspace"><div className="inputs">
  <div className="panel"><div className="panel-head"><span className="num">01</span><div><h2>Your resume</h2><p>DOCX recommended · PDF supported for analysis</p></div></div><label className="drop"><input type="file" accept=".docx,.pdf,.txt" onChange={e=>setFile(e.target.files?.[0]||null)}/><span className="upload-icon">↑</span><b>{file?file.name:'Drop your resume here'}</b><small>{file?'Ready to analyze':'or click to browse · max 10 MB'}</small></label></div>
  <div className="panel"><div className="panel-head"><span className="num">02</span><div><h2>Target job description</h2><p>Paste the complete posting for the exact role</p></div></div><textarea value={job} onChange={e=>setJob(e.target.value)} placeholder="Paste the job description here…\n\nInclude responsibilities, requirements, skills and qualifications."></textarea><div className="counter">{job.length.toLocaleString()} characters</div></div>
 </div>
 <div className="runbar"><div><b>Sequential workflow</b><span>Each stage uses the previous stage's output.</span></div><button disabled={!ready||running} onClick={run}>{running?'Running analysis…':'Tailor my application →'}</button></div>
 <div className="stages">{stages.map(s=><article className={`stage ${s.status}`} key={s.id}><div className="stage-title"><span className="stage-num">{s.status==='done'?'✓':s.id}</span><div><h3>{s.title}</h3><p>{s.subtitle}</p></div><span className="status">{s.status==='idle'?'Waiting':s.status==='running'?'Running…':s.status==='done'?'Complete':'Needs attention'}</span></div></article>)}</div>
 {final&&<section className="review"><div className="review-head"><div><p className="eyebrow">REVIEW BEFORE DOWNLOAD</p><h2>Application review room</h2><p>Inspect the source resume, every AI stage, the match signals, and the final application before downloading anything.</p></div><div className="review-score"><span>Match score</span><strong>{final.matchScore}/100</strong><div className="scorebar"><i style={{width:`${Math.max(0,Math.min(100,final.matchScore||0))}%`}}/></div></div></div>
   <nav className="review-tabs">{[['overview','Overview'],['original','Original resume'],['stage-1','01 · Recruiter'],['stage-2','02 · Rewrite'],['stage-3','03 · ATS review'],['stage-4','04 · Final']].map(([id,label])=><button key={id} className={reviewTab===id?'active':''} onClick={()=>setReviewTab(id)}>{label}</button>)}</nav>
   {reviewTab==='overview'&&<div className="overview"><div className="signal-grid"><div className="signal-card score"><span>Match score</span><strong>{final.matchScore}/100</strong><small>Recruiter/ATS alignment after the full workflow</small></div><div className="signal-card"><span>Missing keywords</span><div className="chips">{(final.keywords||[]).map(k=><b key={k}>{k}</b>)}</div></div><div className="signal-card"><span>Red flags</span><ul>{(final.redFlags||['Review the recruiter stage for the original red-flag analysis.']).map((x,i)=><li key={i}>{x}</li>)}</ul></div></div><div className="overview-columns"><div className="review-doc"><div className="doc-head"><div><span>FINAL RESUME</span><h3>ATS-compatible version</h3></div><button onClick={()=>setReviewTab('stage-4')}>Open full review →</button></div><pre>{final.resumeText}</pre></div><div className="review-doc"><div className="doc-head"><div><span>COVER LETTER</span><h3>Tailored for the role</h3></div><button onClick={downloadCover}>Download .txt</button></div><pre>{final.coverLetter}</pre></div></div></div>}
   {reviewTab==='original'&&<ReviewDoc title="Original resume" subtitle={file?.name||'Uploaded source'} text={original||'The original resume text could not be extracted.'}/>} 
   {activeStage&&<ReviewDoc title={activeStage.title} subtitle={activeStage.subtitle} text={activeStage.output}/>} 
   {reviewTab==='stage-4'&&<div className="final-review"><div className="final-panel"><div className="doc-head"><div><span>FINAL RESUME</span><h3>Ready for Word export</h3></div><button className="download-small" onClick={downloadResume}>Download .docx</button></div><pre>{final.resumeText}</pre></div><div className="final-panel"><div className="doc-head"><div><span>COVER LETTER</span><h3>Ready to apply</h3></div><button className="download-small" onClick={downloadCover}>Download .txt</button></div><pre>{final.coverLetter}</pre></div><div className="final-actions"><button className="download" onClick={downloadResume}>Download tailored resume (.docx) ↓</button><button className="download secondary" onClick={downloadCover}>Download cover letter (.txt) ↓</button></div></div>}
 </section>}
 </section><footer>Resume Tailor AI · Built for focused, evidence-based resume tailoring · Never invent metrics or experience.</footer></main>
}
function ReviewDoc({title,subtitle,text}:{title:string;subtitle:string;text:string}){return <div className="review-doc full"><div className="doc-head"><div><span>AI REVIEW STAGE</span><h3>{title}</h3><small>{subtitle}</small></div></div><pre>{text}</pre></div>}
