import {cp,mkdir,lstat,readdir,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {existingRoot} from './util.mjs';
const SELF_ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const IDE_PATHS={claude:'.claude/skills',cursor:'.cursor/skills',codex:'.agents/skills',gemini:'.gemini/skills',copilot:'.github/skills',opencode:'.agents/skills'};
export async function installSkills(target,ide){
 const rel=IDE_PATHS[ide];if(!rel)throw new Error('Unsupported IDE');
 const root=await existingRoot(target);const base=path.resolve(root,rel);
 let current=root;
 for(const part of rel.split('/')){current=path.join(current,part);let st;try{st=await lstat(current);}catch(e){if(e.code==='ENOENT'){await mkdir(current);continue;}throw e;}if(st.isSymbolicLink()||!st.isDirectory())throw new Error('Refusing symlink or non-directory in skill destination');}
 const source=path.join(SELF_ROOT,'skills');const skills=(await readdir(source,{withFileTypes:true})).filter(e=>e.isDirectory()).map(e=>e.name);
 // Fail closed before copying any files: never overwrite a previous installation.
 for(const name of skills){try{await lstat(path.join(base,name));throw new Error(`Refusing to overwrite skill ${name}`);}catch(e){if(e.code!=='ENOENT')throw e;}}
 for(const name of skills)await cp(path.join(source,name),path.join(base,name),{recursive:true,force:false,errorOnExist:true});
 return {ide,destination:rel,installed:skills.length,names:skills};
}
