"""
Rule-based intent and sentiment logic for the Virtual Gym Buddy.

FAQ responses work without API keys or external services. Keep this module
free of web/database dependencies so it can be tested independently.
"""

NEGATIVE_WORDS = ["tired", "sad", "lazy", "hate", "sore", "quit", "can't", "cant", "hard", "pain"]
POSITIVE_WORDS = ["great", "strong", "happy", "excited", "love", "did it", "proud", "good"]


def detect_sentiment(message: str) -> str:
    text = message.lower()
    if any(word in text for word in NEGATIVE_WORDS):
        return "negative"
    if any(word in text for word in POSITIVE_WORDS):
        return "positive"
    return "neutral"


def faq_reply(message: str) -> str | None:
    """Return a concise answer for a supported FAQ, otherwise None."""
    text = " ".join(message.lower().strip().split())
    # Greetings and basic conversation
    if text in {"hi", "hello", "hey", "hey there", "good morning", "good afternoon", "good evening"}:
        return "Hi! 👋 I'm your Virtual Gym Buddy. Ask me about using the app, workouts, exercise form, recovery, or basic nutrition."
    if any(p in text for p in ("what can you do", "how can you help", "help me", "what do you do")):
        return "I can answer basic questions about this fitness app, workout tracking, beginner exercise, warm-ups, recovery, and general nutrition. For injuries or medical concerns, please speak with a qualified professional."
    if any(p in text for p in ("what is this app", "about this app", "what does this app do", "how does this app work")):
        return "This AI Gym & Fitness Assistant brings together workout analysis, diet guidance, habit tracking, performance insights, gym recommendations, and a virtual gym buddy. Choose a tool from the dashboard to get started."
    if any(p in text for p in ("track my workout", "track a workout", "start a workout", "workout tracking", "log my workout")):
        return "Open **Gym Trainer** from the dashboard to enter or analyze a workout. Use the available fields to record your exercise and reps, then review the feedback. The exact options depend on the trainer screen in your app."
    if any(p in text for p in ("supported exercises", "which exercises", "what exercises", "exercise supported")):
        return "You can try common movements such as squats, push-ups, lunges, and curls where supported by the trainer. Available exercise analysis depends on the options implemented in your Gym Trainer module."
    if any(p in text for p in ("beginner", "start exercising", "new to fitness", "starting out")):
        return "Start with 2–3 manageable full-body sessions per week, learn the movement technique, and increase difficulty gradually. Choose a level that lets you maintain control, and stop if you feel sharp pain."
    if any(p in text for p in ("warm up", "warm-up", "warmup")):
        return "Try 5–10 minutes of easy movement, such as brisk walking or cycling, followed by gentle dynamic movements related to your workout. Warm up more specifically before heavier sets."
    if any(p in text for p in ("rest day", "rest days", "recovery", "how much rest")):
        return "Recovery needs vary with workout intensity, sleep, and experience. Beginners often benefit from rest or light-activity days between hard sessions; take extra rest if you're unusually fatigued or your performance is dropping."
    if any(p in text for p in ("cardio", "strength training", "difference between cardio", "weight training")):
        return "Cardio mainly trains your heart and lungs (for example, walking, cycling, or running). Strength training challenges your muscles with resistance. A balanced routine can include both."
    if any(p in text for p in ("protein", "high protein", "protein foods")):
        return "Protein helps maintain and repair body tissues, including muscle. Common sources include beans, lentils, tofu, dairy, eggs, fish, chicken, nuts, and seeds. Your needs depend on your body and activity level."
    if any(p in text for p in ("carbohydrate", "carbs", "carbohydrates")):
        return "Carbohydrates are an important energy source, especially for exercise. Whole grains, fruit, vegetables, beans, and other minimally processed foods can be useful sources."
    if any(p in text for p in ("lose weight", "weight loss", "gain muscle", "build muscle", "fitness goal")):
        return "Set a realistic, measurable goal and focus on consistent training, recovery, and sustainable eating habits. Progress varies by person; avoid extreme diets and increase training gradually."
    if "bmi" in text or "body mass index" in text:
        return "BMI is a screening measure calculated as weight in kilograms divided by height in metres squared. It does not directly measure body fat or overall health, so interpret it in context."
    if any(p in text for p in ("diet plan", "nutrition plan", "meal plan", "calorie")):
        return "Open **Diet Coach** from the dashboard to explore the nutrition guidance available in this app. General needs vary by person; for a medical condition or specialized diet, consult a registered dietitian."
    if any(p in text for p in ("find a gym", "gym near", "gym recommendation", "gym finder")):
        return "Open **Gym Finder** from the dashboard and enter the requested location and goal. Recommendations depend on the location-search integration configured for the app."
    if any(p in text for p in ("performance", "progress", "analytics", "history")):
        return "Open **Performance** to review workout scoring, or **Analytics** to see the summaries available in your dashboard."
    if any(p in text for p in ("injury", "injured", "sharp pain", "chest pain", "dizzy", "medical advice")):
        return "Please stop exercising if you have sharp pain, chest pain, dizziness, or feel seriously unwell. I can't diagnose symptoms; seek advice from a qualified healthcare professional, and get urgent help for severe or sudden symptoms."
    if any(p in text for p in ("thank you", "thanks", "thx")):
        return "You're welcome! 💪 Keep it steady, listen to your body, and feel free to ask if you need help with the app or your fitness routine."
    return None


def rule_based_reply(sentiment: str) -> str:
    if sentiment == "negative":
        return "I hear you — tough days happen. Even a short, easy walk can be a useful start if you're feeling well enough. You've got this!"
    if sentiment == "positive":
        return "Love the energy! 💪 Keep that momentum going, and remember that recovery is part of progress too."
    return "I'm here to help with the app, workouts, recovery, or basic nutrition. Could you tell me a little more about what you need?"
