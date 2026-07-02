import "./SearchBox.css";

function SearchBox({ value, onChange, placeholder = "Pretraga..." }) {
  return (
    <input
      className="search-box"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

export default SearchBox;