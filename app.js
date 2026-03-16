const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SHIFTS = ["07:00-15:00", "15:00-23:00", "23:00-07:00"];

const state = {
  employees: ["Dana", "Noam", "Ariel", "Maya"],
  selectedEmployee: "Dana",
  availability: {},
  schedule: {},
};

const employeeInput = document.getElementById("employee-name");
const addEmployeeBtn = document.getElementById("add-employee");
const employeeList = document.getElementById("employee-list");
const selectedEmployee = document.getElementById("selected-employee");
const clearEmployeeBlocksBtn = document.getElementById("clear-employee-blocks");
const availabilityTable = document.getElementById("availability-table");
const generateBtn = document.getElementById("generate-schedule");
const resetBtn = document.getElementById("reset-schedule");
const scheduleTable = document.getElementById("schedule-table");
const helperNote = document.getElementById("helper-note");

function shiftKey(day, shift) {
  return `${day}__${shift}`;
}

function initializeAvailability() {
  for (const employee of state.employees) {
    if (!state.availability[employee]) {
      state.availability[employee] = {};
    }
    for (const day of DAYS) {
      for (const shift of SHIFTS) {
        const key = shiftKey(day, shift);
        if (state.availability[employee][key] === undefined) {
          state.availability[employee][key] = true;
        }
      }
    }
  }
}

function renderEmployees() {
  employeeList.innerHTML = "";
  selectedEmployee.innerHTML = "";

  state.employees.forEach((employee) => {
    const item = document.createElement("li");
    item.textContent = employee;
    employeeList.appendChild(item);

    const option = document.createElement("option");
    option.value = employee;
    option.textContent = employee;
    selectedEmployee.appendChild(option);
  });

  selectedEmployee.value = state.selectedEmployee;
}

function renderAvailabilityTable() {
  const selected = state.selectedEmployee;
  let html = "<thead><tr><th>Day</th>";
  SHIFTS.forEach((shift) => {
    html += `<th>${shift}</th>`;
  });
  html += "</tr></thead><tbody>";

  for (const day of DAYS) {
    html += `<tr><td class=\"sticky-col day-cell\">${day}</td>`;
    for (const shift of SHIFTS) {
      const key = shiftKey(day, shift);
      const available = state.availability[selected][key];
      html += `<td class=\"availability-cell ${available ? "available" : "blocked"}\" data-day=\"${day}\" data-shift=\"${shift}\">${available ? "✓" : "Blocked"}</td>`;
    }
    html += "</tr>";
  }

  html += "</tbody>";
  availabilityTable.innerHTML = html;
}

function buildSchedule() {
  const assignments = {};
  const shiftCount = Object.fromEntries(state.employees.map((employee) => [employee, 0]));

  for (const day of DAYS) {
    for (const shift of SHIFTS) {
      const key = shiftKey(day, shift);
      const availableEmployees = state.employees.filter((employee) => state.availability[employee][key]);

      if (!availableEmployees.length) {
        assignments[key] = "Unassigned";
        continue;
      }

      availableEmployees.sort((a, b) => shiftCount[a] - shiftCount[b]);
      const selected = availableEmployees[0];
      assignments[key] = selected;
      shiftCount[selected] += 1;
    }
  }

  state.schedule = assignments;

  const workload = Object.entries(shiftCount)
    .map(([employee, count]) => `${employee}: ${count}`)
    .join(" | ");
  helperNote.textContent = `AI helper assigned by fairness (least allocated available person first). Current load: ${workload}. You can manually override any shift below.`;
}

function renderScheduleTable() {
  let html = "<thead><tr><th>Day</th><th>Shift</th><th>Assigned to</th></tr></thead><tbody>";

  for (const day of DAYS) {
    SHIFTS.forEach((shift, index) => {
      const key = shiftKey(day, shift);
      const current = state.schedule[key] || "Unassigned";
      html += "<tr>";
      if (index === 0) {
        html += `<td class=\"sticky-col day-cell\" rowspan=\"${SHIFTS.length}\">${day}</td>`;
      }
      html += `<td>${shift}</td><td><select data-key=\"${key}\" class=\"assignment-select\"></select></td></tr>`;
    });
  }

  html += "</tbody>";
  scheduleTable.innerHTML = html;

  document.querySelectorAll(".assignment-select").forEach((select) => {
    const key = select.dataset.key;
    const options = ["Unassigned", ...state.employees];

    options.forEach((employee) => {
      const option = document.createElement("option");
      option.value = employee;
      option.textContent = employee;
      select.appendChild(option);
    });

    select.value = state.schedule[key] || "Unassigned";
    select.addEventListener("change", (event) => {
      state.schedule[key] = event.target.value;
    });
  });
}

addEmployeeBtn.addEventListener("click", () => {
  const name = employeeInput.value.trim();
  if (!name || state.employees.includes(name)) {
    return;
  }
  state.employees.push(name);
  state.selectedEmployee = name;
  employeeInput.value = "";
  initializeAvailability();
  renderEmployees();
  renderAvailabilityTable();
  renderScheduleTable();
});

selectedEmployee.addEventListener("change", (event) => {
  state.selectedEmployee = event.target.value;
  renderAvailabilityTable();
});

availabilityTable.addEventListener("click", (event) => {
  const cell = event.target.closest(".availability-cell");
  if (!cell) return;

  const { day, shift } = cell.dataset;
  const key = shiftKey(day, shift);
  const employee = state.selectedEmployee;

  state.availability[employee][key] = !state.availability[employee][key];
  renderAvailabilityTable();
});

clearEmployeeBlocksBtn.addEventListener("click", () => {
  const employee = state.selectedEmployee;
  for (const day of DAYS) {
    for (const shift of SHIFTS) {
      state.availability[employee][shiftKey(day, shift)] = true;
    }
  }
  renderAvailabilityTable();
});

generateBtn.addEventListener("click", () => {
  buildSchedule();
  renderScheduleTable();
});

resetBtn.addEventListener("click", () => {
  state.schedule = {};
  helperNote.textContent = "Schedule reset. Click 'Generate with AI helper' to build a new draft.";
  renderScheduleTable();
});

initializeAvailability();
renderEmployees();
renderAvailabilityTable();
renderScheduleTable();
