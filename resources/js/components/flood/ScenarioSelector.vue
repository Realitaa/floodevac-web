<script setup lang="ts">
export type FloodScenario = 'moderate' | 'severe';

const props = defineProps<{
    modelValue: FloodScenario;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: FloodScenario): void;
}>();

const scenarios: { id: FloodScenario; label: string; description: string }[] = [
    {
        id: 'moderate',
        label: 'Moderate',
        description: 'Standard flood condition simulation',
    },
    {
        id: 'severe',
        label: 'Severe',
        description: 'Extreme flood depth and road blockages',
    },
];

function selectScenario(scenario: FloodScenario): void {
    if (props.modelValue !== scenario) {
        emit('update:modelValue', scenario);
    }
}
</script>

<template>
    <div
        class="rounded-xl border border-slate-700 bg-slate-800/80 p-4 shadow-lg backdrop-blur-sm"
    >
        <h3
            class="mb-1 text-sm font-semibold tracking-wider text-slate-300 uppercase"
        >
            Flood Scenario
        </h3>
        <p class="mb-3 text-xs text-slate-400">
            Select a flood severity scenario to inspect.
        </p>

        <div class="grid grid-cols-2 gap-2">
            <button
                v-for="scenario in scenarios"
                :key="scenario.id"
                type="button"
                :class="[
                    'flex flex-col items-start rounded-lg p-3 text-left transition-all duration-150',
                    modelValue === scenario.id
                        ? 'border border-blue-500 bg-blue-600/20 text-white shadow-md'
                        : 'border border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200',
                ]"
                @click="selectScenario(scenario.id)"
            >
                <div class="flex items-center space-x-2">
                    <span
                        :class="[
                            'h-2.5 w-2.5 rounded-full',
                            modelValue === scenario.id
                                ? scenario.id === 'moderate'
                                    ? 'bg-amber-400'
                                    : 'bg-rose-500'
                                : 'bg-slate-600',
                        ]"
                    ></span>
                    <span class="text-sm font-medium">{{
                        scenario.label
                    }}</span>
                </div>
                <span class="mt-1 text-[11px] leading-tight text-slate-400">
                    {{ scenario.description }}
                </span>
            </button>
        </div>
    </div>
</template>
