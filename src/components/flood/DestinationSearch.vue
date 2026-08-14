<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FloodScenario } from '@/components/flood/ScenarioSelector.vue';
import { searchDestinations } from '@/lib/destinationSearch';
import type {
    DestinationFeature,
    FloodSafetyStatus,
} from '@/types/destination';

const props = withDefaults(
    defineProps<{
        destinations?: DestinationFeature[];
        scenario?: FloodScenario;
        selectedDestinationId?: string | null;
    }>(),
    {
        destinations: () => [],
        scenario: 'moderate',
        selectedDestinationId: null,
    },
);

const emit = defineEmits<{
    (e: 'select-destination', destinationId: string): void;
    (e: 'clear-selection'): void;
}>();

const searchQuery = ref<string>('');
const isFocused = ref<boolean>(false);

const searchResults = computed(() => {
    return searchDestinations(props.destinations, searchQuery.value, 10);
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

function getSafetyBadgeClass(status: FloodSafetyStatus): string {
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

function selectResult(facilityId: string): void {
    emit('select-destination', facilityId);
    isFocused.value = false;
}

function clearQuery(): void {
    searchQuery.value = '';
    emit('clear-selection');
}
</script>

<template>
    <div class="relative w-full">
        <!-- Search Input -->
        <div class="relative flex items-center">
            <svg
                class="absolute left-3 h-3.5 w-3.5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>

            <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name or facility ID..."
                class="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pr-8 pl-9 text-xs text-slate-200 shadow-sm transition placeholder:text-slate-500 hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                @focus="isFocused = true"
            />

            <button
                v-if="searchQuery"
                type="button"
                class="absolute right-2.5 rounded text-slate-400 hover:text-slate-200 focus:outline-none"
                @click="clearQuery"
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

        <!-- Search Results Dropdown -->
        <div
            v-if="searchQuery.trim().length > 0 && isFocused"
            class="absolute top-full z-[1100] mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur"
        >
            <div
                v-if="searchResults.length === 0"
                class="px-3 py-2 text-center text-xs text-slate-400"
            >
                No destinations found.
            </div>

            <div v-else class="space-y-1">
                <button
                    v-for="item in searchResults"
                    :key="item.properties.facility_id"
                    type="button"
                    :class="[
                        'flex w-full items-center justify-between rounded-lg p-2 text-left transition-all duration-150',
                        selectedDestinationId === item.properties.facility_id
                            ? 'border border-blue-500 bg-blue-600/20 text-white'
                            : 'border border-transparent text-slate-300 hover:bg-slate-800 hover:text-white',
                    ]"
                    @click="selectResult(item.properties.facility_id)"
                >
                    <div class="flex flex-col truncate pr-2">
                        <span class="truncate text-xs font-medium">
                            {{ item.properties.name || 'Unnamed Facility' }}
                        </span>
                        <span class="text-[10px] text-slate-400">
                            {{
                                formatCategoryLabel(
                                    item.properties.category,
                                    item.properties.detailed_category,
                                )
                            }}
                            · {{ item.properties.facility_id }}
                        </span>
                    </div>

                    <span
                        :class="[
                            'shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase',
                            getSafetyBadgeClass(
                                scenario === 'moderate'
                                    ? item.properties.flood_safety_moderate
                                    : item.properties.flood_safety_severe,
                            ),
                        ]"
                    >
                        {{
                            scenario === 'moderate'
                                ? item.properties.flood_safety_moderate
                                : item.properties.flood_safety_severe
                        }}
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>
