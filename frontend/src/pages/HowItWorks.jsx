import React from 'react'

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-8">How It Works</h1>

        <div className="space-y-12">
          {[
            {
              step: 1,
              title: 'Submit a Challenge',
              desc: 'Tell us about a real-world problem you\'ve identified in your community, workplace, or region.',
              icon: '📝',
            },
            {
              step: 2,
              title: 'AI Analysis',
              desc: 'Our AI analyzes your problem, identifies root causes, required skills, and relevant Sustainable Development Goals.',
              icon: '🤖',
            },
            {
              step: 3,
              title: 'Problem Prioritization',
              desc: 'Problems are prioritized based on impact, urgency, and potential for change.',
              icon: '📊',
            },
            {
              step: 4,
              title: 'Expert Matching',
              desc: 'Connect with students, researchers, mentors, and industry partners who have the skills to help.',
              icon: '🤝',
            },
            {
              step: 5,
              title: 'Team Collaboration',
              desc: 'Form teams and work together on developing and prototyping solutions.',
              icon: '👥',
            },
            {
              step: 6,
              title: 'Implementation',
              desc: 'Validate your solution, get industry support, and implement it in the real world.',
              icon: '🚀',
            },
            {
              step: 7,
              title: 'Impact Tracking',
              desc: 'Measure and track the real-world impact of your solution on communities and regions.',
              icon: '📈',
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-6">
              <div className="text-5xl">{item.icon}</div>
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Step {item.step}: {item.title}
                </h3>
                <p className="text-gray-700 text-lg">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
