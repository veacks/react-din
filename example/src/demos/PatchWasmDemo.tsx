import { graphDocumentToPatch, importPatch } from '@open-din/react';

/**
 * Minimal patch (osc → output) via `importPatch` → {@link PatchRenderer}, which loads `din-wasm`.
 * Other example routes use declarative WebAudio nodes only and never import WebAssembly.
 */
const WasmDemoPatch = importPatch(
    graphDocumentToPatch({
        name: 'WASM example',
        nodes: [
            {
                id: 'osc-1',
                position: { x: 0, y: 0 },
                data: {
                    type: 'osc',
                    label: 'Tone',
                    frequency: 330,
                    autoStart: true,
                },
            },
            {
                id: 'output-1',
                position: { x: 260, y: 0 },
                data: {
                    type: 'output',
                    label: 'Out',
                    gain: 0.12,
                },
            },
        ],
        edges: [
            {
                id: 'osc-out',
                source: 'osc-1',
                target: 'output-1',
                sourceHandle: 'out',
                targetHandle: 'in',
            },
        ],
    })
);

export function PatchWasmDemo() {
    return (
        <div className="demo">
            <h1>Patch (din-wasm)</h1>
            <p>
                Cette démo monte le renderer de patch : le runtime charge le module{' '}
                <code>din-wasm</code> (fichier <code>din_wasm_bg.wasm</code>). Les autres pages
                du playground utilisent uniquement les nœuds WebAudio React : aucune requête WASM
                dans ce cas.
            </p>
            <p className="demo-hint">
                Réseau (Filtre WASM ou « Wasm ») : cherchez <code>din_wasm_bg.wasm</code> ou une URL
                pointant vers ce binaire après chargement de la page (un clic pour démarrer
                l’audio peut être nécessaire).
            </p>
            <WasmDemoPatch />
        </div>
    );
}
