import { hostReactAppReady, preloadScript, vimeoAutoPlay } from "../../common/js/usefuls";

(async function () {
    await hostReactAppReady();
    document.querySelector('section.nav')
        .closest('.row-container')
        .classList.remove(...'layout-container-limit center'.split(' '));

    vimeoAutoPlay();

    // preloadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js').then(() => {
    //     preloadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js').then(() => {
    //         ScrollTrigger.create({
    //             markers: true,
    //             pin: true,
    //             anticipatePin: 1,
    //             trigger: 'section.nav',
    //             // start: 'top top',
    //             // end: 100
    //         });
    //     });
    // });

})();