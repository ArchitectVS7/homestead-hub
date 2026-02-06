import { 
  Package, 
  Sprout, 
  Wrench, 
  Dog,
  CloudSun, 
  CheckSquare, 
  Droplets, 
  ShieldAlert,
  Database,
  Wifi,
  WifiOff,
  Lock,
  ArrowRight,
  Leaf,
  Calendar,
  BarChart3,
  Bell
} from 'lucide-react'

const features = [
  {
    icon: Package,
    title: 'Food Storage',
    description: 'Track emergency food supplies with expiration dates, rotation schedules, and nutritional data. Never let supplies expire unnoticed.',
    color: 'bg-harvest-100 text-harvest-700',
  },
  {
    icon: Sprout,
    title: 'Garden Planner',
    description: 'Plan your garden beds with planting calendars based on your hardiness zone. Track seed inventory, succession planting, and harvest yields.',
    color: 'bg-forest-100 text-forest-700',
  },
  {
    icon: Wrench,
    title: 'Equipment Maintenance',
    description: 'Schedule and track maintenance for tractors, generators, vehicles, and tools. Log service history and set reminders before things break.',
    color: 'bg-earth-100 text-earth-700',
  },
  {
    icon: Dog,
    title: 'Livestock Management',
    description: 'Track animals, breeding records, veterinary care, feed consumption, and production data. Manage herds and flocks with ease.',
    color: 'bg-barn-100 text-barn-700',
  },
  {
    icon: CloudSun,
    title: 'Weather Integration',
    description: 'Local weather data with frost alerts, precipitation tracking, and historical records. Plan your work around what\'s coming.',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: CheckSquare,
    title: 'Task Scheduling',
    description: 'Daily, weekly, monthly, quarterly, and annual task management. Recurring chores, seasonal projects, and deadline tracking.',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    icon: Droplets,
    title: 'Resource Tracking',
    description: 'Monitor water usage, fuel levels, seed inventory, feed supplies, and other critical resources. Know what you have and what you need.',
    color: 'bg-cyan-100 text-cyan-700',
  },
  {
    icon: ShieldAlert,
    title: 'Emergency Preparedness',
    description: 'Checklists for various emergency scenarios. Track supplies, plans, and readiness levels. Be prepared for anything.',
    color: 'bg-red-100 text-red-700',
  },
]

