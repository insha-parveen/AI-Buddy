import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface MindMapNode {
  id: string;
  label: string;
  children: MindMapNode[];
  description?: string;
}

interface LayoutNode {
  id: string;
  label: string;
  x: number;
  y: number;
  level: number;
  children: MindMapNode[];
  description?: string;
  parentId: string | null;
}

interface Props {
  root: MindMapNode;
}

const LEVEL_STYLES = [
  { fill: "hsl(var(--primary))", stroke: "hsl(var(--primary))", text: "hsl(var(--primary-foreground))", glow: "hsl(var(--primary) / 0.5)" },
  { fill: "hsl(var(--secondary))", stroke: "hsl(var(--secondary))", text: "hsl(var(--secondary-foreground))", glow: "hsl(var(--secondary) / 0.5)" },
  { fill: "hsl(var(--accent))", stroke: "hsl(var(--accent))", text: "hsl(var(--accent-foreground))", glow: "hsl(var(--accent) / 0.5)" },
  { fill: "hsl(var(--muted))", stroke: "hsl(var(--muted-foreground))", text: "hsl(var(--foreground))", glow: "hsl(var(--muted-foreground) / 0.3)" },
];

const NODE_W = 160;
const NODE_H = 44;
const H_GAP = 90;
const V_GAP = 60;

function buildLayout(node: MindMapNode, level: number, parentId: string | null, collapsedIds: Set<string>): LayoutNode[] {
  const result: LayoutNode[] = [];
  result.push({ id: node.id, label: node.label, x: 0, y: 0, level, children: node.children, description: node.description, parentId });
  if (!collapsedIds.has(node.id) && node.children?.length) {
    for (const child of node.children) {
      result.push(...buildLayout(child, level + 1, node.id, collapsedIds));
    }
  }
  return result;
}

function assignPositions(node: MindMapNode, level: number, yOffset: { val: number }, positions: Map<string, { x: number; y: number }>, collapsedIds: Set<string>): number {
  const x = level * (NODE_W + H_GAP);
  if (collapsedIds.has(node.id) || !node.children?.length) {
    const y = yOffset.val;
    positions.set(node.id, { x, y });
    yOffset.val += NODE_H + V_GAP;
    return y;
  }
  const childCenters: number[] = [];
  for (const child of node.children) {
    childCenters.push(assignPositions(child, level + 1, yOffset, positions, collapsedIds));
  }
  const y = (childCenters[0] + childCenters[childCenters.length - 1]) / 2;
  positions.set(node.id, { x, y });
  return y;
}

