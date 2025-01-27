const chatBox = document.getElementById('chatBox');
const chatContainer = document.getElementById('chatContainer');
const popupMessage = document.getElementById('popupMessage');
const categoryContainer = document.getElementById('categoryContainer');
let faqData = [];
let fuzzySet = null;

// Categories and questions
const categories = [
  { name: "Casino", questions: ["When is the casino open?", "What are the casino hours?"] },
  { name: "LMS", questions: ["How do I do a B2B?", "How do I reset my password?"] },
  { name: "Discounts", questions: ["What are this month's discount offers?", "Do you offer any discounts?"] },
  { name: "Support", questions: ["How do I contact support?", "What is the support number?"] }
];

// Fetch FAQ data from JSON file
fetch('faqData.json')
  .then(response => response.json())
  .then(data => {
    faqData = data.faqs;
    fuzzySet = FuzzySet(faqData.map(faq => faq.question));
    loadCategories();
  })
  .catch(error => {
    console.error('Error loading FAQ data:', error);
    faqData = [];
  });

// Add message to chatbox
function addMessage(text, sender) {
  const message = document.createElement('div');
  message.className = `message ${sender}-message`;
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Send message when user presses enter
document.getElementById('userInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Handle user input and bot response
function sendMessage() {
  const userInput = document.getElementById('userInput').value;
  if (!userInput.trim()) return;

  addMessage(userInput, 'user');

  let bestMatch = fuzzySet.get(userInput);
  let response = "I'm sorry, I don't understand that question.";

  if (bestMatch && bestMatch.length > 0 && bestMatch[0][0] > 0.5) {
    let matchedQuestion = bestMatch[0][1];
    let faq = faqData.find(f => f.question === matchedQuestion);
    response = faq ? faq.answer : response;
  }

  addMessage(response, 'bot');
  document.getElementById('userInput').value = '';
}

// Toggle chat container visibility
function toggleChat() {
  chatContainer.style.display =
    chatContainer.style.display === 'none' || chatContainer.style.display === '' ? 'block' : 'none';
}

// Load categories into the chat
function loadCategories() {
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'category-button';
    button.textContent = category.name;
    button.onclick = () => showQuestions(category);
    categoryContainer.appendChild(button);
  });
}

// Show questions for selected category
function showQuestions(category) {
  const categoryQuestions = category.questions;
  categoryQuestions.forEach(question => {
    addMessage(question, 'bot');
  });

  // Ask if the user wants to ask another question
  addMessage("Would you like to ask another question or change the category?", 'bot');
}

// Show the pop-up message randomly
function showPopupMessage() {
  const randomDelay = Math.floor(Math.random() * (9000 - 7000 + 1)) + 7000; // Random delay between 7-9 seconds
  setTimeout(() => {
    popupMessage.style.display = 'block';
    setTimeout(() => {
      popupMessage.style.display = 'none';
    }, 5000); // Hide the message after 3 seconds
  }, randomDelay);
}

// Call showPopupMessage randomly
setInterval(showPopupMessage, Math.random() * (30000 - 20000) + 20000); // Random intervals between 30-20 seconds
