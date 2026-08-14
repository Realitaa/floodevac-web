import { describe, expect, it } from 'vitest';
import { normalizeSearchText, searchDestinations } from '../lib/destinationSearch';
import type { DestinationFeature } from '../types/destination';

describe('Destination Search Utility', () => {
    const mockDestinations: DestinationFeature[] = [
        {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [98.67, 3.59] },
            properties: {
                facility_id: 'fac_0001',
                name: 'RSUP H. Adam Malik',
                category: 'EMERGENCY_FACILITY',
                detailed_category: 'healthcare=hospital',
                flood_safety_moderate: 'SAFE',
                flood_safety_severe: 'AT_RISK',
                network_access_status: 'ACCESSIBLE',
                nearest_node_id: 'node_1',
                nearest_node_distance_m: 10.5,
            },
        },
        {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [98.68, 3.60] },
            properties: {
                facility_id: 'fac_0002',
                name: 'Masjid Raya Al-Mashun',
                category: 'POTENTIAL_EVACUATION_DESTINATION',
                detailed_category: 'worship=mosque',
                flood_safety_moderate: 'SAFE',
                flood_safety_severe: 'SAFE',
                network_access_status: 'ACCESSIBLE',
                nearest_node_id: 'node_2',
                nearest_node_distance_m: 15.0,
            },
        },
        {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [98.69, 3.61] },
            properties: {
                facility_id: 'fac_0003',
                name: 'SD Negeri 060800',
                category: 'POTENTIAL_EVACUATION_DESTINATION',
                detailed_category: 'education=school',
                flood_safety_moderate: 'AT_RISK',
                flood_safety_severe: 'FLOODED',
                network_access_status: 'ACCESSIBLE',
                nearest_node_id: 'node_3',
                nearest_node_distance_m: 20.0,
            },
        },
    ];

    it('normalizeSearchText lowers case and strips diacritics', () => {
        expect(normalizeSearchText('MASJID')).toBe('masjid');
        expect(normalizeSearchText('Café')).toBe('cafe');
    });

    it('returns empty array when query is empty or whitespace', () => {
        expect(searchDestinations(mockDestinations, '')).toEqual([]);
        expect(searchDestinations(mockDestinations, '   ')).toEqual([]);
    });

    it('finds destinations by facility ID', () => {
        const results = searchDestinations(mockDestinations, 'fac_0002');
        expect(results.length).toBe(1);
        expect(results[0]?.properties.name).toBe('Masjid Raya Al-Mashun');
    });

    it('finds destinations by partial name case-insensitively', () => {
        const results = searchDestinations(mockDestinations, 'adam malik');
        expect(results.length).toBe(1);
        expect(results[0]?.properties.facility_id).toBe('fac_0001');
    });

    it('respects limit argument', () => {
        const results = searchDestinations(mockDestinations, 'fac', 2);
        expect(results.length).toBe(2);
    });
});
