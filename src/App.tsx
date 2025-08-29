import './App.scss';
import * as React from "react";
import { LuciadMap } from "./components/luciadmap/LuciadMap.tsx";
import { FullscreenButton } from "./components/fullscreen/FullscreenButton.tsx";
import { Attribution } from "./components/attribution/Attribution.tsx";
import { useRef, useState } from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type {Feature} from "@luciad/ria/model/feature/Feature.js";

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const App: React.FC = () => {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const onShowTime = (status: boolean, errorMessage?:string) => {
        if (status) {
            setLoading(false);
            setError(null);
            // fade in the content
            requestAnimationFrame(() => {
                if (contentRef.current) {
                    contentRef.current.style.opacity = "1";
                }
            });
        } else {
            setLoading(false);
            if (errorMessage) setError(errorMessage);
            else setError("Failed to load the data. Verify the data url");
        }
    };

    const handleFullscreen = () => {
        const elem = document.documentElement;
        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
    };

    const onGeometrySelected = (feature: Feature)=> {
        const props = feature.properties;
        console.log("Selected feature properties:", props);

        // Detect if running inside an iframe
        const isEmbedded = window.self !== window.top;

        if (isEmbedded) {
            // Send message to parent
            window.parent.postMessage(
                {
                    event: "SelectedItem",   // event name
                    properties: props,   // feature properties
                },
                "*" // You can restrict origin if needed
            );
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="App">
                {/* Loading or error overlay */}
                {loading && (
                    <div className="LoadingOverlay">
                        <span className="LoadingText">
                            {error ? error : "Loading"}
                        </span>
                    </div>
                )}

                {/* Main app content that fades in */}
                <div className="AppContent" ref={contentRef} style={{ opacity: 0 }}>
                    <LuciadMap onShowTime={onShowTime} geometrySelected={onGeometrySelected}/>
                    <FullscreenButton onClick={handleFullscreen} />
                    <Attribution text="Green Cubes" url="https://www.google.com" />
                </div>
                {(!loading && error) && (
                    <div className="Errorverlay">
                        <span>
                            {error}
                        </span>
                    </div>
                )}
            </div>
        </ThemeProvider>
    );
}

export default App;
