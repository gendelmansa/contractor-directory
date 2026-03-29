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
        <title>FieldSync — Contractor & Team Management</title>
        <meta name="description" content="Connect your contractor team with their employers. Manage jobs, track progress, and keep everyone in sync — from the field to the office." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GGV4C4BQZT" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function g(){dataLayer.push(arguments)}g('js',new Date());g('config','G-GGV4C4BQZT');` }} />
      </Head>

      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        {/* Navigation */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 3rem', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>
            ⚡ FieldSync
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.9rem' }}>
            <button onClick={() => scrollToSection('features')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 0 }}>How it Works</button>
            <Link href="/contractors" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Contractors</Link>
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Sign In</Link>
            <Link href="/signup" style={{ background: '#2563eb', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Get Started</Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding: '10rem 3rem 5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-block', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '100px', padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#93c5fd', marginBottom: '1.5rem' }}>
              Built for contractor teams & their employers
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-1px', maxWidth: '700px', margin: '0 auto 1.5rem' }}>
              Your Team.<br />Your Jobs.<br />In Sync.
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.6)', maxWidth: '540px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
              FieldSync connects your contractor team with their employers. Manage assignments, track progress, and keep everyone aligned — from the first job to the last.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup?role=operator" style={{ background: '#2563eb', color: '#fff', padding: '0.85rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', transition: 'background 0.2s' }}>For Operators</Link>
              <Link href="/signup?role=contractor" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.85rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', transition: 'all 0.2s' }}>For Contractors</Link>
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
              <span style={{ fontSize: '1.1rem' }}>{stat.icon}</span>
              <span style={{ fontWeight: 600 }}>{stat.label}</span>
            </div>
          ))}
        </section>

        {/* Features */}
        <section id="features" style={{ padding: '6rem 3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Built for how your team actually works</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Simple tools that keep contractors and their employers on the same page.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
            {[
              {
                icon: '👷',
                title: 'Assign & Track Jobs',
                desc: 'Create jobs, assign them to your contractors, and track every update from start to finish. No more scattered texts or missed calls.'
              },
              {
                icon: '📲',
                title: 'Real-Time Contractor Updates',
                desc: 'Contractors update job progress from the field. Operators see changes instantly — no waiting for end-of-day check-ins.'
              },
              {
                icon: '🔗',
                title: 'Operator & Contractor in One Place',
                desc: 'Both sides connect in the same platform. Assign work, receive updates, and manage your entire operation without switching tools.'
              },
              {
                icon: '✅',
                title: 'Verified, Trusted Network',
                desc: 'Every contractor is verified. Employers can trust their team and contractors can trust their assignments are legitimate.'
              },
              {
                icon: '💬',
                title: 'Messaging & Notes',
                desc: 'Keep job-specific conversations and notes attached to each assignment. Context stays where it belongs — on the job.'
              },
              {
                icon: '📊',
                title: 'Progress Visibility',
                desc: 'Operators see the full picture across all jobs. Contractors see exactly what they need to do next, updated in real time.'
              },
            ].map(feature => (
              <div key={feature.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{feature.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section style={{ padding: '5rem 3rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '3.5rem' }}>How it works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
              {[
                { step: '01', title: 'Create your organization', desc: 'Operators sign up and set up their company profile. Contractors join using an invite link.' },
                { step: '02', title: 'Add your contractors', desc: 'Invite your contractor team. Each contractor gets access to their own assignments and updates.' },
                { step: '03', title: 'Assign jobs', desc: 'Create jobs and assign them to the right contractors. Set priorities, schedules, and details upfront.' },
                { step: '04', title: 'Contractors update in real time', desc: 'From the field, contractors mark jobs started, in progress, or complete. Operators see it all instantly.' },
              ].map(item => (
                <div key={item.step}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#2563eb', marginBottom: '0.75rem', lineHeight: 1 }}>{item.step}</div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section style={{ padding: '5rem 3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to run your team better?</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', fontSize: '1rem' }}>Join businesses and contractors already connected on FieldSync.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup?role=operator" style={{ background: '#2563eb', color: '#fff', padding: '0.85rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>Start as Operator</Link>
            <Link href="/signup?role=contractor" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.85rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>Join as Contractor</Link>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700 }}>⚡ FieldSync</div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
            <a href="/about" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>About</a>
            <a href="/login" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Sign In</a>
            <a href="/contractors" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Contractors</a>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>© 2026 FieldSync. All rights reserved.</div>
        </footer>

      </div>
    </>
  );
}// deployed: 20260329212923
