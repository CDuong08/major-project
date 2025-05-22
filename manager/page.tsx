'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Employee = {
  name: string;
  email: string;
  password: string;
};

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isManager, setIsManager] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);

  const router = useRouter();

  // Fetch employees on load
  useEffect(() => {
    async function fetchEmployees() {
      const res = await fetch('/api/fetchEmployee');
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    }
    fetchEmployees();
  }, []);

  // Auth check
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

  const handleSave = async () => {
    if (!selectedEmployee) return;
    const res = await fetch(`/api/saveEmployee`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedEmployee),
    });
    const data = await res.json();
    if (data.success) {
      alert("Employee updated");
    } else {
      alert("Error saving employee");
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    const res = await fetch(`/api/saveEmployee`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (data.success) {
      setEmployees(employees.filter(emp => emp.email !== selectedEmployee.email));
      setSelectedEmployee(null);
    } else {
      alert("Error deleting employee");
    }
  };

  const handleAddNew = () => {
    const newEmp: Employee = {
      name: '',
      email: '',
      password: '',
    };
    setSelectedEmployee(newEmp);
  };

  if (!isReady) return null;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-black p-4 border-r">
        <h2 className="text-lg font-bold mb-4">Employees</h2>
        <ul>
          {employees.map(emp => (
            <li
              key={emp.email}
              className="cursor-pointer mb-2 text-blue-600 hover:underline"
              onClick={() => setSelectedEmployee(emp)}
            >
              <div className="bg-blue-500 rounded text-white p-1 mb-1">{ emp.name }</div>
            </li>
          ))}
        </ul>
        <button
          className="mt-4 w-full bg-green-500 text-white p-2 rounded"
          onClick={handleAddNew}
        >
          Add New Employee
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <nav className="flex justify-between mb-6">
          <Link href="/dashboard">Back to dashboard &rarr;</Link>
        </nav>

        {selectedEmployee ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Edit Employee</h2>

            <div className="space-y-4">
              <input
                className="block border p-2 w-full"
                placeholder="Name"
                value={selectedEmployee.name}
                onChange={e => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
              />
              <input
                className="block border p-2 w-full"
                placeholder="Email"
                value={selectedEmployee.email}
                onChange={e => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
              />
              <input
                className="block border p-2 w-full"
                placeholder="Password"
                value={selectedEmployee.password}
                onChange={e => setSelectedEmployee({ ...selectedEmployee, password: e.target.value })}
              />
              <div className="flex gap-4 mt-6">
                <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave}>
                  Save
                </button>
                <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p>Select an employee from the list to edit or add a new one.</p>
        )}
      </main>
    </div>
  );
}
