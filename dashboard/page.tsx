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
    const timesArray = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];


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
            const to24 = (t: string) => {
                const [time, modifier] = t.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (modifier === 'PM' && hours !== 12) hours += 12;
                if (modifier === 'AM' && hours === 12) hours = 0;
                return hours * 60 + minutes;
            };
        
            const sortedTimes = times.sort((a, b) => to24(a) - to24(b));
        
            return {
                employee,
                day,
                times: sortedTimes
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
            return result.success;
        } catch (err) {
            console.error("Error saving assignments:", err);
            return false;
        }
    };
    

    const RunHandleBackend = async () => {
        const success = await sendAssignmentsToBackend(cellAssignments);
        if (success) {
            window.alert("Updated roster schedule")
        } else {
            window.alert("Failed to update")
        }
    };
    
    const handleClearSchedule = async () => {
        if (confirm("Are you sure you want to clear the entire schedule?")) {
            setCellAssignments({});
            await sendAssignmentsToBackend({});
        }
    };
     

    const handleDragEnd = async (event) => {
        const { active, over } = event;
    
        if (!over) return;
    
        const overId = over.id;
    
        setCellAssignments(prev => {
            const newAssignments = { ...prev };
    
            // Only remove from the source cell if it's a drag between cells
            if (activeEmployee && active.id.includes("::")) {
                const [fromCellId, empId] = active.id.split("::");
                if (newAssignments[fromCellId]) {
                    newAssignments[fromCellId] = newAssignments[fromCellId].filter(emp => emp.id !== empId);
                }
            }
      
            if (overId.startsWith("cell-")) {
                const current = newAssignments[overId] || [];
                const alreadyExists = current.some(emp => emp.title === activeEmployee.title);
                if (!alreadyExists) {
                    newAssignments[overId] = [...current, activeEmployee];
                }                
            }
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
            const newAssignments: Record<string, { id: string, title: string }[]> = {};
      
            for (const assignment of data.assignments) {
              const { employee, day, times } = assignment;
              if (!times || times.length === 0) continue;
      
              // Sort times to determine range
              const sorted = [...times].sort((a, b) => {
                const to24 = (t: string) => {
                  const [time, modifier] = t.split(' ');
                  let [hours, minutes] = time.split(':').map(Number);
                  if (modifier === 'PM' && hours !== 12) hours += 12;
                  if (modifier === 'AM' && hours === 12) hours = 0;
                  return hours * 60 + minutes;
                };
                return to24(a) - to24(b);
              });
      
              for (const time of times) {
                const cellId = `cell-${day}-${time.replace(/[: ]/g, '')}`;
                if (!newAssignments[cellId]) newAssignments[cellId] = [];
              
                if (!newAssignments[cellId].some(e => e.title === employee)) {
                  newAssignments[cellId].push({
                    id: `emp-${employee}-${day}-${time}`,
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
                            Logout &rarr;
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="items-center">
                <h1 className="text-4xl font-bold mb-6">Roster</h1>
                {isManager && (
                    <div className="flex gap-4 mt-4 w-full justify-center">
                        <button className="mt-4 bg-green-500 text-white p-2 rounded" onClick={RunHandleBackend}>
                            <h3 className="font-bold">Save roster</h3>
                        </button>
                        <button className="mt-4 bg-red-500 text-white p-2 rounded" onClick={handleClearSchedule}>
                            <h3 className="font-bold">Clear roster</h3>
                        </button>
                    </div>
                )}
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
                                    {timesArray.map(time => (
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


