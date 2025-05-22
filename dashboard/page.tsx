'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DndContext, closestCorners } from '@dnd-kit/core';
import { Column } from '../components/Column/Column';
import { DroppableCell } from '../components/DroppableCell';
import {nanoid} from 'nanoid';
import { DraggableEmployee } from '../components/DraggableEmployee';

export default function Dashboard() {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const times = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];


    const [employees, setEmployees] = useState([]);
    useEffect(() => {
        async function fetchEmployees() {
          const res = await fetch('/api/fetchEmployee');
          const data = await res.json();
          if (data.success) {
            setEmployees(data.employees.map((emp, index) => ({
              id: index,
              title: emp.name
            })));
          }
        }
        fetchEmployees();
      }, []);

    const [cellAssignments, setCellAssignments] = useState<Record<string, { id: string, title: string }[]>>({});
    const [activeEmployee, setActiveEmployee] = useState(null);

    const handleDragStart = (event) => {
        const { active } = event;
    
        if (active.id.startsWith("employee-")) {
            const index = parseInt(active.id.replace("employee-", ""), 10);
            const employee = employees[index]; 
            if (employee) {
                setActiveEmployee({ ...employee, id: `clone-${nanoid()}` });
            }
        } else if (active.id.includes("::")) {
            const [cellId, empIndex] = active.id.split("::");
            const employee = cellAssignments[cellId]?.find((e) => e.id === empIndex);
            if (employee) {
                setActiveEmployee({ ...employee });
            }
        }
    };


    const sendAssignmentsToBackend = async (cellAssignments) => {
        const assignmentsMap = new Map();
    
        Object.entries(cellAssignments).forEach(([cellId, employees]) => {
            const [, day, timeKey] = cellId.split("-");
            const time = timeKey.replace(/(\d{1,2})(\d{2})(AM|PM)/, (_, h, m, period) => {
                return `${parseInt(h)}:${m} ${period}`;
            });
    
            employees.forEach(emp => {
                const key = `${emp.title}-${day}`;
                if (!assignmentsMap.has(key)) {
                    assignmentsMap.set(key, {
                        employee: emp.title,
                        day,
                        times: [time]
                    });
                } else {
                    assignmentsMap.get(key).times.push(time);
                }
            });
        });
    
        const mergedAssignments = Array.from(assignmentsMap.values()).map(({ employee, day, times }) => {
            const sorted = times.sort((a, b) => new Date(`1970/01/01 ${a}`) - new Date(`1970/01/01 ${b}`));
            return {
                employee,
                day,
                startTime: sorted[0],
                endTime: sorted[sorted.length - 1]
            };
        });
    
        const payload = {
            _id: "schedule",
            assignments: mergedAssignments
        };
    
        try {
            const response = await fetch('/api/saveAssignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
    
            const result = await response.json();
            if (!result.success) {
                console.error("Failed to save assignments");
            }
        } catch (err) {
            console.error("Error saving assignments:", err);
        }
    };
    
    


    const handleDragEnd = async (event) => {
        const { active, over } = event;
    
        if (!over) return;
    
        const overId = over.id;
    
        setCellAssignments(prev => {
            const newAssignments = { ...prev };
    
            // Remove from old cell
            for (const [cellId, value] of Object.entries(prev)) {
                newAssignments[cellId] = value.filter(emp => emp.title !== activeEmployee.title);
            }
    
            if (overId === "trash-bin") {
                sendAssignmentsToBackend(newAssignments);
                return newAssignments;
            }
    
            if (overId.startsWith("cell-")) {
                const current = newAssignments[overId] || [];
                const alreadyExists = current.some(emp => emp.title === activeEmployee.title);
                if (!alreadyExists) {
                    newAssignments[overId] = [...current, activeEmployee];
                }
            }
    
            sendAssignmentsToBackend(newAssignments);
            return newAssignments;
        });
    
        setActiveEmployee(null);
    };
    
    
    

    const router = useRouter();
    const [isManager, setIsManager] = useState<boolean | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const loggedIn = localStorage.getItem("is_logged_in");
        const managerStatus = localStorage.getItem("is_manager");
    
        if (!loggedIn) {
            router.push("/unauthorised");
        } else {
            const isManager = managerStatus === "true";
            setIsManager(isManager);
            setIsReady(true);
    
            // Only fetch assignments after auth
            fetchAssignments();
        }
    }, []);

    const fetchAssignments = async () => {
      try {
        const res = await fetch('/api/fetchAssignments');
        const data = await res.json();
    
        if (data.success) {
          const newAssignments = {};
    
          for (const assignment of data.assignments) {
            const { employee, day, startTime, endTime } = assignment;
    
            // Find time indexes
            const startIndex = times.indexOf(startTime);
            const endIndex = times.indexOf(endTime);
    
            if (startIndex === -1 || endIndex === -1) continue;
    
            for (let i = startIndex; i <= endIndex; i++) {
              const cellId = `cell-${day}-${times[i].replace(/[: ]/g, '')}`;
    
              if (!newAssignments[cellId]) newAssignments[cellId] = [];
    
              // Avoid duplicates
              if (!newAssignments[cellId].some(e => e.title === employee)) {
                newAssignments[cellId].push({
                  id: `emp-${employee}-${day}-${times[i]}`,
                  title: employee,
                });
              }
            }
          }
    
          setCellAssignments(newAssignments);
        }
      } catch (err) {
        console.error("Failed to fetch assignments:", err);
      }
    };
    
    

    const handleLogout = () => {
        localStorage.removeItem("is_logged_in");
        localStorage.removeItem("is_manager");
    };

    if (!isReady) return null;

    return (
        <div className="flex flex-col h-screen bg-gray-0">
            <header>
                <nav>
                    <div>
                        {isManager && (
                            <Link href="/manager">Add & Edit Employee Details &rarr;</Link>
                        )}
                    </div>
                    <div>
                        <Link href="/" onClick={handleLogout}>
                            Logout &rarr;&nbsp;&nbsp;
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="items-center">
                <h1 className="text-4xl font-bold mb-6">Roster</h1>
                {isManager && (<h3 className="font-bold">Automatically saves employee times</h3>)}
                <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd} >
                    <div className="flex justify-center items-start gap-8 px-6 py-8">
                        {isManager && (
                            <div className="w-64 bg-gray-700 text-left p-4 rounded shadow tools">
                                <h2 className="text-xl font-bold mb-4">Employees</h2>
                                <Column employees={employees} isManager={isManager} />
                                <DroppableCell id="trash-bin">
                                    <div className="w-40 h-20 border-2 border-red-600 rounded-lg flex items-center justify-center text-red-600 font-bold">
                                        Trash Bin
                                    </div>
                                </DroppableCell>
                            </div>
                            
                        )}

                        <div className="bg-gray-700 text-white p-6 rounded shadow w-full timetable">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border p-5">Time</th>
                                        {days.map(day => (
                                            <th key={day} className="border p-5">{day}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {times.map(time => (
                                        <tr key={time}>
                                            <td className="border p-5 font-bold">{time}</td>
                                            {days.map(day => {
                                                const cellId = `cell-${day}-${time.replace(/[: ]/g, '')}`;
                                                return (
                                                    <td key={cellId} className="border p-1 align-top">
                                                        <DroppableCell id={cellId}>
                                                            {(cellAssignments[cellId] || []).map((emp) => (
                                                                isManager ? (
                                                                    <DraggableEmployee
                                                                        key={emp.id}
                                                                        employee={emp}
                                                                        cellId={cellId}
                                                                    />
                                                                ) : (
                                                                    <div key={emp.id} className="bg-blue-500 rounded text-white p-1 mb-1">
                                                                        {emp.title}
                                                                    </div>
                                                                )
                                                            ))}
                                                        </DroppableCell>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </DndContext>
            </main>
        </div>
    );
}


