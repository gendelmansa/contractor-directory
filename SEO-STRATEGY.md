# SEO Strategy for Contractor Directory

**Website:** contractor-directory-sand.vercel.app  
**Goal:** Grow site traffic to generate ad revenue  
**Tech Stack:** Next.js / Vercel

---

## 1. Executive Summary

This SEO strategy positions the contractor directory as the go-to resource for homeowners seeking reliable local service providers. By targeting high-intent local keywords, implementing technical SEO best practices, and building a content engine focused on practical homeowner guidance, we can capture organic traffic from users actively searching for plumbers, electricians, HVAC technicians, roofers, and other home services. Our competitive advantage lies in being a dedicated directory with clean UX and local focus—unlike broader platforms like Yelp or Angi that clutter results with ads. The strategy prioritizes quick wins and sustainable growth through local SEO dominance and contractor listing acquisition.

---

## 2. Target Keywords (Top 20)

### Primary Service Keywords
1. plumber near me
2. electrician near me
3. HVAC technician near me
4. roofer near me
5. HVAC repair near me
6. plumber in [city]
7. electrician in [city]
8. AC repair near me
9. water heater installation
10. emergency plumber

### Long-Tail / Informational
11. how to find a reliable contractor
12. signs you need a new roof
13. when to call an electrician
14. plumber vs plumbing contractor
15. average cost of [service] in [city]

### Brand/Category
16. best plumbers in [city]
17. top rated HVAC companies
18. local contractor directory
19. home service contractors near me
20. contractor reviews [city]

> **Note:** Replace `[city]` with target metro areas. Create landing pages for each city + service combination.

---

## 3. Technical SEO Checklist

### Site Speed
- [ ] Run Lighthouse audit, target 90+ score
- [ ] Implement next/image for all images
- [ ] Enable Vercel edge caching
- [ ] Minimize JavaScript bundle (analyze with `@next/bundle-analyzer`)
- [ ] Implement lazy loading for below-fold content

### Mobile-First
- [ ] Verify responsive design passes Mobile-Friendly Test
- [ ] Ensure tap targets are 48px+ minimum
- [ ] Test touch interactions on actual devices

### Structured Data (Schema.org)
- [ ] Implement LocalBusiness schema on contractor profile pages
- [ ] Implement Service schema on category pages
- [ ] Add FAQPage schema on blog posts
- [ ] Implement Review schema for contractor ratings
- [ ] Test with Google Rich Results Test

### Sitemaps & Robots
- [ ] Generate XML sitemap (use `next-sitemap` or custom)
- [ ] Submit sitemap to Google Search Console
- [ ] Optimize robots.txt - allow crawl, block admin/private paths
- [ ] Implement dynamic sitemap for contractor profiles

### Core Web Vitals
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

---

## 4. Content Plan (3-Month Calendar)

### Month 1: Foundation
| Week | Content Type | Topic | Target Keyword |
|------|--------------|-------|----------------|
| 1 | Service Category Page | Plumbing Services | plumber near me |
| 1 | Service Category Page | Electrical Services | electrician near me |
| 2 | Service Category Page | HVAC Services | HVAC technician near me |
| 2 | Service Category Page | Roofing Services | roofer near me |
| 3 | Blog Post | 5 Signs You Need a Plumber | when to call a plumber |
| 3 | Blog Post | Electrical Safety Tips for Homeowners | electrical safety |
| 4 | FAQ Page | Common Plumbing Questions | plumber FAQ |
| 4 | City Landing Page | [Target City] Contractors | contractors in [city] |

### Month 2: Expansion
| Week | Content Type | Topic | Target Keyword |
|------|--------------|-------|----------------|
| 1 | Blog Post | How to Choose a Reliable Contractor | find reliable contractor |
| 1 | City Landing Page | [Target City] Plumbers | plumber in [city] |
| 2 | Blog Post | AC Not Cooling? 7 Things to Check | AC repair near me |
| 2 | City Landing Page | [Target City] Electricians | electrician in [city] |
| 3 | Blog Post | Roof Replacement Cost Guide | cost of roof replacement |
| 3 | Service Category Page | Water Heater Services | water heater installation |
| 4 | Blog Post | Emergency Plumbing: What constitutes an emergency | emergency plumber |
| 4 | City Landing Page | [Target City] HVAC Companies | HVAC companies near me |

