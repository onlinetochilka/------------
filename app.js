/**
 * app.js — Фокус-таймер Точилки
 * Архитектура: класс PomodoroApp (ES2022 private fields)
 * Таймер работает в Web Worker (worker.js) — не засыпает в неактивной вкладке
 */

const AMBIENT_SOUNDS = {
    cafe:   { label: 'Кафе',         url: './sounds/cafe.mp3'   },
    rain:   { label: 'Дождь',        url: './sounds/rain.mp3'   },
    river:  { label: 'Река',         url: './sounds/river.mp3'  },
    ocean:  { label: 'Океан',        url: './sounds/ocean.mp3'  },
    jungle: { label: 'Джунгли',      url: './sounds/jungle.mp3' },
    train:  { label: 'Поезд',        url: './sounds/train.mp3'  },
    storm:  { label: 'Гроза',        url: './sounds/storm.mp3'  },
    purr:   { label: 'Мурчание',     url: './sounds/purr.mp3'   },
    birds:  { label: 'Пение птиц',   url: './sounds/birds.mp3'  },
    night:  { label: 'Ночь',         url: './sounds/night.mp3'  },
};

const SOUND_ICONS = {
    cafe: `<svg viewBox="0 0 24 24"><path d="M6 8h12v6a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V8z"/><path d="M18 9h1a3 3 0 0 1 0 6h-1"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`,
    rain: `<svg viewBox="0 0 24 24"><path d="M6 14a4 4 0 0 1-.88-7.9A5 5 0 1 1 16 7a3.5 3.5 0 0 1 .5 7"/><line x1="8" y1="17" x2="7" y2="21"/><line x1="12" y1="16" x2="11" y2="20"/><line x1="16" y1="17" x2="15" y2="21"/><line x1="10" y1="19" x2="9" y2="22"/><line x1="14" y1="19" x2="13" y2="22"/></svg>`,
    river: `<svg viewBox="0 0 24 24"><path d="M2 10c3-1.5 5-1.5 8 0s5 1.5 8 0"/><path d="M2 15c3-1.5 5-1.5 8 0s5 1.5 8 0"/></svg>`,
    jungle: `<svg viewBox="0 0 24 24"><path d="M12 2.5C7.5 3.5 4.5 7 4.5 11.5 4.5 16.5 7.5 20 12 21.5c4.5-1.5 7.5-5 7.5-10S16.5 3.5 12 2.5Z"/><path d="M12 2.5v19"/><path d="M12 7c-2.5 2-4 3-5 4"/><path d="M12 7c2.5 2 4 3 5 4"/><path d="M12 11.5c-2 1.5-3.5 2.5-4.5 3.5"/><path d="M12 11.5c2 1.5 3.5 2.5 4.5 3.5"/></svg>`,
    train: `<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="11" rx="2"/><path d="M3 12h18"/><path d="M7 20l-2 2"/><path d="M17 20l2 2"/><circle cx="8" cy="16" r="1.5"/><circle cx="16" cy="16" r="1.5"/><path d="M12 5V3"/></svg>`,
    storm: `<svg viewBox="0 0 24 24"><path d="M5 15a4 4 0 0 1-.75-7.9A5 5 0 0 1 15 6a3.5 3.5 0 0 1 .5 7H5z"/><polyline points="12 11 9 16 12 16 10 21"/></svg>`,
    purr: `<svg viewBox="0 0 24 24"><path d="M12 20c-4.5 0-8-3-8-7.5C4 8.5 7.5 5 12 5s8 3.5 8 7.5c0 4.5-3.5 7.5-8 7.5z"/><path d="M8 5.5 6.5 3"/><path d="M16 5.5 17.5 3"/><path d="M9 13.5q1.5 1 3 0"/><path d="M13.5 13.5q1.5 1 3 0"/><path d="M10 16.5q2 1.5 4 0"/></svg>`,
    birds: `<svg viewBox="0 0 24 24"><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.32L2 20"/><path d="m2 17 10-10"/></svg>`,
    night: `<svg viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    ocean: `<svg viewBox="0 0 24 24"><path d="M2 8c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/><path d="M2 12c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/><path d="M2 16c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/></svg>`,
};

