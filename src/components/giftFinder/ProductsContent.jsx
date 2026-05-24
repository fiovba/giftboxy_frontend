import { Link } from "react-router-dom";
import ExploreProductCard from "../explore/ExploreProductCard";

function ProductsContent({ products, relatedProducts, productsLoading, lastParams, aiCard }) {
  if (productsLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="w-12 h-12 border-4 border-[#D90452] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-[#A0918B] text-sm">Finding perfect gifts...</p>
      </div>
    );
  }

  if (!lastParams) return null;

  return (
    <div className="p-4 sm:p-6">
      {aiCard && <GiftiePickBanner aiCard={aiCard} />}
      <FilterTags lastParams={lastParams} />

      {products.length === 0 ? (
        <EmptyState lastParams={lastParams} />
      ) : (
        <ProductResults
          products={products}
          relatedProducts={relatedProducts}
          lastParams={lastParams}
        />
      )}
    </div>
  );
}

function GiftiePickBanner({ aiCard }) {
  return (
    <div className="bg-gradient-to-r from-[#FFF0F5] to-[#FDF8F6] rounded-2xl border border-[#F5D8E4] px-4 py-3 mb-5 flex items-start gap-3 anim-scale-in">
      <span className="text-lg flex-shrink-0">✨</span>
      <div>
        <p className="text-[10px] font-black text-[#D90452] uppercase tracking-wider mb-1">
          Giftie's pick
        </p>
        <p className="text-sm text-[#1E1B1B] leading-relaxed">{aiCard}</p>
      </div>
    </div>
  );
}

function FilterTags({ lastParams }) {
  const tags = [
    lastParams.recipient,
    lastParams.occasion,
    lastParams.interest,
    lastParams.maxBudget < 99999 ? `Under $${lastParams.maxBudget}` : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="bg-white border border-[#EFE4DF] text-[#5A4848] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function ProductResults({ products, relatedProducts, lastParams }) {
  return (
    <>
      <p className="text-[10px] font-black text-[#D90452] uppercase tracking-widest mb-4">
        {products.length} gift{products.length !== 1 ? "s" : ""} found
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="anim-fade-up">
            <ExploreProductCard product={product} />
          </div>
        ))}
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-8">
          <p className="text-[10px] font-black text-[#A0918B] uppercase tracking-widest mb-4">
            ✨ You might also like
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {relatedProducts.map((product) => (
              <div key={product.id} className="anim-fade-up opacity-90">
                <ExploreProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3 flex-wrap">
        <Link
          to={`/gift-results?recipient=${lastParams.recipient}&occasion=${lastParams.occasion}&interest=${lastParams.interest}`}
          className="bg-[#D90452] text-white px-6 py-3 rounded-full font-black text-sm btn-press shadow-sm"
        >
          See Full Results →
        </Link>
        <Link
          to="/explore"
          className="bg-white border border-[#EFE4DF] text-[#1E1B1B] px-6 py-3 rounded-full font-black text-sm btn-press shadow-sm"
        >
          Browse All Gifts
        </Link>
      </div>
    </>
  );
}

function EmptyState({ lastParams }) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center border border-[#EFE4DF]">
      <div className="text-4xl mb-3">🎁</div>
      <p className="font-black text-[#1E1B1B] text-lg">No exact matches found</p>
      <p className="text-sm text-[#A0918B] mt-2 max-w-xs mx-auto leading-relaxed">
        Our server is warming up or no products match this combination yet.
      </p>
      <div className="mt-5 flex gap-3 justify-center flex-wrap">
        <Link
          to={`/explore?category=${lastParams?.interest || ""}`}
          className="bg-[#D90452] text-white px-5 py-2.5 rounded-full font-black text-sm btn-press"
        >
          Browse {lastParams?.interest || "Gifts"} →
        </Link>
        <Link
          to="/explore"
          className="bg-[#F8F1EC] text-[#1E1B1B] px-5 py-2.5 rounded-full font-black text-sm btn-press"
        >
          All Gifts
        </Link>
      </div>
    </div>
  );
}

export default ProductsContent;