/** The core SVG mind map canvas — used both inline and in fullscreen dialog */
function MindMapCanvas({
  root,
  height,
}: {
  root: MindMapNode;
  height: number;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<LayoutNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const positions = new Map<string, { x: number; y: number }>();
  const yOff = { val: 0 };
  assignPositions(root, 0, yOff, positions, collapsed);
  const flatNodes = buildLayout(root, 0, null, collapsed);
  const layoutNodes: LayoutNode[] = flatNodes.map((n) => ({
    ...n,
    x: positions.get(n.id)?.x ?? 0,
    y: positions.get(n.id)?.y ?? 0,
  }));

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as Element).closest(".mind-node")) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    setPan({ x: dragStart.current.panX + (e.clientX - dragStart.current.x), y: dragStart.current.panY + (e.clientY - dragStart.current.y) });
  };
  const onMouseUp = () => { setIsDragging(false); dragStart.current = null; };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(2, Math.max(0.3, z - e.deltaY * 0.001)));
  };

  const resetView = () => { setZoom(1); setPan({ x: 40, y: 40 }); };

  const edges: { from: LayoutNode; to: LayoutNode }[] = [];
  for (const node of layoutNodes) {
    if (node.parentId) {
      const parent = layoutNodes.find((n) => n.id === node.parentId);
      if (parent) edges.push({ from: parent, to: node });
    }
  }

  return (
    <div className="relative w-full rounded-xl border border-accent/20 bg-background/40 backdrop-blur-sm overflow-hidden" style={{ height }}>
      {/* Toolbar */}
      <div className="absolute top-3 right-3 z-20 flex gap-2">
        <Button size="icon" variant="outline" className="h-8 w-8 border-white/10 bg-background/60 backdrop-blur-sm" onClick={() => setZoom((z) => Math.min(2, z + 0.15))}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8 border-white/10 bg-background/60 backdrop-blur-sm" onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8 border-white/10 bg-background/60 backdrop-blur-sm" onClick={resetView}>
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute bottom-3 left-3 z-10 text-xs text-muted-foreground/50 select-none">
        Click nodes • Drag to pan • Scroll to zoom
      </div>

      <svg
        className="w-full h-full"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <defs>
          {LEVEL_STYLES.map((_, i) => (
            <filter key={i} id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          ))}
        </defs>
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {edges.map(({ from, to }) => {
            const x1 = from.x + NODE_W, y1 = from.y + NODE_H / 2;
            const x2 = to.x, y2 = to.y + NODE_H / 2;
            const mx = (x1 + x2) / 2;
            return (
              <path key={`${from.id}-${to.id}`} d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} fill="none" stroke="hsl(var(--primary) / 0.35)" strokeWidth={1.5} strokeDasharray="4 3" />
            );
          })}
          {layoutNodes.map((node) => {
            const style = LEVEL_STYLES[Math.min(node.level, LEVEL_STYLES.length - 1)];
            const isSelected = selected?.id === node.id;
            const isCollapsed = collapsed.has(node.id);
            const hasChildren = node.children?.length > 0;
            const rx = node.level === 0 ? 22 : 12;
            return (
              <g key={node.id} className="mind-node" transform={`translate(${node.x},${node.y})`} style={{ cursor: "pointer" }} onClick={() => setSelected(isSelected ? null : node)}>
                {isSelected && <rect x={-4} y={-4} width={NODE_W + 8} height={NODE_H + 8} rx={rx + 4} fill={style.fill} opacity={0.15} />}
                <rect width={NODE_W} height={NODE_H} rx={rx} fill={isSelected ? style.fill : "hsl(var(--card) / 0.7)"} stroke={style.stroke} strokeWidth={isSelected ? 2 : 1.5} strokeOpacity={isSelected ? 1 : 0.5} filter={isSelected ? `url(#glow-${Math.min(node.level, 3)})` : undefined} />
                <foreignObject x={8} y={0} width={NODE_W - 24} height={NODE_H}>
                  <div style={{ height: NODE_H, display: "flex", alignItems: "center", fontSize: node.level === 0 ? 13 : 11, fontWeight: node.level === 0 ? 700 : 500, color: isSelected ? style.text : "hsl(var(--foreground))", overflow: "hidden", lineHeight: "1.2", wordBreak: "break-word" }}>
                    {node.label}
                  </div>
                </foreignObject>
                {hasChildren && (
                  <g transform={`translate(${NODE_W - 16},${NODE_H / 2 - 8})`} onClick={(e) => { e.stopPropagation(); toggleCollapse(node.id); }} style={{ cursor: "pointer" }}>
                    <circle cx={8} cy={8} r={8} fill={style.fill} opacity={0.8} />
                    <text x={8} y={12} textAnchor="middle" fontSize={12} fill="white" fontWeight="bold">{isCollapsed ? "+" : "−"}</text>
                  </g>
                )}
                {!hasChildren && <circle cx={NODE_W - 10} cy={NODE_H / 2} r={3} fill={style.fill} opacity={0.6} />}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Node Detail Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-3 left-3 z-20 w-64 rounded-xl border border-white/10 bg-background/90 backdrop-blur-xl shadow-2xl p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: LEVEL_STYLES[Math.min(selected.level, LEVEL_STYLES.length - 1)].fill }} />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Level {selected.level} Node</span>
              </div>
              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => setSelected(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
            <h4 className="font-bold text-foreground text-sm mb-2 leading-snug">{selected.label}</h4>
            {selected.description ? (
              <p className="text-xs text-muted-foreground leading-relaxed">{selected.description}</p>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">No description available for this node.</p>
            )}
            {selected.children?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" />
                  {selected.children.length} sub-topic{selected.children.length > 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap gap-1">
                  {selected.children.map((child) => (
                    <span key={child.id} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {child.label.length > 18 ? child.label.slice(0, 18) + "…" : child.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function InteractiveMindMap({ root }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      {/* Inline view */}
      <div className="relative">
        <MindMapCanvas root={root} height={520} />
        <Button
          size="icon"
          variant="outline"
          className="absolute top-3 right-[calc(0.75rem+7.5rem)] z-20 h-8 w-8 border-white/10 bg-background/60 backdrop-blur-sm"
          onClick={() => setIsFullscreen(true)}
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Fullscreen dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 border-accent/20 bg-background/95 backdrop-blur-2xl overflow-hidden [&>button]:hidden">
          <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">Neural Map — Fullscreen</h3>
          </div>
          <div className="absolute top-4 right-4 z-30">
            <Button size="icon" variant="outline" className="h-8 w-8 border-white/10 bg-background/60 backdrop-blur-sm" onClick={() => setIsFullscreen(false)}>
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="w-full h-full pt-12">
            <MindMapCanvas root={root} height={window.innerHeight * 0.9 - 48} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
