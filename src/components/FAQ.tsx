import { motion } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Do you offer Cash on Delivery (COD)?",
    answer: "Yes, we offer Cash on Delivery for most pincodes in India. A standard delivery charge of ₹50 applies for COD orders.",
  },
  {
    question: "What is your return policy?",
    answer: "Returns/replacements are ONLY accepted if you provide a continuous, unedited video of you opening the product package showing the damage. Requests must be raised within 7 days of delivery.",
  },
  {
    question: "What material are the tees made of?",
    answer: "Our tees are crafted from premium 240+ GSM 100% combed cotton, featuring a heavy-weight feel that's durable yet breathable.",
  },
  {
    question: "How do I track my order?",
    answer: "Once your order is shipped, you will receive a tracking link via email and WhatsApp. You can also track it through the 'My Orders' section if you have an account.",
  },
  {
    question: "How do I find my size?",
    answer: "Check our size guide (linked in the footer and product pages). Our tees have an oversized fit; for a more regular look, we recommend sizing down.",
  },
  {
    question: "Can I change my delivery address after placing an order?",
    answer: "Address changes are possible only before the order is shipped. Please contact us immediately via WhatsApp or Email if you need to update your details.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleChatWithUs = () => {
    window.dispatchEvent(new CustomEvent('openContactPopup'));
  };

  return (
    <section id="contact" className="section-padding bg-secondary/10">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-caption mb-4">NEED HELP?</p>
          <h2 className="text-headline">Frequently Asked Questions</h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="font-display font-semibold text-lg">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${openIndex === index ? "rotate-180" : ""
                    }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                className="overflow-hidden"
              >
                <p className="text-body pt-4">{faq.answer}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Chat Bubble */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-body mb-4">Still have questions?</p>
          <button
            onClick={handleChatWithUs}
            className="glass-btn inline-flex items-center gap-2"
          >
            <MessageCircle size={18} />
            Chat with Us
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
