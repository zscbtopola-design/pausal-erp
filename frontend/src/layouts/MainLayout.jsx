import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

function MainLayout({ page, setPage, title, children }) {
  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} />

      <main className="main">
        <Header title={title} />
        {children}
      </main>
    </div>
  );
}

export default MainLayout;

