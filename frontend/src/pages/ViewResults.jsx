import { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/axios";
import { useAlert } from "../context/AlertContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { FaChartBar, FaUsers, FaCheckCircle, FaTimesCircle, FaStar, FaListAlt, FaCalendarAlt, FaSearch, FaChevronRight } from "react-icons/fa";

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

const PIE_COLORS = ["#10b981", "#ef4444"];
const GRAPH_COLORS = {
  total_attempts: "#6366f1",
  pass_count: "#10b981",
  fail_count: "#ef4444",
  students_active: "#f59e0b"
};

const RESULTS_PER_PAGE = 10;
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
  const [results, setResults] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    () => parseInt(localStorage.getItem("results_current_page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  /* ===== GRAPH 1 ===== */
  const [quizGraph, setQuizGraph] = useState([]);
  const [graphRange, setGraphRange] = useState("monthly");
  const [graphLoading, setGraphLoading] = useState(false);

  /* ===== GRAPH 2 — STUDENT (infinite scroll) ===== */
  const [studentData, setStudentData] = useState([]);
  const [studentPage, setStudentPage] = useState(1);
  const [studentTotalPages, setStudentTotalPages] = useState(1);
  const [studentTotal, setStudentTotal] = useState(0);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentLoadingMore, setStudentLoadingMore] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const sentinelRef = useRef(null);

  /* ================= LOAD SUMMARY ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/analytics");
        setSummary(res.data);
      } catch { /* silent */ }
    };
    load();
  }, []);

  /* ================= LOAD RESULTS TABLE ================= */
  const loadResults = useCallback(async (page) => {
    setTableLoading(true);
    try {
      const res = await api.get(`/attempt/results?page=${page}&limit=${RESULTS_PER_PAGE}`);
      const data = res.data || {};
      setResults(data.results || []);
      setTotalPages(Number(data.pagination?.totalPages) || 1);
      setTotalResults(Number(data.pagination?.totalResults) || 0);
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

  /* ================= LOAD QUIZ GRAPH ================= */
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

  /* ================= LOAD STUDENTS ================= */
  const loadStudentsFirst = useCallback(async (search = "") => {
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
      setStudentTotalPages(res.data.pagination?.totalPages || 1);
      setStudentTotal(res.data.pagination?.totalStudents || 0);
      if (students.length > 0) setSelectedStudent(students[0]);
    } catch {
      showAlert("Failed to load students", "error");
    } finally {
      setStudentLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    if (activeTab === "students") loadStudentsFirst(studentSearch);
  }, [activeTab]); // eslint-disable-line

  const loadMoreStudents = useCallback(async () => {
    const nextPage = studentPage + 1;
    if (nextPage > studentTotalPages || studentLoadingMore) return;

    setStudentLoadingMore(true);
    try {
      const res = await api.get(
        `/analytics/student-graph?page=${nextPage}&limit=${STUDENTS_PER_PAGE}&search=${encodeURIComponent(studentSearch)}`
      );
      const newStudents = res.data.students || [];
      setStudentData(prev => [...prev, ...newStudents]);
      setStudentPage(nextPage);
      setStudentTotalPages(res.data.pagination?.totalPages || 1);
    } catch {
      showAlert("Failed to load more students", "error");
    } finally {
      setStudentLoadingMore(false);
    }
  }, [studentPage, studentTotalPages, studentLoadingMore, studentSearch, showAlert]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMoreStudents();
    }, { rootMargin: "100px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [studentData, loadMoreStudents]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "students") {
        setStudentSearch(searchInput);
        loadStudentsFirst(searchInput);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line

  const goToPage = (page) => {
    if (!page || page < 1 || page > totalPages) return;
    localStorage.setItem("results_current_page", page);
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    if (totalPages <= 1) return [1];
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) { pages.push(i); }
    if (currentPage < totalPages - 2) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const pieData = summary ? [{ name: "Pass", value: summary.totalPass || 0 }, { name: "Fail", value: summary.totalFail || 0 }] : [];

  return (
    <div className="res-pro-container">
      {/* HEADER */}
      <header className="res-pro-header">
        <div className="header-left">
          <div className="title-stack">
            <h1>Analytics Dashboard</h1>
            <p>Comprehensive insights into student performance</p>
          </div>
        </div>
      </header>

      {/* SUMMARY STATS */}
      {summary && (
        <div className="res-stats-grid">
          <div className="stat-pro-card blue">
            <FaChartBar className="p-icon" />
            <div className="p-info">
              <label>Quizzes</label>
              <h3>{summary.totalQuizzes}</h3>
            </div>
          </div>
          <div className="stat-pro-card purple">
            <FaUsers className="p-icon" />
            <div className="p-info">
              <label>Students</label>
              <h3>{summary.totalStudents}</h3>
            </div>
          </div>
          <div className="stat-pro-card yellow">
            <FaListAlt className="p-icon" />
            <div className="p-info">
              <label>Attempts</label>
              <h3>{summary.totalAttempts}</h3>
            </div>
          </div>
          <div className="stat-pro-card green">
            <FaCheckCircle className="p-icon" />
            <div className="p-info">
              <label>Passed</label>
              <h3>{summary.totalPass}</h3>
            </div>
          </div>
          <div className="stat-pro-card red">
            <FaTimesCircle className="p-icon" />
            <div className="p-info">
              <label>Failed</label>
              <h3>{summary.totalFail}</h3>
            </div>
          </div>
          <div className="stat-pro-card teal">
            <FaStar className="p-icon" />
            <div className="p-info">
              <label>Avg. Score</label>
              <h3>{Number(summary.averageScore).toFixed(1)}%</h3>
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <nav className="res-tabs">
        <button className={activeTab === "overview" ? "res-tab active" : "res-tab"} onClick={() => handleTabChange("overview")}>
          Performance Trends
        </button>
        <button className={activeTab === "students" ? "res-tab active" : "res-tab"} onClick={() => handleTabChange("students")}>
          Student Analysis
        </button>
        <button className={activeTab === "table" ? "res-tab active" : "res-tab"} onClick={() => handleTabChange("table")}>
          Raw Data Table
        </button>
      </nav>

      {/* TAB CONTENT */}
      <div className="res-content">
        
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="res-view-overview">
            <div className="view-header">
              <h3>Performance Overview</h3>
              <div className="range-pills">
                {["daily", "monthly", "yearly"].map(r => (
                  <button key={r} className={graphRange === r ? "pill active" : "pill"} onClick={() => setGraphRange(r)}>
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {graphLoading ? <div className="res-loader-small"></div> : (
              <div className="charts-grid">
                <div className="chart-card large">
                  <h4>Attempts vs Outcomes</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={quizGraph} margin={{ right: 30, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" fontSize={12} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f8fafc'}} />
                      <Legend verticalAlign="top" height={36}/>
                      <Bar dataKey="total_attempts" name="Total Attempts" fill={GRAPH_COLORS.total_attempts} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pass_count" name="Pass" fill={GRAPH_COLORS.pass_count} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="fail_count" name="Fail" fill={GRAPH_COLORS.fail_count} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h4>Engagement Trends</h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={quizGraph} margin={{ right: 30, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" fontSize={12} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="students_active" name="Students" stroke={GRAPH_COLORS.students_active} strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="quizzes_active" name="Quizzes" stroke={GRAPH_COLORS.total_attempts} strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h4>Success Ratio</h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((_, index) => <Cell key={index} fill={PIE_COLORS[index]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === "students" && (
          <div className="res-view-students">
            <div className="student-browser">
              <div className="browser-sidebar">
                <div className="sidebar-search">
                  <FaSearch />
                  <input placeholder="Search students..." value={searchInput} onChange={e => setSearchInput(e.target.value)} />
                </div>
                <div className="student-list-scroller">
                  {studentData.map(s => (
                    <div key={s.student_id} className={`student-row ${selectedStudent?.student_id === s.student_id ? 'active' : ''}`} onClick={() => setSelectedStudent(s)}>
                      <div className="row-info">
                        <span className="row-name">{s.full_name}</span>
                        <span className="row-email">{s.email}</span>
                      </div>
                      <FaChevronRight className="row-arrow" />
                    </div>
                  ))}
                  <div ref={sentinelRef} className="scroll-trigger">
                    {studentLoadingMore && "Loading more..."}
                  </div>
                </div>
              </div>

              <div className="browser-content">
                {selectedStudent ? (
                  <div className="student-profile">
                    <div className="profile-header">
                      <div className="p-header-left">
                        <h2>{selectedStudent.full_name}</h2>
                        <p>{selectedStudent.email}</p>
                      </div>
                      <div className="p-header-stats">
                        <div className="mini-stat"><b>{selectedStudent.totalAttempts}</b> <span>Attempts</span></div>
                        <div className="mini-stat"><b>{selectedStudent.avgPercent}%</b> <span>Average</span></div>
                      </div>
                    </div>

                    <div className="profile-attempts">
                      <h4>Recent Submissions</h4>
                      <div className="pro-table-wrapper">
                        <table className="pro-table">
                          <thead>
                            <tr>
                              <th>Quiz Title</th>
                              <th>Score</th>
                              <th>Status</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedStudent.attempts.map((a, i) => (
                              <tr key={i}>
                                <td>{a.quiz_title}</td>
                                <td><b>{a.score}</b> ({a.percentage}%)</td>
                                <td><span className={`status-pill ${(a.result_status || "").toLowerCase()}`}>{a.result_status}</span></td>
                                <td>{formatDate(a.submitted_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : <div className="no-selection">Select a student from the list to view their full analytics.</div>}
              </div>
            </div>
          </div>
        )}

        {/* TABLE TAB */}
        {activeTab === "table" && (
          <div className="res-view-table">
            <div className="table-controls">
              <p>Showing {results.length} of {totalResults} entries</p>
            </div>
            <div className="pro-table-wrapper">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Quiz Title</th>
                    <th>Score</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td><b>{r.full_name}</b></td>
                      <td>{r.email}</td>
                      <td>{r.title}</td>
                      <td>{r.score} ({r.percentage}%)</td>
                      <td><span className={`grade-tag ${r.grade}`}>{r.grade}</span></td>
                      <td><span className={`status-pill ${(r.result_status || "").toLowerCase()}`}>{r.result_status}</span></td>
                      <td>{formatDate(r.submitted_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="pro-pagination">
              <button disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>Previous</button>
              <div className="pages">
                {getPageNumbers().map((p, i) => (
                  <button key={i} className={currentPage === p ? 'active' : ''} onClick={() => typeof p === 'number' && goToPage(p)}>{p}</button>
                ))}
              </div>
              <button disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}