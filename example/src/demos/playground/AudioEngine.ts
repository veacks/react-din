import type { Node, Edge } from '@xyflow/react';
import type {
    AudioNodeData,
    OscNodeData,
    GainNodeData,
    FilterNodeData,
    OutputNodeData,
    NoiseNodeData,
    DelayNodeData,
    ReverbNodeData,
    StereoPannerNodeData,
    MixerNodeData,
    InputNodeData,
    NoteNodeData,
} from './store';

interface AudioNodeInstance {
    node: AudioNode;
    type: string;
    feedbackGain?: GainNode; // For delay feedback
    // Map handle ID (e.g., 'frequency') to AudioParam
    params?: Map<string, AudioParam>;
    // Map output handle ID to AudioNode (for InputNode multiple outputs)
    outputs?: Map<string, AudioNode>;
}

/**
 * Creates a noise buffer for white/pink/brown noise
 */
function createNoiseBuffer(ctx: AudioContext, type: 'white' | 'pink' | 'brown'): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    } else if (type === 'pink') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < length; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }
    } else { // brown
        let lastOut = 0;
        for (let i = 0; i < length; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
        }
    }

    return buffer;
}

/**
 * Creates a simple impulse response for reverb
 */
function createReverbImpulse(ctx: AudioContext, decay: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * decay;
    const buffer = ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * i / length);
        }
    }

    return buffer;
}

/**
 * Audio Engine - Manages the actual Web Audio API graph
 */
export class AudioEngine {
    private audioContext: AudioContext | null = null;
    private audioNodes: Map<string, AudioNodeInstance> = new Map();
    private isPlaying = false;

    constructor() {
        this.audioContext = null;
    }

    /**
     * Initialize the AudioContext (requires user gesture)
     */
    init(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        return this.audioContext;
    }

    // Scheduler
    private nextNoteTime: number = 0.0;
    private current16thNote: number = 0;

    // Callbacks
    private stepCallbacks: Set<(step: number) => void> = new Set();

    // Subscribe to step events
    public subscribeStep(callback: (step: number) => void): () => void {
        this.stepCallbacks.add(callback);
        return () => this.stepCallbacks.delete(callback);
    }
    private scheduleAheadTime: number = 0.1; // seconds
    private lookahead: number = 25.0; // milliseconds
    private timerID: number | undefined = undefined;
    private bpm: number = 120;

    // ... (existing constructor)

    /**
     * Start the scheduler loop
     */
    private startScheduler() {
        if (this.timerID) return;

        const nextNote = () => {
            const secondsPerBeat = 60.0 / this.bpm;
            // 16th note = 0.25 of a beat
            this.nextNoteTime += 0.25 * secondsPerBeat;
            this.current16thNote++;
            if (this.current16thNote === 16) {
                this.current16thNote = 0;
            }
        };

        const scheduleNote = (beatNumber: number, time: number) => {
            // Notify UI (sync with audio time)
            if (this.audioContext) {
                const delay = (time - this.audioContext.currentTime) * 1000;
                if (delay >= 0) {
                    setTimeout(() => {
                        this.stepCallbacks.forEach(cb => cb(beatNumber));
                    }, delay);
                }
            }

            // Find all sequencer nodes
            this.audioNodes.forEach((instance, id) => {
                if (instance.type === 'sequencer') {
                    // We need access to the data to know pattern
                    // But instance only has the AudioNode.
                    // We need to look up the Node data from somewhere? 
                    // The AudioEngine doesn't explicitly store the latest 'data' object in instance, 
                    // but we can try to attach it or look it up if we passed 'nodes' to start().
                    // Current architecture: AudioEngine stores instances. 
                    // We need to update instance to store the active pattern/steps data 
                    // or access the Store... accessing Store from here is circular/bad for decoupling.
                    // BEST APPROACH: When createAudioNode or updateNode is called, store the relevant seq data on the instance.

                    const seqInstance = instance as any; // Cast to access custom data
                    if (seqInstance.sequencerData) {
                        const { steps, pattern, activeSteps } = seqInstance.sequencerData;

                        // Modulo beatNumber to steps count
                        const stepIndex = beatNumber % (steps || 16);

                        if (activeSteps[stepIndex]) {
                            const velocity = pattern[stepIndex] || 0.8;
                            const node = instance.node as ConstantSourceNode;

                            // Trigger: High
                            node.offset.setValueAtTime(velocity, time);
                            // Trigger: Low (Gate length 0.1s or 50% of step)
                            // A 16th note at 120bpm is 125ms. Let's do 80% gate.
                            const secondsPerBeat = 60.0 / this.bpm;
                            const stepDuration = 0.25 * secondsPerBeat;
                            node.offset.setValueAtTime(0, time + (stepDuration * 0.8)); // Release
                        }
                    }
                }
            });
        };

        const scheduler = () => {
            if (!this.audioContext) return;

            // while there are notes that will need to play before the next interval, 
            // schedule them and advance the pointer.
            while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
                scheduleNote(this.current16thNote, this.nextNoteTime);
                nextNote();
            }
            this.timerID = window.setTimeout(scheduler, this.lookahead);
        };

