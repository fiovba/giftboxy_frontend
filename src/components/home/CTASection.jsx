function CTASection() {
  return (
    <section className="bg-[#F5F2EF] px-5 lg:px-10 pt-10 pb-24">
      <div
        className="max-w-7xl mx-auto rounded-[36px] py-24 px-10 text-center text-white"
        style={{
          background:
            "radial-gradient(circle, rgba(217, 4, 82, 1) 0%, rgba(252, 70, 107, 1) 65%)",
        }}
      >
        <h2 className="text-4xl lg:text-6xl font-black">
          Ready to Make Someone's Day?
        </h2>

        <button className="mt-10 bg-white text-[#D90452] px-10 py-5 rounded-full font-black">
          Start Exploring Gifts →
        </button>
      </div>
    </section>
  );
}

export default CTASection;