import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";

import SellerProductCard from "../../components/seller/SellerProductCard";
import { sellerService } from "../../services/sellerService";

function SellerProducts() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [sellerProducts, setSellerProducts] = useState([]);

  useEffect(() => {
    sellerService.getSellerProducts().then((products) => {
      setSellerProducts(Array.isArray(products) ? products : []);
    }).catch(() => setSellerProducts([]));
  }, []);

  const filteredProducts = sellerProducts.filter((product) =>
    (product.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      await sellerService.deleteProduct(id);
      setSellerProducts((prev) =>
        prev.filter((product) => String(product.id) !== String(id))
      );
      toast.success("Product deleted.");
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  return (
    <div className="pb-24 lg:pb-0">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">
            Inventory
          </p>

          <h1 className="mt-2 text-3xl sm:text-4xl font-black">
            Seller Products
          </h1>

          <p className="mt-2 text-[#7A7272] text-sm sm:text-base">
            {search
              ? `Search results for "${search}"`
              : "Manage your product listings and stock."}
          </p>
        </div>

        <Link
          to="/seller/add-product"
          className="bg-[#D90452] text-white px-6 py-4 rounded-full font-black text-center"
        >
          + Add Product
        </Link>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-[30px] p-10 mt-8 text-center">
          <h2 className="text-2xl font-black">No products found</h2>
          <p className="text-[#7A7272] mt-2">
            Try another search or add a new product.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 mt-8">
          {filteredProducts.map((product) => (
            <SellerProductCard
              key={product.id}
              product={product}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerProducts;
