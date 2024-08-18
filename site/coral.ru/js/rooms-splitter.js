import mustache from "mustache";

export default class RoomsSplitter {
    setup;
    splitterEl;
    listEl;
    modelsList;
    template;
    constructor(setup, models_list, template, splitter_el, list_el) {
        this.setup = setup;
        window.room_splitter_setup = setup;
        this.splitterEl = splitter_el;
        this.listEl = list_el;
        this.modelsList = models_list;
        this.template = template;
        this.init();
    }

    init() {
        for (const model of this.modelsList) {
            const room_card_el = document.createElement('div').innerHTML = mustache.render(this.template, model);
            for (const setup_item of this.setup) {
                const re = new RegExp(setup_item.matcher.regex, setup_item.matcher.flags);
                const test_is_positive = re.test(model[setup_item.matcher.field]);
                if (setup_item.matcher.negate ? !test_is_positive : test_is_positive) {
                    if (!setup_item.list) {
                        setup_item.list = [];
                        const splitter_item = document.createElement('span');
                        splitter_item.classList.add('splitter-item');
                        splitter_item.textContent = setup_item.name;
                        splitter_item.addEventListener('click', e => {
                            this.selectSetupItem(setup_item);
                        });
                        this.splitterEl.append(splitter_item);
                    }
                    setup_item.list.push(room_card_el);
                }
            }
        }
        // remove categories with empty lists
        this.setup = this.setup.filter(item => !!item.list);
        // select 'default' item or first in list
        this.selectSetupItem(this.setup.find(item => item.default) || this.setup[0]);
        return this;
    }

    selectSetupItem(item) {
        const idx = this.setup.indexOf(item);
        for (const [i, child] of [...this.splitterEl.children].entries()) {
            child.classList.toggle('selected', i === idx);
        }
        if (window.innerWidth <= 576) {
            this.splitterEl.children[idx].scrollIntoView({ behavior: 'smooth' });
        }
        this.listEl.innerHTML = this.setup.at(idx).list.join('');
    }

};