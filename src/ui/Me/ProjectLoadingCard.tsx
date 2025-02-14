import { motion } from "framer-motion"

export default function ProjectLoadingCard() {
  return (
    <motion.article
      animate={{ opacity: [0.8, 1, 0.8] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="group flex flex-col gap-5 w-[250px] bg-white/75 dark:bg-black/60 border-4 border-gray-900 pb-5 hover:shadow-3xl transform transition-all ease-out overflow-hidden"
    >
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-[220px] h-[220px] bg-gray-600/70 mx-auto mt-3"
      ></motion.div>
      <div className="px-3">
        <ul className="flex gap-2 mb-3">
          <motion.li
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-gray-600/70 w-1/3 h-5"
          ></motion.li>
        </ul>
        <div>
          <motion.h2
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="h-7 w-full bg-gray-600/70 mb-3"
          ></motion.h2>
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="h-14 w-full bg-gray-600/70 py-3"
          ></motion.p>
        </div>
      </div>
    </motion.article>
  )
}
