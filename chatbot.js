const chatBox = document.getElementById('chatBox');
const chatContainer = document.getElementById('chatContainer');
const popupMessage = document.getElementById('popupMessage');
const categoryContainer = document.getElementById('categoryButtons'); // Updated for clarity
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
  const isChatOpen = chatContainer.style.display === 'block';
  chatContainer.style.display = isChatOpen ? 'none' : 'block';

  // Hide pop-up message when the chat is opened
  if (!isChatOpen) {
    popupMessage.style.display = 'none';
  }
}

// Load categories into the chat
function loadCategories() {
  categoryContainer.innerHTML = ''; // Clear existing buttons (if any)
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'category-button';
    button.textContent = category.name;
    button.onclick = () => selectCategory(category.name);
    categoryContainer.appendChild(button);
  });
}

// Handle category selection
function selectCategory(categoryName) {
  const buttons = document.querySelectorAll('.category-button');
  buttons.forEach(button => button.classList.remove('selected')); // Clear selected state

  const selectedButton = Array.from(buttons).find(button => button.textContent === categoryName);
  if (selectedButton) selectedButton.classList.add('selected');

  const category = categories.find(cat => cat.name === categoryName);
  if (category) {
    showQuestions(category);
  }
}

// Show questions for selected category
function showQuestions(category) {
  chatBox.innerHTML = ''; // Clear chat box
  category.questions.forEach(question => {
    addMessage(question, 'bot');
  });

  addMessage("Would you like to ask another question or change the category?", 'bot');
}

// Show the pop-up message randomly
function showPopupMessage() {
  const isChatOpen = chatContainer.style.display === 'block';
  if (!isChatOpen) {
    popupMessage.style.display = 'block';
    setTimeout(() => {
      popupMessage.style.display = 'none';
    }, 5000); // Hide the message after 5 seconds
  }
}

// Call showPopupMessage randomly
setInterval(showPopupMessage, Math.random() * (30000 - 20000) + 20000); // Random intervals between 20-30 seconds

// Initialize categories on page load
loadCategories();
