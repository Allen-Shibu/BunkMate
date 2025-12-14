const dashboardView = document.getElementById("dashboard-view");
const emptyState = document.querySelector(".empty-state");
const scheduleView = document.getElementById("schedule-view");
const dashboardBtn = document.querySelector("button[onclick*='dashboard']");
const scheduleBtn = document.querySelector("button[onclick*='schedule']");
let subjects = JSON.parse(localStorage.getItem("skippit_subjects")) || [];
let schedule = JSON.parse(localStorage.getItem("skippit_schedule")) || {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
};

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

document.addEventListener("DOMContentLoaded", () => {
  renderSchedule();
  renderDashboard();
});

function switchTab(tabName) {
  if (tabName == "dashboard") {
    dashboardView.style.display = "block";
    scheduleView.style.display = "none";

    if (scheduleBtn) scheduleBtn.removeAttribute("id");
    if (dashboardBtn) dashboardBtn.setAttribute("id", "start");
  } else if (tabName == "schedule") {
    dashboardView.style.display = "none";
    scheduleView.style.display = "block";

    if (dashboardBtn) dashboardBtn.removeAttribute("id");
    if (scheduleBtn) scheduleBtn.setAttribute("id", "start");

    renderSchedule();
  }
}

function renderDashboard() {
  const subjects = JSON.parse(localStorage.getItem("skippit_subjects"));
  if (!subjects || subjects.length === 0) {
    dashboardView.style.display = "none";
    scheduleView.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  scheduleView.style.display = "block";
  dashboardView.style.display = "block";
}

let Subject = document.getElementById("subject-name");
let ClassNum = document.getElementById("class-num");
let TotalClass = document.getElementById("total-class");
let EndDate = document.getElementById("end-date");

function save() {
  if (Subject.value === "") {
    alert("Please enter a subject name");
    return;
  }
  if (Number(ClassNum.value) > Number(TotalClass.value)) {
    alert("Total Classes cannot be less than attended classes");
    return;
  }

  const newSubject = {
    id: Date.now(),
    name: Subject.value,
    attended: Number(ClassNum.value),
    total: Number(TotalClass.value),
  };

  subjects.push(newSubject);

  localStorage.setItem("skippit_subjects", JSON.stringify(subjects));

  Subject.value = "";
  ClassNum.value = "";
  TotalClass.value = "";

  renderSchedule();
}

function toggle() {
  let blur = document.getElementById("blur");
  if (blur) blur.classList.toggle("active");

  let PopUp = document.getElementById("popup");
  if (PopUp) PopUp.classList.toggle("active");
}

function renderSchedule() {
  const optionsHtml = subjects
    .map((s) => `<option value="${s.id}">${s.name}</option>`)
    .join("");
  const placeholder =
    '<option class="head" value="" disabled selected>Add Subject</option>';

  daysOfWeek.forEach((day) => {
    const col = document.getElementById(`col-${day}`);
    if (!col) return;

    const daySubjectsIds = schedule[day] || [];

    let cardsHtml = "";
    daySubjectsIds.forEach((id, index) => {
      const sub = subjects.find((s) => s.id === id);
      if (sub) {
        cardsHtml += `
                    <div class="subjects" style="margin-bottom: 10px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:white; font-size:20px; line-height:23px">${sub.name}</span>
                        <button onclick="removeFromSchedule('${day}', ${index})" style="background:none; border:none; color:#ff5722; cursor:pointer; font-weight:bold;">×</button>
                    </div>
                `;
      }
    });

    const dropdownHtml =
      subjects.length > 0
        ? `
            <div class="subjects" style="margin-top: 10px; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 10px;">
                <select onchange="addSubjectFromDropdown('${day}', this)" style="width:100%; font-size:20px; background:transparent; color: #aaa; border:none; outline:none; cursor:pointer;">
                    ${placeholder}
                    ${optionsHtml}
                </select>
            </div>
        `
        : '<p style="font-size:12px; color:#666; text-align:center; margin-top:10px;">Create subjects first</p>';

    col.innerHTML = cardsHtml + dropdownHtml;
  });
}

function addSubjectFromDropdown(day, selectElement) {
  const subjectId = parseInt(selectElement.value);

  if (subjectId) {
    schedule[day].push(subjectId);

    localStorage.setItem("skippit_schedule", JSON.stringify(schedule));

    renderSchedule();
  }
}

function removeFromSchedule(day, index) {
  schedule[day].splice(index, 1);
  localStorage.setItem("skippit_schedule", JSON.stringify(schedule));
  renderSchedule();
}
