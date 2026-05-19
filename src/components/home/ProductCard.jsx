import { FiHeart, FiShoppingBag } from "react-icons/fi";

function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-xl transition">
      <img
        src={product.image}
        alt={product.name}
        className="h-64 w-full object-cover"
      />

      <div className="p-6">
        <h3 className="text-lg font-semibold">{product.name}</h3>

        <div className="flex items-center justify-between mt-4">
          <p className="text-[#A45C40] font-bold">${product.price}</p>

          <div className="flex gap-3">
            <button className="p-3 rounded-full bg-[#F3E8E2] text-[#A45C40]">
              <FiHeart />
            </button>

            <button className="p-3 rounded-full bg-[#A45C40] text-white">
              <FiShoppingBag />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;