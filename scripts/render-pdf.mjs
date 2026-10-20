import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const args=process.argv.slice(2);
const option=(name,fallback)=>{const at=args.indexOf(name);return at>=0?args[at+1]:fallback;};
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(option('--output','public/downloads/ia-pesquisar-melhor-v1.1.1.pdf'));
const report=path.resolve(option('--report','build/consulta-validation.json'));
const qaOnly=args.includes('--qa-only');
const modulePath=option('--playwright-module',null);
const playwright=modulePath?require(path.resolve(modulePath)):require('playwright');
const esbuildPath=option('--esbuild-module',null);
const esbuild=esbuildPath?require(path.resolve(esbuildPath)):(()=>{try{return require('esbuild');}catch{return createRequire(require.resolve('vite/package.json'))('esbuild');}})();
const buildDir=path.join(root,'build','consulta-offline');
await fs.mkdir(buildDir,{recursive:true});
const bundlePath=path.join(buildDir,'document.cjs');
await esbuild.build({
 stdin:{contents:`import React from 'react'; import {renderToStaticMarkup} from 'react-dom/server'; import Page from './app/consulta/page.tsx'; module.exports={html:renderToStaticMarkup(React.createElement(Page))};`,resolveDir:root,sourcefile:'consulta-offline-entry.tsx',loader:'tsx'},
 bundle:true,platform:'node',format:'cjs',target:'node22',outfile:bundlePath,jsx:'automatic',tsconfig:path.join(root,'tsconfig.json'),loader:{'.css':'empty'},logLevel:'error',define:{'process.env.NODE_ENV':'"production"'},
});
let markup=require(bundlePath).html;
const assetSources=[...new Set([...markup.matchAll(/src="(\/assets\/[^"]+)"/g)].map(m=>m[1]))];
for(const asset of assetSources){
 const filename=path.resolve(root,'public','.'+asset);
 const allowed=path.resolve(root,'public','assets')+path.sep;
 if(!filename.startsWith(allowed))throw new Error('Caminho de imagem fora do diretório autorizado');
 const bytes=await fs.readFile(filename);const extension=path.extname(filename).slice(1);const mime=extension==='svg'?'image/svg+xml':`image/${extension==='jpg'?'jpeg':extension}`;
 markup=markup.replaceAll(`src="${asset}"`,`src="data:${mime};base64,${bytes.toString('base64')}"`);
}
const cssFiles=['app/globals.css','app/refinements.css','app/consulta/consulta.css'];
const css=(await Promise.all(cssFiles.map(async filename=>{try{return await fs.readFile(path.join(root,filename),'utf8');}catch(error){if(error.code==='ENOENT'&&filename==='app/refinements.css')return '';throw error;}}))).join('\n');
const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>IA para pesquisar melhor · Material de consulta</title><style>${css}</style></head><body>${markup}</body></html>`;
await fs.writeFile(path.join(buildDir,'document.html'),html);
const executable=option('--executable',process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined);
const browser=await playwright.chromium.launch({headless:true,...(executable?{executablePath:executable}:{})});
try{
 const page=await browser.newPage({viewport:{width:1720,height:1080},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 // This is an offline document renderer. No website or external resource is requested.
 await page.route('**/*',route=>route.abort());
 await page.setContent(html,{waitUntil:'load',timeout:90000});
 await page.locator('[data-pdf-page]').last().waitFor();
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=resolve;img.onerror=resolve})));});
 const geometry=await page.evaluate(()=>{
  const sheets=[...document.querySelectorAll('[data-pdf-page]')];
  const root=document.querySelector('[data-page-count]');
  const brokenImages=[...document.images].filter(img=>!img.complete||!img.naturalWidth).map(img=>img.src);
  const overflows=[];const sizes=[];const collisions=[];
  for(const sheet of sheets){
   const box=sheet.getBoundingClientRect();const number=sheet.getAttribute('data-pdf-page');
   sizes.push({page:Number(number),width:box.width,height:box.height});
   for(const [contentSelector,footSelector] of [['.consult-media-area','.consult-support-credit'],['.consult-api-layout','.consult-support-credit'],['.consult-reference-list','.consult-ref-note'],['.consult-product-list','.consult-ref-note'],['.consult-credit-list','.consult-ref-note']]){
    const content=sheet.querySelector(contentSelector),foot=sheet.querySelector(footSelector);
    if(content&&foot&&content.getBoundingClientRect().bottom>foot.getBoundingClientRect().top-8)collisions.push({page:Number(number),content:contentSelector,footer:footSelector});
   }
   const walker=document.createTreeWalker(sheet,NodeFilter.SHOW_TEXT);
   while(walker.nextNode()){
    const node=walker.currentNode;if(!node.textContent?.trim())continue;const parent=node.parentElement;const style=getComputedStyle(parent);
    if(style.visibility==='hidden'||style.display==='none'||Number(style.opacity)===0)continue;
    const range=document.createRange();range.selectNodeContents(node);
    for(const rect of range.getClientRects())if(rect.width&&rect.height&&(rect.left<box.left-2||rect.right>box.right+2||rect.top<box.top-2||rect.bottom>box.bottom-2)){overflows.push({page:Number(number),text:node.textContent.trim().slice(0,100),left:rect.left-box.left,top:rect.top-box.top,width:rect.width,height:rect.height});break;}
   }
  }
  const refs=[...document.querySelectorAll('[data-reference-id]')].map(el=>el.getAttribute('data-reference-id'));
  const deadAnchors=[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(href=>!document.getElementById(href.slice(1)));
  return {pageCount:sheets.length,expectedPageCount:Number(root?.getAttribute('data-page-count')),referenceCount:refs.length,expectedReferenceCount:Number(root?.getAttribute('data-reference-count')),uniqueReferences:new Set(refs).size,brokenImages,overflows,collisions,sizes,deadAnchors};
 });
 const wrongSizes=geometry.sizes.filter(s=>Math.abs(s.width-1600)>2||Math.abs(s.height-900)>2);
 const validation={mode:'offline-static-document',source:path.join(buildDir,'document.html'),network:'blocked',...geometry,wrongSizes,pageErrors:errors,checkedAt:new Date().toISOString()};
 await fs.mkdir(path.dirname(report),{recursive:true});await fs.writeFile(report,JSON.stringify(validation,null,2)+'\n');
 if(geometry.pageCount!==geometry.expectedPageCount||geometry.referenceCount!==geometry.expectedReferenceCount||geometry.uniqueReferences!==geometry.referenceCount||geometry.brokenImages.length||geometry.overflows.length||geometry.collisions.length||geometry.deadAnchors.length||wrongSizes.length||errors.length)throw new Error(`Consulta precisa de reparo. Consulte ${report}`);
 if(!qaOnly){
  await fs.mkdir(path.dirname(output),{recursive:true});
  await page.pdf({path:output,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
 }
 const screenshots=option('--screenshots',null);
 if(screenshots){await fs.mkdir(screenshots,{recursive:true});for(const n of [1,4,6,8,11,16,23,31,geometry.pageCount]){const sheet=page.locator(`[data-pdf-page="${n}"]`);if(await sheet.count())await sheet.screenshot({path:path.join(screenshots,`page-${String(n).padStart(2,'0')}.png`)});}}
 console.log(JSON.stringify({pages:geometry.pageCount,references:geometry.referenceCount,report,output:qaOnly?null:output}));
}finally{await browser.close();}
