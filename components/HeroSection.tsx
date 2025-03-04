import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div
      className="relative h-[500px] md:h-[600px] text-white flex items-center justify-center"
      style={{
        backgroundImage: "url('/20943526.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60"></div>

      {/* Content Section */}
      <div className="container mx-auto px-6 text-center relative z-10 ">
        <motion.h1
          className="text-3xl md:text-5xl font-bold mb-6 leading-20  block"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="p-2 bg-white text-black rounded-xl shadow-md">
            Learn.
          </span>{" "}
          <span className="p-2 bg-white text-black rounded-xl shadow-md">
            Collaborate.
          </span>{" "}
          <span className="p-2 bg-white text-black rounded-xl shadow-md">
            Grow.
          </span>
        </motion.h1>

        <motion.p
          className="text-sm md:text-xl font-medium mt-10 block leading-12 text-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
        >
          Connect with developers,{" "}
          <span className="p-2 bg-white text-black rounded-full shadow-lg">
            join hands-on projects, and improve your skills with the community.
          </span>
        </motion.p>
      </div>
    </div>
  );
}
