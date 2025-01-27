const chatBox = document.getElementById('chatBox');
const chatContainer = document.getElementById('chatContainer');
const popupMessage = document.getElementById('popupMessage');
let faqData = [];
let fuzzySet = null;

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

// Handle user input and bot response
function sendMessage() {
  const userInput = document.getElementById('userInput').value;
  if (!userInput.trim()) return;

  addMessage(userInput, 'user');

  let bestMatch = fuzzySet.get(userInput);
  let response = "I'm sorry, I don't understand that question.";

  // Check if the user wants to filter by category
  const categoryMatch = faqData.filter(f => userInput.toLowerCase().includes(f.category));
  if (categoryMatch.length > 0) {
    bestMatch = fuzzySet.get(categoryMatch[0].question); // Narrow down to the category
  }

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

// Random pop-up message
function showPopupMessage() {
  const randomDelay = Math.floor(Math.random() * (9000 - 7000 + 1)) + 7000; // Random delay between 7-9 seconds
  setTimeout(() => {
    popupMessage.style.display = 'block';
    setTimeout(() => {
      popupMessage.style.display = 'none';
    }, 5000); // Hide the message after 5 seconds
  }, randomDelay);
}

// Call showPopupMessage randomly
setInterval(showPopupMessage, Math.random() * (30000 - 20000) + 20000); // Random intervals between 20-30 seconds
