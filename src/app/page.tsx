"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  HardHat,
  Paintbrush,
  Grid3X3,
  Hammer,
  BrickWall,
  Zap,
  Wrench,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Star,
  Menu,
  X,
  CheckCircle,
  Users,
  ClipboardCheck,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui";

const SERVICES = [
  { icon: Paintbrush, title: "Painting", desc: "Interior and exterior painting for residential and commercial properties." },
  { icon: Grid3X3, title: "Tiling", desc: "Professional floor and wall tiling with precision and quality finishes." },
  { icon: Hammer, title: "Carpentry", desc: "Custom woodwork, framing, cabinetry, and structural carpentry services." },
  { icon: BrickWall, title: "Masonry", desc: "Brickwork, stonework, and concrete construction and repair." },
  { icon: Zap, title: "Electrical", desc: "Safe electrical installation, wiring, and maintenance services." },
  { icon: Wrench, title: "Plumbing", desc: "Complete plumbing solutions from installation to emergency repairs." },
];

const STEPS = [
  { step: "01", title: "Submit Request", desc: "Tell us about your project through our easy online form." },
  { step: "02", title: "Site Survey", desc: "Our team visits your site to assess requirements and scope." },
  { step: "03", title: "Get Quotation", desc: "Receive a detailed, transparent quote for your approval." },
  { step: "04", title: "Work Begins", desc: "Skilled workers are assigned and your project gets underway." },
  { step: "05", title: "Completion", desc: "Quality-checked delivery with full project documentation." },
];

