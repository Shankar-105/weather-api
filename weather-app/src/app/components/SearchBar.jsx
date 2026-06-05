import "./SearchBar.css";

export default function SearchBar() {
  return (
    <div className="searchBox">
      <input type="text" placeholder="Enter city..." />
      <button>Search</button>
    </div>
  );
}