        this.current16thNote = 0;
        this.nextNoteTime = this.audioContext?.currentTime || 0;
        scheduler();
    }

    private stopScheduler() {
        if (this.timerID) {
            window.clearTimeout(this.timerID);
            this.timerID = undefined;
        }
    }

    /**
     * Build and start the audio graph from visual nodes
     */
    start(nodes: Node<AudioNodeData>[], edges: Edge[]): void {
        if (this.isPlaying) return;

        const ctx = this.init();
        this.cleanup();

        // Check for Transport node to set initial BPM
        const transportNode = nodes.find(n => n.data.type === 'transport');
        if (transportNode) {
            this.bpm = (transportNode.data as any).bpm || 120;
        }

        // Create audio nodes for each visual node
        nodes.forEach((node) => {
            const audioNode = this.createAudioNode(ctx, node);
            if (audioNode) {
                this.audioNodes.set(node.id, audioNode);
            }
        });

        // ... (existing connection logic) ...
        edges.forEach((edge) => {
            // ... existing connection loop ...
            // (Copying strictly from original file content to ensure context match if replacing block, 
            // but since I am using replace_file_content on the class, I must be careful not to delete logic. 
            // Ideally I should inject the scheduler methods and modify start/stop only.
            // But existing start() is huge. 
            // I will use REPLACE on specific blocks or the whole class if easier. 
            // The file is 600 lines. I should probably use multi_replace or carefully targeted replace.
            // I'll try to target `start` method and `createAudioNode` and insert scheduler methods.
        });

        // ...

        // Connect nodes based on edges
        edges.forEach((edge) => {
            const sourceInstance = this.audioNodes.get(edge.source);
            const targetInstance = this.audioNodes.get(edge.target);

            if (sourceInstance && targetInstance) {
                try {
                    // Determine source node (handle output)
                    let sourceNode: AudioNode = sourceInstance.node;
                    if (sourceInstance.type === 'input' && edge.sourceHandle && sourceInstance.outputs) {
                        const specificOutput = sourceInstance.outputs.get(edge.sourceHandle);
                        if (specificOutput) {
                            sourceNode = specificOutput;
                        }
                    }

                    // Connect to target AudioParam or AudioNode
                    if (targetInstance.params && edge.targetHandle && targetInstance.params.has(edge.targetHandle)) {
                        // Connect to AudioParam (modulation)
                        const param = targetInstance.params.get(edge.targetHandle);
                        if (param) {
                            sourceNode.connect(param);

                            // If connecting a Note node (absolute Hz) to frequency, zero out the base frequency
                            if (sourceInstance.type === 'note' && edge.targetHandle === 'frequency') {
                                param.value = 0;
                            }
                            // NEW: If connecting Sequencer to Gain, usually we want GAIN to be 0 base?
                            // But GainNode base value is the knob. 
                            // If we want Envelope/Gate behavior, user might need to set knob to 0 manually or we force it?
                            // let's leave it to user to set gain to 0 if modulation is full range.
                        }
                    } else {
                        // Standard Audio to Audio connection
                        sourceNode.connect(targetInstance.node);
                    }
                } catch (e) {
                    console.warn('Failed to connect nodes:', e);
                }
            }
        });

        // Connect output node ...
        const outputNode = nodes.find((n) => n.data.type === 'output');
        if (outputNode) {
            const outputInstance = this.audioNodes.get(outputNode.id);
            if (outputInstance) {
                outputInstance.node.connect(ctx.destination);
            }
        }

        // Start oscillators...
        this.audioNodes.forEach((instance) => {
            if (instance.node instanceof OscillatorNode) {
                instance.node.start();
            } else if (instance.node instanceof AudioBufferSourceNode) {
                instance.node.loop = true;
                instance.node.start();
            } else if (instance.node instanceof ConstantSourceNode) {
                instance.node.start();
            }

            if (instance.outputs) {
                instance.outputs.forEach(output => {
                    if (output instanceof ConstantSourceNode || output instanceof OscillatorNode) {
                        output.start();
                    }
                });
            }
        });

        this.isPlaying = true;
        this.startScheduler(); // START SCHEDULER
    }

    /**
     * Stop all audio and cleanup
     */
    stop(): void {
        this.stopScheduler(); // STOP SCHEDULER
        this.cleanup();
        this.isPlaying = false;
    }



    /**
     * Cleanup all audio nodes
     */
    private cleanup(): void {
        this.audioNodes.forEach((instance) => {
            try {
                if (instance.node instanceof OscillatorNode ||
                    instance.node instanceof AudioBufferSourceNode ||
                    instance.node instanceof ConstantSourceNode) {
                    instance.node.stop();
                }

                // Stop params
                if (instance.outputs) {
                    instance.outputs.forEach(output => {
                        if (output instanceof ConstantSourceNode || output instanceof OscillatorNode) {
                            try { output.stop(); } catch (e) { }
                        }
                    });
                }

                instance.node.disconnect();
            } catch (e) {
                // Ignore errors during cleanup
            }
        });
        this.audioNodes.clear();
    }

    /**
     * Create an AudioNode from a visual node
     */
    private createAudioNode(ctx: AudioContext, node: Node<AudioNodeData>): AudioNodeInstance | null {
        const data = node.data;

        switch (data.type) {
            case 'sequencer': {
                const seqData = data as any; // SequencerNodeData
                // Output is a ConstantSourceNode acting as a Control Signal (Trigger/Gate)
                const source = ctx.createConstantSource();
                source.offset.value = 0; // Default 0

                // Store data on instance for scheduler
                return {
                    node: source,
                    type: 'sequencer',
                    // @ts-ignore
                    sequencerData: {
                        steps: seqData.steps,
                        pattern: seqData.pattern,
                        activeSteps: seqData.activeSteps
                    }
                };
            }
            case 'transport': {
                return null;
            }
            case 'osc': {
                const oscData = data as OscNodeData;
                const osc = ctx.createOscillator();
                osc.type = oscData.waveform;
                osc.frequency.value = oscData.frequency;

                const params = new Map<string, AudioParam>();
                params.set('frequency', osc.frequency);

                return { node: osc, type: 'osc', params };
            }
            case 'gain': {
                const gainData = data as GainNodeData;
                const gain = ctx.createGain();
                gain.gain.value = gainData.gain;

                const params = new Map<string, AudioParam>();
                params.set('gain', gain.gain);

                return { node: gain, type: 'gain', params };
            }
            case 'filter': {
                const filterData = data as FilterNodeData;
                const filter = ctx.createBiquadFilter();
                filter.type = filterData.filterType;
                filter.frequency.value = filterData.frequency;
                filter.Q.value = filterData.q;

                const params = new Map<string, AudioParam>();
                params.set('frequency', filter.frequency);
                params.set('q', filter.Q);

                return { node: filter, type: 'filter', params };
            }
            case 'output': {
                const outputData = data as OutputNodeData;
                const masterGain = ctx.createGain();
                masterGain.gain.value = outputData.masterGain;
                return { node: masterGain, type: 'output' };
            }
            case 'noise': {
                const noiseData = data as NoiseNodeData;
                const buffer = createNoiseBuffer(ctx, noiseData.noiseType);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                return { node: source, type: 'noise' };
            }
            case 'delay': {
                const delayData = data as DelayNodeData;
                const delay = ctx.createDelay(5);
                delay.delayTime.value = delayData.delayTime;

                // Create feedback loop with gain
                const feedbackGain = ctx.createGain();
                feedbackGain.gain.value = delayData.feedback;
                delay.connect(feedbackGain);
                feedbackGain.connect(delay);

                return { node: delay, type: 'delay', feedbackGain };
            }
            case 'reverb': {
                const reverbData = data as ReverbNodeData;
                const convolver = ctx.createConvolver();
                convolver.buffer = createReverbImpulse(ctx, reverbData.decay);

                // Simple wet/dry mix using gains
                const wetGain = ctx.createGain();
                wetGain.gain.value = reverbData.mix;
                convolver.connect(wetGain);

                return { node: wetGain, type: 'reverb' };
            }
            case 'panner': {
                const pannerData = data as StereoPannerNodeData;
                const panner = ctx.createStereoPanner();
                panner.pan.value = pannerData.pan;
                return { node: panner, type: 'panner' };
            }
            case 'mixer': {
                // Mixer is just a gain node that sums inputs
                const mixerGain = ctx.createGain();
                mixerGain.gain.value = 1;
                return { node: mixerGain, type: 'mixer' };
            }
            case 'input': {
                const inputData = data as InputNodeData;
                // Main dummy node to hold reference (InputNode doesn't process audio itself usually, but holds params)
                const dummy = ctx.createGain();

                const outputs = new Map<string, AudioNode>();

                // Create BPM constant source (could be LFO or clock in future)
                const bpmSource = ctx.createConstantSource();
                bpmSource.offset.value = inputData.bpm;
                outputs.set('bpm', bpmSource);

                // Create custom params as ConstantSourceNodes
                if (inputData.params) {
                    inputData.params.forEach((param, index) => {
                        const paramSource = ctx.createConstantSource();
                        paramSource.offset.value = param.value;
                        outputs.set(`param_${index}`, paramSource);
                    });
                }

                return { node: dummy, type: 'input', outputs };
            }
            case 'note': {
                const noteData = data as NoteNodeData;
                // NoteNode basically outputs frequency signal
                const freqSource = ctx.createConstantSource();
                freqSource.offset.value = noteData.frequency;

                return { node: freqSource, type: 'note' };
            }
            default:
                return null;
        }
    }

    /**
     * Refresh connections and sync nodes (Hot-swapping & Dynamic Add/Remove)
     */
    refreshConnections(nodes: Node<AudioNodeData>[], edges: Edge[]): void {
        if (!this.isPlaying || !this.audioContext) return;
        const ctx = this.audioContext;

        // 0. Sync Nodes: Create new ones, Remove deleted ones
        const activeIds = new Set(nodes.map(n => n.id));

        // Detect and remove deleted nodes
        for (const [id, instance] of this.audioNodes.entries()) {
            if (!activeIds.has(id)) {
                try {
                    // Stop sources
                    if (instance.node instanceof OscillatorNode ||
                        instance.node instanceof AudioBufferSourceNode ||
                        instance.node instanceof ConstantSourceNode) {
                        try { instance.node.stop(); } catch (e) { }
                    }
                    if (instance.outputs) {
                        instance.outputs.forEach(output => {
                            if (output instanceof ConstantSourceNode || output instanceof OscillatorNode) {
                                try { output.stop(); } catch (e) { }
                            }
                        });
                    }
                    instance.node.disconnect();
                    // Disconnect special internals
                    if (instance.type === 'delay' && instance.feedbackGain) {
                        instance.feedbackGain.disconnect();
                    }
                } catch (e) { }
                this.audioNodes.delete(id);
            }
        }

        // Detect and create new nodes
        nodes.forEach(node => {
            if (!this.audioNodes.has(node.id)) {
                const instance = this.createAudioNode(ctx, node);
                if (instance) {
                    this.audioNodes.set(node.id, instance);

                    // Start if it's a source
                    if (instance.node instanceof OscillatorNode) {
                        instance.node.start();
                    } else if (instance.node instanceof AudioBufferSourceNode) {
                        instance.node.loop = true;
                        instance.node.start();
                    } else if (instance.node instanceof ConstantSourceNode) {
                        instance.node.start();
                    }

                    // Start outputs (params)
                    if (instance.outputs) {
                        instance.outputs.forEach(output => {
                            if (output instanceof ConstantSourceNode || output instanceof OscillatorNode) {
                                output.start();
                            }
                        });
                    }
                }
            }
        });

        // 1. Disconnect all nodes to clear graph wiring (so we can re-wire freshly)
        this.audioNodes.forEach((instance) => {
            try {
                instance.node.disconnect();
                if (instance.type === 'delay' && instance.feedbackGain) {
                    instance.feedbackGain.disconnect();
                }
                // Reverb/others usually don't need distinct internal disconnect if they are single nodes or encapsulated
                // But Delay loop is external to the main "node" (variable feedbackGain)
            } catch (e) { }
        });

        // 2. Re-establish internal paths
        this.audioNodes.forEach((instance) => {
            if (instance.type === 'delay' && instance.feedbackGain) {
                instance.node.connect(instance.feedbackGain);
                instance.feedbackGain.connect(instance.node as AudioNode);
            }
        });

        // 3. Re-connect edges
        edges.forEach((edge) => {
            const sourceInstance = this.audioNodes.get(edge.source);
            const targetInstance = this.audioNodes.get(edge.target);


            if (sourceInstance && targetInstance) {
                try {
                    // Determine source node (handle output)
                    let sourceNode: AudioNode = sourceInstance.node;
                    if (sourceInstance.type === 'input' && edge.sourceHandle && sourceInstance.outputs) {
                        const specificOutput = sourceInstance.outputs.get(edge.sourceHandle);
                        if (specificOutput) {
                            sourceNode = specificOutput;
                        }
                    }

                    // Connect to target AudioParam or AudioNode
                    if (targetInstance.params && edge.targetHandle && targetInstance.params.has(edge.targetHandle)) {
                        // Connect to AudioParam (modulation)
                        const param = targetInstance.params.get(edge.targetHandle);
                        if (param) {
                            sourceNode.connect(param);

                            // If connecting a Note node (absolute Hz) to frequency, zero out the base frequency
                            if (sourceInstance.type === 'note' && edge.targetHandle === 'frequency') {
                                param.value = 0;
                            }
                        }
                    } else {
                        // Standard Audio to Audio connection
                        sourceNode.connect(targetInstance.node);
                    }
                } catch (e) {
                    console.warn('Failed to reconnect nodes:', e);
                }
            }
        });

        // 4. Re-connect output to destination
        const outputNode = nodes.find((n) => n.data.type === 'output');
        if (outputNode) {
            const outputInstance = this.audioNodes.get(outputNode.id);
            if (outputInstance) {
                outputInstance.node.connect(this.audioContext.destination);
            }
        }
    }

    /**
     * Update a specific parameter in real-time
     */
    updateNode(nodeId: string, data: Partial<AudioNodeData>): void {
        const instance = this.audioNodes.get(nodeId);

        // Update BPM global if transport update
        if ('bpm' in data && typeof data.bpm === 'number') {
            this.bpm = data.bpm;
        }

        if (!instance || !this.audioContext) return;

        const currentTime = this.audioContext.currentTime;

        if (instance.type === 'osc') {
            const node = instance.node as OscillatorNode;
            if ('frequency' in data && typeof data.frequency === 'number') {
                node.frequency.setTargetAtTime(data.frequency, currentTime, 0.01);
            }
            if ('detune' in data && typeof data.detune === 'number') {
                node.detune.setTargetAtTime(data.detune, currentTime, 0.01);
            }
            if ('waveform' in data && typeof data.waveform === 'string') {
                node.type = data.waveform as OscillatorType;
            }
        } else if (instance.type === 'gain') {
            const node = instance.node as GainNode;
            if ('gain' in data && typeof data.gain === 'number') {
                node.gain.setTargetAtTime(data.gain, currentTime, 0.01);
            }
        } else if (instance.type === 'filter') {
            const node = instance.node as BiquadFilterNode;
            if ('frequency' in data && typeof data.frequency === 'number') {
                node.frequency.setTargetAtTime(data.frequency, currentTime, 0.01);
            }
            if ('q' in data && typeof data.q === 'number') {
                node.Q.setTargetAtTime(data.q, currentTime, 0.01);
            }
            if ('detune' in data && typeof data.detune === 'number') {
                node.detune.setTargetAtTime(data.detune, currentTime, 0.01);
            }
            if ('gain' in data && typeof data.gain === 'number') {
                node.gain.setTargetAtTime(data.gain, currentTime, 0.01);
            }
            if ('filterType' in data && typeof data.filterType === 'string') {
                node.type = data.filterType as BiquadFilterType;
            }
        } else if (instance.type === 'input') {
            const inputData = data as InputNodeData;
            // Update BPM if changed
            if ('bpm' in inputData && instance.outputs?.has('bpm')) {
                const bpmNode = instance.outputs.get('bpm') as ConstantSourceNode;
                bpmNode.offset.setTargetAtTime(inputData.bpm, currentTime, 0.01);
            }
            // Update params
            if ('params' in inputData && instance.outputs) {
                inputData.params.forEach((param, index) => {
                    const paramId = `param_${index}`;
                    if (instance.outputs!.has(paramId)) {
                        const paramNode = instance.outputs!.get(paramId) as ConstantSourceNode;
                        paramNode.offset.setTargetAtTime(param.value, currentTime, 0.01);
                    }
                });
            }
        } else if (instance.type === 'note') {
            const noteData = data as NoteNodeData;
            const node = instance.node as ConstantSourceNode;
            if ('frequency' in noteData) {
                node.offset.setTargetAtTime(noteData.frequency, currentTime, 0.01);
            }
        } else if (instance.type === 'delay') {
            const node = instance.node as DelayNode;
            if ('delayTime' in data && typeof data.delayTime === 'number') {
                node.delayTime.setTargetAtTime(data.delayTime, currentTime, 0.01);
            }
            if ('feedback' in data && typeof data.feedback === 'number' && instance.feedbackGain) {
                instance.feedbackGain.gain.setTargetAtTime(data.feedback, currentTime, 0.01);
            }
        } else if (instance.type === 'reverb') {
            const node = instance.node as GainNode; // We return wetGain as the node
            if ('mix' in data && typeof data.mix === 'number') {
                node.gain.setTargetAtTime(data.mix, currentTime, 0.01);
            }
            // NOTE: 'decay' cannot be updated in real-time easily as it requires re-generating the impulse buffer.
            // We can accept this limitation or try to swap buffer (complex).
        } else if (instance.type === 'panner') {
            const node = instance.node as StereoPannerNode;
            if ('pan' in data && typeof data.pan === 'number') {
                node.pan.setTargetAtTime(data.pan, currentTime, 0.01);
            }
        } else if (instance.type === 'output') {
            const node = instance.node as GainNode;
            if ('masterGain' in data && typeof data.masterGain === 'number') {
                node.gain.setTargetAtTime(data.masterGain, currentTime, 0.01);
            }
        } else if (instance.type === 'sequencer') {
            const seqInstance = instance as any;
            // Update internal data
            if (seqInstance.sequencerData) {
                if ('pattern' in data) seqInstance.sequencerData.pattern = data.pattern;
                if ('activeSteps' in data) seqInstance.sequencerData.activeSteps = data.activeSteps;
            }
        }
    }

    get playing(): boolean {
        return this.isPlaying;
    }
}

// Singleton instance
export const audioEngine = new AudioEngine();
