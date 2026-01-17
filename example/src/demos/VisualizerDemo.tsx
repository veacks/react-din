import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AudioProvider, Osc, Filter, Gain, useAudio, useAnalyzer } from 'react-din';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { InstancedBufferAttribute } from 'three';
import { MeshBasicNodeMaterial, WebGPURenderer, SpriteNodeMaterial } from 'three/webgpu';
import {
    time,
    uv,
    vec3,
    vec4,
    float,
    mix,
    mx_noise_vec3,
    uniform,
    storage,
    instanceIndex,
    vertexIndex,
    Fn
} from 'three/tsl';
import { PerspectiveCamera } from '@react-three/drei';

// --- Sound Component ---
const SoundScape = ({ mouseX, mouseY, isActive }: { mouseX: number, mouseY: number, isActive: boolean }) => {
    const cutoff = 200 + (Math.abs(mouseX) * 2000);
    const pitch = 50 + (mouseY * 50);
    const reactiveGain = isActive ? Math.min(Math.abs(mouseX) + Math.abs(mouseY), 0.5) : 0;

    return (
        <>
            <Gain gain={0.3}>
                <Filter frequency={cutoff} type="lowpass" Q={5}>
                    <Osc frequency={60} type="sawtooth" autoStart />
                </Filter>
            </Gain>
            <Gain gain={0.1}>
                <Osc frequency={110 + pitch} type="sine" autoStart />
            </Gain>
            <Gain gain={reactiveGain}>
                <Filter frequency={cutoff * 2} type="bandpass" Q={2}>
                    <Osc frequency={200 + (mouseX * 100)} type="triangle" autoStart />
                </Filter>
            </Gain>
        </>
    );
};

// --- Debug Component ---
const DebugOverlay = ({ setAudioLevel }: { setAudioLevel: (v: number) => void }) => {
    const { frequencyData } = useAnalyzer({ fftSize: 2048 });

    useFrame(() => {
        if (frequencyData) {
            let sum = 0;
            const bins = Math.min(50, frequencyData.length);
            for (let i = 0; i < bins; i++) sum += frequencyData[i];
            const avg = sum / bins / 255;
            setAudioLevel(avg);
        }
    });
    return null;
};

// --- Particle System ---
const ParticleSystem = ({ isRendererReady }: { isRendererReady: boolean }) => {
    const { gl, scene } = useThree();
    const count = 20000;
    const { frequencyData } = useAnalyzer({ fftSize: 2048 }); // Higher FFT size for better resolution

    // Uniforms
    const uTime = useMemo(() => uniform(0), []);
    const uAudio = useMemo(() => uniform(0), []);
    const uCursor = useMemo(() => uniform(new THREE.Vector3(0, 0, 0)), []);

    // Geometry & Material
    const { computeNode, material, geometry } = useMemo(() => {
        // 1. Buffers
        const positionArray = new Float32Array(count * 3);
        const velocityArray = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const r = 5 * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);

            positionArray[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positionArray[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positionArray[i * 3 + 2] = r * Math.cos(phi);
        }

        const posBuf = storage(new InstancedBufferAttribute(positionArray, 3), 'vec3', count);
        const velBuf = storage(new InstancedBufferAttribute(velocityArray, 3), 'vec3', count);

        // 2. Compute
        const update = Fn(() => {
            const p = posBuf.element(instanceIndex);
            const v = velBuf.element(instanceIndex);

            const flow = mx_noise_vec3(p.mul(0.5).add(uTime.mul(0.2))).mul(0.05);
            const diff = p.sub(uCursor);
            const dist = diff.length();
            const repel = diff.normalize().mul(float(1.0).div(dist.mul(dist).add(0.1))).mul(uAudio.add(0.2)).mul(0.05);

            const newV = v.mul(0.95).add(flow).add(repel);
            const centerReturn = p.mul(-0.01);

            v.assign(newV.add(centerReturn));
            p.assign(p.add(v));
        });

        const compute = update().compute(count);

        // 3. Material (SpriteNodeMaterial)
        const m = new SpriteNodeMaterial();

        // Screen-space UV for soft circle (Billboarded)
        // SpriteNodeMaterial uses standard UVs 0..1
        const dist = uv().sub(0.5).length();
        // Softer edge: power 3.0 instead of 2.0
        const alpha = float(0.5).sub(dist).mul(2.0).clamp(0, 1);
        const circle = alpha.pow(3.0);

        m.colorNode = vec4(0.9, 0.95, 1.0, circle); // Slight blue tint to white

        // Position: Access buffer via instanceIndex
        m.positionNode = posBuf.element(instanceIndex);

        // Dynamic Size
        m.scaleNode = float(0.05).add(uAudio.mul(0.3));

        m.transparent = true;
        m.depthWrite = false;
        m.blending = THREE.AdditiveBlending;

        // 4. Geometry (Instanced Plane)
        const geo = new THREE.InstancedBufferGeometry();
        const base = new THREE.PlaneGeometry(1, 1);
        geo.copy(base);
        geo.instanceCount = count;

        return { computeNode: compute, material: m, geometry: geo };
    }, []);

    // Background Node (Smoke Effect)
    useEffect(() => {
        // Color Palette (High Contrast Grayscale)
        const color1 = vec3(0.0, 0.0, 0.0);   // Pure Black
        const color2 = vec3(1., 1., 1.);   // Bright Grey

        // Noise pattern
        // We use uv() which in background context maps to screen
        const noiseScale = float(10.1);
        const timeScale = float(.1);

        const n = mx_noise_vec3(uv().mul(noiseScale).add(vec3(uTime.mul(timeScale), 0, uTime.mul(timeScale))));

        // Enhance contrast of the noise pattern itself
        let factor = n.r.add(1.0).mul(0.5);
        factor = factor.pow(1.5).clamp(0, 1);

        const bg = mix(color1, color2, factor);

        scene.backgroundNode = bg;

        return () => { scene.backgroundNode = null; };
    }, [scene]);

    useFrame((state, delta) => {
        if (!isRendererReady) return;

        uTime.value += delta;
        uCursor.value.set(state.pointer.x * 5, state.pointer.y * 5, 0);

        if (frequencyData) {
            let sum = 0;
            // Larger spectrum scan
            const bins = Math.min(100, frequencyData.length);
            for (let i = 0; i < bins; i++) sum += frequencyData[i];
            const avg = sum / bins / 255;
            uAudio.value = THREE.MathUtils.lerp(uAudio.value, avg, 0.2);
        }

        const renderer = state.gl;
        if (renderer instanceof WebGPURenderer) {
            renderer.compute(computeNode);
        }
    });

    return (
        <mesh
            geometry={geometry}
            material={material}
            frustumCulled={false}
        />
    );
};

