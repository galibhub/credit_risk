import { ArrowUpRight } from "lucide-react";
import Logo from "../common/Logo";

const footerColumns = [
  {
    heading: "PLATFORM",
    links: [
      { label: "Credit Assessment", href: "/register" },
      { label: "Assessment History", href: "/login" },
      { label: "Model Insights", href: "/login" },
    ],
  },
  {
    heading: "ACCOUNT",
    links: [
      { label: "Login", href: "/login" },
      { label: "Create Account", href: "/register" },
    ],
  },
  {
    heading: "PROJECT",
    links: [
      { label: "How it Works", href: "/#how-it-works" },
      { label: "Features", href: "/#features" },
      { label: "Insights", href: "/#insights" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Logo />
            <p>
              Explainable machine learning for transparent
              credit risk assessment.
            </p>
            <span className="footer-trust">
              Explainability at every step
            </span>
          </div>

          {footerColumns.map((column) => (
            <div className="footer-column" key={column.heading}>
              <h3>{column.heading}</h3>

              {column.links.map((link) => (
                <a href={link.href} key={link.label}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} CredLens
          </span>

          <span>Explainable Credit Risk Assessment</span>

          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            Back to top <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}