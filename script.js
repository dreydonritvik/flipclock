document.addEventListener('DOMContentLoaded', () => {
    let is24HourFormat = true;
    let showSeconds = true;

    // UI Elements
    const toolbar = document.getElementById('toolbar');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsMenu = document.getElementById('settings-menu');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    const format12Radio = document.getElementById('format-12');
    const format24Radio = document.getElementById('format-24');

    const secYesRadio = document.getElementById('sec-yes');
    const secNoRadio = document.getElementById('sec-no');

    const secondsColon = document.getElementById('seconds-colon');
    const secondsGroup = document.getElementById('seconds-group');
    const ampmIndicator = document.getElementById('ampm-indicator');

    // Show/hide toolbar on mouse move
    let hideToolbarTimeout;

    const hideToolbar = () => {
        toolbar.classList.remove('active');
        settingsMenu.classList.remove('show');
        document.body.classList.add('hide-cursor');
    };

    const showToolbar = () => {
        toolbar.classList.add('active');
        document.body.classList.remove('hide-cursor');
        clearTimeout(hideToolbarTimeout);
        hideToolbarTimeout = setTimeout(hideToolbar, 3000);
    };

    document.addEventListener('mousemove', showToolbar);
    document.addEventListener('click', showToolbar);
    showToolbar(); // initial show

    // Settings Toggle
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('show');
    });

    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
            settingsMenu.classList.remove('show');
        }
    });

    // Keep toolbar visible while interacting with settings menu
    settingsMenu.addEventListener('mousemove', (e) => {
        e.stopPropagation();
        showToolbar();
    });

    // Format Change
    format12Radio.addEventListener('change', () => {
        if (format12Radio.checked) {
            is24HourFormat = false;
            ampmIndicator.classList.remove('hidden');
            forceTimeUpdate();
        }
    });

    format24Radio.addEventListener('change', () => {
        if (format24Radio.checked) {
            is24HourFormat = true;
            ampmIndicator.classList.add('hidden');
            forceTimeUpdate();
        }
    });

    // Seconds Toggle
    secYesRadio.addEventListener('change', () => {
        if (secYesRadio.checked) {
            showSeconds = true;
            secondsColon.classList.remove('hidden');
            secondsGroup.classList.remove('hidden');
            forceTimeUpdate();
        }
    });

    secNoRadio.addEventListener('change', () => {
        if (secNoRadio.checked) {
            showSeconds = false;
            secondsColon.classList.add('hidden');
            secondsGroup.classList.add('hidden');
        }
    });

    // Fullscreen Toggle
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });

    document.addEventListener('fullscreenchange', () => {
        const iconFull = document.getElementById('icon-fullscreen');
        const iconExit = document.getElementById('icon-exit-fullscreen');
        if (document.fullscreenElement) {
            if (iconFull) iconFull.style.display = 'none';
            if (iconExit) iconExit.style.display = 'block';
        } else {
            if (iconFull) iconFull.style.display = 'block';
            if (iconExit) iconExit.style.display = 'none';
        }
    });

    // Clock Logic
    function padNumber(num) {
        return num.toString().padStart(2, '0');
    }

    function getFormattedTime() {
        const now = new Date();
        let h = now.getHours();
        let m = now.getMinutes();
        let s = now.getSeconds();
        let ampm = 'AM';

        if (!is24HourFormat) {
            if (h >= 12) {
                ampm = 'PM';
            }
            if (h === 0) {
                h = 12;
            } else if (h > 12) {
                h = h - 12;
            }
        }

        return {
            h: padNumber(h),
            m: padNumber(m),
            s: padNumber(s),
            ampm: ampm
        };
    }

    function updateDigit(id, newValue) {
        const element = document.getElementById(id);
        if (!element) return;

        const currentValue = element.getAttribute('data-digit');
        if (currentValue === String(newValue)) return;

        element.setAttribute('data-digit', newValue);

        const baseTop = element.querySelector('.base-top');
        const baseBottom = element.querySelector('.base-bottom');

        const flapTop = document.createElement('div');
        flapTop.className = 'flap-top';
        flapTop.innerHTML = `<span>${currentValue}</span>`; // span eklendi

        const flapBottom = document.createElement('div');
        flapBottom.className = 'flap-bottom';
        flapBottom.innerHTML = `<span>${newValue}</span>`; // span eklendi

        baseTop.innerHTML = `<span>${newValue}</span>`; // span eklendi

        element.appendChild(flapTop);
        element.appendChild(flapBottom);

        setTimeout(() => {
            baseBottom.innerHTML = `<span>${newValue}</span>`; // span eklendi
            if (element.contains(flapTop)) element.removeChild(flapTop);
            if (element.contains(flapBottom)) element.removeChild(flapBottom);
        }, 800);
    }

    function forceTimeUpdate() {
        const t = getFormattedTime();

        const updateList = [
            { id: 'hour-10', val: t.h[0] },
            { id: 'hour-1', val: t.h[1] },
            { id: 'minute-10', val: t.m[0] },
            { id: 'minute-1', val: t.m[1] },
            { id: 'second-10', val: t.s[0] },
            { id: 'second-1', val: t.s[1] }
        ];

        updateList.forEach(item => {
            const el = document.getElementById(item.id);
            if (!el) return;
            el.setAttribute('data-digit', item.val);

            // Temizlik
            el.querySelectorAll('.flap-top, .flap-bottom').forEach(f => f.remove());

            // İçerik güncelleme (span ile)
            el.querySelector('.base-top').innerHTML = `<span>${item.val}</span>`;
            el.querySelector('.base-bottom').innerHTML = `<span>${item.val}</span>`;
        });

        ampmIndicator.textContent = t.ampm;
    }

    let isColonBlinkOn = true;

    function updateTime() {
        const t = getFormattedTime();

        updateDigit('hour-10', t.h[0]);
        updateDigit('hour-1', t.h[1]);

        updateDigit('minute-10', t.m[0]);
        updateDigit('minute-1', t.m[1]);

        if (showSeconds) {
            updateDigit('second-10', t.s[0]);
            updateDigit('second-1', t.s[1]);
        }

        if (!is24HourFormat && ampmIndicator.textContent !== t.ampm) {
            ampmIndicator.textContent = t.ampm;
        }

        // Handle strict custom blink sync
        const allColons = document.querySelectorAll('.colon');
        if (isColonBlinkOn) {
            allColons.forEach(c => {
                c.classList.remove('blink-off');
                c.classList.add('blink-on');
            });
        } else {
            allColons.forEach(c => {
                c.classList.remove('blink-on');
                c.classList.add('blink-off');
            });
        }
        isColonBlinkOn = !isColonBlinkOn;
    }

    // Initialize clock
    forceTimeUpdate();

    // Start ticks aligned to the second
    const now = new Date();
    const msToNextSecond = 1000 - now.getMilliseconds();

    setTimeout(() => {
        updateTime();
        setInterval(updateTime, 1000);
    }, msToNextSecond);
});
