import { useEffect, useState } from "react";
import ExploreProductCard from "../explore/ExploreProductCard";
import { getProducts } from "../../services/productService";
import { normalizeProductList } from "../../utils/productUtils";

function GiftRecommendations() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts()
      .then((res) => {
        console.log("GIFT RECOMMENDATIONS RESPONSE:", res.data);

        const list = normalizeProductList(res);

        setProducts(list.slice(0, 4));
      })
      .catch((error) => {
        console.log("Gift recommendations error:", error.response?.data || error);
        setProducts([]);
      });
  }, []);

  if (products.length === 0) {
    return (
      <section className="px-5 lg:px-10 pb-20">
        <div className="max-w-7xl mx-auto bg-white rounded-[30px] p-10 text-center border border-[#EFE4DF]">
          <h2 className="text-2xl font-black">No recommendations found</h2>
          <p className="mt-2 text-[#7A7272]">
            Products could not be loaded right now.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 lg:px-10 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black">Gift Recommendations</h2>
            <p className="text-[#7A7272] mt-2">
              Curated picks based on your answers.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ExploreProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default GiftRecommendations;