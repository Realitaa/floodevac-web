<script setup lang="ts">
import { computed } from 'vue';
import type { DestinationFeature } from '@/types/destination';
import type {
    DestinationRouteArtifact,
    DestinationRouteComparison,
    RouteDisplayMode,
    RouteScenario,
} from '@/types/route';

const props = defineProps<{
    selectedDestination: DestinationFeature | null;
    displayMode: RouteDisplayMode;
    scenario: RouteScenario;
    routeArtifact: DestinationRouteArtifact | null;
    comparison: DestinationRouteComparison | null;
    moderateArtifact?: DestinationRouteArtifact | null;
    severeArtifact?: DestinationRouteArtifact | null;
    loading?: boolean;
    error?: string | null;
}>();

const emit = defineEmits<{
    (e: 'update:displayMode', value: RouteDisplayMode): void;
}>();

const scenarioLabel = computed(() =>
    props.scenario === 'moderate' ? 'Moderate' : 'Severe',
);

function selectMode(mode: RouteDisplayMode): void {
    if (props.displayMode !== mode) {
        emit('update:displayMode', mode);
    }
}
</script>

<template>
    <div
        class="rounded-xl border border-slate-700 bg-slate-800/80 p-4 shadow-lg backdrop-blur-sm"
    >
        <div class="mb-3 border-b border-slate-700/60 pb-2">
            <h3
                class="text-sm font-semibold tracking-wider text-slate-300 uppercase"
            >
                Flood-Aware Route
            </h3>
            <p class="text-xs text-slate-400">
                {{
                    selectedDestination
                        ? selectedDestination.properties.name ||
                          selectedDestination.properties.facility_id
                        : 'Evacuation pathway visualization'
                }}
            </p>
        </div>

        <!-- Mode Selector Segmented Buttons -->
        <div
            class="mb-3.5 grid grid-cols-3 gap-1 rounded-lg border border-slate-700 bg-slate-900/80 p-1 text-center"
        >
            <button
                type="button"
                :class="[
                    'rounded-md py-1 text-[11px] font-semibold transition-all duration-150',
                    displayMode === 'ACTIVE_SCENARIO'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200',
                ]"
                @click="selectMode('ACTIVE_SCENARIO')"
            >
                Active Scenario
            </button>
            <button
                type="button"
                :class="[
                    'rounded-md py-1 text-[11px] font-semibold transition-all duration-150',
                    displayMode === 'COMPARE_BOTH'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200',
                ]"
                @click="selectMode('COMPARE_BOTH')"
            >
                Compare Both
            </button>
            <button
                type="button"
                :class="[
                    'rounded-md py-1 text-[11px] font-semibold transition-all duration-150',
                    displayMode === 'HIDDEN'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200',
                ]"
                @click="selectMode('HIDDEN')"
            >
                Hide
            </button>
        </div>

        <div class="mt-2">
            <!-- Loading State -->
            <div
                v-if="loading"
                class="animate-pulse py-2 text-xs text-slate-400"
            >
                Loading route artifact...
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="py-2 text-xs text-rose-400">
                Route data is not available for this destination.
            </div>

            <!-- Empty Selection State -->
            <div
                v-else-if="!selectedDestination"
                class="py-2 text-center text-xs text-slate-400"
            >
                {{
                    displayMode === 'COMPARE_BOTH'
                        ? 'Select a destination to compare its routes.'
                        : 'Select a destination to view its Flood-Aware Route.'
                }}
            </div>

            <!-- Mode 1: ACTIVE_SCENARIO -->
            <div
                v-else-if="displayMode === 'ACTIVE_SCENARIO' && routeArtifact"
                class="space-y-3"
            >
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-xs font-medium text-slate-300">{{
                            scenarioLabel
                        }}</span>
                        <span
                            :class="[
                                'rounded px-2 py-0.5 text-[10px] font-bold tracking-wide',
                                routeArtifact.reachable
                                    ? 'border border-emerald-800 bg-emerald-950 text-emerald-400'
                                    : 'border border-rose-800 bg-rose-950 text-rose-400',
                            ]"
                        >
                            {{
                                routeArtifact.reachable
                                    ? 'REACHABLE'
                                    : 'UNREACHABLE'
                            }}
                        </span>
                    </div>

                    <span
                        v-if="
                            comparison &&
                            comparison.route_changed &&
                            scenario === 'severe'
                        "
                        class="rounded border border-amber-800 bg-amber-950 px-2 py-0.5 text-[10px] font-medium text-amber-300"
                    >
                        Route Changed
                    </span>
                </div>

                <!-- Reachable Metrics Grid -->
                <div
                    v-if="routeArtifact.reachable"
                    class="grid grid-cols-3 gap-2 rounded-lg bg-slate-900/60 p-2.5 text-center"
                >
                    <div>
                        <span class="block text-[10px] text-slate-400 uppercase"
                            >Distance</span
                        >
                        <span class="text-xs font-extrabold text-white">
                            {{
                                routeArtifact.route_distance_km?.toFixed(2) ??
                                '--'
                            }}
                            km
                        </span>
                    </div>
                    <div>
                        <span class="block text-[10px] text-slate-400 uppercase"
                            >Est. Time</span
                        >
                        <span class="text-xs font-extrabold text-white">
                            {{
                                routeArtifact.estimated_travel_time_min?.toFixed(
                                    2,
                                ) ?? '--'
                            }}
                            min
                        </span>
                    </div>
                    <div>
                        <span
                            class="block text-[10px] font-normal text-slate-400 uppercase"
                        >
                            Flood Exposure
                        </span>
                        <span class="text-xs font-extrabold text-emerald-400">
                            {{
                                routeArtifact.flood_exposed_length_m?.toFixed(
                                    1,
                                ) ?? '0.0'
                            }}
                            m
                        </span>
                    </div>
                </div>

                <!-- Unreachable Warning Box -->
                <div
                    v-else
                    class="rounded-lg border border-rose-900/60 bg-rose-950/40 p-2.5 text-center text-xs text-rose-300"
                >
                    Destination is unreachable under this scenario.
                </div>
            </div>

            <!-- Mode 2: COMPARE_BOTH -->
            <div
                v-else-if="
                    displayMode === 'COMPARE_BOTH' && selectedDestination
                "
                class="space-y-3"
            >
                <div class="space-y-2 rounded-lg bg-slate-900/60 p-2.5 text-xs">
                    <div
                        class="flex items-center justify-between border-b border-slate-800 pb-1.5"
                    >
                        <div class="flex items-center space-x-2">
                            <span
                                class="h-2 w-2 rounded-full bg-sky-400"
                            ></span>
                            <span class="text-slate-300">Moderate:</span>
                        </div>
                        <span class="font-bold text-white">
                            {{
                                moderateArtifact && moderateArtifact.reachable
                                    ? `${moderateArtifact.route_distance_km?.toFixed(2)} km · ${moderateArtifact.estimated_travel_time_min?.toFixed(2)} min`
                                    : 'UNREACHABLE'
                            }}
                        </span>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <span
                                class="h-2 w-2 rounded-full bg-rose-400"
                            ></span>
                            <span class="text-slate-300">Severe:</span>
                        </div>
                        <span class="font-bold text-white">
                            {{
                                severeArtifact && severeArtifact.reachable
                                    ? `${severeArtifact.route_distance_km?.toFixed(2)} km · ${severeArtifact.estimated_travel_time_min?.toFixed(2)} min`
                                    : 'UNREACHABLE'
                            }}
                        </span>
                    </div>
                </div>

                <div
                    v-if="comparison && comparison.route_changed"
                    class="rounded-lg border border-amber-800/60 bg-amber-950/40 p-2.5 text-xs text-amber-200"
                >
                    <span class="font-semibold"
                        >Route changes under Severe scenario</span
                    >
                    <div
                        class="mt-1 flex items-center justify-between text-[11px] text-amber-300"
                    >
                        <span>
                            Distance:
                            {{
                                comparison.distance_delta_m !== null
                                    ? `+${comparison.distance_delta_m.toFixed(2)} m`
                                    : '--'
                            }}
                        </span>
                        <span>
                            Travel time:
                            {{
                                comparison.travel_time_delta_s !== null
                                    ? `+${comparison.travel_time_delta_s} sec`
                                    : '--'
                            }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Mode 3: HIDDEN -->
            <div
                v-else-if="displayMode === 'HIDDEN'"
                class="py-2 text-center text-xs text-slate-400"
            >
                Route visualization hidden.
            </div>

            <!-- Disclaimer -->
            <p
                class="mt-3 border-t border-slate-700/50 pt-2 text-[10px] leading-tight text-slate-400"
            >
                Visualization derivative of the FloodEvac routing engine. Does
                not represent empirical traffic flow or official emergency
                instructions.
            </p>
        </div>
    </div>
</template>
