import React, { useState, useMemo, useRef } from "react";
import styles from "./Dashboard.module.css";

/* ── Mock data ── */
const MOCK_FILES = [
  { id: 1, name: "report-q4-2025.pdf", type: "PDF", size: "2.4 MB", uploadDate: "2025-12-15" },
  { id: 2, name: "profile-photo.png", type: "PNG", size: "1.1 MB", uploadDate: "2025-11-30" },
  { id: 3, name: "budget-sheet.xlsx", type: "XLSX", size: "340 KB", uploadDate: "2025-11-22" },
  { id: 4, name: "presentation.pptx", type: "PPTX", size: "5.7 MB", uploadDate: "2025-10-08" },
  { id: 5, name: "notes.txt", type: "TXT", size: "12 KB", uploadDate: "2025-09-19" },
  { id: 6, name: "design-mockup.fig", type: "FIG", size: "8.3 MB", uploadDate: "2025-09-01" },
  { id: 7, name: "invoice-sep.pdf", type: "PDF", size: "430 KB", uploadDate: "2025-08-25" },
  { id: 8, name: "team-photo.jpg", type: "JPG", size: "3.2 MB", uploadDate: "2025-08-10" },
  { id: 9, name: "api-docs.md", type: "MD", size: "78 KB", uploadDate: "2025-07-14" },
  { id: 10, name: "backup.zip", type: "ZIP", size: "14.6 MB", uploadDate: "2025-07-01" },
  { id: 11, name: "logo-dark.svg", type: "SVG", size: "24 KB", uploadDate: "2025-06-20" },
  { id: 12, name: "contract-draft.docx", type: "DOCX", size: "890 KB", uploadDate: "2025-06-05" },
  { id: 13, name: "analytics-data.csv", type: "CSV", size: "1.8 MB", uploadDate: "2025-05-18" },
];

const FILES_PER_PAGE = 6;

export default function Dashboard() {
  const [files, setFiles] = useState(MOCK_FILES);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef(null);

  /* ── Filtered files ── */
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, searchQuery]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / FILES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedFiles = filteredFiles.slice(
    (safePage - 1) * FILES_PER_PAGE,
    safePage * FILES_PER_PAGE
  );

  /* ── Handlers ── */
  const handleUpload = () => {
    const input = fileInputRef.current;
    if (!input || !input.files || !input.files.length) return;

    const file = input.files[0];
    const newFile = {
      id: Date.now(),
      name: file.name,
      type: file.name.split(".").pop()?.toUpperCase() || "FILE",
      size: formatBytes(file.size),
      uploadDate: new Date().toISOString().split("T")[0],
    };

    setFiles((prev) => [newFile, ...prev]);
    input.value = "";
    setCurrentPage(1);
  };

  const handleDownload = (file) => {
    alert(`Downloading "${file.name}"…`);
  };

  const handleDelete = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleLogout = () => {
    alert("Logged out");
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Your Files</h1>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Upload */}
      <section className={styles.uploadSection}>
        <input ref={fileInputRef} type="file" className={styles.fileInput} />
        <button className={styles.uploadBtn} onClick={handleUpload}>
          Upload
        </button>
      </section>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search files by name…"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* File cards */}
      {paginatedFiles.length > 0 ? (
        <div className={styles.fileGrid}>
          {paginatedFiles.map((file) => (
            <div key={file.id} className={styles.fileCard}>
              <p className={styles.fileName}>{file.name}</p>
              <p className={styles.fileMeta}>
                {file.type} · {file.size}
                <br />
                Uploaded {file.uploadDate}
              </p>
              <div className={styles.fileActions}>
                <button
                  className={styles.downloadBtn}
                  onClick={() => handleDownload(file)}
                >
                  Download
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(file.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          {searchQuery ? "No files match your search." : "No files uploaded yet."}
        </div>
      )}

      {/* Pagination */}
      {filteredFiles.length > FILES_PER_PAGE && (
        <nav className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`${styles.pageBtn} ${
                page === safePage ? styles.pageBtnActive : ""
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

/* ── Helper ── */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
