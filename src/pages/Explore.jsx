import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import ExploreHeader from "../components/explore/ExploreHeader";
import FilterSidebar from "../components/explore/FilterSidebar";
import ProductGrid from "../components/explore/ProductGrid";
import { getProducts } from "../services/productService";

const PAGE_SIZE = 12;

function Explore() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || "";

  const selectedCategories = searchParams.get("categories")
    ? searchParams.get("categories").split(",")
    : selectedCategory
      ? [selectedCategory]
      : [];

  const sort = searchParams.get("sort") || "featured";
  const minPrice = Number(searchParams.get("minPrice")) || 0;
  const maxPrice = Number(searchParams.get("maxPrice")) || 99999;
  const selectedRating = searchParams.get("rating") || "";
  const personalized = searchParams.get("personalized") || "";
  const searchQuery = searchParams.get("search")?.toLowerCase().trim() || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    setLoading(true);

    getProducts()
      .then((res) => {
        const data = res.data;

        console.log("PRODUCTS DATA:", data);

        if (Array.isArray(data)) {
          setAllProducts(data);
        } else if (Array.isArray(data?.data)) {
          setAllProducts(data.data);
        } else if (Array.isArray(data?.items)) {
          setAllProducts(data.items);
        } else {
          setAllProducts([]);
        }
      })
      .catch(() => {
        setAllProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getCategorySlug = (product) => {
    if (product.category && typeof product.category === "object") {
      return product.category.slug || product.category.name || "";
    }

    return product.categorySlug || product.categoryName || product.category || "";
  };

 const filteredProducts = allProducts.filter((product) => {
  const title =
    product.title?.toLowerCase() ||
    product.name?.toLowerCase() ||
    "";

  const description = product.description?.toLowerCase() || "";

  const catSlug = getCategorySlug(product).toLowerCase();

  const catName =
    typeof product.category === "object"
      ? product.category?.name?.toLowerCase() || ""
      : (product.category || product.categoryName || "").toLowerCase();

  const query = searchQuery.toLowerCase().trim();

  const matchesSearch =
    !query ||
    title.includes(query) ||
    description.includes(query) ||
    catSlug.includes(query) ||
    catName.includes(query);

  const matchesCategory =
    selectedCategories.length === 0 ||
    selectedCategories.some((sel) => {
      const value = sel.toLowerCase().trim();

      return (
        catSlug.includes(value) ||
        catName.includes(value)
      );
    });

  const price = Number(product.price || 0);

  const matchesPrice =
    price >= minPrice && price <= maxPrice;

  const matchesRating =
    !selectedRating ||
    Number(product.rating || 0) >= Number(selectedRating);

  const matchesPersonalized =
    !personalized ||
    String(product.isPersonalized) === personalized ||
    String(product.isPersonalized).toLowerCase() === personalized.toLowerCase();

  return (
    matchesSearch &&
    matchesCategory &&
    matchesPrice &&
    matchesRating &&
    matchesPersonalized
  );
});

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "price-low") {
      return Number(a.price) - Number(b.price);
    }

    if (sort === "price-high") {
      return Number(b.price) - Number(a.price);
    }

    if (sort === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / PAGE_SIZE);

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const applyFilters = (filters) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(filters).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    params.set("page", "1");
    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearchParams({ page: "1" });
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;

    const params = new URLSearchParams(searchParams);

    params.set("page", String(page));
    setSearchParams(params);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-[#F5F2EF] min-h-screen">
      <ExploreHeader selectedCategory={selectedCategory} />

      <div className="max-w-9xl mx-auto px-4 sm:px-5 lg:px-10 py-6 lg:py-10 lg:grid lg:grid-cols-[280px_1fr] gap-8">
        <FilterSidebar
          selectedCategories={selectedCategories}
          minPrice={minPrice}
          maxPrice={maxPrice}
          selectedRating={selectedRating}
          personalized={personalized}
          onApplyFilters={applyFilters}
          onReset={resetFilters}
        />

        <div>
          <ProductGrid
            products={paginatedProducts}
            sort={sort}
            onSortChange={(value) => applyFilters({ sort: value })}
            loading={loading}
          />

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-full border border-[#EFE4DF] bg-white flex items-center justify-center disabled:opacity-40 hover:border-[#D90452] transition"
              >
                <FiChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 2
                )
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) {
                    acc.push("...");
                  }

                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="px-2 text-[#7A7272]">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-10 h-10 rounded-full font-black text-sm transition ${
                        currentPage === p
                          ? "bg-[#D90452] text-white"
                          : "bg-white border border-[#EFE4DF] hover:border-[#D90452] text-[#1E1B1B]"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-full border border-[#EFE4DF] bg-white flex items-center justify-center disabled:opacity-40 hover:border-[#D90452] transition"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Explore;