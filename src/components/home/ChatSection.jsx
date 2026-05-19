function ChatSection() {
  return (
    <section className="bg-[#F5F2EF] px-5 lg:px-10 py-20">
      <div className="max-w-7xl mx-auto bg-[#F8E7EC] rounded-[36px] p-10 lg:p-16 grid lg:grid-cols-2 gap-14 items-center">
        
        <div>
          <h2 className="text-5xl font-black leading-tight text-[#1E1B1B]">
            Have Questions?
            <br />
            Let's Chat!
          </h2>

          <p className="mt-6 text-[#7A7272] leading-relaxed max-w-md">
            Our friendly curators and artisans are here to help you find the perfect match. Real people, real gifts.
          </p>

          <div className="flex items-center gap-3 mt-8">
            <div className="flex -space-x-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />

              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />

              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
            </div>

            <span className="text-[#D90452] text-sm font-bold">
              Active Sellers Online
            </span>
          </div>

          <button className="mt-8 bg-[#D90452] text-white px-8 py-4 rounded-full font-bold">
            Open Chat
          </button>
        </div>

        <div className="bg-[#FFF7F8] rounded-[24px] p-6 max-w-[420px] mx-auto shadow-sm">
          
          <div className="bg-white rounded-2xl p-4 text-sm text-[#8B7C77] max-w-[260px]">
            “Hi! I’m looking for a unique 5th anniversary gift.”
          </div>

          <div className="bg-[#D90452] text-white rounded-2xl p-4 text-sm max-w-[290px] ml-auto mt-5">
            “I’d recommend our personalized wooden art collection! 🌸”
          </div>

          <div className="bg-white rounded-2xl p-4 text-sm text-[#8B7C77] max-w-[260px] mt-5">
            “That looks perfect! Can I customize the engraving?”
          </div>
        </div>
      </div>
    </section>
  );
}

export default ChatSection;