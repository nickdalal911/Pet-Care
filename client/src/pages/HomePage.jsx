import { Link } from "react-router-dom";
import SectionCard from "../components/SectionCard";

const stats = [
  { label: "Happy pets cared for", value: "12k+" },
  { label: "Verified providers", value: "1.4k" },
  { label: "Same-day bookings", value: "87%" },
];

const featureCards = [
  {
    icon: "🐾",
    title: "Story-rich posts",
    description:
      "Share milestones with galleries, comments, and reactions that keep tails wagging.",
    link: { to: "/posts", label: "Open the feed" },
  },
  {
    icon: "🛍️",
    title: "Marketplace ready",
    description:
      "Showcase adoptable friends and curated products with photo-first listings.",
    link: { to: "/listings", label: "Browse listings" },
  },
  {
    icon: "🏥",
    title: "Trusted services",
    description:
      "List groomers, walkers, and vets with clear details so families know who to call.",
    link: { to: "/services", label: "View directory" },
  },
  {
    icon: "🤝",
    title: "Collaborative profiles",
    description:
      "Let caretakers highlight bios, specialties, and availability in one friendly space.",
    link: { to: "/users", label: "Meet the team" },
  },
];

const faqs = [
  {
    question: "Can I invite multiple caretakers?",
    answer:
      "Absolutely. Add as many providers and community members as you need – each gets secure logins and role-based tools.",
  },
  {
    question: "Do you support booking or payments?",
    answer:
      "While PetCare focuses on organizing profiles and services, providers can add booking links, prices, and contact details to every listing.",
  },
  {
    question: "How secure is my pet community?",
    answer:
      "All sensitive information stays behind authenticated dashboards with granular permissions for posts, marketplace items, and services.",
  },
];

const HomePage = () => {
  return (
    <section className="page landing-page">
      <div className="landing-hero">
        <div className="landing-hero__content">
          <span className="landing-hero__tag">
            Built for pet-first communities
          </span>
          <h2>
            Design a playful hub where every whisker and wag feels at home.
          </h2>
          <p>
            PetCare keeps your community organized with gorgeous posts, trusted
            provider directories, and merch-ready marketplaces – all tailored to
            the rhythm of pet families.
          </p>
          <div className="landing-hero__actions">
            <Link className="button" to="/signup">
              Start free today
            </Link>
            <Link className="button ghost" to="/posts">
              Explore the feed
            </Link>
          </div>
          <div className="landing-hero__stats">
            {stats.map((item) => (
              <div key={item.label} className="stat-card">
                <div className="stat-card__value">{item.value}</div>
                <div className="stat-card__label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="landing-hero__media" aria-hidden="true">
          <div className="landing-hero__bubble">
            <div className="landing-hero__illustration">🐶</div>
            <div className="landing-hero__sparkle landing-hero__sparkle--one">
              ✨
            </div>
            <div className="landing-hero__sparkle landing-hero__sparkle--two">
              🦴
            </div>
          </div>
        </div>
      </div>

      <SectionCard
        title="Everything their tails need"
        description="Delight caretakers and pet parents with a toolkit that feels as friendly as their furry companions."
      >
        <div className="landing-feature-grid">
          {featureCards.map((feature) => (
            <article key={feature.title} className="landing-feature-card">
              <span className="landing-feature-card__icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link className="button secondary" to={feature.link.to}>
                {feature.link.label}
              </Link>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Pet parents love the calm"
        description="From daily updates to emergency contacts, PetCare keeps every detail tidy and stress-free."
      >
        <div className="landing-highlights">
          <div className="landing-highlight">
            <h4>“Every pup parent stays updated.”</h4>
            <p>
              “Photo updates, care notes, and quick reactions give our clients
              total peace of mind. Our team collaborates in one shared home.”
            </p>
            <span className="landing-highlight__meta">
              Bailey & Co. Dog Walkers
            </span>
          </div>
          <div className="landing-highlight">
            <h4>“We onboard providers in minutes.”</h4>
            <p>
              “Role permissions let sitters share their services instantly,
              while our marketplace keeps essentials stocked for every season.”
            </p>
            <span className="landing-highlight__meta">Sunshine Sanctuary</span>
          </div>
        </div>
      </SectionCard>

      <div className="landing-cta">
        <div className="landing-cta__content">
          <h3>Launch your pet haven in under 10 minutes.</h3>
          <p>
            Spin up posts, onboard providers, and share resources before the
            next walk. Your community dashboard is just a paw-tap away.
          </p>
        </div>
        <div className="landing-cta__actions">
          <Link className="button" to="/signup">
            Create your space
          </Link>
          <Link className="button secondary" to="/login">
            Log back in
          </Link>
        </div>
      </div>

      <SectionCard
        title="Frequently asked questions"
        description="Answers for busy caretakers and curious pet parents."
      >
        <dl className="faq-list">
          {faqs.map((faq) => (
            <div key={faq.question} className="faq-item">
              <dt>{faq.question}</dt>
              <dd>{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>

      <footer className="landing-footer">
        <div>
          <strong>PetCare Platform</strong>
          <p>
            Crafted with love to keep every snout, purr, and chirp connected.
          </p>
        </div>
        <nav className="landing-footer__nav">
          <Link to="/posts">Posts</Link>
          <Link to="/services">Services</Link>
          <Link to="/listings">Marketplace</Link>
          <Link to="/products">Products</Link>
        </nav>
      </footer>
    </section>
  );
};

export default HomePage;
