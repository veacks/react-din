import React, { useMemo, useState } from 'react';
import { useAudioGraphStore, type AudioNodeData, type InputNodeData, type InputParam, type UiTokensNodeData } from './store';
import { CodeGenerator } from './CodeGenerator';
import { formatConnectedValue, useTargetHandleConnection } from './paramConnections';
import {
    getInspectablePrimitiveEntries,
    getNodeDisplayLabel,
    getNodeInlineControls,
    getNodeInspectorSections,
    getNodeUiSchema,
    isTokenParamNode,
    type NodeInspectorField,
    type NodeInspectorSection,
    type NodeHandleRole,
} from './nodeUiRegistry';
import { UI_TOKEN_IDS, createUiTokenParam } from './uiTokens';

interface InspectorRowProps {
    nodeId: string;
    nodeData: AudioNodeData;
    field: NodeInspectorField;
    updateNodeData: (nodeId: string, data: Partial<AudioNodeData>) => void;
}

interface PrimitiveRowsProps {
    nodeId: string;
    updateNodeData: (nodeId: string, data: Partial<AudioNodeData>) => void;
    entries: Array<{ key: string; value: string | number | boolean | null | undefined }>;
}

function getStableId(prefix: string) {
    return `${prefix}-${typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

function isPrimitiveValue(value: unknown): value is string | number | boolean | null | undefined {
    return typeof value === 'string'
        || typeof value === 'number'
        || typeof value === 'boolean'
        || value === null
        || value === undefined;
}

function nodeDataValue(nodeData: AudioNodeData, key: string): unknown {
    return (nodeData as Record<string, unknown>)[key];
}

function updateNodeField(
    updateNodeData: (nodeId: string, data: Partial<AudioNodeData>) => void,
    nodeId: string,
    key: string,
    value: unknown
) {
    updateNodeData(nodeId, { [key]: value } as Partial<AudioNodeData>);
}

function InspectorRow({ nodeId, nodeData, field, updateNodeData }: InspectorRowProps) {
    const targetHandle = field.handleId && (field.kind === 'number' || field.kind === 'range') ? field.handleId : '';
    const targetHandleInfo = useTargetHandleConnection(nodeId, targetHandle);

    const value = nodeDataValue(nodeData, field.key);
    const isConnectedTarget = Boolean(field.handleId && targetHandleInfo.connected && (field.kind === 'number' || field.kind === 'range'));

    return (
        <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-muted)]/70 p-3">
            <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-subtle)]">
                        {field.label}
                    </div>
                    {field.description && (
                        <div className="mt-1 text-[10px] leading-4 text-[var(--text-subtle)]">
                            {field.description}
                        </div>
                    )}
                </div>
                {field.handleId && (
                    <span className="rounded-full border border-[var(--panel-border)] px-2 py-0.5 text-[10px] font-mono text-[var(--text-subtle)]">
                        {field.handleId}
                    </span>
                )}
            </div>

            {field.kind === 'checkbox' && (
                <label className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2">
                    <span className="text-[11px] text-[var(--text)]">{field.label}</span>
                    <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(event) => updateNodeField(updateNodeData, nodeId, field.key, event.target.checked)}
                        className="h-4 w-4 accent-[var(--accent)]"
                    />
                </label>
            )}

            {field.kind === 'select' && (
                <label className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2">
                    <span className="text-[11px] text-[var(--text)]">{field.label}</span>
                    <select
                        value={typeof value === 'string' ? value : field.options[0]?.value ?? ''}
                        onChange={(event) => updateNodeField(updateNodeData, nodeId, field.key, event.target.value)}
                        className="min-w-0 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-muted)] px-2 py-1 text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                    >
                        {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            {field.kind === 'text' && (
                <label className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2">
                    <span className="text-[11px] text-[var(--text)]">{field.label}</span>
                    <input
                        type="text"
                        value={typeof value === 'string' ? value : ''}
                        placeholder={field.placeholder}
                        onChange={(event) => updateNodeField(updateNodeData, nodeId, field.key, event.target.value)}
                        className="min-w-0 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-muted)] px-2 py-1 text-[11px] text-[var(--text)] placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)] focus:outline-none"
                    />
                </label>
            )}

            {field.kind === 'number' && (
                <label className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2">
                    <span className="text-[11px] text-[var(--text)]">{field.label}</span>
                    {isConnectedTarget ? (
                        <div className="flex items-center gap-2">
                            <span className="rounded-full border border-[var(--accent)]/35 bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--accent)]">
                                Connected {formatConnectedValue(targetHandleInfo.value)}
                            </span>
                        </div>
                    ) : (
                        <input
                            type="number"
                            value={typeof value === 'number' ? value : 0}
                            min={field.min}
                            max={field.max}
                            step={field.step ?? 0.01}
                            onChange={(event) => updateNodeField(updateNodeData, nodeId, field.key, Number(event.target.value))}
                            className="w-24 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-muted)] px-2 py-1 text-right text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                        />
                    )}
                </label>
            )}

            {field.kind === 'range' && (
                <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2">
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-[var(--text)]">{field.label}</span>
                        {isConnectedTarget ? (
                            <span className="rounded-full border border-[var(--accent)]/35 bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--accent)]">
                                Connected {formatConnectedValue(targetHandleInfo.value, field.displayValue)}
                            </span>
                        ) : (
                            <span className="font-mono text-[10px] text-[var(--accent)]">
                                {formatConnectedValue(typeof value === 'number' ? value : 0, field.displayValue)}
                            </span>
                        )}
                    </div>
                    {isConnectedTarget ? (
                        <div className="rounded-lg border border-dashed border-[var(--panel-border)] px-3 py-2 text-[10px] text-[var(--text-subtle)]">
                            Slider hidden while the handle is connected.
                        </div>
                    ) : (
                        <input
                            type="range"
                            min={field.min}
                            max={field.max}
                            step={field.step ?? 0.01}
                            value={typeof value === 'number' ? value : field.min}
                            onChange={(event) => updateNodeField(updateNodeData, nodeId, field.key, Number(event.target.value))}
                            className="w-full accent-[var(--accent)]"
                        />
                    )}
                </div>
            )}

            {field.kind === 'params' && (
                <div className="rounded-xl border border-dashed border-[var(--panel-border)] px-3 py-2 text-[10px] text-[var(--text-subtle)]">
                    {field.description ?? 'Parameters are managed inline in the node and exposed here for workspace-level editing.'}
                </div>
            )}
        </div>
    );
}

function PrimitiveRows({ nodeId, updateNodeData, entries }: PrimitiveRowsProps) {
    if (entries.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-[var(--panel-border)] px-3 py-4 text-[10px] text-[var(--text-subtle)]">
                No additional primitive properties are available for this node.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {entries.map((entry) => {
                const rawValue = entry.value;
                const label = entry.key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
                return (
                    <div key={entry.key} className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-muted)]/70 p-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-subtle)]">
                                {label}
                            </span>
                            <span className="rounded-full border border-[var(--panel-border)] px-2 py-0.5 text-[10px] font-mono text-[var(--text-subtle)]">
                                {entry.key}
                            </span>
                        </div>
                        {typeof rawValue === 'boolean' ? (
                            <label className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2">
                                <span className="text-[11px] text-[var(--text)]">{label}</span>
                                <input
                                    type="checkbox"
                                    checked={rawValue}
                                    onChange={(event) => updateNodeField(updateNodeData, nodeId, entry.key, event.target.checked)}
                                    className="h-4 w-4 accent-[var(--accent)]"
                                />
                            </label>
                        ) : typeof rawValue === 'number' ? (
                            <label className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2">
                                <span className="text-[11px] text-[var(--text)]">{label}</span>
                                <input
                                    type="number"
                                    value={rawValue}
                                    onChange={(event) => updateNodeField(updateNodeData, nodeId, entry.key, Number(event.target.value))}
                                    className="w-24 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-muted)] px-2 py-1 text-right text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                                />
                            </label>
                        ) : (
                            <label className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2">
                                <span className="text-[11px] text-[var(--text)]">{label}</span>
                                <input
                                    type="text"
                                    value={typeof rawValue === 'string' ? rawValue : ''}
                                    onChange={(event) => updateNodeField(updateNodeData, nodeId, entry.key, event.target.value)}
                                    className="min-w-0 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-muted)] px-2 py-1 text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                                />
                            </label>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function InspectorSectionView({
    section,
    nodeId,
    nodeData,
    updateNodeData,
    collapsed,
    onToggle,
}: {
    section: NodeInspectorSection;
    nodeId: string;
    nodeData: AudioNodeData;
    updateNodeData: (nodeId: string, data: Partial<AudioNodeData>) => void;
    collapsed: boolean;
    onToggle: () => void;
}) {
    const handledKeys = section.fields.map((field) => field.key);
    const primitiveEntries = getInspectablePrimitiveEntries(nodeData, handledKeys);

    return (
        <section className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)]">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                aria-expanded={!collapsed}
            >
                <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-subtle)]">
                        {section.title}
                    </div>
                    {section.description && (
                        <div className="mt-1 text-[10px] leading-4 text-[var(--text-subtle)]">
                            {section.description}
                        </div>
                    )}
                </div>
                <span className="rounded-full border border-[var(--panel-border)] px-2 py-0.5 text-[10px] font-mono text-[var(--text-subtle)]">
                    {collapsed ? 'Open' : 'Close'}
                </span>
            </button>
            {!collapsed && (
                <div className="border-t border-[var(--panel-border)] px-4 py-4">
                    <div className="space-y-3">
                        {section.fields.map((field) => (
                            <InspectorRow
                                key={field.key}
                                nodeId={nodeId}
                                nodeData={nodeData}
                                field={field}
                                updateNodeData={updateNodeData}
                            />
                        ))}
                    </div>
                    {primitiveEntries.length > 0 && (
                        <div className="mt-4">
                            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-subtle)]">
                                Advanced
                            </div>
                            <PrimitiveRows
                                nodeId={nodeId}
                                updateNodeData={updateNodeData}
                                entries={primitiveEntries}
                            />
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

function TokenParamEditor({
    nodeId,
    nodeData,
    updateNodeData,
}: {
    nodeId: string;
    nodeData: InputNodeData | UiTokensNodeData;
    updateNodeData: (nodeId: string, data: Partial<AudioNodeData>) => void;
}) {
    const [newParamName, setNewParamName] = useState('');

    const params = nodeData.params ?? [];
    const isUiTokensNode = nodeData.type === 'uiTokens';

    const handleAddParam = () => {
        const trimmedName = newParamName.trim();
        if (!trimmedName) return;

        const tokenParam = isUiTokensNode && (UI_TOKEN_IDS as readonly string[]).includes(trimmedName)
            ? createUiTokenParam(trimmedName as (typeof UI_TOKEN_IDS)[number])
            : {
                id: getStableId('param'),
                name: trimmedName,
                label: trimmedName,
                type: 'float' as const,
                defaultValue: 0,
                value: 0,
                min: 0,
                max: isUiTokensNode ? 9999 : 1,
            };

        updateNodeData(nodeId, { params: [...params, tokenParam] });
        setNewParamName('');
    };

    const handleUpdateParam = (index: number, updates: Partial<InputParam>) => {
        const nextParams = [...params];
        nextParams[index] = { ...nextParams[index], ...updates };
        updateNodeData(nodeId, { params: nextParams });
    };

    const handleRemoveParam = (index: number) => {
        const nextParams = [...params];
        nextParams.splice(index, 1);
        updateNodeData(nodeId, { params: nextParams });
    };

    return (
        <section className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)]">
            <div className="border-b border-[var(--panel-border)] px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-subtle)]">
                    {isUiTokensNode ? 'Tokens' : 'Params'}
                </div>
                <div className="mt-1 text-[10px] leading-4 text-[var(--text-subtle)]">
                    {isUiTokensNode
                        ? 'UI tokens are numeric sources intended for product chrome, theming, and feedback.'
                        : 'Parameters are exposed as stable handles and can be edited individually.'}
                </div>
            </div>

            <div className="space-y-3 px-4 py-4">
                {params.map((param, index) => (
                    <div key={param.id} className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-muted)]/70 p-3">
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-subtle)]">
                                    Parameter
                                </div>
                                <div className="mt-1 font-mono text-[10px] text-[var(--text-subtle)]">
                                    {param.id}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveParam(index)}
                                className="rounded-full border border-[var(--panel-border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)] transition hover:border-[var(--danger)] hover:text-[var(--danger)]"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2">
                                <span className="text-[11px] text-[var(--text)]">Label</span>
                                <input
                                    type="text"
                                    value={param.label || param.name}
                                    onChange={(event) => handleUpdateParam(index, { label: event.target.value, name: event.target.value })}
                                    className="min-w-0 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-muted)] px-2 py-1 text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                                />
                            </label>
                            <label className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2">
                                <span className="text-[11px] text-[var(--text)]">Default</span>
                                <input
                                    type="number"
                                    value={param.defaultValue}
                                    onChange={(event) => handleUpdateParam(index, { defaultValue: Number(event.target.value), value: Number(event.target.value) })}
                                    step="0.01"
                                    className="w-24 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-muted)] px-2 py-1 text-right text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                                />
                            </label>
                            <label className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2">
                                <span className="text-[11px] text-[var(--text)]">Min</span>
                                <input
                                    type="number"
                                    value={param.min}
                                    onChange={(event) => handleUpdateParam(index, { min: Number(event.target.value) })}
                                    step="0.01"
                                    className="w-24 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-muted)] px-2 py-1 text-right text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                                />
                            </label>
                            <label className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2">
                                <span className="text-[11px] text-[var(--text)]">Max</span>
                                <input
                                    type="number"
                                    value={param.max}
                                    onChange={(event) => handleUpdateParam(index, { max: Number(event.target.value) })}
                                    step="0.01"
                                    className="w-24 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-muted)] px-2 py-1 text-right text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                                />
                            </label>
                            <label className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2">
                                <span className="text-[11px] text-[var(--text)]">Current</span>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min={param.min}
                                        max={param.max}
                                        step="0.01"
                                        value={param.value}
                                        onChange={(event) => handleUpdateParam(index, { value: Number(event.target.value) })}
                                        className="w-36 accent-[var(--accent)]"
                                    />
                                    <span className="w-16 text-right font-mono text-[10px] text-[var(--accent)]">
                                        {param.value.toFixed(2)}
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>
                ))}

                <div className="rounded-2xl border border-dashed border-[var(--panel-border)] bg-[var(--panel-muted)]/40 p-3">
                    <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-subtle)]">
                        Add Parameter
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder={isUiTokensNode ? 'New token name...' : 'New param name...'}
                            value={newParamName}
                            onChange={(event) => setNewParamName(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleAddParam();
                                }
                            }}
                            className="h-10 min-w-0 flex-1 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 text-[11px] text-[var(--text)] placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)] focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleAddParam}
                            className="h-10 rounded-xl border border-[var(--panel-border)] px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

const Inspector: React.FC = () => {
    const nodes = useAudioGraphStore((state) => state.nodes);
    const selectedNodeId = useAudioGraphStore((state) => state.selectedNodeId);
    const updateNodeData = useAudioGraphStore((state) => state.updateNodeData);

    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    const nodeData = selectedNode?.data as AudioNodeData | undefined;
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    const schema = useMemo(() => (nodeData ? getNodeUiSchema(nodeData.type) : null), [nodeData]);
    const nodeLabel = nodeData ? (nodeData.label?.trim() || schema?.label || getNodeDisplayLabel(nodeData.type)) : '';
    const inlineControls = nodeData ? getNodeInlineControls(nodeData.type) : [];
    const sections = nodeData ? getNodeInspectorSections(nodeData.type) : [];

    if (!selectedNode || !nodeData) {
        return <CodeGenerator />;
    }

    const handleToggleSection = (sectionId: string) => {
        setCollapsedSections((current) => ({
            ...current,
            [sectionId]: !current[sectionId],
        }));
    };

    const handleRoles = schema?.handleRoles ?? {};
    const handleRoleEntries = Object.entries(handleRoles) as Array<[string, NodeHandleRole]>;

    const extraPrimitiveEntries = getInspectablePrimitiveEntries(
        nodeData,
        [
            ...inlineControls,
            ...sections.flatMap((section) => section.fields.map((field) => field.key)),
        ]
    );

    const isTokenNode = isTokenParamNode(nodeData);

    return (
        <div className="flex h-full flex-col bg-[var(--panel-bg)] text-[11px] text-[var(--text)]">
            <div className="border-b border-[var(--panel-border)] bg-[var(--panel-muted)] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="truncate text-[13px] font-semibold text-[var(--text)]">
                            {nodeLabel}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                            <span>{nodeData.type}</span>
                            <span className="rounded-full border border-[var(--panel-border)] px-2 py-0.5 font-mono normal-case tracking-normal">
                                {selectedNode.id}
                            </span>
                        </div>
                    </div>
                    {schema && (
                        <span className="rounded-full border border-[var(--panel-border)] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                            {sections.length} sections
                        </span>
                    )}
                </div>

                {handleRoleEntries.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {handleRoleEntries.map(([handleId, role]) => (
                            <span
                                key={handleId}
                                className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] px-2 py-1 text-[10px] font-mono text-[var(--text-subtle)]"
                            >
                                {handleId} · {role}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                {isTokenNode && (
                    <TokenParamEditor
                        nodeId={selectedNode.id}
                        nodeData={nodeData as InputNodeData | UiTokensNodeData}
                        updateNodeData={updateNodeData}
                    />
                )}

                {sections.map((section) => (
                    <InspectorSectionView
                        key={section.id}
                        section={section}
                        nodeId={selectedNode.id}
                        nodeData={nodeData}
                        updateNodeData={updateNodeData}
                        collapsed={Boolean(collapsedSections[section.id])}
                        onToggle={() => handleToggleSection(section.id)}
                    />
                ))}

                {extraPrimitiveEntries.length > 0 && !isTokenNode && sections.length === 0 && (
                    <section className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)]">
                        <div className="border-b border-[var(--panel-border)] px-4 py-3">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-subtle)]">
                                Advanced
                            </div>
                            <div className="mt-1 text-[10px] leading-4 text-[var(--text-subtle)]">
                                Primitive node fields that are not yet part of the schema remain editable here.
                            </div>
                        </div>
                        <div className="px-4 py-4">
                            <PrimitiveRows
                                nodeId={selectedNode.id}
                                updateNodeData={updateNodeData}
                                entries={extraPrimitiveEntries.filter((entry) => isPrimitiveValue(entry.value))}
                            />
                        </div>
                    </section>
                )}

                {sections.length === 0 && extraPrimitiveEntries.length === 0 && !isTokenNode && (
                    <div className="rounded-2xl border border-dashed border-[var(--panel-border)] px-4 py-4 text-[10px] text-[var(--text-subtle)]">
                        No inspector schema is registered for this node yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inspector;
