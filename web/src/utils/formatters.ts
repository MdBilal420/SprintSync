/**
 * Utility functions for UI rendering and data formatting
 * Pure functions that transform data for display
 */

import type { ProjectMember, TaskStatus } from '../types';


import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatOpenAI } from "@langchain/openai";


// const openAIApiKey = "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";
const openAIApiKey = import.meta.env.VITE_OPENAI_API_KEY;

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  openAIApiKey,

});

const llm = new ChatOpenAI({
  model: "gpt-4",
  temperature: 0.1,
  apiKey:openAIApiKey,
});

const getAssigneeScore = async (projectMembers: ProjectMember[], task: string) => {

    if (!openAIApiKey) {
    throw new Error("OpenAI API key is required. Pass it as parameter or set OPENAI_API_KEY environment variable.");
  }
  // Step 1: Create vector store with member résumé snippets
  const memberDocs = projectMembers
    .filter(member => member.user && member.user.description)
    .map(member => new Document({
      pageContent: member.user.description,
      metadata: { 
        memberEmail: member.user.email,
        memberName: member.user.name || member.user.email
      },
    }));

  if (memberDocs.length === 0) {
    return {
      error: "No member descriptions available for assignment",
      recommendations: [],
      best_assignment: null
    };
  }

  // Step 2: Split and embed member descriptions
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const vectorStore = new MemoryVectorStore(embeddings);
  const allSplits = await textSplitter.splitDocuments(memberDocs);
  await vectorStore.addDocuments(allSplits);

  // Step 3: Retrieve relevant member information based on task
  const relevantDocs = await vectorStore.similaritySearch(task, 10);
  
  // Step 4: Group retrieved chunks by member
  const memberContext = relevantDocs.reduce((acc, doc) => {
    const email = doc.metadata.memberEmail;
    const name = doc.metadata.memberName;
    
    if (!acc[email]) {
      acc[email] = {
        name,
        email,
        relevantContent: []
      };
    }
    acc[email].relevantContent.push(doc.pageContent);
    return acc;
  }, {} as Record<string, { name: string; email: string; relevantContent: string[] }>);

  // Step 5: Generate assignment recommendations using RAG
  const contextualPrompt = `You are a task assignment specialist. Based on the retrieved résumé information, recommend the best team member for the given task.

## Task to Assign:
${task}

## Retrieved Team Member Information:
${Object.values(memberContext).map(member => 
  `**${member.name} (${member.email})**:\n${member.relevantContent.join('\n')}`
).join('\n\n---\n\n')}

## Instructions:
Analyze each member's relevant skills and experience. Return your analysis in this JSON format:

{
  "recommendations": [
    {
      "member_email": "email@example.com",
      "member_name": "Name",
      "similarity_score": 85,
      "key_matches": ["specific skills/experience that match the task"],
      "rationale": "Why this member is suitable for this task"
    }
  ],
  "best_assignment": {
    "member_email": "best@example.com", 
    "member_name": "Best Candidate",
    "reason": "Detailed reason why this is the top choice",
    "confidence": "High/Medium/Low"
  },
  "retrieval_summary": "Brief summary of what information was found relevant"
}

Focus on exact skill matches, relevant experience, and task-specific requirements. Return ONLY the JSON response.`;

  try {
    const response = await llm.invoke(contextualPrompt);
    const result = JSON.parse(response.content as string);
    
    // Add metadata about the RAG process
    result.rag_metadata = {
      total_members: projectMembers.length,
      members_with_descriptions: memberDocs.length,
      retrieved_chunks: relevantDocs.length,
      members_considered: Object.keys(memberContext).length
    };
    
    console.log("RAG Assignment Result:", result);
    return result;
    
  } catch (error) {
    console.error("Error in RAG task assignment:", error);
    return {
      error: "Failed to process task assignment",
      recommendations: [],
      best_assignment: null
    };
  }
};

// Optional: Function to add new member to existing vector store
const addMemberToVectorStore = async (vectorStore: MemoryVectorStore, member: ProjectMember) => {
  if (!member.user?.description) return;
  
  const doc = new Document({
    pageContent: member.user.description,
    metadata: {
      memberEmail: member.user.email,
      memberName: member.user.name || member.user.email
    }
  });
  
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  
  const splits = await textSplitter.splitDocuments([doc]);
  await vectorStore.addDocuments(splits);
};

export { getAssigneeScore, addMemberToVectorStore };

/**
 * Get CSS class for task status badge
 */
export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'todo': 
      return 'task-status-todo';
    case 'in_progress': 
      return 'task-status-in-progress';
    case 'done': 
      return 'task-status-done';
    default: 
      return 'task-status-todo';
  }
};

/**
 * Format minutes into human-readable time string
 */
export const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

/**
 * Format status for display (replace underscores with spaces)
 */
export const formatStatus = (status: TaskStatus): string => {
  return status.replace('_', ' ');
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
};
