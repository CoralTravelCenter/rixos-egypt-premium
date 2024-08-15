<script setup>
import { reactive, ref, shallowRef } from "vue";

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


const props = defineProps({
    hotelsList: { type: Array, default: [] }
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

</script>

<template>
    <div class="rixos-map">
        <yandex-map v-model="map" :settings="map_settings">
            <yandex-map-default-scheme-layer/>
            <yandex-map-default-features-layer/>
            <yandex-map-controls :settings="{ position: 'right' }">
                <yandex-map-zoom-control/>
            </yandex-map-controls>
        </yandex-map>
    </div>
</template>

<style scoped lang="less">
.rixos-map {
    position: absolute;
    inset: 0;
}
</style>