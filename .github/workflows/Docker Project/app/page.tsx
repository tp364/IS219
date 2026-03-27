import { runQuery } from "@/lib/db";

type MessageRow = {
  id: number;
  message: string;
};

export const dynamic = "force-dynamic";

async function getDatabaseState() {
  try {
    const { rows } = await runQuery<MessageRow>(
      "SELECT id, message FROM messages ORDER BY id ASC LIMIT 5"
    );

    return {
      connected: true,
      messages: rows,
      error: null as string | null
    };
  } catch (error) {
    return {
      connected: false,
      messages: [] as MessageRow[],
      error: error instanceof Error ? error.message : "Unknown database error"
    };
  }
}

export default async function Home() {
  const db = await getDatabaseState();

  return (
    <main className="page-shell">
      <section className="panel">
        <div className="hero">
          <div>
            <p className="eyebrow">Dockerized starter</p>
            <h1>Next.js and PostgreSQL, running together.</h1>
          </div>
          <p>
            This app is configured to run as a multi-container stack with{" "}
            <span className="code">docker compose up --build</span>. The Next.js
            server talks to PostgreSQL through the shared Compose network using{" "}
            <span className="code">DATABASE_URL</span>.
          </p>
        </div>

        <div className="grid">
          <article className="card">
            <h2>Database status</h2>
            <div className={`status ${db.connected ? "ok" : "error"}`}>
              <span className="status-dot" />
              {db.connected ? "Connected to PostgreSQL" : "Database unavailable"}
            </div>
            {db.connected ? (
              <ol className="message-list">
                {db.messages.map((row) => (
                  <li key={row.id}>{row.message}</li>
                ))}
              </ol>
            ) : (
              <p>{db.error}</p>
            )}
          </article>

          <article className="card">
            <h2>Included pieces</h2>
            <p>App Router Next.js app with TypeScript, Docker multi-stage build, and a seeded PostgreSQL service.</p>
          </article>

          <article className="card">
            <h2>Useful endpoints</h2>
            <p>
              The homepage checks the database on render, and{" "}
              <span className="code">/api/health</span> returns JSON status for
              both the app and PostgreSQL.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

