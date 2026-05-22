export default function DashboardSettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-5">
        <h1 className="text-2xl font-bold tracking-tight">Workspace Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage output preferences and connected tools.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Generation Limits</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Usage tracking is not connected yet.
          </p>
        </article>

        <article className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Output Preferences</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Preference controls are not connected yet.
          </p>
        </article>
      </section>
    </div>
  )
}
