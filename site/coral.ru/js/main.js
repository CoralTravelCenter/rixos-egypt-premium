import { hostReactAppReady, vimeoAutoPlay } from "../../common/js/usefuls";

(async function () {
    await hostReactAppReady();
    document.querySelector('section.nav')
        .closest('.row-container')
        .classList.remove(...'layout-container-limit center'.split(' '));

    vimeoAutoPlay();
})();