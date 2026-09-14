let currentPrepEq = null;
let prepAnimTimeouts = [];
let hintAnimInterval = null;
let prepCurrentInput = "";
let prepStage = 1; 
let prepOptions = [];
let prepCorrectOptIndex = -1;
let checkGhost = null;
let isAnimatingSnapback = false;

function clearPrepAnimations() {
    prepAnimTimeouts.forEach(t => clearTimeout(t));
    prepAnimTimeouts = [];
    if (hintAnimInterval) clearInterval(hintAnimInterval);
    document.querySelectorAll('.hint-fly-anim').forEach(el => el.remove());
    document.querySelectorAll('#check-ghost-drag').forEach(el => el.remove());
    checkGhost = null;
    isAnimatingSnapback = false;
}

function pTimer(fn, delay) {
    prepAnimTimeouts.push(setTimeout(fn, delay));
}

function startPrepMode() {
    isPrepMode = true;
    mainPanel.classList.remove('battle-active');
    showScreen('prep-screen');
    loadPrepQuestion();
}

function loadPrepQuestion() {
    clearPrepAnimations();
    prepStage = 1;
    let qData = generateQuestion();
    currentPrepEq = qData.prepData;
    currentPrepEq.letter = qData.letter;
    
    document.getElementById('prep-hint-box').style.opacity = '0';
    document.getElementById('prep-scheme-wrapper').style.display = 'none';
    document.getElementById('prep-scheme-wrapper').style.opacity = '0';
    document.getElementById('prep-chips-dock').style.display = 'none';
    document.getElementById('prep-phase3').style.display = 'none';
    document.getElementById('prep-phase4').style.display = 'none';
    
    document.getElementById('prep-check-container').style.display = 'none';
    document.getElementById('prep-check-container').style.opacity = '0';
    document.getElementById('prep-final-input-row').style.display = 'none';
    document.getElementById('prep-final-input-row').style.opacity = '0';
    
    document.getElementById('prep-check-display').style.display = "none";
    document.getElementById('prep-check-display').innerText = "";
    
    let finalCheckDisp = document.getElementById('prep-check-input-display');
    finalCheckDisp.innerText = "";
    finalCheckDisp.style.borderColor = "#fff";
    finalCheckDisp.style.background = "rgba(255, 255, 255, 0.7)";
    finalCheckDisp.style.color = "#0f172a";
    
    ['svg-arc-top', 'svg-arc-left', 'svg-arc-right'].forEach(id => {
        document.getElementById(id).setAttribute('class', 'scheme-path');
    });
    ['dz-whole', 'dz-p1', 'dz-p2'].forEach(id => {
        let dz = document.getElementById(id);
        dz.className = 'drop-zone';
        dz.innerHTML = '?';
        dz.style.transform = 'translate(-50%, -50%)';
    });
    
    let cutGroup = document.getElementById('svg-cut-group');
    cutGroup.style.opacity = '0';
    cutGroup.classList.remove('svg-falling');
    
    let remainGroup = document.getElementById('svg-remain-group');
    remainGroup.style.transition = 'none';
    remainGroup.style.opacity = '0';
    
    let scissors = document.getElementById('scissors');
    scissors.style.opacity = '0';
    scissors.classList.remove('snip');
    
    document.getElementById('prep-instruction').innerText = "Найди целое (самое большое число):";
    
    let eqBox = document.getElementById('prep-equation-box');
    eqBox.classList.remove('small');
    eqBox.classList.remove('hidden');
    eqBox.style.display = 'flex';

    if (currentPrepEq.op === '-') {
        eqBox.innerHTML = `
            <span class="prep-term" data-val="${currentPrepEq.whole}" data-iswhole="true">${currentPrepEq.whole}</span>
            <span>-</span>
            <span class="prep-term" data-val="${currentPrepEq.p1 === currentPrepEq.whole ? currentPrepEq.p2 : currentPrepEq.p1}" data-iswhole="false">${currentPrepEq.p1 === currentPrepEq.whole ? currentPrepEq.p2 : currentPrepEq.p1}</span>
            <span>=</span>
            <span class="prep-term" data-val="${currentPrepEq.p2 === currentPrepEq.whole ? currentPrepEq.p1 : currentPrepEq.p2}" data-iswhole="false">${currentPrepEq.p2 === currentPrepEq.whole ? currentPrepEq.p1 : currentPrepEq.p2}</span>
        `;
    } else {
        eqBox.innerHTML = `
            <span class="prep-term" data-val="${currentPrepEq.p1}" data-iswhole="false">${currentPrepEq.p1}</span>
            <span>+</span>
            <span class="prep-term" data-val="${currentPrepEq.p2}" data-iswhole="false">${currentPrepEq.p2}</span>
            <span>=</span>
            <span class="prep-term" data-val="${currentPrepEq.whole}" data-iswhole="true">${currentPrepEq.whole}</span>
        `;
    }

    document.querySelectorAll('.prep-term').forEach(el => {
        el.onclick = () => checkPrepWhole(el);
    });
    
    let inputDisp = document.getElementById('prep-input-display');
    inputDisp.classList.remove('pulsate-green-text');
    inputDisp.onpointerdown = null;
    inputDisp.style.cursor = 'default';
    inputDisp.style.background = "rgba(255, 255, 255, 0.7)";
    inputDisp.style.borderColor = "#fff";
    inputDisp.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.6)";
    inputDisp.style.color = "#0f172a";
    inputDisp.innerText = "";
}

