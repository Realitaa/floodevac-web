<script setup lang="ts">
import type {
    DestinationCategoryValue,
    DestinationSafetyFilterValue,
} from '@/types/destination';

defineProps<{
    safetyFilter: DestinationSafetyFilterValue;
    categoryFilter: DestinationCategoryValue;
}>();

const emit = defineEmits<{
    (e: 'update:safetyFilter', value: DestinationSafetyFilterValue): void;
    (e: 'update:categoryFilter', value: DestinationCategoryValue): void;
}>();

const safetyOptions: { value: DestinationSafetyFilterValue; label: string }[] =
    [
        { value: 'ALL', label: 'All' },
        { value: 'SAFE', label: 'Safe' },
        { value: 'AT_RISK', label: 'At Risk' },
        { value: 'FLOODED', label: 'Flooded' },
        { value: 'NO_DATA', label: 'No Data' },
    ];

const categoryOptions: { value: DestinationCategoryValue; label: string }[] = [
    { value: 'ALL', label: 'All Categories' },
    {
        value: 'POTENTIAL_EVACUATION_DESTINATION',
        label: 'Potential Evacuation Destination',
    },
    { value: 'EMERGENCY_FACILITY', label: 'Emergency Facility' },
    { value: 'healthcare', label: 'Healthcare Facility' },
    { value: 'education', label: 'Educational Facility' },
    { value: 'worship', label: 'Place of Worship' },
    { value: 'civic', label: 'Civic / Community Facility' },
    { value: 'sports', label: 'Sports / Recreation Facility' },
];

function selectSafety(val: DestinationSafetyFilterValue): void {
    emit('update:safetyFilter', val);
}

function onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    emit('update:categoryFilter', target.value as DestinationCategoryValue);
}
</script>

<template>
    <div
        class="rounded-xl border border-slate-700 bg-slate-800/80 p-4 shadow-lg backdrop-blur-sm"
    >
        <h3
            class="mb-3 text-sm font-semibold tracking-wider text-slate-300 uppercase"
        >
            Destination Filters
        </h3>

        <!-- Safety Filter Pills -->
        <div class="mb-4">
            <label class="mb-1.5 block text-xs font-medium text-slate-400">
                Safety Status
            </label>
            <div class="flex flex-wrap gap-1.5">
                <button
                    v-for="opt in safetyOptions"
                    :key="opt.value"
                    type="button"
                    :class="[
                        'rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150',
                        safetyFilter === opt.value
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'border border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200',
                    ]"
                    @click="selectSafety(opt.value)"
                >
                    {{ opt.label }}
                </button>
            </div>
        </div>

        <!-- Category Select -->
        <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-400">
                Facility Type
            </label>
            <select
                :value="categoryFilter"
                class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 shadow-sm transition hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                @change="onCategoryChange"
            >
                <option
                    v-for="opt in categoryOptions"
                    :key="opt.value"
                    :value="opt.value"
                >
                    {{ opt.label }}
                </option>
            </select>
        </div>
    </div>
</template>
