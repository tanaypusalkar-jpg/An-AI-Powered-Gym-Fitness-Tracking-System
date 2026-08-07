"""
Hand-labeled test sets for evaluating the two rule-based classifiers in
this project: habit-tracker risk level, and chat sentiment.

Labels represent what a human reviewer would judge as the correct answer.
Some cases are deliberately tricky (negation, mixed signals, streaks vs.
scattered attendance) so the evaluation reflects real classifier limits
rather than trivially scoring 100%.
"""

# ---------- Habit Tracker: last_7_days pattern -> true risk label ----------
# True = worked out that day, False = did not.
HABIT_TEST_CASES = [
    ([True, True, True, True, True, True, True], "low_risk"),
    ([True, True, True, True, True, True, False], "low_risk"),
    ([True, True, True, True, True, False, False], "low_risk"),
    ([True, True, True, True, False, False, False], "medium_risk"),
    ([True, True, True, False, False, False, False], "medium_risk"),
    ([True, True, False, False, False, False, False], "high_risk"),
    ([True, False, False, False, False, False, False], "high_risk"),
    ([False, False, False, False, False, False, False], "high_risk"),
    ([True, False, True, False, True, False, True], "medium_risk"),   # alternating, 4/7
    ([False, True, False, True, False, True, False], "medium_risk"),  # alternating, 3/7
    ([True, True, False, True, True, False, True], "low_risk"),        # 5/7, one gap pattern
    ([False, False, True, True, True, True, True], "low_risk"),        # missed early, strong finish
    ([True, True, True, True, True, False, True], "low_risk"),
    ([False, True, True, False, True, True, False], "medium_risk"),    # 4/7 scattered
    ([True, False, False, True, False, False, True], "medium_risk"),   # 3/7 scattered
    ([False, False, True, False, False, True, False], "high_risk"),    # 2/7 scattered
    ([True, True, True, False, True, True, True], "low_risk"),         # 6/7, single gap
    ([False, True, False, False, True, False, False], "high_risk"),    # 2/7
    ([True, False, True, True, False, True, False], "medium_risk"),    # 4/7
    ([False, False, False, True, False, False, False], "high_risk"),   # 1/7
]

# ---------- Chat Companion: message -> true sentiment label ----------
# Includes negation and mixed-signal cases the keyword-matcher can't
# reliably handle, to give a realistic (non-trivial) accuracy score.
CHAT_TEST_CASES = [
    ("I feel great today, ready to crush this workout!", "positive"),
    ("I'm so tired and sore, don't want to go to the gym", "negative"),
    ("Just checking my schedule for tomorrow", "neutral"),
    ("I did it! Finished my first 5k, so proud of myself", "positive"),
    ("This is hard, I want to quit", "negative"),
    ("What's a good warm-up routine?", "neutral"),
    ("I'm not sad, just a little unmotivated", "negative"),           # negation edge case
    ("I don't hate leg day as much as I used to", "negative"),        # negation edge case
    ("Feeling strong and excited for today's session", "positive"),
    ("Can you suggest a diet plan for weight loss?", "neutral"),
    ("My knee is in pain after yesterday's run", "negative"),
    ("Great job on the last workout summary", "positive"),
    ("I hate mornings but I love how workouts make me feel after", "positive"),  # mixed signal
    ("Not feeling lazy today, actually pretty energized", "positive"),  # negation edge case
    ("How many calories are in a banana?", "neutral"),
    ("I can't do another rep, I'm exhausted", "negative"),
    ("Today was tough but I'm proud I showed up", "positive"),        # mixed signal
    ("Set a reminder for my workout at 6pm", "neutral"),
    ("This soreness means the workout worked, feeling good", "positive"),  # mixed signal
    ("I quit trying to make excuses, let's do this", "positive"),     # mixed signal, tricky
]
