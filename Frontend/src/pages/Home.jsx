import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CloudCog,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { useSelector } from 'react-redux';

const COIN_LOTTIE = 'https://lottie.host/a625fbf2-dbe7-4a4b-8be0-f5fdea04ec76/Uz7QxR8ni6.lottie';

const metrics = [
  { label: 'Potential monthly savings', value: '$235' },
  { label: 'Resources scanned', value: '142' },
  { label: 'Cloud access model', value: 'Read-only' },
];

const features = [
  {
    icon: BrainCircuit,
    title: 'Cost intelligence',
    desc: 'Prioritize EC2, RDS, and S3 savings with a clear impact score instead of noisy billing exports.',
    gradient: 'linear-gradient(137deg, #1e293b 0%, #334155 45%, #475569 100%)',
    delay: 0.1,
  },
  {
    icon: ShieldCheck,
    title: 'Secure by design',
    desc: 'Keep analysis read-only while still giving engineering teams enough context to act quickly.',
    gradient: 'linear-gradient(137deg, #0f172a 0%, #1e293b 45%, #334155 100%)',
    delay: 0.2,
  },
  {
    icon: CloudCog,
    title: 'Workflow ready',
    desc: 'Convert findings into recommendations that finance, DevOps, and leadership can understand.',
    gradient: 'linear-gradient(137deg, #1e1b4b 0%, #312e81 45%, #3730a3 100%)',
    delay: 0.3,
  },
];



const FeatureCard = ({ title, desc, icon: Icon, gradient, delay }) => (
  <motion.article
    className="premium-glow-card"
    style={{ '--card-gradient': gradient }}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: 'easeOut', delay }}
    viewport={{ once: true }}
  >
    <div className="glow-card-backdrop" />
    <div className="glow-card-shell">
      <div className="glow-card-inner">
        <div className="glow-card-header">
          <div className="glow-card-icon">
            <Icon size={42} strokeWidth={2.5} />
          </div>
          <h3>{title}</h3>
        </div>
        <p>{desc}</p>
      </div>
    </div>
  </motion.article>
);

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="home-page">
      <section className="hero-section premium-hero">
        <div className="hero-aurora" aria-hidden="true" />
        <div className="coin-lottie-backdrop" aria-hidden="true">
          <DotLottieReact src={COIN_LOTTIE} loop autoplay />
        </div>

        <motion.div
          className="hero-content premium-copy"
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        >
          <div className="eyebrow">
            <Sparkles size={16} />
            <span>AWS cost command center</span>
          </div>

          <h1>
            Cloud spend control
            <span className="text-gradient"> built for serious teams.</span>
          </h1>

          <p className="hero-copy">
            SpendWise turns AWS usage into crisp savings decisions with a
            premium dashboard experience for engineering and finance.
          </p>

          <div className="hero-actions">
            <Link to={user ? "/dashboard" : "/signup"} className="btn-primary">
              Start Optimizing <ArrowRight size={20} />
            </Link>
            <Link to="/blog" className="btn-secondary">
              View Playbooks
            </Link>
          </div>

          <div className="metric-strip premium-metrics">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </motion.div>


      </section>

      <section className="features-section premium-section">
        <div className="section-heading">
          <div className="eyebrow compact">
            <BarChart3 size={16} />
            <span>Executive clarity</span>
          </div>
          <h2>Everything feels fast, focused, and worth paying for.</h2>
          <p>
            A darker interface, richer movement, and cleaner cost signals make
            SpendWise feel like a premium control room, not another billing table.
          </p>
        </div>

        <div className="feature-grid premium-feature-grid">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              {...feature}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
