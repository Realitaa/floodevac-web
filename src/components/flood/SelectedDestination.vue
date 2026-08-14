<script setup lang="ts">
import { computed } from 'vue';
import type { FloodScenario } from '@/components/flood/ScenarioSelector.vue';
import type {
    DestinationFeature,
    FloodSafetyStatus,
} from '@/types/destination';

const props = withDefaults(
    defineProps<{
        destination?: DestinationFeature | null;
        scenario?: FloodScenario;
        routeShown?: boolean;
        hasRouteData?: boolean;
    }>(),
    {
        destination: null,
        scenario: 'moderate',
        routeShown: false,
        hasRouteData: true,
    },
);

const emit = defineEmits<{
    (e: 'toggle-route'): void;
    (e: 'clear-selection'): void;
}>();

const safetyStatus = computed<FloodSafetyStatus | null>(() => {
    if (!props.destination) {
        return null;
    }

    return props.scenario === 'moderate'
        ? props.destination.properties.flood_safety_moderate
        : props.destination.properties.flood_safety_severe;
});

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

function getSafetyBadgeClass(status: FloodSafetyStatus | null): string {
    switch (status) {
        case 'SAFE':
            return 'bg-emerald-950 text-emerald-400 border-emerald-800';
        case 'AT_RISK':
            return 'bg-amber-950 text-amber-400 border-amber-800';
        case 'FLOODED':
            return 'bg-rose-950 text-rose-400 border-rose-800';
        case 'NO_DATA':
        default:
            return 'bg-slate-800 text-slate-400 border-slate-700';
    }
}
</script>

<template>
    <div
        class="rounded-xl border border-slate-700 bg-slate-800/80 p-4 shadow-lg backdrop-blur-sm"
    >
        <div
            class="flex items-center justify-between border-b border-slate-700/60 pb-2"
        >
            <h3
                class="text-sm font-semibold tracking-wider text-slate-300 uppercase"
            >
                Selected Destination
            </h3>
            <button
                v-if="destination"
                type="button"
                class="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200 focus:outline-none"
                title="Clear Selection"
                @click="emit('clear-selection')"
            >
                <svg
                    class="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>

        <div class="mt-3">
            <!-- Empty State -->
            <div
                v-if="!destination"
                class="py-2 text-center text-xs text-slate-400"
            >
                Select a potential evacuation destination from the map or
                search.
            </div>

            <!-- Selected Destination Content -->
            <div v-else class="space-y-3">
                <div>
                    <div class="flex items-start justify-between">
                        <h4 class="text-sm font-bold text-white">
                            {{
                                destination.properties.name ||
                                'Unnamed Facility'
                            }}
                        </h4>
                        <span
                            class="ml-2 shrink-0 rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-400"
                        >
                            {{ destination.properties.facility_id }}
                        </span>
                    </div>
                    <p class="text-xs text-slate-400">
                        {{
                            formatCategoryLabel(
                                destination.properties.category,
                                destination.properties.detailed_category,
                            )
                        }}
                    </p>
                </div>

                <div
                    class="grid grid-cols-2 gap-2 rounded-lg bg-slate-900/60 p-2 text-xs"
                >
                    <div>
                        <span class="block text-[10px] text-slate-400">
                            {{
                                scenario === 'moderate'
                                    ? 'Moderate Safety'
                                    : 'Severe Safety'
                            }}
                        </span>
                        <span
                            :class="[
                                'mt-0.5 inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase',
                                getSafetyBadgeClass(safetyStatus),
                            ]"
                        >
                            {{ safetyStatus }}
                        </span>
                    </div>

                    <div>
                        <span class="block text-[10px] text-slate-400"
                            >Road Distance</span
                        >
                        <span class="font-bold text-slate-200">
                            {{
                                destination.properties.nearest_node_distance_m.toFixed(
                                    1,
                                )
                            }}
                            m
                        </span>
                    </div>
                </div>

                <!-- Action Button -->
                <button
                    type="button"
                    :class="[
                        'flex w-full items-center justify-center space-x-2 rounded-lg py-2 text-xs font-bold shadow-md transition-all',
                        routeShown
                            ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                            : 'bg-blue-600 text-white shadow-blue-600/30 hover:bg-blue-500',
                    ]"
                    @click="emit('toggle-route')"
                >
                    <svg
                        v-if="!routeShown"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                    </svg>
                    <span>{{
                        routeShown ? 'Hide Route' : 'Show Flood-Aware Route'
                    }}</span>
                </button>
            </div>
        </div>
    </div>
</template>
