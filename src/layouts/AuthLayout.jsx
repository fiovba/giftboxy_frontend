import { motion } from "framer-motion";

function AuthLayout({ side, children }) {
  return (
    <div className="min-h-screen bg-[#F7F3F1] flex items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="w-full max-w-[1180px] bg-white rounded-[34px] overflow-hidden grid lg:grid-cols-[0.42fr_0.58fr] shadow-sm border border-[#EEE4DF]"
      >
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="hidden lg:block"
        >
          {side}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-8 lg:p-14"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default AuthLayout;