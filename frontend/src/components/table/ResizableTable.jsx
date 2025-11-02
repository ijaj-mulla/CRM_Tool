import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * ResizableTable - shared table with resizable columns, sticky header, and truncation
 * Props:
 * - columns: [{ key, label, defaultWidth?: number, minWidth?: number }]
 * - data: any[]
 * - visible?: Record<string, boolean>
 * - onSort?: (key: string) => void
 * - getRowKey?: (row: any, index: number) => string
 * - renderCell?: (row: any, key: string) => React.ReactNode
 * - actions?: { header?: React.ReactNode, cell?: (row: any) => React.ReactNode }
 * - className?: string
 * - minTableWidth?: number
 */
export default function ResizableTable({
  columns = [],
  data = [],
  visible = {},
  onSort,
  getRowKey = (row, i) => row._id || row.id || String(i),
  renderCell,
  actions,
  className,
  minTableWidth = 1000,
}) {
  const initWidths = React.useMemo(() => {
    const obj = {};
    for (const c of columns) obj[c.key] = c.defaultWidth ?? 140;
    return obj;
  }, [columns]);
  const [columnWidths, setColumnWidths] = React.useState(initWidths);
  const [draggingCol, setDraggingCol] = React.useState(null);
  const dragStartXRef = React.useRef(0);
  const startWidthRef = React.useRef(0);

  const getMin = (key) => (columns.find(c => c.key === key)?.minWidth ?? 80);

  const onResizeMouseDown = (key, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingCol(key);
    dragStartXRef.current = e.clientX;
    startWidthRef.current = columnWidths[key] || (columns.find(c => c.key === key)?.defaultWidth ?? 140);
  };

  React.useEffect(() => {
    if (!draggingCol) return;
    const onMove = (e) => {
      const dx = e.clientX - dragStartXRef.current;
      setColumnWidths((prev) => {
        const minW = getMin(draggingCol);
        const w = Math.max(minW, Math.min(700, (startWidthRef.current || 140) + dx));
        return { ...prev, [draggingCol]: w };
      });
    };
    const onUp = () => setDraggingCol(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp, { once: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [draggingCol, columnWidths]);

  const isVisible = (key) => visible[key] !== false;
  const getCellStyle = (key) => ({ width: columnWidths[key], maxWidth: columnWidths[key] });
  const cellTruncateCls = "overflow-hidden text-ellipsis whitespace-nowrap";

  return (
    <div className={cn("overflow-auto rounded-md border border-border", className)}>
      <Table className={cn("table-fixed", `min-w-[${minTableWidth}px]`)}>
        <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
          <TableRow className="border-b border-border divide-x divide-border">
            {columns.map((c) => (
              isVisible(c.key) && (
                <TableHead key={c.key} style={getCellStyle(c.key)} className="relative group select-none">
                  <div className="pr-2" onClick={() => onSort?.(c.key)}>{c.label}</div>
                  <div
                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize opacity-0 group-hover:opacity-100 bg-transparent hover:bg-primary/20"
                    onMouseDown={(e) => onResizeMouseDown(c.key, e)}
                    title="Drag to resize"
                  />
                </TableHead>
              )
            ))}
            {actions?.header !== undefined && (
              <TableHead className="select-none">{actions.header}</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={getRowKey(row, idx)} className="hover:bg-muted/50 border-b border-border/60 divide-x divide-border/40">
              {columns.map((c) => (
                isVisible(c.key) && (
                  <TableCell key={c.key} style={getCellStyle(c.key)} className={cellTruncateCls} title={String(row[c.key] ?? "")}>
                    {renderCell ? renderCell(row, c.key) : row[c.key]}
                  </TableCell>
                )
              ))}
              {actions?.cell && (
                <TableCell>{actions.cell(row)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