function checkPrepWhole(el) {
    if (el.dataset.iswhole === "true") {
        el.classList.add('correct');
        document.getElementById('prep-hint-box').style.opacity = '0';
        document.querySelectorAll('.prep-term').forEach(e => e.onclick = null);
        setTimeout(() => startPrepPhase2(), 800);
    } else {
        let hintBox = document.getElementById('prep-hint-box');
        if (currentPrepEq.op === '+') {
            hintBox.innerHTML = `При сложении самое большое число (целое) — это сумма!<br>
            <div class="hint-formula"><span class="color-p">${currentPrepEq.p1}</span> (слагаемое) + <span class="color-p">${currentPrepEq.p2}</span> (слагаемое) = <span class="color-w">${currentPrepEq.whole}</span> (сумма/целое)</div>`;
        } else {
            hintBox.innerHTML = `При вычитании самое большое число (целое) — это уменьшаемое!<br>
            <div class="hint-formula"><span class="color-w">${currentPrepEq.whole}</span> (уменьш./целое) - <span class="color-p">${currentPrepEq.p1}</span> (вычитаемое) = <span class="color-p">${currentPrepEq.p2}</span> (разность)</div>`;
        }
        hintBox.style.opacity = '1';
    }
}

function startPrepPhase2() {
    document.getElementById('prep-instruction').innerText = "Перенеси целое на верхнюю дугу, а части — на нижние дуги!";
    document.getElementById('prep-equation-box').classList.add('small');

    let ratio = currentPrepEq.p1Val / currentPrepEq.wholeVal;
    ratio = Math.max(0.2, Math.min(0.8, ratio)); 
    let xMid = 60 + ratio * 380; 
    document.getElementById('svg-mid-tick').setAttribute('x1', xMid);
    document.getElementById('svg-mid-tick').setAttribute('x2', xMid);

    let leftCenter = 60 + (xMid - 60) / 2;
    let rightCenter = xMid + (440 - xMid) / 2;

    document.getElementById('dz-p1').style.left = ((leftCenter / 500) * 100) + '%';
    document.getElementById('dz-p2').style.left = ((rightCenter / 500) * 100) + '%';
    document.getElementById('svg-arc-left').setAttribute('d', `M 60 110 Q ${leftCenter} 170 ${xMid} 110`);
    document.getElementById('svg-arc-right').setAttribute('d', `M ${xMid} 110 Q ${rightCenter} 170 440 110`);

    let dock = document.getElementById('prep-chips-dock');
    dock.style.display = 'flex';
    let vals = [{ id: 'whole', val: currentPrepEq.whole }, { id: 'p1', val: currentPrepEq.p1 }, { id: 'p2', val: currentPrepEq.p2 }];
    vals.sort(() => Math.random() - 0.5);
    
    dock.innerHTML = '';
    vals.forEach(item => {
        let chip = document.createElement('div');
        chip.className = 'drag-chip';
        chip.innerText = item.val;
        chip.dataset.expected = item.id;
        chip.onpointerdown = startDrag;
        dock.appendChild(chip);
    });

    let schemeWrap = document.getElementById('prep-scheme-wrapper');
    schemeWrap.style.display = 'block';
    setTimeout(() => { schemeWrap.style.opacity = '1'; dock.style.opacity = '1'; }, 50);
}

