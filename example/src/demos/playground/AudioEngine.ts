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
    VoiceNodeData,
    SamplerNodeData,
} from './store';

import type { TriggerEvent } from '../../../../src/sequencer/types';

interface AudioNodeInstance {
    node: AudioNode;
    type: string;
    feedbackGain?: GainNode; // For delay feedback
    // Map handle ID (e.g., 'frequency') to AudioParam
    params?: Map<string, AudioParam>;
    // Map output handle ID to AudioNode (for InputNode multiple outputs)
    outputs?: Map<string, AudioNode>;
    // Custom data
    sequencerData?: any;
    pianoRollData?: any;
    adsrData?: any;
    voiceData?: any;
    lfoOsc?: OscillatorNode; // For LFO waveform updates
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
    private edges: Edge[] = [];
    private sampleBufferCache: Map<string, AudioBuffer> = new Map();

    constructor() {
        this.audioContext = null;
    }

    /**
     * Load a sample buffer from URL, with caching
     */
    async loadSamplerBuffer(_nodeId: string, url: string): Promise<AudioBuffer | null> {
        if (!this.audioContext) return null;

        // Check cache first
        if (this.sampleBufferCache.has(url)) {
            return this.sampleBufferCache.get(url)!;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`[AudioEngine] Failed to load sample: ${url}`);
                return null;
            }
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sampleBufferCache.set(url, audioBuffer);
            return audioBuffer;
        } catch (error) {
            console.warn(`[AudioEngine] Error loading sample ${url}:`, error);
            return null;
        }
    }

    // Track active sampler sources
    private activeSamplerSources: Map<string, AudioBufferSourceNode> = new Map();

    /**
     * Play a sampler (one-shot or looped)
     */
    playSampler(nodeId: string, data: { src: string; loop: boolean; playbackRate: number; detune: number }): void {
        if (!this.audioContext) {
            this.init();
        }
        const ctx = this.audioContext!;

        // Stop any existing playback first
        this.stopSampler(nodeId);

        // Get buffer from cache
        const buffer = this.sampleBufferCache.get(data.src);
        if (!buffer) {
            console.warn(`[AudioEngine] Buffer not loaded for ${data.src}`);
            // Try to load it
            this.loadSamplerBuffer(nodeId, data.src).then(loadedBuffer => {
                if (loadedBuffer) {
                    this.playSampler(nodeId, data);
                }
            });
            return;
        }

        // Create buffer source
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = data.loop;
        source.playbackRate.value = data.playbackRate;
        source.detune.value = data.detune;

        // Connect to destination (or to the sampler's output node if it exists)
        const instance = this.audioNodes.get(nodeId);
        if (instance && instance.node) {
            source.connect(instance.node);
        } else {
            // Fallback: connect to destination directly
            source.connect(ctx.destination);
        }

        // Track the source
        this.activeSamplerSources.set(nodeId, source);

        // Clean up when finished (for non-looping samples)
        const samplerNodeId = nodeId; // Capture for closure
        source.onended = () => {
            this.activeSamplerSources.delete(samplerNodeId);
            this.notifySamplerEnd(samplerNodeId);
        };

        // Start playback
        source.start(0);
    }

    /**
     * Stop a sampler playback
     */
    stopSampler(nodeId: string): void {
        const source = this.activeSamplerSources.get(nodeId);
        if (source) {
            try {
                source.stop();
            } catch {
                // Already stopped
            }
            this.activeSamplerSources.delete(nodeId);
        }
    }

    /**
     * Update sampler parameter in real-time
     */
    updateSamplerParam(nodeId: string, param: 'playbackRate' | 'detune', value: number): void {
        const source = this.activeSamplerSources.get(nodeId);
        if (source) {
            if (param === 'playbackRate') {
                source.playbackRate.value = value;
            } else if (param === 'detune') {
                source.detune.value = value;
            }
        }
    }

    // Callbacks for sampler end events
    private samplerEndCallbacks: Map<string, Set<() => void>> = new Map();

    /**
     * Subscribe to end-of-playback events for a sampler
     */
    onSamplerEnd(nodeId: string, callback: () => void): () => void {
        if (!this.samplerEndCallbacks.has(nodeId)) {
            this.samplerEndCallbacks.set(nodeId, new Set());
        }
        this.samplerEndCallbacks.get(nodeId)!.add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.samplerEndCallbacks.get(nodeId);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    /**
     * Notify subscribers that a sampler has ended
     */
    private notifySamplerEnd(nodeId: string): void {
        const callbacks = this.samplerEndCallbacks.get(nodeId);
        if (callbacks) {
            callbacks.forEach(cb => cb());
        }
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
                if (instance.type === 'stepSequencer') {
                    const seqInstance = instance as any;
                    if (seqInstance.sequencerData) {
                        const { steps, pattern, activeSteps } = seqInstance.sequencerData;

                        // Modulo beatNumber to steps count
                        const stepIndex = beatNumber % (steps || 16);

                        if (activeSteps[stepIndex]) {
                            const velocity = pattern[stepIndex] || 0.8;
                            const node = instance.node as ConstantSourceNode;

                            const secondsPerBeat = 60.0 / this.bpm;
                            const stepDuration = 0.25 * secondsPerBeat;

                            // 1. Direct Gate Output
                            node.offset.setValueAtTime(velocity, time);
                            node.offset.setValueAtTime(0, time + (stepDuration * 0.8)); // Release at 80%

                            // 2. Trigger connected ADSRs
                            const connectedEdges = this.edges.filter(e => e.source === id);
                            connectedEdges.forEach(edge => {
                                const targetInstance = this.audioNodes.get(edge.target);
                                if (targetInstance) {
                                    if (targetInstance.type === 'adsr') {
                                        this.triggerAdsr(edge.target, time, velocity, stepDuration * 0.8);
                                    } else if (targetInstance.type === 'voice') {
                                        this.triggerVoice(edge.target, time, velocity, stepDuration * 0.8);
                                    }
                                }
                            });
                        }
                    }
                }

                // Piano Roll handling
                if (instance.type === 'pianoRoll') {
                    const prInstance = instance as any;
                    if (prInstance.pianoRollData) {
                        const { steps, notes } = prInstance.pianoRollData;
                        const stepIndex = beatNumber % (steps || 16);

                        // Find notes that start at this step
                        const notesAtStep = notes.filter((n: any) => n.step === stepIndex);

                        if (notesAtStep.length > 0) {
                            const secondsPerBeat = 60.0 / this.bpm;
                            const stepDuration = 0.25 * secondsPerBeat;

                            notesAtStep.forEach((noteEvent: any) => {
                                const { pitch, duration, velocity } = noteEvent;
                                const noteDuration = duration * stepDuration;

                                // Trigger connected Voice nodes with pitch info
                                const connectedEdges = this.edges.filter(e => e.source === id);
                                connectedEdges.forEach(edge => {
                                    const targetInstance = this.audioNodes.get(edge.target);
                                    if (targetInstance && targetInstance.type === 'voice') {
                                        this.triggerVoiceWithPitch(edge.target, time, pitch, velocity, noteDuration * 0.9);
                                    }
                                });
                            });
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

    private triggerVoice(voiceId: string, time: number, velocity: number, duration: number) {
        const instance = this.audioNodes.get(voiceId);
        if (!instance || !instance.outputs) return;

        const freqSource = instance.outputs.get('note') as ConstantSourceNode;
        const gateSource = instance.outputs.get('gate') as ConstantSourceNode;
        const velocitySource = instance.outputs.get('velocity') as ConstantSourceNode;

        // 1. Frequency (Note)
        // Default to C4 (261.63 Hz) for now since Sequencer doesn't provide pitch
        if (freqSource) {
            // We can set a fixed note or random, but for consistency let's use C4
            // User can modulate this later if we add Pitch inputs to Voice
            freqSource.offset.setValueAtTime(261.63, time);
        }

        // 2. Gate
        if (gateSource) {
            gateSource.offset.setValueAtTime(1, time);
            gateSource.offset.setValueAtTime(0, time + duration);

            // Propagate Trigger to connected nodes (e.g. ADSR) via Gate handle
            // This simulates CV triggering for the scheduler-driven nodes
            const connectedEdges = this.edges.filter(e => e.source === voiceId && e.sourceHandle === 'gate');
            connectedEdges.forEach(edge => {
                const targetInstance = this.audioNodes.get(edge.target);
                if (targetInstance) {
                    if (targetInstance.type === 'adsr') {
                        this.triggerAdsr(edge.target, time, velocity, duration);
                    } else if (targetInstance.type === 'voice') {
                        this.triggerVoice(edge.target, time, velocity, duration);
                    }
                }
            });
        }

        if (velocitySource) {
            velocitySource.offset.setValueAtTime(velocity, time);
        }
    }

    /**
     * Trigger a Voice node with a specific MIDI pitch
     */
    private triggerVoiceWithPitch(voiceId: string, time: number, midiPitch: number, velocity: number, duration: number) {
        const instance = this.audioNodes.get(voiceId);
        if (!instance || !instance.outputs) return;

        const freqSource = instance.outputs.get('note') as ConstantSourceNode;
        const gateSource = instance.outputs.get('gate') as ConstantSourceNode;
        const velocitySource = instance.outputs.get('velocity') as ConstantSourceNode;

        // Convert MIDI pitch to frequency: f = 440 * 2^((n-69)/12)
        const frequency = 440 * Math.pow(2, (midiPitch - 69) / 12);

        // 1. Frequency (Note)
        if (freqSource) {
            freqSource.offset.setValueAtTime(frequency, time);
        }

        // 2. Gate
        if (gateSource) {
            gateSource.offset.setValueAtTime(1, time);
            gateSource.offset.setValueAtTime(0, time + duration);

            // Propagate Trigger to connected nodes (e.g. ADSR) via Gate handle
            const connectedEdges = this.edges.filter(e => e.source === voiceId && e.sourceHandle === 'gate');
            connectedEdges.forEach(edge => {
                const targetInstance = this.audioNodes.get(edge.target);
                if (targetInstance) {
                    if (targetInstance.type === 'adsr') {
                        this.triggerAdsr(edge.target, time, velocity, duration);
                    }
                }
            });
        }

        // 3. Velocity
        if (velocitySource) {
            velocitySource.offset.setValueAtTime(velocity, time);
        }
    }


    private triggerAdsr(adsrId: string, time: number, velocity: number, duration: number) {
        const instance = this.audioNodes.get(adsrId);
        if (!instance || !instance.adsrData) return;

        const { attack, decay, sustain, release } = instance.adsrData;
        const node = instance.node as ConstantSourceNode;
        const param = node.offset;

        // Cancel scheduled values
        param.cancelScheduledValues(time);

        // Attack
        param.setValueAtTime(0, time);
        param.linearRampToValueAtTime(velocity, time + attack);

        // Decay -> Sustain
        param.linearRampToValueAtTime(velocity * sustain, time + attack + decay);

        // Release (at end of step/gate)
        // Wait until gate is done (time + duration) to release?
        // ADSR typically: A->D->S (hold while gate high) -> R (when gate low)
        // Here we schedule the Release phase to start at `time + duration`
        // Note: If gate matches step duration, it's roughly rhythmic.

        param.setValueAtTime(velocity * sustain, time + duration); // Anchor for release
        param.linearRampToValueAtTime(0, time + duration + release);
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

        this.edges = edges;

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

        // Connect nodes based on edges
        edges.forEach((edge) => {
            const sourceInstance = this.audioNodes.get(edge.source);
            const targetInstance = this.audioNodes.get(edge.target);

            if (sourceInstance && targetInstance) {
                try {
                    // Determine source node (handle output)
                    let sourceNode: AudioNode = sourceInstance.node;
                    if (edge.sourceHandle && sourceInstance.outputs) {
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

                            // If connecting a Note node (absolute Hz) or Voice node (outputs Hz) to frequency, zero out the base frequency
                            if ((sourceInstance.type === 'note' || sourceInstance.type === 'voice') && edge.targetHandle === 'frequency') {
                                param.value = 0;
                            }
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

            // Start LFO oscillator if present
            if (instance.lfoOsc) {
                instance.lfoOsc.start();
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
        this.startScheduler();
    }

    /**
     * Stop all audio and cleanup
     */
    stop(): void {
        this.stopScheduler();
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
                    try { instance.node.stop(); } catch (e) { }
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
            case 'adsr': {
                const adsrData = data as any;
                const source = ctx.createConstantSource();
                source.offset.value = 0;
                return {
                    node: source,
                    type: 'adsr',
                    adsrData: {
                        attack: adsrData.attack,
                        decay: adsrData.decay,
                        sustain: adsrData.sustain,
                        release: adsrData.release
                    }
                };
            }
            case 'voice': {
                const voiceData = data as VoiceNodeData;
                const dummy = ctx.createGain(); // Dummy main node, we use outputs

                const outputs = new Map<string, AudioNode>();

                const freqSource = ctx.createConstantSource();
                freqSource.offset.value = 440;
                outputs.set('note', freqSource); // Handle ID 'note' (Frequency)

                const gateSource = ctx.createConstantSource();
                gateSource.offset.value = 0;
                outputs.set('gate', gateSource);

                const velocitySource = ctx.createConstantSource();
                velocitySource.offset.value = 0;
                outputs.set('velocity', velocitySource);

                return {
                    node: dummy,
                    type: 'voice',
                    outputs,
                    voiceData: {
                        portamento: voiceData.portamento
                    }
                };
            }
            case 'stepSequencer': {
                const seqData = data as any; // SequencerNodeData
                // Output is a ConstantSourceNode acting as a Control Signal (Trigger/Gate)
                const source = ctx.createConstantSource();
                source.offset.value = 0; // Default 0

                // Store data on instance for scheduler
                return {
                    node: source,
                    type: 'stepSequencer',
                    sequencerData: {
                        steps: seqData.steps,
                        pattern: seqData.pattern,
                        activeSteps: seqData.activeSteps
                    }
                };
            }
            case 'pianoRoll': {
                const prData = data as any; // PianoRollNodeData
                // Piano Roll also uses a ConstantSourceNode for output
                const source = ctx.createConstantSource();
                source.offset.value = 0;

                return {
                    node: source,
                    type: 'pianoRoll',
                    pianoRollData: {
                        steps: prData.steps,
                        octaves: prData.octaves,
                        baseNote: prData.baseNote,
                        notes: prData.notes || []
                    }
                };
            }
            case 'lfo': {
                const lfoData = data as any; // LFONodeData
                // Create oscillator for LFO
                const lfo = ctx.createOscillator();
                lfo.type = lfoData.waveform || 'sine';
                lfo.frequency.value = lfoData.rate || 1;

                // Create gain for depth control
                const depthGain = ctx.createGain();
                depthGain.gain.value = lfoData.depth || 500;

                // Connect LFO -> depthGain
                lfo.connect(depthGain);

                const params = new Map<string, AudioParam>();
                params.set('rate', lfo.frequency);
                params.set('depth', depthGain.gain);

                return {
                    node: depthGain, // Output the depthGain so it can modulate other params
                    type: 'lfo',
                    params,
                    lfoOsc: lfo // Store ref so we can update waveform
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
            case 'sampler': {
                const samplerData = data as SamplerNodeData;
                // Create a gain node as the main output
                // The actual sample playback will be handled via triggers
                const samplerOutput = ctx.createGain();
                samplerOutput.gain.value = 1;

                // Store sampler configuration for triggering
                const samplerInstance = {
                    node: samplerOutput,
                    type: 'sampler',
                    samplerData: {
                        src: samplerData.src,
                        loop: samplerData.loop,
                        playbackRate: samplerData.playbackRate,
                        detune: samplerData.detune,
                        buffer: null as AudioBuffer | null,
                    }
                };

                // Load the sample if src is provided
                if (samplerData.src) {
                    this.loadSamplerBuffer(samplerData.src, samplerData.src).then(buffer => {
                        if (buffer && samplerInstance.samplerData) {
                            samplerInstance.samplerData.buffer = buffer;
                        }
                    });
                }

                return samplerInstance;
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

        this.edges = edges;
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
                    if (edge.sourceHandle && sourceInstance.outputs) {
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

                            // If connecting a Note node (absolute Hz) or Voice node (outputs Hz) to frequency, zero out the base frequency
                            if ((sourceInstance.type === 'note' || sourceInstance.type === 'voice') && edge.targetHandle === 'frequency') {
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
        } else if (instance.type === 'stepSequencer') {
            const seqInstance = instance as any;
            if (seqInstance.sequencerData) {
                if ('pattern' in data) seqInstance.sequencerData.pattern = data.pattern;
                if ('activeSteps' in data) seqInstance.sequencerData.activeSteps = data.activeSteps;
            }
        } else if (instance.type === 'pianoRoll') {
            const prInstance = instance as any;
            if (prInstance.pianoRollData) {
                if ('notes' in data) prInstance.pianoRollData.notes = data.notes;
                if ('steps' in data) prInstance.pianoRollData.steps = data.steps;
            }
        } else if (instance.type === 'adsr') {
            const adsrInstance = instance as any;
            if (adsrInstance.adsrData) {
                if ('attack' in data) adsrInstance.adsrData.attack = data.attack;
                if ('decay' in data) adsrInstance.adsrData.decay = data.decay;
                if ('sustain' in data) adsrInstance.adsrData.sustain = data.sustain;
                if ('release' in data) adsrInstance.adsrData.release = data.release;
            }
        } else if (instance.type === 'voice') {
            if ('portamento' in data && instance.voiceData) {
                instance.voiceData.portamento = data.portamento;
            }
        } else if (instance.type === 'lfo') {
            // Update LFO rate (frequency of oscillator)
            if ('rate' in data && typeof data.rate === 'number' && instance.lfoOsc) {
                instance.lfoOsc.frequency.setTargetAtTime(data.rate, currentTime, 0.01);
            }
            // Update LFO depth (gain)
            if ('depth' in data && typeof data.depth === 'number' && instance.params) {
                const depthParam = instance.params.get('depth');
                if (depthParam) {
                    depthParam.setTargetAtTime(data.depth, currentTime, 0.01);
                }
            }
            // Update LFO waveform
            if ('waveform' in data && typeof data.waveform === 'string' && instance.lfoOsc) {
                instance.lfoOsc.type = data.waveform as OscillatorType;
            }
        }
    }

    get playing(): boolean {
        return this.isPlaying;
    }
}

// Singleton instance
export const audioEngine = new AudioEngine();
