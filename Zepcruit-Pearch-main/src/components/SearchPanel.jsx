export default function SearchPanel() {
  return (
    <div className="w-1/3 bg-[#1A1A1A] p-6 rounded-xl shadow-lg">

      <h2 className="text-xl font-semibold mb-4">People Search</h2>

      <textarea
        className="w-full p-3 rounded-lg bg-black border border-gray-700"
        placeholder="Search candidates..."
      />

      <select className="w-full mt-4 p-2 rounded bg-black border border-gray-700">
        <option>Pro (5 credits)</option>
      </select>

      <div className="flex gap-2 mt-4">
        <input placeholder="Limit" className="w-1/2 p-2 bg-black border rounded" />
        <input placeholder="Offset" className="w-1/2 p-2 bg-black border rounded" />
      </div>

      <button className="w-full mt-6 bg-orange-500 hover:bg-orange-600 p-3 rounded-lg font-semibold">
        Run Search
      </button>

    </div>
  );
}