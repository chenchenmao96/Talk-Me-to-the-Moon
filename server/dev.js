import { spawn } from 'node:child_process';
const children=[spawn(process.execPath,['server/index.js'],{stdio:'inherit',env:{...process.env,PORT:'4174'}}),spawn(process.execPath,['node_modules/vite/bin/vite.js'],{stdio:'inherit'})];
function stop(){for(const c of children)c.kill();}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
for(const c of children)c.on('exit',()=>{stop();process.exit();});
