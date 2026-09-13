import { useState } from "react";

function AdminLogin({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();

        // Temporary local admin credentials
        if (username === "pearl city" && password === "1234") {
            localStorage.setItem("adminLoggedIn", "true");
            onLogin();
        } else {
            setError("Invalid username or password");
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleLogin} style={styles.card}>
                <h1>🔐 Admin Login</h1>
                <p>Pearl City Parotta Stall</p>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                />

                {error && <div style={styles.error}>{error}</div>}

                <button type="submit" style={styles.button}>
                    Login
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050816",
        padding: "20px",
    },

    card: {
        width: "100%",
        maxWidth: "400px",
        padding: "30px",
        borderRadius: "16px",
        background: "#111827",
        color: "white",
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
    },

    input: {
        width: "100%",
        padding: "13px",
        marginTop: "15px",
        borderRadius: "8px",
        border: "1px solid #374151",
        background: "#1f2937",
        color: "white",
        boxSizing: "border-box",
    },

    button: {
        width: "100%",
        padding: "13px",
        marginTop: "20px",
        border: "none",
        borderRadius: "8px",
        background: "#06b6d4",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
    },

    error: {
        color: "#f87171",
        marginTop: "12px",
    },
};

export default AdminLogin;