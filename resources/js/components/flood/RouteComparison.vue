<script setup lang="ts">
import { ref } from 'vue';
import type { RouteComparison, RouteMetadata } from '@/types/route';

defineProps<{
    comparison: RouteComparison | null;
    moderateMetadata: RouteMetadata | null;
    severeMetadata: RouteMetadata | null;
}>();

const isCollapsed = ref<boolean>(false);
</script>

<template>
    <div
        v-if="comparison"
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
                    :class="[
                        'rounded px-1.5 py-0.5 text-[9px] font-bold',
                        comparison.became_unreachable
                            ? 'border border-rose-800 bg-rose-950 text-rose-300'
                            : comparison.route_changed
                              ? 'border border-amber-800 bg-amber-950 text-amber-300'
                              : 'border border-emerald-800 bg-emerald-950 text-emerald-300',
                    ]"
                >
                    {{
                        comparison.became_unreachable
                            ? 'Became Unreachable'
                            : comparison.route_changed
                              ? 'Route Changed'
                              : 'Route Unchanged'
                    }}
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

        <div v-show="!isCollapsed" class="mt-3 space-y-2.5">
            <!-- Moderate Scenario Line -->
            <div
                class="flex items-center justify-between rounded-lg bg-slate-900/50 p-2 text-xs"
            >
                <div class="flex items-center space-x-2">
                    <span class="h-2 w-2 rounded-full bg-amber-400"></span>
                    <span class="font-medium text-slate-300">Moderate</span>
                </div>
                <span class="font-bold text-white">
                    {{
                        moderateMetadata
                            ? `${moderateMetadata.distance_km.toFixed(2)} km · ${moderateMetadata.travel_time_min.toFixed(2)} min`
                            : '--'
                    }}
                </span>
            </div>

            <!-- Severe Scenario Line -->
            <div
                class="flex items-center justify-between rounded-lg bg-slate-900/50 p-2 text-xs"
            >
                <div class="flex items-center space-x-2">
                    <span class="h-2 w-2 rounded-full bg-rose-500"></span>
                    <span class="font-medium text-slate-300">Severe</span>
                </div>
                <span class="font-bold text-white">
                    {{
                        severeMetadata
                            ? `${severeMetadata.distance_km.toFixed(2)} km · ${severeMetadata.travel_time_min.toFixed(2)} min`
                            : '--'
                    }}
                </span>
            </div>

            <!-- Difference Callout -->
            <div
                v-if="comparison.route_changed"
                class="rounded-lg border border-slate-700 bg-slate-900/70 p-2 text-[11px]"
            >
                <span class="text-slate-400">Scenario Difference:</span>
                <div
                    class="mt-1 flex items-center justify-between font-medium text-slate-200"
                >
                    <span
                        >Distance: +{{
                            comparison.distance_diff_m.toFixed(2)
                        }}
                        m</span
                    >
                    <span
                        >Travel Time: +{{
                            comparison.travel_time_diff_s
                        }}
                        sec</span
                    >
                </div>
            </div>

            <!-- Reachability Summary -->
            <p class="text-[11px] text-slate-400">
                {{
                    comparison.became_unreachable
                        ? 'Route becomes unreachable under Severe flood scenario.'
                        : 'Reachable in both Moderate and Severe scenarios.'
                }}
            </p>
        </div>
    </div>
</template>
