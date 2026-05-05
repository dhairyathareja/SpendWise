import Spline from '@splinetool/react-spline';

const FOOTER_SCENE = 'https://prod.spline.design/UJsPxGbXCqhUuUfz/scene.splinecode';

const Footer = () => (
  <footer className="site-footer" aria-label="Animated footer">
    <div className="footer-inner">
      <div className="footer-spline-stage">
        <Spline scene={FOOTER_SCENE} />
      </div>
    </div>
  </footer>
);

export default Footer;
