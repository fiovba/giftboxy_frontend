import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiHeart, FiShoppingCart, FiMessageCircle,
  FiStar, FiSend, FiCheck,
} from "react-icons/fi";
import { GoHeartFill } from "react-icons/go";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { getProductBySlug } from "../services/productService";
import { getProductReviews, createReview } from "../services/reviewService";
import { getProductQuestions, createQuestion } from "../services/questionService";
import api from "../services/api";

function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated, isBuyer, user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [backendRating, setBackendRating] = useState(null);

  const [personalization, setPersonalization] = useState({
    name: "",
    font: "Classic Script",
    color: "Gold",
  });

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [questionSubmitting, setQuestionSubmitting] = useState(false);

  useEffect(() => {
    setProductLoading(true);
    const isId = /^\d+$/.test(slug);
    const request = isId
      ? api.get(`/products/${slug}`)
      : getProductBySlug(slug);

    request
      .then((res) => {
        const data = res.data;
        setProduct(data);
        setSelectedImage(data?.images?.[0] || data?.imageUrl);
      })
      .catch(() => setProduct(null))
      .finally(() => setProductLoading(false));
  }, [slug]);

  const loadReviews = (productId) => {
    getProductReviews(productId)
      .then((res) => {
        const d = res.data;
        if (d?.averageRating !== undefined) setBackendRating(d.averageRating);
        setReviews(
          Array.isArray(d) ? d
            : Array.isArray(d?.data) ? d.data
            : Array.isArray(d?.items) ? d.items
            : []
        );
      })
      .catch(() => setReviews([]));
  };

  const loadQuestions = (productId) => {
    getProductQuestions(productId)
      .then((res) => {
        const d = res.data;
        setQuestions(
          Array.isArray(d) ? d
            : Array.isArray(d?.data) ? d.data
            : Array.isArray(d?.items) ? d.items
            : []
        );
      })
      .catch(() => setQuestions([]));
  };

  useEffect(() => {
    if (!product?.id) return;
    loadReviews(product.id);
    loadQuestions(product.id);
  }, [product?.id]);

  const liked = product ? isInWishlist(product.id) : false;

  const averageRating = useMemo(() => {
    if (backendRating !== null) return Number(backendRating).toFixed(1);
    if (reviews.length === 0) return Number(product?.rating || 0).toFixed(1);
    const total = reviews.reduce((sum, r) => sum + Number(r.rating), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews, product, backendRating]);

  if (productLoading) {
    return (
      <div className="min-h-screen bg-[#F5F2EF] flex items-center justify-center">
        <div className="bg-white rounded-[30px] p-10 text-center">
          <div className="w-16 h-16 border-4 border-[#D90452] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 font-black text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5F2EF] flex items-center justify-center">
        <div className="bg-white rounded-[30px] p-10 text-center">
          <h1 className="text-3xl font-black">Product not found</h1>
          <Link to="/explore" className="inline-block mt-6 bg-[#D90452] text-white px-7 py-4 rounded-full font-black">
            Explore Gifts
          </Link>
        </div>
      </div>
    );
  }

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error("Login required."); return; }
    if (!isBuyer) { toast.error("Sellers cannot use wishlist."); return; }
    try {
      await toggleWishlist(product);
      toast.success(liked ? "Removed from wishlist." : "Added to wishlist.");
    } catch { toast.error("Wishlist error."); }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error("Login required."); return; }
    if (!isBuyer) { toast.error("Sellers cannot use cart."); return; }
    if (product.stockCount <= 0) { toast.error("Out of stock."); return; }
    setAddingToCart(true);
    try {
      await addToCart({
        id: product.id,
        quantity: 1,
        personalization: product.isPersonalized ? personalization : null,
      });
      toast.success("Added to cart!");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Error adding to cart.");
    } finally {
      setAddingToCart(false);
    }
  };

