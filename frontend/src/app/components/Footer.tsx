import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
import { useNavigate } from "react-router";

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-xl mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-8 h-8 text-indigo-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                EduPilot
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Your AI-powered companion for studying abroad. Navigate admissions, calculate ROI, and achieve your dreams.
            </p>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition">
                <Facebook className="w-4 h-4 text-white/70" />
              </button>
              <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition">
                <Twitter className="w-4 h-4 text-white/70" />
              </button>
              <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition">
                <Linkedin className="w-4 h-4 text-white/70" />
              </button>
              <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition">
                <Instagram className="w-4 h-4 text-white/70" />
              </button>
              <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition">
                <Youtube className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {[
                { label: "Features", path: "/" },
                { label: "Pricing", path: "/" },
                { label: "Universities", path: "/" },
                { label: "Scholarships", path: "/scholarships" },
                { label: "Test Prep", path: "/test-prep" },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.path)}
                    className="text-sm text-white/60 hover:text-white transition"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {[
                "About Us",
                "Careers",
                "Blog",
                "Press Kit",
                "Partners",
              ].map((item) => (
                <li key={item}>
                  <button className="text-sm text-white/60 hover:text-white transition">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-indigo-400 mt-0.5" />
                <span className="text-sm text-white/60">support@edupilot.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-indigo-400 mt-0.5" />
                <span className="text-sm text-white/60">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 mt-0.5" />
                <span className="text-sm text-white/60">
                  123 Education Street<br />
                  San Francisco, CA 94102
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            © 2026 EduPilot. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button className="text-sm text-white/50 hover:text-white transition">
              Privacy Policy
            </button>
            <button className="text-sm text-white/50 hover:text-white transition">
              Terms of Service
            </button>
            <button className="text-sm text-white/50 hover:text-white transition">
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}