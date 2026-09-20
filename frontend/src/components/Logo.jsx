export default function Logo({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="36" height="24" rx="8" fill="#0d9488" />
      <polygon points="10,28 10,36 18,28" fill="#0d9488" />
      <rect x="10" y="12" width="3.2" height="8" rx="1.6" fill="#ffffff" />
      <rect x="16.4" y="8" width="3.2" height="16" rx="1.6" fill="#ffffff" />
      <rect x="22.8" y="11" width="3.2" height="10" rx="1.6" fill="#ffffff" />
      <rect x="29.2" y="13.5" width="3.2" height="5" rx="1.6" fill="#ffffff" />
    </svg>
  );
}
