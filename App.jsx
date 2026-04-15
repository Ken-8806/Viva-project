import React, { useState, useEffect } from "react";
import "./App.css";

const teachers = [
  { username: "teacher1", password: "1234" },
  { username: "teacher2", password: "5678" },
];

const students = [
  { username: "swetha", password: "0000" },
  { username: "raj", password: "1111" },
];

const initialClasses = [
  { id: 1, name: "Maths 101", teacher: "teacher1", time: "10:00 AM", status: "Live", assignments: [] },
  { id: 2, name: "Physics 201", teacher: "teacher2", time: "1:00 PM", status: "Upcoming", assignments: [] },
];

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const teacher = teachers.find(t => t.username === username && t.password === password);
    const student = students.find(s => s.username === username && s.password === password);

    if (teacher) onLogin({ role: "teacher", username });
    else if (student) onLogin({ role: "student", username });
    else setError("Invalid credentials");
  };

  return (
    <div className="login-container">
      <h2>Virtual Classroom Login</h2>

      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />

      <button onClick={handleLogin}>Login</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("Home");
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [chat, setChat] = useState({});
  const [msg, setMsg] = useState("");
  const [newClass, setNewClass] = useState("");
  const [assignment, setAssignment] = useState("");

  // LOAD DATA FIXED
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("classes"));
    const savedChat = JSON.parse(localStorage.getItem("chat")) || {};

    if (saved && saved.length > 0) {
      setClasses(saved);
      setSelectedClass(saved[0]);
    } else {
      setClasses(initialClasses);
      setSelectedClass(initialClasses[0]);
    }

    setChat(savedChat);
  }, []);

  useEffect(() => {
    if (classes.length > 0)
      localStorage.setItem("classes", JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem("chat", JSON.stringify(chat));
  }, [chat]);

  const sendMsg = () => {
    if (!msg.trim() || !selectedClass) return;

    const updated = { ...chat };

    if (!updated[selectedClass.id]) updated[selectedClass.id] = [];

    updated[selectedClass.id].push({
      user: user.username,
      message: msg,
    });

    setChat(updated);
    setMsg("");
  };

  const addClass = () => {
    if (!newClass.trim()) return;

    const cls = {
      id: classes.length + 1,
      name: newClass,
      teacher: user.username,
      time: "TBD",
      status: "Upcoming",
      assignments: [],
    };

    setClasses([...classes, cls]);
    setNewClass("");
  };

  const addAssignment = () => {
    if (!assignment.trim() || !selectedClass) return;

    const updated = classes.map(c => {
      if (c.id === selectedClass.id) {
        const updatedClass = {
          ...c,
          assignments: [...c.assignments, { topic: assignment }],
        };
        setSelectedClass(updatedClass);
        return updatedClass;
      }
      return c;
    });

    setClasses(updated);
    setAssignment("");
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>{user.role} Panel</h2>

        {["Home", "Classes", "Assignments", "Profile"].map(p => (
          <div
            key={p}
            className={page === p ? "active" : ""}
            onClick={() => setPage(p)}
          >
            {p}
          </div>
        ))}
      </aside>

      {/* MAIN */}
      <main className="main">

        <header className="header">
          <span>{user.username}</span>
          <button onClick={() => setUser(null)}>Logout</button>
        </header>

        {/* HOME */}
        {page === "Home" && (
          <div className="card">
            <h2>Welcome {user.username}</h2>
          </div>
        )}

        {/* CLASSES */}
        {page === "Classes" && selectedClass && classes.length > 0 && (
          <div className="card">

            <h3>Classes</h3>

            {user.role === "teacher" && (
              <div className="row">
                <input
                  value={newClass}
                  onChange={e => setNewClass(e.target.value)}
                  placeholder="New Class"
                />
                <button onClick={addClass}>Add</button>
              </div>
            )}

            <div className="class-list">
              {classes.map(c => (
                <div
                  key={c.id}
                  className={`class-box ${selectedClass.id === c.id ? "selected" : ""}`}
                  onClick={() => setSelectedClass(c)}
                >
                  <b>{c.name}</b>
                  <p>{c.status}</p>
                </div>
              ))}
            </div>

            {user.role === "teacher" && (
              <div className="row">
                <input
                  value={assignment}
                  onChange={e => setAssignment(e.target.value)}
                  placeholder="Add Assignment"
                />
                <button onClick={addAssignment}>Add</button>
              </div>
            )}

            <h4>Live Chat</h4>

            <div className="chat">
              {(chat[selectedClass?.id] || []).map((m, i) => (
                <p key={i}>
                  <b>{m.user}:</b> {m.message}
                </p>
              ))}
            </div>

            <div className="row">
              <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder="Message..."
              />
              <button onClick={sendMsg}>Send</button>
            </div>

          </div>
        )}

        {/* ASSIGNMENTS */}
        {page === "Assignments" && selectedClass && (
          <div className="card">
            <h3>Assignments</h3>

            {(selectedClass?.assignments || []).length === 0 ? (
              <p>No assignments</p>
            ) : (
              selectedClass.assignments.map((a, i) => (
                <p key={i}>• {a.topic}</p>
              ))
            )}
          </div>
        )}

        {/* PROFILE */}
        {page === "Profile" && (
          <div className="card">
            <h3>Profile</h3>
            <p>Name: {user.username}</p>
            <p>Role: {user.role}</p>
          </div>
        )}

      </main>
    </div>
  );
}