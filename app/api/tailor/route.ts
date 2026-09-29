import {NextResponse} from 'next/server'
import mammoth from 'mammoth'
import {generateText} from 'ai'
import {createOpenAI} from '@ai-sdk/openai'
export const runtime='nodejs'
const prompts=[
`Act as a senior recruiter for the exact company represented by this job description. Analyze the candidate resume against the job description. Return: match score /100, top 5 missing keywords/phrases, and 3 concrete red flags a hiring manager could spot in 10 seconds. Do not invent facts.`,
`Using the original resume and recruiter findings, rewrite the EXPERIENCE section to naturally incorporate the relevant missing keywords where truthful. Remove red flags. Use the Google XYZ formula: Accomplished X as measured by Y by doing Z. Keep the candidate's real employers, roles, dates and facts. Never invent metrics; when no metric exists, use a concrete non-numeric outcome. Make it human, direct and conversational; avoid corporate jargon and robotic phrasing.`,
`Act as an ATS filter and a hiring manager reading 200 resumes. Review the rewritten resume. Identify which sections would be skipped and why, then rewrite those sections to improve scanability and relevance. Preserve facts and do not keyword-stuff. Return the improved full resume text in a clean ATS-friendly structure.`,
`Generate the final application package from the original resume, job description, recruiter analysis, rewritten experience and ATS review. Create: (1) a complete ATS-compatible resume, clean headings, reverse chronological experience, standard fonts/sections, no tables/graphics/text boxes, concise bullets; (2) a tailored cover letter. Do not invent experience, employers, dates, education, certifications, metrics or skills. Include only defensible keywords. Return JSON with matchScore, keywords, redFlags, resumeText, coverLetter. The redFlags array should preserve the three concrete red flags identified in stage 1.`]
export async function POST(req:Request){
 const fd=await req.formData(); const f=fd.get('resume') as File|null; const jd=String(fd.get('jobDescription')||''); if(!f||!jd) return new NextResponse('Resume and job description are required',{status:400})
 let resume=''; const buf=Buffer.from(await f.arrayBuffer());
 if(f.name.toLowerCase().endsWith('.docx')){const r=await mammoth.extractRawText({buffer:buf}); resume=r.value}else{resume=new TextDecoder().decode(buf)}
 const apiKey=process.env.OPENAI_API_KEY||process.env.AI_GATEWAY_API_KEY
 if(!apiKey){
   const keywords=jd.match(/\b(?:ITIL|ITSM|ServiceNow|SLA|KPI|Incident Management|Problem Management|Change Management|Service Delivery|Agile|SAFe|Lean|AI|automation|stakeholder management|process optimization)\b/gi)?.slice(0,5)||['service management','process optimization','stakeholder management','service delivery','continuous improvement'];
   const fallback=`Demo mode is active because no AI provider key is configured.\n\nResume extracted: ${resume.slice(0,900)}\n\nTop target keywords detected: ${keywords.join(', ')}\n\nTo enable the full four-stage AI workflow, configure OPENAI_API_KEY or AI_GATEWAY_API_KEY in the deployment environment.`
   return NextResponse.json({originalResume:resume,stages:[1,2,3,4].map((id,i)=>({id,title:['Recruiter Match','Experience Rewrite','ATS + Hiring Manager','Final Application Pack'][i],subtitle:['Score, missing keywords & instant red flags','Natural language + Google XYZ formula','Find skipped sections and sharpen them','ATS-ready Word resume + tailored cover letter'][i],status:'done',output:fallback})),final:{matchScore:0,keywords,resumeText:resume,coverLetter:'Configure an AI provider key to generate the tailored cover letter.'}})
 }
 const provider=createOpenAI({apiKey,baseURL:process.env.OPENAI_BASE_URL})
 let context=`RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jd}`; const outputs:string[]=[]
 for(let i=0;i<prompts.length;i++){const {text}=await generateText({model:provider('gpt-5.6'),system:'You are a precise resume tailoring assistant. Preserve truth. Never fabricate candidate facts. '+prompts[i],prompt:context,maxOutputTokens:6000}); outputs.push(text); context+=`\n\nSTAGE ${i+1} OUTPUT:\n${text}`}
 let parsed:any={matchScore:0,keywords:[],resumeText:outputs[2],coverLetter:''}; try{parsed=JSON.parse(outputs[3].replace(/```json|```/g,''))}catch{}
 return NextResponse.json({originalResume:resume,stages:outputs.map((o,i)=>({id:i+1,title:['Recruiter Match','Experience Rewrite','ATS + Hiring Manager','Final Application Pack'][i],subtitle:['Score, missing keywords & instant red flags','Natural language + Google XYZ formula','Find skipped sections and sharpen them','ATS-ready Word resume + tailored cover letter'][i],status:'done',output:o})),final:parsed})
}