const PROMO_APPS = [
    { app_name: 'handwriting_generator', label: 'Генератор прописей' },
    { app_name: 'ruling_generator', label: 'Генератор разлиновки' },
    { app_name: 'oral_math_randomizer', label: 'Рандомайзер устного счета' },
    { app_name: 'reading_technique_analyzer', label: 'Анализатор техники чтения' },
    { app_name: 'dictation_constructor', label: 'Конструктор словарных диктантов' },
    { app_name: 'student_profile', label: 'Характеристика ученика' },
    { app_name: 'seating_generator', label: 'Генератор рассадки' },
    { app_name: 'crossword_constructor', label: 'Конструктор кроссвордов' },
    { app_name: 'teen_slang_dictionary', label: 'Словарь подросткового сленга' },
    { app_name: 'tutor_efficiency', label: 'Оценка эффективности репетитора' },
    { app_name: 'career_orientation_test', label: 'Тест на профориентацию' },
    { app_name: 'deadline_tracker', label: 'Трекер дедлайнов' },
    { app_name: 'worksheet_generator', label: 'Генератор рабочих листов' },
    { app_name: 'coming_soon', label: 'Продолжение следует...' },
];

const PROMO_DESKTOP_BREAKPOINT = 1024;

const COLOR_WORK = 'var(--brand-teal)';
const COLOR_REST = 'var(--color-rest)';
const FADE_MS = 400;

const YM_COUNTER_ID = 109823647;
const UTM_STORAGE_KEY = 'tochilka_utms';
const UTM_PARAM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

/**
 * @param {string} goal
 * @param {Record<string, string> | undefined} params
 */
function reachGoal(goal, params) {
    if (typeof ym === 'function') {
        if (params) {
            ym(YM_COUNTER_ID, 'reachGoal', goal, params);
        } else {
            ym(YM_COUNTER_ID, 'reachGoal', goal);
        }
    }
}

/** Сохраняет UTM-метки из URL в sessionStorage для последующих перезагрузок. */
function captureUtmParams() {
    const search = new URLSearchParams(window.location.search);
    const utms = {};

    for (const key of UTM_PARAM_KEYS) {
        const value = search.get(key);
        if (value) utms[key] = value;
    }

    if (Object.keys(utms).length === 0) return;

    try {
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utms));
    } catch { /* private mode / quota */ }
}

/**
 * @param {Promise<void>} playPromise
 * @param {(() => void) | undefined} onSuccess
 */
function playAmbientAudio(playPromise, onSuccess) {
    playPromise
        .then(() => onSuccess?.())
        .catch((err) => {
            reachGoal('atmosphere_error');
            console.warn('[Ambient] Ошибка воспроизведения:', err?.name || err);
        });
}

class PomodoroApp {
    #worker = null;

    #ambientAudio = null;
    #currentSoundId = null;
    #atmosphereEnabled = false;
    #fadeTimer = null;

    #finishAudio = null;
    #ambientDuckedForFinish = false;
    #ambientPreFinishVolume = 0.35;

    #isZenMode = false;

