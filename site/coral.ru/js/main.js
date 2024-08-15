import { hostReactAppReady, preloadScript, vimeoAutoPlay, watchIntersection } from "../../common/js/usefuls";
import { StackSlider } from "./stack-slider";
import { ScrollPager } from "./scroll-pager/scroll-pager";
import { listHotelInfo } from "./api-adapter";

import RixosMap from '../rixos-map/RixosMap.vue'
import { createApp } from "vue";

(async function () {
    await hostReactAppReady();
    document.querySelector('section.nav')
        .closest('.row-container')
        .classList.remove(...'layout-container-limit center'.split(' '));

    vimeoAutoPlay();

    const nav_section = document.querySelector('section.nav');
    const nav_spacer = nav_section.nextSibling;
    window.addEventListener('scroll', () => {
        nav_section.classList.toggle('pinned', nav_section.getBoundingClientRect().top <= 0 && nav_spacer.getBoundingClientRect().top <= 0);
    });

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

    let fetchingHotelsInfo;
    if (window.known_hotels) {
        fetchingHotelsInfo = listHotelInfo(window.known_hotels.map(hotel => hotel.id));
        fetchingHotelsInfo.then(infos => {
            const { hotels } = infos;
            for (const hotel of hotels) {
                const visual = hotel.images?.at(0).sizes?.find(size => size.type === 4)?.url;
                if (visual) {
                    const visual_el = document.querySelector(`.hotel-card[data-hotel-id='${ hotel.id }'] .visual`);
                    visual_el?.style.setProperty('--visual', `url(${ visual })`);
                }
                // extend hotels data with got info
                const known_hotel = window.known_hotels.find(known => known.id == hotel.id);
                if (known_hotel) known_hotel.ee = hotel;
            }
        });
        new ScrollPager(
            document.querySelector('section.rixos-hotels .hotels-grid'),
            document.querySelector('section.rixos-hotels .scroll-pager'),
            document.querySelector('section.rixos-hotels .discrete-pager')
        );

    }

    document.fonts.ready.then(() => {
        const st1 = ScrollTrigger.create({
            invalidateOnRefresh: true,
            trigger:             'section.visuals-x-slider',
            endTrigger:          'section.advantages',
            // markers:             true,
            pin:                 true,
            pinSpacing:          false,
            // anticipatePin:       1,
            start:               'top 80px',
            end:                 'top 80px'
        });
        setTimeout(st1.refresh, 100);
        const st2 = ScrollTrigger.create({
            invalidateOnRefresh: true,
            trigger:             '.coral-bonus-girl',
            endTrigger:          '.loyality-program',
            // markers:             true,
            pin:                 true,
            pinSpacing:          false,
            // anticipatePin:       1,
            start:               'top 80px',
            end:                 'top 80px'
        });
        setTimeout(st2.refresh, 100);
    });

    let map_init = false;
    watchIntersection('#rixos-map', { threshold: .01 }, async (el, observer) => {
        if (!map_init) {
            await fetchingHotelsInfo;
            createApp(RixosMap, { hotelsList: known_hotels }).mount('#rixos-map');
            map_init = true;
        }
    });

})();