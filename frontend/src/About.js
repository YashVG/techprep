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
                            Tech Prep Blog is a small learning platform built for <strong>a close-knit group of UBC students</strong>
                            who want to share what they've learned in their classes. We provide an intimate space where
                            friends can exchange knowledge, discuss course concepts, and help each other understand the
                            material better.
                        </p>
                    </section>

                    <section className="about-section">
                        <h2 className="section-title">💼 Share What You've Learned</h2>
                        <p className="section-text">
                            Share your understanding of class concepts, interesting solutions you've discovered, and
                            coding techniques you've picked up. Exchange ideas with your study group and learn from
                            each other's approaches to problems. It's like a personal study blog for your friend group.
                        </p>
                        <ul className="feature-list">
                            <li>Share course-related code and explanations</li>
                            <li>Learn different approaches from your peers</li>
                            <li>Get friendly feedback on your understanding</li>
                            <li>Build knowledge together as a small community</li>
                        </ul>
                    </section>

                    <section className="about-section">
                        <h2 className="section-title">🎓 Organize by Course</h2>
                        <p className="section-text">
                            Keep your shared learnings organized by course codes (CPSC 110, CPSC 210, CPSC 221, etc.).
                            Exchange notes on what you've learned, interesting concepts that clicked for you, and
                            helpful ways of thinking about course material. It's easier to find relevant content when
                            it's grouped by class.
                        </p>
                        <ul className="feature-list">
                            <li>Course-organized posts for easy browsing</li>
                            <li>Share interesting insights from lectures</li>
                            <li>Small group learning environment</li>
                            <li>Help each other with tricky concepts</li>
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
                        <h2 className="section-title">🌟 Join Your Study Group</h2>
                        <p className="section-text">
                            This is a small, friendly platform for your group to share learnings and help each other out.
                            Whether you're in first year or upper years, it's a casual space to exchange what you've
                            figured out in your classes. Sign up and start sharing with your study buddies!
                        </p>
                    </section>
                </div>

                <div className="about-footer">
                    <p className="footer-text">Built with 💛 for a small group of UBC CS students</p>
                </div>
            </div>
        </div>
    );
};

export default About;

