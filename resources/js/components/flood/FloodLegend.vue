<script setup lang="ts">
import type { FloodSafetyStatus } from '@/types/destination';

interface DepthLegendItem {
    name: string;
    label: string;
    description: string;
    bgStyle: string;
    borderStyle: string;
}

interface SafetyLegendItem {
    status: FloodSafetyStatus;
    label: string;
    description: string;
    colorClass: string;
    borderClass: string;
}

const depthLegendItems: DepthLegendItem[] = [
    {
        name: 'negligible',
        label: 'Negligible / Dry',
        description: '< 0.05 m depth',
        bgStyle: 'background-color: transparent;',
        borderStyle: 'border-color: #64748b; border-style: dashed;',
    },
    {
        name: 'shallow',
        label: 'Shallow Flooding',
        description: '0.05 m – 0.5 m depth',
        bgStyle: 'background-color: rgba(147, 197, 253, 0.85);',
        borderStyle: 'border-color: #93c5fd;',
    },
    {
        name: 'moderate',
        label: 'Moderate Flooding',
        description: '0.5 m – 1.5 m depth',
        bgStyle: 'background-color: rgba(59, 130, 246, 0.85);',
        borderStyle: 'border-color: #3b82f6;',
    },
    {
        name: 'deep',
        label: 'Deep Flooding',
        description: '1.5 m – 3.0 m depth',
        bgStyle: 'background-color: rgba(29, 78, 216, 0.85);',
        borderStyle: 'border-color: #1d4ed8;',
    },
    {
        name: 'severe_deep',
        label: 'Severe Deep Flooding',
        description: '> 3.0 m depth',
        bgStyle: 'background-color: rgba(88, 28, 135, 0.9);',
        borderStyle: 'border-color: #581c87;',
    },
];

const safetyLegendItems: SafetyLegendItem[] = [
    {
        status: 'SAFE',
        label: 'SAFE',
        description: 'Clear of modeled inundation',
        colorClass: 'bg-emerald-500',
        borderClass: 'border-emerald-400',
    },
    {
        status: 'AT_RISK',
        label: 'AT_RISK',
        description: 'Access network or fringe inundated',
        colorClass: 'bg-amber-500',
        borderClass: 'border-amber-400',
    },
    {
        status: 'FLOODED',
        label: 'FLOODED',
        description: 'Facility location directly inundated',
        colorClass: 'bg-rose-600',
        borderClass: 'border-rose-500',
    },
    {
        status: 'NO_DATA',
        label: 'NO_DATA',
        description: 'Assessment unavailable',
        colorClass: 'bg-slate-500',
        borderClass: 'border-slate-400',
    },
];
</script>

<template>
    <div
        class="space-y-4 rounded-xl border border-slate-700 bg-slate-800/80 p-4 shadow-lg backdrop-blur-sm"
    >
        <!-- Disclaimer Header -->
        <p class="text-[11px] leading-tight text-slate-400">
            Note: Flood colors represent modeled flood depth visualization.
            Destination safety status is a separate scenario-based hazard
            classification.
        </p>

        <!-- Section A: Flood Depth Visualization -->
        <div>
            <div class="mb-2 flex items-center justify-between">
                <h3
                    class="text-xs font-semibold tracking-wider text-slate-300 uppercase"
                >
                    Flood Depth Raster
                </h3>
                <span
                    class="rounded bg-slate-700 px-1.5 py-0.5 text-[9px] text-slate-400"
                >
                    Raster Overlay
                </span>
            </div>

            <div class="space-y-1.5">
                <div
                    v-for="item in depthLegendItems"
                    :key="item.name"
                    class="flex items-center space-x-2.5 rounded-md border border-slate-700/40 bg-slate-900/40 p-1.5"
                >
                    <div
                        class="h-3.5 w-3.5 shrink-0 rounded-sm border shadow-sm"
                        :style="`${item.bgStyle} ${item.borderStyle}`"
                    ></div>
                    <div class="flex flex-col">
                        <span class="text-[11px] font-medium text-slate-200">{{
                            item.label
                        }}</span>
                        <span class="text-[10px] text-slate-400">{{
                            item.description
                        }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section B: Destination Safety Status -->
        <div>
            <div class="mb-2 flex items-center justify-between">
                <h3
                    class="text-xs font-semibold tracking-wider text-slate-300 uppercase"
                >
                    Destination Safety Status
                </h3>
                <span
                    class="rounded bg-slate-700 px-1.5 py-0.5 text-[9px] text-slate-400"
                >
                    Point Markers
                </span>
            </div>

            <div class="space-y-1.5">
                <div
                    v-for="item in safetyLegendItems"
                    :key="item.status"
                    class="flex items-center space-x-2.5 rounded-md border border-slate-700/40 bg-slate-900/40 p-1.5"
                >
                    <div
                        :class="[
                            'h-3.5 w-3.5 shrink-0 rounded-full border shadow-sm',
                            item.colorClass,
                            item.borderClass,
                        ]"
                    ></div>
                    <div class="flex flex-col">
                        <span
                            class="text-[11px] font-semibold text-slate-200"
                            >{{ item.label }}</span
                        >
                        <span class="text-[10px] text-slate-400">{{
                            item.description
                        }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
