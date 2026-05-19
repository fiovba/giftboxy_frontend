import { useEffect, useState } from "react";
import { FiSearch, FiChevronDown, FiChevronUp, FiStar, FiSliders } from "react-icons/fi";
import { categoryService } from "../../services/categoryService";

function FilterSidebar({
  selectedCategories,
  minPrice,
  maxPrice,
  selectedRating,
  personalized,
  onApplyFilters,
  onReset,
}) {
  const [categories, setCategories] = useState([]);
  const [localCategories, setLocalCategories] = useState(selectedCategories || []);
  const [localSearch, setLocalSearch] = useState("");
  const [localMinPrice] = useState(0);
  const [localMaxPrice, setLocalMaxPrice] = useState(Number(maxPrice) || 500);
  const [localRating, setLocalRating] = useState(selectedRating || "");
  const [localPersonalized, setLocalPersonalized] = useState(personalized === "true");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    categoryService.getCategories()
      .then((cats) => setCategories(Array.isArray(cats) ? cats : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLocalCategories(selectedCategories || []);
    setLocalMaxPrice(Number(maxPrice) || 500);
    setLocalRating(selectedRating || "");
    setLocalPersonalized(personalized === "true");
  }, [selectedCategories, maxPrice, selectedRating, personalized]);

  const toggleCategory = (slug) => {
    if (localCategories.includes(slug)) {
      setLocalCategories(localCategories.filter((item) => item !== slug));
    } else {
      setLocalCategories([...localCategories, slug]);
    }
  };

  const apply = () => {
    onApplyFilters({
      categories: localCategories.join(","),
      search: localSearch,
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
      rating: localRating,
      personalized: localPersonalized ? "true" : "",
    });
    setMobileOpen(false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-[#F7F1EE] rounded-full px-4 py-3 flex items-center gap-2">
        <input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search within results"
          className="bg-transparent outline-none text-sm flex-1"
        />
        <FiSearch className="text-[#A0918B]" />
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-xs font-black uppercase mb-3">Categories</h3>
        <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={localCategories.includes(category.slug)}
                onChange={() => toggleCategory(category.slug)}
                className="w-4 h-4 accent-[#D90452] cursor-pointer rounded"
              />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black uppercase">Price Range</h3>
          <span className="text-[#D90452] text-xs font-black">
            $0 — ${localMaxPrice}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="500"
          value={localMaxPrice}
          onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
          className="w-full accent-[#D90452]"
        />
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-xs font-black uppercase mb-3">Customer Rating</h3>
        <button
          onClick={() => setLocalRating(localRating === "4" ? "" : "4")}
          className={`flex items-center gap-1 ${localRating === "4" ? "text-[#D90452]" : "text-[#A0918B]"}`}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <FiStar key={star} className={star <= 4 ? "fill-current" : ""} size={14} />
          ))}
          <span className="text-xs text-[#7A7272] ml-2">& Up</span>
        </button>
      </div>

      {/* Personalizable */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase">Personalizable</h3>
        <button
          onClick={() => setLocalPersonalized(!localPersonalized)}
          className={`w-12 h-7 rounded-full p-1 transition ${localPersonalized ? "bg-[#D90452]" : "bg-[#E6DAD5]"}`}
        >
          <span className={`block w-5 h-5 bg-white rounded-full transition ${localPersonalized ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 border border-[#EFE4DF] text-[#7A7272] py-3 rounded-full font-black text-sm"
        >
          Reset
        </button>
        <button
          onClick={apply}
          className="flex-1 bg-[#D90452] text-white py-3 rounded-full font-black text-sm"
        >
          Apply
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 bg-white border border-[#EFE4DF] px-5 py-3 rounded-full font-black text-sm text-[#1E1B1B]"
        >
          <FiSliders size={16} className="text-[#D90452]" />
          Filters
          {localCategories.length > 0 && (
            <span className="bg-[#D90452] text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
              {localCategories.length}
            </span>
          )}
          {mobileOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </button>

        {mobileOpen && (
          <div className="mt-3 bg-white rounded-[24px] p-5 border border-[#EFE4DF] shadow-lg">
            <FilterContent />
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block bg-white rounded-[32px] p-7 h-fit sticky top-24 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-lg">Filters</h2>
          <button onClick={onReset} className="text-[#D90452] text-[11px] uppercase font-black">
            Reset All
          </button>
        </div>
        <FilterContent />
      </aside>
    </>
  );
}

export default FilterSidebar;