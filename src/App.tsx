import React, { useState } from "react";
import "./App.css";

interface EmailResult {
  email: string;
  status: string;
}

interface Results {
  success: EmailResult[];
  failed: EmailResult[];
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
      <p></p>
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
              <svg
                className="w-6 h-6"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                ></path>
              </svg>
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
          ) : (
            <pre className="results-box">
              {loading ? "Processing..." : "No results yet."}
            </pre>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
