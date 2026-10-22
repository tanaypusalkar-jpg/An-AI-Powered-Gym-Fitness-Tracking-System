"""
Rule-based intent and sentiment logic for the Virtual Gym Buddy.

FAQ responses work without API keys or external services. Keep this module
free of web/database dependencies so it can be tested independently.
"""
import re

NEGATIVE_WORDS = ["tired", "sad", "lazy", "hate", "sore", "quit", "hard", "pain", "exhausted", "unmotivated"]
POSITIVE_WORDS = ["great", "strong", "happy", "excited", "love", "did it", "proud", "good", "energized"]


def detect_sentiment(message: str) -> str:
    """Return a lightweight sentiment label, accounting for common negation."""
    text = " ".join(message.lower().split())
    # Negated negative words should not automatically label a message negative.
    if re.search(r"\b(?:not|never|don't|dont|do not|isn't|isnt|can't|cant)\s+(?:feel(?:ing)?\s+)?(?:sad|lazy|unmotivated|hate|bad)\b", text):
        return "positive" if any(word in text for word in ("good", "great", "energized", "happy", "proud")) else "neutral"
    if any(word in text for word in POSITIVE_WORDS):
        return "positive"
    if any(word in text for word in NEGATIVE_WORDS) or "can't do" in text or "cannot do" in text:
        return "negative"
    return "neutral"


def faq_reply(message: str) -> str | None:
    """Return a concise answer for a supported FAQ, otherwise None."""
    text = " ".join(message.lower().strip().split())
    # Prioritize potentially urgent symptoms before other keyword matches.
    if any(p in text for p in ("chest pain", "chest pressure", "shortness of breath", "short of breath", "fainting", "passed out")):
        return "Stop exercising now. Chest pain, chest pressure, fainting, or severe shortness of breath can be an emergency. Call your local emergency number or seek urgent medical care, and do not resume exercise until medically assessed."
    if any(p in text for p in ("sharp pain", "injury", "injured", "dizzy", "knee pain", "knee hurts", "joint pain", "medical advice")):
        return "Stop or modify the activity that causes pain; don't push through it. I can't diagnose injuries. If pain is severe, sudden, worsening, or affects normal movement, seek prompt medical care; otherwise consult a qualified healthcare professional before returning to painful exercise."

    # Greetings and basic conversation
    if text in {"hi", "hello", "hey", "hey there", "good morning", "good afternoon", "good evening"}:
        return "Hi! 👋 I'm your Virtual Gym Buddy. Ask me about using the app, workouts, exercise form, recovery, or basic nutrition."
    if any(p in text for p in ("what can you do", "how can you help", "help me", "what do you do")):
        return "I can answer basic questions about this fitness app, beginner workouts, exercise habits, recovery, and general nutrition. For injuries or medical concerns, please speak with a qualified professional."
    if any(p in text for p in ("what is this app", "about this app", "what does this app do", "how does this app work", "how do i use this app")):
        return "This AI Gym & Fitness Assistant brings together workout analysis, diet guidance, habit tracking, performance insights, gym recommendations, and a virtual gym buddy. Choose a tool from the dashboard to get started."
    if any(p in text for p in ("thank you", "thanks", "thx")):
        return "You're welcome! 💪 Keep it steady, listen to your body, and feel free to ask if you need help with the app or your fitness routine."
    if any(p in text for p in ("track my workout", "track a workout", "start a workout", "workout tracking", "log my workout")):
        return "Open **Gym Trainer** from the dashboard to enter or analyze a workout. Use the available fields to record your exercise and reps, then review the feedback."
    if any(p in text for p in ("supported exercises", "which exercises", "what exercises", "exercise supported")):
        return "Try common movements such as squats, push-ups, lunges, and curls where supported by the trainer. Available exercise analysis depends on the options implemented in your Gym Trainer module."
    if any(p in text for p in ("beginner", "start exercising", "new to fitness", "starting out", "how often should i work out", "workout frequency")):
        return "If you're a beginner, start with 2–3 manageable sessions per week and include recovery days. Learn controlled technique first, then increase duration or difficulty gradually. Adjust for your health, schedule, and how you feel."
    if any(p in text for p in ("squat form", "how to squat", "proper squat", "squat correctly")):
        return "For a bodyweight squat, stand about shoulder-width apart, brace your torso, and sit your hips down and back while keeping your feet planted and knees tracking in line with your toes. Use a comfortable depth and controlled pace; stop if you feel pain. A qualified trainer can check your individual technique."
    if any(p in text for p in ("no equipment", "without equipment", "home workout", "bodyweight workout")):
        return "A simple no-equipment session can include chair or bodyweight squats, wall/incline push-ups, glute bridges, and a short brisk walk. Start with a comfortable number of repetitions, rest as needed, and choose variations you can do with good control."
    if any(p in text for p in ("warm up", "warm-up", "warmup")):
        return "Try 5–10 minutes of easy movement, such as brisk walking or cycling, followed by gentle dynamic movements related to your workout. Warm up more specifically before heavier sets."
    if any(p in text for p in ("rest day", "rest days", "recovery", "how much rest")):
        return "Recovery needs vary with workout intensity, sleep, and experience. Beginners often benefit from rest or light-activity days between hard sessions; take extra rest if you're unusually fatigued or your performance is dropping."
    if any(p in text for p in ("progressive overload", "increase weights", "get stronger", "progress weights")):
        return "Progressive overload means gradually increasing a training challenge over time—for example, a few more controlled reps, slightly more resistance, or an extra set. Change one thing at a time and only progress when your technique remains solid and recovery is adequate."

    # Nutrition education: macronutrients, micronutrients, vitamins, minerals, and hydration
    if any(p in text for p in ("micronutrient", "micro nutrient", "micro-nutrient", "what are micros")):
        return "Micronutrients are vitamins and minerals the body needs in relatively small amounts to support functions such as immunity, bone health, blood formation, and energy metabolism. Examples include iron, calcium, zinc, iodine, and vitamins A, C, D, E, K, and the B group. A varied diet helps provide them."
    if any(p in text for p in ("macronutrient", "macro nutrient", "macro-nutrient", "what are macros")):
        return "The three main macronutrients are carbohydrates, protein, and fat. Carbohydrates provide energy, protein supports tissue repair and muscle maintenance, and fats help with cell function and absorption of vitamins A, D, E, and K. The right balance depends on your needs and preferences."
    if any(p in text for p in ("vitamin b12", "vitamin b-12", "b12", "b-12")):
        return "Vitamin B12 supports nerve function and red blood cell formation. It is found mainly in animal foods and reliable fortified foods; people eating fully plant-based diets may need professional guidance about supplementation. Ask a healthcare professional if you are concerned about deficiency."
    if any(p in text for p in ("vitamin d", "sunshine vitamin")):
        return "Vitamin D helps the body absorb calcium and supports bone and muscle function. Sources include suitable sunlight exposure, oily fish, egg yolks, and fortified foods. Avoid high-dose supplements without professional advice."
    if any(p in text for p in ("iron", "iron rich", "iron-rich")):
        return "Iron helps carry oxygen in the blood. Sources include lentils, beans, chickpeas, tofu, seeds, leafy greens, meat, and fortified foods. Vitamin-C-rich foods can help absorb iron from plant foods. Fatigue has many causes, so don't assume it means low iron."
    if any(p in text for p in ("calcium", "bone health")):
        return "Calcium supports bones, teeth, muscle contraction, and nerve signalling. Sources include milk, yogurt, cheese, calcium-set tofu, some leafy greens, sesame, and fortified plant drinks. Needs vary by age and health."
    if any(p in text for p in ("electrolyte", "electrolytes", "sodium and potassium", "hydration minerals")):
        return "Electrolytes such as sodium, potassium, and magnesium help regulate fluid balance, nerve signals, and muscle function. Water is usually enough for shorter, easy workouts; electrolyte drinks may help during prolonged, hot, or very sweaty exercise."
    if any(p in text for p in ("vitamin", "vitamins")):
        return "Vitamins help the body function normally: for example, vitamin A supports vision, vitamin C supports collagen formation, B vitamins help energy metabolism, and vitamin D supports calcium absorption. Eat a variety of foods; supplements are not automatically necessary, and high doses can be harmful."
    if any(p in text for p in ("mineral", "minerals")):
        return "Minerals have important roles throughout the body: calcium supports bones, iron carries oxygen, zinc supports immune function, iodine helps make thyroid hormones, and potassium supports muscle and nerve function. Different whole foods provide different minerals."
    if any(p in text for p in ("nutrient deficiency", "vitamin deficiency", "mineral deficiency", "signs of deficiency", "deficiency symptoms")):
        return "Symptoms such as tiredness can have many causes, and a chatbot cannot diagnose a nutrient deficiency. If you are concerned, speak with a healthcare professional who can assess whether testing or treatment is appropriate; avoid starting high-dose supplements on your own."
    if any(p in text for p in ("nutrient", "nutrients", "nutrition basics", "balanced diet", "balanced nutrition")):
        return "Nutrients are substances in food used for energy, growth, repair, and normal function. Macronutrients are carbohydrates, protein, and fats; micronutrients are vitamins and minerals. Water and fibre are also important. Aim for a varied, balanced diet."
    if any(p in text for p in ("cardio", "strength training", "difference between cardio", "weight training")):
        return "Cardio mainly trains your heart and lungs (for example, walking or cycling). Strength training challenges your muscles with resistance. A balanced routine can include both."
    if any(p in text for p in ("protein", "high protein", "protein foods")):
        return "Protein helps maintain and repair body tissues, including muscle. Common sources include beans, lentils, tofu, dairy, eggs, fish, chicken, nuts, and seeds. Your needs depend on your body and activity level."
    if any(p in text for p in ("carbohydrate", "carbs", "carbohydrates")):
        return "Carbohydrates are an important energy source, especially for exercise. Whole grains, fruit, vegetables, beans, and other minimally processed foods can be useful sources."
    if any(p in text for p in ("breakfast", "muscle gain meal", "foods for muscle gain", "gain muscle", "build muscle")):
        return "For muscle gain, pair consistent resistance training with enough food, protein, and sleep. A balanced breakfast could include eggs or tofu, oats or whole-grain toast, fruit, and yogurt or a fortified alternative. Portions depend on your needs."
    if any(p in text for p in ("lose weight", "weight loss", "fat loss")):
        return "For weight management, focus on sustainable habits: balanced meals, regular activity, sleep, and gradual changes you can maintain. Avoid crash diets or promises of rapid results; progress varies by person."
    if any(p in text for p in ("diet plan", "nutrition plan", "meal plan", "calorie")):
        return "Open **Diet Coach** from the dashboard to explore the nutrition guidance available in this app. General needs vary by person; for a medical condition or specialized diet, consult a registered dietitian."
    if any(p in text for p in ("find a gym", "gym near", "gym recommendation", "gym finder")):
        return "Open **Gym Finder** from the dashboard and enter the requested location and goal. Recommendations depend on the location-search integration configured for the app."
    if any(p in text for p in ("performance", "progress", "analytics", "history")):
        return "Open **Performance** to review workout scoring, or **Analytics** to see the summaries available in your dashboard."
    if any(p in text for p in ("guarantee", "10kg in a week", "10 kg in a week", "lose 10 kg", "extreme diet", "starve myself")):
        return "I can't promise rapid weight loss or recommend starvation or extreme dieting. Safer progress is gradual and individual; consider a registered dietitian or healthcare professional for a plan suited to your needs."
    return None


def rule_based_reply(sentiment: str) -> str:
    if sentiment == "negative":
        return "I hear you — tough days happen. If you're feeling well enough, a short, easy walk may be a gentle start. Rest is okay too."
    if sentiment == "positive":
        return "Love the energy! 💪 Keep that momentum going, and remember that recovery is part of progress too."
    return "I'm here to help with the app, workouts, recovery, or basic nutrition. Could you tell me a little more about what you need?"
