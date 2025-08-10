"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  Users,
  Home,
  BarChart2,
  X,
  DownloadCloud,
  ArrowUp,
  RefreshCw,
  ChevronsUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/* ---------------------------
  Dummy useAuth - replace with your auth hook
--------------------------- */
function useAuth() {
  return {
    isAuthenticated: true,
    user: { role: "superadmin", name: "Admin User" },
  };
}

/* ---------------------------
  Types
--------------------------- */
interface Farmer {
  id?: string;
  name: string;
  email: string;
  subcity: string;
  phone: string;
  farmName: string;
  farmType: string;
  farmSize: string; // numeric string or number
  createdAt?: string;
}

/* ---------------------------
  Constants
--------------------------- */
const COLORS = ["#4ade80", "#60a5fa", "#facc15", "#f87171", "#34d399"];
const pageSize = 8;

/* ---------------------------
  Helpers
--------------------------- */
function exportToCSV(items: Farmer[]) {
  const header = [
    "Name",
    "Email",
    "Phone",
    "Subcity",
    "Farm Name",
    "Farm Type",
    "Farm Size",
    "Registered",
  ];
  const rows = items.map((f) => [
    f.name,
    f.email,
    f.phone,
    f.subcity,
    f.farmName,
    f.farmType,
    f.farmSize,
    f.createdAt ?? "",
  ]);
  const csvContent =
    [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `farmers_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------------------------
  Main Component
--------------------------- */
export default function FarmersDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // data states
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "farmSize" | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // UI states
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [activeType, setActiveType] = useState<string>("All");
  const [showNav, setShowNav] = useState(true);
  const [scrollPos, setScrollPos] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const mountedRef = useRef(false);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "superadmin") {
      router.replace("/");
    }
  }, [user, isAuthenticated, router]);

  // fetch
  async function fetchFarmers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/farmers");
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
      const data = await res.json();
      const normalized = data.map((f: Farmer) => ({
        ...f,
        createdAt: f.createdAt ?? new Date().toISOString(),
      }));
      setFarmers(normalized);
    } catch (err: any) {
      setError(err.message || "Error fetching farmers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFarmers();
    mountedRef.current = true;
    // scroll listener for navbar and show scroll-up button
    const onScroll = () => {
      const y = window.scrollY;
      setShowNav(y < scrollPos || y < 50); // show nav when scrolling up or near top
      setScrollPos(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refresh action
  async function onRefresh() {
    setRefreshing(true);
    await fetchFarmers();
    setTimeout(() => setRefreshing(false), 500);
  }

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 220);
    return () => clearTimeout(t);
  }, [q]);

  // derived filters/sorts
  const farmTypes = useMemo(() => {
    const types = Array.from(new Set(farmers.map((f) => f.farmType || "Unknown")));
    return ["All", ...types];
  }, [farmers]);

  const processed = useMemo(() => {
    const qLower = debouncedQ.toLowerCase();
    let list = farmers.filter((f) =>
      (f.name + " " + f.farmName + " " + f.subcity + " " + f.email)
        .toLowerCase()
        .includes(qLower)
    );

    if (activeType !== "All") {
      list = list.filter((f) => f.farmType === activeType);
    }

    list.sort((a, b) => {
      let val = 0;
      if (sortBy === "name") val = a.name.localeCompare(b.name);
      else if (sortBy === "farmSize")
        val = (parseFloat(String(a.farmSize)) || 0) - (parseFloat(String(b.farmSize)) || 0);
      else if (sortBy === "createdAt")
        val = new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
      return sortDir === "asc" ? val : -val;
    });

    return list;
  }, [farmers, debouncedQ, sortBy, sortDir, activeType]);

  const total = processed.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = processed.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  function toggleSort(column: typeof sortBy) {
    if (sortBy === column) setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    else {
      setSortBy(column);
      setSortDir("desc");
    }
  }

  // stats
  const totalFarmers = farmers.length;
  const totalFarmSize = farmers.reduce((sum, f) => sum + (parseFloat(String(f.farmSize)) || 0), 0);
  const farmsByType = farmers.reduce<Record<string, number>>((acc, f) => {
    acc[f.farmType] = (acc[f.farmType] || 0) + 1;
    return acc;
  }, {});
  const farmsByTypeData = Object.entries(farmsByType).map(([name, value]) => ({ name, value }));

  // search suggestions (top 6)
  const suggestions = useMemo(() => {
    if (!q) return [];
    const ql = q.toLowerCase();
    return farmers
      .filter((f) => f.name.toLowerCase().includes(ql) || f.farmName.toLowerCase().includes(ql))
      .slice(0, 6);
  }, [q, farmers]);

  // motion variants
  const containerVariant = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };
  const rowVariant = { hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } };

  return (
    <div className="min-h-screen  pb-20">

      {/* Sticky Glass Navbar */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={showNav ? { y: 0, opacity: 1 } : { y: -60, opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="top-4   translate-x-[160px] z-50 w-[95%] max-w-7xl rounded-2xl border border-white/30  bg-gray-600 backdrop-blur-md px-6 py-3 shadow-lg flex items-center gap-4 mt-[30px]"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full w-10 h-10 bg-green-500 grid place-items-center text-white font-bold shadow">
            NC
          </div>
          <div>
            <div className="text-sm text-white/90 font-semibold">agru netcore</div>
            <div className="text-xs text-white/70">Admin Dashboard</div>
          </div>
        </div>

        {/* Search with suggestions */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80">
            <Search size={16} />
          </span>
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search farmers, farm name, subcity or email..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-200"
          />
          <AnimatePresence>
            {suggestions.length > 0 && q.trim() && (
              <motion.ul
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute left-0 right-0 mt-2 bg-white/95 text-gray-800 rounded-lg shadow-lg divide-y"
                style={{ overflow: "hidden", zIndex: 60 }}
              >
                {suggestions.map((s) => (
                  <li
                    key={s.email + s.name}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setQ(s.name);
                      setPage(1);
                    }}
                  >
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.farmName}</div>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(processed)}
            title="Export CSV"
            className="px-3 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition"
          >
            <DownloadCloud size={16} />
          </button>
          <button
            onClick={onRefresh}
            title="Refresh"
            className={`px-3 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition ${refreshing ? "opacity-70" : ""}`}
          >
            <RefreshCw size={16} />
          </button>
          <div className="text-sm text-white/90 px-3">{user?.name}</div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-6 pt-22">
        {/* Page title */}
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-3xl md:text-4xl font-extrabold  mb-6"
        >
          Beeraleedka Dashboard
        </motion.h1>

        {/* Summary Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6"
          initial="hidden"
          animate="show"
          variants={containerVariant}
        >
          <motion.div className="bg-white/60 backdrop-blur-md rounded-xl p-5 shadow hover:shadow-lg transform transition" whileHover={{ scale: 1.03 }}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="text-green-600" size={28} />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalFarmers}</div>
                <div className="text-sm text-gray-600">Total Farmers</div>
              </div>
            </div>
          </motion.div>

          <motion.div className="bg-white/60 backdrop-blur-md rounded-xl p-5 shadow hover:shadow-lg transform transition" whileHover={{ scale: 1.03 }}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Home className="text-blue-600" size={28} />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalFarmSize.toFixed(2)} ha</div>
                <div className="text-sm text-gray-600">Total Farm Size</div>
              </div>
            </div>
          </motion.div>

          <motion.div className="bg-white/60 backdrop-blur-md rounded-xl p-5 shadow hover:shadow-lg transform transition" whileHover={{ scale: 1.03 }}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <BarChart2 className="text-yellow-600" size={28} />
              </div>
              <div>
                <div className="text-2xl font-bold">{Object.keys(farmsByType).length}</div>
                <div className="text-sm text-gray-600">Farm Types</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Charts */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6" initial="hidden" animate="show" variants={containerVariant}>
          <div className=" backdrop-blur-md p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4 ">Farms by Type</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={farmsByTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {farmsByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className=" backdrop-blur-md p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4  ">Farm Sizes Distribution</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={farmers.map((f) => ({ name: f.farmName, size: parseFloat(String(f.farmSize)) || 0 }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="size" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Controls (filters + sorts) */}
        <motion.section initial="hidden" animate="show" variants={containerVariant} className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-sm font-medium  mr-2">Filter:</div>
              {farmTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setActiveType(t);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-sm border transition ${activeType === t ? "bg-green-600 text-white border-green-600" : " "
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm t">Sort:</div>
              <button onClick={() => toggleSort("createdAt")} className={`px-3 py-1 rounded-md ${sortBy === "createdAt" ? "bg-green-600 text-white" : ""}`}>
                Newest {sortBy === "createdAt" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </button>
              <button onClick={() => toggleSort("name")} className={`px-3 py-1 rounded-md ${sortBy === "name" ? "bg-green-600 text-white" : ""}`}>
                Name {sortBy === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </button>
              <button onClick={() => toggleSort("farmSize")} className={`px-3 py-1 rounded-md ${sortBy === "farmSize" ? "bg-green-600 text-white" : ""}`}>
                Size {sortBy === "farmSize" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </button>
            </div>
          </div>
        </motion.section>

        {/* Table */}
        <motion.div className="overflow-x-auto  backdrop-blur-md border border-white/30 rounded-xl shadow" initial="hidden" animate="show" variants={containerVariant}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className=" ">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">Subcity</th>
                <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">Farm</th>
                <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium  uppercase tracking-wider">Size</th>
                <th className="px-4 py-3 text-right text-xs font-medium  uppercase tracking-wider">Registered</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="  divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-6 text-center">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="px-6 py-6 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-6 text-center text-gray-500">
                    No farmers found.
                  </td>
                </tr>
              ) : (
                paged.map((f, idx) => (
                  <motion.tr
                    key={f.id ?? `${f.email}-${idx}`}
                    initial="hidden"
                    animate="show"
                    variants={rowVariant}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    className="transform transition duration-150 hover:scale-[1.01]  "
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium ">{f.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm ">{f.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm ">{f.subcity}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm ">{f.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm ">{f.farmName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm ">{f.farmType}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right ">{f.farmSize}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right ">{f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => setSelectedFarmer(f)}
                        className="px-2 py-1 text-white bg-green-600 rounded hover:bg-green-700 transition"
                        title="View Details"
                      >
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Showing <span className="font-medium">{total === 0 ? 0 : (page - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium">{Math.min(page * pageSize, total)}</span> of <span className="font-medium">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">⏮</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">◀</button>
            <span className="px-2">Page {page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">▶</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">⏭</button>
          </div>
        </div>
      </main>

      {/* Farmer Details Modal */}
      <AnimatePresence>
        {selectedFarmer && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="bg-white rounded-2xl max-w-xl w-[92%] p-6 relative shadow-2xl"
              initial={{ y: 16, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, scale: 0.98, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelectedFarmer(null)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-800">
                <X size={18} />
              </button>
              <h3 className="text-2xl font-bold mb-3">{selectedFarmer.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                <div><strong>Email:</strong> {selectedFarmer.email}</div>
                <div><strong>Phone:</strong> {selectedFarmer.phone}</div>
                <div><strong>Subcity:</strong> {selectedFarmer.subcity}</div>
                <div><strong>Farm Name:</strong> {selectedFarmer.farmName}</div>
                <div><strong>Farm Type:</strong> {selectedFarmer.farmType}</div>
                <div><strong>Farm Size:</strong> {selectedFarmer.farmSize}</div>
                <div className="sm:col-span-2"><strong>Registered:</strong> {selectedFarmer.createdAt ? new Date(selectedFarmer.createdAt).toLocaleString() : "-"}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating action buttons (scroll top & refresh) */}
      <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-3">
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          title="Top"
          className="w-12 h-12 rounded-full  shadow grid place-items-center hover:scale-105 transition"
        >
          <ArrowUp size={18} />
        </button>

        <button
          onClick={onRefresh}
          title="Refresh"
          className={`w-12 h-12 rounded-full  shadow grid place-items-center hover:scale-105 transition ${refreshing ? "opacity-70" : ""}`}
        >
          <RefreshCw size={18} />
        </button>
      </div>
    </div>
  );
}
