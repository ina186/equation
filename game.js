function createPlayerState(mode, name) {
    return { mode: mode, name: name, currentIndex: 0, mistakes: 0, score: 0, currentStage: 1, currentOptions: [], correctOptionIndex: -1, currentInput: "", currentQuestion: null };
}

function getBoardHTML(id, isBattle, playerName) {
    const headerHTML = isBattle ? `<div class="player-header">${playerName}<br><span class="stat-text">Счет: <span id="${id}-score" class="stat-val">0</span> | Ошибки: <span id="${id}-errors" class="stat-err">0</span></span></div>` : '';
    return `
    <div class="board-wrapper ${isBattle ? 'battle-mode' : ''}" id="board-${id}">
        ${headerHTML}
        <div class="progress-bar" style="${isBattle ? 'display:none;' : ''}"><div id="${id}-progress" class="progress-fill"></div></div>
        <div class="instructions" id="${id}-instruction-text">Выбери, как найти x:</div>
        <div class="game-layout">
            <div class="left-panel">
                <div id="${id}-emoji" class="emoji-display">🍓</div>
                <div class="math-container">
                    <div id="${id}-equation" class="equation"></div>
                    <div class="step-row" id="${id}-step1-row" style="opacity: 0;"><span id="${id}-step1-var">x = </span><div id="${id}-step1-display" style="min-width: 60px; text-align: center;">?</div></div>
                    <div class="step-row" id="${id}-step2-row" style="opacity: 0;"><span id="${id}-step2-var">x = </span><div id="${id}-input-display" class="input-area"></div></div>
                    <div id="${id}-divider" class="math-divider" style="opacity: 0;"></div>
                    <div id="${id}-step3-container" style="opacity: 0; width: 100%; text-align: center;">
                        <div class="check-title">ПРОВЕРКА:</div>
                        <div id="${id}-check-display" class="check-equation">?</div>
                        <div id="${id}-final-check-row" class="final-check-row" style="opacity: 0; display: none;"><div id="${id}-final-input" class="input-area final-input-area"></div><span id="${id}-final-eq">=</span><span id="${id}-final-right"></span></div>
                    </div>
                </div>
            </div>
            <div class="right-panel">
                <div id="${id}-options-block" class="options-container">
                    <button class="option-btn" id="${id}-opt-btn-0" onpointerdown="selectOption('${id}', 0)"></button>
                    <button class="option-btn" id="${id}-opt-btn-1" onpointerdown="selectOption('${id}', 1)"></button>
                    <button class="option-btn" id="${id}-opt-btn-2" onpointerdown="selectOption('${id}', 2)"></button>
                </div>
                <div id="${id}-numpad-block" class="numpad-container">
                    <div class="numpad">
                        <button class="num-btn" onpointerdown="inputNum('${id}', '1')">1</button>
                        <button class="num-btn" onpointerdown="inputNum('${id}', '2')">2</button>
                        <button class="num-btn" onpointerdown="inputNum('${id}', '3')">3</button>
                        <button class="num-btn" onpointerdown="inputNum('${id}', '4')">4</button>
                        <button class="num-btn" onpointerdown="inputNum('${id}', '5')">5</button>
                        <button class="num-btn" onpointerdown="inputNum('${id}', '6')">6</button>
                        <button class="num-btn" onpointerdown="inputNum('${id}', '7')">7</button>
                        <button class="num-btn" onpointerdown="inputNum('${id}', '8')">8</button>
                        <button class="num-btn" onpointerdown="inputNum('${id}', '9')">9</button>
                        <button class="num-btn action" onpointerdown="deleteNum('${id}')">⌫</button>
                        <button class="num-btn" onpointerdown="inputNum('${id}', '0')">0</button>
                        <div style="visibility: hidden;"></div> 
                        <button class="num-btn action enter" onpointerdown="submitNum('${id}')">Дальше ➔</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

function startGame(mode) {
    isPrepMode = false; isBattleMode = false; mainPanel.classList.remove('battle-active'); showScreen('game-screen'); battleHeaderDesk.style.display = 'none'; exitBtnGlobal.style.display = 'flex';
    boardsContainer.innerHTML = getBoardHTML('single', false, 'Игрок'); players = { 'single': createPlayerState(mode, 'Игрок') }; loadQuestion('single');
}

function startBattle() {
    isPrepMode = false; isBattleMode = true; mainPanel.classList.add('battle-active'); showScreen('game-screen'); battleHeaderDesk.style.display = 'flex'; exitBtnGlobal.style.display = 'flex'; 
    let p1Name = document.getElementById('input-p1').value.trim() || 'Игрок 1', p2Name = document.getElementById('input-p2').value.trim() || 'Игрок 2';
    boardsContainer.innerHTML = getBoardHTML('p1', true, p1Name) + `<div id="mobile-battle-bar" class="mobile-battle-bar"><div class="battle-timer-bar" style="margin: 0; width: 100%;"><div id="battle-timer-fill-mob" class="battle-timer-fill"></div><span id="timer-percent-mob" class="timer-percent"><div class="hourglass">⏳</div></span></div></div>` + getBoardHTML('p2', true, p2Name);
    players = { 'p1': createPlayerState('arcade', p1Name), 'p2': createPlayerState('arcade', p2Name) };
    loadQuestion('p1'); loadQuestion('p2'); startTimer(120); 
}

function loadQuestion(id) {
    let p = players[id]; p.currentQuestion = generateQuestion();
    document.getElementById(`${id}-equation`).innerText = p.currentQuestion.eq; document.getElementById(`${id}-emoji`).innerText = p.currentQuestion.emoji;
    document.getElementById(`${id}-step1-var`).innerText = p.currentQuestion.letter + " = "; document.getElementById(`${id}-step2-var`).innerText = p.currentQuestion.letter + " = ";
    
    if (!isBattleMode) {
        let progressFill = document.getElementById(`${id}-progress`);
        progressFill.style.width = p.mode === 'arcade' ? ((p.currentIndex % 10) / 10 * 100) + '%' : (p.currentIndex / p.mode * 100) + '%';
    }
    
    document.getElementById(`${id}-step1-row`).style.opacity = '1'; document.getElementById(`${id}-step1-display`).innerText = "?"; document.getElementById(`${id}-step2-row`).style.opacity = '0';
    document.getElementById(`${id}-divider`).style.opacity = '0'; document.getElementById(`${id}-step3-container`).style.opacity = '0';
    document.getElementById(`${id}-check-display`).style.display = "block"; document.getElementById(`${id}-check-display`).innerText = "?";
    document.getElementById(`${id}-final-check-row`).style.opacity = '0'; document.getElementById(`${id}-final-check-row`).style.display = 'none';
    
    let finalInput = document.getElementById(`${id}-final-input`), finalEq = document.getElementById(`${id}-final-eq`), finalRight = document.getElementById(`${id}-final-right`);
    finalEq.style.color = ""; finalRight.style.color = ""; finalInput.style.color = ""; finalInput.style.borderColor = "#fff"; finalInput.style.background = "rgba(255, 255, 255, 0.7)"; finalInput.innerText = "";
    let inputDisplay = document.getElementById(`${id}-input-display`);
    inputDisplay.innerText = ""; inputDisplay.style.borderColor = "#fff"; inputDisplay.style.background = "rgba(255, 255, 255, 0.7)"; p.currentInput = "";
    document.getElementById(`${id}-numpad-block`).style.display = 'none';
    let optBlock = document.getElementById(`${id}-options-block`); optBlock.style.display = 'none'; optBlock.classList.remove('active');

    startStage1(id);
}

function startStage1(id) {
    let p = players[id]; p.currentStage = 1;
    let instruction = document.getElementById(`${id}-instruction-text`); if(instruction) instruction.innerText = "Выбери, как найти " + p.currentQuestion.letter + ":";
    p.currentOptions = [p.currentQuestion.step1Correct, p.currentQuestion.step1Wrong[0], p.currentQuestion.step1Wrong[1]];
    shuffleOptions(id); showOptions(id);
}

function startStage2(id) {
    let p = players[id]; p.currentStage = 2;
    let instruction = document.getElementById(`${id}-instruction-text`); if(instruction) instruction.innerText = "Посчитай " + p.currentQuestion.letter + ":";
    document.getElementById(`${id}-step2-row`).style.opacity = '1';
    let optionsBlock = document.getElementById(`${id}-options-block`); optionsBlock.classList.remove('active');
    setTimeout(() => { optionsBlock.style.display = 'none'; document.getElementById(`${id}-numpad-block`).style.display = 'flex'; }, 300);
}

function startStage3(id) {
    let p = players[id]; p.currentStage = 3;
    let instruction = document.getElementById(`${id}-instruction-text`); if(instruction) instruction.innerText = "Выбери проверку:";
    document.getElementById(`${id}-divider`).style.opacity = '1'; document.getElementById(`${id}-step3-container`).style.opacity = '1';
    p.currentOptions = [p.currentQuestion.checkCorrect, p.currentQuestion.checkWrong[0], p.currentQuestion.checkWrong[1]];
    shuffleOptions(id);
    document.getElementById(`${id}-numpad-block`).style.display = 'none';
    let optionsBlock = document.getElementById(`${id}-options-block`); optionsBlock.style.display = 'flex'; setTimeout(() => { showOptions(id); }, 50);
}

function startStage4(id) {
    let p = players[id]; p.currentStage = 4;
    let instruction = document.getElementById(`${id}-instruction-text`); if(instruction) instruction.innerText = "Посчитай левую часть:";
    let parts = p.currentQuestion.checkCorrect.split(" = ");
    document.getElementById(`${id}-check-display`).innerText = parts[0].trim();
    document.getElementById(`${id}-final-right`).innerText = parts[1];
    document.getElementById(`${id}-final-check-row`).style.display = 'flex';
    setTimeout(() => { document.getElementById(`${id}-final-check-row`).style.opacity = '1'; }, 50);
    p.currentInput = ""; document.getElementById(`${id}-final-input`).innerText = "";
    let optionsBlock = document.getElementById(`${id}-options-block`); optionsBlock.classList.remove('active');
    setTimeout(() => { optionsBlock.style.display = 'none'; document.getElementById(`${id}-numpad-block`).style.display = 'flex'; }, 300);
}

function shuffleOptions(id) { let p = players[id]; let correctVal = p.currentOptions[0]; p.currentOptions.sort(() => Math.random() - 0.5); p.correctOptionIndex = p.currentOptions.indexOf(correctVal); }
function showOptions(id) {
    let p = players[id];
    for(let i=0; i<3; i++) { let btn = document.getElementById(`${id}-opt-btn-${i}`); btn.innerText = p.currentOptions[i]; btn.style.background = "rgba(255, 255, 255, 0.85)"; btn.style.borderColor = "#fff"; btn.disabled = false; }
    let optionsBlock = document.getElementById(`${id}-options-block`); optionsBlock.style.display = 'flex'; optionsBlock.classList.add('active');
}

function registerMistake(id) { let p = players[id]; p.mistakes++; if (isBattleMode) { document.getElementById(`${id}-errors`).innerText = p.mistakes; } }

function selectOption(id, index) {
    let p = players[id]; let optBtns = [document.getElementById(`${id}-opt-btn-0`), document.getElementById(`${id}-opt-btn-1`), document.getElementById(`${id}-opt-btn-2`)];
    if(index === p.correctOptionIndex) {
        optBtns[index].style.background = "#c9ffbf"; optBtns[index].style.borderColor = "#4ade80"; optBtns.forEach(btn => btn.disabled = true);
        if (p.currentStage === 1) { setTimeout(() => { document.getElementById(`${id}-step1-display`).innerText = p.currentOptions[index]; startStage2(id); }, 800); } 
        else if (p.currentStage === 3) { document.getElementById(`${id}-check-display`).innerText = p.currentOptions[index]; setTimeout(() => { startStage4(id); }, 600); }
    } else { optBtns[index].style.background = "#ffafbd"; optBtns[index].style.borderColor = "#f87171"; registerMistake(id); }
}

function inputNum(id, num) { let p = players[id]; if (p.currentInput.length < 3) { p.currentInput += num; if (p.currentStage === 2) { document.getElementById(`${id}-input-display`).innerText = p.currentInput; } else if (p.currentStage === 4) { document.getElementById(`${id}-final-input`).innerText = p.currentInput; } } }
function deleteNum(id) { let p = players[id]; p.currentInput = p.currentInput.slice(0, -1); if (p.currentStage === 2) { document.getElementById(`${id}-input-display`).innerText = p.currentInput; } else if (p.currentStage === 4) { document.getElementById(`${id}-final-input`).innerText = p.currentInput; } }

function submitNum(id) {
    let p = players[id]; if (p.currentInput === "") return;
    if (p.currentStage === 2) {
        let inputDisplay = document.getElementById(`${id}-input-display`);
        if (p.currentInput === p.currentQuestion.ans) { 
            inputDisplay.style.borderColor = "#4ade80"; inputDisplay.style.background = "#c9ffbf"; 
            setTimeout(() => { 
                inputDisplay.style.borderColor = "#fff"; inputDisplay.style.background = "rgba(255, 255, 255, 0.7)"; 
                startStage3(id); 
            }, 800);
        } else { 
            inputDisplay.style.borderColor = "#f87171"; inputDisplay.style.background = "#ffafbd"; registerMistake(id); 
            setTimeout(() => { inputDisplay.style.borderColor = "#fff"; inputDisplay.style.background = "rgba(255, 255, 255, 0.7)"; p.currentInput = ""; inputDisplay.innerText = ""; }, 800); 
        }
    } else if (p.currentStage === 4) {
        let inputDisplay = document.getElementById(`${id}-final-input`); let parts = p.currentQuestion.checkCorrect.split(" = "); let correctSum = parts[1]; 
        if (p.currentInput === correctSum) { 
            inputDisplay.style.borderColor = "#4ade80"; inputDisplay.style.background = "#c9ffbf"; inputDisplay.style.color = "#15803d"; document.getElementById(`${id}-final-eq`).style.color = "#15803d"; document.getElementById(`${id}-final-right`).style.color = "#15803d"; setTimeout(() => { nextQuestion(id); }, 1500);
        } else { 
            inputDisplay.style.borderColor = "#f87171"; inputDisplay.style.background = "#ffafbd"; registerMistake(id); setTimeout(() => { inputDisplay.style.borderColor = "#fff"; inputDisplay.style.background = "rgba(255, 255, 255, 0.7)"; p.currentInput = ""; inputDisplay.innerText = ""; }, 800); 
        }
    }
}

function nextQuestion(id) {
    let p = players[id]; p.currentIndex++;
    if (isBattleMode) { p.score++; document.getElementById(`${id}-score`).innerText = p.score; loadQuestion(id);
    } else { if (p.mode === 'arcade' || p.currentIndex < p.mode) { loadQuestion(id); } else { endGame(); } }
}

function startTimer(seconds) {
    let totalTime = seconds, timeLeft = seconds;
    const fillDesk = document.getElementById('battle-timer-fill-desk'), fillMob = document.getElementById('battle-timer-fill-mob');
    if(fillDesk) { fillDesk.style.width = '100%'; fillDesk.className = 'battle-timer-fill'; } if(fillMob) { fillMob.style.width = '100%'; fillMob.className = 'battle-timer-fill'; }
    if (battleTimerInterval) clearInterval(battleTimerInterval);
    battleTimerInterval = setInterval(() => {
        timeLeft--; let percentage = Math.ceil((timeLeft / totalTime) * 100), w = percentage + '%', c = 'battle-timer-fill';
        if (percentage <= 30 && percentage > 10) c += ' warning'; else if (percentage <= 10) c += ' danger';
        if(fillDesk) { fillDesk.style.width = w; fillDesk.className = c; } if(fillMob) { fillMob.style.width = w; fillMob.className = c; }
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function endGame() { if (battleTimerInterval) clearInterval(battleTimerInterval); mainPanel.classList.remove('battle-active'); if (isBattleMode) showBattleResults(); else showSingleResults(); }

function showSingleResults() {
    showScreen('result-screen');
    let p = players['single'], totalQuestions = (p.mode === 'arcade') ? p.currentIndex : p.mode;
    let gradeElem = document.getElementById('grade-text'), feedbackElem = document.getElementById('feedback-text'), emojiElem = document.getElementById('result-emoji'), scoreBlock = document.getElementById('score-block'), percentContainer = document.getElementById('percent-container'), percentText = document.getElementById('percent-text');
    document.getElementById('result-title').innerText = "Урок окончен!";
    if (totalQuestions === 0) { scoreBlock.innerText = "Ты не решил ни одного уравнения"; percentContainer.style.display = 'none'; gradeElem.style.display = 'none'; feedbackElem.innerText = "Возвращайся, когда будешь готов!"; emojiElem.innerText = "😴"; return; }
    percentContainer.style.display = 'block'; gradeElem.style.display = 'inline-block'; scoreBlock.innerHTML = `Решено: <span id="score-text">${totalQuestions}</span>`;
    let totalSteps = totalQuestions * 3, correctSteps = Math.max(0, totalSteps - p.mistakes), percent = Math.round((correctSteps / totalSteps) * 100);
    percentText.innerText = percent;
    if (percent >= 90) { gradeElem.innerText = "Оценка: 5"; feedbackElem.innerText = "Блестяще! Замечательный результат ✨"; emojiElem.innerText = "🏆"; gradeElem.style.color = "#15803d"; } 
    else if (percent >= 70) { gradeElem.innerText = "Оценка: 4"; feedbackElem.innerText = "Хорошая работа! Были небольшие неточности 👍"; emojiElem.innerText = "⭐"; gradeElem.style.color = "#0369a1"; } 
    else if (percent >= 50) { gradeElem.innerText = "Оценка: 3"; feedbackElem.innerText = "Нужно быть внимательнее. Повтори правила! 📚"; emojiElem.innerText = "🧐"; gradeElem.style.color = "#b45309"; } 
    else { gradeElem.innerText = "Оценка: 2"; feedbackElem.innerText = "Пока слишком много ошибок. Давай попробуем еще раз! 💪"; emojiElem.innerText = "🌱"; gradeElem.style.color = "#b91c1c"; }
}

function showBattleResults() {
    showScreen('result-screen');
    let p1 = players['p1'], p2 = players['p2'], p1Pts = (p1.score * 10) - (p1.mistakes * 5), p2Pts = (p2.score * 10) - (p2.mistakes * 5);
    let winnerText = "", emoji = "🏆";
    if (p1Pts > p2Pts) { winnerText = "Победил(а) " + p1.name + "!"; emoji = "🎉"; } 
    else if (p2Pts > p1Pts) { winnerText = "Победил(а) " + p2.name + "!"; emoji = "🎉"; } 
    else { if (p1.mistakes < p2.mistakes) winnerText = "Победил(а) " + p1.name + " (точнее)!"; else if (p2.mistakes < p1.mistakes) winnerText = "Победил(а) " + p2.name + " (точнее)!"; else { winnerText = "Идеальная ничья!"; emoji = "🤝"; } }
    
    document.getElementById('result-title').innerText = "Время вышло!"; document.getElementById('result-emoji').innerText = emoji;
    document.getElementById('score-block').innerHTML = `<div style="font-size:1.5rem; line-height: 1.6; text-align: left; background: rgba(255,255,255,0.6); padding: 15px; border-radius: 15px; width: 100%; max-width: 350px; margin: 0 auto;"><b>${p1.name}:</b> <span style="color:#15803d">${p1.score}</span> решено | <span style="color:#b91c1c">${p1.mistakes}</span> ошибок 👉 <b>${p1Pts} очков</b><br><b>${p2.name}:</b> <span style="color:#15803d">${p2.score}</span> решено | <span style="color:#b91c1c">${p2.mistakes}</span> ошибок 👉 <b>${p2Pts} очков</b></div>`;
    
    let gradeElem = document.getElementById('grade-text'); gradeElem.innerText = winnerText; gradeElem.style.color = "#0f172a"; gradeElem.style.display = 'inline-block';
    document.getElementById('percent-container').style.display = 'none'; document.getElementById('feedback-text').innerText = "Очки = (Решено × 10) - (Ошибки × 5)";
}
