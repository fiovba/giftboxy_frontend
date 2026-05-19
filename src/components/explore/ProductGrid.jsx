import ExploreProductCard from "./ExploreProductCard";

function ProductGrid({ products, sort, onSortChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[#7A7272]">
          Showing {products.length} products
        </p>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-white px-4 py-3 rounded-full text-sm outline-none"
        >
          <option value="featured">Sort by Featured</option>
          <option value="price-low">Price Low to High</option>
          <option value="price-high">Price High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-[28px] p-10 text-center">
          <h3 className="text-2xl font-black">No products found</h3>
          <p className="text-[#7A7272] mt-2">
            Try changing your filters.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ExploreProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGrid;