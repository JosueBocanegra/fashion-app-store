const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
    <div className={`text-3xl p-3 rounded-full ${color}`}>{icon}</div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default StatCard;


