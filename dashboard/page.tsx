'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DndContext, closestCorners } from '@dnd-kit/core';
import { Column } from '../components/Column/Column';
import { DroppableCell } from '../components/DroppableCell';
import {nanoid} from 'nanoid';

export default function Dashboard() {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const times = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

    const [employees] = useState([
        { id: 1, title: "Tralalero Tralala" },
        { id: 2, title: "Crocodilo Bombardilo" },
        { id: 3, title: "John Pork" },
        { id: 4, title: "Tim Cheese" },
    ]);

    const [cellAssignments, setCellAssignments] = useState<Record<string, { id: string, title: string }[]>>({});
    const [activeEmployee, setActiveEmployee] = useState(null);

    const handleDragStart = (event) => {
        const { active } = event;
        const id = parseInt(active.id.replace('employee-', ''), 10);
        const employee = employees.find(emp => emp.id === id);
        setActiveEmployee({ ...employee, id: `clone-${nanoid()}` });

        if (active.id.startsWith("clone-")) {
            const [cellId, empId] = active.id.split("::"); // "cell-id::clone-id"
            const employee = cellAssignments[cellId]?.find(e => e.id === empId);
            if (employee) {
                setActiveEmployee({ ...employee });
            }
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) return;

        const overId = over.id;

        // Trash bin drop
        if (overId === "trash-bin") {
            setCellAssignments(prev => {
                const newAssignments = {};
                for (const [key, value] of Object.entries(prev)) {
                    newAssignments[key] = value.filter(emp => emp.id !== activeEmployee.id);
                }
                return newAssignments;
            });
            return;
        }

        // Move to another cell
        if (overId.startsWith("cell-")) {
            setCellAssignments(prev => {
                const newAssignments = { ...prev };

                // Remove from original cell
                for (const [cellId, value] of Object.entries(prev)) {
                    newAssignments[cellId] = value.filter(emp => emp.id !== activeEmployee.id);
                }

                // Add to new cell
                const current = newAssignments[overId] || [];
                newAssignments[overId] = [...current, activeEmployee];

                return newAssignments;
            });
        }

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
            setIsManager(managerStatus === "true");
            setIsReady(true);
        }
    }, []);

    const handleLogout = () => {
        document.cookie = "is_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "is_manager=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
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
                            <Link href="/manager" className="mr-4">
                                Edit employees and managers &rarr;<br />
                            </Link>
                        )}
                        <Link href="/" onClick={handleLogout}>
                            Logout &rarr;
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="items-center">
                <h1 className="text-4xl font-bold mb-6">Roster</h1>
                <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd} >
                    <div className="flex justify-center items-start gap-8 px-6 py-8">
                        {isManager && (
                            <div className="w-64 bg-gray-700 text-left p-4 rounded shadow tools">
                                <h2 className="text-xl font-bold mb-4">Employees</h2>
                                <Column employees={employees} isManager={isManager} />
                                <DroppableCell id="trash-bin">
                                    <div className="w-40 h-20 border-2 border-red-600 rounded-lg flex items-center justify-center text-red-600 font-bold">
                                        🗑️ Trash Bin
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
                                                        {(cellAssignments[cellId] || []).map((emp, idx) => (
                                                            <div
                                                            key={emp.id}
                                                            className="bg-blue-300 text-black rounded p-1 text-sm font-medium my-1"
                                                            id={`${cellId}::${emp.id}`} 
                                                            >
                                                            {emp.title}
                                                            </div>
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
