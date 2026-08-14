<?php

use Inertia\Testing\AssertableInertia as Assert;

test('floodevac dashboard loads successfully', function () {
    $response = $this->get(route('floodevac.dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('FloodEvac/Dashboard'));
});
