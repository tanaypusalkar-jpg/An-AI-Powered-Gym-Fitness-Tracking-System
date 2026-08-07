"""
Minimal, dependency-free implementation of classification metrics
(accuracy, per-class precision/recall/F1, and macro-averaged F1).

Written by hand instead of importing scikit-learn so this evaluation
suite has zero extra dependencies -- it runs with the same plain Python
already used everywhere else in the backend.
"""
from collections import defaultdict


def accuracy(y_true, y_pred):
    correct = sum(1 for t, p in zip(y_true, y_pred) if t == p)
    return correct / len(y_true) if y_true else 0.0


def per_class_metrics(y_true, y_pred, labels):
    """Returns {label: {precision, recall, f1, support}} plus a 'macro avg' row."""
    results = {}
    for label in labels:
        tp = sum(1 for t, p in zip(y_true, y_pred) if t == label and p == label)
        fp = sum(1 for t, p in zip(y_true, y_pred) if t != label and p == label)
        fn = sum(1 for t, p in zip(y_true, y_pred) if t == label and p != label)
        support = sum(1 for t in y_true if t == label)

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

        results[label] = {
            "precision": round(precision, 3),
            "recall": round(recall, 3),
            "f1": round(f1, 3),
            "support": support,
        }

    macro_precision = sum(r["precision"] for r in results.values()) / len(labels)
    macro_recall = sum(r["recall"] for r in results.values()) / len(labels)
    macro_f1 = sum(r["f1"] for r in results.values()) / len(labels)
    results["macro avg"] = {
        "precision": round(macro_precision, 3),
        "recall": round(macro_recall, 3),
        "f1": round(macro_f1, 3),
        "support": len(y_true),
    }
    return results


def confusion_matrix(y_true, y_pred, labels):
    matrix = defaultdict(lambda: defaultdict(int))
    for t, p in zip(y_true, y_pred):
        matrix[t][p] += 1
    return matrix


def print_report(name, y_true, y_pred, labels):
    print(f"\n{'=' * 60}")
    print(f"  {name}")
    print(f"{'=' * 60}")
    print(f"Test cases: {len(y_true)}")
    print(f"Accuracy:   {accuracy(y_true, y_pred):.3f}\n")

    metrics = per_class_metrics(y_true, y_pred, labels)
    print(f"{'Class':<14}{'Precision':<12}{'Recall':<10}{'F1':<8}{'Support'}")
    for label in labels:
        m = metrics[label]
        print(f"{label:<14}{m['precision']:<12}{m['recall']:<10}{m['f1']:<8}{m['support']}")
    m = metrics["macro avg"]
    print(f"{'macro avg':<14}{m['precision']:<12}{m['recall']:<10}{m['f1']:<8}{m['support']}")

    print("\nConfusion matrix (rows = true label, columns = predicted label):")
    matrix = confusion_matrix(y_true, y_pred, labels)
    header = " " * 14 + "".join(f"{l:<14}" for l in labels)
    print(header)
    for t in labels:
        row = f"{t:<14}" + "".join(f"{matrix[t][p]:<14}" for p in labels)
        print(row)

    return {"accuracy": accuracy(y_true, y_pred), "metrics": metrics}