    #state = {
        currentMode: 'work',
        totalSeconds: 0,
        timeLeft: 0,
        isRunning: false,
        isResting: false,
        completedCycles: 0,
    };

    #config = {
        work: {
            color: COLOR_WORK, h: 0, m: 25, cycles: 1, hasRest: false,
            get duration() { return this.h * 3600 + this.m * 60; },
            renderMenu() {
                return `<div class="sub-row">
                    <input type="number" class="sub-input" value="${this.h}"
                        min="0" max="23" data-key="h" aria-label="Часы"> <span>ч</span>
                    <input type="number" class="sub-input" value="${this.m}"
                        min="1" max="59" data-key="m" aria-label="Минуты"> <span>м</span>
                </div>`;
            },
        },
        rest: {
            color: COLOR_REST, durationMin: 10, cycles: 1, hasRest: false,
            get duration() { return this.durationMin * 60; },
            renderMenu() {
                return `<div class="sub-row">
                    <input type="number" class="sub-input" value="${this.durationMin}"
                        min="1" max="120" data-key="durationMin" aria-label="Минуты отдыха">
                    <span>мин</span>
                </div>`;
            },
        },
        pomodoro: {
            color: COLOR_WORK, type: '25/5', cycles: 4, hasRest: true,
            get duration()     { return parseInt(this.type.split('/')[0], 10) * 60; },
            get restDuration() { return parseInt(this.type.split('/')[1], 10) * 60; },
            renderMenu() {
                return `<div class="sub-row">
                    <button class="sub-toggle ${this.type === '25/5' ? 'active' : ''}"
                        data-action="type" data-val="25/5" aria-pressed="${this.type === '25/5'}">25/5</button>
                    <button class="sub-toggle ${this.type === '50/10' ? 'active' : ''}"
                        data-action="type" data-val="50/10" aria-pressed="${this.type === '50/10'}">50/10</button>
                    <span>Количество циклов</span>
                    <input type="number" class="sub-input" value="${this.cycles}"
                        min="1" max="10" data-key="cycles" aria-label="Количество циклов">
                </div>`;
            },
        },
        lesson: {
            color: COLOR_WORK, durationMin: 45, cycles: 4, hasRest: false,
            get duration() { return this.durationMin * 60; },
            renderMenu() {
                return `<div class="sub-row">
                    <button class="sub-toggle ${this.durationMin === 40 ? 'active' : ''}"
                        data-action="durationMin" data-val="40" aria-pressed="${this.durationMin === 40}">40 мин</button>
                    <button class="sub-toggle ${this.durationMin === 45 ? 'active' : ''}"
                        data-action="durationMin" data-val="45" aria-pressed="${this.durationMin === 45}">45 мин</button>
                    <span>Количество уроков</span>
                    <input type="number" class="sub-input" value="${this.cycles}"
                        min="1" max="10" data-key="cycles" aria-label="Количество уроков">
                </div>`;
            },
        },
    };

    #els = {};
    #circumference = 0;

    constructor() {
        this.#bindElements();
        this.#buildAtmosphereGrid();
        this.#buildPromoCards();
        this.#initWorker();
        this.#bindEvents();
        this.#bindExtrasEvents();
        this.#bindPromoEvents();
        this.#bindPromoScroll();
        this.#renderSubmenu();
        this.#updateRestModeClass();
        this.#resetTimer();
    }

    #bindElements() {
        const $ = (id) => document.getElementById(id);
        this.#els = {
            timeDisplay:      $('timeDisplay'),
            startBtn:         $('startBtn'),
            resetBtn:         $('resetBtn'),
            modeButtons:      document.querySelectorAll('.mode-btn'),
            submenuContainer: $('submenuContainer'),
            dotsContainer:    $('dotsContainer'),
            brandLogo:        $('brandLogo'),
            progressCircle:   $('progressCircle'),
            zenToggle:        $('zenToggle'),
            atmosphereToggle: $('atmosphereToggle'),
            atmospherePanel:  $('atmospherePanel'),
            atmosphereGrid:   $('atmosphereGrid'),
            glassDrawer:      $('glassDrawer'),
            glassDrawerScroll: $('glassDrawerScroll'),
        };

        const r = this.#els.progressCircle.r.baseVal.value;
        this.#circumference = r * 2 * Math.PI;
        this.#els.progressCircle.style.strokeDasharray = `${this.#circumference} ${this.#circumference}`;
        this.#els.progressCircle.style.strokeDashoffset = '0';
    }

    #buildPromoCards() {
        const { glassDrawerScroll } = this.#els;
        if (!glassDrawerScroll) return;

        glassDrawerScroll.innerHTML = PROMO_APPS.map(({ app_name, label }) =>
            `<button class="glass-drawer__card" type="button" data-app-name="${app_name}">${label}</button>`
        ).join('');
    }

    #bindPromoEvents() {
        const { glassDrawer } = this.#els;
        if (!glassDrawer) return;

        glassDrawer.addEventListener('click', (e) => {
            const card = e.target.closest('[data-app-name]');
            if (!card || this.#state.isRunning) return;
            if (window.innerWidth < PROMO_DESKTOP_BREAKPOINT) return;
            this.#handlePromoClick(card.dataset.appName);
        });
    }

    #bindPromoScroll() {
        const scroll = this.#els.glassDrawerScroll;
        if (!scroll) return;

        let rafId = null;
        let direction = 1;
        let paused = false;

        const canScroll = () => scroll.scrollHeight - scroll.clientHeight > 1;

        const tick = () => {
            if (!paused && canScroll()) {
                const max = scroll.scrollHeight - scroll.clientHeight;
                scroll.scrollTop += direction * 0.5;

                if (scroll.scrollTop >= max) {
                    scroll.scrollTop = max;
                    direction = -1;
                } else if (scroll.scrollTop <= 0) {
                    scroll.scrollTop = 0;
                    direction = 1;
                }
            }
            rafId = requestAnimationFrame(tick);
        };

        const start = () => {
            if (!canScroll() || rafId) return;
            rafId = requestAnimationFrame(tick);
        };

        const stop = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            paused = false;
        };

        scroll.addEventListener('mouseenter', start);
        scroll.addEventListener('mouseleave', stop);

        scroll.addEventListener('mouseover', (e) => {
            paused = !!e.target.closest('.glass-drawer__card');
        });

        scroll.addEventListener('mouseout', (e) => {
            if (!scroll.contains(e.relatedTarget)) return;
            paused = !!e.relatedTarget.closest('.glass-drawer__card');
        });
    }

    #handlePromoClick(appName) {
        reachGoal('promo_click', { app_name: appName });
    }

    #buildAtmosphereGrid() {
        const { atmosphereGrid } = this.#els;
        atmosphereGrid.innerHTML = Object.entries(AMBIENT_SOUNDS).map(([id, { label }]) =>
            `<button class="sound-btn" data-sound="${id}" aria-label="${label}" title="${label}" type="button">
                ${SOUND_ICONS[id]}
                <span class="sound-tooltip">${label}</span>
            </button>`
        ).join('');
    }

    #initWorker() {
        try {
            this.#worker = new Worker(new URL('worker.js', import.meta.url));
            this.#worker.onmessage = (e) => this.#onWorkerMessage(e.data);
            this.#worker.onerror = (err) => console.error('[Timer] Worker error:', err);
        } catch {
            console.warn('[Timer] Web Worker недоступен, используется setInterval-заглушка.');
            this.#worker = this.#createFallbackWorker();
        }
    }

    #createFallbackWorker() {
        let intervalId = null;
        let endTime = null;
        return {
            postMessage: ({ command, endTimestamp }) => {
                if (command === 'START') {
                    if (intervalId) clearInterval(intervalId);
                    endTime = endTimestamp;
                    let last = -1;
                    intervalId = setInterval(() => {
                        const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
                        if (remaining === last) return;
                        last = remaining;
                        this.#onWorkerMessage({ type: 'TICK', remaining });
                        if (remaining === 0) {
                            clearInterval(intervalId);
                            this.#onWorkerMessage({ type: 'DONE' });
                        }
                    }, 250);
                } else if (command === 'PAUSE' || command === 'STOP') {
                    if (intervalId) { clearInterval(intervalId); intervalId = null; }
                    if (command === 'STOP') endTime = null;
                }
            },
            terminate() {},
        };
    }

    #onWorkerMessage({ type, remaining }) {
        if (type === 'TICK') {
            this.#state.timeLeft = remaining;
            this.#syncUI();
        } else if (type === 'DONE') {
            this.#state.isRunning = false;
            this.#handleComplete();
        }
    }

    #bindEvents() {
        this.#els.modeButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                if (e.target.closest('.mode-info')) return;
                const nextMode = btn.dataset.mode;
                if (nextMode !== this.#state.currentMode) {
                    reachGoal('mode_changed', { mode_name: nextMode });
                }
                this.#state.currentMode = nextMode;
                this.#els.modeButtons.forEach((b) => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                this.#updateRestModeClass();
                this.#renderSubmenu();
                this.#resetTimer();
            });
        });

        document.querySelectorAll('.mode-info').forEach((info) => {
            info.addEventListener('click', (e) => {
                e.stopPropagation();
                info.classList.toggle('open');
            });
            info.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    info.classList.toggle('open');
                }
            });
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.mode-info.open').forEach((el) => el.classList.remove('open'));
        });

        this.#els.submenuContainer.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') return;
            const { action, val } = e.target.dataset;
            const cfg = this.#config[this.#state.currentMode];
            if (action === 'type')        cfg.type = val;
            if (action === 'durationMin') cfg.durationMin = parseInt(val, 10);
            this.#renderSubmenu();
            if (!this.#state.isRunning) this.#resetTimer();
        });

        this.#els.submenuContainer.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT') this.#handleSubmenuInput(e.target);
        });

        this.#els.startBtn.addEventListener('click', () => {
            this.#initNotifications();
            this.#toggleTimer();
        });

        this.#els.resetBtn.addEventListener('click', () => {
            reachGoal('timer_reset');
            this.#els.resetBtn.classList.add('active-press');
            setTimeout(() => this.#els.resetBtn.classList.remove('active-press'), 200);
            this.#resetTimer();
        });
    }

    #bindExtrasEvents() {
        this.#els.zenToggle.addEventListener('change', () => {
            this.#toggleZen(this.#els.zenToggle.checked);
        });

        this.#els.atmosphereToggle.addEventListener('change', () => {
            this.#atmosphereEnabled = this.#els.atmosphereToggle.checked;
            if (this.#atmosphereEnabled) {
                this.#openAtmospherePanel();
            } else {
                this.#closeAtmospherePanel();
                this.#stopAmbient();
            }
        });

        this.#els.atmosphereGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.sound-btn');
            if (!btn) return;
            this.#initNotifications();
            this.#setAmbientSound(btn.dataset.sound);
        });

        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement && this.#isZenMode) {
                this.#applyZenOff();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.#isZenMode && !document.fullscreenElement) {
                    this.#applyZenOff();
                }
            }
        });
    }

    #updateRestModeClass() {
        document.body.classList.toggle('rest-mode', this.#state.currentMode === 'rest');
    }

    #handleSubmenuInput(input) {
        const key  = input.dataset.key;
        const mode = this.#state.currentMode;
        const cfg  = this.#config[mode];
        const raw  = input.value.trim();
        const min  = parseInt(input.min, 10);
        const max  = parseInt(input.max, 10);

        let v = parseInt(raw, 10);

        if (raw === '' || isNaN(v) || raw.includes('.') || raw.includes(',') || v < 0) {
            this.#showInputError(input);
            if (key === 'durationMin') cfg[key] = min;
            else cfg[key] = min;
            if (!this.#state.isRunning) this.#resetTimer();
            return;
        }

        let clamped = false;
        if (v < min) { v = min; clamped = true; }
        if (v > max) { v = max; clamped = true; }
        if (clamped) this.#showInputError(input);

        if (mode === 'work') {
            const projH = key === 'h' ? v : cfg.h;
            const projM = key === 'm' ? v : cfg.m;
            if (projH === 0 && projM < 1) {
                if (key === 'm') v = 1;
                this.#showInputError(input);
            }
        }

        cfg[key] = v;
        if (!this.#state.isRunning) this.#resetTimer();
    }

    #showInputError(input) {
        input.classList.add('error');
        input.addEventListener('animationend', () => input.classList.remove('error'), { once: true });
        setTimeout(() => input.classList.remove('error'), 1500);
    }

    async #initNotifications() {
        if ('Notification' in window && Notification.permission === 'default') {
            try { await Notification.requestPermission(); } catch { /* callback-API */ }
        }
    }

    #duckAmbientForFinish() {
        if (!this.#ambientAudio || this.#ambientAudio.paused) return;

        this.#ambientDuckedForFinish = true;
        this.#ambientPreFinishVolume = this.#ambientAudio.volume;
        this.#clearFadeTimer();
        this.#fadeVolume(this.#ambientAudio, this.#ambientAudio.volume, 0, FADE_MS, () => {
            this.#ambientAudio?.pause();
        });
    }

    #restoreAmbientAfterFinish() {
        if (!this.#ambientDuckedForFinish) return;
        this.#ambientDuckedForFinish = false;

        if (!this.#ambientAudio || !this.#currentSoundId || !this.#atmosphereEnabled) return;

        this.#ambientAudio.play().then(() => {
            this.#fadeVolume(this.#ambientAudio, 0, this.#ambientPreFinishVolume, FADE_MS);
        }).catch((err) => {
            reachGoal('atmosphere_error');
            console.warn('[Ambient] Ошибка воспроизведения после завершения:', err?.name || err);
        });
    }

    #playFinishSound() {
        this.#stopFinishSound();
        this.#duckAmbientForFinish();

        this.#finishAudio = new Audio('./sounds/finish.mp3');
        this.#finishAudio.volume = 1;
        this.#finishAudio.addEventListener('ended', () => {
            this.#finishAudio = null;
            this.#restoreAmbientAfterFinish();
        }, { once: true });
        this.#finishAudio.play().catch(() => {
            console.warn('[Timer] Не удалось воспроизвести finish.mp3');
            this.#restoreAmbientAfterFinish();
        });
    }

    #stopFinishSound() {
        if (this.#finishAudio) {
            this.#finishAudio.pause();
            this.#finishAudio.currentTime = 0;
            this.#finishAudio = null;
        }
        this.#ambientDuckedForFinish = false;
    }

    #showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification(title, {
                    body,
                    icon: 'https://raw.githubusercontent.com/onlinetochilka/theme/main/tochilka-logo.svg',
                });
            } catch { /* pop-up недоступен */ }
        }
    }

    #clearFadeTimer() {
        if (this.#fadeTimer) {
            clearInterval(this.#fadeTimer);
            this.#fadeTimer = null;
        }
    }

    #fadeVolume(audio, from, to, duration, onDone) {
        this.#clearFadeTimer();
        const steps = 20;
        const stepMs = duration / steps;
        let step = 0;
        audio.volume = from;

        this.#fadeTimer = setInterval(() => {
            step++;
            const progress = step / steps;
            audio.volume = from + (to - from) * progress;
            if (step >= steps) {
                this.#clearFadeTimer();
                audio.volume = to;
                onDone?.();
            }
        }, stepMs);
    }

    #setAmbientSound(id) {
        if (!AMBIENT_SOUNDS[id]) return;

        if (this.#currentSoundId === id && this.#ambientAudio && !this.#ambientAudio.paused) return;

        const prevAudio = this.#ambientAudio;
        const targetVol = 0.35;

        const startNew = () => {
            this.#ambientAudio = new Audio(AMBIENT_SOUNDS[id].url);
            this.#ambientAudio.loop = true;
            this.#ambientAudio.volume = 0;
            this.#currentSoundId = id;

            playAmbientAudio(this.#ambientAudio.play(), () => {
                reachGoal('atmosphere_play', { track_name: id });
                this.#fadeVolume(this.#ambientAudio, 0, targetVol, FADE_MS);
            });

            this.#syncAmbientUI();
        };

        if (prevAudio) {
            this.#fadeVolume(prevAudio, prevAudio.volume, 0, FADE_MS, () => {
                prevAudio.pause();
                prevAudio.src = '';
                startNew();
            });
        } else {
            startNew();
        }
    }

    #stopAmbient() {
        this.#clearFadeTimer();
        if (this.#ambientAudio) {
            const audio = this.#ambientAudio;
            this.#fadeVolume(audio, audio.volume, 0, FADE_MS, () => {
                audio.pause();
                audio.src = '';
            });
            this.#ambientAudio = null;
        }
        this.#currentSoundId = null;
        this.#syncAmbientUI();
    }

    #pauseAmbient() {
        this.#ambientAudio?.pause();
    }

    #resumeAmbient() {
        if (this.#ambientDuckedForFinish) return;
        if (this.#ambientAudio && this.#currentSoundId && this.#atmosphereEnabled) {
            playAmbientAudio(this.#ambientAudio.play());
        }
    }

    #syncAmbientUI() {
        const { atmosphereGrid } = this.#els;
        atmosphereGrid.querySelectorAll('.sound-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.sound === this.#currentSoundId);
        });
    }

    #openAtmospherePanel() {
        this.#els.atmospherePanel.classList.add('open');
        this.#els.atmospherePanel.setAttribute('aria-hidden', 'false');
    }

    #closeAtmospherePanel() {
        this.#els.atmospherePanel.classList.remove('open');
        this.#els.atmospherePanel.setAttribute('aria-hidden', 'true');
    }

    async #toggleZen(active) {
        if (active) {
            try {
                await document.documentElement.requestFullscreen();
            } catch { /* fullscreen недоступен */ }
            this.#applyZenOn();
        } else {
            if (document.fullscreenElement) {
                await document.exitFullscreen().catch(() => {});
            }
            this.#applyZenOff();
        }
    }

    #applyZenOn() {
        this.#isZenMode = true;
        document.body.classList.add('zen-mode');
    }

    #applyZenOff() {
        this.#isZenMode = false;
        document.body.classList.remove('zen-mode');
        this.#els.zenToggle.checked = false;
    }

    #renderSubmenu() {
        this.#els.submenuContainer.innerHTML = this.#config[this.#state.currentMode].renderMenu();
    }

    #renderDots() {
        const { dotsContainer } = this.#els;
        const total     = this.#config[this.#state.currentMode].cycles || 1;
        const completed = this.#state.completedCycles;

        if (total <= 1) {
            dotsContainer.style.display = 'none';
            dotsContainer.setAttribute('aria-hidden', 'true');
            return;
        }

        dotsContainer.style.display = 'flex';
        dotsContainer.removeAttribute('aria-hidden');
        dotsContainer.setAttribute('aria-label', `Прогресс: ${completed} из ${total} циклов завершено`);
        dotsContainer.innerHTML = Array.from({ length: total }, (_, i) =>
            `<div class="dot ${i < completed ? 'filled' : ''}"
                role="img"
                aria-label="${i < completed ? 'Завершён' : 'Ожидает'}">
            </div>`
        ).join('');
    }

    #formatTime(seconds) {
        const { timeDisplay } = this.#els;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) {
            timeDisplay.classList.add('long');
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
        timeDisplay.classList.remove('long');
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    #syncUI() {
        const { timeDisplay, startBtn, brandLogo, progressCircle } = this.#els;
        const { timeLeft, totalSeconds, isRunning } = this.#state;

        timeDisplay.textContent = this.#formatTime(timeLeft);
        timeDisplay.setAttribute('aria-label', `Осталось: ${timeDisplay.textContent}`);

        progressCircle.style.strokeDashoffset = totalSeconds === 0
            ? '0'
            : String(this.#circumference - (timeLeft / totalSeconds) * this.#circumference);

        if (isRunning) {
            startBtn.textContent = 'Пауза';
            startBtn.classList.add('active-press');
            startBtn.setAttribute('aria-label', 'Поставить таймер на паузу');
            brandLogo.classList.add('running');
        } else {
            startBtn.textContent = 'Старт';
            startBtn.classList.remove('active-press');
            startBtn.setAttribute('aria-label', 'Запустить таймер');
            brandLogo.classList.remove('running');
        }

        this.#syncGlassDrawer();
    }

    #syncGlassDrawer() {
        const { glassDrawer } = this.#els;
        if (!glassDrawer) return;

        const blocked = this.#state.isRunning;
        glassDrawer.classList.toggle('is-blocked', blocked);
        glassDrawer.setAttribute('aria-hidden', blocked ? 'true' : 'false');

        glassDrawer.querySelectorAll('[data-app-name]').forEach((el) => {
            el.setAttribute('tabindex', blocked ? '-1' : '0');
        });
    }

    #resetTimer() {
        const s = this.#state;
        s.isRunning = false;
        s.isResting = false;
        s.completedCycles = 0;

        this.#worker.postMessage({ command: 'STOP' });
        this.#pauseAmbient();
        this.#stopFinishSound();

        const cfg = this.#config[s.currentMode];
        document.documentElement.style.setProperty('--theme-color', cfg.color);
        s.totalSeconds = cfg.duration;
        s.timeLeft     = s.totalSeconds;

        this.#renderDots();
        this.#syncUI();
    }

    #startTimer() {
        const s = this.#state;
        if (s.timeLeft <= 0) { this.#resetTimer(); return; }

        s.isRunning = true;
        this.#worker.postMessage({
            command:      'START',
            endTimestamp: Date.now() + s.timeLeft * 1000,
        });
        this.#resumeAmbient();
        this.#syncUI();
    }

    #pauseTimer() {
        this.#state.isRunning = false;
        this.#worker.postMessage({ command: 'PAUSE' });
        this.#pauseAmbient();
        this.#syncUI();
    }

    #toggleTimer() {
        if (this.#state.isRunning) {
            reachGoal('timer_pause');
            this.#pauseTimer();
        } else {
            reachGoal('timer_start');
            this.#startTimer();
        }
    }

    #handleComplete() {
        const s   = this.#state;
        const cfg = this.#config[s.currentMode];

        reachGoal('timer_finish');
        this.#playFinishSound();

        if (cfg.hasRest && !s.isResting) {
            this.#showNotification('Время отдохнуть!', 'Рабочий блок завершён — начинается перерыв.');
            s.isResting = true;
            document.documentElement.style.setProperty('--theme-color', COLOR_REST);
            s.totalSeconds = cfg.restDuration;
            s.timeLeft     = s.totalSeconds;
            this.#syncUI();
            this.#startTimer();
        } else {
            s.completedCycles++;
            this.#renderDots();
            s.isResting = false;
            document.documentElement.style.setProperty('--theme-color', cfg.color);

            if (s.completedCycles < cfg.cycles) {
                this.#showNotification(
                    'Цикл завершён!',
                    `Завершено ${s.completedCycles} из ${cfg.cycles} циклов.`
                );
                s.totalSeconds = cfg.duration;
                s.timeLeft     = s.totalSeconds;
                this.#syncUI();
                this.#startTimer();
            } else {
                this.#showNotification('Все циклы завершены!', 'Отличная работа!');
                this.#syncUI();
            }
        }
    }
}

captureUtmParams();
new PomodoroApp();
