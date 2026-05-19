import { useEffect, useState } from "react";
import { getCategories } from "../../services/categoryService";

function ExploreHeader({ selectedCategory }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then((cats) => setCategories(Array.isArray(cats) ? cats : []))
      .catch(() => setCategories([]));
  }, []);

  const currentCategory = categories.find(
    (category) => category.slug === selectedCategory
  );

  return (
    <div className="bg-[#F8E7EC] px-4 sm:px-6 lg:pl-15 py-5">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#6F6262]">
        HOME <span className="text-[#D90452]">› SHOP</span>
      </p>

      <h1 className="mt-4 text-3xl sm:text-4xl font-black text-[#1E1B1B]">
        {currentCategory
          ? `${currentCategory.name} Gifts ${currentCategory.icon || "🎁"}`
          : "Explore All Gifts ✨"}
      </h1>

      <p className="mt-4 max-w-3xl text-[#7A7272] text-sm sm:text-base">
        {currentCategory
          ? `Discover thoughtful ${currentCategory.name.toLowerCase()} made by independent creators.`
          : "Thousands of unique, personalized gifts from talented local creators, curated just for your special moments."}
      </p>
    </div>
  );
}

export default ExploreHeader;