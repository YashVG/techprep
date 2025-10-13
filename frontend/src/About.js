import React from 'react';
import BackButton from './components/BackButton';
import './About.css';

/**
 * About Component
 * Static informational page explaining the purpose of Tech Prep Blog
 */
const About = () => {
    return (
        <div className="about-page">
            <BackButton />
            <div className="about-container">
                <h1 className="about-title">About Tech Prep Blog</h1>

                <div className="about-content">
                    <section className="about-section">
                        <h2 className="section-title">📚 Our Mission</h2>
                        <p className="section-text">
                            Tech Prep Blog is a dedicated platform built for <strong>UBC students</strong> to excel in their
                            computer science journey. We provide a collaborative space where students can share code,
                            discuss solutions, and prepare together for the challenges ahead.
                        </p>
                    </section>

                    <section className="about-section">
                        <h2 className="section-title">💼 Technical Interview Preparation</h2>
                        <p className="section-text">
                            Master your coding interviews with real problems and solutions from fellow UBC students.
                            Share your approaches to LeetCode problems, algorithm implementations, and data structure
                            solutions. Learn from diverse coding styles and problem-solving techniques.
                        </p>
                        <ul className="feature-list">
                            <li>Practice with real interview questions</li>
                            <li>Learn multiple approaches to the same problem</li>
                            <li>Get feedback from peers on your solutions</li>
                            <li>Build confidence for technical interviews</li>
                        </ul>
                    </section>

                    <section className="about-section">
                        <h2 className="section-title">🎓 Course Support</h2>
                        <p className="section-text">
                            Organize your learning by course codes (CPSC 110, CPSC 210, CPSC 221, etc.).
                            Share course-specific solutions, study together for exams, and help each other
                            understand complex concepts. From introductory programming to advanced algorithms,
                            we've got you covered.
                        </p>
                        <ul className="feature-list">
                            <li>Course-organized content for easy navigation</li>
                            <li>Share and discuss assignment approaches</li>
                            <li>Collaborative learning environment</li>
                            <li>Peer support for challenging concepts</li>
                        </ul>
                    </section>

                    <section className="about-section">
                        <h2 className="section-title">🚀 Features</h2>
                        <ul className="feature-list">
                            <li><strong>Integrated Code Editor:</strong> Write and share code in multiple languages (Python, JavaScript, C++, Java)</li>
                            <li><strong>Syntax Highlighting:</strong> Professional code display with Monaco Editor</li>
                            <li><strong>Course Filtering:</strong> Find content relevant to your current courses</li>
                            <li><strong>Community Engagement:</strong> Comment and discuss solutions with peers</li>
                            <li><strong>User Profiles:</strong> Track your contributions and build your portfolio</li>
                        </ul>
                    </section>

                    <section className="about-section">
                        <h2 className="section-title">🌟 Join the Community</h2>
                        <p className="section-text">
                            Whether you're preparing for your first co-op interview or tackling advanced coursework,
                            Tech Prep Blog is here to support your success. Sign up today and start contributing
                            to the UBC CS community!
                        </p>
                    </section>
                </div>

                <div className="about-footer">
                    <p className="footer-text">Built with 💛 for UBC Computer Science Students</p>
                </div>
            </div>
        </div>
    );
};

export default About;

