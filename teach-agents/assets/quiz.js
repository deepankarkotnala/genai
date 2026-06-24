// Reusable quiz widget for lessons. Retrieval practice = storage strength.
// Usage: a .quiz block with .opt buttons; mark the correct one with data-correct="1".
document.addEventListener("click", function (e) {
  const opt = e.target.closest(".quiz .opt");
  if (!opt) return;
  const quiz = opt.closest(".quiz");
  if (quiz.dataset.answered === "1") return; // one attempt — desirable difficulty
  quiz.dataset.answered = "1";
  const correct = quiz.querySelector('.opt[data-correct="1"]');
  const fb = quiz.querySelector(".feedback");
  if (opt === correct) {
    opt.classList.add("correct");
    if (fb) { fb.textContent = quiz.dataset.good || "Correct."; fb.className = "feedback good"; }
  } else {
    opt.classList.add("wrong");
    if (correct) correct.classList.add("correct");
    if (fb) { fb.textContent = quiz.dataset.bad || "Not quite — the right answer is highlighted."; fb.className = "feedback bad"; }
  }
});
