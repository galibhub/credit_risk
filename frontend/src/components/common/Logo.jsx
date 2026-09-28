import { Link } from "react-router-dom";

export default function Logo({ light = false }) {
  return (
    <Link
      to="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="CredLens Home"
    >
      <span className="brand-mark">
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path
            d="M24 3 43 10v12c0 12-7.5 19.3-19 23C12.5 41.3 5 34 5 22V10L24 3Z"
            fill="#2864D7"
          />
          <path
            d="M24 3 43 10v12c0 12-7.5 19.3-19 23V3Z"
            fill="#18BF8B"
          />
          <path
            d="m15 24 6 6 13-14"
            stroke="white"
            strokeWidth="4.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span className="brand-copy">
        <strong className="brand-name">
          Cred<span>Lens</span>
        </strong>
        <small>CREDIT RISK INTELLIGENCE</small>
      </span>
    </Link>
  );
}