import ProductCard from "./ProductCard";

const products = [
  {
    id: 1,
    name: "Luxury Gift Box",
    price: 45,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48",
  },
  {
    id: 2,
    name: "Birthday Surprise Box",
    price: 35,
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f",
  },
  {
    id: 3,
    name: "Romantic Gift Set",
    price: 55,
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a",
  },
];

function FeaturedProducts() {
  return (
    <section className="px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-10">Featured Gifts</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;