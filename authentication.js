// Import the Supabase client from the CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase with your project's URL and public anon key
const supabaseUrl = 'https://xusyndocjpcnrwnjnwdr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1c3luZG9janBjbnJ3bmpud2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NzIwMTMsImV4cCI6MjA1OTM0ODAxM30.Z8T88Wp6PxFJOXshbng3qnWhsqL7fWBzhXHAYjqGhI0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// DOM Elements
const modals = {
  register: document.querySelector('.blur'),
  login: document.querySelector('.blur2')
};

// Registration Functionality
async function handleRegistration(event) {
  event.preventDefault();

  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const termsCheckbox = document.getElementById('terms');

  if (!usernameInput || !emailInput || !passwordInput || !termsCheckbox) {
    showError('Please fill all required fields');
    return;
  }

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!termsCheckbox.checked) {
    showError('You must agree to the terms and privacy policy');
    return;
  }

  try {
    // User registration
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });

    if (error) throw error;

    // Save username to separate table
    const { error: insertError } = await supabase
      .from('usernames')
      .insert([{ user_id: data.user.id, username }]);

    if (insertError) throw insertError;

    hideModal('register');
    window.location.href = 'messages.html';
  } catch (error) {
    showError(error.message);
  }
}

// Login Functionality
async function handleLogin(event) {
  event.preventDefault();

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showError('Please fill in all login fields');
    return;
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    hideModal('login');
    window.location.href = 'messages.html';
  } catch (error) {
    showError(error.message);
  }
}

// Auth Check and Redirect
async function checkAuthAndRedirect() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (session) window.location.href = 'messages.html';
  } catch (error) {
    console.error('Auth check error:', error.message);
  }
}

// UI Helpers
function showError(message) {
  alert(message); // Replace with your custom error display
}

function hideModal(modalType) {
  if (modals[modalType]) {
    modals[modalType].style.display = 'none';
  }
}

function showModal(modalType) {
  if (modals[modalType]) {
    modals[modalType].style.display = 'block';
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Auth check
  if (!window.location.pathname.includes('messages.html')) {
    checkAuthAndRedirect();
  }

  // Registration handlers
  document.getElementById('register')?.addEventListener('click', () => showModal('register'));
  document.querySelector('.blur .register-btn')?.addEventListener('click', handleRegistration);

  // Login handlers
  document.querySelectorAll('.login').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showModal('login');
    });
  });
  document.querySelector('.blur2 .register-btn')?.addEventListener('click', handleLogin);

  // Modal close buttons
  document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.blur').style.display = 'none';
    });
  });

  // Switch between modals
  document.querySelector('.already a')?.addEventListener('click', (e) => {
    e.preventDefault();
    hideModal('login');
    showModal('register');
  });
});