import { hostReactAppReady, preloadScript, vimeoAutoPlay } from "../../common/js/usefuls";
import { StackSlider } from "./stack-slider";
import { ScrollPager } from "./scroll-pager/scroll-pager";

(async function () {
    await hostReactAppReady();
    document.querySelector('section.nav')
        .closest('.row-container')
        .classList.remove(...'layout-container-limit center'.split(' '));

    vimeoAutoPlay();

    new StackSlider(
        document.querySelector('section.advantages .stack'),
        document.querySelector('section.advantages .paging'),
        document.querySelector('section.advantages .cards-stack')
        );

    new ScrollPager(
        document.querySelector('section.perfection .scroll-slider'),
        document.querySelector('section.perfection .scroll-pager'),
        document.querySelector('section.perfection .discrete-pager')
    );

    // ScrollTrigger.create({
    //     markers: true,
    //     pin: true,
    //     anticipatePin: 1,
    //     trigger: 'section.nav',
    //     // start: 'top top',
    //     // end: 100
    // });

})();