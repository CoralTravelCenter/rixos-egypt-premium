import { ref, watch } from "vue";

export const openedMapMarker = ref();

watch(openedMapMarker, (newMarker, oldMarker) => oldMarker?.exposed.hide());