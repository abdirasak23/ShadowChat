import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://xusyndocjpcnrwnjnwdr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1c3luZG9janBjbnJ3bmpud2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NzIwMTMsImV4cCI6MjA1OTM0ODAxM30.Z8T88Wp6PxFJOXshbng3qnWhsqL7fWBzhXHAYjqGhI0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

let messagesSubscription = null;

async function getCurrentUserId() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      console.error('Error getting session:', error?.message);
      return null;
    }
    return session.user.id;
  } catch (err) {
    console.error('Error getting user ID:', err.message);
    return null;
  }
}

function getDateString(timestamp) {
  const messageDate = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (messageDate.toDateString() === now.toDateString()) return 'Today';
  if (messageDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return messageDate.toLocaleDateString();
}

function formatMessageTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function fetchUserMessages() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', userId)
      .order('sent_at', { ascending: false });

    if (error) throw error;
    displayMessages(messages || []);
  } catch (err) {
    console.error('Fetch messages error:', err.message);
  }
}

function displayMessages(messages) {
  const main = document.querySelector('.main');
  main.querySelectorAll('.message-bar, .date-heading').forEach(el => el.remove());

  const headingElement = document.querySelector('.main h3');
  headingElement.textContent = `Messages (${messages.length})`;

  if (!messages.length) {
    const noMessagesDiv = document.createElement('div');
    noMessagesDiv.className = 'message-bar';
    noMessagesDiv.innerHTML = `
      <div class="message-content">
        <div class="message-center">
          <p class="message">You don't have any messages yet.</p>
        </div>
      </div>
    `;
    main.appendChild(noMessagesDiv);
    return;
  }

  const groupedMessages = messages.reduce((acc, msg) => {
    const dateGroup = getDateString(msg.sent_at);
    acc[dateGroup] = [...(acc[dateGroup] || []), msg];
    return acc;
  }, {});

  Object.entries(groupedMessages).forEach(([dateGroup, groupMessages]) => {
    if (dateGroup !== 'Today') {
      const heading = document.createElement('h4');
      heading.className = 'date-heading';
      heading.textContent = dateGroup;
      main.appendChild(heading);
    }

    const container = document.createElement('div');
    container.className = 'message-container';

    groupMessages.forEach(msg => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message-center';
      messageElement.innerHTML = `
        <div class="head">
          <div class="profile">
            <img src="images/user.jpeg" alt="Anonymous">
          </div>
          <p class="user">Anonymous Sender</p>
        </div>
        <div class="message">
          <p class="message-text">${msg.message_text}</p>
        </div>
      `;
      container.appendChild(messageElement);
    });

    const timeElement = document.createElement('div');
    timeElement.className = 'time';
    timeElement.textContent = dateGroup === 'Today' 
      ? `Today ${formatMessageTime(groupMessages[0].sent_at)}`
      : formatMessageTime(groupMessages[0].sent_at);

    const bar = document.createElement('div');
    bar.className = 'message-bar';
    bar.appendChild(container);
    bar.appendChild(timeElement);
    main.appendChild(bar);
  });
}

async function subscribeToNewMessages() {
  const userId = await getCurrentUserId();
  if (!userId || messagesSubscription) return;

  messagesSubscription = supabase
    .channel('messages-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      },
      () => fetchUserMessages()
    )
    .subscribe();
}

async function unsubscribeFromMessages() {
  if (messagesSubscription) {
    await supabase.removeChannel(messagesSubscription);
    messagesSubscription = null;
  }
}

  document.querySelector('.menu').addEventListener('click', function() {
    const navs = document.querySelector('.navs');
    navs.classList.toggle('active');
    const icon = this.querySelector('i');
    icon.classList.toggle('bx-menu');
    icon.classList.toggle('bx-x');
});

// Close menu when clicking any nav link
document.querySelectorAll('.navs a').forEach(link => {
    link.addEventListener('click', () => {
        const navs = document.querySelector('.navs');
        const menuIcon = document.querySelector('.menu i');
        
        // Close menu
        navs.classList.remove('active');
        
        // Reset menu icon
        menuIcon.classList.add('bx-menu');
        menuIcon.classList.remove('bx-x');
    });
});

async function handleCopyLink(event) {
  event.preventDefault();
  
  // Get all copy-related elements
  const copyContainers = document.querySelectorAll('.copy-bar, .privacy-policy');
  const copyIcons = document.querySelectorAll('.copy-bar i, .privacy-policy i');
  const copyLinkText = document.querySelector('.privacy-policy a');
  
  // Store original states
  const originalIconClasses = Array.from(copyIcons).map(icon => icon.className);
  const originalText = copyLinkText?.textContent || '';

  // Show loading state
  copyIcons.forEach(icon => {
    icon.className = 'bx bx-loader-circle animate-spin';
  });
  if (copyLinkText) copyLinkText.textContent = 'Copying...';

  try {
    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('You need to be logged in to copy your link.');
    }

    // Get username
    const { data: userData, error: userError } = await supabase
      .from('names')
      .select('username')
      .eq('user_id', session.user.id)
      .single();

    if (userError || !userData?.username) {
      throw new Error(userError?.message || 'No username found');
    }

    // Generate link
    const shareableLink = `${window.location.origin}/send.html#to=${encodeURIComponent(userData.username)}`;

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareableLink);
    } catch (clipboardError) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareableLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    // Update UI to success state
    copyIcons.forEach(icon => {
      icon.className = 'bx bxs-check-circle';
    });
    if (copyLinkText) copyLinkText.textContent = 'Copied!';

  } catch (error) {
    // Handle errors
    console.error('Copy failed:', error);
    alert(error.message);
    
    // Reset immediately on error
    copyIcons.forEach((icon, index) => {
      icon.className = originalIconClasses[index];
    });
    if (copyLinkText) copyLinkText.textContent = originalText;
    return;
  }

  // Reset to original state after 2 seconds
  setTimeout(() => {
    copyIcons.forEach((icon, index) => {
      icon.className = originalIconClasses[index];
    });
    if (copyLinkText) copyLinkText.textContent = originalText;
  }, 2000);
}

// Add event listeners to all copy elements
document.querySelectorAll('.copy-bar, .privacy-policy').forEach(element => {
  element.addEventListener('click', handleCopyLink);
});

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

function handleLogout() {
  supabase.auth.signOut()
    .then(() => window.location.href = '/index.html')
    .catch(err => console.error('Logout error:', err.message));
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!await checkAuth()) return;

  fetchUserMessages();
  subscribeToNewMessages();

  document.querySelector('.privacy-policy')?.addEventListener('click', copyUserLink);
  document.getElementById('logout')?.addEventListener('click', handleLogout);
});

window.addEventListener('beforeunload', unsubscribeFromMessages);


