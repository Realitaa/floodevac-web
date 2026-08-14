<script setup lang="ts">
interface LegendItem {
    label: string;
    description: string;
    colorClass: string;
    borderClass: string;
}

const legendItems: LegendItem[] = [
    {
        label: 'Dry',
        description: 'Road segment clear of flood waters',
        colorClass: 'bg-emerald-500',
        borderClass: 'border-emerald-400',
    },
    {
        label: 'Flooded / Passable',
        description: 'Shallow inundation; vehicle passable',
        colorClass: 'bg-sky-400',
        borderClass: 'border-sky-300',
    },
    {
        label: 'Flooded / Risk',
        description: 'Moderate inundation; high risk',
        colorClass: 'bg-amber-500',
        borderClass: 'border-amber-400',
    },
    {
        label: 'Blocked',
        description: 'Deep inundation; road impassable',
        colorClass: 'bg-rose-600',
        borderClass: 'border-rose-500',
    },
];
</script>

<template>
    <div
        class="rounded-xl border border-slate-700 bg-slate-800/80 p-4 shadow-lg backdrop-blur-sm"
    >
        <div class="mb-3 flex items-center justify-between">
            <h3
                class="text-sm font-semibold tracking-wider text-slate-300 uppercase"
            >
                Flood Status Legend
            </h3>
            <span
                class="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-400"
            >
                UI Preview
            </span>
        </div>

        <div class="space-y-2.5">
            <div
                v-for="item in legendItems"
                :key="item.label"
                class="flex items-center space-x-3 rounded-lg border border-slate-700/50 bg-slate-900/40 p-2"
            >
                <div
                    :class="[
                        'h-4 w-4 shrink-0 rounded-full border shadow-sm',
                        item.colorClass,
                        item.borderClass,
                    ]"
                ></div>
                <div class="flex flex-col">
                    <span class="text-xs font-medium text-slate-200">{{
                        item.label
                    }}</span>
                    <span class="text-[11px] text-slate-400">{{
                        item.description
                    }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
