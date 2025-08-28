import { hostReactAppReady, preloadScript, vimeoAutoPlay, watchIntersection } from "../../common/js/usefuls";
import { StackSlider } from "./stack-slider";
import { ScrollPager } from "./scroll-pager/scroll-pager";
import { listHotelInfo, priceSearchEncrypt } from "./api-adapter";

import RixosMap from '../rixos-map/RixosMap.vue'
import { createApp } from "vue";
import Milestones from "./milestones";
import { setupScrollTriggerPinups, setupShortcuts } from "../../common/js/utils";
import {
    defaultSearchOffersDuration,
    defaultSearchOffersStart, packageSearchDetail_query_defaults,
    priceSearchDetail_query_defaults
} from "../config/defaults";
import dayjs from "dayjs";
import { debounce } from "lodash";

(async function () {
    await hostReactAppReady();
    document.querySelector('section.nav')
        .closest('.row-container')
        .classList.remove(...'layout-container-limit center'.split(' '));

    vimeoAutoPlay();

    const nav_section = document.querySelector('section.nav');
    const nav_spacer = nav_section.nextSibling;
    // window.addEventListener('scroll', debounce(() => {
    //     nav_section.classList.toggle('pinned', nav_section.getBoundingClientRect().top < 1 && nav_spacer.getBoundingClientRect().top < 1);
    // }, 10));

    setupShortcuts();
    setupScrollTriggerPinups(document.fonts.ready);

    new Milestones(document.querySelector('section.nav .shortcuts')?.children);

// new StackSlider(
    //     document.querySelector('section.advantages .stack'),
    //     document.querySelector('section.advantages .paging'),
    //     document.querySelector('section.advantages .cards-stack')
    // );
    //
    // new ScrollPager(
    //     document.querySelector('section.entertainment-section .scroll-slider'),
    //     document.querySelector('section.entertainment-section .scroll-pager'),
    //     document.querySelector('section.entertainment-section .discrete-pager')
    // );

    let fetchingHotelsInfo;
    if (window.known_hotels) {
        function applyHotelFilterByCountry() {
            const activeSwitch = document.querySelector('.switcher .switch.active');
            if (!activeSwitch) return;

            const countryMap = {
                egypt: 'Egypt',
                turkey: 'Turkey',
                uae: 'UAE'
            };
            const targetCountry = countryMap[activeSwitch.classList[0]];
            const cards = Array.from(document.querySelectorAll('.hotel-card'));

            // Шаг 1: Скрываем все карточки с анимацией
            const hideAnimations = cards.map(card => {
                return new Promise(resolve => {
                    if (!card.classList.contains('hidden')) {
                        card.classList.remove('fade-in');
                        card.classList.add('fade-out');
                        setTimeout(() => {
                            card.classList.add('hidden');
                            card.classList.remove('fade-out');
                            resolve();
                        }, 400);
                    } else {
                        resolve();
                    }
                });
            });

            // Шаг 2: После того как всё скрыто — показываем нужные
            Promise.all(hideAnimations).then(() => {
                cards.forEach(card => {
                    if (card.dataset.country === targetCountry) {
                        card.classList.remove('hidden');
                        card.classList.add('fade-in');
                    }
                });
            });
        }


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
                // const query = Object.assign({}, priceSearchDetail_query_defaults);
                const query = Object.assign({}, packageSearchDetail_query_defaults);
                const since = dayjs(known_hotel.searchOffersSince);
                const start = known_hotel.searchOffersStart || defaultSearchOffersStart;
                const duration = known_hotel.searchOffersDuration || defaultSearchOffersDuration;

                if (known_hotel?.roomsSplit) {
                    Object.assign(query.searchCriterias, {
                        beginDates:       [
                            since.add(start, 'days').format('YYYY-MM-DD'),
                            since.add(start + duration, 'days').format('YYYY-MM-DD')
                        ],
                        arrivalLocations: [known_hotel.ee.location]
                    });
                    priceSearchEncrypt(query.searchCriterias).then(search => {
                        // const hotel_page_uri = `${ search.redirectionUrl }?qp=${ search.queryParam }&p=2`;
                        const hotel_page_uri = `${ search.redirectionUrl }?qp=${ search.queryParam }&p=1`;
                        hotel_card_el.querySelector('a.choose-hotel').href = hotel_page_uri;
                    });
                }
            }
            applyHotelFilterByCountry();
        });
        new ScrollPager(
            document.querySelector('section.rixos-hotels .hotels-grid'),
            document.querySelector('section.rixos-hotels .scroll-pager'),
            document.querySelector('section.rixos-hotels .discrete-pager')
        );

        document.addEventListener('click', (e) => {
            const ym_event_emitter = e.target.closest('[data-ym-event]');
            if (ym_event_emitter) {
                const ym_event_name = ym_event_emitter.getAttribute('data-ym-event');
                const hotel_name = ym_event_emitter.getAttribute('data-ym-event-data-hotel');
                const em_event_data = hotel_name ? { Hotel: hotel_name } : undefined;
                try {
                    ym(96674199, 'reachGoal', ym_event_name, em_event_data);
                } catch (e) {}
            }
        });

    }



    let map_init = false;
    watchIntersection('#rixos-map', { threshold: .01 }, async (el, observer) => {
        if (!map_init) {
            await fetchingHotelsInfo;
            createApp(RixosMap, { hotelsList: window.known_hotels }).mount('#rixos-map');
            map_init = true;
        }
    });

    document.querySelector('.country-selector > *')?.classList.add('selected');
    document.querySelectorAll('.country-selector > *')?.forEach(country_el => {
        country_el.addEventListener('click', () => {
            country_el.parentElement.querySelector('.selected').classList.remove('selected');
            country_el.classList.add('selected');
        });
    });

    // document.querySelector('.switcher').addEventListener('click', (e) => {
    //     const clickedSwitch = e.target.closest('.switch');
    //     if (!clickedSwitch) return; // Клик был не по .switch и не внутри него
    //
    //     document.querySelectorAll('.switcher .switch').forEach(s =>
    //         s.classList.remove('active')
    //     );
    //     clickedSwitch.classList.add('active');
    //     applyHotelFilterByCountry();
    // });

    const container = document.querySelector('.blocks_items');
    const dots = document.querySelectorAll('.pagination .dot');
    const items = document.querySelectorAll('.blocks_item');

    const updateActiveDot = () => {
        const scrollLeft = container?.scrollLeft;
        const containerWidth = container?.offsetWidth;

        let activeIndex = Math.round(scrollLeft / containerWidth);

        dots.forEach(dot => dot.classList.remove('active'));
        dots[activeIndex]?.classList.add('active');
    };

    container?.addEventListener('scroll', () => {
        requestAnimationFrame(updateActiveDot);
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = +dot.dataset.index;
            const scrollTo = index * container.offsetWidth;
            container.scrollTo({ left: scrollTo, behavior: 'smooth' });
        });
    });

    updateActiveDot(); // инициализация

})();