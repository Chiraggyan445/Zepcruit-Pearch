import logo from "../assets/zepcruit.png";

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#0A0A0A] border-r border-gray-800 p-4">

      <img src={logo} className="w-32 mb-8" />

      <nav className="space-y-4">
        <div className="hover:text-orange-500 cursor-pointer">Dashboard</div>
        <div className="hover:text-orange-500 cursor-pointer">Search</div>
        <div className="hover:text-orange-500 cursor-pointer">Candidates</div>
        <div className="hover:text-orange-500 cursor-pointer">Analytics</div>
      </nav>

    </div>
  );
}