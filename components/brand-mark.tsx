export default function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="2" y="9" width="28" height="14" rx="7" fill="currentColor" />
      <circle cx="11" cy="16" r="3.4" fill="#fff" />
      <circle cx="21" cy="16" r="3.4" fill="#fff" />
    </svg>
  );
}
