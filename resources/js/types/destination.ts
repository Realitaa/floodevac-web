export type FloodSafetyStatus = 'SAFE' | 'AT_RISK' | 'FLOODED' | 'NO_DATA';

export type DestinationCategoryValue =
    | 'ALL'
    | 'POTENTIAL_EVACUATION_DESTINATION'
    | 'EMERGENCY_FACILITY'
    | 'healthcare'
    | 'education'
    | 'worship'
    | 'civic'
    | 'sports';

export type DestinationSafetyFilterValue = 'ALL' | FloodSafetyStatus;

export interface DestinationProperties {
    facility_id: string;
    name: string | null;
    category: 'POTENTIAL_EVACUATION_DESTINATION' | 'EMERGENCY_FACILITY';
    detailed_category: string;
    flood_safety_moderate: FloodSafetyStatus;
    flood_safety_severe: FloodSafetyStatus;
    network_access_status: string;
    nearest_node_id: string;
    nearest_node_distance_m: number;
}

export interface DestinationFeature {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: [number, number]; // [lng, lat]
    };
    properties: DestinationProperties;
}

export interface DestinationFeatureCollection {
    type: 'FeatureCollection';
    name: string;
    crs?: Record<string, unknown>;
    features: DestinationFeature[];
}
