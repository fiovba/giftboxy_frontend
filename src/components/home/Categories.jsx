const categories = [
  "Birthday",
  "Wedding",
  "Anniversary",
  "Valentine",
  "Baby Shower",
  "Graduation",
];

function Categories() {
  return (
    <section className="px-6 py-16">
      <div className="max-w-7xl mx-auto">
        
        <h2 className="text-3xl font-bold mb-10">
          Shop By Occasion
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition cursor-pointer text-center"
            >
              <h3 className="font-semibold text-gray-700">
                {item}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;