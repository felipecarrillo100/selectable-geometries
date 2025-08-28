# LuciadMap - URL Parameters

The `selectable-geometries` app allows you to dynamically display GeoJSON geometries in a 2D or 3D map.

The app is configured via **URL query parameters**. This enables loading different 3D datasets, setting the reference system to Cartesian XYZ. 

Optionally labels can be added.

## URL Parameters

| Parameter   | Type   | Default        | Description                                                                                              |
|-------------|--------|----------------|----------------------------------------------------------------------------------------------------------|
| `geojson`   | string | `null`         | URL to an **HSPC point cloud** file. If provided, the map loads the point cloud and zooms to its bounds. |
| `reference` | string | `null`         | Reference identifier, for instance: EPSG:4978.                                                           |

---

## Loading Behavior

1. **Reference System**
    - The map reference is set to the selected reference or defaults to Cartesian (`EPSG:4978`).

2. **Data Loading Priority**
    - If `geojson` is provided → load GeoJSON geometries.
    - Else → no 3D data layer is loaded.

3. **Automatic Zoom**
    - The map automatically zooms to the bounds of the loaded vector layer.

---

## Example URLs

### Load GeoJSON with Labels

```
https://mydomain.com/selecteble-geometrie?geojson=https://data.example.com/geometries.json&reference=EPSG:3857
```

---

## Notes

- Only **one main dataset** (`geojson`) is loaded at a time.
- Labels are optional.
