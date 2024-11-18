// From: https://reactflow.dev/examples/edges/floating-edges

import { getBezierPath, useInternalNode,   EdgeLabelRenderer } from '@xyflow/react';
import { getEdgeParams } from '../utils.js';
 
function FloatingEdge({ id, source, target, markerEnd, style }) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
 
  if (!sourceNode || !targetNode) {
    return null;
  }
 
  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode,
  );
 
  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });
 
  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={style}
      />
      {/* <EdgeLabelRenderer>
        <label
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${1}px,${1}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          delete
        </label>
      </EdgeLabelRenderer> */}
    </>
  );
}
 
export default FloatingEdge;