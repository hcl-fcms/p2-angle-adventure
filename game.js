const SVG_NS = 'http://www.w3.org/2000/svg';
const stages = ['森林入口', '直角工具屋', '三道角角門', '修橋工程', '城堡試煉'];
const tasks = [
  {stage:0, type:'vertex', title:'找出角的頂點', instruction:'先找出兩條邊相遇的位置。', guide:'角有一個頂點和兩條直邊。請點圖上的頂點。', label:'森林入口的門', angle:65, rot:12},
  {stage:0, type:'choice', title:'邊長了，角會變大嗎？', instruction:'看一看兩個開口相同、邊長不同的角。', guide:'角的大小要看甚麼？', label:'兩個角一樣大嗎？', visual:'equal', choices:['一樣大，因為開口一樣','長邊的角較大','向上的角較大'], answer:0, success:'答對！角的大小看開口，不看兩條邊畫得多長。', hint:'試想像把兩個頂點及其中一條邊疊起來。'},
  {stage:1, type:'choice', title:'轉了方向的直角', instruction:'先觀察，再用直角工具檢查。', guide:'這個角轉了方向，還是直角嗎？', label:'直角工具屋', visual:'angle', angle:90, rot:34, lengths:[155,95], choices:['是直角','是銳角','是鈍角'], answer:0, tool:true, success:'答對！轉方向及改變邊長，都不會改變直角。', hint:'按「顯示直角工具」，對準頂點和其中一條邊。'},
  {stage:1, type:'choice', title:'比直角小的開口', instruction:'把角和直角工具的開口比較。', guide:'這個角屬於哪一種？', label:'直角工具屋', visual:'angle', angle:50, rot:-22, lengths:[190,115], choices:['銳角','直角','鈍角'], answer:0, tool:true, success:'答對！它的開口比直角小，是銳角。', hint:'小於直角的是銳角。'},
  {stage:2, type:'choice', title:'又短又大的角', instruction:'兩條邊很短。請只比較開口。', guide:'這個角屬於哪一種？', label:'角角門 · 第一扇', visual:'angle', angle:128, rot:2, lengths:[85,92], choices:['銳角','直角','鈍角'], answer:2, tool:true, success:'答對！開口大於直角，所以是鈍角。邊短不影響大小。', hint:'不要讓短短的邊騙了你。'},
  {stage:2, type:'choice', title:'又長又小的角', instruction:'兩條邊很長。請只比較開口。', guide:'這個角屬於哪一種？', label:'角角門 · 第二扇', visual:'angle', angle:38, rot:9, lengths:[205,200], choices:['銳角','直角','鈍角'], answer:0, tool:true, success:'答對！開口小於直角，是銳角。', hint:'邊很長，開口仍可能很小。'},
  {stage:2, type:'choice', title:'倒轉的直角', instruction:'不要只尋找像「L」字的角。', guide:'這個角屬於哪一種？', label:'角角門 · 第三扇', visual:'angle', angle:90, rot:145, lengths:[110,138], choices:['銳角','直角','鈍角'], answer:1, tool:true, success:'答對！倒轉後的開口仍和直角一樣大。', hint:'方向改變了，兩邊的開口沒有變。'},
  {stage:2, type:'choice', title:'相交就一定垂直？', instruction:'看看橋上的兩條線相交時形成甚麼角。', guide:'這兩條線互相垂直嗎？', label:'角角門 · 橋的交叉線', visual:'cross', perpendicular:false, choices:['互相垂直','不是互相垂直'], answer:1, tool:true, success:'答對！相交的角不是直角，所以不互相垂直。', hint:'相交只是第一步，還要看看交角是不是直角。'},
  {stage:3, type:'draw', title:'畫一個銳角', instruction:'拖動橙色圓點，讓兩條邊的開口小於直角。', guide:'畫好後按「檢查我的圖」。你可以再調整。', label:'修橋工程 · 銳角', target:'acute', base:0},
  {stage:3, type:'draw', title:'畫一個直角', instruction:'拖動橙色圓點，讓兩條邊剛好形成直角。', guide:'需要時按「顯示直角工具」對照。', label:'修橋工程 · 直角', target:'right', base:0, tool:true},
  {stage:3, type:'draw', title:'畫一個鈍角', instruction:'拖動橙色圓點，讓開口大於直角。', guide:'留意你畫出的兩條邊必須在同一個頂點相遇。', label:'修橋工程 · 鈍角', target:'obtuse', base:0},
  {stage:3, type:'draw', title:'畫一條垂直線', instruction:'經過指定的點，畫一條與橋面垂直的線。', guide:'垂直不是「向下」；重點是兩條線相交成直角。', label:'修橋工程 · 斜橋', target:'perpendicular', base:25, tool:true},
  {stage:4, type:'choice', title:'轉了方向的鈍角', instruction:'這是新方向。用同一個比較方法判斷。', guide:'這個角屬於哪一種？', label:'城堡試煉 · 轉方向', visual:'angle', angle:122, rot:158, lengths:[120,110], choices:['銳角','直角','鈍角'], answer:2, tool:true, success:'答對！旋轉後仍比直角大，是鈍角。', hint:'只看開口，不看它指向哪裏。'},
  {stage:4, type:'draw', title:'最後挑戰：畫一個斜着的直角', instruction:'第一條邊已轉了方向。畫第二條邊，使它們成直角。', guide:'畫好後向同伴解釋：你如何知道它是直角？', label:'城堡試煉 · 自選方向', target:'right', base:35, tool:true}
];

