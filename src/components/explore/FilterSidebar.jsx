import { useEffect, useState } from "react";
import { FiSearch, FiChevronDown, FiChevronUp, FiStar, FiSliders } from "react-icons/fi";
import { categoryService } from "../../services/categoryService";

function FilterSidebar({
  selectedCategories,
  minPrice,
  maxPrice,
  priceMin = 0,
  priceMax = 500,
  selectedRating,
  personalized,
  onApplyFilters,
  onReset,
}) {
  const [categories, setCategories] = useState([]);
  const [localCategories, setLocalCategories] = useState(selectedCategories || []);
  const [localSearch, setLocalSearch] = useState("");
  const [localMinPrice, setLocalMinPrice] = useState(priceMin);
  const [localMaxPrice, setLocalMaxPrice] = useState(priceMax);
  const [localRating, setLocalRating] = useState(selectedRating || "");
  const [localPersonalized, setLocalPersonalized] = useState(personalized === "true");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    categoryService
      .getCategories()
      .then((cats) => setCategories(Array.isArray(cats) ? cats : []))
      .catch(() => setCategories([]));
  }, []);

  // When products load, set price bounds unless user already filtered via URL
  useEffect(() => {
    if (!minPrice) setLocalMinPrice(priceMin);
    const hasUrlMax = maxPrice && Number(maxPrice) !== 99999;
    if (!hasUrlMax) setLocalMaxPrice(priceMax);
  }, [priceMin, priceMax]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync from URL params (e.g. browser back/forward)
  useEffect(() => {
    setLocalCategories(selectedCategories || []);
    if (minPrice) setLocalMinPrice(Number(minPrice));
    const hasUrlMax = maxPrice && Number(maxPrice) !== 99999;
    if (hasUrlMax) setLocalMaxPrice(Number(maxPrice));
    setLocalRating(selectedRating || "");
    setLocalPersonalized(personalized === "true");
  }, [selectedCategories, minPrice, maxPrice, selectedRating, personalized]);

  const toggleCategory = (slug) => {
    setLocalCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), localMaxPrice - 1);
    setLocalMinPrice(val);
  };

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), localMinPrice + 1);
    setLocalMaxPrice(val);
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
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-black uppercase">Price Range</h3>
          <span className="text-[#D90452] text-xs font-black">
            ${localMinPrice} — ${localMaxPrice}
          </span>
        </div>
        <p className="text-[10px] text-[#A0918B] mb-3">
          All products: ${priceMin} – ${priceMax}
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-[#7A7272] font-bold uppercase">Min</label>
            <input
              type="range"
              min={priceMin}
              max={priceMax}
              value={localMinPrice}
              onChange={handleMinChange}
              className="w-full accent-[#D90452] mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#7A7272] font-bold uppercase">Max</label>
            <input
              type="range"
              min={priceMin}
              max={priceMax}
              value={localMaxPrice}
              onChange={handleMaxChange}
              className="w-full accent-[#D90452] mt-1"
            />
          </div>
        </div>
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
          <span
            className={`block w-5 h-5 bg-white rounded-full transition ${
              localPersonalized ? "translate-x-5" : "translate-x-0"
            }`}
          />
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
