'use client';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  id: string;
  title: string;
}

export default function DraggableAssignedEmployee({ id, title }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useDraggable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'move',
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="bg-blue-300 rounded p-1 text-sm font-medium my-1"
    >
      {title}
    </div>
  );
}
