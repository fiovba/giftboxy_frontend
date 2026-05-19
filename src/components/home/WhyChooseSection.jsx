import {
  FiEdit3,
  FiBriefcase,
  FiSettings,
  FiTruck,
  FiHeadphones,
} from "react-icons/fi";

const features = [
  {
    icon: <FiEdit3 />,
    title: "Personalized",
    text: "Made just for your loved ones.",
  },
  {
    icon: <FiBriefcase />,
    title: "Local Creators",
    text: "Supporting global artisans.",
  },
  {
    icon: <FiSettings />,
    title: "Secure Payments",
    text: "Safe and encrypted checkout.",
  },
  {
    icon: <FiTruck />,
    title: "Fast & Reliable",
    text: "Delivery when you need it.",
  },
  {
    icon: <FiHeadphones />,
    title: "24/7 Support",
    text: "Always here to help you.",
  },
];

function WhyChooseSection() {
  return (
    <section className="bg-[#EDE6E2] px-5 lg:px-10 py-20">
      <div className="max-w-7xl mx-auto">
        
        <h2 className="text-center text-4xl font-black text-[#1E1B1B]">
          Why Choose GiftBoxy?
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mt-16">
          {features.map((item) => (
            <div key={item.title} className="text-center">
              
              <div className="w-20 h-20 rounded-2xl bg-white shadow-sm mx-auto flex items-center justify-center text-[#D90452] text-2xl">
                {item.icon}
              </div>

              <h3 className="mt-5 text-xl font-black text-[#1E1B1B]">
                {item.title}
              </h3>

              <p className="mt-2 text-m leading-relaxed text-[#8B7C77]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseSection;