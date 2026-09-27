import { state } from "../data.js";
import { evidenceMentionsPerson } from "../lookupHelpers.js";
import { renderEvidenceList } from "./evidence.js";
import { navigateTo } from "../navigation.js";
import type { PersonRecord } from "../types/domain";

// ---------------------------------------------------------------------
// PEOPLE & LOCATIONS
// ---------------------------------------------------------------------

function switchPeopleTab(tab: "people" | "locations"): void {
  state.currentPeopleTab = tab;
  const peoplePanel = document.getElementById("peoplePanel") as HTMLElement | null;
  const locationsPanel = document.getElementById("locationsPanel") as HTMLElement | null;
  const peopleTabBtn = document.getElementById("tabPeopleBtn") as HTMLElement | null;
  const locationsTabBtn = document.getElementById("tabLocationsBtn") as HTMLElement | null;

  if (!peoplePanel || !locationsPanel || !peopleTabBtn || !locationsTabBtn) return;

  if (tab === "people") {
    peoplePanel.classList.remove("hidden");
    locationsPanel.classList.add("hidden");
    peopleTabBtn.classList.add("active");
    locationsTabBtn.classList.remove("active");
  } else {
    peoplePanel.classList.add("hidden");
    locationsPanel.classList.remove("hidden");
    peopleTabBtn.classList.remove("active");
    locationsTabBtn.classList.add("active");
  }
}

window.switchPeopleTab = switchPeopleTab;

function countEvidenceForPerson(person: PersonRecord): number {
  let count = 0;
  for (const item of state.allEvidence) {
    if (evidenceMentionsPerson(item, person)) count++;
  }
  return count;
}

export function renderPeople(): void {
  const container = document.getElementById("peoplePanel") as HTMLElement | null;
  if (!container) return;

  let html = "";
  for (const person of state.allPeople) {
    const count = countEvidenceForPerson(person);

    html += '<div class="person-card">';
    html += '<div class="person-card-header">';
    html +=
      '<img class="person-avatar" src="' +
      person.avatar +
      '" alt="Portrait of ' +
      person.name +
      '">';
    html +=
      "<div><h3>" +
      person.name +
      '</h3><div class="person-role">' +
      person.role +
      "</div></div>";
    html += "</div>";
    html += "<p><strong>Speciality:</strong> " + person.speciality + "</p>";
    html += "<ul>";
    for (const responsibility of person.responsibilities) {
      html += "<li>" + responsibility + "</li>";
    }
    html += "</ul>";
    html +=
      '<div class="person-statement">&ldquo;' +
      person.statement +
      "&rdquo;</div>";
    html +=
      "<p>" +
      count +
      " related evidence item" +
      (count === 1 ? "" : "s") +
      " &mdash; ";
    html +=
      '<button type="button" class="evidence-count-link" data-person-id="' +
      person.id +
      '">view</button></p>';
    html += "</div>";
  }
  container.innerHTML = html;

  const links = container.querySelectorAll<HTMLButtonElement>(".evidence-count-link");
  for (const link of links) {
    link.addEventListener("click", (event: MouseEvent) => {
      const target = event.currentTarget as HTMLButtonElement | null;
      const personId = target?.dataset.personId ?? "";
      const filterPerson = document.getElementById("filterPerson") as HTMLSelectElement | null;
      if (filterPerson) filterPerson.value = personId;
      navigateTo("evidence");
      setTimeout(() => {
        renderEvidenceList();
      }, 0);
    });
  }
}

export function renderLocations(): void {
  const container = document.getElementById("locationsPanel") as HTMLElement | null;
  if (!container) return;

  let html = "";
  for (const loc of state.allLocations) {
    html += '<div class="location-card">';
    html += "<h3>" + loc.id + " &mdash; " + loc.name + "</h3>";
    html += "<p>" + loc.description + "</p>";
    html += "<p><strong>Contains:</strong></p><ul>";
    for (const item of loc.contains) {
      html += "<li>" + item + "</li>";
    }
    html += "</ul></div>";
  }
  container.innerHTML = html;
}
