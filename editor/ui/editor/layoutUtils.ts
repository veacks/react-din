import { type Node, type Edge, type XYPosition } from '@xyflow/react';
import { type AudioNodeData } from './store';
import { DEFAULT_NODE_SIZE } from './graphBuilders';

export const AUTO_LAYOUT_PADDING_X = 48;
export const AUTO_LAYOUT_PADDING_Y = 56;
export const AUTO_LAYOUT_COLUMN_GAP = 90;
export const AUTO_LAYOUT_ROW_GAP = 26;
export const AUTO_LAYOUT_BRANCH_GAP = 54;
export const AUTO_LAYOUT_COMPONENT_GAP_X = 120;
export const AUTO_LAYOUT_COMPONENT_GAP_Y = 96;

export const compareByCurrentPosition = (nodeById: Map<string, Node<AudioNodeData>>, leftId: string, rightId: string) => {
    const left = nodeById.get(leftId);
    const right = nodeById.get(rightId);
    if (!left || !right) return 0;
    if (left.position.x !== right.position.x) return left.position.x - right.position.x;
    return left.position.y - right.position.y;
};

export function computeAutoLayoutPositions(nodes: Node<AudioNodeData>[], edges: Edge[]): Map<string, XYPosition> {
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const positions = new Map<string, XYPosition>();
    if (nodes.length === 0) return positions;

    const getNodeWidth = (nodeId: string) => {
        const node = nodeById.get(nodeId);
        if (!node) return DEFAULT_NODE_SIZE.width;
        const measured = (node as Node<AudioNodeData> & { measured?: { width?: number; height?: number } }).measured;
        return measured?.width ?? DEFAULT_NODE_SIZE.width;
    };

    const getNodeHeight = (nodeId: string) => {
        const node = nodeById.get(nodeId);
        if (!node) return DEFAULT_NODE_SIZE.height;
        const measured = (node as Node<AudioNodeData> & { measured?: { width?: number; height?: number } }).measured;
        return measured?.height ?? DEFAULT_NODE_SIZE.height;
    };

    const allOutgoing = new Map<string, Set<string>>();
    const allIncoming = new Map<string, Set<string>>();
    const undirected = new Map<string, Set<string>>();
    nodes.forEach((node) => {
        allOutgoing.set(node.id, new Set());
        allIncoming.set(node.id, new Set());
        undirected.set(node.id, new Set());
    });

    edges.forEach((edge) => {
        if (!nodeById.has(edge.source) || !nodeById.has(edge.target) || edge.source === edge.target) return;
        allOutgoing.get(edge.source)?.add(edge.target);
        allIncoming.get(edge.target)?.add(edge.source);
        undirected.get(edge.source)?.add(edge.target);
        undirected.get(edge.target)?.add(edge.source);
    });

    const sortedNodeIds = nodes.map((node) => node.id).sort((leftId, rightId) => compareByCurrentPosition(nodeById, leftId, rightId));
    const weakVisited = new Set<string>();
    const components: string[][] = [];

    sortedNodeIds.forEach((startId) => {
        if (weakVisited.has(startId)) return;
        const queue = [startId];
        weakVisited.add(startId);
        const component: string[] = [];
        while (queue.length > 0) {
            const currentId = queue.shift();
            if (!currentId) break;
            component.push(currentId);
            (undirected.get(currentId) ?? new Set<string>()).forEach((nextId) => {
                if (weakVisited.has(nextId)) return;
                weakVisited.add(nextId);
                queue.push(nextId);
            });
        }
        component.sort((leftId, rightId) => compareByCurrentPosition(nodeById, leftId, rightId));
        components.push(component);
    });

    type ComponentLayout = {
        ids: string[];
        localPositions: Map<string, XYPosition>;
        width: number;
        height: number;
        anchorX: number;
        anchorY: number;
    };

    const componentLayouts: ComponentLayout[] = components.map((componentIds) => {
        const idSet = new Set(componentIds);
        const outgoing = new Map<string, Set<string>>();
        const incoming = new Map<string, Set<string>>();
        componentIds.forEach((id) => {
            outgoing.set(id, new Set());
            incoming.set(id, new Set());
        });

        componentIds.forEach((id) => {
            (allOutgoing.get(id) ?? new Set<string>()).forEach((targetId) => {
                if (!idSet.has(targetId)) return;
                outgoing.get(id)?.add(targetId);
                incoming.get(targetId)?.add(id);
            });
        });

        const discoveryIndex = new Map<string, number>();
        const lowLink = new Map<string, number>();
        const stack: string[] = [];
        const onStack = new Set<string>();
        const sccByNode = new Map<string, number>();
        const sccMembers: string[][] = [];
        let nextIndex = 0;

        const strongConnect = (nodeId: string) => {
            discoveryIndex.set(nodeId, nextIndex);
            lowLink.set(nodeId, nextIndex);
            nextIndex += 1;
            stack.push(nodeId);
            onStack.add(nodeId);

            (outgoing.get(nodeId) ?? new Set<string>()).forEach((targetId) => {
                if (!discoveryIndex.has(targetId)) {
                    strongConnect(targetId);
                    lowLink.set(nodeId, Math.min(lowLink.get(nodeId) ?? 0, lowLink.get(targetId) ?? 0));
                } else if (onStack.has(targetId)) {
                    lowLink.set(nodeId, Math.min(lowLink.get(nodeId) ?? 0, discoveryIndex.get(targetId) ?? 0));
                }
            });

            if ((lowLink.get(nodeId) ?? -1) !== (discoveryIndex.get(nodeId) ?? -2)) return;

            const sccId = sccMembers.length;
            const members: string[] = [];
            while (stack.length > 0) {
                const member = stack.pop();
                if (!member) break;
                onStack.delete(member);
                members.push(member);
                sccByNode.set(member, sccId);
                if (member === nodeId) break;
            }
            members.sort((leftId, rightId) => compareByCurrentPosition(nodeById, leftId, rightId));
            sccMembers.push(members);
        };

        componentIds.forEach((id) => {
            if (!discoveryIndex.has(id)) strongConnect(id);
        });

        const sccOutgoing = new Map<number, Set<number>>();
        const sccIndegree = new Map<number, number>();
        const sccLevel = new Map<number, number>();
        for (let sccId = 0; sccId < sccMembers.length; sccId += 1) {
            sccOutgoing.set(sccId, new Set());
            sccIndegree.set(sccId, 0);
            sccLevel.set(sccId, 0);
        }

        outgoing.forEach((targets, sourceId) => {
            const sourceScc = sccByNode.get(sourceId);
            if (typeof sourceScc !== 'number') return;
            targets.forEach((targetId) => {
                const targetScc = sccByNode.get(targetId);
                if (typeof targetScc !== 'number' || targetScc === sourceScc) return;
                const nextTargets = sccOutgoing.get(sourceScc);
                if (!nextTargets || nextTargets.has(targetScc)) return;
                nextTargets.add(targetScc);
                sccIndegree.set(targetScc, (sccIndegree.get(targetScc) ?? 0) + 1);
            });
        });

        const getSccAnchor = (sccId: number) =>
            Math.min(...(sccMembers[sccId] ?? []).map((id) => nodeById.get(id)?.position.x ?? Number.MAX_SAFE_INTEGER));

        const sccQueue = Array.from({ length: sccMembers.length }, (_, index) => index)
            .filter((sccId) => (sccIndegree.get(sccId) ?? 0) === 0)
            .sort((left, right) => getSccAnchor(left) - getSccAnchor(right));
        const sccVisited = new Set<number>();

        while (sccQueue.length > 0) {
            const currentScc = sccQueue.shift();
            if (typeof currentScc !== 'number') break;
            sccVisited.add(currentScc);
            const currentLevel = sccLevel.get(currentScc) ?? 0;
            (sccOutgoing.get(currentScc) ?? new Set<number>()).forEach((targetScc) => {
                sccLevel.set(targetScc, Math.max(sccLevel.get(targetScc) ?? 0, currentLevel + 1));
                const nextIndegree = (sccIndegree.get(targetScc) ?? 1) - 1;
                sccIndegree.set(targetScc, nextIndegree);
                if (nextIndegree === 0) sccQueue.push(targetScc);
            });
            sccQueue.sort((left, right) => getSccAnchor(left) - getSccAnchor(right));
        }

        const maxVisitedLevel = Array.from(sccLevel.values()).reduce((max, value) => Math.max(max, value), 0);
        const unresolvedScc = Array.from({ length: sccMembers.length }, (_, index) => index)
            .filter((sccId) => !sccVisited.has(sccId))
            .sort((left, right) => getSccAnchor(left) - getSccAnchor(right));
        unresolvedScc.forEach((sccId, index) => {
            sccLevel.set(sccId, maxVisitedLevel + 1 + index);
        });

        const levelByNode = new Map<string, number>();
        componentIds.forEach((id) => {
            const sccId = sccByNode.get(id);
            levelByNode.set(id, typeof sccId === 'number' ? (sccLevel.get(sccId) ?? 0) : 0);
        });

        const minLevel = componentIds.reduce((min, id) => Math.min(min, levelByNode.get(id) ?? 0), Number.MAX_SAFE_INTEGER);
        const roots = componentIds
            .filter((id) => (incoming.get(id)?.size ?? 0) === 0)
            .sort((leftId, rightId) => compareByCurrentPosition(nodeById, leftId, rightId));
        const branchRoots = (roots.length > 0 ? roots : componentIds.filter((id) => (levelByNode.get(id) ?? 0) === minLevel))
            .sort((leftId, rightId) => compareByCurrentPosition(nodeById, leftId, rightId));
        const fallbackRoot = branchRoots[0] ?? componentIds[0];
        const branchByNode = new Map<string, string>();
        branchRoots.forEach((rootId) => branchByNode.set(rootId, rootId));
        const branchIndex = new Map<string, number>();
        branchRoots.forEach((id, index) => branchIndex.set(id, index));

        const levelsAscending = Array.from(new Set(componentIds.map((id) => levelByNode.get(id) ?? 0))).sort((a, b) => a - b);
        levelsAscending.forEach((levelValue) => {
            const idsAtLevel = componentIds
                .filter((id) => (levelByNode.get(id) ?? 0) === levelValue)
                .sort((leftId, rightId) => compareByCurrentPosition(nodeById, leftId, rightId));

            idsAtLevel.forEach((id) => {
                if (branchByNode.has(id)) return;
                const candidates = Array.from(incoming.get(id) ?? new Set<string>())
                    .filter((sourceId) => branchByNode.has(sourceId))
                    .sort((leftId, rightId) => {
                        const leftLevel = levelByNode.get(leftId) ?? 0;
                        const rightLevel = levelByNode.get(rightId) ?? 0;
                        if (leftLevel !== rightLevel) return rightLevel - leftLevel;
                        const leftNode = nodeById.get(leftId);
                        const rightNode = nodeById.get(rightId);
                        const currentNode = nodeById.get(id);
                        const leftDist = Math.abs((leftNode?.position.y ?? 0) - (currentNode?.position.y ?? 0));
                        const rightDist = Math.abs((rightNode?.position.y ?? 0) - (currentNode?.position.y ?? 0));
                        return leftDist - rightDist;
                    });

                if (candidates.length > 0) {
                    const branch = branchByNode.get(candidates[0]) ?? fallbackRoot;
                    branchByNode.set(id, branch);
                    return;
                }

                const node = nodeById.get(id);
                const nearestRoot = branchRoots
                    .slice()
                    .sort((leftId, rightId) => {
                        const leftNode = nodeById.get(leftId);
                        const rightNode = nodeById.get(rightId);
                        const leftDist = Math.abs((leftNode?.position.y ?? 0) - (node?.position.y ?? 0));
                        const rightDist = Math.abs((rightNode?.position.y ?? 0) - (node?.position.y ?? 0));
                        return leftDist - rightDist;
                    })[0] ?? fallbackRoot;
                branchByNode.set(id, nearestRoot);
            });
        });

        componentIds.forEach((id) => {
            if (!branchByNode.has(id)) {
                branchByNode.set(id, fallbackRoot);
            }
        });

        const columns = new Map<number, string[]>();
        componentIds.forEach((id) => {
            const levelValue = levelByNode.get(id) ?? 0;
            const list = columns.get(levelValue) ?? [];
            list.push(id);
            columns.set(levelValue, list);
        });
        const sortedColumns = Array.from(columns.keys()).sort((a, b) => a - b);
        const columnNodeIds = sortedColumns.map((levelValue) =>
            (columns.get(levelValue) ?? [])
                .slice()
                .sort((leftId, rightId) => {
                    const leftBranch = branchByNode.get(leftId) ?? fallbackRoot;
                    const rightBranch = branchByNode.get(rightId) ?? fallbackRoot;
                    const leftBranchIndex = branchIndex.get(leftBranch) ?? Number.MAX_SAFE_INTEGER;
                    const rightBranchIndex = branchIndex.get(rightBranch) ?? Number.MAX_SAFE_INTEGER;
                    if (leftBranchIndex !== rightBranchIndex) return leftBranchIndex - rightBranchIndex;
                    return compareByCurrentPosition(nodeById, leftId, rightId);
                })
        );

        const buildIndexMap = (ids: string[]) => {
            const map = new Map<string, number>();
            ids.forEach((id, index) => map.set(id, index));
            return map;
        };

        const getBarycenter = (neighbors: Set<string> | undefined, neighborIndex: Map<string, number>, expectedNeighborLevel: number) => {
            if (!neighbors || neighbors.size === 0) return Number.NaN;
            let sum = 0;
            let count = 0;
            neighbors.forEach((id) => {
                if ((levelByNode.get(id) ?? -1) !== expectedNeighborLevel) return;
                const index = neighborIndex.get(id);
                if (typeof index !== 'number') return;
                sum += index;
                count += 1;
            });
            if (count === 0) return Number.NaN;
            return sum / count;
        };

        for (let pass = 0; pass < 6; pass += 1) {
            for (let columnIndex = 1; columnIndex < columnNodeIds.length; columnIndex += 1) {
                const previousIndex = buildIndexMap(columnNodeIds[columnIndex - 1]);
                const previousLevel = sortedColumns[columnIndex - 1];
                columnNodeIds[columnIndex].sort((leftId, rightId) => {
                    const leftScore = getBarycenter(incoming.get(leftId), previousIndex, previousLevel);
                    const rightScore = getBarycenter(incoming.get(rightId), previousIndex, previousLevel);
                    const leftValid = Number.isFinite(leftScore);
                    const rightValid = Number.isFinite(rightScore);
                    if (leftValid && rightValid && leftScore !== rightScore) return leftScore - rightScore;
                    if (leftValid !== rightValid) return leftValid ? -1 : 1;
                    const leftBranch = branchByNode.get(leftId) ?? fallbackRoot;
                    const rightBranch = branchByNode.get(rightId) ?? fallbackRoot;
                    const leftBranchIndex = branchIndex.get(leftBranch) ?? Number.MAX_SAFE_INTEGER;
                    const rightBranchIndex = branchIndex.get(rightBranch) ?? Number.MAX_SAFE_INTEGER;
                    if (leftBranchIndex !== rightBranchIndex) return leftBranchIndex - rightBranchIndex;
                    return compareByCurrentPosition(nodeById, leftId, rightId);
                });
            }

            for (let columnIndex = columnNodeIds.length - 2; columnIndex >= 0; columnIndex -= 1) {
                const nextIndex = buildIndexMap(columnNodeIds[columnIndex + 1]);
                const nextLevel = sortedColumns[columnIndex + 1];
                columnNodeIds[columnIndex].sort((leftId, rightId) => {
                    const leftScore = getBarycenter(outgoing.get(leftId), nextIndex, nextLevel);
                    const rightScore = getBarycenter(outgoing.get(rightId), nextIndex, nextLevel);
                    const leftValid = Number.isFinite(leftScore);
                    const rightValid = Number.isFinite(rightScore);
                    if (leftValid && rightValid && leftScore !== rightScore) return leftScore - rightScore;
                    if (leftValid !== rightValid) return leftValid ? -1 : 1;
                    const leftBranch = branchByNode.get(leftId) ?? fallbackRoot;
                    const rightBranch = branchByNode.get(rightId) ?? fallbackRoot;
                    const leftBranchIndex = branchIndex.get(leftBranch) ?? Number.MAX_SAFE_INTEGER;
                    const rightBranchIndex = branchIndex.get(rightBranch) ?? Number.MAX_SAFE_INTEGER;
                    if (leftBranchIndex !== rightBranchIndex) return leftBranchIndex - rightBranchIndex;
                    return compareByCurrentPosition(nodeById, leftId, rightId);
                });
            }
        }

        const localPositions = new Map<string, XYPosition>();
        let currentX = 0;
        let maxHeight = 0;

        sortedColumns.forEach((_, columnIndex) => {
            const ids = columnNodeIds[columnIndex] ?? [];
            const columnWidth = Math.max(DEFAULT_NODE_SIZE.width, ...ids.map((id) => getNodeWidth(id)));
            let currentY = 0;
            let previousBranch: string | null = null;
            ids.forEach((id) => {
                const branch = branchByNode.get(id) ?? fallbackRoot;
                const height = getNodeHeight(id);
                if (previousBranch !== null) {
                    currentY += previousBranch === branch ? AUTO_LAYOUT_ROW_GAP : AUTO_LAYOUT_BRANCH_GAP;
                }
                localPositions.set(id, { x: currentX, y: currentY });
                currentY += height;
                previousBranch = branch;
            });
            maxHeight = Math.max(maxHeight, currentY);
            currentX += columnWidth + AUTO_LAYOUT_COLUMN_GAP;
        });

        const width = Math.max(DEFAULT_NODE_SIZE.width, currentX > 0 ? currentX - AUTO_LAYOUT_COLUMN_GAP : DEFAULT_NODE_SIZE.width);
        const height = Math.max(DEFAULT_NODE_SIZE.height, maxHeight);
        const anchorX = Math.min(...componentIds.map((id) => nodeById.get(id)?.position.x ?? Number.MAX_SAFE_INTEGER));
        const anchorY = Math.min(...componentIds.map((id) => nodeById.get(id)?.position.y ?? Number.MAX_SAFE_INTEGER));

        return {
            ids: componentIds,
            localPositions,
            width,
            height,
            anchorX,
            anchorY,
        };
    });

    componentLayouts.sort((left, right) => {
        if (left.anchorX !== right.anchorX) return left.anchorX - right.anchorX;
        return left.anchorY - right.anchorY;
    });

    const placed = componentLayouts.map((layout) => ({
        layout,
        x: layout.anchorX,
        y: layout.anchorY,
    }));

    const intersectsWithGap = (left: { x: number; y: number; layout: { width: number; height: number } }, right: { x: number; y: number; layout: { width: number; height: number } }) => {
        return (
            left.x < right.x + right.layout.width + AUTO_LAYOUT_COMPONENT_GAP_X
            && left.x + left.layout.width + AUTO_LAYOUT_COMPONENT_GAP_X > right.x
            && left.y < right.y + right.layout.height + AUTO_LAYOUT_COMPONENT_GAP_Y
            && left.y + left.layout.height + AUTO_LAYOUT_COMPONENT_GAP_Y > right.y
        );
    };

    for (let pass = 0; pass < 16; pass += 1) {
        let moved = false;
        for (let i = 0; i < placed.length; i += 1) {
            for (let j = i + 1; j < placed.length; j += 1) {
                const first = placed[i];
                const second = placed[j];
                if (!intersectsWithGap(first, second)) continue;

                const overlapX = Math.min(
                    first.x + first.layout.width + AUTO_LAYOUT_COMPONENT_GAP_X - second.x,
                    second.x + second.layout.width + AUTO_LAYOUT_COMPONENT_GAP_X - first.x
                );
                const overlapY = Math.min(
                    first.y + first.layout.height + AUTO_LAYOUT_COMPONENT_GAP_Y - second.y,
                    second.y + second.layout.height + AUTO_LAYOUT_COMPONENT_GAP_Y - first.y
                );
                const preferHorizontal = Math.abs(second.layout.anchorX - first.layout.anchorX) >= Math.abs(second.layout.anchorY - first.layout.anchorY);

                if (preferHorizontal && overlapX > 0) {
                    if (second.layout.anchorX >= first.layout.anchorX) {
                        second.x += overlapX;
                    } else {
                        first.x += overlapX;
                    }
                    moved = true;
                } else if (overlapY > 0) {
                    if (second.layout.anchorY >= first.layout.anchorY) {
                        second.y += overlapY;
                    } else {
                        first.y += overlapY;
                    }
                    moved = true;
                }
            }
        }
        if (!moved) break;
    }

    const minPlacedX = placed.reduce((min, item) => Math.min(min, item.x), Number.POSITIVE_INFINITY);
    const minPlacedY = placed.reduce((min, item) => Math.min(min, item.y), Number.POSITIVE_INFINITY);
    const offsetX = AUTO_LAYOUT_PADDING_X - minPlacedX;
    const offsetY = AUTO_LAYOUT_PADDING_Y - minPlacedY;

    placed.forEach((item) => {
        item.layout.ids.forEach((id) => {
            const local = item.layout.localPositions.get(id);
            if (!local) return;
            positions.set(id, {
                x: item.x + local.x + offsetX,
                y: item.y + local.y + offsetY,
            });
        });
    });

    return positions;
}
