export default class Milestones {

    shortcuts;
    refs;

    constructor(shortcut_els) {
        this.shortcuts = [...shortcut_els];
        this.refs = this.shortcuts.map(shortcut => document.querySelector(shortcut.dataset.ref));
        this.init();
    }

    init() {

        window.addEventListener('scroll', e => {
            const viewport_anchor = window.innerHeight / 2;
            for (const [idx, ref] of this.refs.entries()) {
                const { top, bottom } = ref.getBoundingClientRect();
                const in_view = top <= viewport_anchor && bottom > viewport_anchor;
                this.shortcuts.at(idx).classList.toggle('in-view', in_view);
            }
        });

        return  this;
    }

}