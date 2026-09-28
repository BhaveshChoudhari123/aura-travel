export default function SuggestionCard({ place, onPlan }) {
  return (
    <div className="sugg-card">
      <span className="cat cat-Culture">{place.category}</span>
      <h4>{place.title}</h4>
      <p>{place.description}</p>
      <small style={{ color: "var(--text-3)" }}>{place.location}</small>
    </div>
  );
}