### Month 3: Authority
| Week | Content Type | Topic | Target Keyword |
|------|--------------|-------|----------------|
| 1 | Blog Post | DIY vs Professional: What you should not attempt | when to hire contractor |
| 1 | City Landing Page | [Target City] Roofers | roofer in [city] |
| 2 | Blog Post | Seasonal HVAC Maintenance Checklist | HVAC maintenance |
| 2 | Comparison Post | Angi vs Yelp vs Our Directory | contractor directory |
| 3 | Blog Post | Understanding Contractor Licenses & Insurance | licensed contractor |
| 3 | Resource Page | Contractor Hiring Guide | how to hire contractor |
| 4 | Blog Post | Energy-Efficient HVAC Options | HVAC upgrade benefits |
| 4 | City Landing Page | [Target City] Home Services | home services near me |

---

## 5. Local SEO Strategy

### Google Business Profile (GBP)
1. **Create GBP for the directory itself** - Claim "Contractor Directory [City]" business listing
2. **Encourage contractor GBP** - Include GBP verification guidance in contractor onboarding
3. **Categories** - Use primary categories: "Contractor", "Home Services", specific trade categories
4. **Service areas** - List all target cities/metros
5. **Posts** - Weekly updates with seasonal tips, promotions from listed contractors

### Local Citations
- [ ] Google Business Profile (directory + encourage contractors)
- [ ] Yelp (directory presence + encourage contractors)
- [ ] BBB (Better Business Bureau)
- [ ] Angi / HomeAdvisor (directory presence)
- [ ] YellowPages
- [ ] Local chamber of commerce directories
- [ ] Nextdoor Business

### NAP Consistency
- Ensure consistent Name, Address, Phone across all citations
- Use schema markup to reinforce NAP data
- Monitor with citation tracking tool (e.g., BrightLocal, Moz Local)

---

## 6. Quick Wins (Implement This Week)

1. **Optimize page titles and meta descriptions**
   - Each service page needs unique title: `[Service] in [City] | Find Trusted Contractors`
   - Meta descriptions with clear CTA: "Find licensed [service] professionals in [City]. Verified reviews, contact info, and free quotes."

2. **Add alt text to all images**
   - Use descriptive alt text: "Licensed plumber repairing water heater in kitchen"
   - Include target keywords naturally

3. **Create first city landing page**
   - Pick top target city
   - Create page combining all services for that city
   - Add contractor listings for that city

4. **Implement basic schema markup**
   - Add LocalBusiness schema to directory homepage
   - Add Service schema to category pages

5. **Fix crawl errors**
   - Run Google Search Console crawl report
   - Fix 404s, redirect chains, blocked resources

---

## 7. Metrics to Track

### Traffic Metrics
- **Organic sessions** (Google Analytics) - Target: 10% MoM growth initially
- **Pages per session** - Target: 2.5+
- **Average session duration** - Target: 2:00+

### Keyword Rankings
- **Position tracking** for top 20 keywords
- **Rank improvements** - Track weekly
- **Featured snippets** captured

### User Engagement
- **Bounce rate** - Target: < 60%
- **Click-through rate** (from SERP) - Target: 3%+
- **Contractor profile views**

### Growth Metrics
- **Indexed pages** - Grow from current to 100+ pages
- **Backlinks acquired** - Monthly count
- **Contractor listings claimed** - Growth over time

### Conversion (for ad revenue context)
- **Pageviews** - Overall volume
- **Ad impression volume**
- **RPM (Revenue per 1,000 impressions)**

---

## Implementation Priority

| Phase | Timeline | Focus |
|-------|----------|-------|
| Phase 1 | Week 1-2 | Quick wins + technical audit |
| Phase 2 | Week 3-4 | Schema markup + city pages |
| Phase 3 | Month 2 | Content + link building |
| Phase 4 | Month 3 | Contractor acquisition + citations |

---

*Last Updated: March 2026*
