import { Email, Priority } from "../types";
// import { generateSummary } from "./huggingface";

const URGENT_KEYWORDS = [
  "urgent",
  "asap",
  "deadline",
  "important",
  "priority",
  "critical",
  "emergency",
  "action required",
  "immediate",
  "time sensitive",
];

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Initialize Gmail client
export const initGmailClient = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    window.gapi.client
      .init({
        apiKey: GOOGLE_API_KEY,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
        ],
      })
      .then(resolve)
      .catch((err) => {
        console.error("Error initializing Gmail client:", err);
        reject(err);
      });
  });
};

// export const fetchEmails = async (
//   accessToken: string,
//   maxResults = 50
// ): Promise<Email[]> => {
//   if (!window.gapi?.client?.gmail) {
//     throw new Error("GAPI client is not initialized. Please try again later.");
//   }

//   window.gapi.client.setToken({ access_token: accessToken });

//   const response = await window.gapi.client.gmail.users.messages.list({
//     userId: "me",
//     maxResults,
//     q: "in:inbox",
//   });

//   const messages = response.result.messages;
//   if (!messages) return [];

//   const emails = await Promise.all(
//     messages.map(async ({ id }) => {
//       const message = await window.gapi.client.gmail.users.messages.get({
//         userId: "me",
//         id,
//         format: "full",
//       });
//       return processEmail(message.result);
//     })
//   );

//   return emails;
// };

