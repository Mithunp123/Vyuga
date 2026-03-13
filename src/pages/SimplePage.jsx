import PageShell from './PageShell.jsx'

export default function SimplePage({ title, subtitle, bullets }) {
  return (
    <PageShell title={title} subtitle={subtitle}>
      <div className="prose prose-slate max-w-none">
        {bullets?.length ? (
          <ul>
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : (
          <p>Content coming soon.</p>
        )}
      </div>
    </PageShell>
  )
}

