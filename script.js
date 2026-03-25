function save(exercise) {
  let weight = document.getElementById("benchWeight").value;
  let reps = document.getElementById("benchReps").value;

  let data = JSON.parse(localStorage.getItem("workouts")) || {};
  data[exercise] = { weight, reps };

  localStorage.setItem("workouts", JSON.stringify(data));

  document.getElementById("benchSuggestion").innerText = suggest(weight, reps);
}

function suggest(weight, reps) {
  if (reps >= 10) return "Increase weight next session";
  if (reps >= 6) return "Stay and beat reps";
  return "Lower weight slightly";
}

window.onload = () => {
  let data = JSON.parse(localStorage.getItem("workouts")) || {};
  if (data["Bench Press"]) {
    document.getElementById("benchWeight").value = data["Bench Press"].weight;
    document.getElementById("benchReps").value = data["Bench Press"].reps;
  }
};
