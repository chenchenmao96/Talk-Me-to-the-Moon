import { readFileSync } from 'node:fs';
for(const file of ['.env.local','.env']){
 try{ for(const line of readFileSync(file,'utf8').split('\n')){
  const m=line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].trim().replace(/^['"]|['"]$/g,'');
 }}catch(e){if(e.code!=='ENOENT')throw e;}
}
