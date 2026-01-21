import { NavLink } from "react-router-dom";
import { topics } from "../data/topics";

export default function DSASidebar() {
  return (
    <aside className="w-64 border-r border-white/10 p-4">
      <h2 className="text-xl font-semibold mb-4">DSA</h2>

      <ul className="space-y-2">
        {topics.map(topic => (
          <NavLink
            key={topic.id}
            to={`/dsa/${topic.id}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition
               ${isActive ? "bg-purple-600/20 text-purple-400" : "hover:bg-white/5"}`
            }
          >
            <span>{topic.icon}</span>
            <span>{topic.title}</span>
          </NavLink>
        ))}
      </ul>
    </aside>
  );
}
