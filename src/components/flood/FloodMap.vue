<script setup lang="ts">
import L from 'leaflet';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import type { FloodScenario } from '@/components/flood/ScenarioSelector.vue';
import type {
    DestinationFeature,
    FloodSafetyStatus,
} from '@/types/destination';
import type { FloodRasterMetadata } from '@/types/floodRaster';
import type { DestinationRouteArtifact, RouteDisplayMode } from '@/types/route';

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
        routeDisplayMode?: RouteDisplayMode;
        selectedDestinationRouteModerate?: DestinationRouteArtifact | null;
        selectedDestinationRouteSevere?: DestinationRouteArtifact | null;
        routeLoading?: boolean;
        routeError?: string | null;
        selectedDestinationId?: string | null;
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
        routeDisplayMode: 'ACTIVE_SCENARIO',
        selectedDestinationRouteModerate: null,
        selectedDestinationRouteSevere: null,
        routeLoading: false,
        routeError: null,
        selectedDestinationId: null,
    },
);

const emit = defineEmits<{
    (e: 'show-destination-route', facilityId: string): void;
}>();

const mapContainer = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let destinationLayerGroup: L.LayerGroup | null = null;
let moderateRouteLayerGroup: L.LayerGroup | null = null;
let severeRouteLayerGroup: L.LayerGroup | null = null;
let endpointLayerGroup: L.LayerGroup | null = null;
let activeImageOverlay: L.ImageOverlay | null = null;

const destinationMarkerMap = new Map<
    string,
    { marker: L.CircleMarker; feature: DestinationFeature }