const TESTIMONIALS = [
  { name: "James Richardson", role: "Property Manager", text: "Hardhat Workforce transformed our office renovation. Professional, on-time, and within budget. Highly recommended!", rating: 5 },
  { name: "Emma Thompson", role: "Homeowner", text: "The tiling work in our kitchen is absolutely stunning. The team was courteous and cleaned up perfectly after themselves.", rating: 5 },
  { name: "David Chen", role: "Business Owner", text: "We've used Hardhat for multiple commercial projects. Their project management platform makes everything transparent and easy.", rating: 5 },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dynamicTestimonials, setDynamicTestimonials] = useState<Array<{ name: string; role: string; text: string; rating: number }>>([]);

  useEffect(() => {
    fetch("/api/satisfaction-surveys?published=true")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setDynamicTestimonials(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-black/95 backdrop-blur-sm border-b border-brand-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-brand-orange rounded-lg flex items-center justify-center">
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">Hardhat Workforce</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-brand-gray-300 hover:text-white text-sm transition-colors">Services</a>
              <a href="#about" className="text-brand-gray-300 hover:text-white text-sm transition-colors">About</a>
              <a href="#how-it-works" className="text-brand-gray-300 hover:text-white text-sm transition-colors">How It Works</a>
              <a href="#contact" className="text-brand-gray-300 hover:text-white text-sm transition-colors">Contact</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login/customer">
                <Button variant="ghost" size="sm" className="text-white hover:bg-brand-gray-800">Sign In</Button>
              </Link>
              <Link href="/register/customer">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>

            <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-brand-black border-t border-brand-gray-800 px-4 py-4 space-y-3">
            <a href="#services" className="block text-brand-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}>Services</a>
            <a href="#about" className="block text-brand-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#how-it-works" className="block text-brand-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#contact" className="block text-brand-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <div className="flex gap-3 pt-2">
              <Link href="/login/customer" className="flex-1"><Button variant="outline" size="sm" className="w-full">Sign In</Button></Link>
              <Link href="/register/customer" className="flex-1"><Button size="sm" className="w-full">Get Started</Button></Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative bg-brand-black pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 via-transparent to-transparent" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-orange/20 text-brand-orange px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <HardHat className="w-4 h-4" />
                Professional Construction Services
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                Build Better with{" "}
                <span className="text-brand-orange">Hardhat Workforce</span>
              </h1>
              <p className="text-brand-gray-400 text-lg mt-6 max-w-lg">
                Your complete workforce and project management platform. From painting to plumbing, we connect skilled workers with quality projects.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link href="/register/customer">
                  <Button size="lg" className="gap-2">
                    Request a Service <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/register/worker">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-brand-black">
                    Join as Worker
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 mt-12">
                <div>
                  <p className="text-3xl font-bold text-white">500+</p>
                  <p className="text-brand-gray-400 text-sm">Projects Completed</p>
                </div>
                <div className="w-px h-12 bg-brand-gray-700" />
                <div>
                  <p className="text-3xl font-bold text-white">200+</p>
                  <p className="text-brand-gray-400 text-sm">Skilled Workers</p>
                </div>
                <div className="w-px h-12 bg-brand-gray-700" />
                <div>
                  <p className="text-3xl font-bold text-white">98%</p>
                  <p className="text-brand-gray-400 text-sm">Client Satisfaction</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-brand-gray-900 rounded-2xl p-8 border border-brand-gray-800">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Users, label: "Workforce Management", color: "bg-brand-orange" },
                    { icon: ClipboardCheck, label: "Project Tracking", color: "bg-blue-600" },
                    { icon: Truck, label: "Supplier Network", color: "bg-green-600" },
                    { icon: CheckCircle, label: "Quality Assurance", color: "bg-purple-600" },
                  ].map((item) => (
                    <div key={item.label} className="bg-brand-gray-800 rounded-xl p-5">
                      <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-white text-sm font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-gray-900">Our Services</h2>
            <p className="text-brand-gray-500 mt-3 max-w-2xl mx-auto">
              Comprehensive construction and maintenance services delivered by certified professionals.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <div key={service.title} className="group p-6 rounded-xl border border-brand-gray-200 hover:border-brand-orange hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                  <service.icon className="w-6 h-6 text-brand-orange group-hover:text-white" />
                </div>
                <h3 className="text-lg font-semibold text-brand-gray-900">{service.title}</h3>
                <p className="text-brand-gray-500 text-sm mt-2">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-brand-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-brand-gray-900">About Hardhat Workforce</h2>
              <p className="text-brand-gray-600 mt-4 leading-relaxed">
                Founded with a mission to revolutionize construction workforce management, Hardhat Workforce connects skilled tradespeople with quality projects while giving customers complete transparency throughout the process.
              </p>
              <p className="text-brand-gray-600 mt-4 leading-relaxed">
                Our platform streamlines everything from initial service requests and site surveys to material procurement, worker assignment, and project completion — all in one place.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                {["Licensed & Insured", "Quality Guaranteed", "Transparent Pricing", "24/7 Support"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0" />
                    <span className="text-sm text-brand-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-brand-black rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6">Portal Access</h3>
              <div className="space-y-3">
                {[
                  { label: "Customer Portal", href: "/login/customer", desc: "Submit requests & track projects" },
                  { label: "Worker Portal", href: "/login/worker", desc: "Find jobs & manage assignments" },
                ].map((portal) => (
                  <Link key={portal.label} href={portal.href} className="flex items-center justify-between p-4 bg-brand-gray-900 rounded-lg hover:bg-brand-gray-800 transition-colors group">
                    <div>
                      <p className="font-medium">{portal.label}</p>
                      <p className="text-brand-gray-400 text-sm">{portal.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-brand-gray-600 group-hover:text-brand-orange transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-gray-900">How It Works</h2>
            <p className="text-brand-gray-500 mt-3">From request to completion in five simple steps</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.step} className="relative text-center">
                <div className="w-14 h-14 bg-brand-orange text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-semibold text-brand-gray-900">{step.title}</h3>
                <p className="text-brand-gray-500 text-sm mt-2">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-0.5 bg-brand-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-brand-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-gray-900">What Our Clients Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {(dynamicTestimonials.length > 0 ? dynamicTestimonials : TESTIMONIALS).map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-6 border border-brand-gray-200">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-orange text-brand-orange" />
                  ))}
                </div>
                <p className="text-brand-gray-600 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 pt-4 border-t border-brand-gray-100">
                  <p className="font-semibold text-brand-gray-900 text-sm">{t.name}</p>
                  <p className="text-brand-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-brand-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold">Get In Touch</h2>
              <p className="text-brand-gray-400 mt-4">Ready to start your next project? Contact us today for a free consultation.</p>
              <div className="space-y-4 mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-orange/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-gray-400">Phone</p>
                    <p className="font-medium">+233 53 892 5316</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-orange/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-gray-400">Email</p>
                    <p className="font-medium">nfbarnes234@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-orange/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-gray-400">Address</p>
                    <p className="font-medium">Dodowa-Bawaleshie, Accra, GHANA</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-brand-gray-900 rounded-2xl p-8 border border-brand-gray-800">
              <h3 className="text-xl font-bold mb-6">Quick Registration</h3>
              <div className="space-y-3">
                <Link href="/register/customer" className="block w-full">
                  <Button className="w-full" size="lg">Register as Customer</Button>
                </Link>
                <Link href="/register/worker" className="block w-full">
                  <Button variant="outline" className="w-full border-brand-gray-600 text-white hover:bg-brand-orange hover:border-brand-orange" size="lg">
                    Register as Worker
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-gray-900 border-t border-brand-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">Hardhat Workforce</span>
          </div>
          <p className="text-brand-gray-500 text-sm">&copy; {new Date().getFullYear()} Hardhat Workforce. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
