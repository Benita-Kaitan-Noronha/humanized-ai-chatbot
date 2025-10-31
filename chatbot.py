import random
import pyttsx3
import speech_recognition as sr

# ------------------- Voice Setup (Optional) -------------------
engine = pyttsx3.init()

def speak(text):
    engine.say(text)
    engine.runAndWait()

# ------------------- Chatbot Dataset -------------------
responses = {
    "hi": ["Hello!", "Hi there!", "Hey! How are you?"],
    "hello": ["Hi!", "Hello!", "Hey! Nice to see you!"],
    "how are you": ["I’m good, thanks! How about you?", "Doing well! What about you?"],
    "i am sad": ["I’m sorry to hear that. Do you want to talk about it?", "Oh no! I hope things get better soon."],
    "i am happy": ["Yay! That’s great to hear ", "Awesome! Keep smiling!"],
    "recommend movie": ["I recommend Inception!", "Try watching The Pursuit of Happyness.", "You might like Interstellar."],
    "bye": ["Goodbye! Have a great day!", "See you later! Take care!"]
}

# ------------------- Chat Function -------------------
def chatbot(user_input):
    user_input = user_input.lower()
    for key in responses:
        if key in user_input:
            return random.choice(responses[key])
    return "I didn’t get that. Can you say it differently?"

# ------------------- Main Chat Loop -------------------
print("Chatbot: Hello! I am your friendly chatbot. Type 'bye' to exit.")

while True:
    # ------------------- Choose input mode -------------------
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

    if user_input.lower() == "bye":
        response = random.choice(responses["bye"])
        print("Chatbot:", response)
        speak(response)
        break

    response = chatbot(user_input)
    print("Chatbot:", response)
    speak(response)
import time
time.sleep(1)  # 1 second delay before response
name = input("What is your name? ")
print(f"Nice to meet you, {name}! ")
