# FloodEvac Architecture & System Boundaries

This document defines the architectural boundary between the **Python FloodEvac Scientific Engine** and the **Laravel / Inertia / Vue Presentation Application**.

---

## 1. System Overview & Boundaries

```
┌────────────────────────────────────────────────────────┐
│             Python FloodEvac Engine                    │
│  - DEM & Hydrological Flood Modeling                  │
│  - Road Network Topology & Graph Construction          │
│  - Flood-Aware Dijkstra Routing Algorithm             │
│  - Evacuation Destination Vulnerability Analysis       │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ Exports Web-Ready Artifacts
                            ▼
┌────────────────────────────────────────────────────────┐
│             Static Web Artifacts (public/data/)        │
│  - destinations.geojson (1,248 destination points)     │
│  - flood/${scenario}/flood_depth_web.png (.json)       │
│  - routes/${scenario}/flood_aware_route.geojson (.json)│
│  - routes/route_comparison.json                        │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ Consumed via Browser fetch()
                            ▼
┌────────────────────────────────────────────────────────┐
│          Laravel + Inertia.js + Vue 3 Web UI           │
│  - Full-screen Leaflet Map & Layer Orchestration       │
│  - Client-Side Scenario Switching & In-Memory Caching  │
│  - Destination Filtering (Safety & Category)           │
│  - Interactive Popups & Metric Cards                   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Responsibilities

### Python FloodEvac Engine (Scientific Processing)
- Authoritative scientific computations, flood depth raster processing (`flood_depth.tif`), road network graph construction (`GraphML`), and Flood-Aware Dijkstra routing.
- Generates normalized, web-friendly EPSG:4326 GeoJSON points, PNG depth overlays with `leaflet_bounds` metadata, and route GeoJSON line features.

### Laravel / Inertia / Vue Application (Presentation & Interaction)
- Fullstack monolith responsible for presentation, layout, and client-side map interactions.
- Serves static web artifacts directly from `public/data/` using standard browser `fetch()`.
- **Does NOT** run scientific algorithms, Dijkstra routing, or raster transformations in PHP or JavaScript.
- **Does NOT** require database tables, REST API endpoints, or Axios for static dataset consumption.

---

## 3. Scientific Terminology Rules

- **Destination Facilities**: Referred to strictly as **"Potential Evacuation Destinations"** or **"Emergency Facilities"**. They are NOT labeled as "official shelters" or "guaranteed shelters".
- **Safety Status**: **"SAFE"** denotes scenario-based hazard classification (clear of inundation in the model) and does not constitute official shelter certification.
- **Route Visualization**: Described as a **"Flood-Aware Route"** (visualization derivative of the scientific routing result). It does not represent empirical traffic flow or official emergency instructions.
