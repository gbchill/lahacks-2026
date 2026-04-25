import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

export function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="max-w-lg"
      >
        <h1 className="font-heading text-6xl sm:text-7xl text-foreground leading-[1.05]">
          Orision
        </h1>
        <p className="text-muted-foreground text-sm mt-3 tracking-wide">
          for the families who never had a translator at home
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease }}
        className="text-xl sm:text-2xl text-foreground leading-relaxed max-w-md mt-10"
      >
        Photograph any letter.
        <br />
        Hear it explained in your language.
        <br />
        <span className="text-muted-foreground">In a voice you trust.</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease }}
        className="mt-12"
      >
        <Link
          to="/capture"
          className="inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Try it
          <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6, ease }}
        className="text-sm text-muted-foreground/70 mt-auto pt-20 pb-8 max-w-sm leading-relaxed"
      >
        25 million people in the U.S. live in homes where no adult speaks English well.
      </motion.p>
    </div>
  );
}
