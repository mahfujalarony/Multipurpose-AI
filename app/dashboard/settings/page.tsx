export default function DashboardSettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-5">
        <h1 className="text-2xl font-bold tracking-tight">Workspace Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage plan limits, output preferences, and connected tools.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Generation Limits</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Email drafts: 128 / 300</li>
            <li>SEO content: 42 / 150</li>
            <li>Image generations: 19 / 100</li>
          </ul>
        </article>

        <article className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Output Preferences</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Default language: English</li>
            <li>Tone: Professional</li>
            <li>Brand voice: Enabled</li>
          </ul>
        </article>
      </section>
    </div>
  )
}
