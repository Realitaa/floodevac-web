import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const PUBLIC_DATA_DIR = path.resolve(__dirname, '../../public/data');

describe('Static GIS Data Artifacts', () => {
    it('destinations.geojson exists and contains 1,248 valid features', () => {
        const geojsonPath = path.join(PUBLIC_DATA_DIR, 'destinations.geojson');
        expect(fs.existsSync(geojsonPath)).toBe(true);

        const content = fs.readFileSync(geojsonPath, 'utf-8');
        const data = JSON.parse(content);

        expect(data).toHaveProperty('type', 'FeatureCollection');
        expect(Array.isArray(data.features)).toBe(true);
        expect(data.features.length).toBe(1248);

        const sampleFeature = data.features[0];
        expect(sampleFeature).toHaveProperty('type', 'Feature');
        expect(sampleFeature.properties).toHaveProperty('facility_id');
        expect(sampleFeature.properties).toHaveProperty('flood_safety_moderate');
        expect(sampleFeature.properties).toHaveProperty('flood_safety_severe');
    });

    it('flood raster overlays and metadata JSON exist for moderate and severe scenarios', () => {
        const scenarios = ['moderate', 'severe'];

        for (const scenario of scenarios) {
            const jsonPath = path.join(
                PUBLIC_DATA_DIR,
                `flood/${scenario}/flood_depth_web.json`,
            );
            const pngPath = path.join(
                PUBLIC_DATA_DIR,
                `flood/${scenario}/flood_depth_web.png`,
            );

            expect(fs.existsSync(jsonPath)).toBe(true);
            expect(fs.existsSync(pngPath)).toBe(true);

            const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
            const metadata = JSON.parse(jsonContent);

            expect(metadata.scenario).toBe(scenario);
            expect(Array.isArray(metadata.leaflet_bounds)).toBe(true);
            expect(typeof metadata.valid_max_depth_m).toBe('number');
        }
    });

    it('per-destination route indices exist, contain 1,248 destinations, and have no NaN/Infinity literals', () => {
        const routeFiles = [
            { name: 'moderate', file: 'routes/destinations/moderate.json' },
            { name: 'severe', file: 'routes/destinations/severe.json' },
            { name: 'comparison', file: 'routes/destinations/comparison.json' },
        ];

        for (const { name, file } of routeFiles) {
            const filePath = path.join(PUBLIC_DATA_DIR, file);
            expect(fs.existsSync(filePath)).toBe(true);

            const rawContent = fs.readFileSync(filePath, 'utf-8');
            expect(rawContent.includes('NaN')).toBe(false);
            expect(rawContent.includes('Infinity')).toBe(false);

            const data = JSON.parse(rawContent);
            expect(typeof data).toBe('object');
            expect(Object.keys(data).length).toBe(1248);
            expect(data).toHaveProperty('fac_0001');
        }
    });
});
