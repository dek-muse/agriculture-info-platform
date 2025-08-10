"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AgricultureLoading from "../components/AgricultureLoading";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user token exists in localStorage
    const token = localStorage.getItem("authToken");

    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/auth/signin");
    }

    // End loading state after redirect decision
    setLoading(false);
  }, [router]);

  if (loading) {
    return <AgricultureLoading />;
  }

  return null; // Nothing to show, we redirect
}
