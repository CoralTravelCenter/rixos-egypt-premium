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
import mustache from "mustache";
import '../../common/js/prototypes'
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

    let fetchingHotelsInfo;
    if (window.known_hotel) {
        fetchingHotelsInfo = listHotelInfo([window.known_hotel.id]);
        fetchingHotelsInfo.then(infos => {
            const { hotels } = infos;
            window.known_hotel.ee = hotels[0];
            //

            const query = Object.assign({}, priceSearchDetail_query_defaults);
            Object.assign(query.searchCriterias, {
                beginDates:       [dayjs().add(14, 'days'), dayjs().add(14 + 30, 'days')],
                arrivalLocations: [window.known_hotel.ee.location]
            });
            priceSearchDetail(query).then(details => {
                console.log('=== details: %o', details);
                const { products, rooms } = details;
                const rooms_html = products.map(product => {
                    const room = rooms[product.rooms.at(0).roomKey];
                    const visual = room.images?.at(0)?.sizes.find(s => s.type === 4)?.url;
                    const visual_style = visual ? `url(${ visual })` : 'linear-gradient(#def, #def)';
                    const room_area = room.roomSize.value;
                    const pax = room.maxPax.value;
                    const bedrooms = room.bedroom.value.split(/\s+/).join('<br>');
                    const room_model = {
                        name: room.name,
                        priceFormatted: Math.round(product.price.amount / product.stayNights).formatCurrency(),
                        tag_visual: `<duv class="visual" style="background-image: ${ visual_style }"></duv>`,
                        room_area,
                        pax,
                        bedrooms
                    };
                    return mustache.render(room_card_template, room_model);
                }).join('');
                document.querySelector('.rooms-grid').innerHTML = rooms_html;
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