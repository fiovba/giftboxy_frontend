import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const BASE_URL = "https://giftboxy-backend-1.onrender.com";

function SellerProductCard({ product, onDelete }) {
  if (!product) return null;

  const getImageSrc = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${BASE_URL}${img}`;
  };

  const imgSrc =
    getImageSrc(product.images?.[0]) ||
    getImageSrc(product.productImage) ||
    getImageSrc(product.imageUrl) ||
    null;

  const categoryName =
    product.categoryName ||
    (typeof product.category === "object" ? product.category?.name : product.category) ||
    "";

  const stock = product.stockCount ?? product.stock ?? "—";

  return (
    <div className="bg-white rounded-[26px] overflow-hidden border border-[#EFE4DF] shadow-sm">
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={product.title}
          className="w-full h-[210px] object-cover"
        />
      ) : (
        <div className="w-full h-[210px] bg-[#F8F1EC] flex items-center justify-center text-5xl">
          🎁
        </div>
      )}

      <div className="p-5">
        {categoryName && (
          <p className="text-xs uppercase font-black text-[#D90452]">
            {categoryName}
          </p>
        )}

        <h3 className="mt-2 font-black text-lg leading-snug">{product.title}</h3>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[#D90452] text-xl font-black">${product.price}</p>
          <p className="text-sm text-[#7A7272]">Stock: {stock}</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            to={`/seller/edit-product/${product.id}`}
            className="bg-[#F8E7EC] text-[#D90452] py-3 rounded-full font-black flex items-center justify-center gap-2"
          >
            <FiEdit2 />
            Edit
          </Link>

          <button
            onClick={() => onDelete(product.id)}
            className="bg-[#1E1B1B] text-white py-3 rounded-full font-black flex items-center justify-center gap-2"
          >
            <FiTrash2 />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default SellerProductCard;