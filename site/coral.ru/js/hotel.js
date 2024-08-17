import { hostReactAppReady, preloadScript, vimeoAutoPlay, watchIntersection } from "../../common/js/usefuls";
import { StackSlider } from "./stack-slider";
import { ScrollPager } from "./scroll-pager/scroll-pager";
import { listHotelInfo, priceSearchDetail } from "./api-adapter";

import RixosMap from '../rixos-map/RixosMap.vue'
import { createApp } from "vue";
import Milestones from "./milestones";
import { setupScrollTriggerPinups, setupShortcuts } from "../../common/js/utils";
import { priceSearchDetail_query_defaults } from "../config/defaults";

import room_card_template from 'bundle-text:/site/coral.ru/templates/room-card.pug'

console.log(room_card_template);

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

    setupShortcuts();
    setupScrollTriggerPinups(document.fonts.ready);

    new Milestones(document.querySelector('section.nav .shortcuts')?.children);

    let fetchingHotelsInfo;
    if (window.known_hotel) {
        fetchingHotelsInfo = listHotelInfo([window.known_hotel.id]);
        fetchingHotelsInfo.then(infos => {
            const { hotels } = infos;
            window.known_hotel.ee = hotels[0];
            //

            const query = Object.assign({}, priceSearchDetail_query_defaults);
            Object.assign(query.searchCriterias, {
                beginDates:       ['2024-10-01', '2024-10-31'],
                arrivalLocations: [window.known_hotel.ee.location]
            });
            priceSearchDetail(query).then(details => {
                console.log('=== details: %o', details);
            });

        });
    }



    // let map_init = false;
    // watchIntersection('#rixos-map', { threshold: .01 }, async (el, observer) => {
    //     if (!map_init) {
    //         await fetchingHotelsInfo;
    //         createApp(RixosMap, { hotelsList: window.known_hotels }).mount('#rixos-map');
    //         map_init = true;
    //     }
    // });

})();