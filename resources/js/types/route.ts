export type RouteScenario = 'moderate' | 'severe';

export type RouteDisplayMode = 'ACTIVE_SCENARIO' | 'COMPARE_BOTH' | 'HIDDEN';

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

export interface DestinationRouteArtifact {
    facility_id: string;
    scenario: RouteScenario;
    reachable: boolean;
    route_distance_m: number | null;
    route_distance_km: number | null;
    estimated_travel_time_s: number | null;
    estimated_travel_time_min: number | null;
    flood_exposed_length_m: number | null;
    flood_exposed_ratio: number | null;
    max_flood_depth_m: number | null;
    max_slope_percent: number | null;
    geometry: {
        type: 'LineString';
        coordinates: [number, number][]; // [lng, lat]
    } | null;
}

export interface DestinationRouteComparison {
    facility_id: string;
    comparison_status: string;
    moderate_flood_status: string;
    severe_flood_status: string;
    moderate_reachable: boolean;
    severe_reachable: boolean;
    route_changed: boolean;
    became_unreachable: boolean;
    distance_delta_m: number | null;
    travel_time_delta_s: number | null;
    flood_exposure_delta_m: number | null;
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
