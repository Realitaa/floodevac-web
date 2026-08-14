<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'Welcome')->name('home');
Route::inertia('/floodevac', 'FloodEvac/Dashboard')->name('floodevac.dashboard');
