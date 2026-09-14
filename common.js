const GLOBAL_PASSWORD = ""; 

let isBattleMode = false;
let isPrepMode = false;
let battleTimerInterval = null;
let players = {};
let currentScreenId = 'start-screen';

const mainPanel = document.getElementById('main-panel');
const boardsContainer = document.getElementById('boards-container');
const battleHeaderDesk = document.getElementById('battle-header-desk');
const exitBtnGlobal = document.getElementById('exit-btn-global');

window.onload = () => {
    initApp();
    setInterval(() => {
        let storedCode = sessionStorage.getItem('userEnteredCode') || "";
        if (GLOBAL_PASSWORD !== "" && storedCode.toLowerCase() !== GLOBAL_PASSWORD.toLowerCase()) {
            if (currentScreenId !== 'auth-screen' && currentScreenId !== 'admin-auth-screen' && currentScreenId !== 'admin-dashboard-screen') {
                initApp();
            }
        }
    }, 1000);
};

function showScreen(id) {
    currentScreenId = id;
    const screens = ['start-screen', 'setup-screen', 'game-screen', 'result-screen', 'auth-screen', 'prep-screen', 'admin-auth-screen', 'admin-dashboard-screen'];
    screens.forEach(s => {
        let el = document.getElementById(s);
        if (el) el.style.display = (s === id) ? 'flex' : 'none';
    });
}

function initApp() {
    let storedCode = sessionStorage.getItem('userEnteredCode') || "";
    if (GLOBAL_PASSWORD !== "") {
        if (storedCode.toLowerCase() === GLOBAL_PASSWORD.toLowerCase()) {
            showScreen('start-screen');
        } else {
            document.getElementById('access-code-input').value = '';
            document.getElementById('auth-error-msg').style.opacity = '0';
            showScreen('auth-screen');
        }
    } else {
        showScreen('start-screen');
    }
}

function checkAccessCode() {
    let input = document.getElementById('access-code-input').value.trim();
    if (input.toLowerCase() === GLOBAL_PASSWORD.toLowerCase()) {
        sessionStorage.setItem('userEnteredCode', input);
        document.getElementById('auth-error-msg').style.opacity = '0';
        showScreen('start-screen');
    } else {
        let errMsg = document.getElementById('auth-error-msg');
        errMsg.style.opacity = '1';
        setTimeout(() => { errMsg.style.opacity = '0'; }, 3000);
    }
}

/* --- ЛОГИКА АДМИНИСТРАТОРА --- */
function showAdminAuth() {
    document.getElementById('admin-code-input').value = '';
    document.getElementById('admin-error-msg').style.opacity = '0';
    showScreen('admin-auth-screen');
}

function checkAdminCode() {
    let input = document.getElementById('admin-code-input').value.trim();
    if (input === 'root') {
        showScreen('admin-dashboard-screen');
    } else {
        let errMsg = document.getElementById('admin-error-msg');
        errMsg.style.opacity = '1';
        setTimeout(() => { errMsg.style.opacity = '0'; }, 3000);
    }
}
/* ----------------------------- */

function showSetupScreen() { showScreen('setup-screen'); }

