'use client';
import { useDraggable } from '@dnd-kit/core';

interface DraggableEmployeeProps {
  employee: { id: string; title: string };
  cellId: string;
}

export function DraggableEmployee({ employee, cellId }: DraggableEmployeeProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${cellId}::${employee.id}`,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="bg-blue-300 text-black rounded p-1 text-sm font-medium my-1"
    >
      {employee.title}
    </div>
  );
}
