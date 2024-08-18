import css from 'bundle-text:./scroll-pager.less';
import { watchIntersection } from "../../../common/js/usefuls";

export class ScrollPager {

    static usedOnce = false;
    scrollerEl;
    scrollPagerEl;
    discretePagerEl;
    shiftBackwardEl;
    shiftForwardEl;

    constructor(scroller, scroll_pager, discrete_pager, shifters) {
        this.scrollerEl = scroller;
        this.scrollPagerEl = scroll_pager;
        this.discretePagerEl = discrete_pager;
        this.shiftBackwardEl = shifters?.querySelector('button.backward');
        this.shiftForwardEl = shifters?.querySelector('button.forward');
        if (!ScrollPager.usedOnce) {
            ScrollPager.initOnce();
            ScrollPager.usedOnce = true;
        }
        this.init();
    }

    static initOnce() {
        const style_el = document.createElement('style');
        style_el.textContent = css;
        document.head.append(style_el);
    }

    refillDiscretePager() {
        const pager_items = new Array(this.scrollerEl.children.length).fill('<li></li>');
        this.discretePagerEl.innerHTML = pager_items.join('');
        watchIntersection(this.scrollerEl.children, { root: this.scrollerEl, threshold: .66 }, (el) => {
            this.discretePagerEl.children[[...this.scrollerEl.children].indexOf(el)]?.classList.add('current');
        }, (el) => {
            this.discretePagerEl.children[[...this.scrollerEl.children].indexOf(el)]?.classList.remove('current');
        });
        this.syncAppearance();
    }

    init() {

        const mo = new MutationObserver(list => {
            this.refillDiscretePager();
        });
        mo.observe(this.scrollerEl, { childList: true });

        this.refillDiscretePager();
        // const pager_items = new Array(this.scrollerEl.children.length).fill('<li></li>');
        // this.discretePagerEl.innerHTML = pager_items.join('');

        this.shiftBackwardEl?.addEventListener('click', () => {
            this.shiftBackward();
        });
        this.shiftForwardEl?.addEventListener('click', () => {
            this.shiftForward();
        });

        if (this.shiftBackwardEl) {
            this.scrollerEl.addEventListener('scroll', () => {
                this.syncAppearance();
            });
        }

        this.discretePagerEl.addEventListener('click', (e) => {
            const page_idx = [...this.discretePagerEl.children].indexOf(e.target);
            if (~page_idx) {
                const slide_el = this.scrollerEl.children[page_idx];
                // slide_el.scrollIntoView({ behavior: 'smooth' });
                this.scrollerEl.scrollTo({ top: 0, left: slide_el.offsetLeft, behavior: 'smooth' });
            }
        });

        // watchIntersection(this.scrollerEl.children, { root: this.scrollerEl, threshold: .66 }, (el) => {
        //     this.discretePagerEl.children[[...this.scrollerEl.children].indexOf(el)].classList.add('current');
        // }, (el) => {
        //     this.discretePagerEl.children[[...this.scrollerEl.children].indexOf(el)].classList.remove('current');
        // });
        //
        // this.syncAppearance();

        return this;
    }

    syncAppearance() {
        this.shiftBackwardEl?.classList.toggle('disabled', this.scrollerEl.scrollLeft <= 0);
        this.shiftForwardEl?.classList.toggle('disabled', this.scrollerEl.scrollLeft + this.scrollerEl.clientWidth >= this.scrollerEl.scrollWidth);
    }

    shiftBackward() {
        this.scrollerEl.scrollBy({
            top: 0,
            left: -this.scrollerEl.children[0].getBoundingClientRect().width,
            behavior: 'smooth'
        });
    }

    shiftForward() {
        this.scrollerEl.scrollBy({
            top: 0,
            left: this.scrollerEl.children[0].getBoundingClientRect().width,
            behavior: 'smooth'
        });
    }

}