const principles = [
  {
    icon: Database,
    title: 'Self-Hosted',
    description: 'Your data stays on your hardware. No cloud dependencies, no third-party access.',
  },
  {
    icon: WifiOff,
    title: 'Offline-First',
    description: 'Full functionality without internet. Sync when connected, work when not.',
  },
  {
    icon: Lock,
    title: 'No Subscriptions',
    description: 'One-time setup, zero recurring fees. Your homestead, your rules.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-earth-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-earth-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-forest-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-earth-900">HomesteadHub</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/login" className="text-earth-600 hover:text-earth-900 font-medium transition-colors">
                Sign In
              </a>
              <a href="/register" className="btn-primary flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-forest-100 text-forest-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <WifiOff className="w-4 h-4" />
            100% Self-Hosted & Offline-Capable
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-earth-900 mb-6 text-balance">
            Manage Your Homestead
            <span className="text-forest-600"> With Confidence</span>
          </h1>
          <p className="text-xl text-earth-600 mb-8 max-w-2xl mx-auto text-balance">
            A comprehensive, self-hosted application for engineers, farmers, and survivalists 
            who need complete control over their homestead data. No cloud. No subscriptions. No compromises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="btn-primary text-lg py-3 px-8 flex items-center justify-center gap-2">
              Start Managing Your Homestead
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#features" className="btn-secondary text-lg py-3 px-8">
              See All Features
            </a>
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-earth-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {principles.map((principle) => (
              <div key={principle.title} className="text-center">
                <div className="w-16 h-16 bg-forest-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <principle.icon className="w-8 h-8 text-forest-600" />
                </div>
                <h3 className="text-xl font-bold text-earth-900 mb-2">{principle.title}</h3>
                <p className="text-earth-600">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-earth-900 mb-4">
              Everything You Need to Run Your Homestead
            </h2>
            <p className="text-xl text-earth-600 max-w-2xl mx-auto">
              From daily chores to long-term planning, HomesteadHub keeps your operation running smoothly.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="card hover:shadow-md transition-shadow duration-200 group"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-earth-900 mb-2">{feature.title}</h3>
                <p className="text-earth-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-earth-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Your Homestead at a Glance
              </h2>
              <p className="text-earth-300 text-lg mb-8">
                A powerful dashboard shows you everything that matters: expiring supplies, 
                upcoming tasks, weather alerts, and resource levels. Take action before problems arise.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: Bell, text: 'Smart alerts for expiring food and upcoming maintenance' },
                  { icon: Calendar, text: 'Seasonal planting reminders based on your zone' },
                  { icon: BarChart3, text: 'Resource consumption trends and projections' },
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-forest-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-earth-200">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-earth-800 rounded-2xl p-6 border border-earth-700">
              {/* Dashboard Preview Mockup */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-earth-700">
                  <span className="font-semibold">Dashboard</span>
                  <span className="text-earth-400 text-sm">Today</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-barn-900/50 border border-barn-700 rounded-lg p-4">
                    <div className="text-barn-400 text-sm mb-1">Expiring Soon</div>
                    <div className="text-2xl font-bold text-barn-300">12 items</div>
                  </div>
                  <div className="bg-forest-900/50 border border-forest-700 rounded-lg p-4">
                    <div className="text-forest-400 text-sm mb-1">Tasks Today</div>
                    <div className="text-2xl font-bold text-forest-300">8 tasks</div>
                  </div>
                  <div className="bg-harvest-900/50 border border-harvest-700 rounded-lg p-4">
                    <div className="text-harvest-400 text-sm mb-1">Maintenance Due</div>
                    <div className="text-2xl font-bold text-harvest-300">3 items</div>
                  </div>
                  <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4">
                    <div className="text-blue-400 text-sm mb-1">Frost Alert</div>
                    <div className="text-2xl font-bold text-blue-300">Tomorrow</div>
                  </div>
                </div>
                <div className="bg-earth-700/50 rounded-lg p-4">
                  <div className="text-earth-400 text-sm mb-2">Resource Levels</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm w-16">Water</span>
                      <div className="flex-1 h-2 bg-earth-600 rounded-full">
                        <div className="h-full w-3/4 bg-cyan-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-earth-400">75%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm w-16">Fuel</span>
                      <div className="flex-1 h-2 bg-earth-600 rounded-full">
                        <div className="h-full w-1/2 bg-harvest-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-earth-400">50%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm w-16">Feed</span>
                      <div className="flex-1 h-2 bg-earth-600 rounded-full">
                        <div className="h-full w-1/4 bg-barn-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-earth-400">25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-earth-900 mb-4">
            Built for Reliability
          </h2>
          <p className="text-xl text-earth-600 mb-12">
            Modern, battle-tested technologies that run anywhere — your Raspberry Pi, old laptop, or home server.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Next.js 14', 'TypeScript', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'PWA'].map((tech) => (
              <span 
                key={tech}
                className="bg-earth-100 text-earth-700 px-4 py-2 rounded-lg font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-forest-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Take Control?
          </h2>
          <p className="text-xl text-forest-100 mb-8">
            Your homestead deserves software that works as hard as you do.
          </p>
          <a href="/register" className="inline-flex items-center gap-2 bg-white text-forest-700 font-bold py-4 px-8 rounded-lg text-lg hover:bg-forest-50 transition-colors">
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-earth-900 text-earth-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-forest-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">HomesteadHub</span>
            </div>
            <p className="text-sm">
              Self-hosted. Self-reliant. Self-sufficient.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
