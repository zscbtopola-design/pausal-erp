function Header({ title }) {
  return (
    <header className="top-header">
      <div>
        <h1>{title}</h1>
        <p>Pregled poslovanja i osnovnih podataka</p>
      </div>

      <div className="header-user">
        <span>🔔</span>
        <strong>Administrator</strong>
      </div>
    </header>
  );
}

export default Header;