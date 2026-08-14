<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { computed, onMounted, ref, watch } from 'vue';
import DestinationFilter from '@/components/flood/DestinationFilter.vue';
import FloodLegend from '@/components/flood/FloodLegend.vue';
import FloodMap from '@/components/flood/FloodMap.vue';
import ScenarioSelector from '@/components/flood/ScenarioSelector.vue';
import type { FloodScenario } from '@/components/flood/ScenarioSelector.vue';
import type {
    DestinationCategoryValue,
    DestinationFeature,
    DestinationFeatureCollection,
    DestinationSafetyFilterValue,
} from '@/types/destination';
import type { FloodRasterMetadata } from '@/types/floodRaster';

const selectedScenario = ref<FloodScenario>('moderate');
const selectedSafetyFilter = ref<DestinationSafetyFilterValue>('ALL');
const selectedCategoryFilter = ref<DestinationCategoryValue>('ALL');
const showFloodRaster = ref<boolean>(true);

const allDestinations = ref<DestinationFeature[]>([]);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

// In-memory raster metadata cache
const rasterCache = ref<Record<FloodScenario, FloodRasterMetadata | null>>({
    moderate: null,
    severe: null,
});

const activeMetadata = ref<FloodRasterMetadata | null>(null);
const activeRasterUrl = ref<string | null>(null);
const rasterLoading = ref<boolean>(false);
const rasterError = ref<string | null>(null);

const scenarioDisplayLabel = computed(() => {
    return selectedScenario.value === 'moderate' ? 'Moderate' : 'Severe';
});

const modeledMaxDepthDisplay = computed(() => {
    if (
        activeMetadata.value &&
        typeof activeMetadata.value.valid_max_depth_m === 'number'
    ) {
        return `${activeMetadata.value.valid_max_depth_m.toFixed(1)} m`;
    }

    return '--';
});

const filteredDestinations = computed(() => {
    if (!allDestinations.value || allDestinations.value.length === 0) {
        return [];
    }

    return allDestinations.value.filter((feature) => {
        // Safety Status Filter
        const safetyStatus =
            selectedScenario.value === 'moderate'
                ? feature.properties.flood_safety_moderate
                : feature.properties.flood_safety_severe;

        if (
            selectedSafetyFilter.value !== 'ALL' &&
            safetyStatus !== selectedSafetyFilter.value
        ) {
            return false;
        }

        // Category Filter
        if (selectedCategoryFilter.value !== 'ALL') {
            const cat = feature.properties.category;
            const det = feature.properties.detailed_category || '';

            if (
                selectedCategoryFilter.value ===
                'POTENTIAL_EVACUATION_DESTINATION'
            ) {
                if (cat !== 'POTENTIAL_EVACUATION_DESTINATION') {
                    return false;
                }
            } else if (selectedCategoryFilter.value === 'EMERGENCY_FACILITY') {
                if (
                    cat !== 'EMERGENCY_FACILITY' &&
                    !det.startsWith('emergency=')
                ) {
                    return false;
                }
            } else {
                if (!det.startsWith(`${selectedCategoryFilter.value}=`)) {
                    return false;
                }
            }
        }

        return true;
    });
});

const isFiltered = computed(() => {
    return (
        selectedSafetyFilter.value !== 'ALL' ||
        selectedCategoryFilter.value !== 'ALL'
    );
});

async function fetchDestinations(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
        const response = await fetch('/data/destinations.geojson');

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data: DestinationFeatureCollection = await response.json();

        if (data && Array.isArray(data.features)) {
            allDestinations.value = data.features;
        } else {
            throw new Error('Invalid GeoJSON format');
        }
    } catch (err: unknown) {
        console.error('Failed to load destination GeoJSON:', err);
        error.value = 'Unable to load destination data.';
    } finally {
        loading.value = false;
    }
}

async function loadScenarioRaster(scenario: FloodScenario): Promise<void> {
    rasterError.value = null;

    // Check in-memory metadata cache first
    if (rasterCache.value[scenario]) {
        activeMetadata.value = rasterCache.value[scenario];
        activeRasterUrl.value = `/data/flood/${scenario}/flood_depth_web.png`;

        return;
    }

    rasterLoading.value = true;

    try {
        const response = await fetch(
            `/data/flood/${scenario}/flood_depth_web.json`,
        );

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const metadata: FloodRasterMetadata = await response.json();
        rasterCache.value[scenario] = metadata;
        activeMetadata.value = metadata;
        activeRasterUrl.value = `/data/flood/${scenario}/flood_depth_web.png`;
    } catch (err: unknown) {
        console.error(`Failed to load flood metadata for ${scenario}:`, err);
        rasterError.value = 'Unable to load flood scenario raster overlay.';
    } finally {
        rasterLoading.value = false;
    }
}

watch(selectedScenario, (newScenario) => {
    loadScenarioRaster(newScenario);
});

onMounted(() => {
    fetchDestinations();
    loadScenarioRaster(selectedScenario.value);
});
</script>

