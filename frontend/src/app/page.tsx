"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AgricultureLoading from "../components/AgricultureLoading"; // Adjust path if needed

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check or loading delay
    const timer = setTimeout(() => {
      setLoading(false);
      router.push("/auth/signin"); // Redirect after loading
    }, 3000); // 3 seconds loading time

    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return <AgricultureLoading />;
  }

  return (
    <main className="flex items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Welcome to the homepage!</h1>
    </main>
  );
}