let activeChip = null;
let ghostChip = null;

function startDrag(e) {
    if(e.target.classList.contains('placed')) return;
    activeChip = e.target;
    ghostChip = activeChip.cloneNode(true);
    ghostChip.className = 'ghost-chip';
    document.body.appendChild(ghostChip);
    window.moveGhost(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY);
    activeChip.style.opacity = '0';
    window.addEventListener('pointermove', window.dragMove, {passive: false});
    window.addEventListener('pointerup', window.endDrag);
}
window.moveGhost = function(x, y) { if (!ghostChip) return; ghostChip.style.left = (x - ghostChip.offsetWidth / 2) + 'px'; ghostChip.style.top = (y - ghostChip.offsetHeight / 2) + 'px'; }
window.dragMove = function(e) { e.preventDefault(); window.moveGhost(e.clientX, e.clientY); }
window.endDrag = function(e) {
    window.removeEventListener('pointermove', window.dragMove);
    window.removeEventListener('pointerup', window.endDrag);
    if (!ghostChip) return;

    let dropZone = document.elementFromPoint(e.clientX, e.clientY)?.closest('.drop-zone');
    if (dropZone && dropZone.innerText === '?') {
        if (dropZone.dataset.expected === activeChip.dataset.expected) {
            activeChip.classList.add('placed');
            dropZone.innerText = activeChip.innerText;
            dropZone.classList.add('filled');
            checkPrepPhase2Win();
        } else { snapBack(); }
    } else { snapBack(); }
    
    ghostChip.remove(); ghostChip = null; activeChip = null;
}

function snapBack() {
    activeChip.style.opacity = '1';
    activeChip.animate([ {transform:'translateX(-6px)'}, {transform:'translateX(6px)'}, {transform:'translateX(-6px)'}, {transform:'translateX(0)'} ], {duration: 300});
}

function checkPrepPhase2Win() {
    if (document.querySelectorAll('.drag-chip.placed').length === 3) setTimeout(startPrepPhase3, 500);
}

function startPrepPhase3() {
    document.getElementById('prep-chips-dock').style.display = 'none';
    document.getElementById('prep-instruction').innerText = "Супер! Теперь посмотри на схему:";
    let p3 = document.getElementById('prep-phase3');
    p3.style.display = 'flex';
    document.getElementById('p3-q-text').innerText = `${currentPrepEq.letter} — это целое или часть?`;
    setTimeout(() => { p3.style.opacity = '1'; }, 50);
}

function checkPrepUnknown(isWholeClicked) {
    let actualIsWhole = (currentPrepEq.letter === currentPrepEq.whole);
    if (isWholeClicked === actualIsWhole) {
        document.getElementById('prep-hint-box').style.opacity = '0';
        document.getElementById('prep-phase3').style.display = 'none';
        startPrepPhase4(actualIsWhole);
    } else {
        let hintBox = document.getElementById('prep-hint-box');
        hintBox.innerText = actualIsWhole ? "Неверно! Посмотри, где стоит буква на схеме. Она на дуге целого!" : "Неверно! Посмотри на схему. Буква стоит внизу, значит это часть!";
        hintBox.style.opacity = '1';
    }
}

function shufflePrepOptions() {
    let correctVal = prepOptions[0];
    prepOptions.sort(() => Math.random() - 0.5);
    prepCorrectOptIndex = prepOptions.indexOf(correctVal);
}

function showPrepOptions() {
    for(let i=0; i<3; i++) {
        let btn = document.getElementById(`prep-opt-btn-${i}`);
        btn.innerText = prepOptions[i];
        btn.style.background = "rgba(255, 255, 255, 0.85)";
        btn.style.borderColor = "#fff";
        btn.disabled = false;
    }
    let optionsBlock = document.getElementById('prep-options-block');
    optionsBlock.style.display = 'flex';
    optionsBlock.classList.add('active');
}

