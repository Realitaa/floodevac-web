<script setup lang="ts">
import L from 'leaflet';
import { onMounted, onUnmounted, ref } from 'vue';

const mapContainer = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;

const MEDAN_CENTER: [number, number] = [3.5952, 98.6722];
const INITIAL_ZOOM = 13;

function handleResize(): void {
    if (map) {
        map.invalidateSize();
    }
}

onMounted(() => {
    if (!mapContainer.value) {
        return;
    }

    map = L.map(mapContainer.value, {
        center: MEDAN_CENTER,
        zoom: INITIAL_ZOOM,
        zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);

    if (map) {
        map.remove();
        map = null;
    }
});
</script>

<template>
    <div class="relative h-full min-h-0 w-full">
        <div ref="mapContainer" class="z-0 h-full w-full bg-slate-900"></div>
    </div>
</template>
