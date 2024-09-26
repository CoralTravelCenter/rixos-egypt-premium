<script setup>
import { computed, getCurrentInstance, ref } from "vue";
import { onClickOutside } from "@vueuse/core";

import icon_elite from 'data-url:/site/coral.ru/assets-inline/hotel-marker-elite.svg';
import { openedMapMarker } from "./global-state";

const props = defineProps({
    hotel: Object,
    initiallyOpen: {
        type: Boolean,
        default: false
    }
});

const $this = getCurrentInstance();

const isOpen = ref(props.initiallyOpen);
defineExpose({ hide: () => isOpen.value = false });

function handleClick() {
    isOpen.value = !isOpen.value;
    openedMapMarker.value = isOpen.value ? $this : null;
}

const card_el = ref(null);
onClickOutside(card_el, e => {
    if (isOpen.value) {
        // console.log('+++ onClickOutside: e: %o', e);
        if (e.target.closest('.rixos-map')) {
            isOpen.value = false;
        }
    }
});

</script>

<template>
    <div class="rixos-marker" :class="{ open: isOpen }" @click="handleClick">
        <div class="placemark" :style="{ backgroundImage: `url(${ icon_elite })` }"></div>
        <div class="name">{{ hotel.name }}</div>
        <div class="card" ref="card_el">
            <img v-if="hotel.logo" :src="hotel.logo" class="logo">
            <div class="location">{{ hotel.ee.locationSummary.replace(/\(.+?\)/g,'') }}</div>
            <button v-if="initiallyOpen" data-ref="section.suites" class="learn-more">Выбрать номер</button>
            <a v-else-if="hotel.url" :href="hotel.url" class="learn-more" target="_blank">Подробнее об отеле</a>
            <div class="pointer-decor"></div>
        </div>
    </div>
</template>

<style lang="less">
ymaps:has(>div>div>div.rixos-marker.open) {
    z-index: 10!important;
}
</style>

<style scoped lang="less">
@import "../../common/css/coral-colors";
@import "../../common/css/coral-mixins";

.rixos-marker {
    font-size: 14px;
    line-height: 1;
    position: relative;
    width: 2em;
    height: (43/33) * 2em;
    transform: translate(-50%, -100%);
    .placemark {
        position: absolute;
        inset: 0;
        background: center / cover no-repeat;
    }
    .name {
        font-family: TrajanPro3Regular;
        font-size: (12/14em);
        position: absolute;
        top: 1px;
        z-index: -1;
        background: white;
        color: @brand-nav-bg;
        line-height: 1;
        white-space: nowrap;
        display: inline-grid;
        place-content: center;
        height: 1.7em;
        padding: 0 0.7em 0 2.6em;
        border-radius: 100px;
        box-shadow: 2px -2px 16px fade(black, 15%);
    }
    .card {
        position: absolute;
        left: 1em;
        //top: (43/33) * 1em;
        top: calc(~"43 / 33 * 1em + 27px");
        transform: translate(-50%, 0%);
        min-width: 15em;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1em;
        background: white;
        padding: 1em 2em;
        border-radius: 12px;
        filter: drop-shadow(0 -2px 16px fade(black, 15%));
        .pointer-decor {
            position: absolute;
            left: 50%;
            top: 1px;
            transform: translate(-50%, -100%);
            aspect-ratio: 17/27;
            width: 17px;
            background: url("/site/coral.ru/assets/icons/map-card-pointer-decor.svg") center / cover no-repeat;
        }
        img.logo {

        }
        .location {
            text-align: center;
            line-height: 1.3;
        }
        .learn-more {
            .knopf();
            font-size: inherit;
            white-space: nowrap;
        }
    }
    &.open {
        .name, .placemark {
            display: none;
        }
    }
    &:not(.open) {
        .card {
            display: none;
        }
    }
}
</style>