>();
let currentlySelectedId: string | null = null;

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
    const facilityId = propsData.facility_id;

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
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px; color: #0f172a;">
                ${name}
            </div>
            <div style="font-size: 10px; color: #64748b; margin-bottom: 6px; font-family: monospace;">
                ${facilityId}
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
                <span style="font-weight: 500; color: #334155;">${networkAccess} (${roadDist} m)</span>
            </div>
            <div style="margin-top: 8px;">
                <button
                    type="button"
                    class="js-show-route-btn"
                    data-facility-id="${facilityId}"
                    style="width: 100%; background-color: #2563eb; color: #ffffff; border: none; border-radius: 6px; padding: 6px 10px; font-size: 11px; font-weight: 700; cursor: pointer;"
                >
                    Show Flood-Aware Route
                </button>
            </div>
        </div>
    `;
}

function updateFloodOverlay(): void {
    if (!map) {
        return;
    }

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
}

function renderRouteLineString(
    layerGroup: L.LayerGroup,
    routeArtifact: DestinationRouteArtifact,
    style: { casingColor: string; innerColor: string; dashArray?: string },
): [number, number][] | null {
    if (
        !routeArtifact ||
        !routeArtifact.reachable ||
        !routeArtifact.geometry ||
        !Array.isArray(routeArtifact.geometry.coordinates) ||
        routeArtifact.geometry.coordinates.length < 2
    ) {
        return null;
    }

    const latLngs: [number, number][] = routeArtifact.geometry.coordinates.map(
        (coord) => [coord[1], coord[0]],
    );

    const outerPolyline = L.polyline(latLngs, {
        color: style.casingColor,
        weight: 8,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
    });

    const innerPolyline = L.polyline(latLngs, {
        color: style.innerColor,
        weight: 4,
        opacity: 1.0,
        dashArray: style.dashArray,
        lineCap: 'round',
        lineJoin: 'round',
    });

    layerGroup.addLayer(outerPolyline);
    layerGroup.addLayer(innerPolyline);

    return latLngs;
}

function updateRouteLayers(): void {
    if (
        !map ||
        !moderateRouteLayerGroup ||
        !severeRouteLayerGroup ||
        !endpointLayerGroup
    ) {
        return;
    }

    moderateRouteLayerGroup.clearLayers();
    severeRouteLayerGroup.clearLayers();
    endpointLayerGroup.clearLayers();

    if (props.routeDisplayMode === 'HIDDEN') {
        moderateRouteLayerGroup.remove();
        severeRouteLayerGroup.remove();
        endpointLayerGroup.remove();

        return;
    }

    const moderateStyle = {
        casingColor: '#0284c7',
        innerColor: '#38bdf8',
        dashArray: undefined,
    };

    const severeStyle = {
        casingColor: '#b91c1c',
        innerColor: '#f87171',
        dashArray: '8, 8',
    };

    let activeLatLngs: [number, number][] | null = null;

    if (props.routeDisplayMode === 'ACTIVE_SCENARIO') {
        if (
            props.scenario === 'moderate' &&
            props.selectedDestinationRouteModerate
        ) {
            activeLatLngs = renderRouteLineString(
                moderateRouteLayerGroup,
                props.selectedDestinationRouteModerate,
                moderateStyle,
            );
            moderateRouteLayerGroup.addTo(map);
            severeRouteLayerGroup.remove();
        } else if (
            props.scenario === 'severe' &&
            props.selectedDestinationRouteSevere
        ) {
            activeLatLngs = renderRouteLineString(
                severeRouteLayerGroup,
                props.selectedDestinationRouteSevere,
                severeStyle,
            );
            severeRouteLayerGroup.addTo(map);
            moderateRouteLayerGroup.remove();
        }
    } else if (props.routeDisplayMode === 'COMPARE_BOTH') {
        let modLatLngs: [number, number][] | null = null;
        let sevLatLngs: [number, number][] | null = null;

        if (props.selectedDestinationRouteModerate) {
            modLatLngs = renderRouteLineString(
                moderateRouteLayerGroup,
                props.selectedDestinationRouteModerate,
                moderateStyle,
            );
        }

        if (props.selectedDestinationRouteSevere) {
            sevLatLngs = renderRouteLineString(
                severeRouteLayerGroup,
                props.selectedDestinationRouteSevere,
                severeStyle,
            );
        }

        moderateRouteLayerGroup.addTo(map);
        severeRouteLayerGroup.addTo(map);

        activeLatLngs = sevLatLngs || modLatLngs;
    }

    // Render single non-duplicated Endpoint Markers if route geometry exists
    if (activeLatLngs && activeLatLngs.length >= 2) {
        const startCoords = activeLatLngs[0];
        const endCoords = activeLatLngs[activeLatLngs.length - 1];

        if (!startCoords || !endCoords) {
            return;
        }

        // Red Pin Marker for Evacuation Origin
        const redOriginIcon = L.divIcon({
            className: 'custom-red-origin-pin bg-transparent border-0',
            html: `
                <div style="position: relative; width: 32px; height: 42px; filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.5));">
                    <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.16344 24.8366 0 16 0Z" fill="#B91C1C"/>
                        <path d="M16 2C8.26801 2 2 8.26801 2 16C2 26.5 16 39.5 16 39.5C16 39.5 30 26.5 30 16C30 8.26801 23.732 2 16 2Z" fill="#EF4444"/>
                        <circle cx="16" cy="15" r="6" fill="#FFFFFF"/>
                        <circle cx="16" cy="15" r="3.5" fill="#7F1D1D"/>
                    </svg>
                </div>
            `,
            iconSize: [32, 42],
            iconAnchor: [16, 42],
            popupAnchor: [0, -42],
        });

        const originMarker = L.marker(startCoords, {
            icon: redOriginIcon,
            zIndexOffset: 1000,
        });

        originMarker.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; padding: 2px 0;">
                <div style="font-weight: 700; font-size: 13px; color: #991b1b; margin-bottom: 2px;">
                    Evacuation Origin
                </div>
                <div style="font-size: 11px; color: #64748b;">
                    Fixed starting origin for evacuation routing
                </div>
            </div>
        `);
        endpointLayerGroup.addLayer(originMarker);

        // Destination Endpoint Marker
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
                    Selected candidate facility
                </div>
            </div>
        `);
        endpointLayerGroup.addLayer(destMarker);
        endpointLayerGroup.addTo(map);
    }
}

function updateDestinationMarkers(): void {
    if (!destinationLayerGroup) {
        return;
    }

    destinationLayerGroup.clearLayers();
    destinationMarkerMap.clear();

    if (!props.destinations || props.destinations.length === 0) {
        return;
    }

    props.destinations.forEach((feature) => {
        const coords = feature.geometry.coordinates; // [lng, lat]
        const latLng: [number, number] = [coords[1], coords[0]];
        const facilityId = feature.properties.facility_id;

        const safetyStatus =
            props.scenario === 'moderate'
                ? feature.properties.flood_safety_moderate
                : feature.properties.flood_safety_severe;

        const style = getStatusStyle(safetyStatus);
        const isSelected = props.selectedDestinationId === facilityId;

        const marker = L.circleMarker(latLng, {
            radius: isSelected ? 9 : 4.5,
            color: isSelected ? '#ffffff' : style.color,
            fillColor: style.fillColor,
            fillOpacity: isSelected ? 1 : 0.85,
            weight: isSelected ? 3 : 1.5,
        });

        const popupContent = createPopupContent(feature, props.scenario);
        marker.bindPopup(popupContent, { maxWidth: 260 });

        destinationLayerGroup?.addLayer(marker);
        destinationMarkerMap.set(facilityId, { marker, feature });

        if (isSelected) {
            currentlySelectedId = facilityId;
            marker.bringToFront();
            marker.openPopup();
        }
    });

    if (map) {
        destinationLayerGroup.remove();
        destinationLayerGroup.addTo(map);
    }
}

function handleSelectionChange(newSelectedId: string | null): void {
    if (!map) {
        return;
    }

    if (currentlySelectedId && destinationMarkerMap.has(currentlySelectedId)) {
        const prev = destinationMarkerMap.get(currentlySelectedId)!;
        const safetyStatus =
            props.scenario === 'moderate'
                ? prev.feature.properties.flood_safety_moderate
                : prev.feature.properties.flood_safety_severe;
        const normalStyle = getStatusStyle(safetyStatus);

        prev.marker.setStyle({
            radius: 4.5,
            color: normalStyle.color,
            fillColor: normalStyle.fillColor,
            fillOpacity: 0.85,
            weight: 1.5,
        });
    }

    currentlySelectedId = newSelectedId;

    if (newSelectedId && destinationMarkerMap.has(newSelectedId)) {
        const current = destinationMarkerMap.get(newSelectedId)!;
        const coords = current.feature.geometry.coordinates; // [lng, lat]
        const latLng: [number, number] = [coords[1], coords[0]];

        const safetyStatus =
            props.scenario === 'moderate'
                ? current.feature.properties.flood_safety_moderate
                : current.feature.properties.flood_safety_severe;
        const normalStyle = getStatusStyle(safetyStatus);

        current.marker.setStyle({
            radius: 9,
            color: '#ffffff',
            fillColor: normalStyle.fillColor,
            fillOpacity: 1,
            weight: 3,
        });

        current.marker.bringToFront();
        map.panTo(latLng);
        current.marker.openPopup();
    }
}

function handlePopupClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;

    if (target && target.classList.contains('js-show-route-btn')) {
        const facilityId = target.getAttribute('data-facility-id');

        if (facilityId) {
            emit('show-destination-route', facilityId);
        }
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

    moderateRouteLayerGroup = L.layerGroup().addTo(map);
    severeRouteLayerGroup = L.layerGroup().addTo(map);
    endpointLayerGroup = L.layerGroup().addTo(map);
    destinationLayerGroup = L.layerGroup().addTo(map);

    window.addEventListener('resize', handleResize);

    // Event listener for popup action button
    if (mapContainer.value) {
        mapContainer.value.addEventListener('click', handlePopupClick);
    }

    updateFloodOverlay();
    updateRouteLayers();
    updateDestinationMarkers();

    if (props.selectedDestinationId) {
        handleSelectionChange(props.selectedDestinationId);
    }
});

watch(
    () => [props.destinations, props.scenario],
    () => {
        updateDestinationMarkers();
    },
    { deep: true },
);

watch(
    () => [
        props.floodMetadata,
        props.floodOverlayUrl,
        props.showFloodRaster,
        props.scenario,
    ],
    () => {
        updateFloodOverlay();
    },
    { deep: true },
);

watch(
    () => [
        props.selectedDestinationRouteModerate,
        props.selectedDestinationRouteSevere,
        props.routeDisplayMode,
        props.scenario,
    ],
    () => {
        updateRouteLayers();
    },
    { deep: true },
);

watch(
    () => props.selectedDestinationId,
    (newVal) => {
        handleSelectionChange(newVal || null);
    },
);

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);

    if (mapContainer.value) {
        mapContainer.value.removeEventListener('click', handlePopupClick);
    }

    if (activeImageOverlay && map) {
        map.removeLayer(activeImageOverlay);
        activeImageOverlay = null;
    }

    if (moderateRouteLayerGroup) {
        moderateRouteLayerGroup.clearLayers();
        moderateRouteLayerGroup = null;
    }

    if (severeRouteLayerGroup) {
        severeRouteLayerGroup.clearLayers();
        severeRouteLayerGroup = null;
    }

    if (endpointLayerGroup) {
        endpointLayerGroup.clearLayers();
        endpointLayerGroup = null;
    }

    if (destinationLayerGroup) {
        destinationLayerGroup.clearLayers();
        destinationLayerGroup = null;
    }

    destinationMarkerMap.clear();

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
                    ? 'Loading evacuation destinations...'
                    : rasterLoading
                      ? 'Loading flood depth...'
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
