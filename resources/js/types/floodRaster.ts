export interface VisualizationLegendItem {
    name: string;
    min_depth_m: number;
    max_depth_m: number | null;
    rgba: [number, number, number, number];
    hex: string;
    description: string;
}

export interface FloodRasterMetadata {
    scenario: 'moderate' | 'severe';
    source_path: string;
    source_crs: string;
    source_bounds: [number, number, number, number];
    source_resolution: [number, number];
    source_width: number;
    source_height: number;
    source_dtype: string;
    source_nodata: number;
    valid_min_depth_m: number;
    valid_max_depth_m: number;
    web_crs: string;
    web_bounds: [number, number, number, number]; // [westLng, southLat, eastLng, northLat]
    leaflet_bounds: [[number, number], [number, number]]; // [[southLat, westLng], [northLat, eastLng]]
    web_width: number;
    web_height: number;
    transformation_method: string;
    compression: string;
    generated_file_size_bytes?: {
        png: number;
        tif: number;
    };
    generated_file_size_kb?: {
        png: number;
        tif: number;
    };
    visualization_legend: VisualizationLegendItem[];
    scientific_disclaimer: string;
}
