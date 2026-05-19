import {
  FiHeart,
  FiUsers,
  FiGift,
  FiSmile,
  FiBriefcase,
  FiAward,
} from "react-icons/fi";

const categories = [
  { name: "For Her", icon: <FiHeart /> },
  { name: "For Him", icon: <FiUsers /> },
  { name: "Mom", icon: <FiHeart /> },
  { name: "Dad", icon: <FiAward /> },
  { name: "Kids", icon: <FiUsers /> },
  { name: "Romance", icon: <FiHeart /> },
  { name: "Office", icon: <FiBriefcase /> },
  { name: "Events", icon: <FiGift /> },
  { name: "Custom", icon: <FiSmile /> },
];

function CategoryIcons() {
  return (
    <section className="bg-[#F5F2EF] px-5 lg:px-10 py-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 overflow-x-auto pb-3">
        {categories.map((item) => (
          <div key={item.name} className="min-w-[90px] text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#F7DCE5] text-[#D90452] flex items-center justify-center text-2xl shadow-sm">
              {item.icon}
            </div>

            <p className="mt-3 text-xs font-semibold text-[#5D5555]">
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CategoryIcons;