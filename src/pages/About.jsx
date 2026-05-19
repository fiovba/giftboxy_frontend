import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiMapPin,
  FiPhone,
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiChevronDown,
  FiSend,
} from "react-icons/fi";

const FAQS = [
  {
    q: "How does GiftBoxy work?",
    a: "Browse our curated marketplace, use the Gift Finder to get personalized recommendations, add to cart and checkout. It's that simple!",
  },
  {
    q: "How do I become a seller?",
    a: "Click 'Become a Seller', fill out your shop profile and start listing your handmade or curated products within minutes.",
  },
  {
    q: "Is my payment information secure?",
    a: "Absolutely. We use industry-standard encryption and never store your card details on our servers.",
  },
  {
    q: "Can I return or exchange a gift?",
    a: "Yes. Each seller has their own return policy listed on their profile. Contact the seller directly for returns or exchanges.",
  },
  {
    q: "How long does delivery take?",
    a: "Delivery times vary by seller and location, typically 3-7 business days. Estimated delivery is shown at checkout.",
  },
  {
    q: "Do you ship internationally?",
    a: "Many of our sellers ship worldwide. Filter by Ships Internationally on the Explore page to find them.",
  },
];

function About() {
  const [openFaq, setOpenFaq] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [sent, setSent] = useState(false);

  const handleChange = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F2EF]">
      {/* Hero */}
      <section className="bg-[#1E1B1B] px-5 lg:px-10 py-20 lg:py-28">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#D90452] text-xs font-black uppercase tracking-[0.3em]">
            About & Contact
          </p>

          <h1 className="mt-4 text-5xl lg:text-7xl font-black leading-tight text-white">
            We are Here
            <br />
            <span className="text-[#D90452]">For You.</span>
          </h1>

          <p className="mt-6 text-[#A89E9E] text-lg leading-relaxed max-w-2xl mx-auto">
            GiftBoxy was built on one idea — every gift should feel personal.
            Have a question, idea, or just want to say hi? We would love to hear
            from you.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="px-5 lg:px-10 py-16 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#D90452] text-xs font-black uppercase tracking-[0.3em]">
              Who We Are
            </p>

            <h2 className="mt-4 text-4xl font-black text-[#1E1B1B] leading-tight">
              A marketplace built
              <br />
              on meaningful gifting.
            </h2>

            <p className="mt-5 text-[#6F6767] leading-relaxed">
              GiftBoxy connects independent sellers with buyers who care about
              thoughtful, personal gifts. From handmade jewelry to custom
              portraits — every product on our platform has a story behind it.
            </p>

            <p className="mt-4 text-[#6F6767] leading-relaxed">
              We are a small team with a big mission: make gifting less
              stressful, more personal, and more joyful for everyone involved.
            </p>

            <div className="flex gap-4 mt-8">
              <Link
                to="/explore"
                className="bg-[#D90452] text-white px-7 py-4 rounded-full font-black"
              >
                Browse Gifts
              </Link>

              <Link
                to="/register-seller"
                className="bg-[#F8E7EC] text-[#D90452] px-7 py-4 rounded-full font-black"
              >
                Become a Seller
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { number: "10K+", label: "Happy Buyers" },
              { number: "500+", label: "Sellers" },
              { number: "25K+", label: "Products" },
              { number: "98%", label: "Satisfaction" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-[#F8F1EC] rounded-[24px] p-8 text-center border border-[#EFE4DF]"
              >
                <p className="text-4xl font-black text-[#D90452]">
                  {s.number}
                </p>

                <p className="mt-2 text-[#7A7272] font-bold text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact + Info */}
      <section className="px-5 lg:px-10 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_420px] gap-10">
          {/* Contact Form */}
          <div className="bg-white rounded-[30px] p-8 border border-[#EFE4DF]">
            <p className="text-[#D90452] text-xs font-black uppercase tracking-[0.3em]">
              Get In Touch
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Send Us a Message
            </h2>

            <p className="mt-2 text-[#7A7272]">
              We typically respond within 24 hours.
            </p>

            {sent ? (
              <div className="mt-8 bg-[#F8E7EC] rounded-[20px] p-8 text-center">
                <div className="text-5xl mb-3">🎉</div>

                <h3 className="text-2xl font-black text-[#D90452]">
                  Message Sent!
                </h3>

                <p className="mt-2 text-[#7A7272]">
                  Thanks for reaching out. We will get back to you soon.
                </p>

                <button
                  onClick={() => {
                    setSent(false);

                    setForm({
                      name: "",
                      email: "",
                      subject: "",
                      message: "",
                    });
                  }}
                  className="mt-5 bg-[#D90452] text-white px-6 py-3 rounded-full font-black"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Your Name">
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Jane Doe"
                      className="field"
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="jane@example.com"
                      className="field"
                    />
                  </Field>
                </div>

                <Field label="Subject">
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    placeholder="How can we help?"
                    className="field"
                  />
                </Field>

                <Field label="Message">
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us more..."
                    className="field h-[140px] resize-none"
                  />
                </Field>

                <button
                  type="submit"
                  className="w-full bg-[#D90452] text-white py-4 rounded-full font-black flex items-center justify-center gap-2"
                >
                  <FiSend />
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <div className="bg-white rounded-[30px] p-8 border border-[#EFE4DF]">
              <h3 className="text-xl font-black">Contact Info</h3>

              <div className="mt-5 space-y-4">
                <InfoRow
                  icon={<FiMail />}
                  label="Email"
                  value="hello@giftboxy.com"
                />

                <InfoRow
                  icon={<FiPhone />}
                  label="Phone"
                  value="+994 50 000 00 00"
                />

                <InfoRow
                  icon={<FiMapPin />}
                  label="Location"
                  value="Baku, Azerbaijan"
                />
              </div>
            </div>

            {/* Socials */}
            <div className="bg-white rounded-[30px] p-8 border border-[#EFE4DF]">
              <h3 className="text-xl font-black">Follow Us</h3>

              <div className="flex gap-3 mt-4">
                {[
                  {
                    icon: <FiInstagram size={20} />,
                    label: "Instagram",
                    href: "#",
                  },
                  {
                    icon: <FiTwitter size={20} />,
                    label: "Twitter",
                    href: "#",
                  },
                  {
                    icon: <FiFacebook size={20} />,
                    label: "Facebook",
                    href: "#",
                  },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="w-12 h-12 bg-[#F8E7EC] text-[#D90452] rounded-full flex items-center justify-center hover:bg-[#D90452] hover:text-white transition-all duration-300 hover:scale-110"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-[#1E1B1B] rounded-[30px] p-8">
              <h3 className="text-xl font-black text-white">
                Business Hours
              </h3>

              <div className="mt-4 space-y-2">
                {[
                  {
                    day: "Monday - Friday",
                    hours: "9:00 AM - 6:00 PM",
                  },
                  {
                    day: "Saturday",
                    hours: "10:00 AM - 4:00 PM",
                  },
                  {
                    day: "Sunday",
                    hours: "Closed",
                  },
                ].map((b) => (
                  <div
                    key={b.day}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-[#A89E9E]">{b.day}</span>

                    <span className="text-white font-bold">
                      {b.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Location */}
      <section className="px-5 lg:px-10 py-16 bg-[#F8F1EC]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[420px_1fr] gap-10 items-center">
          <div>
            <p className="text-[#D90452] text-xs font-black uppercase tracking-[0.3em]">
              Our Location
            </p>

            <h2 className="mt-4 text-4xl font-black text-[#1E1B1B] leading-tight">
              Visit Our
              <br />
              Main Office.
            </h2>

            <p className="mt-5 text-[#6F6767] leading-relaxed">
              Our central office is located in Baku, Azerbaijan.
              You can contact us online or visit us during business hours.
            </p>

            <div className="mt-6 bg-white rounded-[24px] p-6 border border-[#EFE4DF]">
              <InfoRow
                icon={<FiMapPin />}
                label="Main Office"
                value="Baku, Azerbaijan"
              />
            </div>
          </div>

          <div className="rounded-[32px] overflow-hidden border border-[#EFE4DF] shadow-sm h-[380px] bg-white">
            <iframe
              title="GiftBoxy Main Office Location"
              src="https://www.google.com/maps?q=Baku,Azerbaijan&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 lg:px-10 py-16 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-[#D90452] text-xs font-black uppercase tracking-[0.3em]">
              FAQ
            </p>

            <h2 className="mt-4 text-4xl font-black">
              Frequently Asked Questions
            </h2>

            <p className="mt-3 text-[#7A7272]">
              Cannot find your answer? Send us a message above.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-[#F8F1EC] rounded-[20px] border border-[#EFE4DF] overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() =>
                    setOpenFaq(openFaq === i ? null : i)
                  }
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-black text-[#1E1B1B]">
                    {faq.q}
                  </span>

                  <FiChevronDown
                    className={`shrink-0 text-[#D90452] transition-all duration-500 ease-in-out ${
                      openFaq === i
                        ? "rotate-180 scale-110"
                        : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    openFaq === i
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-5 text-[#6F6767] leading-relaxed">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 lg:px-10 py-20">
        <div className="max-w-4xl mx-auto bg-[#D90452] rounded-[32px] p-10 lg:p-16 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
            Ready to find the perfect gift?
          </h2>

          <p className="mt-4 text-pink-100 max-w-lg mx-auto">
            Join thousands of happy gifters who discovered something truly
            special on GiftBoxy.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link
              to="/gift-finder"
              className="bg-white text-[#D90452] px-8 py-4 rounded-full font-black"
            >
              Try Gift Finder
            </Link>

            <Link
              to="/register-seller"
              className="bg-[#1E1B1B] text-white px-8 py-4 rounded-full font-black"
            >
              Become a Seller
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6262] block mb-1">
        {label}
      </label>

      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-[#F8E7EC] text-[#D90452] rounded-full flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div>
        <p className="text-xs text-[#7A7272] font-bold uppercase tracking-widest">
          {label}
        </p>

        <p className="font-black text-[#1E1B1B]">
          {value}
        </p>
      </div>
    </div>
  );
}

export default About;