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
  const isEmpty = emptyDashboard()
  if (!isEmpty) {
    TodayDashboard();
    renderSchedule();  
  }
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

function emptyDashboard() {
  const subjects = JSON.parse(localStorage.getItem("skippit_subjects"));

  dashboardView.style.display = "block";
  scheduleView.style.display = "none";

  if (!subjects || subjects.length === 0) {
    emptyState.style.display = "block";
    return true;
  }
  else {
    emptyState.style.display = "none"; 
    return false;
  }

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

  emptyDashboard();
  renderSchedule();
}
const popup = document.getElementById("popup");
const blur = document.getElementById("blur");

function toggle(e) {
  if (e) e.stopPropagation();
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

function TodayDashboard() {
  const now = new Date();
  const day = now.getDay();
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let day_schedule = JSON.parse(localStorage.getItem("skippit_schedule"));
  let today_schedule =
    JSON.parse(localStorage.getItem("skippit_subjects")) || [];

  let todayName = days[day];
  let today = day_schedule ? day_schedule[todayName] : [];

  const dashboard = document.querySelector(".card-container");
  dashboard.innerHTML=""
  today_schedule.forEach((sub) => {
    let SubjectName = sub.name;
    let Attend = sub.attended;
    let Total = sub.total;
    let Bunked = Total - Attend;
    console.log(SubjectName, Attend, Total, Bunked);
    const percentage = Math.round((Attend / Total) * 100);

    const card = document.createElement("div");
    card.className = "attendance-card";

    let ringColor;    
      if (percentage < 75) {
        ringColor = "#e20e0eff";
      }

      else if (percentage == 75) {
        ringColor = "#facc15";
      }

      else {
        ringColor="#43fa15ff"
      }
      
    const R = 0.75;
    const A = Number(Attend);
    const T = Number(Total);
    let MaxBunk = Math.floor((A - R * T) / R);
    let MaxAttend = Math.ceil((R * T - A) / (1 - R));
    if (MaxAttend < 0) {
     MaxAttend = 0;
    }
    if (MaxBunk < 0) {
      MaxBunk = 0;
    }

    let message;
    if (percentage > 75) {
      message=`You can bunk ${MaxBunk} classes`
    }
    else {
      message=`You must attend ${MaxAttend} classes`
    }

    card.innerHTML = `
      <div class="card-info">
        <h2>${SubjectName}</h2>
        <p class='stats'>${Attend} Attended</p>
        <p class='stats'>${Bunked} Bunked</p>
        <p class='stats'>${Total} Total</p>
        <p class='stats'>${message}</p>
        <p class='stats'>Requirement: 75%</p>
      </div>

      <div class="progress-bar"  style="--percent:${percentage};--ring-color:${ringColor};">
      <span class="progress-value">${percentage}%</span>
      </div>

      <div class="options">
        <button onclick="markPresent(${sub.id})" id="present-option">P</button>
        <button onclick="markBunk(${sub.id})" id="bunk-option">B</button>
        <button onclick="markCancel(${sub.id})" id="cancelled-option">C</button>
      </div>
    `;

    dashboard.appendChild(card);
  });
  console.log(todayName);
  console.log(today);
  console.log(today_schedule);
}
