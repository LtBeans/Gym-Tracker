const PROGRAM = {
      "Day 1 - Upper": [
        { name: "Bench Press", sets: 3, repRange: [6, 10], increment: 2.5 },
        { name: "Incline Dumbbell Press", sets: 3, repRange: [8, 12], increment: 2 },
        { name: "Lat Pulldown", sets: 3, repRange: [8, 12], increment: 2.5 },
        { name: "Seated Cable Row", sets: 3, repRange: [8, 12], increment: 2.5 },
        { name: "Lateral Raises", sets: 3, repRange: [12, 15], increment: 1 },
        { name: "Tricep Pushdowns", sets: 3, repRange: [10, 15], increment: 2.5 },
        { name: "Bicep Curls", sets: 3, repRange: [10, 15], increment: 2 }
      ],
      "Day 2 - Lower": [
        { name: "Squats", sets: 3, repRange: [5, 8], increment: 2.5 },
        { name: "Romanian Deadlifts", sets: 3, repRange: [8, 10], increment: 2.5 },
        { name: "Leg Press", sets: 3, repRange: [10, 15], increment: 5 },
        { name: "Leg Curl", sets: 3, repRange: [10, 15], increment: 2.5 },
        { name: "Calf Raises", sets: 4, repRange: [12, 20], increment: 5 },
        { name: "Hanging Leg Raises", sets: 3, repRange: [10, 15], increment: 0 },
        { name: "Plank", sets: 3, repRange: [30, 60], increment: 5, unit: "sec" }
      ],
      "Day 4 - Upper": [
        { name: "Overhead Press", sets: 3, repRange: [6, 10], increment: 2.5 },
        { name: "Lateral Raises", sets: 4, repRange: [12, 15], increment: 1 },
        { name: "Rear Delt Fly", sets: 3, repRange: [12, 15], increment: 1 },
        { name: "Lat Pulldown/Pull-ups", sets: 3, repRange: [8, 12], increment: 2.5 },
        { name: "Incline Dumbbell Curl", sets: 3, repRange: [10, 15], increment: 2 },
        { name: "Skull Crushers", sets: 3, repRange: [10, 15], increment: 2 }
      ],
      "Day 5 - Lower": [
        { name: "Deadlift/Hip Thrust", sets: 3, repRange: [5, 8], increment: 5 },
        { name: "Bulgarian Split Squats", sets: 3, repRange: [8, 12], increment: 2 },
        { name: "Walking Lunges", sets: 3, repRange: [10, 12], increment: 2 },
        { name: "Leg Extension", sets: 3, repRange: [12, 15], increment: 2.5 },
        { name: "Calf Raises", sets: 4, repRange: [12, 20], increment: 5 },
        { name: "Ab Wheel/Crunches", sets: 3, repRange: [10, 15], increment: 0 }
      ]
    };

    const STORAGE_KEY = "lean-tracker-v1";
    const $ = (id) => document.getElementById(id);

    const defaultData = () => ({
      bodyweightLog: [],
      sessions: [],
      notes: "",
      currentDay: "Day 1 - Upper"
    });

    function loadData() {
      try {
        return { ...defaultData(), ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
      } catch {
        return defaultData();
      }
    }

    function saveData(data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function formatDate(dateStr) {
      if (!dateStr) return "—";
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString();
    }

    function lastSessionForExercise(day, exerciseName, sessions) {
      const filtered = sessions
        .filter(s => s.day === day)
        .sort((a,b) => a.date.localeCompare(b.date));
      for (let i = filtered.length - 1; i >= 0; i--) {
        const ex = filtered[i].exercises.find(e => e.name === exerciseName);
        if (ex) return ex;
      }
      return null;
    }

    function getGuidance(exercise, previous) {
      if (!previous) return `Start with a weight you can control. Aim to finish all ${exercise.sets} sets inside ${exercise.repRange[0]}-${exercise.repRange[1]} reps.`;
      const allAtTop = previous.sets.every(s => Number(s.reps) >= exercise.repRange[1]);
      const allInRange = previous.sets.every(s => Number(s.reps) >= exercise.repRange[0]);
      const prevWeight = previous.sets[0]?.weight || 0;
      if (exercise.increment === 0) {
        if (allAtTop) return `You hit the top end last time. Add reps or slow the tempo.`;
        if (allInRange) return `Stay with the same setup and try to add 1 rep across one or more sets.`;
        return `Keep the same setup and bring every set into the target range first.`;
      }
      if (allAtTop) return `You earned a bump. Try ${Number(prevWeight) + exercise.increment} kg next time.`;
      if (allInRange) return `Stay at ${prevWeight} kg and try to beat last session by 1-2 total reps.`;
      return `Last time was below target. Drop slightly or keep the same weight and clean up reps/form.`;
    }

    function renderWorkout() {
      const data = loadData();
      const day = $("workoutDay").value;
      const exercises = PROGRAM[day];
      $("todayWorkout").textContent = day.replace(" - ", "\n");
      const list = $("exerciseList");
      const guideBox = $("guidanceBox");
      list.innerHTML = "";
      guideBox.innerHTML = `<p class="tiny">Guidance uses your last logged session for each exercise. Basic rule: when you hit the top of the rep range for all sets, increase the load next time.</p>`;

      exercises.forEach((exercise, exIndex) => {
        const previous = lastSessionForExercise(day, exercise.name, data.sessions);
        const card = document.createElement("div");
        card.className = "exercise";
        const prevWeight = previous?.sets?.[0]?.weight;
        const unit = exercise.unit || "reps";
        card.innerHTML = `
          <div class="exercise-head">
            <div>
              <div class="exercise-title">${exercise.name}</div>
              <div class="exercise-meta">${exercise.sets} sets · target ${exercise.repRange[0]}-${exercise.repRange[1]} ${unit}</div>
            </div>
            <div class="tiny">${prevWeight ? `Last weight: ${prevWeight} kg` : "No previous log"}</div>
          </div>
          <div class="tiny ${previous ? 'good' : ''}" style="margin-bottom:10px">${getGuidance(exercise, previous)}</div>
          <div class="set-grid tiny"><div>Set</div><div>Weight (kg)</div><div>${unit === 'sec' ? 'Seconds' : 'Reps done'}</div><div class="status-cell">Status</div></div>
          ${Array.from({length: exercise.sets}, (_, setIndex) => `
            <div class="set-grid">
              <div>${setIndex + 1}</div>
              <div><input type="number" step="0.5" data-ex="${exIndex}" data-set="${setIndex}" data-kind="weight" placeholder="kg"></div>
              <div><input type="number" step="1" data-ex="${exIndex}" data-set="${setIndex}" data-kind="reps" placeholder="${unit}"></div>
              <div class="status-cell tiny" id="status-${exIndex}-${setIndex}">Waiting for input</div>
            </div>
          `).join("")}
        `;
        list.appendChild(card);
      });

      document.querySelectorAll("input[data-kind]").forEach(input => {
        input.addEventListener("input", updateStatuses);
      });
      updateStatuses();
    }

    function updateStatuses() {
      const day = $("workoutDay").value;
      const exercises = PROGRAM[day];
      exercises.forEach((exercise, exIndex) => {
        for (let setIndex = 0; setIndex < exercise.sets; setIndex++) {
          const repsInput = document.querySelector(`input[data-ex="${exIndex}"][data-set="${setIndex}"][data-kind="reps"]`);
          const status = $("status-" + exIndex + "-" + setIndex);
          const reps = Number(repsInput.value);
          if (!repsInput.value) {
            status.textContent = "Waiting for input";
            status.className = "status-cell tiny";
          } else if (reps >= exercise.repRange[1]) {
            status.textContent = "Top of range";
            status.className = "status-cell tiny good";
          } else if (reps >= exercise.repRange[0]) {
            status.textContent = "In range";
            status.className = "status-cell tiny warn-text";
          } else {
            status.textContent = "Below target";
            status.className = "status-cell tiny danger";
          }
        }
      });
    }

    function saveSession() {
      const data = loadData();
      const day = $("workoutDay").value;
      const date = $("sessionDate").value;
      if (!date) {
        alert("Pick a date first.");
        return;
      }
      const bw = $("bodyWeight").value;
      if (bw) {
        data.bodyweightLog.push({ date, weight: Number(bw) });
        data.bodyweightLog.sort((a,b) => a.date.localeCompare(b.date));
      }
      const exercises = PROGRAM[day].map((exercise, exIndex) => ({
        name: exercise.name,
        sets: Array.from({length: exercise.sets}, (_, setIndex) => ({
          weight: Number(document.querySelector(`input[data-ex="${exIndex}"][data-set="${setIndex}"][data-kind="weight"]`).value || 0),
          reps: Number(document.querySelector(`input[data-ex="${exIndex}"][data-set="${setIndex}"][data-kind="reps"]`).value || 0)
        }))
      }));
      data.sessions.push({ date, day, exercises });
      data.sessions.sort((a,b) => a.date.localeCompare(b.date));
      data.currentDay = day;
      saveData(data);
      renderAll();
      alert("Session saved.");
    }

    function renderBodyweight() {
      const data = loadData();
      const log = [...data.bodyweightLog].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 8);
      $("currentWeight").textContent = data.bodyweightLog.length ? `${data.bodyweightLog[data.bodyweightLog.length - 1].weight} kg` : "—";
      if (!log.length) {
        $("bodyweightTable").innerHTML = '<div class="empty">No bodyweight logged yet.</div>';
        return;
      }
      $("bodyweightTable").innerHTML = `<table><thead><tr><th>Date</th><th>Weight</th></tr></thead><tbody>${log.map(r => `<tr><td>${formatDate(r.date)}</td><td>${r.weight} kg</td></tr>`).join("")}</tbody></table>`;
    }

    function renderSessions() {
      const data = loadData();
      $("sessionCount").textContent = data.sessions.length;
      const recent = [...data.sessions].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 6);
      if (!recent.length) {
        $("sessionsTable").innerHTML = '<div class="empty">No sessions logged yet.</div>';
        return;
      }
      $("sessionsTable").innerHTML = `<table><thead><tr><th>Date</th><th>Workout</th><th>Summary</th></tr></thead><tbody>${recent.map(s => {
        const done = s.exercises.map(e => {
          const first = e.sets[0];
          const totalReps = e.sets.reduce((sum, set) => sum + Number(set.reps || 0), 0);
          return `${e.name}: ${first?.weight || 0}kg, ${totalReps} total reps`;
        }).slice(0,2).join('<br>');
        return `<tr><td>${formatDate(s.date)}</td><td>${s.day}</td><td>${done}</td></tr>`;
      }).join("")}</tbody></table>`;
    }

    function exportData() {
      const data = loadData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "lean-tracker-data.json";
      a.click();
      URL.revokeObjectURL(a.href);
    }

    function importData(file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          saveData({ ...defaultData(), ...parsed });
          renderAll();
          alert("Data imported.");
        } catch {
          alert("That file could not be imported.");
        }
      };
      reader.readAsText(file);
    }

    function renderAll() {
      const data = loadData();
      $("goalNotes").value = data.notes || "";
      renderWorkout();
      renderBodyweight();
      renderSessions();
    }

    function init() {
      const daySelect = $("workoutDay");
      Object.keys(PROGRAM).forEach(day => {
        const opt = document.createElement("option");
        opt.value = day;
        opt.textContent = day;
        daySelect.appendChild(opt);
      });
      const data = loadData();
      daySelect.value = data.currentDay || Object.keys(PROGRAM)[0];
      $("sessionDate").value = new Date().toISOString().slice(0,10);
      $("goalNotes").value = data.notes || "";

      $("loadWorkoutBtn").addEventListener("click", renderWorkout);
      $("saveSessionBtn").addEventListener("click", saveSession);
      $("resetTodayBtn").addEventListener("click", renderWorkout);
      $("saveNotesBtn").addEventListener("click", () => {
        const data = loadData();
        data.notes = $("goalNotes").value;
        saveData(data);
        alert("Notes saved.");
      });
      $("exportBtn").addEventListener("click", exportData);
      $("importBtn").addEventListener("click", () => $("importFile").click());
      $("importFile").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) importData(file);
      });
      $("wipeBtn").addEventListener("click", () => {
        if (confirm("Delete all saved workout data from this browser?")) {
          localStorage.removeItem(STORAGE_KEY);
          location.reload();
        }
      });
      renderAll();
    }

    init();
