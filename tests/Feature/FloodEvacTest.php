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
