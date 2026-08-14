<script setup lang="ts">
import L from 'leaflet';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import type { FloodScenario } from '@/components/flood/ScenarioSelector.vue';
import type {
    DestinationFeature,
    FloodSafetyStatus,
} from '@/types/destination';
import type { FloodRasterMetadata } from '@/types/floodRaster';
import type { RouteGeoJSON, RouteMetadata } from '@/types/route';

const props = withDefaults(
    defineProps<{
        destinations?: DestinationFeature[];
        scenario?: FloodScenario;
        loading?: boolean;
        error?: string | null;
        floodMetadata?: FloodRasterMetadata | null;
        floodOverlayUrl?: string | null;
        showFloodRaster?: boolean;
        rasterLoading?: boolean;
        routeGeoJson?: RouteGeoJSON | null;
        routeMetadata?: RouteMetadata | null;
        showRoute?: boolean;
        routeLoading?: boolean;
        routeError?: string | null;
    }>(),
    {
        destinations: () => [],
        scenario: 'moderate',
        loading: false,
        error: null,
        floodMetadata: null,
        floodOverlayUrl: null,
        showFloodRaster: true,
        rasterLoading: false,
        routeGeoJson: null,
        routeMetadata: null,
        showRoute: true,
        routeLoading: false,
        routeError: null,
    },
);

const mapContainer = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let destinationLayerGroup: L.LayerGroup | null = null;
let routeLayerGroup: L.LayerGroup | null = null;
let activeImageOverlay: L.ImageOverlay | null = null;

const MEDAN_CENTER: [number, number] = [3.5952, 98.6722];
const INITIAL_ZOOM = 13;

function getStatusStyle(status: FloodSafetyStatus): {
    color: string;
    fillColor: string;
} {
    switch (status) {
        case 'SAFE':
            return { color: '#059669', fillColor: '#10b981' };
        case 'AT_RISK':
            return { color: '#d97706', fillColor: '#f59e0b' };
        case 'FLOODED':
            return { color: '#be123c', fillColor: '#e11d48' };
        case 'NO_DATA':
        default:
            return { color: '#475569', fillColor: '#64748b' };
    }
}

function formatCategoryLabel(
    category: string,
    detailedCategory: string,
): string {
    if (category === 'EMERGENCY_FACILITY') {
        return 'Emergency Facility';
    }

    if (detailedCategory.startsWith('education=')) {
        return 'Educational Facility';
    }

    if (detailedCategory.startsWith('healthcare=')) {
        return 'Healthcare Facility';
    }

    if (detailedCategory.startsWith('worship=')) {
        return 'Place of Worship';
    }

    if (detailedCategory.startsWith('civic=')) {
        return 'Civic / Community Facility';
    }

    if (detailedCategory.startsWith('sports=')) {
        return 'Sports / Recreation Facility';
    }

    return 'Potential Evacuation Destination';
}

function formatNetworkAccess(status: string): string {
    if (status === 'WITHIN_NETWORK_ACCESS') {
        return 'Within Network Access';
    }

    return status;
}

