<?php

use Inertia\Testing\AssertableInertia as Assert;

test('floodevac dashboard loads successfully', function () {
    $response = $this->get(route('floodevac.dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('FloodEvac/Dashboard'));
});

test('public destinations geojson file exists and contains valid features', function () {
    $filePath = public_path('data/destinations.geojson');

    expect(file_exists($filePath))->toBeTrue();

    $content = file_get_contents($filePath);
    $data = json_decode($content, true);

    expect($data)->toBeArray()
        ->and($data['type'] ?? null)->toBe('FeatureCollection')
        ->and(count($data['features'] ?? []))->toBe(1248);
});

test('public flood raster PNG and JSON metadata artifacts exist for moderate and severe scenarios', function () {
    $scenarios = ['moderate', 'severe'];

    foreach ($scenarios as $scenario) {
        $jsonPath = public_path("data/flood/{$scenario}/flood_depth_web.json");
        $pngPath = public_path("data/flood/{$scenario}/flood_depth_web.png");

        expect(file_exists($jsonPath))->toBeTrue("Metadata JSON missing for scenario {$scenario}");
        expect(file_exists($pngPath))->toBeTrue("Overlay PNG missing for scenario {$scenario}");

        $jsonContent = file_get_contents($jsonPath);
        $metadata = json_decode($jsonContent, true);

        expect($metadata)->toBeArray()
            ->and($metadata['scenario'] ?? null)->toBe($scenario)
            ->and($metadata['leaflet_bounds'] ?? null)->toBeArray()
            ->and(isset($metadata['valid_max_depth_m']))->toBeTrue();
    }
});

test('public route GeoJSON and metadata artifacts exist and are valid for moderate and severe scenarios', function () {
    $scenarios = ['moderate', 'severe'];

    foreach ($scenarios as $scenario) {
        $geoPath = public_path("data/routes/{$scenario}/flood_aware_route.geojson");
        $metaPath = public_path("data/routes/{$scenario}/route_metadata.json");

        expect(file_exists($geoPath))->toBeTrue("Route GeoJSON missing for scenario {$scenario}");
        expect(file_exists($metaPath))->toBeTrue("Route metadata JSON missing for scenario {$scenario}");

        $geoData = json_decode(file_get_contents($geoPath), true);
        $metaData = json_decode(file_get_contents($metaPath), true);

        expect($geoData)->toBeArray()
            ->and($geoData['type'] ?? null)->toBe('FeatureCollection')
            ->and(count($geoData['features'] ?? []))->toBeGreaterThan(0)
            ->and($geoData['features'][0]['geometry']['type'] ?? null)->toBe('LineString');

        expect($metaData)->toBeArray()
            ->and($metaData['scenario'] ?? null)->toBe($scenario)
            ->and(isset($metaData['reachable']))->toBeTrue()
            ->and(isset($metaData['distance_m']))->toBeTrue()
            ->and(isset($metaData['travel_time_s']))->toBeTrue()
            ->and(isset($metaData['flood_exposed_length_m']))->toBeTrue();
    }
});

test('public route comparison JSON artifact exists and contains valid comparison fields', function () {
    $compPath = public_path('data/routes/route_comparison.json');

    expect(file_exists($compPath))->toBeTrue('Route comparison JSON missing');

    $compData = json_decode(file_get_contents($compPath), true);

    expect($compData)->toBeArray()
        ->and(isset($compData['route_changed']))->toBeTrue()
        ->and(isset($compData['became_unreachable']))->toBeTrue()
        ->and(isset($compData['distance_diff_m']))->toBeTrue()
        ->and(isset($compData['travel_time_diff_s']))->toBeTrue();
});

test('public per-destination route web artifacts exist and contain valid 1248 destination features without NaN/Infinity', function () {
    $basePath = public_path('data/routes/destinations');

    $files = [
        'moderate' => $basePath.'/moderate.json',
        'severe' => $basePath.'/severe.json',
        'comparison' => $basePath.'/comparison.json',
    ];

    foreach ($files as $name => $path) {
        expect(file_exists($path))->toBeTrue("Per-destination route artifact {$name}.json missing");

        $rawContent = file_get_contents($path);
        expect(str_contains($rawContent, 'NaN'))->toBeFalse("NaN literal found in {$name}.json");
        expect(str_contains($rawContent, 'Infinity'))->toBeFalse("Infinity literal found in {$name}.json");

        $data = json_decode($rawContent, true);
        expect($data)->toBeArray()
            ->and(count($data))->toBe(1248);

        // Check sample facility fac_0001
        expect(isset($data['fac_0001']))->toBeTrue("fac_0001 missing in {$name}.json");
    }
});
