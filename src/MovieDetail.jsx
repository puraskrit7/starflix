import { useParams, Link } from 'react-router-dom';

function MovieDetail({ films }) {
  const { id } = useParams();
  const film = films.find(f => f.episode_id === parseInt(id));

  if (!film) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div className="app-container">
      <Link to="/" className="close-btn" style={{ marginBottom: '2rem' }}>← Back</Link>
      <h1>{film.title}</h1>
      <p><strong>Episode:</strong> {film.episode_id}</p>
      <p style={{ marginBottom: '2rem' }}>{film.opening_crawl}</p>

      <h2>Characters</h2>
      <div className="card-grid">
        {film.characters.map((char, idx) => (
          <div className="card" key={idx}>
            <h4>{char.name}</h4>
            <p>{char.gender}</p>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: '2rem' }}>Planets</h2>
      <div className="card-grid">
        {film.planets.map((planet, idx) => (
          <div className="card" key={idx}>
            <h4>{planet.name}</h4>
            <p>Climate: {planet.climate}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieDetail;
