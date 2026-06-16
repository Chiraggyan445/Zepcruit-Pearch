import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import SearchPanel from "../components/SearchPanel";
import ResultsPanel from "../components/ResultsPanel";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-black text-white">
      
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="flex flex-1 p-4 gap-4">
          <SearchPanel />
          <ResultsPanel />
        </div>
      </div>

    </div>
  );
}