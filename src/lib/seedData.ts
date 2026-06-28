import { Issue } from '../types';

export const initialIssues: Omit<Issue, 'id'>[] = [
  {
    title: "Clogged Stormwater Drain & Waterlogging",
    description: "The primary drainage channel near the main market has been completely blocked with plastic waste and silt. A simple 10-minute rain shower causes immediate waterlogging up to 1.5 feet, disrupting local street vendors and blocking shop entrances.",
    locality: "Connaught Place, Sector 3, New Delhi",
    category: "infrastructure",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800",
    upvotes: 42,
    downvotes: 2,
    status: "Pending",
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    createdBy: "citizen_rahul",
    createdByName: "Rahul Sharma",
    votedUsers: { "citizen_rahul": "up" }
  },
  {
    title: "Hazardous Open Pothole on Curve",
    description: "A very deep pothole (approx 10 inches deep) has developed right on the blind curve of the inner ring road. It is highly hazardous for two-wheelers, especially at night when the street lighting is dim. Already witnessed two minor accidents here this week.",
    locality: "Indiranagar, 80 Feet Road, Bengaluru",
    category: "safety",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=800",
    upvotes: 89,
    downvotes: 1,
    status: "Escalated",
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    createdBy: "citizen_priya",
    createdByName: "Priya Patel",
    votedUsers: { "citizen_priya": "up" }
  },
  {
    title: "Illegal Dump Yard & Stagnant Trash Pile",
    description: "An empty residential plot is being used as an unauthorized garbage dump. Municipal trucks haven't cleared this area in over 3 weeks. It is attracting stray dogs, rodents, and emitting a foul smell that makes it impossible for nearby houses to keep windows open.",
    locality: "Bandra West, Hill Road, Mumbai",
    category: "trash",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800",
    upvotes: 112,
    downvotes: 5,
    status: "Escalated",
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    createdBy: "citizen_anil",
    createdByName: "Anil K.",
    votedUsers: { "citizen_anil": "up" }
  },
  {
    title: "New Public Parks Seating Installed successfully!",
    description: "Fantastic news! Following our community petitions, the local civic body has successfully installed 8 new eco-friendly benches and restored the walking track at the central park. Thank you to everyone who voted and signed!",
    locality: "Sector 15, HUDA Ground, Gurgaon",
    category: "positive",
    imageUrl: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=800",
    upvotes: 156,
    downvotes: 0,
    status: "Resolved",
    createdAt: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
    createdBy: "citizen_meera",
    createdByName: "Meera Sen",
    votedUsers: { "citizen_meera": "up" }
  }
];
