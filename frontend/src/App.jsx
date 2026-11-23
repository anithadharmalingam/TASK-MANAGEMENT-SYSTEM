import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");

  // Get tasks from MongoDB
  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch tasks");

        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error:", error);
        alert("Unable to connect to backend!");
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  // Add Task
  async function addTask(e) {
    e.preventDefault();

    if (!taskName.trim()) {
      alert("Please enter a task!");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskName.trim(),
          priority,
          completed: false,
        }),
      });

      if (!response.ok) throw new Error("Failed to add task");

      const newTask = await response.json();
      setTasks((prev) => [...prev, newTask]);
      setTaskName("");
      setPriority("Medium");
    } catch (error) {
      console.error("Error:", error);
      alert("Unable to add task!");
    }
  }

  // Complete or Undo Task
  async function completeTask(id, completed) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTask = await response.json();

      setTasks((prev) =>
        prev.map((task) => task._id === id ? updatedTask : task)
      );
    } catch (error) {
      console.error("Error:", error);
      alert("Unable to update task!");
    }
  }

  // Start Editing
  function startEdit(task) {
    setEditingId(task._id);
    setEditName(task.title);
    setEditPriority(task.priority);
  }

  // Save Edited Task
  async function saveEdit(id) {
    if (!editName.trim()) {
      alert("Task name cannot be empty!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editName.trim(),
          priority: editPriority,
        }),
      });

      if (!response.ok) throw new Error("Failed to edit task");

      const updatedTask = await response.json();

      setTasks((prev) =>
        prev.map((task) => task._id === id ? updatedTask : task)
      );

      setEditingId(null);
    } catch (error) {
      console.error("Error:", error);
      alert("Unable to edit task!");
    }
  }

  // Delete Task
  async function deleteTask(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete task");

      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Error:", error);
      alert("Unable to delete task!");
    }
  }

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  return (
    <div className="app">
      <header className="header">
        <h1>Task Manager</h1>
        <p>Organize your work. Achieve your goals.</p>
      </header>

      <main className="container">
        <section className="stats">
          <div className="stat-card">
            <h2>{tasks.length}</h2>
            <p>Total Tasks</p>
          </div>

          <div className="stat-card">
            <h2>{completedCount}</h2>
            <p>Completed</p>
          </div>

          <div className="stat-card">
            <h2>{tasks.length - completedCount}</h2>
            <p>Pending</p>
          </div>
        </section>

        <section className="task-form">
          <h2>Add New Task</h2>

          <form onSubmit={addTask}>
            <input
              type="text"
              placeholder="Enter your task..."
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>

            <button type="submit">Add Task</button>
          </form>
        </section>

        <section className="task-list">
          <h2>My Tasks</h2>

          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="empty">
              No tasks yet. Add your first task!
            </p>
          ) : (
            tasks.map((task) => (
              <div className="task-card" key={task._id}>
                {editingId === task._id ? (
                  <div className="task-info">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />

                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>

                    <div className="actions">
                      <button
                        type="button"
                        onClick={() => saveEdit(task._id)}
                      >
                        Save Changes
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-info">
                      <h3 className={task.completed ? "done" : ""}>
                        {task.title}
                      </h3>

                      <span className={`priority ${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="actions">
                      <button
                        className="complete-btn"
                        onClick={() =>
                          completeTask(task._id, task.completed)
                        }
                      >
                        {task.completed ? "Undo" : "Complete"}
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(task)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteTask(task._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default App;