export const VisualizerDemo = () => {
    const [interaction, setInteraction] = useState({ x: 0, y: 0, active: false });
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [debugAudioLevel, setDebugAudioLevel] = useState(0);
    const [rendererReady, setRendererReady] = useState(false);

    useEffect(() => {
        if (typeof (DeviceMotionEvent as any).requestPermission !== 'function') {
            setPermissionGranted(true);
        }
    }, []);

    const requestAccess = () => {
        // @ts-ignore
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            // @ts-ignore
            DeviceMotionEvent.requestPermission().then((res: string) => res === 'granted' && setPermissionGranted(true));
        } else {
            setPermissionGranted(true);
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        setInteraction({ x, y, active: true });
    };

    return (
        <div
            style={{ width: '100vw', height: '100vh', background: '#fff', position: 'relative' }}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setInteraction(prev => ({ ...prev, active: false }))}
        >
            <AudioProvider>
                {!permissionGranted && (
                    <div style={{ position: 'absolute', zIndex: 50, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <button onClick={requestAccess}>Enable Sensors</button>
                    </div>
                )}

                <SoundScape mouseX={interaction.x} mouseY={interaction.y} isActive={interaction.active} />

                <Canvas
                    style={{ filter: 'invert(1)' }}
                    gl={({ canvas }) => {
                        const renderer = new WebGPURenderer({
                            canvas,
                            antialias: false,
                            alpha: false,
                            trackTimestamp: false
                        });

                        const originalRender = renderer.render;
                        let isInitialized = false;

                        // @ts-ignore
                        renderer.render = (scene, camera) => {
                            if (isInitialized) {
                                originalRender.call(renderer, scene, camera);
                            }
                        };

                        renderer.init().then(() => {
                            isInitialized = true;
                            setRendererReady(true);
                        }).catch(console.error);

                        return renderer as unknown as THREE.WebGLRenderer;
                    }}
                >
                    <color attach="background" args={['#999999']} />
                    <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                    <DebugOverlay setAudioLevel={setDebugAudioLevel} />
                    <Suspense fallback={null}>
                        <ParticleSystem isRendererReady={rendererReady} />
                    </Suspense>
                </Canvas>

                {/* Debug Box */}
                <div style={{
                    position: 'absolute', bottom: 10, right: 10,
                    background: 'rgba(0,0,0,0.8)', color: '#0f0',
                    padding: '10px', fontFamily: 'monospace', fontSize: '12px',
                    zIndex: 100, pointerEvents: 'none', border: '1px solid #0f0'
                }}>
                    <div>DEBUG INFO</div>
                    <div>Audio Level: {debugAudioLevel.toFixed(3)}</div>
                    <div>Interaction: {interaction.active.toString()}</div>
                    <div>Renderer Ready: {rendererReady.toString()}</div>
                </div>

                <div style={{ position: 'absolute', bottom: 30, width: '100%', textAlign: 'center', pointerEvents: 'none', mixBlendMode: 'difference', color: 'white', zIndex: 10 }}>
                    <p>Audio Reactive Cloud</p>
                </div>
            </AudioProvider>
        </div>
    );
};

export default VisualizerDemo;
