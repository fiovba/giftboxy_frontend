import { FiInstagram, FiFacebook, FiTwitter, FiMail } from "react-icons/fi";
import logo from "../../assets/images/logo.png";

function Footer() {
  return (
    <footer className="bg-[##F9F2ED] text-white px-5 lg:px-10 pt-16 pb-8 ">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10">
          
          <div>
            <img src={logo} alt="GiftBoxy" className="h-12 w-auto mb-5" />

            <p className="text-[#B8AEB1] text-sm leading-relaxed">
              Thoughtful gifts for every occasion. Discover handmade,
              personalized and meaningful presents.
            </p>

            <div className="flex gap-3 mt-6">
              <span className="w-10 h-10 rounded-full bg-[#D90452] flex items-center justify-center">
                <FiInstagram />
              </span>

              <span className="w-10 h-10 rounded-full bg-[#D90452] flex items-center justify-center">
                <FiFacebook />
              </span>

              <span className="w-10 h-10 rounded-full bg-[#D90452] flex items-center justify-center">
                <FiTwitter />
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-black text-lg mb-5">Shop</h3>
            <ul className="space-y-3 text-sm text-[#B8AEB1]">
              <li>All Gifts</li>
              <li>For Her</li>
              <li>For Him</li>
              <li>Personalized</li>
              <li>Gift Boxes</li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-lg mb-5">Company</h3>
            <ul className="space-y-3 text-sm text-[#B8AEB1]">
              <li>About Us</li>
              <li>Become a Seller</li>
              <li>Contact</li>
              <li>FAQ</li>
              <li>Support</li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-lg mb-5">Newsletter</h3>

            <p className="text-[#B8AEB1] text-sm mb-5">
              Get gift ideas and special offers directly in your inbox.
            </p>

            <div className="bg-white rounded-full p-1 flex items-center">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 text-sm text-black outline-none rounded-full"
              />

              <button className="w-11 h-11 rounded-full bg-[#D90452] text-white flex items-center justify-center">
                <FiMail />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between gap-4 text-sm text-[#B8AEB1]">
          <p>© 2026 GiftBoxy. All rights reserved.</p>

          <div className="flex gap-5">
            <span>Privacy Policy</span>
            <span>Terms</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;