"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Moon,
  Sun,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";

/* -------------------------
  Farmer type
------------------------- */
interface Farmer {
  id?: string;
  name: string;
  email: string;
  subcity: string;
  phone: string;
  farmName: string;
  farmType: string;
  farmSize: string | number;
  createdAt?: string;
  avatarUrl?: string;
}

/* -------------------------
  Config
------------------------- */
const PAGE_SIZE = 9;
const FALLBACK_BG = "/assets/agr.jpg"; // replace with your bg path

/* -------------------------
  Utils
------------------------- */
function exportCSV(items: Farmer[]) {
  if (!items.length) {
    alert("No data to export.");
    return;
  }
  const headers = [
    "Name",
    "Email",
    "Subcity",
    "Phone",
    "Farm Name",
    "Farm Type",
    "Farm Size",
    "Registered",
  ];
  const rows = items.map((f) => [
    f.name,
    f.email,
    f.subcity,
    f.phone,
    f.farmName,
    f.farmType,
    String(f.farmSize),
    f.createdAt ? new Date(f.createdAt).toLocaleString() : "",
  ]);
  const csv = [headers, ...rows]
    .map((r) =>
      r
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `farmers_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* -------------------------
  Avatar helper
------------------------- */
function Avatar({ farmer }: { farmer: Farmer }) {
  if (farmer.avatarUrl) {
    return (
      <img
        src={farmer.avatarUrl}
        alt={farmer.name}
        className="w-12 h-12 rounded-full object-cover"
      />
    );
  }
  const initials = farmer.name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = [
    "bg-green-400",
    "bg-blue-400",
    "bg-purple-400",
    "bg-yellow-400",
    "bg-pink-400",
  ];
  const color = colors[(farmer.name.charCodeAt(0) || 0) % colors.length];
  return (
    <div
      className={`w-12 h-12 rounded-full grid place-items-center font-semibold text-white ${color}`}
    >
      {initials}
    </div>
  );
}

/* -------------------------
  Component
------------------------- */
export default function FarmersDashboardGrid() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [farmType, setFarmType] = useState("All");
  const [sortBy, setSortBy] = useState<
    "name" | "farmSize" | "createdAt"
  >("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Farmer | null>(null);

  // Dark mode toggle state
  const [darkMode, setDarkMode] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      : false
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // fetch
  async function fetchFarmers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/farmers");
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
      const data = await res.json();
      const normalized: Farmer[] = data.map((f: any) => ({
        ...f,
        createdAt: f.createdAt ?? new Date().toISOString(),
      }));
      setFarmers(normalized);
    } catch (err: any) {
      setError(err?.message ?? "Error fetching farmers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFarmers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    setRefreshing(true);
    await fetchFarmers();
    setTimeout(() => setRefreshing(false), 500);
  }

  const farmTypes = useMemo(
    () => ["All", ...Array.from(new Set(farmers.map((f) => f.farmType || "Unknown")))],
    [farmers]
  );

  const processed = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let list = farmers.filter((f) =>
      [f.name, f.farmName, f.subcity, f.email].join(" ").toLowerCase().includes(ql)
    );
    if (farmType !== "All") list = list.filter((f) => f.farmType === farmType);
    list.sort((a, b) => {
      let val = 0;
      if (sortBy === "name")
        val = a.name.localeCompare(b.name);
      else if (sortBy === "farmSize")
        val =
          (parseFloat(String(a.farmSize)) || 0) -
          (parseFloat(String(b.farmSize)) || 0);
      else if (sortBy === "createdAt")
        val =
          new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
      return sortDir === "asc" ? val : -val;
    });
    return list;
  }, [farmers, q, farmType, sortBy, sortDir]);

  const total = processed.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageItems = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  }

  /* Motion variants */
  const containerVariant = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
  };
  const cardVariant = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

  return (
    <div
      className="min-h-screen relative bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-50 transition-colors duration-300"
      >
      {/* Background image (glass effect) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${FALLBACK_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: darkMode
            ? "blur(6px) brightness(0.6)"
            : "blur(6px) brightness(0.9)",
          zIndex: 0,
        }}
      />

      {/* Page container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Dark mode toggle */}
        <div className="flex justify-end mb-6">
          {/* <button
            onClick={() => setDarkMode((d) => !d)}
            className="flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Toggle Dark Mode"
            title="Toggle Dark Mode"
          >
            {darkMode ? (
              <>
                <Sun size={16} />
                Light Mode
              </>
            ) : (
              <>
                <Moon size={16} />
                Dark Mode
              </>
            )}
          </button> */}
        </div>

        {/* Header controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold ">
              Beeraleedka — Farmers
            </h1>
            <p className="text-sm mt-1">
              Manage registered farmers, review details and export data.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">
                <Search size={16} />
              </span>
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, farm, subcity or email..."
                className="w-full pl-10 pr-3 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-300 transition"
              />
            </div>

            <select
              value={farmType}
              onChange={(e) => {
                setFarmType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 transition"
            >
              {farmTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <button
              onClick={() => exportCSV(processed)}
              className="px-3 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 flex items-center gap-2 transition"
              title="Export CSV"
            >
              <Download size={16} /> 
            </button>

            <button
              onClick={refresh}
              className={`px-3 py-2 rounded-full bg-white/90 dark:bg-gray-700/90 border border-gray-300 dark:border-gray-600 ${
                refreshing ? "opacity-70" : ""
              } transition`}
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
           <Link
              href="/FarmerRegistration"
              className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition whitespace-nowrap"
              title="Register New Farmer"
            >
              <PlusCircle size={24}  />

            </Link>
          </div>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="text-sm ">Sort:</div>
          <button
            onClick={() => toggleSort("createdAt")}
            className={`px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 ${
              sortBy === "createdAt"
                ? "bg-green-600 text-white dark:bg-green-500"
                : "bg-transparent text-gray-900 dark:text-gray-50"
            } transition`}
          >
            Newest {sortBy === "createdAt" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
          <button
            onClick={() => toggleSort("name")}
            className={`px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 ${
              sortBy === "name"
                ? "bg-green-600 text-white dark:bg-green-500"
                : "bg-transparent text-gray-900 dark:text-gray-50"
            } transition`}
          >
            Name {sortBy === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
          <button
            onClick={() => toggleSort("farmSize")}
            className={`px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 ${
              sortBy === "farmSize"
                ? "bg-green-600 text-white dark:bg-green-500"
                : "bg-transparent text-gray-900 dark:text-gray-50"
            } transition`}
          >
            Size {sortBy === "farmSize" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>

          <div className="ml-auto text-sm">
            Showing{" "}
            <strong>{total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}</strong> to{" "}
            <strong>{Math.min(page * PAGE_SIZE, total)}</strong> of{" "}
            <strong>{total}</strong>
          </div>
          
        </div>

        {/* Error */}
        {error && <div className="mb-4 text-red-600">{error}</div>}

        {/* Grid */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariant}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading
            ? // Loading skeletons
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={cardVariant}
                  className="backdrop-blur-md border border-white/20 dark:border-gray-700 rounded-2xl p-4 shadow animate-pulse h-40"
                />
              ))
            : pageItems.length === 0
            ? (
              <div className="col-span-full p-8 text-center backdrop-blur-md rounded-2xl">
                No farmers found.
              </div>
            )
            : pageItems.map((f) => (
              <motion.article
                key={f.id ?? f.email}
                variants={cardVariant}
                className="bg-white/50 dark:bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700 rounded-2xl p-4 shadow hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer"
                onClick={() => setSelected(f)}
              >
                <div className="flex items-center gap-4">
                  <Avatar farmer={f} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold">{f.name}</h3>
                      <div className="text-xs">
                        {f.createdAt
                          ? new Date(f.createdAt).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                    <div className="text-sm">
                      {f.farmName} • <span className="font-medium">{f.farmType}</span>
                    </div>
                    <div className="mt-2 text-sm">
                      {f.subcity} • {f.phone}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm font-semibold">{f.farmSize} ha</div>
                  <div className="text-sm">Email: {f.email}</div>
                </div>
              </motion.article>
            ))}
        </motion.div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 transition"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 transition"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm flex items-center gap-2">
              Go to
              <input
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={(e) => {
                  const v = Number(e.target.value || 1);
                  if (v >= 1 && v <= totalPages) setPage(v);
                }}
                className="w-12 ml-2 text-sm text-center border border-gray-300 dark:border-gray-600 rounded px-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 transition"
              />
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 transition"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 transition"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>

        {/* Selected Farmer Details Modal */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key="modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-lg relative"
              >
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Close modal"
                  className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar farmer={selected} />
                  <h2 className="text-2xl font-bold">{selected.name}</h2>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> {selected.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selected.phone}
                  </p>
                  <p>
                    <strong>Subcity:</strong> {selected.subcity}
                  </p>
                  <p>
                    <strong>Farm Name:</strong> {selected.farmName}
                  </p>
                  <p>
                    <strong>Farm Type:</strong> {selected.farmType}
                  </p>
                  <p>
                    <strong>Farm Size:</strong> {selected.farmSize} hectares
                  </p>
                  <p>
                    <strong>Registered:</strong>{" "}
                    {selected.createdAt
                      ? new Date(selected.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