function startPrepPhase4(isWhole) {
    document.getElementById('prep-equation-box').classList.add('hidden'); 
    prepStage = 1;

    let termP1 = currentPrepEq.p1;
    let termP2 = currentPrepEq.p2;
    let termW  = currentPrepEq.whole;
    
    let origHtml = "";
    if (currentPrepEq.op === '-') {
        origHtml = `<span class="prep-circle-styled">${termW}</span> - <span class="smile-arc">${termP1}</span> = <span class="smile-arc">${termP2}</span>`;
    } else {
        origHtml = `<span class="smile-arc">${termP1}</span> + <span class="smile-arc">${termP2}</span> = <span class="prep-circle-styled">${termW}</span>`;
    }
    document.getElementById('p4-orig-eq').innerHTML = `<div style="display:flex; align-items:center; justify-content:center; gap:10px;">${origHtml}</div>`;

    document.getElementById('prep-instruction').innerText = "Выбери, как найти " + currentPrepEq.letter + ":";
    
    let ruleText = document.getElementById('p4-rule-text');
    if (isWhole) {
        ruleText.innerText = "Чтобы найти ЦЕЛОЕ, нужно сложить ЧАСТИ";
        document.getElementById('p4-var-1').innerHTML = `<span class="prep-circle-styled">${currentPrepEq.letter}</span>`;
        document.getElementById('p4-var-2').innerHTML = `<span class="prep-circle-styled">${currentPrepEq.letter}</span>`;
    } else {
        ruleText.innerText = "Чтобы найти ЧАСТЬ, нужно из целого вычесть известную часть";
        document.getElementById('p4-var-1').innerHTML = `<span class="smile-arc">${currentPrepEq.letter}</span>`;
        document.getElementById('p4-var-2').innerHTML = `<span class="smile-arc">${currentPrepEq.letter}</span>`;
    }

    document.getElementById('p4-expr-1').innerHTML = "?";
    document.getElementById('prep-step2-row').style.opacity = '0';
    document.getElementById('prep-check-container').style.display = 'none';
    document.getElementById('prep-check-container').style.opacity = '0';

    prepOptions = [currentPrepEq.step1Correct, currentPrepEq.step1Wrong[0], currentPrepEq.step1Wrong[1]];
    shufflePrepOptions();
    showPrepOptions();

    document.getElementById('prep-numpad-block').style.display = 'none';
    document.getElementById('prep-next-btn').style.display = 'none';

    let p4 = document.getElementById('prep-phase4');
    p4.style.display = 'flex';
    setTimeout(() => { p4.style.opacity = '1'; }, 50);

    runPrepAnimationLoop(isWhole);
}

function selectPrepOption(index) {
    let optBtns = [ document.getElementById(`prep-opt-btn-0`), document.getElementById(`prep-opt-btn-1`), document.getElementById(`prep-opt-btn-2`) ];
    if(index === prepCorrectOptIndex) {
        optBtns[index].style.background = "#c9ffbf"; optBtns[index].style.borderColor = "#4ade80"; optBtns.forEach(btn => btn.disabled = true);
        if (prepStage === 1) {
            setTimeout(() => {
                let isWhole = (currentPrepEq.letter === currentPrepEq.whole);
                let styledExpr = "";
                if (isWhole) {
                    styledExpr = `<span class="smile-arc">${currentPrepEq.p1}</span> + <span class="smile-arc">${currentPrepEq.p2}</span>`;
                } else {
                    let knownPart = currentPrepEq.letter === currentPrepEq.p1 ? currentPrepEq.p2 : currentPrepEq.p1;
                    styledExpr = `<span class="prep-circle-styled">${currentPrepEq.whole}</span> - <span class="smile-arc">${knownPart}</span>`;
                }
                document.getElementById('p4-expr-1').innerHTML = styledExpr;

                prepStage = 2;
                prepCurrentInput = "";
                let inputDisp = document.getElementById('prep-input-display');
                inputDisp.innerText = "";
                inputDisp.style.background = "rgba(255, 255, 255, 0.7)";
                inputDisp.style.borderColor = "#fff";
                inputDisp.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.6)";
                inputDisp.style.color = "#0f172a";
                inputDisp.classList.remove('pulsate-green-text');
                inputDisp.onpointerdown = null;
                inputDisp.style.cursor = 'default';

                document.getElementById('prep-step2-row').style.opacity = '1';
                document.getElementById('prep-instruction').innerText = "Посчитай " + currentPrepEq.letter + ":";

                let optionsBlock = document.getElementById('prep-options-block');
                optionsBlock.classList.remove('active');
                setTimeout(() => {
                    optionsBlock.style.display = 'none';
                    document.getElementById('prep-numpad-block').style.display = 'flex';
                }, 300);
            }, 800);
        }
    } else {
        optBtns[index].style.background = "#ffafbd"; optBtns[index].style.borderColor = "#f87171";
        let hintBox = document.getElementById('prep-hint-box');
        hintBox.innerText = "Ой! Посмотри на правило выше!";
        hintBox.style.opacity = '1';
        setTimeout(() => { hintBox.style.opacity = '0'; }, 2000);
    }
}

