import { Rocket, Box, GitMerge, Search, Layers, Database, Hash, Code, Cpu } from 'lucide-react';

export const dsaTopics = [
    {
        id: 'beginner',
        label: 'Beginner',
        icon: Rocket,
        active: true,
        progress: 80,
        total: 10,
        solved: 8,
        questions: [
            { id: 1, title: 'Two Sum', tags: ['Array', 'Hash Table'], difficulty: 'Easy', solved: true },
            { id: 2, title: 'Reverse a Linked List', tags: ['LinkedList', 'Recursion'], difficulty: 'Easy', solved: true },
            { id: 3, title: 'Valid Anagram', tags: ['String', 'Hash Table'], difficulty: 'Easy', solved: true },
            { id: 4, title: 'Majority Element', tags: ['Array', 'Counting'], difficulty: 'Easy', solved: true },
            { id: 5, title: 'Merge Two Sorted Lists', tags: ['LinkedList'], difficulty: 'Easy', solved: false },
        ]
    },
    { id: 'arrays-strings', label: 'Arrays & Strings', icon: Box, progress: 45, total: 20, solved: 9, questions: [] },
    { id: 'binary-search', label: 'Binary Search', icon: Search, progress: 20, total: 15, solved: 3, questions: [] },
    { id: 'recursion-backtracking', label: 'Recursion', icon: GitMerge, progress: 10, total: 12, solved: 1, questions: [] },
    { id: 'linked-lists', label: 'Linked Lists', icon: Layers, progress: 0, total: 25, solved: 0, questions: [] },
    { id: 'stacks-queues', label: 'Stacks & Queues', icon: Database, progress: 0, total: 18, solved: 0, questions: [] },
    { id: 'hashing', label: 'Hashing', icon: Hash, progress: 0, total: 14, solved: 0, questions: [] },
    { id: 'trees', label: 'Trees & Graphs', icon: GitMerge, progress: 0, total: 30, solved: 0, questions: [] },
    { id: 'dp', label: 'Dynamic Programming', icon: Code, progress: 0, total: 40, solved: 0, questions: [] },
    { id: 'system-design', label: 'System Design', icon: Cpu, progress: 0, total: 10, solved: 0, questions: [] },
];
