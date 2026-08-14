export type RouteScenario = 'moderate' | 'severe';

export interface RouteMetadata {
    scenario: RouteScenario;
    objective: string;
    origin_node: string;
    destination_node: string;
    reachable: boolean;
    distance_m: number;
    distance_km: number;
    travel_time_s: number;
    travel_time_min: number;
    flood_exposed_length_m: number;
    flood_exposed_ratio: number;
    max_flood_depth_m: number;
    max_slope_percent: number;
    traversed_edge_count: number;
    scientific_disclaimer?: string;
}

export interface RouteComparison {
    objective: string;
    moderate_reachable: boolean;
    severe_reachable: boolean;
    route_changed: boolean;
    became_unreachable: boolean;
    distance_diff_m: number;
    distance_diff_km: number;
    travel_time_diff_s: number;
    travel_time_diff_min: number;
    flood_exposed_length_diff_m: number;
    scientific_disclaimer?: string;
}

export interface RouteFeatureProperties {
    origin_node?: string;
    destination_node?: string;
    objective?: string;
    reachable?: boolean;
    total_distance_m?: number;
    total_distance_km?: number;
    estimated_travel_time_s?: number;
    estimated_travel_time_min?: number;
    flood_exposed_length_m?: number;
    flood_exposed_ratio?: number;
    max_flood_depth_m?: number;
    max_slope_percent?: number;
    traversed_edge_count?: number;
    [key: string]: unknown;
}

export interface RouteFeature {
    type: 'Feature';
    geometry: {
        type: 'LineString';
        coordinates: [number, number][]; // [lng, lat]
    };
    properties: RouteFeatureProperties;
}

export interface RouteGeoJSON {
    type: 'FeatureCollection';
    features: RouteFeature[];
}
