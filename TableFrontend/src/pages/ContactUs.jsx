import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
} from "lucide-react";
import { motion as Motion } from "framer-motion";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 800);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] font-body text-[#0f0e0b] selection:bg-[#e8720c] selection:text-white">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 w-full p-4 sm:p-6 z-50 flex items-center justify-between pointer-events-none">
        <Link
          to="/"
          className="pointer-events-auto flex items-center gap-2 text-sm font-semibold text-[#857c6e] hover:text-[#0f0e0b] bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm transition-colors border border-[#e0d9ce]"
        >
          <ArrowLeft size={18} /> Back to Home
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* ── Left Side: Contact Info ── */}
        <Motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fef0e4] border border-[#e8720c]/20 text-[#e8720c] text-sm font-bold tracking-wide uppercase mb-6">
            <MessageCircle size={16} /> Get in touch
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0f0e0b] leading-[1.1] mb-6 tracking-tight">
            Let's chat about your restaurant.
          </h1>
          <p className="text-[#857c6e] text-lg mb-12 max-w-lg leading-relaxed">
            Whether you have a question about features, pricing, or need a
            custom enterprise plan, our team is ready to answer all your
            questions.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-[#e0d9ce] flex items-center justify-center text-[#e8720c] flex-shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#0f0e0b] text-lg">Email Us</h3>
                <p className="text-[#857c6e] mb-1">
                  Our friendly team is here to help.
                </p>
                <a
                  href="mailto:hello@buzingbee.com"
                  className="font-semibold text-saffron hover:underline"
                >
                  hello@buzingbee.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-[#e0d9ce] flex items-center justify-center text-[#e8720c] flex-shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#0f0e0b] text-lg">Visit Us</h3>
                <p className="text-[#857c6e] mb-1">
                  Come say hello at our office HQ.
                </p>
                <p className="font-medium text-[#2a2720]">
                  100 Tech Park, Building A<br />
                  Koramangala, Bangalore 560034
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-[#e0d9ce] flex items-center justify-center text-[#e8720c] flex-shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#0f0e0b] text-lg">Call Us</h3>
                <p className="text-[#857c6e] mb-1">Mon-Fri from 9am to 6pm.</p>
                <a
                  href="tel:+919876543210"
                  className="font-semibold text-[#e8720c] hover:underline"
                >
                  +91 98765 43210
                </a>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* ── Right Side: Contact Form ── */}
        <Motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgba(15,14,11,0.06)] border border-[#e0d9ce] relative overflow-hidden"
        >
          {isSubmitted ? (
            <Motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center h-full"
            >
              <div className="w-20 h-20 bg-[#e8f2eb] text-[#3a6348] rounded-full flex items-center justify-center mb-6 shadow-[0_4px_30px_rgba(58,99,72,0.2)]">
                <MessageCircle size={40} />
              </div>
              <h2 className="text-3xl font-display font-bold text-[#0f0e0b] mb-4">
                Message Sent!
              </h2>
              <p className="text-[#857c6e] text-lg leading-relaxed max-w-sm">
                Thanks for reaching out! We've received your message and will
                get back to you within 24 hours.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-8 px-6 py-3 bg-[#faf7f2] hover:bg-[#f0ebe0] text-[#0f0e0b] font-bold rounded-xl transition-colors"
              >
                Send another message
              </button>
            </Motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 relative relative z-10"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-bold text-[#2a2720] mb-2"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-xl focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] transition-all text-[#0f0e0b]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-[#2a2720] mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="w-full px-4 py-3.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-xl focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] transition-all text-[#0f0e0b]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-bold text-[#2a2720] mb-2"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  required
                  className="w-full px-4 py-3.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-xl focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] transition-all text-[#0f0e0b]"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-bold text-[#2a2720] mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us a little about your project..."
                  required
                  rows={4}
                  className="w-full px-4 py-3.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-xl focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] transition-all text-[#0f0e0b] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#e8720c] hover:bg-[#d4620a] text-white text-base font-bold rounded-xl shadow-[0_4px_20px_rgba(232,114,12,0.3)] transition-colors mt-2"
              >
                Send Message <Send size={18} />
              </button>
            </form>
          )}
        </Motion.div>
      </div>
    </div>
  );
}
