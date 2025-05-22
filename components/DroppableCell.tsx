import { useDroppable } from '@dnd-kit/core';

interface DroppableCellProps {
  id: string;
  children?: React.ReactNode;
}

export function DroppableCell({ id, children }: DroppableCellProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const style: React.CSSProperties = {
    backgroundColor: isOver ? '#E5E7EB' : 'transparent',
    position: 'relative',
    overflow: 'hidden',  
    minHeight: '60px', 
    padding: '10px',
    borderRadius: '5px',
    transition: 'background-color 0.2s ease',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}