function createPopupContent(
    feature: DestinationFeature,
    scenario: FloodScenario,
): string {
    const propsData = feature.properties;
    const name =
        propsData.name && propsData.name.trim()
            ? propsData.name
            : 'Unnamed Facility';
    const categoryLabel = formatCategoryLabel(
        propsData.category,
        propsData.detailed_category,
    );
    const safety =
        scenario === 'moderate'
            ? propsData.flood_safety_moderate
            : propsData.flood_safety_severe;
    const networkAccess = formatNetworkAccess(propsData.network_access_status);
    const roadDist = propsData.nearest_node_distance_m.toFixed(1);

    const safetyColorClass =
        safety === 'SAFE'
            ? 'color: #10b981;'
            : safety === 'AT_RISK'
              ? 'color: #f59e0b;'
              : safety === 'FLOODED'
                ? 'color: #e11d48;'
                : 'color: #94a3b8;';

    const scenarioLabel =
        scenario === 'moderate' ? 'Moderate Safety' : 'Severe Safety';

    return `
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; padding: 2px 0;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #0f172a;">
                ${name}
            </div>
            <div style="margin-bottom: 4px;">
                <span style="color: #64748b; font-size: 11px;">Category:</span><br/>
                <span style="font-weight: 600; color: #334155;">${categoryLabel}</span>
            </div>
            <div style="margin-bottom: 4px;">
                <span style="color: #64748b; font-size: 11px;">${scenarioLabel}:</span><br/>
                <span style="font-weight: 700; ${safetyColorClass}">${safety}</span>
            </div>
            <div style="margin-bottom: 4px;">
                <span style="color: #64748b; font-size: 11px;">Road Access:</span><br/>
                <span style="font-weight: 500; color: #334155;">${networkAccess}</span>
            </div>
            <div>
                <span style="color: #64748b; font-size: 11px;">Nearest Road:</span><br/>
                <span style="font-weight: 600; color: #334155;">${roadDist} m</span>
            </div>
        </div>
    `;
}

function updateLayers(): void {
    if (!map) {
        return;
    }

    // 1. Update Flood Overlay
    if (activeImageOverlay) {
        map.removeLayer(activeImageOverlay);
        activeImageOverlay = null;
    }

    if (
        props.showFloodRaster &&
        props.floodMetadata &&
        props.floodOverlayUrl &&
        props.floodMetadata.leaflet_bounds
    ) {
        const bounds = L.latLngBounds(props.floodMetadata.leaflet_bounds);
        activeImageOverlay = L.imageOverlay(props.floodOverlayUrl, bounds, {
            opacity: 0.85,
        });
        activeImageOverlay.addTo(map);
    }

    // 2. Update Route Layer Group
    if (routeLayerGroup) {
        routeLayerGroup.clearLayers();

        if (
            props.showRoute &&
            props.routeGeoJson &&
            Array.isArray(props.routeGeoJson.features) &&
            props.routeGeoJson.features.length > 0
        ) {
            props.routeGeoJson.features.forEach((feature) => {
                if (
                    feature.geometry &&
                    feature.geometry.type === 'LineString' &&
                    Array.isArray(feature.geometry.coordinates) &&
                    feature.geometry.coordinates.length > 0
                ) {
                    // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
                    const latLngs: [number, number][] =
                        feature.geometry.coordinates.map((coord) => [
                            coord[1],
                            coord[0],
                        ]);

                    // Outer Casing for high-visibility contrast
                    const outerPolyline = L.polyline(latLngs, {
                        color: '#0284c7',
                        weight: 7,
                        opacity: 0.9,
                        lineCap: 'round',
                        lineJoin: 'round',
                    });

                    // Inner Line
                    const innerPolyline = L.polyline(latLngs, {
                        color: '#38bdf8',
                        weight: 4,
                        opacity: 1.0,
                        lineCap: 'round',
                        lineJoin: 'round',
                    });

                    routeLayerGroup?.addLayer(outerPolyline);
                    routeLayerGroup?.addLayer(innerPolyline);

                    // Origin Endpoint Marker
                    const startCoords = latLngs[0];
                    const originMarker = L.circleMarker(startCoords, {
                        radius: 7,
                        color: '#0284c7',
                        fillColor: '#38bdf8',
                        fillOpacity: 1,
                        weight: 2,
                    });
                    originMarker.bindPopup(`
                        <div style="font-family: inherit; font-size: 12px; padding: 2px 0;">
                            <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
                                Evacuation Origin
                            </div>
                            <div style="font-size: 11px; color: #64748b;">
                                Starting node for scenario route
                            </div>
                        </div>
                    `);
                    routeLayerGroup?.addLayer(originMarker);

                    // Destination Endpoint Marker
                    const endCoords = latLngs[latLngs.length - 1];
                    const destMarker = L.circleMarker(endCoords, {
                        radius: 7,
                        color: '#059669',
                        fillColor: '#10b981',
                        fillOpacity: 1,
                        weight: 2,
                    });
                    destMarker.bindPopup(`
                        <div style="font-family: inherit; font-size: 12px; padding: 2px 0;">
                            <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
                                Potential Evacuation Destination
                            </div>
                            <div style="font-size: 11px; color: #64748b;">
                                Target candidate facility
                            </div>
                        </div>
                    `);
                    routeLayerGroup?.addLayer(destMarker);
                }
            });
        }

        // Re-add routeLayerGroup to map to preserve z-index order above flood overlay
        routeLayerGroup.remove();
        routeLayerGroup.addTo(map);
    }

    // 3. Update Destination Markers (sit above route layer)
    if (destinationLayerGroup) {
        destinationLayerGroup.clearLayers();

        if (props.destinations && props.destinations.length > 0) {
            props.destinations.forEach((feature) => {
                const coords = feature.geometry.coordinates; // [lng, lat]
                const latLng: [number, number] = [coords[1], coords[0]];

                const safetyStatus =
                    props.scenario === 'moderate'
                        ? feature.properties.flood_safety_moderate
                        : feature.properties.flood_safety_severe;

                const style = getStatusStyle(safetyStatus);

                const marker = L.circleMarker(latLng, {
                    radius: 5,
                    color: style.color,
                    fillColor: style.fillColor,
                    fillOpacity: 0.85,
                    weight: 1.5,
                });

                const popupContent = createPopupContent(
                    feature,
                    props.scenario,
                );
                marker.bindPopup(popupContent, { maxWidth: 260 });

                destinationLayerGroup?.addLayer(marker);
            });
        }

        destinationLayerGroup.remove();
        destinationLayerGroup.addTo(map);
    }
}

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

    routeLayerGroup = L.layerGroup().addTo(map);
    destinationLayerGroup = L.layerGroup().addTo(map);

    window.addEventListener('resize', handleResize);

    updateLayers();
});