function runPrepAnimationLoop(isWhole) {
    if (!isPrepMode || document.getElementById('prep-screen').style.display === 'none') return;
    clearPrepAnimations();

    let dzW = document.getElementById('dz-whole'), dzP1 = document.getElementById('dz-p1'), dzP2 = document.getElementById('dz-p2');
    let arcW = document.getElementById('svg-arc-top'), arcP1 = document.getElementById('svg-arc-left'), arcP2 = document.getElementById('svg-arc-right');
    let scissors = document.getElementById('scissors'), cutGroup = document.getElementById('svg-cut-group'), cutFill = document.getElementById('svg-cut-fill');
    let arcTopCut = document.getElementById('svg-arc-top-cut'), cutLine = document.getElementById('svg-line-cut');
    let clipRect = document.getElementById('clip-rect'), remainGroup = document.getElementById('svg-remain-group'), clipRectRemain = document.getElementById('clip-rect-remain');

    [dzW, dzP1, dzP2].forEach(el => { el.className = 'drop-zone filled'; el.style.transform = 'translate(-50%, -50%)'; });
    [arcW, arcP1, arcP2].forEach(el => el.setAttribute('class', 'scheme-path'));
    
    scissors.style.opacity = '0'; scissors.classList.remove('snip');
    cutGroup.classList.remove('svg-falling'); cutGroup.style.opacity = '0';
    remainGroup.style.transition = 'none'; remainGroup.style.opacity = '0';
    cutFill.setAttribute('class', ''); cutFill.setAttribute('opacity', '0');
    arcTopCut.setAttribute('class', 'scheme-path'); arcTopCut.setAttribute('opacity', '0');
    cutLine.setAttribute('class', ''); cutLine.setAttribute('opacity', '0');

    setTimeout(() => { cutFill.style.transition = 'all 0.4s ease'; arcTopCut.style.transition = 'all 0.4s ease'; remainGroup.style.transition = 'opacity 0.4s ease'; }, 50);

    if (isWhole) {
        clipRectRemain.setAttribute('x', '60'); clipRectRemain.setAttribute('width', '380');
        pTimer(() => { dzP1.classList.add('dz-glow-green'); arcP1.setAttribute('class', 'scheme-path arc-glow-green'); dzP2.classList.add('dz-glow-green'); arcP2.setAttribute('class', 'scheme-path arc-glow-green'); }, 500);
        pTimer(() => { dzP1.classList.remove('dz-glow-green'); arcP1.setAttribute('class', 'scheme-path'); dzP2.classList.remove('dz-glow-green'); arcP2.setAttribute('class', 'scheme-path'); dzW.classList.add('dz-glow-green'); arcW.setAttribute('class', 'scheme-path arc-glow-green'); remainGroup.style.opacity = '1'; }, 2000);
        pTimer(() => runPrepAnimationLoop(isWhole), 4500);
    } else {
        let isP1Unknown = (currentPrepEq.letter === currentPrepEq.p1);
        let dzUnknown = isP1Unknown ? dzP1 : dzP2, dzKnown = isP1Unknown ? dzP2 : dzP1;
        let arcUnknown = isP1Unknown ? arcP1 : arcP2, arcKnown = isP1Unknown ? arcP2 : arcP1;
        let xMid = parseFloat(document.getElementById('svg-mid-tick').getAttribute('x1'));

        if (isP1Unknown) { clipRect.setAttribute('x', xMid); clipRect.setAttribute('width', 450 - xMid); clipRectRemain.setAttribute('x', 60); clipRectRemain.setAttribute('width', xMid - 60);
        } else { clipRect.setAttribute('x', 50); clipRect.setAttribute('width', xMid - 50); clipRectRemain.setAttribute('x', xMid); clipRectRemain.setAttribute('width', 450 - xMid); }
        scissors.style.left = ((xMid / 500) * 100) + '%'; scissors.style.top = '0px';

        pTimer(() => { dzW.classList.add('dz-glow-green'); arcW.setAttribute('class', 'scheme-path arc-glow-green'); }, 500);
        pTimer(() => { dzKnown.classList.add('dz-glow-red-blink'); arcKnown.setAttribute('class', 'scheme-path arc-glow-red-blink'); cutGroup.style.opacity = '1'; arcTopCut.setAttribute('opacity', '1'); arcTopCut.setAttribute('class', 'scheme-path arc-glow-red-blink'); cutFill.setAttribute('opacity', '1'); cutFill.setAttribute('class', 'fill-glow-red-blink'); cutLine.setAttribute('opacity', '1'); cutLine.setAttribute('class', 'line-glow-red-blink'); }, 1500);
        pTimer(() => { scissors.style.opacity = '1'; scissors.style.top = '75px'; }, 2200);
        pTimer(() => { scissors.classList.add('snip'); }, 2600);
        pTimer(() => { dzKnown.classList.remove('dz-glow-red-blink'); dzKnown.classList.add('dz-falling'); arcKnown.setAttribute('class', 'scheme-path arc-fade'); cutGroup.classList.add('svg-falling'); scissors.style.opacity = '0'; dzUnknown.classList.add('dz-glow-green'); arcUnknown.setAttribute('class', 'scheme-path arc-glow-green'); remainGroup.style.opacity = '1'; }, 3500);
        pTimer(() => runPrepAnimationLoop(isWhole), 6500);
    }
}

