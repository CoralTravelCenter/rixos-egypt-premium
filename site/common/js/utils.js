export function setupShortcuts(top_gap = 80) {
    document.addEventListener('click', e => {
        const shortcut = e.target.closest('[data-ref]');
        if (shortcut) {
            const ref = document.querySelector(shortcut.dataset.ref);
            try {
                shortcut.closest('.burger').querySelector('#burger-open').checked = false;
            } catch (ex){}
            if (ref) {
                window.scrollTo({
                    top: ref.getBoundingClientRect().top + window.scrollY - top_gap,
                    behavior: 'smooth'
                });
            }
        }
    });
}

export const allScrollTriggers = [];

export function refreshAllScrollTriggers() {
    // allScrollTriggers.forEach(st => st.refresh());
    ScrollTrigger.refresh(true);
}

export function setupScrollTriggerPinups(promise_to_wait_for = Promise.resolve(), top_gap = '80px') {
    promise_to_wait_for.then(() => {
        const pinups = document.querySelectorAll('[data-pinup]');
        for (const pinup of pinups) {
            const end_trigger_selector = pinup.dataset.pinupEndTrigger;
            const end_trigger = end_trigger_selector ? document.querySelector(end_trigger_selector) : pinup.nextSibling;
            const scroll_trigger = ScrollTrigger.create({
                // markers:             true,
                trigger:             pinup,
                endTrigger:          end_trigger,
                invalidateOnRefresh: true,
                pin:                 true,
                pinSpacing:          false,
                start:               `top ${ top_gap }`,
                end:                 `top ${ top_gap }`
            });
            allScrollTriggers.push(scroll_trigger);
            setTimeout(scroll_trigger.refresh, 100);
        }
    });
}