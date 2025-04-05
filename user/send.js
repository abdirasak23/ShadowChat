// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://xusyndocjpcnrwnjnwdr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1c3luZG9janBjbnJ3bmpud2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NzIwMTMsImV4cCI6MjA1OTM0ODAxM30.Z8T88Wp6PxFJOXshbng3qnWhsqL7fWBzhXHAYjqGhI0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get username from URL parameter
function getUsernameFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('to');
}

// Function to get user ID from username
async function getUserIdFromUsername(username) {
  try {
    const { data, error } = await supabase
      .from('usernames')
      .select('user_id')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Error fetching user ID:', error.message);
      return null;
    }
    
    return data.user_id;
  } catch (err) {
    console.error('Unexpected error getting user ID:', err.message);
    return null;
  }
}

// Function to send message to database
async function sendMessage(message, receiverId) {
  try {
    // Create timestamp for when message was sent
    const timestamp = new Date().toISOString();
    
    // Insert message into messages table
    const { data, error } = await supabase
      .from('messages')
      .insert([
        { 
          receiver_id: receiverId,
          message_text: message,
          sent_at: timestamp
        }
      ]);
    
    if (error) {
      console.error('Error sending message:', error.message);
      return false;
    }
    
    console.log('Message sent successfully');
    return true;
  } catch (err) {
    console.error('Unexpected error sending message:', err.message);
    return false;
  }
}

// Function to update UI with username
function updateUI(username) {
  // Update the title
  document.title = `@${username}`;
  
  // Update the username display
  const usernameElement = document.querySelector('.name h2');
  if (usernameElement) {
    usernameElement.textContent = `@${username}`;
  }
}

// Main initialization function
async function initializeSendPage() {
  // Get username from URL
  const username = getUsernameFromUrl();
  
  if (!username) {
    alert('No recipient specified. Please try again with a valid link.');
    return;
  }
  
  // Update UI with username
  updateUI(username);
  
  // Get the send button and message textarea
  const sendButton = document.querySelector('.send');
  const messageTextarea = document.querySelector('.message textarea');
  
  if (!sendButton || !messageTextarea) {
    console.error('Send button or message textarea not found.');
    return;
  }
  
  // Add click event listener to send button
  sendButton.addEventListener('click', async () => {
    // Get message text
    const messageText = messageTextarea.value.trim();
    
    if (!messageText) {
      alert('Please enter a message before sending.');
      return;
    }
    
    // Show loading state
    sendButton.textContent = 'Sending...';
    sendButton.disabled = true;
    
    try {
      // Get receiver's user ID from username
      const receiverId = await getUserIdFromUsername(username);
      
      if (!receiverId) {
        alert('Could not find the recipient. Please check the link and try again.');
        sendButton.textContent = 'Send';
        sendButton.disabled = false;
        return;
      }
      
      // Send the message
      const success = await sendMessage(messageText, receiverId);
      
      if (success) {
        // Clear the textarea
        messageTextarea.value = '';
        
        // Show success message
        sendButton.textContent = 'Sent!';
        
        // Reset button after 2 seconds
        setTimeout(() => {
          sendButton.textContent = 'Send';
          sendButton.disabled = false;
        }, 2000);
        
        // Optionally show a thank you message
        alert('Your anonymous message has been sent successfully!');
      } else {
        alert('Failed to send message. Please try again.');
        sendButton.textContent = 'Send';
        sendButton.disabled = false;
      }
    } catch (err) {
      console.error('Error in send process:', err);
      alert('An error occurred while sending your message. Please try again later.');
      sendButton.textContent = 'Send';
      sendButton.disabled = false;
    }
  });
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSendPage);