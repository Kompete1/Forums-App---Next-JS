import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources | SA Racing Forum",
  description: "Official links, calendars, karting starter guidance, and practical checklists for South African racers.",
  openGraph: {
    title: "Resources | SA Racing Forum",
    description: "Official links, calendars, karting starter guidance, and practical checklists for South African racers.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Resources | SA Racing Forum",
    description: "Official links, calendars, karting starter guidance, and practical checklists for South African racers.",
  },
};

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="focus-link">
      {label}
    </a>
  );
}

export default function ResourcesPage() {
  return (
    <main className="page-wrap stack">
      <section className="stack-tight">
        <p className="kicker">Racer Hub</p>
        <h1>Resources</h1>
        <p className="meta">
          A practical, low-maintenance library of official channels, calendars, karting entry points, and checklists for South African racers.
        </p>
      </section>

      <section className="card stack">
        <h2>Official notices &amp; schedules</h2>
        <p className="meta">Use official channels for notices, bulletins, and schedule updates rather than relying on reposts.</p>
        <ul className="stack-tight">
          <li>
            <ExternalLink
              href="https://www.motorsport.co.za/motorsport-south-africa-modernises-communication-with-official-sportity-partnership-for-2026-season/"
              label="MSA + Sportity official communication announcement"
            />
          </li>
          <li>
            <ExternalLink href="https://sportity.com/app" label="Sportity app (official landing)" />
          </li>
          <li>
            <ExternalLink href="https://apps.apple.com/us/app/sportity/id1344934434" label="Sportity on the Apple App Store" />
          </li>
          <li>
            <ExternalLink
              href="https://play.google.com/store/apps/details?id=com.sportity.app"
              label="Sportity on Google Play"
            />
          </li>
          <li>
            <ExternalLink href="https://www.motorsport.co.za/events-calendar-download/" label="MSA calendar downloads" />
          </li>
        </ul>
      </section>

      <section className="card stack">
        <h2>Calendars</h2>
        <p className="meta">Check official series pages directly for current dates and bulletin updates.</p>
        <ul className="stack-tight">
          <li>
            <ExternalLink href="https://www.motorsport.co.za/events-calendar-download/" label="MSA events calendar downloads" />
          </li>
          <li>
            <ExternalLink href="https://satc.co.za/calendar/" label="SA Touring Cars (SATC) calendar" />
          </li>
          <li>
            <ExternalLink href="https://www.saeseries.com/" label="South African Endurance Series" />
          </li>
          <li>
            <ExternalLink href="https://kart.co.za/" label="Karting South Africa events and updates" />
          </li>
        </ul>
      </section>

      <section className="card stack">
        <h2>Karting essentials</h2>
        <p className="meta">Start with federation guidance, then connect with clubs and class information through Karting SA.</p>
        <ul className="stack-tight">
          <li>
            <ExternalLink href="https://www.motorsport.co.za/getting-started-in-kart-racing/" label="MSA: Getting started in kart racing" />
          </li>
          <li>
            <ExternalLink href="https://kart.co.za/" label="Karting South Africa home" />
          </li>
          <li>
            <ExternalLink href="https://kart.co.za/contact-us/" label="Karting South Africa contact details" />
          </li>
        </ul>
        <div>
          <p className="meta">Club entry points to check first:</p>
          <ul>
            <li>Rand Kart Club</li>
            <li>KZN Kart Club</li>
            <li>WPMC Karting</li>
          </ul>
        </div>
      </section>

      <section className="card stack">
        <h2>Track guides</h2>
        <p className="meta">Use official track/operator websites for event-day logistics, regulations, and contact details.</p>
        <ul className="stack-tight">
          <li>
            <ExternalLink href="https://www.kyalamigrandprixcircuit.com/" label="Kyalami Grand Prix Circuit" />
          </li>
          <li>
            <ExternalLink href="https://www.zwartkops.co.za/" label="Zwartkops Raceway" />
          </li>
          <li>
            <ExternalLink href="https://wpmc.co.za/" label="Killarney International Raceway (WPMC)" />
          </li>
          <li>
            <ExternalLink href="https://amsc.co.za/about-us/" label="Aldo Scribante (Algoa Motorsport Club)" />
          </li>
        </ul>
      </section>

      <section className="card stack">
        <h2>Templates</h2>
        <p className="meta">Copy these checklists into your own notes and adapt per event regulations.</p>
        <div className="stack">
          <article>
            <h3>Pre-event admin checklist</h3>
            <ul>
              <li>Confirm licence validity and medical declarations (if required).</li>
              <li>Verify event entry confirmation and payment status.</li>
              <li>Save event supplementary regulations and final instructions.</li>
              <li>Join official notice channels (Sportity/event messaging) before travel.</li>
            </ul>
          </article>
          <article>
            <h3>Race weekend packing checklist</h3>
            <ul>
              <li>Helmet, suit, gloves, boots, and mandatory safety gear.</li>
              <li>Timing transponder, charger, and spares kit.</li>
              <li>Fuel/tools/consumables for sessions and contingencies.</li>
              <li>Printed and offline copies of key documents/contacts.</li>
            </ul>
          </article>
          <article>
            <h3>Scrutineering/document checklist</h3>
            <ul>
              <li>Competition licence and ID available at check-in.</li>
              <li>Vehicle class compliance items pre-checked.</li>
              <li>Safety items date-valid and fitted correctly.</li>
              <li>Transponder number and entry details match event records.</li>
            </ul>
          </article>
          <article>
            <h3>Post-event wrap-up checklist</h3>
            <ul>
              <li>Capture steward decisions, penalties, and follow-up actions.</li>
              <li>Log setup notes and tyre/fuel outcomes for next round.</li>
              <li>Review official final results from organizer channels.</li>
              <li>Schedule maintenance tasks before the next event.</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
