import React, { useState } from "react";
import "./App.css";

interface EmailResult {
  email: string;
  status: string;
  error?: string; // Optional for malformatted rows
}

interface Results {
  success: EmailResult[];
  failed: EmailResult[];
  malformatted: EmailResult[]; // Add malformatted rows
}

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [host, setHost] = useState<string>("smtp.gmail.com");
  const [port, setPort] = useState<number>(587);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      alert("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("host", host);
    formData.append("port", port.toString());

    try {
      setLoading(true);
      setResults(null);
      const response = await fetch("https://checkerbackend.onrender.com/api/checker", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
        return;
      }

      const data: Results = await response.json();
      setResults(data);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>SMTP Checker</h1>
      </header>
      <main className="main">
        <form onSubmit={handleSubmit} className="form">
          <div className="textInputWrapper">
            <label>SMTP Host:</label>
            <input
              type="text"
              disabled
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="textInput"
            />
          </div>
          <div className="textInputWrapper">
            <label>SMTP Port:</label>
            <input
              type="number"
              disabled
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              className="textInput"
            />
          </div>
          <div className="form-group">
            <label className="button">
              <span className="text">Upload File</span>
              <input
                type="file"
                onChange={handleFileChange}
                className="file-input"
                accept=".txt, .csv"
              />
            </label>
            {fileName && <span className="file-name">{fileName}</span>}
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Processing..." : "Start Checking"}
          </button>
        </form>
        <section className="results">
          <h2>Results:</h2>
          {results ? (
            <>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Success Email</th>
                    <th>Status</th>
                    <th>Failed Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(
                    {
                      length: Math.max(
                        results.success.length,
                        results.failed.length
                      ),
                    },
                    (_, index) => (
                      <tr key={index}>
                        <td>{results.success[index]?.email || ""}</td>
                        <td className="success-status">
                          {results.success[index]?.status || ""}
                        </td>
                        <td>{results.failed[index]?.email || ""}</td>
                        <td className="failed-status">
                          {results.failed[index]?.status || ""}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
              <h3>Malformatted Rows:</h3>
              <table className="malformatted-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {results.malformatted.map((entry, index) => (
                    <tr key={index} className="malformatted-row">
                      <td>{entry.email}</td>
                      <td>{entry.status}</td>
                      <td>{entry.error || "Unknown error"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <pre className="results-box">
              {loading ? "Processing..." : "No results yet."}
            </pre>
          )}
        </section>
        <h2> For @houssine07 </h2>
      </main>
    </div>
  );
};

export default App;
