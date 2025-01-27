const chatBox = document.getElementById("chatBox");
const categoryButtons = document.getElementById("categoryButtons");
let selectedCategory = null;

// Center the bubbles and handle selection
function loadCategories() {
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "category-button";
    button.textContent = category.name;

    button.onclick = () => {
      if (selectedCategory === category.name) {
        // Deselect category if clicked again
        selectedCategory = null;
        button.classList.remove("active");
        addMessage("Category deselected. How can I help you?", "bot");
      } else {
        // Select a new category
        selectedCategory = category.name;
        document.querySelectorAll(".category-button").forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        addMessage(`What can I help you find in ${category.name}?`, "bot");
      }
    };

    categoryButtons.appendChild(button);
  });
}

// Add messages with dimming for previous ones
function addMessage(text, sender) {
  // Dim previous messages
  const messages = document.querySelectorAll(".message");
  messages.forEach((message) => message.classList.remove("new"));

  const message = document.createElement("div");
  message.className = `message ${sender}-message new`;
  message.textContent = text;

  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
}

// Handle sending messages
function sendMessage() {
  const userInput = document.getElementById("userInput").value;
  if (!userInput.trim()) return;

  addMessage(userInput, "user");

  if (selectedCategory) {
    // Filter questions by category
    const categoryQuestions = faqData.filter((faq) => faq.category === selectedCategory);
    const fuzzySet = FuzzySet(categoryQuestions.map((q) => q.question));

    let bestMatch = fuzzySet.get(userInput);
    if (bestMatch && bestMatch[0][0] > 0.5) {
      const matchedQuestion = bestMatch[0][1];
      const answer = categoryQuestions.find((faq) => faq.question === matchedQuestion).answer;
      addMessage(answer, "bot");
    } else {
      addMessage(`I couldn't find that in ${selectedCategory}.`, "bot");
    }
  } else {
    // Use global fuzzy search
    let bestMatch = fuzzySet.get(userInput);
    if (bestMatch && bestMatch[0][0] > 0.5) {
      const matchedQuestion = bestMatch[0][1];
      const answer = faqData.find((faq) => faq.question === matchedQuestion).answer;
      addMessage(answer, "bot");
    } else {
      addMessage("I'm sorry, I don't understand that question.", "bot");
    }
  }

  document.getElementById("userInput").value = "";
}

// Initialize categories and chat behavior
loadCategories();
