import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Issue } from '../types';
import { initialIssues } from './seedData';

const LOCAL_STORAGE_KEY = 'community_hero_issues';

// Ensure local storage has at least seed data if empty
function getLocalIssues(): Issue[] {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse local issues", e);
    }
  }

  // Seed local issues with default IDs
  const seeded = initialIssues.map((item, idx) => ({
    id: `seeded_${idx}`,
    ...item
  })) as Issue[];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveLocalIssues(issues: Issue[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(issues));
}

// Global active in-memory list
let currentIssues: Issue[] = getLocalIssues();
const listeners: ((issues: Issue[]) => void)[] = [];

function notifyListeners() {
  listeners.forEach(cb => cb([...currentIssues]));
}

// Timeout helper to prevent infinite hangs
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`Database operation timed out after ${timeoutMs}ms. Using local fallback.`);
      resolve(fallbackValue);
    }, timeoutMs);
  });

  return Promise.race([
    promise.then(res => {
      clearTimeout(timeoutId);
      return res;
    }),
    timeoutPromise
  ]);
}

// Track if we have established a real Firestore connection
let isFirestoreConnected = false;

export const dbService = {
  isCloudConnected() {
    return isFirestoreConnected;
  },

  subscribeToIssues(onUpdate: (issues: Issue[]) => void, onError?: (err: any) => void): () => void {
    listeners.push(onUpdate);
    // Send cached/local items immediately so UI is instant
    onUpdate([...currentIssues]);

    let firestoreUnsubscribe: (() => void) | null = null;

    try {
      const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
      
      firestoreUnsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty, seed it asynchronously but don't block
          console.log("Cloud database is empty, seeding defaults...");
          const seeded = getLocalIssues();
          seeded.forEach(async (issue) => {
            try {
              const { id, ...data } = issue;
              await addDoc(collection(db, "issues"), data);
            } catch (e) {
              console.warn("Failed to auto-seed cloud database:", e);
            }
          });
        } else {
          isFirestoreConnected = true;
          const cloudIssues: Issue[] = [];
          snapshot.forEach((doc) => {
            cloudIssues.push({ id: doc.id, ...doc.data() } as Issue);
          });
          currentIssues = cloudIssues;
          saveLocalIssues(cloudIssues);
          notifyListeners();
        }
      }, (error) => {
        console.warn("Firestore subscription failed, continuing in local sandbox mode:", error);
        isFirestoreConnected = false;
        if (onError) onError(error);
      });
    } catch (e) {
      console.warn("Could not establish Firestore subscription, operating in local fallback mode:", e);
      isFirestoreConnected = false;
    }

    // Cleanup subscription
    return () => {
      const idx = listeners.indexOf(onUpdate);
      if (idx !== -1) listeners.splice(idx, 1);
      if (firestoreUnsubscribe) firestoreUnsubscribe();
    };
  },

  async createIssue(newIssueData: Omit<Issue, 'id'>): Promise<string> {
    const tempId = `local_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Add to local state immediately (Optimistic Update)
    const newIssue: Issue = {
      id: tempId,
      ...newIssueData
    };
    currentIssues = [newIssue, ...currentIssues];
    saveLocalIssues(currentIssues);
    notifyListeners();

    // Try cloud write with a 2-second timeout
    try {
      const cloudWritePromise = addDoc(collection(db, "issues"), newIssueData).then(docRef => docRef.id);
      const finalId = await withTimeout(cloudWritePromise, 2000, tempId);
      
      if (finalId !== tempId) {
        // Replace tempId with actual firestore ID
        currentIssues = currentIssues.map(issue => {
          if (issue.id === tempId) {
            return { ...issue, id: finalId };
          }
          return issue;
        });
        saveLocalIssues(currentIssues);
        notifyListeners();
        return finalId;
      }
    } catch (err) {
      console.warn("Cloud write failed, issue is saved locally in sandbox memory:", err);
    }

    return tempId;
  },

  async voteIssue(issueId: string, userId: string, voteType: 'up' | 'down'): Promise<void> {
    const targetIssue = currentIssues.find(i => i.id === issueId);
    if (!targetIssue) return;

    const votedUsers = { ...(targetIssue.votedUsers || {}) };
    const currentVote = votedUsers[userId];

    let newUpvotes = targetIssue.upvotes;
    let newDownvotes = targetIssue.downvotes;

    if (currentVote === voteType) {
      delete votedUsers[userId];
      if (voteType === 'up') {
        newUpvotes = Math.max(0, newUpvotes - 1);
      } else {
        newDownvotes = Math.max(0, newDownvotes - 1);
      }
    } else {
      if (currentVote === 'up') {
        newUpvotes = Math.max(0, newUpvotes - 1);
      } else if (currentVote === 'down') {
        newDownvotes = Math.max(0, newDownvotes - 1);
      }

      votedUsers[userId] = voteType;
      if (voteType === 'up') {
        newUpvotes += 1;
      } else {
        newDownvotes += 1;
      }
    }

    // Auto escalate to "Escalated" status if upvotes exceed 10
    let newStatus = targetIssue.status;
    if (newUpvotes >= 10 && targetIssue.status === 'Pending' && targetIssue.category !== 'positive') {
      newStatus = 'Escalated';
    }

    // Update locally first
    currentIssues = currentIssues.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          votedUsers,
          status: newStatus
        };
      }
      return issue;
    });
    saveLocalIssues(currentIssues);
    notifyListeners();

    // Sync to Cloud asynchronously if not a local-only issue
    if (!issueId.startsWith('local_') && !issueId.startsWith('seeded_')) {
      try {
        const issueRef = doc(db, "issues", issueId);
        const cloudUpdatePromise = updateDoc(issueRef, {
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          votedUsers,
          status: newStatus
        });
        await withTimeout(cloudUpdatePromise, 2000, null);
      } catch (err) {
        console.warn("Failed to sync vote to cloud:", err);
      }
    }
  },

  async addComment(issueId: string, authorId: string, authorName: string, text: string): Promise<void> {
    const targetIssue = currentIssues.find(i => i.id === issueId);
    if (!targetIssue) return;

    const newComment = {
      id: `comment_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      authorId,
      authorName,
      text,
      createdAt: Date.now()
    };

    const newComments = [...(targetIssue.comments || []), newComment];

    // Update locally first
    currentIssues = currentIssues.map(issue => {
      if (issue.id === issueId) {
        return { ...issue, comments: newComments };
      }
      return issue;
    });
    saveLocalIssues(currentIssues);
    notifyListeners();

    // Sync to Cloud asynchronously if not a local-only issue
    if (!issueId.startsWith('local_') && !issueId.startsWith('seeded_')) {
      try {
        const issueRef = doc(db, "issues", issueId);
        const cloudUpdatePromise = updateDoc(issueRef, {
          comments: newComments
        });
        await withTimeout(cloudUpdatePromise, 2000, null);
      } catch (err) {
        console.warn("Failed to sync comment to cloud:", err);
      }
    }
  }
};
