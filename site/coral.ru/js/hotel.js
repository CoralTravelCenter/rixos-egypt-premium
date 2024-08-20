import { hostReactAppReady, preloadScript, vimeoAutoPlay, watchIntersection } from "../../common/js/usefuls";
import { ScrollPager } from "./scroll-pager/scroll-pager";
import { listHotelInfo, priceSearchDetail, priceSearchEncrypt } from "./api-adapter";

import RixosMap from '../rixos-map/RixosMap.vue'
import { createApp } from "vue";
import Milestones from "./milestones";
import { refreshAllScrollTriggers, setupScrollTriggerPinups, setupShortcuts } from "../../common/js/utils";
import { priceSearchDetail_query_defaults } from "../config/defaults";

import room_card_template from 'bundle-text:/site/coral.ru/templates/room-card.pug'
import '../../common/js/prototypes'
import dayjs from "dayjs";
import RoomsSplitter from "./rooms-splitter";
import Swiper from "swiper";

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

            const query = Object.assign({}, priceSearchDetail_query_defaults);
            Object.assign(query.searchCriterias, {
                beginDates:       [
                    dayjs().add(14, 'days').format('YYYY-MM-DD'),
                    dayjs().add(14 + 60, 'days').format('YYYY-MM-DD')
                ],
                arrivalLocations: [window.known_hotel.ee.location]
            });
            priceSearchEncrypt(query.searchCriterias).then(search => {
                const hotel_page_uri = `${ search.redirectionUrl }?qp=${ search.queryParam }&p=2`;
                priceSearchDetail(query).then(details => {
                    console.log('=== details: %o', details);
                    const { products, rooms } = details;
                    const models_list = products.map(product => {
                        const room = rooms[product.rooms.at(0).roomKey];
                        const visual = room.images?.at(0)?.sizes.find(s => s.type === 4)?.url;
                        const visual_style = visual ? `url(${ visual })` : 'linear-gradient(#def, #def)';
                        const room_area = room.roomSize.value;
                        const pax = room.maxPax.value;
                        const bedrooms = room.bedroom.value.split(/\s+/).join('<br>');
                        return {
                            name: room.name,
                            priceFormatted: Math.round(product.price.amount / product.stayNights).formatCurrency(),
                            tag_visual: `<duv class="visual" style="background-image: ${ visual_style }"></duv>`,
                            room_area,
                            pax,
                            bedrooms,
                            hotel_page_uri: hotel_page_uri + `&room_name=${ encodeURIComponent(room.name) }`
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

    new ScrollPager(
        document.querySelector('section.restaurants-and-bars .restaurants .scroll-slider'),
        document.querySelector('section.restaurants-and-bars .restaurants .scroll-pager'),
        document.querySelector('section.restaurants-and-bars .restaurants .discrete-pager')
    );
    new ScrollPager(
        document.querySelector('section.restaurants-and-bars .bars .scroll-slider'),
        null,
        document.querySelector('section.restaurants-and-bars .bars .discrete-pager')
    );

    new ScrollPager(
        document.querySelector('section.entertainment .two-usps'),
        null,
        document.querySelector('section.entertainment .discrete-pager')
    );

    let map_init = false;
    watchIntersection('#rixos-map', { threshold: .01 }, async (el, observer) => {
        if (!map_init) {
            await fetchingHotelsInfo;
            createApp(RixosMap, { hotelsList: [window.known_hotel] }).mount('#rixos-map');
            map_init = true;
        }
    });

})();