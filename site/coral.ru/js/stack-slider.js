// import css from 'bundle-text:./scroll-pager.less';
import { watchIntersection } from "../../common/js/usefuls";

export class StackSlider {

    static usedOnce = false;
    stackEl;
    slides;
    pagerEl;
    shiftBackwardEl;
    shiftForwardEl;

    backShift = 30 / 16 + 'em';
    maxVisibleIdx = 2;
    stepDuration = .5;

    constructor(stack, pager, shifters) {
        this.stackEl = stack;
        this.pagerEl = pager;
        this.shiftBackwardEl = shifters?.querySelector('button.backward');
        this.shiftForwardEl = shifters?.querySelector('button.forward');
        if (!StackSlider.usedOnce) {
            StackSlider.initOnce();
            StackSlider.usedOnce = true;
        }
        this.init();
    }

    static initOnce() {
        // const style_el = document.createElement('style');
        // style_el.textContent = css;
        // document.head.append(style_el);
    }

    init() {

        this.slides = [...this.stackEl.children];

        this.shiftBackwardEl?.addEventListener('click', () => {
            this.shiftBackward();
        });
        this.shiftForwardEl?.addEventListener('click', () => {
            this.shiftForward();
        });

        if (this.shiftBackwardEl) {
            this.stackEl.addEventListener('scroll', () => {
                this.syncAppearance();
            });
        }

        watchIntersection(this.stackEl.children, { root: this.stackEl, threshold: .66 }, (el) => {

        }, (el) => {

        });

        this.updateSlides(0);
        this.syncAppearance();

        return this;
    }

    updateSlides(duration, direction = 'forward') {
        for (const [idx, slide] of this.slides.entries()) {
            const visual = slide.querySelector('.visual');
            const t = gsap.timeline();
            if (idx === 0) {
                if (direction === 'forward') {
                    t.to(slide, { x: 0, y: 0, yPercent: 0, z: -100 * idx, duration });
                    t.to(visual, { opacity: 1, duration: duration  }, '<');
                } else {
                    t.set(visual, { opacity: 1 });
                    t.fromTo(slide, { x: 0, yPercent: 50, y: 0, z: -100 * idx, opacity: 0 }, { x: 0, yPercent: 0, y: 0,  z: -100 * idx, opacity: 1, duration });
                }
            } else if (idx === this.slides.length - 1) {
                if (direction === 'forward') {
                    t.fromTo(slide, { x: 0, yPercent: 0, y: 0, z: -100 * idx, opacity: 1 }, { x: 0, yPercent: 50, y: 0, z: -100 * idx, opacity: 0, duration });
                } else {

                }
            } else {
                let [, value, unit] = this.backShift.match(/(.+?)([a-z]+)$/);
                value = Number(value);
                const shift_value = value * Math.min(idx, this.maxVisibleIdx + 1);
                t.to(slide, { x: shift_value + unit, y: -shift_value + unit, yPercent: 0, z: -100 * idx, duration });
                t.to(visual, { opacity: 0, duration }, '<');
                if (idx > this.maxVisibleIdx) {
                    t.to(slide, { opacity: 0, duration }, '<');
                } else {
                    t.to(slide, { opacity: 1, duration }, '<');
                }
            }
        }
    }

    syncAppearance() {
        this.shiftBackwardEl?.classList.toggle('disabled', this.stackEl.scrollLeft <= 0);
        this.shiftForwardEl?.classList.toggle('disabled', this.stackEl.scrollLeft + this.stackEl.clientWidth >= this.stackEl.scrollWidth);
    }

    shiftBackward() {
        this.slides.unshift(this.slides.pop());
        this.updateSlides(this.stepDuration, 'backward');
        this.stackEl.scrollBy({
            top: 0,
            left: -this.stackEl.children[0].getBoundingClientRect().width,
            behavior: 'smooth'
        });
    }

    shiftForward() {
        this.slides.push(this.slides.shift());
        this.updateSlides(this.stepDuration, 'forward');
        this.stackEl.scrollBy({
            top: 0,
            left: this.stackEl.children[0].getBoundingClientRect().width,
            behavior: 'smooth'
        });
    }

}