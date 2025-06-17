import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./App.css";
import { useDebounce } from "./utility/useDebounce";

function App() {
  const [films, setFilms] = useState([]);
  const [characterCache, setCharacterCache] = useState({});
  const [planetCache, setPlanetCache] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState("");
  const [crawlFilm, setCrawlFilm] = useState(null);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);
  const query = debouncedSearch.toLowerCase();
  const isSearching = query.trim().length > 0;

  // Fetch and hydrate all films
  useEffect(() => {
    const load = async () => {
      const res = await axios.get("https://swapi.py4e.com/api/films/");
      const filmsSorted = res.data.results.sort(
        (a, b) => a.episode_id - b.episode_id
      );

      const hydratedFilms = await Promise.all(
        filmsSorted.map(async (film) => {
          const characters = await Promise.all(
            film.characters.slice(0, 5).map(async (url) => {
              if (!characterCache[url]) {
                const { data } = await axios.get(url);
                characterCache[url] = data;
              }
              return characterCache[url];
            })
          );

          const planets = await Promise.all(
            film.planets.slice(0, 5).map(async (url) => {
              if (!planetCache[url]) {
                const { data } = await axios.get(url);
                planetCache[url] = data;
              }
              return planetCache[url];
            })
          );

          return { ...film, characters, planets };
        })
      );

      setFilms(hydratedFilms);
      setCharacterCache({ ...characterCache });
      setPlanetCache({ ...planetCache });
    };

    load();
  }, []);

  const dedupeBy = (items, key = "name") =>
    Array.from(new Map(items.map((i) => [i[key], i])).values());

  const filteredFilms = useMemo(
    () => films.filter((f) => f.title.toLowerCase().includes(query)),
    [films, query]
  );

  const filteredCharacters = useMemo(
    () =>
      dedupeBy(
        films
          .flatMap((f) => f.characters)
          .filter((c) => c.name.toLowerCase().includes(query))
      ),
    [films, query]
  );

  const filteredPlanets = useMemo(
    () =>
      dedupeBy(
        films
          .flatMap((f) => f.planets)
          .filter((p) => p.name.toLowerCase().includes(query))
      ),
    [films, query]
  );

  const handleSelect = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
  };

  const renderCards = (items, type) => (
    <div className="card-grid">
      {items.map((item, idx) => (
        <div
          className="card"
          key={idx}
          onClick={() => handleSelect(item, type)}
        >
          <h4>{item.name}</h4>
          {type === "character" && <p>{item.gender}</p>}
          {type === "planet" && <p>Climate: {item.climate}</p>}
          {type === "film" && <p>Episode {item.episode_id}</p>}
        </div>
      ))}
    </div>
  );

  const renderSearchResults = () => (
    <div>
      {filteredFilms.length > 0 && (
        <section>
          <h3>Movies</h3>
          {renderCards(filteredFilms, "film")}
        </section>
      )}
      {filteredCharacters.length > 0 && (
        <section>
          <h3>Characters</h3>
          {renderCards(filteredCharacters, "character")}
        </section>
      )}
      {filteredPlanets.length > 0 && (
        <section>
          <h3>Planets</h3>
          {renderCards(filteredPlanets, "planet")}
        </section>
      )}
    </div>
  );

  const renderDefaultView = () =>
    films.map((film, idx) => (
      <section key={idx} className="film-section">
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
        {renderCards(film.characters, "character")}

        <h3>Planets</h3>
        {renderCards(film.planets, "planet")}
      </section>
    ));

  const renderSelectedModal = () => (
    <div className="modal" onClick={() => setSelectedItem(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <h2>{selectedItem.name}</h2>
          {itemType === "character" ? (
            <>
              <ul>
                <li>
                  <span>Gender:</span> {selectedItem.gender}
                </li>
                <li>
                  <span>Birth Year:</span> {selectedItem.birth_year}
                </li>
                <li>
                  <span>Height:</span> {selectedItem.height} cm
                </li>
                <li>
                  <span>Mass:</span> {selectedItem.mass} kg
                </li>
              </ul>
              <h3>Appeared In</h3>
              {renderCards(
                films.filter((f) =>
                  f.characters.some((c) => c.name === selectedItem.name)
                ),
                "film"
              )}
            </>
          ) : (
            <>
              <ul>
                <li>
                  <strong>Climate:</strong> {selectedItem.climate}
                </li>
                <li>
                  <strong>Population:</strong> {selectedItem.population}
                </li>
                <li>
                  <strong>Terrain:</strong> {selectedItem.terrain}
                </li>
              </ul>
              <h3>Inhabitants</h3>
              {renderCards(
                films
                  .flatMap((f) => f.characters)
                  .filter((c) => c.homeworld === selectedItem.url),
                "character"
              )}
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="close-btn" onClick={() => setSelectedItem(null)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const renderCrawlModal = () => (
    <div className="modal" onClick={() => setCrawlFilm(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: "#ffe81f", marginBottom: "1rem" }}>
          {crawlFilm.title}
        </h2>
        <div className="opening-crawl">{crawlFilm.opening_crawl}</div>
        <div className="modal-footer">
          <button className="close-btn" onClick={() => setCrawlFilm(null)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="logo">STAR-flix 🎥</h1>
        <input
          type="text"
          className="search-bar"
          placeholder="Search for a film, character, or planet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <main>{isSearching ? renderSearchResults() : renderDefaultView()}</main>

      {selectedItem && renderSelectedModal()}
      {crawlFilm && renderCrawlModal()}
    </div>
  );
}

export default App;
