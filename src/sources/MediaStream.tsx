import { useEffect, useRef, type FC } from 'react';
import type { MediaStreamProps } from './types';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';

/**
 * MediaStream source component for microphone or other stream input.
 *
 * @example
 * ```tsx
 * // Request microphone access
 * <MediaStream requestMic onStream={handleStream}>
 *   <Filter type="highpass" frequency={100}>
 *     <Gain gain={0.8} />
 *   </Filter>
 * </MediaStream>
 *
 * // Use existing stream
 * <MediaStream stream={existingStream}>
 *   <Analyzer onAnalyze={handleAnalysis} />
 * </MediaStream>
 * ```
 */
export const MediaStream: FC<MediaStreamProps> = ({
    children,
    nodeRef: externalRef,
    stream: providedStream,
    requestMic = false,
    constraints,
    onStream,
    onError,
}) => {
    const { context } = useAudio();
    const { outputNode } = useAudioOut();

    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Sync external ref
    useEffect(() => {
        if (externalRef) {
            (externalRef as React.MutableRefObject<MediaStreamAudioSourceNode | null>).current = sourceRef.current;
        }
    }, [externalRef, sourceRef.current]);

    // Request microphone or use provided stream
    useEffect(() => {
        if (!context) return;

        const setupStream = async () => {
            try {
                let mediaStream: MediaStream;

                if (providedStream) {
                    mediaStream = providedStream;
                } else if (requestMic) {
                    mediaStream = await navigator.mediaDevices.getUserMedia({
                        audio: constraints ?? true,
                        video: false,
                    });
                } else {
                    return;
                }

                streamRef.current = mediaStream;

                const source = context.createMediaStreamSource(mediaStream);
                if (outputNode) {
                    source.connect(outputNode);
                }

                sourceRef.current = source;
                onStream?.(mediaStream);

                if (externalRef) {
                    (externalRef as React.MutableRefObject<MediaStreamAudioSourceNode | null>).current = source;
                }
            } catch (error) {
                onError?.(error as Error);
            }
        };

        setupStream();

        return () => {
            if (sourceRef.current) {
                sourceRef.current.disconnect();
                sourceRef.current = null;
            }
            if (streamRef.current && !providedStream) {
                // Only stop tracks if we created the stream
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
        };
    }, [context, outputNode, providedStream, requestMic, constraints, onStream, onError, externalRef]);

    return (
        <AudioOutProvider node={sourceRef.current}>
            {children}
        </AudioOutProvider>
    );
};
