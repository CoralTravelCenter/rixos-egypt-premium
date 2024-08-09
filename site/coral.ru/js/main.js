import { hostReactAppReady, preloadScript, vimeoAutoPlay } from "../../common/js/usefuls";

(async function () {
    await hostReactAppReady();
    document.querySelector('section.nav')
        .closest('.row-container')
        .classList.remove(...'layout-container-limit center'.split(' '));

    vimeoAutoPlay();

    // ScrollTrigger.create({
    //     markers: true,
    //     pin: true,
    //     anticipatePin: 1,
    //     trigger: 'section.nav',
    //     // start: 'top top',
    //     // end: 100
    // });

})();