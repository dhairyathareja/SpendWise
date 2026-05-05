import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  X,
  Play,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

const blogs = [
  {
    id: 1,
    title: 'How to Launch an EC2 Instance',
    videoUrl: 'https://www.youtube.com/embed/2u3_lYm6Kz4',
    shortInfo: 'A comprehensive guide for beginners to launch their first virtual server in the cloud using AWS EC2.',
    steps: [
      'Log into the AWS Management Console and navigate to EC2.',
      'Click "Launch Instance" and choose a name for your server.',
      'Select an Amazon Machine Image (AMI), like Amazon Linux 2023.',
      'Choose an Instance Type (e.g., t2.micro for Free Tier).',
      'Select or create a Key Pair for secure SSH access.',
      'Configure Network settings and Security Group rules.',
      'Review your settings and click "Launch Instance".'
    ],
    faqs: [
      { q: 'What is an AMI?', a: 'It is a pre-configured template that contains the software configuration (OS, server, etc.) for your instance.' },
      { q: 'Can I change the instance type later?', a: 'Yes, you can stop the instance and change its type, though some restrictions apply depending on the OS.' }
    ],
    detailedInfo: 'Launching an EC2 instance is the first step in building on AWS. This tutorial walks you through the entire wizard, explaining each configuration option from AMIs to Security Groups. We focus on the "Free Tier" path to ensure you can learn without incurring unexpected costs.'
  },
  {
    id: 2,
    title: 'Properly Stopping EC2 Instances',
    videoUrl: 'https://www.youtube.com/embed/6_H6nBqQ3pI',
    shortInfo: 'Learn the difference between stopping and terminating instances, and how to manage your running costs effectively.',
    steps: [
      'Go to the EC2 Dashboard and select "Instances (running)".',
      'Select the checkbox next to the instance you want to manage.',
      'Click on "Instance state" and select "Stop instance".',
      'Confirm the action in the pop-up dialog.',
      'Verify that the status changes to "Stopping" then "Stopped".'
    ],
    faqs: [
      { q: 'Do I still pay for a stopped instance?', a: 'You stop paying for compute (vCPU/RAM), but you still pay for the attached EBS storage volumes.' },
      { q: 'What is the difference between Stop and Terminate?', a: 'Stopping is like turning off a computer (you can turn it back on). Terminating is like throwing it away (it is deleted forever).' }
    ],
    detailedInfo: 'Cost management starts with knowing when to turn things off. Stopping instances when they are not in use is the easiest way to save money on AWS. This guide explains the lifecycle of an instance and the cost implications of each state.'
  },
  {
    id: 3,
    title: 'Creating Your First S3 Bucket',
    videoUrl: 'https://www.youtube.com/embed/e6w9LwZJFIA',
    shortInfo: 'A step-by-step walkthrough to create a secure S3 bucket for storing your files and data in the cloud.',
    steps: [
      'Navigate to the S3 service in the AWS Console.',
      'Click the "Create bucket" button.',
      'Enter a globally unique bucket name.',
      'Choose the AWS Region closest to your users.',
      'Keep "Block all public access" enabled for maximum security.',
      'Configure Versioning or Encryption if required.',
      'Click "Create bucket" at the bottom of the page.'
    ],
    faqs: [
      { q: 'Why must bucket names be unique?', a: 'S3 bucket names are part of a URL (e.g., bucketname.s3.amazonaws.com), so no two people in the world can have the same name.' },
      { q: 'Is S3 secure by default?', a: 'Yes, AWS now enables "Block All Public Access" by default for all new buckets.' }
    ],
    detailedInfo: 'Amazon S3 (Simple Storage Service) is the backbone of cloud storage. Whether you are hosting a static website or storing massive datasets, understanding how to create and secure a bucket is a fundamental cloud skill.'
  }
];

const BlogCard = ({ blog, isExpanded, onExpand }) => {
  return (
    <motion.div
      layout
      className={`blog-card glass-panel ${isExpanded ? 'expanded' : ''}`}
      onClick={() => !isExpanded && onExpand(blog.id)}
    >
      <div className="blog-card-video">
        <iframe
          src={blog.videoUrl}
          title={blog.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        {!isExpanded && <div className="video-overlay" />}
      </div>

      <div className="blog-card-content">
        <motion.h2 layout="position">{blog.title}</motion.h2>
        <motion.p layout="position" className="short-info">{blog.shortInfo}</motion.p>

        {!isExpanded && (
          <div className="read-more">
            <span>Learn more</span>
            <ArrowRight size={16} />
          </div>
        )}

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="expanded-content"
              style={{ overflow: 'hidden' }}
            >
              <div className="content-section">
                <h3><Play size={18} /> Detailed Overview</h3>
                <p>{blog.detailedInfo}</p>
              </div>

              <div className="content-section">
                <h3><CheckCircle2 size={18} /> Implementation Steps</h3>
                <ol className="steps-list">
                  {blog.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="content-section">
                <h3><HelpCircle size={18} /> Common FAQs</h3>
                <div className="faq-list">
                  {blog.faqs.map((faq, i) => (
                    <div key={i} className="faq-item">
                      <p className="faq-q"><strong>Q:</strong> {faq.q}</p>
                      <p className="faq-a"><strong>A:</strong> {faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button className="close-btn" onClick={(e) => {
                e.stopPropagation();
                onExpand(null);
              }}>
                <X size={20} />
                <span>Close Article</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Blog = () => {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="blog-page">
      <header className="blog-header">
        <div className="eyebrow compact">
          <BookOpen size={16} />
          <span>SpendWise knowledge base</span>
        </div>
        <h1>
          Mastering <span className="text-gradient">Cloud Efficiency</span>
        </h1>
        <p>
          Step-by-step video guides and playbooks to transform your AWS infrastructure from a cost center to a strategic asset.
        </p>
      </header>

      <div className={`blog-grid ${expandedId ? 'has-expanded' : ''}`}>
        {blogs.filter(blog => !expandedId || expandedId === blog.id).map((blog) => (
          <BlogCard
            key={blog.id}
            blog={blog}
            isExpanded={expandedId === blog.id}
            onExpand={setExpandedId}
          />
        ))}
      </div>
    </div>
  );
};

export default Blog;
