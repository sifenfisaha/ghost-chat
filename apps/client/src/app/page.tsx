const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type HelloResponse = {
  message: string;
};

type HealthResponse = {
  service: string;
  status: string;
  timestamp: string;
};

async function getServerData() {
  const [helloResponse, healthResponse] = await Promise.all([
    fetch(`${apiBaseUrl}/api/hello`, { cache: "no-store" }),
    fetch(`${apiBaseUrl}/api/health`, { cache: "no-store" })
  ]);

  if (!helloResponse.ok || !healthResponse.ok) {
    throw new Error("Could not fetch data from the API server.");
  }

  const hello = (await helloResponse.json()) as HelloResponse;
  const health = (await healthResponse.json()) as HealthResponse;

  return { hello, health };
}

export default async function Home() {
  let message = "API is not reachable.";
  let status = "unknown";
  let service = "-";
  let timestamp = "-";

  try {
    const { hello, health } = await getServerData();
    message = hello.message;
    status = health.status;
    service = health.service;
    timestamp = new Date(health.timestamp).toLocaleString();
  } catch (error) {
    console.error("Failed to fetch API data", error);
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-16">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="w-fit rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          Next.js Client
        </p>
        <h1 className="text-3xl font-bold text-zinc-900">Server Response</h1>
        <p className="text-lg text-zinc-700">{message}</p>
        <div className="grid gap-2 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700">
          <p>
            <span className="font-semibold">Status:</span> {status}
          </p>
          <p>
            <span className="font-semibold">Service:</span> {service}
          </p>
          <p>
            <span className="font-semibold">Timestamp:</span> {timestamp}
          </p>
          <p>
            <span className="font-semibold">API URL:</span>{" "}
            <code>{apiBaseUrl}</code>
          </p>
        </div>
      </section>
    </main>
  );
}
