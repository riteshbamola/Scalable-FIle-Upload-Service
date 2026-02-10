import React, { useState, useMemo, useRef, useEffect } from "react";
import styles from "./Dashboard.module.css";
import api from "../api/axios";

const FILES_PER_PAGE = 6;

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef(null);

  const handleGetFiles = async () => {
    try {
      const res = await api.get("/file/allfiles");

      const normalizedFiles = (res.data.allFiles || []).map((file) => ({
        id: file._id,
        name: file.originalName,
        type: file.mimeType.split("/")[1]?.toUpperCase() || "FILE",
        size: formatBytes(file.size),
        uploadDate: file.createdAt.split("T")[0],
        storage: file.storage,
      }));

      setFiles(normalizedFiles);
    } catch (err) {
      console.error(err);
      setFiles([]);
    }
  };

  useEffect(() => {
    handleGetFiles();
  }, []);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;

    const q = searchQuery.toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, searchQuery]);

  /* ── Pagination ── */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredFiles.length / FILES_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedFiles = filteredFiles.slice(
    (safePage - 1) * FILES_PER_PAGE,
    safePage * FILES_PER_PAGE,
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
          {searchQuery
            ? "No files match your search."
            : "No files uploaded yet."}
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
