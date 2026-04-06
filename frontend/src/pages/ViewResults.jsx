import { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/axios";
import { useAlert } from "../context/AlertContext";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";

import "../styles/results.css";

/* ================= HELPERS ================= */
const formatDate = (dt) => {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
};

const PIE_COLORS   = ["#22c55e", "#ef4444"];
const GRAPH_COLORS = {
  total_attempts:  "#6366f1",
  pass_count:      "#22c55e",
  fail_count:      "#ef4444",
  students_active: "#f59e0b"
};
const RESULTS_PER_PAGE  = 10;
const STUDENTS_PER_PAGE = 10;

export default function ViewResults() {

  const { showAlert } = useAlert();

  /* ===== TABS ===== */
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("results_active_tab") || "overview"
  );

  /* ===== SUMMARY ===== */
  const [summary, setSummary] = useState(null);

  /* ===== RESULTS TABLE ===== */
  const [results,      setResults]      = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [currentPage,  setCurrentPage]  = useState(
    () => parseInt(localStorage.getItem("results_current_page")) || 1
  );
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  /* ===== GRAPH 1 ===== */
  const [quizGraph,    setQuizGraph]    = useState([]);
  const [graphRange,   setGraphRange]   = useState("monthly");
  const [graphLoading, setGraphLoading] = useState(false);

  /* ===== GRAPH 2 — STUDENT (infinite scroll) ===== */
  const [studentData,      setStudentData]      = useState([]);
  const [studentPage,      setStudentPage]       = useState(1);
  const [studentTotalPages,setStudentTotalPages] = useState(1);
  const [studentTotal,     setStudentTotal]      = useState(0);
  const [studentLoading,   setStudentLoading]    = useState(false);
  const [studentLoadingMore,setStudentLoadingMore]= useState(false);
  const [selectedStudent,  setSelectedStudent]   = useState(null);
  const [studentSearch,    setStudentSearch]     = useState("");
  const [searchInput,      setSearchInput]       = useState("");

  /* scroll sentinel ref */
  const sentinelRef = useRef(null);
  const listRef     = useRef(null);


  /* ================================================
     LOAD SUMMARY
  ================================================ */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/analytics");
        setSummary(res.data);
      } catch { /* silent */ }
    };
    load();
  }, []);


  /* ================================================
     LOAD RESULTS TABLE — server side, 10 per page
  ================================================ */
  const loadResults = useCallback(async (page) => {
    console.log(`[PAGINATION] Loading page ${page} — fetching ${RESULTS_PER_PAGE} rows from API`);
    setTableLoading(true);
    try {
      const res  = await api.get(`/attempt/results?page=${page}&limit=${RESULTS_PER_PAGE}`);
      const data = res.data || {};
      setResults(data.results || []);
      console.log(`[PAGINATION] Page ${page} loaded — got ${(data.results || []).length} rows, total ${data.pagination?.totalResults} results, ${data.pagination?.totalPages} pages`);
      setTotalPages(Number(data.pagination?.totalPages)   || 1);
      setTotalResults(Number(data.pagination?.totalResults) || 0);
      if (page > (Number(data.pagination?.totalPages) || 1)) setCurrentPage(1);
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to load results", "error");
    } finally {
      setTableLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    if (activeTab === "table") loadResults(currentPage);
  }, [activeTab, currentPage, loadResults]);

  const handleTabChange = (tab) => {
    localStorage.setItem("results_active_tab", tab);
    setActiveTab(tab);
    if (tab === "table") {
      const saved = parseInt(localStorage.getItem("results_current_page")) || 1;
      setCurrentPage(saved);
    }
  };


  /* ================================================
     LOAD QUIZ GRAPH
  ================================================ */
  const loadQuizGraph = useCallback(async (range) => {
    setGraphLoading(true);
    try {
      const res = await api.get(`/analytics/quiz-graph?range=${range}`);
      setQuizGraph(res.data.data || []);
    } catch {
      showAlert("Failed to load graph", "error");
    } finally {
      setGraphLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    if (activeTab === "overview") loadQuizGraph(graphRange);
  }, [activeTab, graphRange, loadQuizGraph]);


  /* ================================================
     LOAD STUDENTS — page 1 fresh (search or tab open)
  ================================================ */
  const loadStudentsFirst = useCallback(async (search = "") => {
    console.log(`[STUDENT SCROLL] Loading first page — search: "${search || "none"}"`);
    setStudentLoading(true);
    setStudentData([]);
    setSelectedStudent(null);
    setStudentPage(1);
    try {
      const res = await api.get(
        `/analytics/student-graph?page=1&limit=${STUDENTS_PER_PAGE}&search=${encodeURIComponent(search)}`
      );
      const students = res.data.students || [];
      setStudentData(students);
      setStudentTotalPages(res.data.pagination?.totalPages   || 1);
      setStudentTotal(res.data.pagination?.totalStudents || 0);
      setStudentPage(1);
      // Auto-select first student by default
      if (students.length > 0) {
        setSelectedStudent(students[0]);
      }
      console.log(`[STUDENT SCROLL] First page loaded — got ${students.length} students, total: ${res.data.pagination?.totalStudents}, pages: ${res.data.pagination?.totalPages}`);
    } catch {
      showAlert("Failed to load students", "error");
      console.log(`[STUDENT SCROLL] Error loading first page`);
    } finally {
      setStudentLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    if (activeTab === "students") loadStudentsFirst(studentSearch);
  }, [activeTab]); // eslint-disable-line


  /* ================================================
     LOAD MORE STUDENTS — infinite scroll
  ================================================ */
  const loadMoreStudents = useCallback(async () => {
    const nextPage = studentPage + 1;
    if (nextPage > studentTotalPages) {
      console.log(`[STUDENT SCROLL] No more pages — already at ${studentPage} of ${studentTotalPages}`);
      return;
    }
    if (studentLoadingMore) {
      console.log(`[STUDENT SCROLL] Already loading, skipping...`);
      return;
    }

    console.log(`[STUDENT SCROLL] Sentinel visible → loading page ${nextPage} of ${studentTotalPages}`);
    setStudentLoadingMore(true);
    try {
      const res = await api.get(
        `/analytics/student-graph?page=${nextPage}&limit=${STUDENTS_PER_PAGE}&search=${encodeURIComponent(studentSearch)}`
      );
      const newStudents = res.data.students || [];
      setStudentData(prev => [...prev, ...newStudents]);
      setStudentPage(nextPage);
      setStudentTotalPages(res.data.pagination?.totalPages || 1);
      console.log(`[STUDENT SCROLL] Page ${nextPage} loaded — got ${newStudents.length} students, total loaded: ${newStudents.length + (studentPage * STUDENTS_PER_PAGE)}`);
    } catch {
      showAlert("Failed to load more students", "error");
      console.log(`[STUDENT SCROLL] Error loading page ${nextPage}`);
    } finally {
      setStudentLoadingMore(false);
    }
  }, [studentPage, studentTotalPages, studentLoadingMore, studentSearch, showAlert]);


  /* ================================================
     INTERSECTION OBSERVER — trigger loadMore on scroll
     Re-runs whenever studentData changes so sentinel
     is always observed after new items are appended
  ================================================ */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log(`[STUDENT SCROLL] Sentinel intersecting — triggering loadMore`);
          loadMoreStudents();
        }
      },
      {
        root: null,          // use viewport
        rootMargin: "100px", // trigger 100px before bottom
        threshold: 0
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();

  }, [studentData, loadMoreStudents]); // re-observe when list grows


  /* ================================================
     SEARCH — debounced 400ms
  ================================================ */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "students") {
        setStudentSearch(searchInput);
        loadStudentsFirst(searchInput);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line


  /* ================================================
     PAGINATION HELPERS (results table)
  ================================================ */
  const goToPage = (page) => {
    console.log(`[PAGINATION] Page button clicked → page ${page}`);
    localStorage.setItem("results_current_page", page);
    if (!page || page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    if (totalPages <= 1) return [1];
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) { pages.push(i); }
    if (currentPage < totalPages - 2) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const pieData = summary
    ? [
        { name: "Pass", value: summary.totalPass || 0 },
        { name: "Fail", value: summary.totalFail || 0 }
      ]
    : [];


  /* ================================================
     UI
  ================================================ */
  return (
    <div className="results-wrapper">
      <div className="results-card">

        {/* HEADER */}
        <div className="dash-header">
          <h2>📊 Quiz Results Dashboard</h2>
          <p className="dash-sub">Full analytics, graphs and student breakdown</p>
        </div>

        {/* SUMMARY CARDS */}
        {summary && (
          <div className="summary-cards">
            <div className="s-card blue">
              <div className="s-icon">📝</div>
              <div className="s-info">
                <span className="s-val">{summary.totalQuizzes}</span>
                <span className="s-label">Total Quizzes</span>
              </div>
            </div>
            <div className="s-card purple">
              <div className="s-icon">👥</div>
              <div className="s-info">
                <span className="s-val">{summary.totalStudents}</span>
                <span className="s-label">Students</span>
              </div>
            </div>
            <div className="s-card yellow">
              <div className="s-icon">🎯</div>
              <div className="s-info">
                <span className="s-val">{summary.totalAttempts}</span>
                <span className="s-label">Attempts</span>
              </div>
            </div>
            <div className="s-card green">
              <div className="s-icon">✅</div>
              <div className="s-info">
                <span className="s-val">{summary.totalPass}</span>
                <span className="s-label">Passed</span>
              </div>
            </div>
            <div className="s-card red">
              <div className="s-icon">❌</div>
              <div className="s-info">
                <span className="s-val">{summary.totalFail}</span>
                <span className="s-label">Failed</span>
              </div>
            </div>
            <div className="s-card teal">
              <div className="s-icon">⭐</div>
              <div className="s-info">
                <span className="s-val">{Number(summary.averageScore).toFixed(1)}</span>
                <span className="s-label">Avg Score</span>
              </div>
            </div>
          </div>
        )}

        {/* TABS */}
        <div className="dash-tabs">
          <button className={activeTab === "overview" ? "tab active" : "tab"} onClick={() => handleTabChange("overview")}>
            📈 Quiz Graph
          </button>
          <button className={activeTab === "students" ? "tab active" : "tab"} onClick={() => handleTabChange("students")}>
            👤 Student Graph
          </button>
          <button className={activeTab === "table" ? "tab active" : "tab"} onClick={() => handleTabChange("table")}>
            📋 Results Table
          </button>
        </div>


        {/* ===== TAB 1 — QUIZ GRAPH ===== */}
        {activeTab === "overview" && (
          <div className="graph-section">
            <div className="graph-header">
              <h3>📈 Quiz Activity Over Time</h3>
              <div className="range-btns">
                {["daily", "monthly", "yearly"].map(r => (
                  <button
                    key={r}
                    className={graphRange === r ? "range-btn active" : "range-btn"}
                    onClick={() => setGraphRange(r)}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {graphLoading ? (
              <p className="empty-text">Loading graph...</p>
            ) : quizGraph.length === 0 ? (
              <p className="empty-text">No data yet. Students need to submit quizzes first.</p>
            ) : (
              <>
                <div className="chart-box">
                  <h4>Attempts / Pass / Fail</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={quizGraph} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip /><Legend />
                      <Bar dataKey="total_attempts" name="Total Attempts" fill={GRAPH_COLORS.total_attempts} radius={[4,4,0,0]} />
                      <Bar dataKey="pass_count"     name="Pass"           fill={GRAPH_COLORS.pass_count}     radius={[4,4,0,0]} />
                      <Bar dataKey="fail_count"     name="Fail"           fill={GRAPH_COLORS.fail_count}     radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-box">
                  <h4>Active Students Over Time</h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={quizGraph} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip /><Legend />
                      <Line type="monotone" dataKey="students_active" name="Students Active" stroke={GRAPH_COLORS.students_active} strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="quizzes_active"  name="Quizzes Active"  stroke={GRAPH_COLORS.total_attempts}  strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {pieData.length > 0 && (
                  <div className="chart-box pie-box">
                    <h4>Overall Pass vs Fail</h4>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </div>
        )}


        {/* ===== TAB 2 — STUDENT GRAPH ===== */}
        {activeTab === "students" && (
          <div className="graph-section">

            <div className="graph-header">
              <h3>👤 Student Performance Breakdown</h3>
              <div className="search-wrap">
                <input
                  className="student-search"
                  placeholder="Search name or email..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
                {studentTotal > 0 && (
                  <span className="student-count">
                    {studentData.length} / {studentTotal} students
                  </span>
                )}
              </div>
            </div>

            {studentLoading ? (
              <p className="empty-text">Loading students...</p>
            ) : studentData.length === 0 ? (
              <p className="empty-text">No students found.</p>
            ) : (
              <div className="student-layout">

                {/* LEFT — INFINITE SCROLL LIST */}
                <div className="student-list" ref={listRef}>

                  {studentData.map(s => (
                    <div
                      key={s.student_id}
                      className={`student-item ${selectedStudent?.student_id === s.student_id ? "active" : ""}`}
                      onClick={() => setSelectedStudent(s)}
                    >
                      <div className="si-name">{s.full_name}</div>
                      <div className="si-email">{s.email}</div>
                      <div className="si-stats">
                        <span className="si-pass">✅ {s.passCount}</span>
                        <span className="si-fail">❌ {s.failCount}</span>
                        <span className="si-avg">⭐ {s.avgPercent}%</span>
                      </div>
                    </div>
                  ))}

                  {/* SENTINEL — triggers load more when visible */}
                  {studentPage < studentTotalPages && (
                    <div ref={sentinelRef} className="scroll-sentinel">
                      {studentLoadingMore
                        ? <span className="loading-more">Loading more...</span>
                        : <span className="loading-more">Scroll for more</span>
                      }
                    </div>
                  )}

                  {/* END OF LIST */}
                  {studentPage >= studentTotalPages && studentData.length > 0 && (
                    <div className="list-end">
                      All {studentTotal} students loaded
                    </div>
                  )}

                </div>

                {/* RIGHT — STUDENT DETAIL */}
                {selectedStudent ? (
                  <div className="student-detail">
                    <div className="sd-header">
                      <div>
                        <h3>{selectedStudent.full_name}</h3>
                        <p>{selectedStudent.email}</p>
                      </div>
                      <div className="sd-summary">
                        <span className="sd-chip blue">{selectedStudent.totalAttempts} Attempts</span>
                        <span className="sd-chip green">Pass: {selectedStudent.passCount}</span>
                        <span className="sd-chip red">Fail: {selectedStudent.failCount}</span>
                        <span className="sd-chip yellow">Avg: {selectedStudent.avgPercent}%</span>
                      </div>
                    </div>

                    {selectedStudent.attempts.length > 0 && (
                      <div className="chart-box" style={{ marginBottom: "20px" }}>
                        <h4>Score per Quiz</h4>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart
                            data={selectedStudent.attempts.map(a => ({
                              name: a.quiz_title.length > 12 ? a.quiz_title.slice(0, 12) + "…" : a.quiz_title,
                              Score: Number(a.score),
                              Percentage: Number(a.percentage)
                            }))}
                            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip /><Legend />
                            <Bar dataKey="Score"      fill="#6366f1" radius={[4,4,0,0]} />
                            <Bar dataKey="Percentage" fill="#f59e0b" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div className="sd-table-wrap">
                      <table className="results-table">
                        <thead>
                          <tr>
                            <th>Quiz</th><th>Score</th><th>%</th>
                            <th>Grade</th><th>Status</th>
                            <th>Submitted</th><th>Fail Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudent.attempts.map((a, i) => (
                            <tr key={i}>
                              <td>{a.quiz_title}</td>
                              <td>{a.score}</td>
                              <td>{Number(a.percentage || 0)}%</td>
                              <td><span className={`grade-badge ${a.grade}`}>{a.grade || "—"}</span></td>
                              <td>
                                <span className={a.result_status === "Pass" ? "status-badge pass" : "status-badge fail"}>
                                  {a.disqualified ? "🚫 DQ" : (a.result_status || "—")}
                                </span>
                              </td>
                              <td style={{ fontSize: "12px", color: "#6b7280" }}>{formatDate(a.submitted_at)}</td>
                              <td style={{ fontSize: "12px", color: "#ef4444" }}>{a.fail_reason || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="student-detail empty-detail">
                    <p>👈 Select a student to view their full detail</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}


        {/* ===== TAB 3 — RESULTS TABLE ===== */}
        {activeTab === "table" && (
          <div className="table-section">
            <div className="table-info-bar">
              <span>
                Showing <b>{results.length}</b> of <b>{totalResults}</b> results
                &nbsp;— Page <b>{currentPage}</b> of <b>{totalPages}</b>
              </span>
            </div>

            {tableLoading && <p className="empty-text">Loading page {currentPage}...</p>}
            {!tableLoading && results.length === 0 && <p className="empty-text">No results available.</p>}

            {!tableLoading && results.length > 0 && (
              <>
                <div className="table-wrap">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Student</th><th>Email</th><th>Quiz</th>
                        <th>Score</th><th>%</th><th>Grade</th><th>Status</th><th>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => {
                        const percent = Number(r.percentage) || 0;
                        const rowNum  = (currentPage - 1) * RESULTS_PER_PAGE + i + 1;
                        return (
                          <tr key={i}>
                            <td style={{ color: "#9ca3af", fontSize: "12px" }}>{rowNum}</td>
                            <td><b>{r.full_name}</b></td>
                            <td style={{ fontSize: "13px", color: "#6b7280" }}>{r.email}</td>
                            <td>{r.title}</td>
                            <td><b>{r.score}</b></td>
                            <td>{percent}%</td>
                            <td><span className={`grade-badge ${r.grade}`}>{r.grade || "—"}</span></td>
                            <td>
                              <span className={r.result_status === "Pass" ? "status-badge pass" : "status-badge fail"}>
                                {r.disqualified ? "🚫 DQ" : (r.result_status || "—")}
                              </span>
                            </td>
                            <td style={{ fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap" }}>
                              {formatDate(r.submitted_at)}
                            </td>
                          </tr>
                        );
                        
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="pagination-modern">
                  <button disabled={currentPage === 1 || tableLoading} onClick={() => goToPage(1)} title="First">«</button>
                  <button disabled={currentPage === 1 || tableLoading} onClick={() => goToPage(currentPage - 1)}>Prev</button>
                  {getPageNumbers().map((p, i) => {
                    if (p === "...") return <span key={i} className="dots">...</span>;
                    return (
                      <button key={i} className={`page-btn ${currentPage === p ? "active" : ""}`}
                        onClick={() => goToPage(p)} disabled={tableLoading}>
                        {p}
                      </button>
                    );
                  })}
                  <button disabled={currentPage === totalPages || tableLoading} onClick={() => goToPage(currentPage + 1)}>Next</button>
                  <button disabled={currentPage === totalPages || tableLoading} onClick={() => goToPage(totalPages)} title="Last">»</button>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}