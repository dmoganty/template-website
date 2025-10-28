import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Read the request body as text and parse JSON manually for reliability
    const body = await req.text();
    let prompt: string | undefined;
    // Use dynamic CORS origin
    const origin = req.headers.get("origin") || "";
    const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
    const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    try {
      const parsed = JSON.parse(body);
      prompt = parsed.prompt;
    } catch {
      const res = NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
      res.headers.set("Access-Control-Allow-Origin", allowOrigin);
      return res;
    }
    if (!prompt || typeof prompt !== "string") {
      const res = NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
      res.headers.set("Access-Control-Allow-Origin", allowOrigin);
      return res;
    }

    // If Claude accepts prompt via stdin:
    const child = spawn("claude", [], { detached: true, stdio: ["pipe", "ignore", "ignore"] });
    child.stdin.write(prompt + "\n");
    child.stdin.end();
    child.unref();

    // Optionally, also write to a file for verification
    const fileChild = spawn("powershell.exe", [
      "-Command",
      `echo ${JSON.stringify(prompt)} | Out-File -FilePath claud_prompt.txt -Encoding utf8`
    ]);

    // Await the file write process and respond accordingly
    const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
      fileChild.on("close", (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: `File process exited with code ${code}` });
        }
      });
      fileChild.on("error", (err) => {
        console.error("File write error:", err);
        resolve({ success: false, error: "File write error" });
      });
    });

    if (result.success) {
      const response = NextResponse.json({ success: true });
      response.headers.set("Access-Control-Allow-Origin", allowOrigin);
      return response;
    } else {
      const res = NextResponse.json({ error: result.error }, { status: 500 });
      res.headers.set("Access-Control-Allow-Origin", allowOrigin);
      return res;
    }
  } catch (error) {
    const origin = req.headers.get("origin") || "";
    const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
    const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    const res = NextResponse.json({ error: (error as Error).message }, { status: 500 });
    res.headers.set("Access-Control-Allow-Origin", allowOrigin);
    return res;
  }
}
