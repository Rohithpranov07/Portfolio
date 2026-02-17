import { motion, useScroll, useTransform } from "framer-motion";
import { Github, Mail, Linkedin, Twitter } from "lucide-react";
import { useRef } from "react";
import { ScrollReveal } from "./ScrollAnimations";

const links = [
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Mail, label: "Email", href: "mailto:hello@example.com" },
];

const ContactSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.85, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [12, 0]);

  return (
    <section id="contact" ref={ref} className="relative py-32 overflow-hidden">
      <motion.div
        style={{ scale, rotateX, perspective: "1200px" }}
        className="relative z-10 max-w-2xl mx-auto px-6 text-center"
      >
        <ScrollReveal>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Let's <span className="text-gradient-green">Connect</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Always open to interesting conversations and collaboration opportunities.
          </p>
        </ScrollReveal>

        <div className="flex justify-center gap-4">
          {links.map(({ icon: Icon, label, href }, i) => (
            <motion.a
              key={label}
              href={href}
              initial={{ opacity: 0, y: 30, rotateY: -20 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
              whileHover={{ y: -8, scale: 1.1, rotateY: 10 }}
              className="flex flex-col items-center gap-2 p-5 rounded-xl bg-secondary/50 border-glow hover:bg-secondary transition-all group"
              style={{ perspective: "600px" }}
            >
              <Icon className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-mono text-muted-foreground">{label}</span>
            </motion.a>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 font-mono text-sm text-muted-foreground"
        >
          <span className="text-primary">$</span> echo "Built with ❤️ and lots of commits"
        </motion.p>
      </motion.div>
    </section>
  );
};

export default ContactSection;