watch(
    () => [
        props.destinations,
        props.scenario,
        props.floodMetadata,
        props.floodOverlayUrl,
        props.showFloodRaster,
        props.routeGeoJson,
        props.showRoute,
    ],
    () => {
        updateLayers();
    },
    { deep: true },
);

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);

    if (activeImageOverlay && map) {
        map.removeLayer(activeImageOverlay);
        activeImageOverlay = null;
    }

    if (routeLayerGroup) {
        routeLayerGroup.clearLayers();
        routeLayerGroup = null;
    }

    if (destinationLayerGroup) {
        destinationLayerGroup.clearLayers();
        destinationLayerGroup = null;
    }

    if (map) {
        map.remove();
        map = null;
    }
});
</script>

<template>
    <div class="relative h-full min-h-0 w-full">
        <div ref="mapContainer" class="z-0 h-full w-full bg-slate-900"></div>

        <!-- Overlay Status Notification -->
        <div
            v-if="loading || rasterLoading || routeLoading"
            class="absolute top-4 right-4 z-[1000] flex items-center space-x-2 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-200 shadow-xl backdrop-blur"
        >
            <svg
                class="h-4 w-4 animate-spin text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                ></circle>
                <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            <span>{{
                loading
                    ? 'Loading destinations...'
                    : rasterLoading
                      ? 'Loading flood scenario...'
                      : 'Loading route...'
            }}</span>
        </div>

        <div
            v-else-if="error || routeError"
            class="absolute top-4 right-4 z-[1000] flex items-center space-x-2 rounded-lg border border-rose-800/80 bg-rose-950/90 px-3 py-2 text-xs font-medium text-rose-200 shadow-xl backdrop-blur"
        >
            <span>{{ error || routeError }}</span>
        </div>
    </div>
</template>