function inputPrepNum(num) {
    if (prepCurrentInput.length < 3) {
        prepCurrentInput += num;
        let inputDisp = (prepStage === 2) ? document.getElementById('prep-input-display') : document.getElementById('prep-check-input-display');
        if (inputDisp) inputDisp.innerText = prepCurrentInput;
    }
}

function deletePrepNum() {
    prepCurrentInput = prepCurrentInput.slice(0, -1);
    let inputDisp = (prepStage === 2) ? document.getElementById('prep-input-display') : document.getElementById('prep-check-input-display');
    if (inputDisp) inputDisp.innerText = prepCurrentInput;
}

function submitPrepNum() {
    if (prepCurrentInput === "") return;
    
    if (prepStage === 2) {
        let inputDisp = document.getElementById('prep-input-display');
        if (prepCurrentInput === currentPrepEq.ans) {
            inputDisp.style.borderColor = "#4ade80"; 
            inputDisp.style.background = "#c9ffbf";
            document.getElementById('prep-numpad-block').style.display = 'none';
            
            setTimeout(() => { 
                startPrepCheckStage3(); 
            }, 500);
        } else {
            inputDisp.style.borderColor = "#f87171"; inputDisp.style.background = "#ffafbd";
            setTimeout(() => { 
                inputDisp.style.borderColor = "#fff"; 
                inputDisp.style.background = "rgba(255, 255, 255, 0.7)"; 
                prepCurrentInput = ""; 
                inputDisp.innerText = ""; 
            }, 800);
        }
    } else if (prepStage === 4) {
        let inputDisp = document.getElementById('prep-check-input-display');
        let rightSide = currentPrepEq.eqText.split("=")[1].trim(); 
        
        if (prepCurrentInput === rightSide) {
            inputDisp.style.borderColor = "#4ade80"; inputDisp.style.background = "#c9ffbf"; inputDisp.style.color = "#15803d";
            setTimeout(() => {
                document.getElementById('prep-numpad-block').style.display = 'none';
                document.getElementById('prep-instruction').innerText = "Отлично! Уравнение решено верно.";
                document.getElementById('prep-next-btn').style.display = 'block';
            }, 500);
        } else {
            inputDisp.style.borderColor = "#f87171"; inputDisp.style.background = "#ffafbd";
            setTimeout(() => { 
                inputDisp.style.borderColor = "#fff"; 
                inputDisp.style.background = "rgba(255, 255, 255, 0.7)"; 
                prepCurrentInput = ""; 
                inputDisp.innerText = ""; 
            }, 800);
        }
    }
}

