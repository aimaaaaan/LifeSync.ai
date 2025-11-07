'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Phone, Mail, MapPin, Star, Users, Shield, Activity, Heart, Dna, Clock, Package, MessageCircle } from 'lucide-react';
import AuthButton from '@/components/auth-button';
import { TrackOrderNav } from '@/components/track-order-nav';
import { NotificationButton } from '@/components/notification-button';
import { PopupNotification } from '@/components/popup-notification';
import { useOrderNotifications } from '@/hooks/use-order-notifications';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    reason: ''
  });

  // Listen to order notifications
  useOrderNotifications();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Popup Notification */}
      <PopupNotification />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Dna className="h-8 w-8 text-blue-600" suppressHydrationWarning />
              <span className="text-xl font-bold text-gray-900">LifeCare.ai</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About Us</a>
              <a href="#product" className="text-gray-700 hover:text-blue-600 transition-colors">The Product</a>
              <a href="#reporting" className="text-gray-700 hover:text-blue-600 transition-colors">Reporting</a>
              <a href="#blog" className="text-gray-700 hover:text-blue-600 transition-colors">Blog</a>
              <TrackOrderNav />
              <NotificationButton />
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
                <a href="/order">Register Kit</a>
              </Button>
              <AuthButton />
            </nav>
            <Button className="md:hidden" variant="ghost" size="sm">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-600 text-white">Crafted for the uncompromising minds</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Your at-home genetic test for a healthier future
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                You are at the right place if you:
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" suppressHydrationWarning />
                  <span className="text-gray-700">Have family history of diseases</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" suppressHydrationWarning />
                  <span className="text-gray-700">Are starting a new family</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" suppressHydrationWarning />
                  <span className="text-gray-700">Have unresolved health conditions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" suppressHydrationWarning />
                  <span className="text-gray-700">Want to proactively preserve your health</span>
                </div>
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3" asChild>
                <a href="/order">Order Now</a>
              </Button>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 bg-white/90 backdrop-blur hover-lift fade-in">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">6000+</div>
                    <div className="text-sm text-gray-600">Genetic Diseases</div>
                  </div>
                </Card>
                <Card className="p-6 bg-white/90 backdrop-blur hover-lift fade-in" style={{animationDelay: '0.1s'}}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">100</div>
                    <div className="text-sm text-gray-600">Hereditary Cancers</div>
                  </div>
                </Card>
                <Card className="p-6 bg-white/90 backdrop-blur hover-lift fade-in" style={{animationDelay: '0.2s'}}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">105</div>
                    <div className="text-sm text-gray-600">Heart Diseases</div>
                  </div>
                </Card>
                <Card className="p-6 bg-white/90 backdrop-blur hover-lift fade-in" style={{animationDelay: '0.3s'}}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">300+</div>
                    <div className="text-sm text-gray-600">Drug Responses</div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center slide-up">
              <Shield className="h-12 w-12 text-blue-600 mb-4" suppressHydrationWarning />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">World's Highest Disease Coverage</h3>
              <p className="text-gray-600">Comprehensive screening for 6000+ genetic conditions</p>
            </div>
            <div className="flex flex-col items-center slide-up" style={{animationDelay: '0.1s'}}>
              <Users className="h-12 w-12 text-green-600 mb-4" suppressHydrationWarning />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Accurate Across Diverse Ethnicities</h3>
              <p className="text-gray-600">Validated across diverse populations</p>
            </div>
            <div className="flex flex-col items-center slide-up" style={{animationDelay: '0.2s'}}>
              <Activity className="h-12 w-12 text-purple-600 mb-4" suppressHydrationWarning />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Clinical-Grade DNA Reports</h3>
              <p className="text-gray-600">Professional medical-grade accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Genetic Testing Matters */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why genetic testing matters
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Experience the most advanced DNA testing that delivers genetic certainty, so that you can prevent critical health outcomes.
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">A one-time investment to shield what matters most</h3>
            <p className="text-lg opacity-90">The first step in lifelong defence against chronic diseases</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="product" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-700">3 simple steps, no need to step out</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-8 w-8 text-blue-600" suppressHydrationWarning />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Order the kit online</h3>
              <p className="text-gray-600">Instant access, anytime. Register your kit & we'll take care of everything else.</p>
            </Card>
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="h-8 w-8 text-green-600" suppressHydrationWarning />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Self-guided sample collection</h3>
              <p className="text-gray-600">Self-assisted sample collection with easy-to-follow instructions.</p>
            </Card>
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-purple-600" suppressHydrationWarning />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Get result & Expert advice</h3>
              <p className="text-gray-600">Get a clinical-grade report & a free consultation with experts.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Test Details and Pricing */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                <h2 className="text-2xl font-bold mb-2">LifeSync</h2>
                <p className="text-lg opacity-90">By LifeCare.ai</p>
                <div className="mt-4">
                  <Badge className="bg-white text-blue-600">Compliant with global guidelines</Badge>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Test Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sample Collection</span>
                        <span className="font-medium">Self-assisted</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Age</span>
                        <span className="font-medium">No age limit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium">2 way covered</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Results</span>
                        <span className="font-medium">In 4 weeks</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">What you get</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" suppressHydrationWarning />
                        <span className="text-gray-700">Genetic health report</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" suppressHydrationWarning />
                        <span className="text-gray-700">Consultation with an expert</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" suppressHydrationWarning />
                        <span className="text-gray-700">Get post test support</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">$4,600</div>
                      <p className="text-gray-600">One-time investment</p>
                    </div>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <a href="/order" className="text-white">Add to cart +</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted Voices
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Initially, I took LifeSync out of curiosity. But after the screening, my conviction led my whole family to follow. I highly recommend it to all!"
              </p>
              <div>
                <p className="font-semibold text-gray-900">Karan Gupta</p>
                <p className="text-sm text-gray-600">Principal Investor, Auxano Capital</p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "This comprehensive test helped me understand my genetic make-up and detect any potentially increased risk of developing certain diseases. Being a new mother, I thought it was a very important health investment."
              </p>
              <div>
                <p className="font-semibold text-gray-900">Menaka Bhandary</p>
                <p className="text-sm text-gray-600">Founder, Blown Studio</p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "LifeSync provided me with clear, easy to understand insights into potential health risks. The team is reliable and supportive. In health, prevention is key."
              </p>
              <div>
                <p className="font-semibold text-gray-900">Gopal Krishnan</p>
                <p className="text-sm text-gray-600">Director & Principal Consultant, Stabaka Consulting</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What makes us the world's best
            </h2>
            <p className="text-xl text-gray-700">We don't just assess risk. We decode root causes of over 6000 diseases with clinical-grade accuracy.</p>
          </div>
          <div className="max-w-6xl mx-auto">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">LifeSync</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Competitor A</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Competitor B</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Total diseases screened for</td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">6,000+</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">900</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">&lt;300</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">Cancers screened for</td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">100</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">87</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">36</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Clinical-grade Reporting</td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">95%</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">&gt;90%</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">&lt;40%</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">Diverse Ethnicity Coverage</td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">Excellent</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">Good</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">Limited</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Test Sensitivity</td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">&gt;90%</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">&lt;40%</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">&lt;40%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest Articles
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover:shadow-lg transition-all hover-lift">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100"></div>
              <CardContent className="p-6">
                <Badge className="mb-3 bg-blue-100 text-blue-800">Genetics</Badge>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Is our natural cause of death encoded in our DNA?
                </h3>
                <p className="text-gray-600 mb-4">
                  Exploring the genetic factors that influence longevity and health outcomes...
                </p>
                <Button variant="outline" className="w-full">
                  Read More
                </Button>
              </CardContent>
            </Card>
            <Card className="overflow-hidden hover:shadow-lg transition-all hover-lift">
              <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100"></div>
              <CardContent className="p-6">
                <Badge className="mb-3 bg-green-100 text-green-800">Healthcare</Badge>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  The overlooked economics of preventive healthcare
                </h3>
                <p className="text-gray-600 mb-4">
                  Understanding the financial benefits of investing in preventive health measures...
                </p>
                <Button variant="outline" className="w-full">
                  Read More
                </Button>
              </CardContent>
            </Card>
            <Card className="overflow-hidden hover:shadow-lg transition-all hover-lift">
              <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100"></div>
              <CardContent className="p-6">
                <Badge className="mb-3 bg-purple-100 text-purple-800">Technology</Badge>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Need for moving beyond risk scores in genetic screenings
                </h3>
                <p className="text-gray-600 mb-4">
                  Why comprehensive genetic analysis is superior to simple risk assessment...
                </p>
                <Button variant="outline" className="w-full">
                  Read More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Free Consultation Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Unsure about genetic screening?
                </h2>
                <p className="text-xl text-gray-700">
                  Talk to our clinical genetics experts, free of charge to see how a genetic test can benefit you and your family.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="reason">What's your reason for considering a genetic test?</Label>
                  <select 
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="family-history">Family history of diseases</option>
                    <option value="unresolved-health">Unresolved health conditions</option>
                    <option value="planning-baby">Planning a baby</option>
                    <option value="wellness">Wellness and longevity</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="name">Your Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Contact Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 234 567 8900"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email ID</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                  Book Free Consultation
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* About Company */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              LifeCare.ai empowers people to take control of their health
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Through the precise, preventative, and profoundly personal science of genetics. We're not just extending lives; we're upgrading what it means to live.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              The goal isn't just to live longer, it's to live better, stronger, smarter. To maximise what it means to be human and ensure that humanity thrives against all odds.
            </p>
            <div className="bg-blue-600 text-white p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-lg">
                To create a world where disease isn't treated, but prevented, where your healthcare begins with your DNA, not your diagnosis, adding decades of vibrant, productive life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Dna className="h-8 w-8 text-blue-400" suppressHydrationWarning />
                <span className="text-xl font-bold">LifeCare.ai</span>
              </div>
              <p className="text-gray-400">
                Empowering preventive healthcare through advanced genetic testing.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#product" className="hover:text-white transition-colors">The Product</a></li>
                <li><a href="#reporting" className="hover:text-white transition-colors">Reporting</a></li>
                <li><a href="#blog" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Register Kit</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Career</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" suppressHydrationWarning />
                  <span>+1 234 567 8900</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" suppressHydrationWarning />
                  <span>info@lifecare.ai</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" suppressHydrationWarning />
                  <span>Global Healthcare Services</span>
                </div>
              </div>
            </div>
          </div>
          <Separator className="my-8 bg-gray-800" suppressHydrationWarning />
          <div className="text-center text-gray-400">
            <p>© 2025 LifeCare.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
