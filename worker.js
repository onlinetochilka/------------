/**
 * worker.js — Timer Web Worker
 * Принимает команды: START { endTimestamp }, PAUSE, STOP
 * Отправляет: { type: 'TICK', remaining } каждую секунду, { type: 'DONE' } при завершении
 * Использует Date.now() для устойчивости к дрифту и throttling браузера
 */

let intervalId = null;
let endTime = null;
let lastPostedSecond = -1;

function tick() {
    if (endTime === null) return;

    const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));

    if (remaining === lastPostedSecond) return;
    lastPostedSecond = remaining;

    self.postMessage({ type: 'TICK', remaining });

    if (remaining === 0) {
        clearInterval(intervalId);
        intervalId = null;
        endTime = null;
        self.postMessage({ type: 'DONE' });
    }
}

self.onmessage = function ({ data }) {
    const { command, endTimestamp } = data;

    switch (command) {
        case 'START':
            if (intervalId) clearInterval(intervalId);
            endTime = endTimestamp;
            lastPostedSecond = -1;
            intervalId = setInterval(tick, 250);
            break;

        case 'PAUSE':
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            break;

        case 'STOP':
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            endTime = null;
            lastPostedSecond = -1;
            break;
    }
};