function startPrepCheckStage3() {
    prepStage = 3;
    document.getElementById('prep-instruction').innerText = "Перенеси найденное число на место буквы для проверки!";

    let checkContainer = document.getElementById('prep-check-container');
    checkContainer.style.display = 'flex';
    setTimeout(() => { checkContainer.style.opacity = '1'; }, 50);

    let eqParts = currentPrepEq.eqText.split('=');
    let leftSide = eqParts[0].trim();
    let rightSide = eqParts[1].trim();
    let dzHtml = `<span id="check-letter-dz" class="letter-drop-zone">${currentPrepEq.letter}</span>`;
    let checkLeftHtml = leftSide.replace(currentPrepEq.letter, dzHtml);
    
    let checkDisplay = document.getElementById('prep-check-display');
    checkDisplay.innerHTML = `${checkLeftHtml} = ${rightSide}`;
    checkDisplay.style.display = 'block';
    
    document.getElementById('prep-final-input-row').style.display = 'none';
    document.getElementById('prep-final-input-row').style.opacity = '0';

    let inputDisp = document.getElementById('prep-input-display');
    inputDisp.classList.add('pulsate-green-text');
    inputDisp.onpointerdown = window.startCheckDrag;

    startHintAnimation();
}

function startHintAnimation() {
    if (prepStage !== 3) return;
    playHintFly();
    hintAnimInterval = setInterval(() => {
        if (prepStage === 3) playHintFly();
        else clearInterval(hintAnimInterval);
    }, 3000);
}

function playHintFly() {
    let source = document.getElementById('prep-input-display');
    let target = document.getElementById('check-letter-dz');
    if (!source || !target) return;

    let sRect = source.getBoundingClientRect();
    let tRect = target.getBoundingClientRect();

    let hintEl = source.cloneNode(true);
    hintEl.id = '';
    hintEl.className = 'hint-fly-anim';
    hintEl.style.left = sRect.left + 'px';
    hintEl.style.top = sRect.top + 'px';
    hintEl.style.width = sRect.width + 'px';
    hintEl.style.height = sRect.height + 'px';
    hintEl.style.fontSize = window.getComputedStyle(source).fontSize;
    
    document.body.appendChild(hintEl);

    let anim = hintEl.animate([
        { transform: 'translate(0, 0)', opacity: 0.6, offset: 0 },
        { transform: `translate(${tRect.left - sRect.left}px, ${tRect.top - sRect.top}px)`, opacity: 0.6, offset: 0.8 },
        { transform: `translate(${tRect.left - sRect.left}px, ${tRect.top - sRect.top}px)`, opacity: 0, offset: 1 }
    ], {
        duration: 1500,
        easing: 'ease-in-out'
    });

    anim.onfinish = () => {
        if(document.body.contains(hintEl)) hintEl.remove();
    };
}

window.startCheckDrag = function(e) {
    if (isAnimatingSnapback) return; 
    
    document.querySelectorAll('#check-ghost-drag').forEach(el => el.remove());

    let inputDisp = document.getElementById('prep-input-display');
    
    checkGhost = inputDisp.cloneNode(true);
    checkGhost.id = "check-ghost-drag";
    checkGhost.className = '';
    
    checkGhost.style.position = 'fixed';
    checkGhost.style.color = '#16a34a';
    checkGhost.style.fontWeight = '900';
    checkGhost.style.textShadow = '0 0 10px rgba(34, 197, 94, 0.8)';
    checkGhost.style.zIndex = '1000';
    checkGhost.style.pointerEvents = 'none';
    checkGhost.style.fontSize = window.getComputedStyle(inputDisp).fontSize;

    document.body.appendChild(checkGhost);
    
    inputDisp.style.opacity = '0.3';
    
    let x = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    let y = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
    window.moveCheckGhost(x, y);
    
    window.addEventListener('pointermove', window.checkDragMove, {passive: false});
    window.addEventListener('pointerup', window.endCheckDrag);
    window.addEventListener('touchend', window.endCheckDrag);
}

