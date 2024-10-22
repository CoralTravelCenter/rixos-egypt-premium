import { hostReactAppReady, preloadScript, vimeoAutoPlay, watchIntersection } from "../../common/js/usefuls";
import { ScrollPager } from "./scroll-pager/scroll-pager";
import { listHotelInfo, priceSearchDetail, priceSearchEncrypt } from "./api-adapter";

import RixosMap from '../rixos-map/RixosMap.vue'
import { createApp } from "vue";
import Milestones from "./milestones";
import { refreshAllScrollTriggers, setupScrollTriggerPinups, setupShortcuts } from "../../common/js/utils";
import {
    defaultSearchOffersDuration,
    defaultSearchOffersStart,
    priceSearchDetail_query_defaults
} from "../config/defaults";

import room_card_template from 'bundle-text:/site/coral.ru/templates/room-card.pug'
import '../../common/js/prototypes'

import dayjs from "dayjs";
import MinMax from "dayjs/plugin/minMax";
dayjs.extend(MinMax);

import RoomsSplitter from "./rooms-splitter";
import Swiper from "swiper";
import { debounce } from "lodash";

(async function () {
    await hostReactAppReady();
    document.querySelector('section.nav')
        .closest('.row-container')
        .classList.remove(...'layout-container-limit center'.split(' '));

    vimeoAutoPlay();

    const nav_section = document.querySelector('section.nav');
    const nav_spacer = nav_section.nextSibling;
    window.addEventListener('scroll', debounce(() => {
        nav_section.classList.toggle('pinned', nav_section.getBoundingClientRect().top < 1 && nav_spacer.getBoundingClientRect().top < 1);
    }, 10));

    setupShortcuts();
    setupScrollTriggerPinups(document.fonts.ready);

    new Milestones(document.querySelector('section.nav .shortcuts')?.children);

    let fetchingHotelsInfo;
    if (window.known_hotel) {
        fetchingHotelsInfo = listHotelInfo([window.known_hotel.id]);
        fetchingHotelsInfo.then(infos => {
            const { hotels } = infos;
            window.known_hotel.ee = hotels[0];

            const query = Object.assign({}, priceSearchDetail_query_defaults);
            const since = dayjs(window.known_hotel.searchOffersSince);
            const start = window.known_hotel.searchOffersStart || defaultSearchOffersStart;
            const duration = window.known_hotel.searchOffersDuration || defaultSearchOffersDuration;
            Object.assign(query.searchCriterias, {
                beginDates:       [
                    since.add(start, 'days').format('YYYY-MM-DD'),
                    since.add(start + duration, 'days').format('YYYY-MM-DD')
                ],
                arrivalLocations: [window.known_hotel.ee.location]
            });
            priceSearchEncrypt(query.searchCriterias).then(search => {
                const hotel_page_uri = `${ search.redirectionUrl }?qp=${ search.queryParam }&p=2`;
                priceSearchDetail(query).then(details => {
                    console.log('=== details: %o', details);
                    const { products, rooms } = details;
                    const models_list = products.map((product, idx) => {
                        let room_key = product.rooms.at(0).roomKey;
                        const room = rooms[room_key];
                        let visual = room.images?.at(0)?.sizes.find(s => s.type === 4)?.url;
                        if (~visual.indexOf('defaultimages')) {
                            visual = `/site/coral.ru/assets/missing-room-pics/${ room_key }.jpg`;
                        }
                        const visual_style = visual ? `url(${ visual })` : 'linear-gradient(#def, #def)';
                        const room_area = room.roomSize.value;
                        const pax = room.maxPax.value;
                        const bedrooms = room.bedroom.value.split(/\s+/).join('<br>');
                        return {
                            id: room_key,
                            // name: room.name,
                            name: room.name.replace(/\d.*/,''),
                            priceFormatted: Math.round(product.price.amount / product.stayNights).formatCurrency(),
                            tag_visual: `<duv class="visual" style="background-image: ${ visual_style }"></duv>`,
                            room_area,
                            pax,
                            bedrooms,
                            hotel_page_uri: hotel_page_uri + `&room_name=${ encodeURIComponent(room.name) }`,
                            list_idx: idx + 1
                        };
                    });
                    if (window.known_hotel.roomsSplit) {
                        new RoomsSplitter(
                            window.known_hotel.roomsSplit,
                            models_list,
                            room_card_template,
                            document.querySelector('h2.rooms-splitter'),
                            document.querySelector('.rooms-grid')
                        );
                        new ScrollPager(
                            document.querySelector('.rooms-grid'),
                            null,
                            document.querySelector('.rooms-paging')
                        );
                    }
                    setTimeout(() => refreshAllScrollTriggers(), 100);
                });
            });

        });
    }

    let swiper_el = document.querySelector('section.hotel-gallery .swiper');
    if (swiper_el) {
        const gallerySwiper = new Swiper(swiper_el, {
            loop: true,
            centeredSlides: true,
            spaceBetween: 0,
            slidesPerView: 'auto',
            initialSlide: 0,
            navigation: {
                prevEl: document.querySelector('section.hotel-gallery button.swiper-button-prev'),
                nextEl: document.querySelector('section.hotel-gallery button.swiper-button-next'),
            },
            breakpoints: { 768: { spaceBetween: 32 } }
        });
        gallerySwiper.slideNext();
    }

    if (document.querySelector('section.restaurants-and-bars .restaurants .scroll-slider')) {
        new ScrollPager(
            document.querySelector('section.restaurants-and-bars .restaurants .scroll-slider'),
            null,
            document.querySelector('section.restaurants-and-bars .restaurants .discrete-pager')
        );
    }
    if (document.querySelector('section.restaurants-and-bars .bars .scroll-slider')) {
        new ScrollPager(
            document.querySelector('section.restaurants-and-bars .bars .scroll-slider'),
            null,
            document.querySelector('section.restaurants-and-bars .bars .discrete-pager')
        );
    }
    if (document.querySelector('section.restaurants-and-bars .cafe .scroll-slider')) {
        new ScrollPager(
            document.querySelector('section.restaurants-and-bars .cafe .scroll-slider'),
            null,
            document.querySelector('section.restaurants-and-bars .cafe .discrete-pager')
        );
    }

    if (document.querySelector('section.entertainment .two-usps')) {
        new ScrollPager(
            document.querySelector('section.entertainment .two-usps'),
            null,
            document.querySelector('section.entertainment .discrete-pager')
        );
    }

    document.addEventListener('click', (e) => {
        const ym_event_emitter = e.target.closest('[data-ym-event]');
        if (ym_event_emitter) {
            const ym_event_name = ym_event_emitter.getAttribute('data-ym-event');
            const room_name = ym_event_emitter.getAttribute('data-ym-event-data-room');
            const list_idx = ym_event_emitter.getAttribute('data-ym-event-data-idx');
            let em_event_data;
            if (room_name) {
                em_event_data ||= {};
                em_event_data.room = room_name;
            }
            if (list_idx) {
                em_event_data ||= {};
                em_event_data.index = list_idx;
            }
            try {
                ym(96674199, 'reachGoal', ym_event_name, em_event_data);
            } catch (e) {}
        }
    });


    let map_init = false;
    watchIntersection('#rixos-map', { threshold: .01 }, async (el, observer) => {
        if (!map_init) {
            await fetchingHotelsInfo;
            createApp(RixosMap, { hotelsList: [window.known_hotel] }).mount('#rixos-map');
            map_init = true;
        }
    });

})();