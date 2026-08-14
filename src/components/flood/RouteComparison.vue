<script setup lang="ts">
import { computed, ref } from 'vue';
import type { DestinationFeature } from '@/types/destination';
import type {
    DestinationRouteArtifact,
    DestinationRouteComparison,
    RouteDisplayMode,
} from '@/types/route';

const props = defineProps<{
    selectedDestination: DestinationFeature | null;
    comparison: DestinationRouteComparison | null;
    moderateArtifact: DestinationRouteArtifact | null;
    severeArtifact: DestinationRouteArtifact | null;
    displayMode?: RouteDisplayMode;
}>();

const isCollapsed = ref<boolean>(false);

const comparisonBadgeText = computed(() => {
    if (!props.comparison) {
        return 'No Data';
    }

    if (props.comparison.became_unreachable) {
        return 'Became Unreachable';
    }

    if (props.comparison.route_changed) {
        return 'Route Changed';
    }

    if (
        props.comparison.moderate_reachable &&
        props.comparison.severe_reachable
    ) {
        return 'Route Stable';
    }

    return 'Unreachable';
});

const comparisonBadgeClass = computed(() => {
    if (!props.comparison) {
        return 'border border-slate-700 bg-slate-800 text-slate-400';
    }

    if (props.comparison.became_unreachable) {
        return 'border border-rose-800 bg-rose-950 text-rose-300';
    }

    if (props.comparison.route_changed) {
        return 'border border-amber-800 bg-amber-950 text-amber-300';
    }

    if (
        props.comparison.moderate_reachable &&
        props.comparison.severe_reachable
    ) {
        return 'border border-emerald-800 bg-emerald-950 text-emerald-300';
    }

    return 'border border-slate-700 bg-slate-950 text-slate-400';
});
</script>

<template>
    <div
        class="rounded-xl border border-slate-700 bg-slate-800/80 p-4 shadow-lg backdrop-blur-sm"
    >
        <button
            type="button"
            class="flex w-full items-center justify-between border-b border-slate-700/60 pb-2 text-left focus:outline-none"
            @click="isCollapsed = !isCollapsed"
        >
            <div class="flex items-center space-x-2">
                <h3
                    class="text-xs font-semibold tracking-wider text-slate-300 uppercase"
                >
                    Scenario Route Comparison
                </h3>
                <span
                    v-if="selectedDestination && comparison"
                    :class="[
                        'rounded px-1.5 py-0.5 text-[9px] font-bold',
                        comparisonBadgeClass,
                    ]"
                >
                    {{ comparisonBadgeText }}
                </span>
            </div>

            <svg
                :class="[
                    'h-4 w-4 text-slate-400 transition-transform duration-200',
                    isCollapsed ? 'rotate-180' : '',
                ]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        </button>

        <div v-show="!isCollapsed" class="mt-3 space-y-3">
            <!-- Empty State -->
            <div
                v-if="!selectedDestination"
                class="py-2 text-center text-xs text-slate-400"
            >
                Select a destination to compare its routes.
            </div>

            <div
                v-else-if="!comparison"
                class="py-2 text-center text-xs text-slate-400"
            >
                Scenario comparison data unavailable for this destination.
            </div>

            <div v-else class="space-y-3">
                <!-- Route Visual Style Legend -->
                <div
                    class="flex items-center justify-around rounded-lg border border-slate-700/50 bg-slate-900/60 p-2 text-xs"
                >
                    <div class="flex items-center space-x-2">
                        <span class="inline-block h-0.5 w-6 bg-sky-400"></span>
                        <span class="font-medium text-slate-300">Moderate</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span
                            class="inline-block h-0.5 w-6 border-b-2 border-dashed border-rose-400"
                        ></span>
                        <span class="font-medium text-slate-300">Severe</span>
                    </div>
                </div>

                <!-- Moderate Scenario Line -->
                <div
                    class="flex items-center justify-between rounded-lg bg-slate-900/50 p-2 text-xs"
                >
                    <div class="flex items-center space-x-2">
                        <span class="h-2 w-2 rounded-full bg-sky-400"></span>
                        <span class="font-medium text-slate-300">Moderate</span>
                    </div>
                    <span class="font-bold text-white">
                        {{
                            moderateArtifact && moderateArtifact.reachable
                                ? `${moderateArtifact.route_distance_km?.toFixed(2)} km · ${moderateArtifact.estimated_travel_time_min?.toFixed(2)} min`
                                : 'UNREACHABLE'
                        }}
                    </span>
                </div>

                <!-- Severe Scenario Line -->
                <div
                    class="flex items-center justify-between rounded-lg bg-slate-900/50 p-2 text-xs"
                >
                    <div class="flex items-center space-x-2">
                        <span class="h-2 w-2 rounded-full bg-rose-400"></span>
                        <span class="font-medium text-slate-300">Severe</span>
                    </div>
                    <span class="font-bold text-white">
                        {{
                            severeArtifact && severeArtifact.reachable
                                ? `${severeArtifact.route_distance_km?.toFixed(2)} km · ${severeArtifact.estimated_travel_time_min?.toFixed(2)} min`
                                : 'UNREACHABLE'
                        }}
                    </span>
                </div>

                <!-- Difference Callout -->
                <div
                    v-if="
                        comparison.route_changed &&
                        comparison.moderate_reachable &&
                        comparison.severe_reachable
                    "
                    class="rounded-lg border border-amber-800/60 bg-amber-950/40 p-2 text-[11px]"
                >
                    <span class="font-semibold text-amber-200">
                        Route changes under Severe scenario:
                    </span>
                    <div
                        class="mt-1 flex items-center justify-between font-medium text-amber-300"
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
                            Travel Time:
                            {{
                                comparison.travel_time_delta_s !== null
                                    ? `+${comparison.travel_time_delta_s} sec`
                                    : '--'
                            }}
                        </span>
                    </div>
                </div>

                <div
                    v-else-if="comparison.became_unreachable"
                    class="rounded-lg border border-rose-900/60 bg-rose-950/40 p-2 text-center text-[11px] text-rose-300"
                >
                    Accessibility is lost under Severe scenario.
                </div>

                <div
                    v-else-if="
                        !comparison.moderate_reachable &&
                        !comparison.severe_reachable
                    "
                    class="rounded-lg border border-slate-700 bg-slate-900/60 p-2 text-center text-[11px] text-slate-400"
                >
                    Destination is unreachable in both scenarios.
                </div>

                <div
                    v-else
                    class="rounded-lg border border-slate-700 bg-slate-900/60 p-2 text-center text-[11px] text-slate-300"
                >
                    Route remains stable across scenarios.
                </div>
            </div>
        </div>
    </div>
</template>
