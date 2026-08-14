<script setup lang="ts">
import { computed } from 'vue';
import type {
    RouteComparison,
    RouteMetadata,
    RouteScenario,
} from '@/types/route';

const props = defineProps<{
    showRoute: boolean;
    scenario: RouteScenario;
    metadata: RouteMetadata | null;
    comparison: RouteComparison | null;
    loading?: boolean;
    error?: string | null;
}>();

const emit = defineEmits<{
    (e: 'update:showRoute', value: boolean): void;
}>();

const scenarioLabel = computed(() =>
    props.scenario === 'moderate' ? 'Moderate' : 'Severe',
);

function onToggleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    emit('update:showRoute', target.checked);
}
</script>

<template>
    <div
        class="rounded-xl border border-slate-700 bg-slate-800/80 p-4 shadow-lg backdrop-blur-sm"
    >
        <div
            class="flex items-center justify-between border-b border-slate-700/60 pb-3"
        >
            <div>
                <h3
                    class="text-sm font-semibold tracking-wider text-slate-300 uppercase"
                >
                    Flood-Aware Route
                </h3>
                <p class="text-xs text-slate-400">
                    Scenario evacuation pathway
                </p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center">
                <input
                    type="checkbox"
                    :checked="showRoute"
                    class="peer sr-only"
                    @change="onToggleChange"
                />
                <div
                    class="peer h-6 w-11 rounded-full bg-slate-700 peer-checked:bg-blue-600 peer-focus:outline-none after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"
                ></div>
            </label>
        </div>

        <div class="mt-3">
            <!-- Loading State -->
            <div
                v-if="loading"
                class="animate-pulse py-2 text-xs text-slate-400"
            >
                Loading scenario route data...
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="py-2 text-xs text-rose-400">
                Flood-Aware route unavailable.
            </div>

            <!-- Active Route Metrics -->
            <div v-else-if="metadata" class="space-y-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-xs font-medium text-slate-300">{{
                            scenarioLabel
                        }}</span>
                        <span
                            :class="[
                                'rounded px-2 py-0.5 text-[10px] font-bold tracking-wide',
                                metadata.reachable
                                    ? 'border border-emerald-800 bg-emerald-950 text-emerald-400'
                                    : 'border border-rose-800 bg-rose-950 text-rose-400',
                            ]"
                        >
                            {{
                                metadata.reachable ? 'REACHABLE' : 'UNREACHABLE'
                            }}
                        </span>
                    </div>

                    <span
                        v-if="comparison && comparison.route_changed"
                        class="rounded border border-amber-800 bg-amber-950 px-2 py-0.5 text-[10px] font-medium text-amber-300"
                    >
                        Route Changed
                    </span>
                </div>

                <div
                    class="grid grid-cols-3 gap-2 rounded-lg bg-slate-900/60 p-2.5 text-center"
                >
                    <div>
                        <span class="block text-[10px] text-slate-400 uppercase"
                            >Distance</span
                        >
                        <span class="text-xs font-extrabold text-white">
                            {{ metadata.distance_km.toFixed(2) }} km
                        </span>
                    </div>
                    <div>
                        <span class="block text-[10px] text-slate-400 uppercase"
                            >Est. Time</span
                        >
                        <span class="text-xs font-extrabold text-white">
                            {{ metadata.travel_time_min.toFixed(2) }} min
                        </span>
                    </div>
                    <div>
                        <span
                            class="block text-[10px] font-normal text-slate-400 uppercase"
                        >
                            Flood Exposure
                        </span>
                        <span class="text-xs font-extrabold text-emerald-400">
                            {{ metadata.flood_exposed_length_m.toFixed(1) }} m
                        </span>
                    </div>
                </div>

                <!-- Callout when route changes in Severe -->
                <div
                    v-if="
                        comparison &&
                        comparison.route_changed &&
                        scenario === 'severe'
                    "
                    class="rounded-lg border border-amber-800/60 bg-amber-950/40 p-2 text-xs text-amber-200"
                >
                    <span class="font-semibold"
                        >Route changes under Severe scenario:</span
                    >
                    <div
                        class="mt-1 flex items-center justify-between text-[11px] text-amber-300"
                    >
                        <span
                            >Distance: +{{
                                comparison.distance_diff_m.toFixed(2)
                            }}
                            m</span
                        >
                        <span
                            >Travel time: +{{
                                comparison.travel_time_diff_s
                            }}
                            sec</span
                        >
                    </div>
                </div>
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
