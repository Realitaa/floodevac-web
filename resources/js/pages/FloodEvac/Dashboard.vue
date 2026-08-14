<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import FloodLegend from '@/components/flood/FloodLegend.vue';
import FloodMap from '@/components/flood/FloodMap.vue';
import ScenarioSelector from '@/components/flood/ScenarioSelector.vue';
import type { FloodScenario } from '@/components/flood/ScenarioSelector.vue';

const selectedScenario = ref<FloodScenario>('moderate');

const scenarioDisplayLabel = computed(() => {
    return selectedScenario.value === 'moderate' ? 'Moderate' : 'Severe';
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

                <!-- Destinations Candidate Info Card -->
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
                            class="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-400"
                        >
                            Pending Data
                        </span>
                    </div>
                    <p class="mt-2 text-xs text-slate-400">
                        Destination candidates dataset will be loaded in a
                        subsequent step once converted for web GIS format.
                    </p>
                </div>

                <!-- Flood Status Legend -->
                <FloodLegend />
            </aside>

            <!-- Map Viewport -->
            <main class="relative min-h-0 flex-1">
                <FloodMap />
            </main>
        </div>
    </div>
</template>
