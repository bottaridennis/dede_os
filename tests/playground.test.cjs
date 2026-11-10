const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'../playground.js'),'utf8');
function setup(saved) {
  const nodes = {}, events = {}, timers = new Map(), storage = new Map(saved ? [['dennis-playground-v1',JSON.stringify(saved)]] : []);
  let output = '', timerId = 0;
  function node(id) {
    return nodes[id] ||= { id, dataset:{}, parentElement:{scrollTop:0}, setAttribute(){}, addEventListener(name,fn){ events[id+':'+name]=fn; },
      insertAdjacentHTML(_where,html){ output += html; }, remove(){ delete nodes[id]; } };
  }
  const context = {
    console, window:{}, localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    sessionStorage:{removeItem(){}}, document:{documentElement:{dataset:{}}, getElementById:id=>id==='desktop-pet'?nodes[id]:node(id),
      createElement:()=>node('desktop-pet'),body:{appendChild(){}},addEventListener:(type,fn)=>events[type]=fn},
    MutationObserver:class { observe(){} }, setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),
    esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),
    THEMES:{matrix:{label:'Matrix'}}, C:{web:[],iot:[],music:[]},keys:['web','iot','music'],
    P:[{t:'NerdShelf',d:'web',x:'Libreria',story:'Catalogazione',k:['React'],u:'https://example.com'},
      {t:'First Song',d:'music',x:'Brano',k:['Suno'],audio:'one.mp3'}, {t:'Second Song',d:'music',x:'Brano',k:['Suno'],audio:'two.mp3'}],
    cur:-1,playing:false,still:false,bip(){},glitchSound(){},hackTransition(){},updateAbarVisibility(){},
    setTheme(name){context.document.documentElement.dataset.activeTheme=name||'none';if(name)storage.set('activeTheme',name);else storage.delete('activeTheme');},
    setTrack(i){context.cur=i;},togglePlay(){context.playing=!context.playing;},
  };
  vm.createContext(context); vm.runInContext(source,context);
  return { context, events, nodes, timers, storage, run:line=>context.window.dennisPlayground.run(line), text:()=>output, resetOutput:()=>output='' };
}
test('commands keep secret themes out of completion and record history',()=>{
  const app=setup(); app.run('fortune'); app.run('history'); assert.match(app.text(),/fortune/);
  const input={id:'ti',value:'th'};app.events.keydown({target:input,key:'Tab',preventDefault(){}});
  assert.equal(input.value,'th'); input.value='fort';app.events.keydown({target:input,key:'Tab',preventDefault(){}});assert.equal(input.value,'fortune ');
  app.events.keydown({target:input,key:'ArrowUp',preventDefault(){}});assert.equal(input.value,'history');
  app.events.keydown({target:input,key:'ArrowDown',preventDefault(){}});assert.equal(input.value,'fortune ');
});
test('theme preview expires, save commits it and manual reset cancels the timer',()=>{
  const app=setup();app.run('theme matrix');app.run('theme preview gameboy');
  assert.equal(app.context.document.documentElement.dataset.activeTheme,'gameboy');assert.equal(app.storage.get('activeTheme'),'matrix');
  [...app.timers.values()][0]();assert.equal(app.context.document.documentElement.dataset.activeTheme,'matrix');
  app.run('theme preview deepsea');app.run('theme save');assert.equal(app.storage.get('activeTheme'),'deepsea');assert.equal(app.timers.size,0);
  app.run('theme preview paper');assert.equal(app.run('reset'),false);assert.equal(app.timers.size,0);
});
test('adventure requires all three rooms and progress survives a reload',()=>{
  const app=setup();app.run('adventure core');assert.match(app.text(),/richiede tre frammenti/);
  for(const room of ['web','hardware','music'])app.run('adventure '+room);app.run('adventure core');
  assert.ok(JSON.parse(app.storage.get('dennis-playground-v1')).unlocked.includes('adventure'));
  const reload=setup(JSON.parse(app.storage.get('dennis-playground-v1')));reload.run('achievement');assert.match(reload.text(),/★ Il cuore di DennisOS/);
});
test('jukebox selects tracks, pauses and wraps to the first song',()=>{
  const app=setup();app.run('jukebox play 2');assert.equal(app.context.cur,2);assert.equal(app.context.playing,true);
  app.run('jukebox next');assert.equal(app.context.cur,1);app.run('jukebox pause');assert.equal(app.context.playing,false);
  app.run('jukebox play unknown');assert.match(app.text(),/Brano non trovato/);
});
test('dice validate limits and user supplied messages are escaped',()=>{
  const app=setup();app.run('roll 99d20');assert.match(app.text(),/da 1 a 20 dadi/);
  app.run('roll 2d20');assert.match(app.text(),/terminal-dice/);
  app.run('cowsay <script>');assert.ok(!app.text().includes('<script>'));assert.match(app.text(),/&lt;script&gt;/);
  app.run('inspect nerdshelf');assert.match(app.text(),/Catalogazione/);assert.match(app.text(),/https:\/\/example.com/);
});
test('mascot, effects and sound can be switched independently',()=>{
  const app=setup();app.run('pet');assert.ok(app.nodes['desktop-pet']);app.run('pet sleep');assert.equal(app.nodes['desktop-pet'].dataset.mood,'sleep');
  app.run('pet off');assert.equal(app.nodes['desktop-pet'],undefined);
  app.run('effects off');app.run('sound on');const prefs=JSON.parse(app.storage.get('dennis-playground-v1'));assert.equal(prefs.effects,false);assert.equal(prefs.sound,true);
});
test('folder exploration and audio playback unlock their quests',()=>{
  const app=setup();for(const category of ['web','iot','music'])app.events.click({target:{closest:()=>({dataset:{o:category}})}});
  app.events['realAudio:playing']();app.run('quests');assert.match(app.text(),/✓ Visita tre discipline/);assert.match(app.text(),/✓ Ascolta un brano/);
});
