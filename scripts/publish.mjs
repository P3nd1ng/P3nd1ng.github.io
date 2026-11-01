import {spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline/promises';
import {fileURLToPath} from 'node:url';
import {existsSync} from 'node:fs';
const root=fileURLToPath(new URL('..',import.meta.url));process.chdir(root);
function run(command,args,options={}){const windowsNpm=process.platform==='win32'&&command==='npm';const result=windowsNpm?spawnSync(process.env.ComSpec||'cmd.exe',['/d','/s','/c',['npm',...args].join(' ')],{stdio:'inherit',...options}):spawnSync(command,args,{stdio:'inherit',...options});if(result.status!==0)throw Error(`${command} ${args.join(' ')} 失败，请检查上面的提示。`);}
function read(args){const r=spawnSync('git',args,{encoding:'utf8'});if(r.status!==0)throw Error(`Git ${args.join(' ')} 失败。`);return r.stdout.trim();}
try{
 if(read(['branch','--show-current'])!=='main')throw Error('当前不在 main 分支，已停止发布。');
 const remote=read(['remote','get-url','--push','origin']);
 if(!/^https:\/\/github\.com\/P3nd1ng\/P3nd1ng\.github\.io(?:\.git)?\/?$/i.test(remote))throw Error('推送地址不是本博客仓库，已停止发布。');
 if(!existsSync('node_modules/marked')){console.log('\n首次运行，正在安装所需组件……');run('npm',['ci']);}
 console.log('\n正在测试与生成网站……');run('npm',['test']);run('npm',['run','build']);
 console.log('\n即将发布此文件夹里的全部修改，包括已有修改。以下是当前修改：\n');run('git',['-c','core.quotepath=false','status','--short','--untracked-files=all']);
 const rl=createInterface({input:process.stdin,output:process.stdout});const answer=(await rl.question('\n确认提交以上所有修改并推送到 GitHub？输入 y 继续：')).trim().toLowerCase();rl.close();
 if(answer!=='y'){console.log('已取消，没有提交或推送。');process.exit(0);}
 run('git',['add','-A']);
 const diff=spawnSync('git',['diff','--cached','--quiet']);
 if(diff.status===1)run('git',['commit','-m','更新博客文章和网站']);else if(diff.status!==0)throw Error('无法检查待提交修改。');
 console.log('\n正在推送……');run('git',['push','origin','main']);
 console.log('\n推送完成。网站还需要等待 GitHub Actions 部署完成。\nhttps://github.com/P3nd1ng/P3nd1ng.github.io/actions\nhttps://p3nd1ng.github.io/');
}catch(error){console.error(`\n发布未完成：${error.message}\n若提示远程有新提交，请先同步并解决冲突；脚本不会强制推送。`);process.exitCode=1;}