const element = id => document.getElementById(id);
const board = element('board');
const state = {index:0, solved:new Set(), mistakes:0, drawings:{}, moved:false, dragging:false, toolShown:false, endpoint:null};

function polar(x, y, degrees, length) {
  const radians = degrees * Math.PI / 180;
  return {x:x + length * Math.cos(radians), y:y - length * Math.sin(radians)};
}
function line(x1,y1,x2,y2,color='#315f54',width=8) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
}
function circle(x,y,r,color) { return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`; }
function boardBase() {
  return `<rect x="0" y="0" width="600" height="390" rx="20" fill="#f7faf3"/><path d="M0 317Q130 284 250 319T600 308V390H0Z" fill="#e7efd9"/><path d="M0 360Q160 336 280 366T600 348V390H0Z" fill="#d6e6cb"/>`;
}
function angleSvg(x,y,angle,rotation,len1=140,len2=140,color='#315f54') {
  const first = polar(x,y,rotation,len1);
  const second = polar(x,y,rotation+angle,len2);
  return `${line(x,y,first.x,first.y,color)}${line(x,y,second.x,second.y,color)}${circle(x,y,9,'#dc9053')}`;
}
function toolSvg(x,y,rotation=0) {
  const first = polar(x,y,rotation,62);
  const second = polar(x,y,rotation+90,62);
  const corner = polar(first.x,first.y,rotation+90,62);
  return `<path d="M${x} ${y}L${first.x} ${first.y}L${corner.x} ${corner.y}L${second.x} ${second.y}Z" fill="#95c9cb77" stroke="#2c8790" stroke-width="3" stroke-dasharray="8 5"/><path d="M${first.x} ${first.y}L${x} ${y}L${second.x} ${second.y}" fill="none" stroke="#2c8790" stroke-width="4"/>`;
}
function renderBoard(task) {
  let content = boardBase();
  if (task.type === 'vertex') {
    content += angleSvg(292,244,task.angle,task.rot,175,135);
    content += `<circle id="vertex-hit" cx="292" cy="244" r="35" fill="transparent" style="cursor:pointer" aria-label="角的頂點"/>`;
  } else if (task.visual === 'equal') {
    content += angleSvg(150,250,62,12,76,68);
    content += angleSvg(420,250,62,12,175,125);
    content += `<text x="146" y="320" text-anchor="middle" fill="#315f54" font-size="25" font-weight="700">A</text><text x="420" y="320" text-anchor="middle" fill="#315f54" font-size="25" font-weight="700">B</text>`;
  } else if (task.visual === 'angle') {
    content += angleSvg(292,234,task.angle,task.rot,task.lengths[0],task.lengths[1]);
    if (state.toolShown) content += toolSvg(292,234,task.rot);
  } else if (task.visual === 'cross') {
    content += line(130,267,470,160);
    content += line(240,110,350,340,'#df9a5f');
    if (state.toolShown) content += toolSvg(302,213,17.5);
  } else if (task.type === 'draw') {
    const origin = {x:265,y:227};
    const first = polar(origin.x,origin.y,task.base,155);
    const endpoint = state.endpoint || polar(origin.x,origin.y,task.base+35,125);
    if (task.target === 'perpendicular') {
      const back = polar(origin.x,origin.y,task.base+180,180);
      content += line(back.x,back.y,first.x,first.y,'#315f54',9);
      content += `<text x="66" y="60" fill="#5e7869" font-size="18">橋面</text>`;
    } else {
      content += line(origin.x,origin.y,first.x,first.y);
    }
    if (state.moved) content += line(origin.x,origin.y,endpoint.x,endpoint.y,'#df9052',8);
    if (state.toolShown) content += toolSvg(origin.x,origin.y,task.base);
    content += circle(origin.x,origin.y,9,'#315f54');
    content += `<circle id="drag-handle" cx="${endpoint.x}" cy="${endpoint.y}" r="19" fill="#df9052" stroke="#fffaf0" stroke-width="5" style="cursor:grab" tabindex="0" role="button" aria-label="畫角控制點，方向鍵每次移動五度"/>`;
    content += `<circle cx="${endpoint.x}" cy="${endpoint.y}" r="7" fill="#fffaf0" pointer-events="none"/>`;
  }
  board.innerHTML = content;
  if (task.type === 'vertex') element('vertex-hit').addEventListener('click', solveVertex);
  if (task.type === 'draw') {
    element('drag-handle').addEventListener('pointerdown', startDrag);
    element('drag-handle').addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const current = state.endpoint || polar(265,227,task.base+35,125);
      const degrees = Math.atan2(227-current.y,current.x-265)*180/Math.PI + (event.key === 'ArrowLeft' ? 5 : -5);
      state.endpoint = polar(265,227,degrees,125);
      state.moved = true;
      renderBoard(task);
      element('drag-handle').focus();
    });
  }
}

function renderTask() {
  const task = tasks[state.index];
  state.moved = false;
  state.dragging = false;
  state.toolShown = false;
  state.endpoint = null;
  element('intro').hidden = true;
  element('finish').hidden = true;
  element('game').hidden = false;
  element('restart').hidden = false;
  element('stage-name').textContent = `${task.stage + 1} / 5 · ${stages[task.stage]}`;
  element('task-title').textContent = task.title;
  element('task-instruction').textContent = task.instruction;
  element('task-count').textContent = `${state.index + 1} / ${tasks.length} 關`;
  element('progress-fill').style.width = `${state.index / tasks.length * 100}%`;
  element('scene-label').textContent = task.label;
  element('scene-hint').textContent = task.type === 'draw' ? '手指或滑鼠拖動' : '先觀察，再回答';
  element('guide-text').textContent = task.guide;
  element('feedback').textContent = '';
  element('feedback').className = 'feedback';
  element('next').hidden = true;
  element('tool-button').hidden = !task.tool;
  element('tool-button').textContent = '顯示直角工具';
  element('draw-controls').hidden = task.type !== 'draw';
  element('options').replaceChildren();
  if (task.choices) task.choices.forEach((choice, index) => {
    const button = document.createElement('button');
    button.className = 'option-button';
    button.type = 'button';
    button.textContent = choice;
    button.addEventListener('click', () => answerChoice(index,button));
    element('options').append(button);
  });
  document.querySelectorAll('.map-strip span').forEach((step,index) => {
    step.className = index === task.stage ? 'current' : index < task.stage ? 'visited' : '';
  });
  renderBoard(task);
}
function feedback(message, good=false) {
  element('feedback').textContent = message;
  element('feedback').className = `feedback ${good ? 'good' : 'retry'}`;
}
function complete(message) {
  state.solved.add(state.index);
  feedback(message,true);
  element('next').hidden = false;
  element('options').querySelectorAll('button').forEach(button => button.disabled = true);
  element('check-drawing').disabled = true;
}
function solveVertex() {
  if (!state.solved.has(state.index)) complete('找到了！兩條邊在這一點相遇，這就是頂點。');
}
function answerChoice(index,button) {
  if (state.solved.has(state.index)) return;
  const task = tasks[state.index];
  if (index === task.answer) {
    button.classList.add('correct');
    complete(task.success);
  } else {
    state.mistakes += 1;
    button.classList.add('wrong');
    feedback(task.hint);
    window.setTimeout(() => button.classList.remove('wrong'),800);
  }
}
function boardPoint(event) {
  const point = board.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(board.getScreenCTM().inverse());
}
function startDrag(event) {
  if (state.solved.has(state.index)) return;
  state.dragging = true;
  board.setPointerCapture(event.pointerId);
  moveDrag(event);
}
function moveDrag(event) {
  if (!state.dragging) return;
  const point = boardPoint(event);
  const deltaX = point.x - 265;
  const deltaY = point.y - 227;
  const distance = Math.hypot(deltaX,deltaY);
  if (distance < 25) return;
  const length = Math.min(150,Math.max(95,distance));
  state.endpoint = {x:265 + deltaX / distance * length, y:227 + deltaY / distance * length};
  state.moved = true;
  renderBoard(tasks[state.index]);
}
function angleBetween(base,endpoint) {
  const drawn = Math.atan2(227-endpoint.y,endpoint.x-265) * 180 / Math.PI;
  let difference = Math.abs((drawn-base+540)%360-180);
  return difference;
}
function checkDrawing() {
  const task = tasks[state.index];
  if (state.solved.has(state.index)) return;
  if (!state.moved || !state.endpoint) { feedback('先拖動橙色圓點，親手畫出第二條邊。'); return; }
  const angle = angleBetween(task.base,state.endpoint);
  const valid = task.target === 'acute' ? angle >= 18 && angle <= 78
    : task.target === 'right' || task.target === 'perpendicular' ? Math.abs(angle-90) <= 7
    : angle >= 102 && angle <= 165;
  if (!valid) {
    state.mistakes += 1;
    const cue = task.target === 'acute' ? '銳角的開口要比直角小。' : task.target === 'obtuse' ? '鈍角的開口要比直角大。' : '再移動圓點，讓兩條線相交形成直角。';
    feedback(`再調整一下。${cue}`);
    return;
  }
  state.drawings[state.index] = {title:task.title,base:task.base,endpoint:{...state.endpoint}};
  const message = task.target === 'perpendicular' ? '畫好了！兩條線經過指定點相交成直角，所以互相垂直。' : `畫好了！你親手畫出${task.target === 'acute' ? '銳角' : task.target === 'right' ? '直角' : '鈍角'}。`;
  complete(message);
}
function showFinish() {
  element('game').hidden = true;
  element('finish').hidden = false;
  const drawings = Object.values(state.drawings);
  element('evidence-list').innerHTML = `<li>完成 ${state.solved.size} / ${tasks.length} 關角與垂直線任務</li><li>親手畫出 ${drawings.length} 個角或垂直線</li><li>遇到錯誤時嘗試修正 ${state.mistakes} 次</li>`;
  element('drawings-gallery').innerHTML = drawings.map(drawing => {
    const first = polar(94,80,drawing.base,65);
    const deltaX = drawing.endpoint.x-265;
    const deltaY = drawing.endpoint.y-227;
    const distance = Math.hypot(deltaX,deltaY);
    const second = {x:94+deltaX/distance*65,y:80+deltaY/distance*65};
    return `<div class="drawing-proof"><strong>${drawing.title}</strong><svg viewBox="0 0 190 145" role="img" aria-label="${drawing.title}的學生作品">${line(94,80,first.x,first.y,'#315f54',5)}${line(94,80,second.x,second.y,'#df9052',5)}${circle(94,80,5,'#315f54')}</svg></div>`;
  }).join('');
}
function restart() {
  state.index = 0;
  state.solved.clear();
  state.mistakes = 0;
  state.drawings = {};
  element('check-drawing').disabled = false;
  renderTask();
}
element('start').addEventListener('click',restart);
element('restart').addEventListener('click',restart);
element('play-again').addEventListener('click',restart);
element('next').addEventListener('click',() => {
  if (!state.solved.has(state.index)) return;
  state.index += 1;
  if (state.index < tasks.length) {
    element('check-drawing').disabled = false;
    renderTask();
  } else showFinish();
});
element('tool-button').addEventListener('click',() => {
  state.toolShown = !state.toolShown;
  element('tool-button').textContent = state.toolShown ? '收起直角工具' : '顯示直角工具';
  renderBoard(tasks[state.index]);
});
element('check-drawing').addEventListener('click',checkDrawing);
element('reset-drawing').addEventListener('click',() => {
  if (state.solved.has(state.index)) return;
  state.endpoint = null;
  state.moved = false;
  feedback('已清除第二條邊。請再拖動橙色圓點。');
  renderBoard(tasks[state.index]);
});
board.addEventListener('pointermove',moveDrag);
board.addEventListener('pointerup',() => {state.dragging = false;});
board.addEventListener('pointercancel',() => {state.dragging = false;});
