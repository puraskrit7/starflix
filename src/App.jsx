import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [films, setFilms] = useState([]);
  const [characterCache, setCharacterCache] = useState({});
  const [planetCache, setPlanetCache] = useState({});
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [crawlFilm, setCrawlFilm] = useState(null);

  useEffect(() => {
    axios.get("https://swapi.py4e.com/api/films/").then(async (res) => {
      const sortedFilms = res.data.results.sort(
        (a, b) => a.episode_id - b.episode_id
      );

      const filmsWithDetails = await Promise.all(
        sortedFilms.map(async (film) => {
          const characterDetails = await Promise.all(
            film.characters.slice(0, 5).map(async (url) => {
              if (characterCache[url]) return characterCache[url];
              const res = await axios.get(url);
              characterCache[url] = res.data;
              return res.data;
            })
          );

          const planetDetails = await Promise.all(
            film.planets.slice(0, 5).map(async (url) => {
              if (planetCache[url]) return planetCache[url];
              const res = await axios.get(url);
              planetCache[url] = res.data;
              return res.data;
            })
          );

          return {
            ...film,
            characters: characterDetails,
            planets: planetDetails,
          };
        })
      );

      setFilms(filmsWithDetails);
      setCharacterCache({ ...characterCache });
      setPlanetCache({ ...planetCache });
    });
  }, []);

  const lowerSearch = searchTerm.toLowerCase();

  const filteredFilms = films.filter((film) =>
    film.title.toLowerCase().includes(lowerSearch)
  );

  const filteredCharacters = Array.from(
    new Map(
      films
        .flatMap((f) => f.characters)
        .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((c) => [c.name, c])
    ).values()
  );

  const filteredPlanets = Array.from(
    new Map(
      films
        .flatMap((f) => f.planets)
        .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((p) => [p.name, p])
    ).values()
  );

  const isSearching = searchTerm.trim().length > 0;

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="logo">STAR-flix 🎥</h1>
        <input
          type="text"
          placeholder="Search..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </header>

      {isSearching ? (
        <div>
          <h2>Search Results</h2>

          {filteredFilms.length > 0 && (
            <>
              <h3>Movies</h3>
              <div className="card-grid">
                {filteredFilms.map((film, idx) => (
                  <div className="card" key={idx}>
                    <h4>{film.title}</h4>
                    <p>Episode {film.episode_id}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {filteredCharacters.length > 0 && (
            <>
              <h3>Characters</h3>
              <div className="card-grid">
                {filteredCharacters.map((char, idx) => (
                  <div
                    className="card"
                    key={idx}
                    onClick={() => {
                      setSelected(char);
                      setSelectedType("character");
                    }}
                  >
                    <h4>{char.name}</h4>
                    <p>{char.gender}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {filteredPlanets.length > 0 && (
            <>
              <h3>Planets</h3>
              <div className="card-grid">
                {filteredPlanets.map((planet, idx) => (
                  <div
                    className="card"
                    key={idx}
                    onClick={() => {
                      setSelected(planet);
                      setSelectedType("planet");
                    }}
                  >
                    <h4>{planet.name}</h4>
                    <p>Climate: {planet.climate}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        films.map((film, index) => (
          <div key={index} style={{ marginBottom: "4rem" }}>
            <h2 className="film-title">
              {film.title}
              <span
                className="info-icon"
                title="Show opening crawl"
                onClick={() => setCrawlFilm(film)}
              >
                ℹ️
              </span>
            </h2>

            <h3>Characters</h3>
            <div className="card-grid">
              {film.characters.map((char, idx) => (
                <div
                  key={idx}
                  className="card"
                  onClick={() => {
                    setSelected(char);
                    setSelectedType("character");
                  }}
                >
                  <h4>{char.name}</h4>
                  <p>{char.gender}</p>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: "2rem" }}>Planets</h3>
            <div className="card-grid">
              {film.planets.map((planet, idx) => (
                <div
                  key={idx}
                  className="card"
                  onClick={() => {
                    setSelected(planet);
                    setSelectedType("planet");
                  }}
                >
                  <h4>{planet.name}</h4>
                  <p>Climate: {planet.climate}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {selectedType === "character" ? (
              <>
                <h2>{selected.name}</h2>
                <div class="description">
                  <ul>
                    <li>
                      <span>Gender:</span> Male
                    </li>
                    <li>
                      <span>Birth Year:</span> 19BBY
                    </li>
                    <li>
                      <span>Height:</span> 172 cm
                    </li>
                    ...
                  </ul>
                </div>

                <h3 style={{ marginTop: "1.5rem" }}>
                  Appeared In (
                  {
                    films.filter((film) =>
                      film.characters.some((c) => c.name === selected.name)
                    ).length
                  }
                  )
                </h3>
                <div className="card-grid">
                  {films
                    .filter((film) =>
                      film.characters.some((c) => c.name === selected.name)
                    )
                    .map((film, idx) => (
                      <div key={idx} className="card">
                        <h4>{film.title}</h4>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <>
                <h2>{selected.name}</h2>
                <ul>
                  <li>
                    <strong>Climate:</strong> {selected.climate}
                  </li>
                  <li>
                    <strong>Population:</strong> {selected.population}
                  </li>
                  <li>
                    <strong>Terrain:</strong> {selected.terrain}
                  </li>
                </ul>

                <h3 style={{ marginTop: "1.5rem" }}>
                  Inhabitants (
                  {
                    films
                      .flatMap((f) => f.characters)
                      .filter((c) => c.homeworld === selected.url).length
                  }
                  )
                </h3>
                <div className="card-grid">
                  {films
                    .flatMap((f) => f.characters)
                    .filter((c) => c.homeworld === selected.url)
                    .map((char, idx) => (
                      <div key={idx} className="card">
                        <h4>{char.name}</h4>
                      </div>
                    ))}
                </div>
              </>
            )}
            <button className="close-btn" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}
      {crawlFilm && (
        <div className="modal" onClick={() => setCrawlFilm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: "#ffe81f", marginBottom: "1rem" }}>
              {crawlFilm.title}
            </h2>
            <div
              className="opening-crawl"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              {crawlFilm.opening_crawl}
            </div>
            <button className="close-btn" onClick={() => setCrawlFilm(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
