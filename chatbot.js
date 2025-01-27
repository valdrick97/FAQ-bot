const chatBox = document.getElementById('chatBox');
const chatContainer = document.getElementById('chatContainer');
const popupMessage = document.getElementById('popupMessage');
const categoryContainer = document.getElementById('categoryButtons'); // For category bubbles
let faqData = [];
let categories = [];
let fuzzySet = null;
let selectedCategory = null; // Track selected category

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

// Fetch Categories data from JSON file
fetch('categories.json')
  .then(response => response.json())
  .then(data => {
    categories = data;
    loadCategories(); // Dynamically load categories once data is fetched
  })
  .catch(error => {
    console.error('Error loading category data:', error);
    categories = [];
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

  if (selectedCategory) {
    // Filter FAQs by selected category
    const categoryFaqs = faqData.filter(f => f.category === selectedCategory);
    const categoryFuzzySet = FuzzySet(categoryFaqs.map(f => f.question));
    let categoryMatch = categoryFuzzySet.get(userInput);

    if (categoryMatch && categoryMatch.length > 0 && categoryMatch[0][0] > 0.5) {
      // Match found in selected category
      let matchedQuestion = categoryMatch[0][1];
      let faq = categoryFaqs.find(f => f.question === matchedQuestion);
      response = faq ? faq.answer : response;
    } else if (bestMatch && bestMatch.length > 0 && bestMatch[0][0] > 0.5) {
      // Suggest an answer from another category
      let matchedQuestion = bestMatch[0][1];
      let faq = faqData.find(f => f.question === matchedQuestion);
      if (faq) {
        response = `I can't find that answer under the "${selectedCategory}" category. Would this answer from another category help?\n\n${faq.answer}`;
      }
    }
  } else {
    // No category selected; use global FAQ search
    if (bestMatch && bestMatch.length > 0 && bestMatch[0][0] > 0.5) {
      let matchedQuestion = bestMatch[0][1];
      let faq = faqData.find(f => f.question === matchedQuestion);
      response = faq ? faq.answer : response;
    }
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

    button.onclick = () => toggleCategorySelection(category.name, button);
    categoryContainer.appendChild(button);
  });
}

// Toggle category selection
function toggleCategorySelection(categoryName, button) {
  if (selectedCategory === categoryName) {
    // If the same category is clicked again, unselect it
    selectedCategory = null;
    button.classList.remove('selected');
    addMessage("You can select a category or ask a question.", 'bot');
  } else {
    // Select a new category
    const buttons = document.querySelectorAll('.category-button');
    buttons.forEach(btn => btn.classList.remove('selected')); // Clear previous selection
    button.classList.add('selected');

    selectedCategory = categoryName;
    addMessage(`What can I help you find in ${categoryName}?`, 'bot');
  }
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
