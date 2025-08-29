import * as React from "react";

import "./LuciadMap.scss"
import {useEffect, useRef} from "react";
import {WebGLMap} from "@luciad/ria/view/WebGLMap.js";
import {getReference} from "@luciad/ria/reference/ReferenceProvider.js";
import {ViewToolIBar} from "../buttons/ViewToolIBar.tsx";
import {getRequestInitValues, loadBackground, loadGeoJson} from "./utils/GeoJSONLoader";
import type {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer.js";
import type {Feature} from "@luciad/ria/model/feature/Feature.js";

const WebMercator = "EPSG:3857"
// const CRS84 = "EPSG:4978";
const defaultProjection = WebMercator;


// Get reference from URL query params or default to EPSG:4978
const params = new URLSearchParams(window.location.search);

const referenceIdentifier = params.get("reference") || defaultProjection;
const geojsonUrl = params.get("geojson") || null;
const requestInit = getRequestInitValues(params);

const reference = getReference(referenceIdentifier);


interface Props {
    onShowTime?: (status: boolean, errorMessage?: string) => void;
    geometrySelected?: (feature: Feature) => void;
}

function addListenerOnSelectionChange(map: WebGLMap, featureLayer: FeatureLayer, callback?: (feature: Feature)=>void) {
    // This code will be called every time the selection change in the map
    map.on("SelectionChanged", () => {
        // Find a layer by ID in the map layerTree
        const layer = featureLayer;
        const selection = map.selectedObjects;
        // Verify only one layer / one feature is selected
        if (selection.length === 1 && selection[0].layer === layer) {
            if (selection[0].selected.length === 1) {
                const feature = selection[0].selected[0] as Feature;
                // Assign the controller to the map to edit the selected feature
                if (typeof callback === "function") callback(feature);
            }
        }
    });
}

export const LuciadMap: React.FC<Props> = (props: Props) => {

    const divRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<WebGLMap | null>(null);
    const activeLayer = useRef<FeatureLayer | null>(null);

    useEffect(() => {
        if (divRef.current) {
            mapRef.current = new WebGLMap(divRef.current, {reference});

            // const backgroundLayer = loadBackground("https://a.tile.openstreetmap.org/{z}/{x}/{-y}.png");
            const backgroundLayer = loadBackground("https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{-y}@2x.webp?sku=101uLgarUfM1u&access_token=pk.eyJ1Ijoic3Jpbml2YXNhbmFtYnVyaSIsImEiOiJjbTJpdWF2bXkwMXM4MmtxdDc5Nmh6OGVhIn0.iz4-yqZ__o9XKCqOj4Gn7w");
            mapRef.current?.layerTree.addChild(backgroundLayer);

            if (geojsonUrl) {
                loadGeoJson(geojsonUrl, requestInit).then(layer => {
                    try {
                        //Add the model to the map
                        mapRef.current?.layerTree.addChild(layer);
                        // Zoom to the point cloud location
                        //fit on the cities layer
                        const queryFinishedHandle = layer.workingSet.on("QueryFinished", () => {
                            if (layer.bounds) {
                                //#snippet layerFit
                                mapRef.current?.mapNavigator.fit({
                                    bounds: layer.bounds,
                                    animate: false
                                }).finally(()=>{
                                    if (mapRef.current) {
                                        mapRef.current.mapNavigator.constraints = {
                                            limitBounds: {
                                                bounds: mapRef.current.getMapBounds()[0],
                                                padding: {
                                                    top: 50,
                                                    right: 50
                                                }
                                            }
                                        }
                                    }
                                });
                                if (typeof props.onShowTime === "function") props.onShowTime(true);
                                //#endsnippet layerFit
                            }
                            queryFinishedHandle.remove();
                        });
                        if (mapRef.current) addListenerOnSelectionChange(mapRef.current, layer, props.geometrySelected);
                        activeLayer.current = layer;
                    } catch (_e) {
                        if (typeof props.onShowTime === "function") props.onShowTime(false);
                        if (mapRef.current && !layer.model.reference.equals(mapRef.current.reference)) {
                            console.log(`"Map and data are not in the same reference. Layer is in: ${layer.model.reference.identifier}`)
                        }
                    }
                }).catch(()=>{
                    if (typeof props.onShowTime === "function") props.onShowTime(false);
                    console.log(`Data unreachable`)
                });
            } else {
                if (typeof props.onShowTime === "function") props.onShowTime(false, "Missing GeoJSON URL");
            }
        }
        return () => {
            if (mapRef.current) mapRef.current.destroy();
            mapRef.current = null;
        }
    }, []);

    return (
        <div className="LuciadMap">
            <div className="LuciadMapElement" ref={divRef}/>
            <ViewToolIBar mapRef={mapRef} layerRef={activeLayer}/>
        </div>
    )
}


