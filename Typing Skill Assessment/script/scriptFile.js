// Clock function
function updateTime() {
    const timeElement = document.getElementById('currentTime');
    const now = new Date();
    timeElement.textContent = now.toLocaleTimeString();
}

updateTime();
setInterval(updateTime, 1000);


(function () {
    const timerEl = document.getElementById('timer');
    const textArea = document.getElementById('textarea');
    const resetBtn = document.getElementById('resetBtn');

    const wpsEl = document.getElementById('wps');
    const cpsEl = document.getElementById('cps');
    const spmEl = document.getElementById('spm');

    if (timerEl) timerEl.textContent = '00:00:00';
    if (wpsEl) wpsEl.textContent = 'Words typed per second : 00';
    if (cpsEl) cpsEl.textContent = 'Characters typed per second : 00';
    if (spmEl) spmEl.textContent = 'Sentences typed per minute : 00';

    let started = false;
    let startTime = 0;
    let rafId = null;

    function formateTimer(ms) {
        const totalSec = Math.floor(ms / 1000);
        const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function calculateTyping(text) {
        const chars = text.length;

        const words = text.trim().length
            ? text.trim().split(/\s+/).filter(Boolean).length
            : 0;

        const sentences = text.trim().split(/[.!?]+(?=\s|$)/);

        const filteredSentences = sentences.filter(sentence => sentence.trim().length > 0).length;

        const wps = Math.round(words);
        const cps = Math.round(chars);
        const spm = Math.round(filteredSentences);

        return { wps, cps, spm };
    }

    function updateMetricsUI(text) {
        const { wps, cps, spm } = calculateTyping(text);
        if (wpsEl) wpsEl.textContent = `Words typed per second : ${String(wps)}`;
        if (cpsEl) cpsEl.textContent = `Characters typed per second : ${String(cps)}`;
        if (spmEl) spmEl.textContent = `Sentences typed per minute : ${String(spm)}`;
    }


    function tick() {
        const elapsed = Date.now() - startTime;
        timerEl.textContent = formateTimer(elapsed);
        rafId = requestAnimationFrame(tick);
    }

    function startTimerOnce() {
        if (started) return;
        started = true;
        startTime = Date.now();
        rafId = requestAnimationFrame(tick);
    }

    //  Reset function
    function stopTick() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    function resetTimer() {
        stopTick();
        started = false;
        startTime = 0;

        if (textArea) {
            textArea.value = '';
            textArea.blur();
        }

        if (timerEl) timerEl.textContent = '00:00:00';

        // reset metrics to zero (numbers only)
        if (wpsEl) wpsEl.textContent = 'Words typed per second : 00';
        if (cpsEl) cpsEl.textContent = 'Characters typed per second : 00';
        if (spmEl) spmEl.textContent = 'Sentences typed per minute : 00';
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetTimer);
    }

    if (textArea) {
        textArea.addEventListener('focus', startTimerOnce);
        textArea.addEventListener('click', startTimerOnce);
        textArea.addEventListener('keydown', startTimerOnce);

        textArea.addEventListener('input', () => {
            if (!started) startTimerOnce();
            updateMetricsUI(textArea.value);
        });
    }
})();