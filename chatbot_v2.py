import random
import pyttsx3
import speech_recognition as sr
import time

# ------------------- Voice Setup -------------------
engine = pyttsx3.init()

def speak(text):
    engine.say(text)
    engine.runAndWait()

# ------------------- Chatbot Memory -------------------
memory = {
    "name": None,
    "last_mood": None,
    "last_topic": None
}

# ------------------- Chatbot Dataset -------------------
responses = {
    "greeting": ["Hello {name}! How are you today?", "Hey {name}! Good to see you ", "Hi {name}! How’s it going?"],
    "sad": ["I’m sorry to hear that, {name}. Want to talk about it?", "Oh no! {name}, hope things get better soon!"],
    "happy": ["Yay! That’s awesome, {name} ", "Great to hear that, {name}! Keep smiling!"],
    "movie": ["I recommend Inception!", "Try watching The Pursuit of Happyness.", "You might like Interstellar."],
    "joke": ["Why did the computer go to the doctor? Because it caught a virus! ",
             "Why was the math book sad? It had too many problems! "],
    "bye": ["Goodbye, {name}! Have a great day!", "See you later, {name}! Take care!"]
}

# ------------------- Chatbot Function -------------------
def chatbot(user_input):
    user_input = user_input.lower()
    response = "I didn’t get that. Can you say it differently?"

    # Memory-based greetings
    if "my name is" in user_input:
        memory["name"] = user_input.split("my name is")[-1].strip().title()
        response = f"Nice to meet you, {memory['name']}! "

    elif any(word in user_input for word in ["hi", "hello", "hey"]):
        name = memory["name"] if memory["name"] else "there"
        response = random.choice(responses["greeting"]).replace("{name}", name)

    elif "i am sad" in user_input or "i feel sad" in user_input:
        memory["last_mood"] = "sad"
        name = memory["name"] if memory["name"] else "friend"
        response = random.choice(responses["sad"]).replace("{name}", name)

    elif "i am happy" in user_input or "i feel happy" in user_input:
        memory["last_mood"] = "happy"
        name = memory["name"] if memory["name"] else "friend"
        response = random.choice(responses["happy"]).replace("{name}", name)

    elif "recommend movie" in user_input:
        response = random.choice(responses["movie"])
        memory["last_topic"] = "movie"

    elif "tell me a joke" in user_input:
        response = random.choice(responses["joke"])

    elif "bye" in user_input:
        name = memory["name"] if memory["name"] else "friend"
        response = random.choice(responses["bye"]).replace("{name}", name)

    # Context-aware follow-up
    elif "how are you" in user_input:
        if memory["last_mood"] == "sad":
            response = "You said you were sad earlier, are you feeling better now?"
        elif memory["last_mood"] == "happy":
            response = "You were happy earlier! Hope the good mood continues "
        else:
            response = "I’m doing great! How about you?"

    return response

# ------------------- Main Chat Loop -------------------
print("Chatbot: Hello! I am your friendly chatbot. Type 'bye' to exit.")

while True:
    mode = input("Type '1' for text chat or '2' for voice chat: ")

    if mode == '1':
        user_input = input("You: ")
    elif mode == '2':
        r = sr.Recognizer()
        with sr.Microphone() as source:
            print("Listening...")
            audio = r.listen(source)
            try:
                user_input = r.recognize_google(audio)
                print("You:", user_input)
            except:
                print("Sorry, I didn't catch that.")
                continue
    else:
        print("Invalid option. Type 1 or 2.")
        continue

    # Exit
    if "bye" in user_input.lower():
        response = chatbot(user_input)
        print("Chatbot:", response)
        speak(response)
        break

    # Simulate typing delay
    time.sleep(1)
    response = chatbot(user_input)
    print("Chatbot:", response)
    speak(response)
