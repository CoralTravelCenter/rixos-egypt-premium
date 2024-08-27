import { hostReactAppReady, preloadScript, vimeoAutoPlay, watchIntersection } from "../../common/js/usefuls";
import { StackSlider } from "./stack-slider";
import { ScrollPager } from "./scroll-pager/scroll-pager";
import { listHotelInfo, priceSearchEncrypt } from "./api-adapter";

import RixosMap from '../rixos-map/RixosMap.vue'
import { createApp } from "vue";
import Milestones from "./milestones";
import { setupScrollTriggerPinups, setupShortcuts } from "../../common/js/utils";
import { priceSearchDetail_query_defaults } from "../config/defaults";
import dayjs from "dayjs";

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
                const hotel_card_el = document.querySelector(`.hotel-card[data-hotel-id='${ hotel.id }']`);
                if (visual) {
                    const visual_el = hotel_card_el.querySelector('.visual');
                    visual_el?.style.setProperty('--visual', `url(${ visual })`);
                }
                // extend hotels data with got info
                const known_hotel = window.known_hotels.find(known => known.id == hotel.id);
                if (known_hotel) known_hotel.ee = hotel;
                // link to hotel page
                const query = Object.assign({}, priceSearchDetail_query_defaults);
                const since = dayjs(known_hotel.searchOffersSince);
                Object.assign(query.searchCriterias, {
                    beginDates:       [
                        since.add(14, 'days').format('YYYY-MM-DD'),
                        since.add(14 + 60, 'days').format('YYYY-MM-DD')
                    ],
                    arrivalLocations: [known_hotel.ee.location]
                });
                priceSearchEncrypt(query.searchCriterias).then(search => {
                    const hotel_page_uri = `${ search.redirectionUrl }?qp=${ search.queryParam }&p=2`;
                    hotel_card_el.querySelector('a.choose-hotel').href = hotel_page_uri;
                });
            }
        });
        new ScrollPager(
            document.querySelector('section.rixos-hotels .hotels-grid'),
            document.querySelector('section.rixos-hotels .scroll-pager'),
            document.querySelector('section.rixos-hotels .discrete-pager')
        );

    }

    let map_init = false;
    watchIntersection('#rixos-map', { threshold: .01 }, async (el, observer) => {
        if (!map_init) {
            await fetchingHotelsInfo;
            createApp(RixosMap, { hotelsList: window.known_hotels }).mount('#rixos-map');
            map_init = true;
        }
    });

})();