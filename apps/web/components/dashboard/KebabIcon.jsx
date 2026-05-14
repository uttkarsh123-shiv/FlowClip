export default function KebabIcon({onClick}) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{
      cursor:"pointer"
    }}
    onClick={onClick}>
      <circle cx="12" cy="6" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="18" r="2" />
    </svg>
  );
}