function generateQuestion() {
    const type = Math.floor(Math.random() * 4);
    const emojis = ["🍓", "🍄", "🚀", "🦊", "🍪", "🌟", "🍎", "🎨", "🍒", "🧸", "🦄", "🦕", "⚽", "🍔"];
    const letters = ["x", "y", "z", "a", "b", "c", "m", "n", "p", "k"];
    
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const v = letters[Math.floor(Math.random() * letters.length)];
    
    let a, b, c, x, eq, ans, step1Correct, step1Wrong, checkCorrect, checkWrong, finalCheck;
    let prepWhole, prepP1, prepP2, prepP1Val, prepP2Val, prepWholeVal, prepOp;

    if (type === 0 || type === 1) { 
        a = Math.floor(Math.random() * 40) + 5; 
        x = Math.floor(Math.random() * 40) + 5; 
        c = a + x;
        eq = type === 0 ? `${v} + ${a} = ${c}` : `${a} + ${v} = ${c}`;
        ans = x.toString();
        step1Correct = `${c} - ${a}`;
        step1Wrong = [`${c} + ${a}`, `${a} - ${c}`, `${v} - ${a}`];
        checkCorrect = type === 0 ? `${x} + ${a} = ${c}` : `${a} + ${x} = ${c}`;
        checkWrong = [`${c} - ${a} = ${x}`, type === 0 ? `${x} - ${a} = ${c}` : `${a} - ${x} = ${c}`];
        finalCheck = `${c} = ${c}`;
        prepWhole = c.toString(); prepP1 = type === 0 ? v : a.toString(); prepP2 = type === 0 ? a.toString() : v;
        prepP1Val = type === 0 ? x : a; prepP2Val = type === 0 ? a : x; prepWholeVal = c; prepOp = '+';
    } else if (type === 2) { 
        b = Math.floor(Math.random() * 40) + 5;
        c = Math.floor(Math.random() * 40) + 5;
        x = b + c;
        eq = `${v} - ${b} = ${c}`;
        ans = x.toString();
        step1Correct = `${c} + ${b}`; 
        step1Wrong = [`${c} - ${b}`, `${b} - ${c}`, `${v} - ${b}`];
        checkCorrect = `${x} - ${b} = ${c}`;
        checkWrong = [`${x} + ${b} = ${c}`, `${c} + ${b} = ${x}`];
        finalCheck = `${c} = ${c}`;
        prepWhole = v; prepP1 = b.toString(); prepP2 = c.toString();
        prepP1Val = b; prepP2Val = c; prepWholeVal = x; prepOp = '-';
    } else if (type === 3) { 
        c = Math.floor(Math.random() * 40) + 5;
        x = Math.floor(Math.random() * 40) + 5;
        a = c + x;
        eq = `${a} - ${v} = ${c}`;
        ans = x.toString();
        step1Correct = `${a} - ${c}`;
        step1Wrong = [`${a} + ${c}`, `${c} - ${a}`, `${v} + ${c}`];
        checkCorrect = `${a} - ${x} = ${c}`;
        checkWrong = [`${x} - ${a} = ${c}`, `${a} - ${c} = ${x}`];
        finalCheck = `${c} = ${c}`;
        prepWhole = a.toString(); prepP1 = v; prepP2 = c.toString();
        prepP1Val = x; prepP2Val = c; prepWholeVal = a; prepOp = '-';
    }

    step1Wrong.sort(() => Math.random() - 0.5);
    checkWrong.sort(() => Math.random() - 0.5);

    return {
        eq, ans, emoji, step1Correct, step1Wrong: [step1Wrong[0], step1Wrong[1]],
        checkCorrect, checkWrong: [checkWrong[0], checkWrong[1]], finalCheck, letter: v,
        prepData: { 
            eqText: eq, whole: prepWhole, p1: prepP1, p2: prepP2, 
            p1Val: prepP1Val, p2Val: prepP2Val, wholeVal: prepWholeVal, 
            op: prepOp, ans: ans, step1Correct: step1Correct, 
            step1Wrong: [step1Wrong[0], step1Wrong[1]], 
            checkCorrect: checkCorrect, checkWrong: [checkWrong[0], checkWrong[1]]
        }
    };
}

function resetGame() {
    if (battleTimerInterval) clearInterval(battleTimerInterval);
    
    if (typeof window.dragMove === "function") window.removeEventListener('pointermove', window.dragMove);
    if (typeof window.endDrag === "function") window.removeEventListener('pointerup', window.endDrag);
    if (typeof window.checkDragMove === "function") window.removeEventListener('pointermove', window.checkDragMove);
    if (typeof window.endCheckDrag === "function") {
        window.removeEventListener('pointerup', window.endCheckDrag);
        window.removeEventListener('touchend', window.endCheckDrag);
    }
    
    if (typeof ghostChip !== 'undefined' && ghostChip) ghostChip.remove();
    if (typeof checkGhost !== 'undefined' && checkGhost) checkGhost.remove();
    
    mainPanel.classList.remove('battle-active');
    initApp();
}
