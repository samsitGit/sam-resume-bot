const chatHistoryElement = document.getElementById("chat-history");
const userInputField = document.getElementById("user-input");
const submitButton = document.getElementById("submit-button");

let isChatbotResponding = false;
let usedResponses = [];

const responsesLibrary = [
    "Feel free to ask me anything about Sam's resume or career.",
    "I'm here to help you learn more about Sam and his skills.",
    "Sam is a skilled developer with experience in various programming languages.",
    "His resume showcases his achievements and expertise in the field.",
    "You can also view his resume by clicking the 'View Resume' button.",
    "If you have any specific questions, feel free to ask!",
    "No, I'm not reading what you say at all.",
    "Yes, Sam is still working on me.",
    "Maybe he will figure out how to do this on RIT website eventually."
];

submitButton.addEventListener("click", () => {
    sendMessage();
});

userInputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

userInputField.setAttribute("autocomplete", "off");

function sendMessage() {
    const userMessage = userInputField.value;
    if (userMessage.trim() !== "" && !isChatbotResponding) {
        appendUserMessage(userMessage);
        sendMessageToChatbot();
        userInputField.value = '';
    }
}

function appendUserMessage(message) {
    const messageDiv = createMessageDiv("user-message");
    messageDiv.innerHTML = `<img class="message-image" src="user.avif" alt="User Image">` +
                            `<div class="message-text">${message}</div>`;
    chatHistoryElement.appendChild(messageDiv);
}

function appendChatbotMessage(message) {
    const messageDiv = createMessageDiv("chatbot-message");
    messageDiv.innerHTML = `<img class="message-image" src="bot.jpg" alt="Chatbot Image">` +
                            `<div class="message-text"></div>`;
    chatHistoryElement.appendChild(messageDiv);

    const messageTextDiv = messageDiv.querySelector(".message-text");

    const words = message.split(" ");
    let wordIndex = 0;
    const typingInterval = 50; // Milliseconds between phrases

    const typingIntervalId = setInterval(() => {
        if (wordIndex <= words.length) {
            messageTextDiv.textContent = words.slice(0, wordIndex).join(" ");
            wordIndex++;
        } else {
            clearInterval(typingIntervalId);
            isChatbotResponding = false; // Chatbot response is complete
        }
    }, typingInterval);
    
    chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
}

let botMessageCount = 0;

function getRandomResponse() {
    let selectableResponses = responsesLibrary.filter(response => !usedResponses.includes(response));

    if (selectableResponses.length === 0) {
        usedResponses = [];
        botMessageCount = 0;
        selectableResponses = responsesLibrary.filter(response => !response.endsWith("No, I'm not reading what you say at all.") &&
                                                               !response.endsWith("Yes, Sam is still working on me.") &&
                                                               !response.endsWith("Maybe he will figure out how to do this on RIT website eventually."));
    }

    let selectedResponse;

    if (botMessageCount === 0) {
        selectedResponse = selectableResponses.shift();
        botMessageCount++;
    } else {
        const randomIndex = Math.floor(Math.random() * selectableResponses.length);
        selectedResponse = selectableResponses[randomIndex];
    }

    usedResponses.push(selectedResponse);
    return selectedResponse;
}

function sendMessageToChatbot() {
    const userMessage = userInputField.value;
    isChatbotResponding = true; // Chatbot is currently responding
    if (userMessage.trim() !== "") {

        fetch('http://localhost:3000/getChatbotResponse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userInput: userMessage,
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.error)
            if (data.error == 'Error fetching chatbot response') {
                const randomResponse = getRandomResponse();
                appendChatbotMessage(randomResponse);
                chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
            }
            else {
                appendChatbotMessage(data.message);
                chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
            }
        })
        .catch(error => {
            console.error('Error fetching chatbot response:', error);
            const randomResponse = getRandomResponse();
            appendChatbotMessage(randomResponse);
            chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
        });

        userInputField.value = '';
    }
}

function createMessageDiv(className) {
    const div = document.createElement("div");
    div.className = `message ${className}`;
    return div;
}

// Create "View Resume" button
const viewResumeButton = document.createElement("a");
viewResumeButton.href = "resume.pdf";
viewResumeButton.target = "_blank";
viewResumeButton.classList.add("view-resume-button");
viewResumeButton.textContent = "View Resume";

// Append the button to the header
const header = document.querySelector("h1");
header.appendChild(viewResumeButton);

// Automatically send introductory message when the page loads
window.onload = () => {
    const introMessage = "Hi, I am Sam's Resume Bot. Feel free to ask me any questions about his resume or career!";
    appendChatbotMessage(introMessage);
    chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
};
