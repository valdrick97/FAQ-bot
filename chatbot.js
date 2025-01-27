const chatBox = document.getElementById("chatBox");
const chatContainer = document.getElementById("chatContainer");
const popupMessage = document.getElementById("popupMessage");
const categoryContainer = document.getElementById("categoryContainer");
let selectedCategory = null;
let faqData = [];
let categoryData = [];
let fuzzySet = null;

// Load FAQ data
fetch("faqData.json")
  .then((response) => response.json())
  .then((data) => {
    faqData = data.faqs;
    fuzzySet = FuzzySet(faqData.map((faq) => faq.question));
  })
  .catch((error) => console.error("Error loading FAQ data:", error));

// Load Categories
fetch("categories.json")
  .then((response) => response.json())
  .then((data) => {
    categoryData = data.categories;
    loadCategories();
  })
  .catch((error) => console.error("Error loading categories:", error));

// Ensure chat starts closed on load
document.addEventListener("DOMContentLoaded", () => {
  chatContainer.style.display = "none"; // Make sure chat is closed on load
  popupMessage.style.display = "block";
});

// Toggle chat visibility
function toggleChat() {
  if (chatContainer.style.display === "none" || chatContainer.style.display === "") {
    chatContainer.style.display = "flex";
    popupMessage.style.display = "none"; // Hide popup when chat is open
  } else {
    chatContainer.style.display = "none";
    popupMessage.style.display = "block"; // Show popup when chat is closed
  }
}

// Add message to chatbox
function addMessage(text, sender) {
  const message = document.createElement("div");
  message.className = `message ${sender}-message`;

  // Dim old bot messages
  if (sender === "bot") {
    const oldMessages = chatBox.querySelectorAll(".bot-message");
    oldMessages.forEach((msg) => msg.classList.add("dim"));
  }

  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
}

// Load categories into the chat
function loadCategories() {
  categoryData.forEach((category) => {
    const button = document.createElement("button");
    button.className = "category-button";
    button.textContent = category.name;
    button.onclick = () => toggleCategory(category.name, button);
    categoryContainer.appendChild(button);
  });
}

// Handle category selection
function toggleCategory(category, button) {
  const buttons = document.querySelectorAll(".category-button");
  buttons.forEach((btn) => btn.classList.remove("selected"));

  if (selectedCategory === category) {
    selectedCategory = null;
    addMessage("Category deselected. How may I help you?", "bot");
  } else {
    selectedCategory = category;
    button.classList.add("selected");
    addMessage(`What can I help you find in ${category}?`, "bot");
  }
}

// Handle user input and bot response
function sendMessage() {
  const userInput = document.getElementById("userInput").value.trim();
  if (!userInput) return;

  addMessage(userInput, "user");
  document.getElementById("userInput").value = "";

  if (selectedCategory) {
    // Check within the selected category
    const categoryQuestions = categoryData.find((cat) => cat.name === selectedCategory)?.questions || [];
    const match = categoryQuestions.find((question) => question.toLowerCase() === userInput.toLowerCase());

    if (match) {
      const answer = faqData.find((faq) => faq.question === match)?.answer;
      addMessage(answer || "I'm sorry, I don't have the answer to that question.", "bot");
    } else {
      // Fallback to other categories
      const bestMatch = fuzzySet.get(userInput);
      if (bestMatch && bestMatch[0][0] > 0.5) {
        const fallbackQuestion = bestMatch[0][1];
        const fallbackAnswer = faqData.find((faq) => faq.question === fallbackQuestion)?.answer;
        addMessage(
          `I couldn't find that under ${selectedCategory}. Would this help instead: ${fallbackAnswer}`,
          "bot"
        );
      } else {
        addMessage(`I couldn't find that in ${selectedCategory}. Please try asking another question.`, "bot");
      }
    }
  } else {
    // Fallback to fuzzy search if no category is selected
    const bestMatch = fuzzySet.get(userInput);
    if (bestMatch && bestMatch[0][0] > 0.5) {
      const matchedQuestion = bestMatch[0][1];
      const answer = faqData.find((faq) => faq.question === matchedQuestion)?.answer;
      addMessage(answer || "I'm sorry, I don't have the answer to that question.", "bot");
    } else {
      addMessage("I'm sorry, I couldn't find an answer to your question.", "bot");
    }
  }
}
