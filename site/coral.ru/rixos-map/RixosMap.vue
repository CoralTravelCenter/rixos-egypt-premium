<script setup>
import { computed, reactive, ref, shallowRef, watchEffect } from "vue";

import {
    createYmapsOptions,
    YandexMap,
    YandexMapDefaultSchemeLayer,
    YandexMapDefaultFeaturesLayer,
    YandexMapControls,
    YandexMapZoomControl,
    YandexMapClusterer,
    YandexMapMarker,
    getLocationFromBounds, getBoundsFromCoords
} from "vue-yandex-maps";
import RixosMarker from "./RixosMarker.vue";


const props = defineProps({
    hotelsList: { type: Array, default: [] }
});

const hotelsWithLocation = computed(() => {
    return props.hotelsList.filter(hotel => !!hotel.ee?.coordinates?.latitude);
});

const map = shallowRef(null);
const map_settings = reactive({
    location: {
        center: [37.617644, 55.755819],
        zoom: 9
    }
});
const clusterer = shallowRef(null);
const clustererGridSize = ref(90);

createYmapsOptions({ apikey: '49de5080-fb39-46f1-924b-dee5ddbad2f1' });

watchEffect(async () => {
    if (hotelsWithLocation.value.length > 1) {
        map.value?.setLocation({
            ...await getLocationFromBounds({
                bounds: getBoundsFromCoords(hotelsWithLocation.value.map(hotel => [hotel.ee.coordinates.longitude, hotel.ee.coordinates.latitude])),
                map: map.value,
                roundZoom: true,
                comfortZoomLevel: true
            }),
            duration: 750
        });
    } else if (hotelsWithLocation.value.length === 1) {
        const hotel = hotelsWithLocation.value[0];
        map_settings.location = {
            center: [hotel.coordinates.longitude, hotel.coordinates.latitude],
            zoom: 10
        };
    }
});

function hoverZIndex(e) {
    const zi = e.target.closest('ymaps').style.zIndex ?? 0;
    if (e.type === 'mouseenter') {
        e.target.closest('ymaps').style.zIndex = zi + 1;
    } else if (e.type === 'mouseleave') {
        e.target.closest('ymaps').style.zIndex = zi - 1;
    }
}

</script>

<template>
    <div class="rixos-map">
        <yandex-map v-model="map" :settings="map_settings">
            <yandex-map-default-scheme-layer/>
            <yandex-map-default-features-layer/>
            <yandex-map-controls :settings="{ position: 'right' }">
                <yandex-map-zoom-control/>
            </yandex-map-controls>

            <yandex-map-clusterer v-model="clusterer"
                                  :grid-size="clustererGridSize"
                                  zoom-on-cluster-click>
                <template #cluster="{ length, clusterer }">
                    <div class="cluster" style="cursor:pointer;">
                        <div class="hud">{{ length }}</div>
                    </div>
                </template>
                <yandex-map-marker v-for="hotel in hotelsWithLocation"
                                   :settings="{
                                            coordinates: [hotel.ee.coordinates.longitude, hotel.ee.coordinates.latitude],
                                            properties: { hotel }
                                       }"
                                   :style="{ cursor: 'pointer' }"
                                   :key="hotel.id">
                    <RixosMarker :hotel="hotel" @mouseenter="hoverZIndex" @mouseleave="hoverZIndex"/>
                </yandex-map-marker>
            </yandex-map-clusterer>
        </yandex-map>
    </div>
</template>

<style scoped lang="less">
@import "../../common/css/coral-colors";
.rixos-map {
    position: absolute;
    inset: 0;
    .cluster {
        position: relative;
        transform: translate(-50%,-50%);
        font-size: 14px;
        line-height: 1;
        width: 2.4em;
        height: 2.4em;
        &:hover {

        }
        .hud {
            position: absolute;
            inset: 0;
            display: grid;
            place-content: center;
            background-color: @brand-nav-bg;
            color: white;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 1px 2px fade(black, 20%);
        }
    }

}
</style>