import type { DestinationFeature } from '@/types/destination';

export function normalizeSearchText(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

export function searchDestinations(
    destinations: DestinationFeature[],
    query: string,
    limit = 10,
): DestinationFeature[] {
    if (!query || !query.trim()) {
        return [];
    }

    const normQuery = normalizeSearchText(query.trim());

    const results: DestinationFeature[] = [];

    for (const feature of destinations) {
        const props = feature.properties;
        const name = props.name ? normalizeSearchText(props.name) : '';
        const facilityId = props.facility_id
            ? normalizeSearchText(props.facility_id)
            : '';

        if (name.includes(normQuery) || facilityId.includes(normQuery)) {
            results.push(feature);

            if (results.length >= limit) {
                break;
            }
        }
    }

    return results;
}
