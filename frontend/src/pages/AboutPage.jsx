import React from 'react'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-8">About Societal Solutions Hub</h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              Societal Solutions Hub is dedicated to bridging the gap between real-world problems and innovative solutions. We believe that by connecting citizens, students, researchers, industries, and communities, we can accelerate the development and implementation of solutions to societal challenges.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              A world where societal challenges are solved collaboratively through technology, innovation, and human compassion. We envision a platform where every voice is heard, and every idea has the potential to create meaningful impact.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How We Help</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Crowdsource real-world challenges from communities and citizens</li>
              <li>Use AI to analyze, prioritize, and map problems to relevant SDGs</li>
              <li>Connect problems with skilled solvers across disciplines</li>
              <li>Facilitate collaboration between students, researchers, and industries</li>
              <li>Track impact and measure real-world outcomes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Get Involved</h2>
            <p className="text-gray-700 leading-relaxed">
              Whether you have a problem to solve or are passionate about solving challenges, you can make a difference. <Link to="/register" className="text-blue-600 hover:underline">Join us today</Link> and be part of a community driving positive change.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
