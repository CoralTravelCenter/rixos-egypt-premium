import css from 'bundle-text:./scroll-pager.less';
import { watchIntersection } from "../../../common/js/usefuls";

export class ScrollPager {

    static usedOnce = false;
    scrollerEl;
    scrollPagerEl;
    discretePagerEl;
    shiftBackwardEl;
    shiftForwardEl;
    _visibleChildren = [];

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
        const pager_items = new Array(this.visibleChildren.length).fill('<li></li>');
        this.discretePagerEl.innerHTML = pager_items.join('');
        watchIntersection(this.visibleChildren, { root: this.scrollerEl, threshold: .66 }, (el) => {
            this.discretePagerEl.children[[...this.visibleChildren].indexOf(el)]?.classList.add('current');
        }, (el) => {
            this.discretePagerEl.children[[...this.visibleChildren].indexOf(el)]?.classList.remove('current');
        });
        this.syncAppearance();
    }

    init() {

        const mo = new MutationObserver(list => {
            this.refillDiscretePager();
        });
        mo.observe(this.scrollerEl, { childList: true });

        this.refillDiscretePager();
        // const pager_items = new Array(this.visibleChildren.length).fill('<li></li>');
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
                const slide_el = this.visibleChildren[page_idx];
                // slide_el.scrollIntoView({ behavior: 'smooth' });
                this.scrollerEl.scrollTo({ top: 0, left: slide_el.offsetLeft, behavior: 'smooth' });
            }
        });

        // watchIntersection(this.visibleChildren, { root: this.scrollerEl, threshold: .66 }, (el) => {
        //     this.discretePagerEl.children[[...this.visibleChildren].indexOf(el)].classList.add('current');
        // }, (el) => {
        //     this.discretePagerEl.children[[...this.visibleChildren].indexOf(el)].classList.remove('current');
        // });
        //
        // this.syncAppearance();

        setInterval(() => {
            this.visibleChildren
        }, 500);

        return this;
    }

    get visibleChildren() {
        const visibleNow = [...this.scrollerEl.children].filter(child => !!child.getBoundingClientRect().width);
        if (visibleNow.length && !visibleNow.every((el ,idx) => this._visibleChildren[idx] === el)) {
            this._visibleChildren = visibleNow;
            setTimeout(() => {
                this.refillDiscretePager();
            }, 0);
        }
        return visibleNow;
    }

    syncAppearance() {
        this.shiftBackwardEl?.classList.toggle('disabled', this.scrollerEl.scrollLeft <= 0);
        this.shiftForwardEl?.classList.toggle('disabled', this.scrollerEl.scrollLeft + this.scrollerEl.clientWidth >= this.scrollerEl.scrollWidth);
    }

    shiftBackward() {
        this.scrollerEl.scrollBy({
            top: 0,
            left: -this.visibleChildren[0].getBoundingClientRect().width,
            behavior: 'smooth'
        });
    }

    shiftForward() {
        this.scrollerEl.scrollBy({
            top: 0,
            left: this.visibleChildren[0].getBoundingClientRect().width,
            behavior: 'smooth'
        });
    }

}