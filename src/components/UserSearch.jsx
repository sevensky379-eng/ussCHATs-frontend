import React, { useState } from "react";
import axios from "axios";
import "./UserSearch.css";

const UserSearch = ({ onSelectUser }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("usschats_token");
      const res = await axios.get(
        `http://localhost:5000/api/users/search?q=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="user-search">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Enter username to search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="search-button"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="search-results">
        {results.length > 0 ? (
          <ul className="user-list">
            {results.map((user) => (
              <li key={user._id} className="user-item">
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  {user.email && <span className="user-email">({user.email})</span>}
                </div>
                <button
                  onClick={() => onSelectUser(user)}
                  className="chat-button"
                >
                  Chat
                </button>
              </li>
            ))}
          </ul>
        ) : query && !loading ? (
          <p className="no-results">No users found with that username.</p>
        ) : null}
      </div>
    </div>
  );
};

export default UserSearch;