window.moveCheckGhost = function(x, y) {
    if (!checkGhost) return;
    checkGhost.style.left = (x - checkGhost.offsetWidth / 2) + 'px';
    checkGhost.style.top = (y - checkGhost.offsetHeight / 2) + 'px';
}

window.checkDragMove = function(e) {
    e.preventDefault();
    let x = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    let y = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
    window.moveCheckGhost(x, y);
}

window.endCheckDrag = function(e) {
    window.removeEventListener('pointermove', window.checkDragMove);
    window.removeEventListener('pointerup', window.endCheckDrag);
    window.removeEventListener('touchend', window.endCheckDrag);
    
    if (!checkGhost) return;
    
    let cg = checkGhost;
    checkGhost = null; 
    
    let x = e.clientX !== undefined ? e.clientX : e.changedTouches[0].clientX;
    let y = e.clientY !== undefined ? e.clientY : e.changedTouches[0].clientY;
    
    cg.style.display = 'none';
    let dropZone = document.elementFromPoint(x, y)?.closest('#check-letter-dz');
    cg.style.display = 'flex';
    
    let inputDisp = document.getElementById('prep-input-display');

    if (dropZone && dropZone.innerText !== currentPrepEq.ans) {
        dropZone.classList.add('filled');
        dropZone.innerText = currentPrepEq.ans;
        
        inputDisp.classList.remove('pulsate-green-text');
        inputDisp.style.opacity = '1';
        inputDisp.style.color = '#0f172a'; 
        inputDisp.onpointerdown = null;
        inputDisp.style.cursor = 'default';
        
        cg.remove();
        
        if (hintAnimInterval) clearInterval(hintAnimInterval);
        document.querySelectorAll('.hint-fly-anim').forEach(el => el.remove());
        
        setTimeout(() => startPrepStage4(), 400);
    } else {
        inputDisp.style.opacity = '1';
        let rect = inputDisp.getBoundingClientRect();
        
        isAnimatingSnapback = true;
        
        cg.animate([
            {left: cg.style.left, top: cg.style.top},
            {left: rect.left + 'px', top: rect.top + 'px'}
        ], {duration: 250, easing: 'ease-out'}).onfinish = () => {
            cg.remove();
            isAnimatingSnapback = false;
        };
    }
}

function startPrepStage4() {
    prepStage = 4;
    prepCurrentInput = "";
    document.getElementById('prep-instruction').innerText = "Посчитай левую часть:";
    
    let rightSide = currentPrepEq.eqText.split('=')[1].trim();
    document.getElementById('prep-check-right-side').innerText = rightSide;
    
    let finalInputDisp = document.getElementById('prep-check-input-display');
    if(finalInputDisp) {
        finalInputDisp.innerText = "";
        finalInputDisp.style.borderColor = "#fff";
        finalInputDisp.style.background = "rgba(255, 255, 255, 0.7)";
        finalInputDisp.style.color = "#0f172a";
    }
    
    document.getElementById('prep-final-input-row').style.display = 'flex';
    setTimeout(() => { document.getElementById('prep-final-input-row').style.opacity = '1'; }, 50);
    
    document.getElementById('prep-numpad-block').style.display = 'flex';
}

function resetPrepGame() {
    clearPrepAnimations();
    window.removeEventListener('pointermove', window.dragMove);
    window.removeEventListener('pointerup', window.endDrag);
    window.removeEventListener('pointermove', window.checkDragMove);
    window.removeEventListener('pointerup', window.endCheckDrag);
    window.removeEventListener('touchend', window.endCheckDrag);
    if (ghostChip) ghostChip.remove();
    if (checkGhost) checkGhost.remove();
    resetGame();
}