const handleMessageSeller = () => {
  if (!isAuthenticated) { toast.error("Login required."); return; }
  if (!isBuyer) { toast.error("Sellers cannot message sellers."); return; }
  const sellerId = product.sellerUserId || product.sellerId || product.seller?.id;
  if (sellerId) {
    navigate(`/chat?sellerId=${sellerId}`);
  } else {
    toast.error("Seller information not available.");
  }
};

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Login required."); return; }
    if (!reviewForm.text.trim()) { toast.error("Review cannot be empty."); return; }
    setReviewSubmitting(true);
    try {
      await createReview({ productId: product.id, rating: reviewForm.rating, comment: reviewForm.text });
      loadReviews(product.id);
      setReviewForm({ rating: 5, text: "" });
      toast.success("Review added!");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data || "Could not add review.";
      toast.error(typeof msg === "string" ? msg : "Could not add review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const submitQuestion = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Login required."); return; }
    if (!questionText.trim()) { toast.error("Question cannot be empty."); return; }
    setQuestionSubmitting(true);
    try {
      await createQuestion({ productId: product.id, question: questionText });
      loadQuestions(product.id);
      setQuestionText("");
      toast.success("Question submitted!");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not submit question.");
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const productCategory = product.category?.name || product.category || product.categoryName || "";
  const stock = product.stockCount ?? product.stock ?? 0;

  return (
    <div className="min-h-screen bg-[#F5F2EF] px-4 sm:px-6 lg:px-10 py-8">
      <div className="max-w-[1280px] mx-auto">

        <p className="text-xs uppercase tracking-widest font-black text-[#7A7272]">
          <Link to="/" className="hover:text-[#D90452]">Home</Link> /{" "}
          <Link to="/explore" className="hover:text-[#D90452]">Shop</Link> /{" "}
          <span className="text-[#D90452]">{productCategory}</span>
        </p>

        <section className="mt-6 grid lg:grid-cols-[0.95fr_1.05fr] gap-8">
          <div>
            <div className="relative bg-white rounded-[32px] overflow-hidden border border-[#EEE4DF]">
              {product.badge && (
                <span className="absolute top-5 left-5 bg-[#D90452] text-white px-4 py-2 rounded-full text-xs font-black z-10">
                  {product.badge}
                </span>
              )}
              <button
                onClick={handleWishlist}
                className={`absolute top-5 right-5 w-12 h-12 rounded-full flex items-center justify-center z-10 transition ${liked ? "bg-[#D90452] text-white" : "bg-white text-[#1E1B1B]"}`}
              >
                {liked ? <GoHeartFill /> : <FiHeart />}
              </button>
              <img
                src={selectedImage || product.images?.[0] || product.imageUrl}
                alt={product.title}
                className="w-full h-[420px] sm:h-[520px] object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {product.images.map((image) => (
                  <button
                    key={image}
                    onClick={() => setSelectedImage(image)}
                    className={`rounded-[20px] overflow-hidden border-2 transition ${selectedImage === image ? "border-[#D90452]" : "border-transparent"}`}
                  >
                    <img src={image} alt="" className="w-full h-[90px] object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-[#EEE4DF]">
            <p className="text-xs uppercase tracking-widest font-black text-[#D90452]">
              {productCategory}
            </p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-black leading-tight text-[#1E1B1B]">
              {product.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-[#D90452] font-black">
                <FiStar /> {averageRating}
              </span>
              <span className="text-sm text-[#7A7272]">{reviews.length} reviews</span>
              <span className={`text-sm font-black ${stock > 0 ? "text-green-600" : "text-[#D90452]"}`}>
                {stock > 0 ? `${stock} in stock` : "Out of stock"}
              </span>
            </div>
            <div className="mt-6 flex items-end gap-4">
              <span className="text-4xl font-black text-[#D90452]">${product.price}</span>
              {product.oldPrice && (
                <span className="text-xl line-through text-[#9A8C87]">${product.oldPrice}</span>
              )}
            </div>

            {product.isPersonalized && (
              <div className="mt-7 bg-[#F8E7EC] rounded-[28px] p-5">
                <h2 className="font-black text-lg flex items-center gap-2">✏️ Make it Personal</h2>
                <p className="text-sm text-[#7A7272] mt-1">Customize this product just for your recipient.</p>
                <div className="mt-4 grid gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6F6262]">
                      Name to Engrave
                    </label>
                    <input
                      value={personalization.name}
                      onChange={(e) => setPersonalization({ ...personalization, name: e.target.value })}
                      placeholder="e.g. Elena"
                      className="mt-1 w-full bg-white rounded-full px-5 py-3 outline-none text-sm border border-[#EEE4DF]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#6F6262]">Font Style</label>
                      <select
                        value={personalization.font}
                        onChange={(e) => setPersonalization({ ...personalization, font: e.target.value })}
                        className="mt-1 w-full bg-white rounded-full px-5 py-3 outline-none text-sm border border-[#EEE4DF]"
                      >
                        <option>Classic Script</option>
                        <option>Modern Sans</option>
                        <option>Bold Block</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#6F6262]">Color</label>
                      <select
                        value={personalization.color}
                        onChange={(e) => setPersonalization({ ...personalization, color: e.target.value })}
                        className="mt-1 w-full bg-white rounded-full px-5 py-3 outline-none text-sm border border-[#EEE4DF]"
                      >
                        <option>Gold</option>
                        <option>Silver</option>
                        <option>Rose Gold</option>
                      </select>
                    </div>
                  </div>
                  {personalization.name && (
                    <div className="bg-white rounded-[18px] px-5 py-3 flex items-center gap-2 text-sm">
                      <FiCheck className="text-green-500" />
                      <span className="text-[#7A7272]">
                        Preview: <b>{personalization.name}</b> in <b>{personalization.font}</b> · <b>{personalization.color}</b>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || stock <= 0}
                className="flex-1 bg-[#D90452] text-white py-4 rounded-full font-black flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <FiShoppingCart />
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button
                onClick={handleMessageSeller}
                className="bg-[#F8F1EC] text-[#D90452] px-6 py-4 rounded-full font-black flex items-center justify-center gap-2"
              >
                <FiMessageCircle />
                Message Seller
              </button>
            </div>

            {product.sellerStoreName && (
              <div className="mt-7 bg-[#F8F1EC] rounded-[24px] p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#F8E7EC] flex items-center justify-center text-2xl flex-shrink-0">
                  🏪
                </div>
                <div>
                  <h3 className="font-black">{product.sellerStoreName}</h3>
                  <p className="text-sm text-[#7A7272]">{product.categoryName}</p>
                </div>
              </div>
            )}

            <div className="mt-7 divide-y divide-[#EEE4DF]">
              <details className="py-5" open>
                <summary className="cursor-pointer font-black flex items-center justify-between">
                  Product Details <span className="text-[#D90452]">+</span>
                </summary>
                <p className="mt-3 text-sm text-[#7A7272] leading-relaxed">{product.description}</p>
              </details>
              <details className="py-5">
                <summary className="cursor-pointer font-black flex items-center justify-between">
                  Shipping & Returns <span className="text-[#D90452]">+</span>
                </summary>
                <p className="mt-3 text-sm text-[#7A7272] leading-relaxed">
                  Ships within 2–5 business days. Returns accepted within 14 days for non-personalized items.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section className="mt-14 grid lg:grid-cols-[1fr_420px] gap-8">
          {/* Reviews */}
          <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-[#EEE4DF]">
            <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">Customer Reviews</p>
            <h2 className="mt-2 text-3xl font-black">{averageRating} ⭐ · {reviews.length} Reviews</h2>

            <form onSubmit={submitReview} className="mt-7 bg-[#F8F1EC] rounded-[26px] p-5 space-y-3">
              <div className="grid sm:grid-cols-[160px_1fr] gap-3">
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  className="bg-white rounded-full px-5 py-4 outline-none border border-[#EEE4DF] text-sm"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>{"⭐".repeat(r)} {r} star{r !== 1 ? "s" : ""}</option>
                  ))}
                </select>
                <input
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  placeholder="Write your review..."
                  className="bg-white rounded-full px-5 py-4 outline-none text-sm border border-[#EEE4DF]"
                />
              </div>
              <button
                disabled={reviewSubmitting}
                className="bg-[#D90452] text-white px-7 py-3 rounded-full font-black text-sm disabled:opacity-60"
              >
                {reviewSubmitting ? "Submitting..." : "Add Review"}
              </button>
              <p className="text-xs text-[#9A8C87]">
                ⚠️ You can only review products you have purchased.
              </p>
            </form>

            <div className="grid md:grid-cols-2 gap-5 mt-7">
              {reviews.length === 0 ? (
                <div className="md:col-span-2 text-center bg-[#F8F1EC] rounded-[26px] p-10">
                  <h3 className="font-black text-xl">No reviews yet</h3>
                  <p className="text-[#7A7272] mt-2">Be the first to review this product.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-[#F8F1EC] rounded-[26px] p-5">
                    <p className="text-[#D90452] font-black text-lg">{"⭐".repeat(review.rating)}</p>
                    <p className="mt-3 text-sm text-[#1E1B1B] leading-relaxed">
                      "{review.comment || review.text}"
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#F8E7EC] flex items-center justify-center font-black text-[#D90452] text-sm flex-shrink-0">
                        {(review.userName || review.user?.name || "B").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-black">{review.userName || review.user?.name || "Buyer"}</h4>
                        <p className="text-xs text-[#7A7272]">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Q&A */}
          <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-[#EEE4DF] h-fit">
            <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">Q&A</p>
            <h2 className="mt-2 text-3xl font-black">Questions</h2>
            <p className="mt-1 text-sm text-[#7A7272]">Ask the seller anything about this product.</p>

            <form onSubmit={submitQuestion} className="mt-6 flex gap-3">
              <input
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Ask about this product..."
                className="flex-1 bg-[#F8F1EC] rounded-full px-5 py-4 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={questionSubmitting}
                className="w-14 h-14 bg-[#D90452] text-white rounded-full flex items-center justify-center disabled:opacity-60"
              >
                <FiSend />
              </button>
            </form>

            <div className="mt-6 space-y-4">
              {questions.length === 0 ? (
                <div className="bg-[#F8F1EC] rounded-[24px] p-6 text-center">
                  <h3 className="font-black">No questions yet</h3>
                  <p className="text-sm text-[#7A7272] mt-1">Be the first to ask!</p>
                </div>
              ) : (
                questions.map((item) => (
                  <div key={item.id} className="bg-[#F8F1EC] rounded-[24px] p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#D90452] text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                        Q
                      </div>
                      <p className="font-black text-sm leading-snug">
                        {item.questionText || item.question || item.text}
                      </p>
                    </div>
                    {item.answerText || item.answer ? (
                      <div className="mt-3 ml-10 flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#1E1B1B] text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                          A
                        </div>
                        <p className="text-sm text-[#1E1B1B] leading-snug">{item.answerText || item.answer}</p>
                      </div>
                    ) : (
                      <p className="mt-3 ml-10 text-xs text-[#D90452] font-bold">Waiting for seller answer...</p>
                    )}
                    <p className="mt-3 text-xs text-[#9A8C87] ml-10">
                      — {item.userName || item.user?.name || item.buyerName || "Buyer"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProductDetails;