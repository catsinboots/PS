let colleges = [];
let lastFiltered = [];

function parseCutoff(cutoffStr) {
  if (!cutoffStr) return null;
  const match = cutoffStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function renderCards(collegesList) {
  lastFiltered = collegesList;
  const grid = document.getElementById('cardsGrid');
  grid.innerHTML = '';
  if (collegesList.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center text-gray-400 text-lg">No colleges found for this score.</div>`;
    return;
  }
  collegesList.forEach((college, idx) => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-md p-6 flex flex-col gap-3 hover:shadow-xl transition border-2 border-transparent hover:border-blue-500';
    card.innerHTML = `
      <h3 class="text-blue-700 font-bold text-xl mb-1">${college['College Name']}</h3>
      <div class="flex flex-wrap gap-3 text-gray-700 text-base">
        <span class="inline-flex items-center gap-1"><svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="#2a73cc" stroke-width="2"/><path d="M6 10l2 2 4-4" stroke="#2a73cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> ${college['Course Type']}</span>
        <span class="inline-flex items-center gap-1"><svg width="18" height="18" fill="none"><rect x="3" y="3" width="12" height="12" rx="3" stroke="#2a73cc" stroke-width="2"/><path d="M6 9h6" stroke="#2a73cc" stroke-width="2" stroke-linecap="round"/></svg> ${college['Specialization']}</span>
        <span class="inline-flex items-center gap-1"><svg width="18" height="18" fill="none"><path d="M9 2a7 7 0 0 1 7 7c0 5-7 9-7 9S2 14 2 9a7 7 0 0 1 7-7z" stroke="#2a73cc" stroke-width="2"/><circle cx="9" cy="9" r="2" stroke="#2a73cc" stroke-width="2"/></svg> ${college['Location (City, State)']}</span>
      </div>
      <div>
        <span class="bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-lg text-base inline-block mt-2">Cutoff: ${college['2024 CUET-PG Cutoff (Gen)'] || 'N/A'}</span>
      </div>
      <button class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition details-btn" data-idx="${idx}">View Details</button>
    `;
    grid.appendChild(card);
  });
  document.querySelectorAll('.details-btn').forEach(btn => {
    btn.onclick = function() {
      showDetails(parseInt(this.getAttribute('data-idx')));
    }
  });
}

function filterColleges(score) {
  return colleges
    .filter(college =>
      college['Admission Process'] === "CUET-PG" &&
      parseCutoff(college['2024 CUET-PG Cutoff (Gen)']) !== null &&
      score >= parseCutoff(college['2024 CUET-PG Cutoff (Gen)'])
    )
    .sort((a, b) => parseCutoff(b['2024 CUET-PG Cutoff (Gen)']) - parseCutoff(a['2024 CUET-PG Cutoff (Gen)']));
}

function showDetails(idx) {
  const college = lastFiltered[idx];
  if (!college) return;
  let html = `<h2 class="text-2xl font-bold text-blue-700 mb-4">${college['College Name']}</h2><ul class="space-y-2">`;
  for (const key in college) {
    html += `<li><span class="font-semibold text-gray-700">${key}:</span> <span class="text-gray-600">${college[key]}</span></li>`;
  }
  html += `</ul>`;
  document.getElementById('modalDetails').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
}

document.getElementById('closeModal').onclick = function() {
  document.getElementById('modal').classList.add('hidden');
};

document.getElementById('finderForm').onsubmit = function(e) {
  e.preventDefault();
  const score = parseInt(document.getElementById('scoreInput').value, 10);
  if (isNaN(score)) {
    document.getElementById('resultsCount').textContent = '';
    renderCards([]);
    return;
  }
  const filtered = filterColleges(score);
  document.getElementById('resultsCount').textContent =
    `Showing ${filtered.length} colleges for CUET-PG score ${score}`;
  renderCards(filtered);
};

fetch('PG-Colleges.json')
  .then(response => response.json())
  .then(data => {
    colleges = data;
    renderCards([]);
  })
  .catch(err => {
    document.getElementById('cardsGrid').innerHTML = `<div class="col-span-full text-red-500 font-semibold text-center">Failed to load college data. Please check PG-Colleges.json.</div>`;
    console.error(err);
  });
