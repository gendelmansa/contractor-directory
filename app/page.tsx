'use client';

import Head from 'next/head';
import Link from 'next/link';

export default function HomePage() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Head>
        <title>FieldSync — Contractor Team Management</title>
        <meta name="description" content="Manage your contractor team from one place. Subscribe as a business, invite your contractors and operators, and keep every job in sync." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GGV4C4BQZT" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function g(){dataLayer.push(arguments)}g('js',new Date());g('config','G-GGV4C4BQZT');` }} />
      </Head>

      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        {/* Navigation */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 3rem', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>⚡ FieldSync</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.9rem' }}>
            <button onClick={() => scrollToSection('how-it-works')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 0 }}>How it Works</button>
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Sign In</Link>
            <Link href="/signup" style={{ background: '#2563eb', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>Start Free Trial</Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding: '10rem 3rem 5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-block', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '100px', padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#93c5fd', marginBottom: '1.5rem' }}>
              Built for businesses with field teams
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-1px', maxWidth: '750px', margin: '0 auto 1.5rem' }}>
              Manage Your Team.<br />Track Every Job.
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.6)', maxWidth: '540px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
              Your business subscribes, sets up your team, and invites your contractors and operators. Everyone operates from one organized workspace — no more chasing updates across calls and texts.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" style={{ background: '#2563eb', color: '#fff', padding: '0.85rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem' }}>Start Free Trial</Link>
              <Link href="/login" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.85rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }}>Sign In</Link>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.75rem 3rem', display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Contractors Updated', icon: '⚡' },
            { label: 'Jobs Managed', icon: '📋' },
            { label: 'Real-Time Sync', icon: '🔄' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>
              <span>{stat.icon}</span>
              <span style={{ fontWeight: 600 }}>{stat.label}</span>
            </div>
          ))}
        </section>

        {/* How it Works */}
        <section id="how-it-works" style={{ padding: '6rem 3rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem' }}>How it works</h2>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginBottom: '3.5rem' }}>Three steps to get your whole team in sync.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {[
                { step: '01', title: 'Subscribe & set up your business', desc: 'Create your business account, set up your organization profile, and you\'re ready to go. No credit card required to start your free trial.' },
                { step: '02', title: 'Invite your team', desc: 'Add your contractors and operators to your workspace. Set roles — contractors in the field, operators managing the schedule.' },
                { step: '03', title: 'Assign jobs, track everything', desc: 'Create jobs, assign them to the right people, and watch progress update in real time from the field. No more scattered texts and missed calls.' },
              ].map(item => (
                <div key={item.step}>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#2563eb', marginBottom: '1rem', lineHeight: 1 }}>{item.step}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '6rem 3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Everything your team needs in one place</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Simple tools. No learning curve. Your whole team uses it on day one.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
            {[
              { icon: '📋', title: 'Job Management', desc: 'Create jobs with full details, assign to the right contractor, set priorities and schedules. Everything organized in one place.' },
              { icon: '📲', title: 'Real-Time Updates', desc: 'Contractors update progress from the field. Operators see every change as it happens — no end-of-day check-in calls needed.' },
              { icon: '👷', title: 'Invite & Manage Roles', desc: 'Invite contractors and operators to your business workspace. Set the right role for each person. Control who sees what.' },
              { icon: '✅', title: 'Verified Teams', desc: 'Every team member is verified. You know exactly who\'s on your roster and what they\'re qualified to do.' },
              { icon: '💬', title: 'Job Messaging', desc: 'Keep conversations attached to the job they belong to. Notes, updates, and questions — all in context.' },
              { icon: '📊', title: 'Full Visibility', desc: 'Operators see every job across the whole team. Contractors see their own assignments clearly. Everyone knows what\'s next.' },
            ].map(f => (
              <div key={f.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '5rem 3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Get your team in sync</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', fontSize: '1rem' }}>Start your free trial. Set up in minutes. No credit card required.</p>
          <Link href="/signup" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', padding: '0.9rem 2.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem' }}>Start Free Trial</Link>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontWeight: 700 }}>⚡ FieldSync</div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
            <a href="/login" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Sign In</a>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>© 2026 FieldSync. All rights reserved.</div>
        </footer>

      </div>
    </>
  );
}