export const fetchEmails = async (
  accessToken: string,
  maxResults = 50
): Promise<Email[]> => {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  };

  // Step 1: Get list of message IDs
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=in:inbox`,
    { headers }
  );

  if (!listRes.ok) {
    throw new Error("Failed to fetch email list");
  }

  const listData = await listRes.json();
  const messages = listData.messages;
  if (!messages) return [];

  // Step 2: Fetch each message by ID
  const emails = await Promise.all(
    messages.map(async ({ id }: { id: string }) => {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
        { headers }
      );

      if (!msgRes.ok) {
        console.warn(`Failed to fetch email with ID: ${id}`);
        return null;
      }

      const msgData = await msgRes.json();
      return processEmail(msgData);
    })
  );

  // Filter out null responses (failed fetches)
  return emails.filter((email): email is Email => email !== null);
};



// Process individual email message
const processEmail = async (message: any): Promise<Email> => {
  const { payload, snippet, labelIds = [], id, threadId } = message;
  const headers = payload.headers || [];

  const subject = getHeader(headers, "Subject");
  const from = getHeader(headers, "From");
  const date = getHeader(headers, "Date");

  const { name: senderName, email: senderEmail } = parseSender(from);
  const body = extractEmailBody(payload);
  const isRead = !labelIds.includes("UNREAD");
  const isStarred = labelIds.includes("STARRED");

  const email: Email = {
    id,
    threadId,
    sender: { name: senderName, email: senderEmail },
    subject,
    snippet: snippet || "",
    body,
    receivedAt: new Date(date),
    isRead,
    isStarred,
    labels: labelIds,
    priority: determineHeuristicPriority(isStarred, subject, body),
    summary: snippet,
  };

  if (body.length > 100) {
    try {
      email.summary = await generateSummary(body);
    } catch (err) {
      console.error("Summary generation failed:", err);
    }
  }

  return email;
};

// Extract specific header
const getHeader = (headers: any[], name: string): string =>
  headers.find((h) => h.name === name)?.value || "";

// Parse sender info
const parseSender = (from: string): { name: string; email: string } => {
  const match = from.match(/(.*)\s<(.+)>/);
  return match
    ? { name: match[1].trim(), email: match[2].trim() }
    : { name: "", email: from };
};

// Decode and concatenate body
const extractEmailBody = (payload: any): string => {
  let data = "";

  const decodeBase64 = (str: string) =>
    atob(str.replace(/-/g, "+").replace(/_/g, "/"));

  if (payload.parts?.length) {
    payload.parts.forEach((part: any) => {
      if (part.mimeType === "text/plain" && part.body?.data) {
        data += decodeBase64(part.body.data);
      }
    });
  } else if (payload.body?.data) {
    data += decodeBase64(payload.body.data);
  }

  return data;
};

// Priority heuristic
export const determineHeuristicPriority = (
  isStarred: boolean,
  subject: string,
  body: string
): Priority => {
  if (isStarred) return "high";

  const combined = `${subject} ${body}`.toLowerCase();
  const hasUrgency = URGENT_KEYWORDS.some((kw) => combined.includes(kw));

  return hasUrgency ? "high" : "medium";
};

// import { Email, Priority } from "../types";
// import { generateSummary } from "./huggingface";

// // List of keywords that might indicate high priority emails
// const URGENT_KEYWORDS = [
//   "urgent",
//   "asap",
//   "deadline",
//   "important",
//   "priority",
//   "critical",
//   "emergency",
//   "action required",
//   "immediate",
//   "time sensitive",
// ];

// const GOOGLE_API_KEY= import.meta.env.VITE_GOOGLE_API_KEY;

// // // Function to initialize the Gmail API client
// // export const initGmailClient = async (): Promise<void> => {
// //   return new Promise((resolve) => {
// //     window.gapi.client
// //       .init({
// //         apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
// //         discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
// //       })
// //       .then(() => {
// //         resolve();
// //       });
// //   });
// // };

// export const initGmailClient = async (): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

//     window.gapi.client
//       .init({
//         apiKey,
//         discoveryDocs: [
//           "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
//         ],
//       })
//       .then(resolve)
//       .catch((err) => {
//         console.error("Error initializing Gmail client:", err);
//         reject(err);
//       });
//   });
// };

// // Function to fetch emails from Gmail API
// export const fetchEmails = async (accessToken: string, maxResults = 50): Promise<Email[]> => {
//   // Set the access token for the API requests
//   window.gapi.client.setToken({ access_token: accessToken });

//   // Fetch the list of emails
//   const response = await window.gapi.client.gmail.users.messages.list({
//     userId: "me",
//     maxResults,
//     q: "in:inbox",
//   });

//   if (!response.result.messages) {
//     return [];
//   }

//   // Process each email to get its full content and information
//   const emailPromises = response.result.messages.map(async (message) => {
//     const emailData = await window.gapi.client.gmail.users.messages.get({
//       userId: "me",
//       id: message.id,
//       format: "full",
//     });

//     return processEmail(emailData.result);
//   });

//   const emails = await Promise.all(emailPromises);
//   return emails;
// };

// // Process raw email data from the Gmail API
// const processEmail = async (messageData: any): Promise<Email> => {
//   const headers = messageData.payload.headers;
//   const parts = messageData.payload.parts || [];

//   // Extract email headers
//   const subject = headers.find((header: any) => header.name === "Subject")?.value || "";
//   const from = headers.find((header: any) => header.name === "From")?.value || "";
//   const date = headers.find((header: any) => header.name === "Date")?.value || "";

//   // Parse sender information
//   let senderName = "";
//   let senderEmail = "";

//   const senderMatch = from.match(/(.*)\s<(.*)>/);
//   if (senderMatch) {
//     senderName = senderMatch[1];
//     senderEmail = senderMatch[2];
//   } else {
//     senderEmail = from;
//   }

//   // Extract the email body
//   let body = "";

//   // Check if there are parts to the message
//   if (parts.length > 0) {
//     parts.forEach((part: any) => {
//       if (part.mimeType === "text/plain" && part.body.data) {
//         const decodedBody = atob(
//           part.body.data.replace(/-/g, "+").replace(/_/g, "/")
//         );
//         body += decodedBody;
//       }
//     });
//   } else if (messageData.payload.body && messageData.payload.body.data) {
//     // Handle case where there are no parts
//     const decodedBody = atob(
//       messageData.payload.body.data.replace(/-/g, "+").replace(/_/g, "/")
//     );
//     body += decodedBody;
//   }

//   // Extract labels
//   const labels = messageData.labelIds || [];
//   const isRead = !labels.includes("UNREAD");
//   const isStarred = labels.includes("STARRED");

//   // Create the email object
//   const email: Email = {
//     id: messageData.id,
//     threadId: messageData.threadId,
//     sender: {
//       name: senderName,
//       email: senderEmail,
//     },
//     subject,
//     snippet: messageData.snippet || "",
//     body,
//     receivedAt: new Date(date),
//     isRead,
//     isStarred,
//     labels,
//     priority: determineHeuristicPriority(isStarred, subject, body),
//   };

//   // Generate AI summary (if enough content)
//   if (body.length > 100) {
//     try {
//       email.summary = await generateSummary(body);
//     } catch (error) {
//       console.error("Error generating summary:", error);
//     }
//   } else {
//     email.summary = messageData.snippet;
//   }

//   return email;
// };

// // Determine email priority using heuristic rules
// export const determineHeuristicPriority = (
//   isStarred: boolean,
//   subject: string,
//   body: string
// ): Priority => {
//   // Check if email is starred (high priority)
//   if (isStarred) {
//     return "high";
//   }

//   // Check for urgent keywords in subject and body
//   const combinedText = `${subject.toLowerCase()} ${body.toLowerCase()}`;

//   // Check for urgent keywords
//   const hasUrgentKeyword = URGENT_KEYWORDS.some(keyword =>
//     combinedText.includes(keyword.toLowerCase())
//   );

//   if (hasUrgentKeyword) {
//     return "high";
//   }

//   // Default to medium priority
//   // In a real app, we would use the AI-based priority ranking here
//   // as a fallback, but for now we'll use a simple default
//   return "medium";
// };
