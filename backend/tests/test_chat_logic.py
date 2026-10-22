"""Regression tests for the Virtual Gym Buddy's no-API-key assistance."""
import unittest

from logic.chat_logic import detect_sentiment, faq_reply, rule_based_reply


class ChatLogicTests(unittest.TestCase):
    def test_basic_assistance_prompts(self):
        cases = [
            ("hello", "Virtual Gym Buddy"),
            ("what can you do?", "basic questions"),
            ("how do I use this app?", "dashboard"),
            ("thanks", "You're welcome"),
            ("I'm a beginner, how should I start?", "2–3"),
            ("How often should I work out?", "2–3"),
            ("How do I do a squat correctly?", "shoulder-width"),
            ("Give me a no equipment workout", "push-ups"),
            ("What is a good breakfast for muscle gain?", "oats"),
            ("What foods contain protein?", "Protein"),
            ("Can you make me a diet plan?", "Diet Coach"),
            ("How can I lose weight safely?", "sustainable"),
            ("How do I build muscle?", "resistance training"),
            ("Why are rest days important?", "Recovery"),
            ("My knee hurts when I squat", "Stop or modify"),
            ("What is progressive overload?", "gradually increasing"),
            ("How do I find a gym?", "Gym Finder"),
            ("Where do I see analytics?", "Analytics"),
            ("Can I lose 10 kg in a week?", "can't promise"),
        ]
        for prompt, expected in cases:
            with self.subTest(prompt=prompt):
                reply = faq_reply(prompt)
                self.assertIsNotNone(reply)
                self.assertIn(expected.lower(), reply.lower())

    def test_emergency_symptoms_take_priority(self):
        for prompt in (
            "I have sharp chest pain",
            "I feel chest pressure during my workout",
            "I'm fainting and short of breath",
        ):
            with self.subTest(prompt=prompt):
                reply = faq_reply(prompt)
                self.assertIsNotNone(reply)
                self.assertIn("Stop exercising now", reply)
                self.assertIn("urgent medical care", reply)

    def test_unrecognized_message_asks_for_clarification(self):
        self.assertIsNone(faq_reply("asdf qwer blorp"))
        self.assertIn("tell me a little more", rule_based_reply("neutral"))

    def test_sentiment_negation(self):
        self.assertEqual(detect_sentiment("I'm not sad, just unmotivated"), "neutral")
        self.assertEqual(detect_sentiment("Not feeling lazy today, actually energized"), "positive")
        self.assertEqual(detect_sentiment("I feel great and excited"), "positive")
        self.assertEqual(detect_sentiment("I'm tired and sore"), "negative")

    def test_normalization_and_empty_fallback(self):
        self.assertIn("Virtual Gym Buddy", faq_reply("  HELLO  "))
        self.assertIsInstance(rule_based_reply("neutral"), str)


if __name__ == "__main__":
    unittest.main()
