"use client";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import { useState } from "react";

interface APIResponse {
  message: "Me handler ran";
  userId: string;
  orgId: string;
  orgSlug: string;
  orgRole: string;
}

export function HitMe() {
  const [data, setData] = useState<APIResponse | null>(null);
  const { getToken } = useAuth();
  async function handleHitMe() {
    const token = await getToken();
    const response = await fetch("http://localhost:8000/api/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data: APIResponse = await response.json();

    if (data) {
      setData(data);
      return;
    }
  }
  return (
    <div>
      <Button onClick={handleHitMe}>Hit Me</Button>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  );
}
