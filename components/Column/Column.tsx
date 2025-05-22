'use client';
import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface Employee {
  id: number;
  title: string;
}

interface ColumnProps {
  employees: Employee[];
  isManager: boolean;
}

interface DraggableEmployeeProps {
  employee: Employee;
  isManager: boolean;
}

function DraggableEmployee({ employee, isManager }: DraggableEmployeeProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: `employee-${employee.id}`, 
    });

    const style: React.CSSProperties = {
      transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      opacity: isDragging ? 0.5 : 1,
      cursor: isManager ? 'grab' : 'default',
    };

    if (!isManager) return null;

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        className="bg-white text-black p-2 mb-2 rounded shadow"
      >
        {employee.title}
      </div>
    );
}

export function Column({ employees, isManager }: ColumnProps) {
  return (
    <div className="flex flex-col">
      {employees.map((employee) => (
        <DraggableEmployee
          key={employee.id}
          employee={employee}
          isManager={isManager}
        />
      ))}
    </div>
  );
}
