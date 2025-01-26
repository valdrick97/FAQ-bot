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

  // Show the popup message only when the chat is closed
  if (!isChatOpen) {
    setTimeout(() => {
      popupMessage.style.display = 'block';
      setTimeout(() => {
        popupMessage.style.display = 'none';
      }, 5000); // Hide the popup after 5 seconds
    }, 3000); // Delay popup appearance after chat is closed
  } else {
    popupMessage.style.display = 'none'; // Hide the popup if the chat is open
  }
}

// Random pop-up message
function showPopupMessage() {
  // Ensure the popup appears only if the chat is closed
  if (chatContainer.style.display !== 'block') {
    popupMessage.style.display = 'block';
    setTimeout(() => {
      popupMessage.style.display = 'none';
    }, 5000); // Hide the popup after 5 seconds
  }
}

// Call showPopupMessage randomly
setInterval(showPopupMessage, Math.random() * (30000 - 20000) + 20000); // Random intervals between 20-30 seconds
