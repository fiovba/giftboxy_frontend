import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { giftFinder } from "../services/productService";
import ExploreProductCard from "../components/explore/ExploreProductCard";
import { normalizeProductList } from "../utils/productUtils";

function GiftResults() {
  const [searchParams] = useSearchParams();

  const recipient = searchParams.get("recipient") || "";
  const occasion = searchParams.get("occasion") || "";
  const interest = searchParams.get("interest") || "";
  const budget = searchParams.get("budget") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const getBudgetRange = () => {
    if (!budget) {
      return {
        minBudget: 0,
        maxBudget: 99999,
      };
    }

    const budgets = budget.split(",").map((b) => b.trim());

    let minBudget = 999999;
    let maxBudget = 0;

    budgets.forEach((b) => {
      if (b === "$0 - $25") {
        minBudget = Math.min(minBudget, 0);
        maxBudget = Math.max(maxBudget, 25);
      }

      if (b === "$25 - $50") {
        minBudget = Math.min(minBudget, 25);
        maxBudget = Math.max(maxBudget, 50);
      }

      if (b === "$50 - $100") {
        minBudget = Math.min(minBudget, 50);
        maxBudget = Math.max(maxBudget, 100);
      }

      if (b === "$100+") {
        minBudget = Math.min(minBudget, 100);
        maxBudget = Math.max(maxBudget, 99999);
      }
    });

    return {
      minBudget: minBudget === 999999 ? 0 : minBudget,
      maxBudget: maxBudget || 99999,
    };
  };

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);

      const cleanInterest = interest
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x && x !== "Surprise Me")[0];

      const budgetRange = getBudgetRange();

      const payload = {
        recipient: recipient || "Partner",
        occasion: occasion || "Birthday",
        interest: cleanInterest || "Jewelry",
        minBudget: budgetRange.minBudget,
        maxBudget: budgetRange.maxBudget,
      };

      console.log("GIFT FINDER PAYLOAD:", payload);

      try {
        const res = await giftFinder(payload);

        console.log("GIFT FINDER RESPONSE:", res.data);

        const normalized = normalizeProductList(res.data);
        setResults(normalized);
      } catch (err) {
        console.log("GIFT FINDER ERROR:", err.response?.data || err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [recipient, occasion, interest, budget]);

  const bestMatch = results[0];
  const otherResults = results.slice(1);

  return (
    <div className="min-h-screen bg-[#F5F2EF] pb-24">
      <section className="bg-[#F8E7EC] px-4 lg:px-10 py-10">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#D90452] text-xs font-black uppercase tracking-[0.3em]">
            Personalized Gift Results
          </p>

          <h1 className="mt-5 text-3xl lg:text-6xl font-black leading-tight text-[#1E1B1B]">
            We Found Gifts
            <br />
            Perfect For Your
            <span className="text-[#D90452]"> {recipient || "Loved One"}</span> 🎁
          </h1>

          <p className="mt-4 text-[#6F6767] text-base lg:text-lg max-w-2xl leading-relaxed">
            Based on your preferences, we curated thoughtful gift ideas matching
            the occasion, interests, and budget you selected.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            {[recipient, occasion, interest, budget].filter(Boolean).map((item) => (
              <div
                key={item}
                className="bg-white px-5 py-2.5 rounded-full text-sm font-bold"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-8">
            <Link
              to={`/gift-finder?recipient=${recipient}&occasion=${occasion}&interest=${interest}&budget=${budget}`}
              className="bg-[#1E1B1B] text-white px-6 py-3.5 rounded-full font-black text-sm"
            >
              ← Refine Search
            </Link>

            <Link
              to="/explore"
              className="bg-white text-[#1E1B1B] px-6 py-3.5 rounded-full font-black text-sm"
            >
              Browse All
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 lg:px-10 mt-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-[#D90452] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 font-black text-[#7A7272]">
              Finding perfect gifts...
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-[30px] p-10 text-center">
            <div className="text-5xl mb-4">🎁</div>
            <h2 className="text-2xl font-black">No gifts found</h2>
            <p className="text-[#7A7272] mt-2">
              Try adjusting your preferences.
            </p>

            <Link
              to="/gift-finder"
              className="inline-block mt-6 bg-[#D90452] text-white px-7 py-4 rounded-full font-black"
            >
              Try Again
            </Link>
          </div>
        ) : (
          <>
            {bestMatch && (
              <div className="mb-10">
                <p className="text-[#D90452] text-xs font-black uppercase tracking-widest mb-4">
                  Best Match
                </p>

                <div className="max-w-sm">
                  <ExploreProductCard product={bestMatch} />
                </div>
              </div>
            )}

            {otherResults.length > 0 && (
              <>
                <p className="text-[#D90452] text-xs font-black uppercase tracking-widest mb-4">
                  Other Great Options
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {otherResults.map((product) => (
                    <ExploreProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default GiftResults;