<template>
    <Head title="FloodEvac Dashboard" />

    <div
        class="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100"
    >
        <!-- Top Navbar -->
        <header
            class="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-5 shadow-md backdrop-blur"
        >
            <div class="flex items-center space-x-3">
                <div
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/30"
                >
                    FE
                </div>
                <div>
                    <h1 class="text-base font-bold tracking-tight text-white">
                        FloodEvac
                    </h1>
                    <p class="text-[10px] text-slate-400">
                        Flood-Aware Evacuation Routing System
                    </p>
                </div>
            </div>

            <div class="flex items-center space-x-3">
                <div
                    class="flex items-center space-x-2 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs shadow-inner"
                >
                    <span class="text-slate-400">Scenario:</span>
                    <span
                        :class="[
                            'font-semibold capitalize',
                            selectedScenario === 'moderate'
                                ? 'text-amber-400'
                                : 'text-rose-400',
                        ]"
                    >
                        {{ scenarioDisplayLabel }}
                    </span>
                </div>
                <div class="text-xs text-slate-400">Medan Viewport</div>
            </div>
        </header>

        <!-- Main Content Area -->
        <div class="flex min-h-0 flex-1">
            <!-- Sidebar / Control Panel -->
            <aside
                class="flex w-80 shrink-0 flex-col space-y-4 overflow-y-auto border-r border-slate-800 bg-slate-900/60 p-4 lg:w-96"
            >
                <div class="border-b border-slate-800 pb-2">
                    <h2
                        class="text-xs font-semibold tracking-wider text-slate-400 uppercase"
                    >
                        Control Panel
                    </h2>
                </div>

                <!-- Scenario Selector -->
                <ScenarioSelector v-model="selectedScenario" />

                <!-- Flood Overlay Toggle Card -->
                <div
                    class="rounded-xl border border-slate-700 bg-slate-800/80 p-4 shadow-lg backdrop-blur-sm"
                >
                    <div class="flex items-center justify-between">
                        <div>
                            <h3
                                class="text-sm font-semibold tracking-wider text-slate-300 uppercase"
                            >
                                Flood Hazard Overlay
                            </h3>
                            <p class="text-xs text-slate-400">
                                Toggle flood depth raster layer
                            </p>
                        </div>
                        <label
                            class="relative inline-flex cursor-pointer items-center"
                        >
                            <input
                                v-model="showFloodRaster"
                                type="checkbox"
                                class="peer sr-only"
                            />
                            <div
                                class="peer h-6 w-11 rounded-full bg-slate-700 peer-checked:bg-blue-600 peer-focus:outline-none after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"
                            ></div>
                        </label>
                    </div>
                </div>

                <!-- Scenario Information Card -->
                <div
                    class="rounded-xl border border-slate-700 bg-slate-800/80 p-4 shadow-lg backdrop-blur-sm"
                >
                    <div class="flex items-center justify-between">
                        <h3
                            class="text-sm font-semibold tracking-wider text-slate-300 uppercase"
                        >
                            Scenario Information
                        </h3>
                        <span
                            class="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300 capitalize"
                        >
                            {{ scenarioDisplayLabel }}
                        </span>
                    </div>

                    <div class="mt-3 space-y-2">
                        <div>
                            <span
                                class="block text-[11px] font-medium text-slate-400"
                            >
                                Modeled maximum depth
                            </span>
                            <span class="text-xl font-extrabold text-white">
                                {{ modeledMaxDepthDisplay }}
                            </span>
                        </div>
                        <p class="text-[11px] leading-tight text-slate-400">
                            Scenario-based flood visualization derivative.
                        </p>
                    </div>
                </div>

                <!-- Destinations Counter Summary Card -->
                <div
                    class="rounded-xl border border-slate-700 bg-slate-800/80 p-4 shadow-lg backdrop-blur-sm"
                >
                    <div class="flex items-center justify-between">
                        <h3
                            class="text-sm font-semibold tracking-wider text-slate-300 uppercase"
                        >
                            Evacuation Destinations
                        </h3>
                        <span
                            v-if="loading"
                            class="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300"
                        >
                            Loading...
                        </span>
                        <span
                            v-else-if="error"
                            class="rounded bg-rose-900/80 px-2 py-0.5 text-[10px] text-rose-200"
                        >
                            Error
                        </span>
                        <span
                            v-else
                            class="rounded border border-blue-800 bg-blue-950 px-2 py-0.5 text-[10px] font-semibold text-blue-300"
                        >
                            GeoJSON
                        </span>
                    </div>

                    <div class="mt-3">
                        <div
                            v-if="loading"
                            class="animate-pulse text-xs text-slate-400"
                        >
                            Loading destination data...
                        </div>
                        <div v-else-if="error" class="text-xs text-rose-400">
                            Unable to load destination data.
                        </div>
                        <div v-else class="flex flex-col">
                            <div class="flex items-baseline space-x-2">
                                <span
                                    class="text-2xl font-extrabold text-white"
                                >
                                    {{
                                        filteredDestinations.length.toLocaleString()
                                    }}
                                </span>
                                <span class="text-xs text-slate-400">
                                    {{
                                        isFiltered
                                            ? `of ${allDestinations.length.toLocaleString()}`
                                            : 'candidates'
                                    }}
                                </span>
                            </div>

                            <p class="mt-1 text-xs text-slate-400">
                                {{
                                    isFiltered
                                        ? `Showing ${filteredDestinations.length.toLocaleString()} of ${allDestinations.length.toLocaleString()}`
                                        : `${allDestinations.length.toLocaleString()} destinations loaded`
                                }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Destination Filters -->
                <DestinationFilter
                    v-model:safety-filter="selectedSafetyFilter"
                    v-model:category-filter="selectedCategoryFilter"
                />

                <!-- Flood Status Legend -->
                <FloodLegend />
            </aside>

            <!-- Map Viewport -->
            <main class="relative min-h-0 flex-1">
                <FloodMap
                    :destinations="filteredDestinations"
                    :scenario="selectedScenario"
                    :loading="loading"
                    :error="error || rasterError"
                    :flood-metadata="activeMetadata"
                    :flood-overlay-url="activeRasterUrl"
                    :show-flood-raster="showFloodRaster"
                    :raster-loading="rasterLoading"
                />
            </main>
        </div>
    </div>
</template>
