document.addEventListener("DOMContentLoaded", () => {


    const cycleStartPrompt = document.getElementById("cycleStartPrompt");
    const trackerContainer = document.getElementById("trackerContainer");
    const trackerTable = document.getElementById("trackerTable");
    const headerRow = document.getElementById("headerRow");
    const weekRow = document.getElementById("weekRow");
    const cycleRow = document.getElementById("cycleRow");
    const trackerBody = document.getElementById("trackerBody");
    const startTrackingButton = document.getElementById("startTracking");
    const cycleStartDateInput = document.getElementById("cycleStartDate");
    const newCycleBtn = document.getElementById("newCycleBtn");
    const loggingScreen = document.getElementById("loggingScreen");
    const saveLogBtn = document.getElementById("saveLog"); // Get the save button
    const closeLogBtn = document.getElementById("closeLog"); // Get the close button
    const selectedDayText = document.getElementById("selectedDay"); // Get the selected day text element
    const NUM_DAYS = 35; // Changed to 30 for consistency with your example
    const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  
    const symptomsScreen = document.getElementById("symptomsScreen"); // Correct ID
    const saveSymptomBtn = document.getElementById("saveSymptomsBtn"); // Correct ID
    const closeSymptomsBtn = document.getElementById("closeSymptomsBtn"); // Correct ID
    const symptomsList = document.getElementById("symptomsList")
    const saveAsJsonAndPdf = document.getElementById("saveAsJsonAndPdf");
  
    const symptoms = [ 
        "Acne", "Back pain", "Bloating","Bowel pain", "Breast pain","Constipation","Coughing","Coughing up blood","Coughing up mucus","Diarrhea","Dizziness","Dry eyes","Fatigue","Fever","Food cravings","Foot pain", "Gassy","Hand pain", "Headache", "Hip pain", "Hot flashes","Indigestion","Intestinal pain", "Itching","Joint pain", "Knee pain", "Lower back pain","Menstrual cramps","Migraine","Mood changes","Muscle pain","Nausea","Night sweats","Numbness","Ovulation cramps","Painful breathing","Painful sex","Painful urination","Pelvic pain","Reflux","Runny/stuffy nose","Shortness of breath","Sore throat","Trouble sleeping","Vertigo", "Vomiting","Watery eyes"
    ];
  
  
    let currentCycle = [];
    let today = new Date();
    let selectedDay; // Store the selected day
    let loggedSymptoms = {}; // Initialize loggedSymptoms
    let selectedSymptoms = []; // Array to store selected symptoms
  
    const moodMenuScreen = document.getElementById("moodMenuScreen");
    const closeMoodMenuBtn = document.getElementById("closeMoodMenu");
    let selectedMoodCell = null;
  
    const generalMenuScreen = document.getElementById("generalMenuScreen");
    const saveGeneralMenu = document.getElementById("saveGeneralMenu");
    const closeGeneralMenu = document.getElementById("closeGeneralMenu");
    const selectedDayHeader = document.getElementById("selectedDayHeader");
    let selectedColumnIndex = null;

    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }
    
    // Dark mode toggle functionality
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Update button icon
        if (document.body.classList.contains('dark-mode')) {
            darkModeToggle.textContent = '☀️';
            localStorage.setItem('darkMode', 'enabled');
        } else {
            darkModeToggle.textContent = '🌙';
            localStorage.setItem('darkMode', 'disabled');
        }
    });
  
    function saveToLocalStorage() {
      try {
          const data = {
              cycleStartDate: cycleStartDateInput.value,
              currentCycle: currentCycle
          };
          localStorage.setItem('habitTrackerData', JSON.stringify(data));
          console.log("Data saved to local storage");
      } catch (error) {
          console.error("Error saving data to local storage:", error);
      }
  }
  
  
  function loadFromLocalStorage() {
    try {
        const data = localStorage.getItem('habitTrackerData');
        if (data) {
            const parsedData = JSON.parse(data);
            cycleStartDateInput.value = parsedData.cycleStartDate;
            currentCycle = parsedData.currentCycle.map(day => ({
                ...day,
                date: new Date(day.date),
                data: {
                    ...day.data,
                    moods: day.data?.moods || {} // Ensure moods object exists
                }
            }));
            console.log("Current Cycle Loaded from local storage:", currentCycle);
            
            // Regenerate the table with the loaded data
            const startDate = new Date(currentCycle[0].date);
            generateCycleGrid(startDate);
            
            // Hide cycle start prompt and show tracker container
            cycleStartPrompt.classList.add("hidden");
            trackerContainer.classList.remove("hidden");
            newCycleBtn.classList.remove("hidden");
            saveAsJsonAndPdf.classList.remove("hidden");

            // After loading data, create symptom rows
            if (currentCycle.length > 0) {
                const allSymptoms = Array.from(new Set(
                    currentCycle.flatMap(day => day.data?.symptoms || [])
                    .map(symptom => ({ name: symptom.name, severity: symptom.severity }))
                ));
                updateSymptomRows(allSymptoms);
            }
        }
    } catch (error) {
        console.error("Error loading data from local storage:", error);
    }
  }
  
    // Load data from local storage when the page is loaded
    loadFromLocalStorage();
  
  
  
  
  
  // Prompt for Cycle Start Day
    startTrackingButton.addEventListener("click", () => {
        const startDate = new Date(cycleStartDateInput.value);
        if (isNaN(startDate)) {
            alert("Please enter a valid date.");
            return;
        }
  // Generate Table from input
        generateCycleGrid(startDate);
        cycleStartPrompt.classList.add("hidden");
        trackerContainer.classList.remove("hidden");
        newCycleBtn.classList.remove("hidden");
        saveAsJsonAndPdf.classList.remove("hidden");
        saveToLocalStorage();
    });
  // Start a new cycle when clicking "Start New Cycle" Button
  newCycleBtn.addEventListener("click", () => {
    console.log("New cycle button clicked");
    // Clear all data
    currentCycle = [];
    // Clear local storage
    localStorage.removeItem('habitTrackerData');
    
    // Show cycle start prompt, hide tracker
    cycleStartPrompt.classList.remove("hidden");
    trackerContainer.classList.add("hidden");
    
    // Clear the date input for fresh start
    cycleStartDateInput.value = '';
    
    console.log("Ready for new cycle input");
});
  
  
  
  // Populate table with date, week day, cycle and cycle day 
  function generateCycleGrid(startDate) {
    if (currentCycle.length === 0) {
        // Only create new cycle data if there isn't any
        for (let i = 0; i < NUM_DAYS; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            currentCycle.push({
                day: date.getDate(),
                weekday: WEEK_DAYS[date.getDay()],
                cycleDay: i + 1,
                date: date,
                data: {} // Removed temperature and cervicalFluid initialization
            });
        }
    }
  
    // Clear and rebuild the header rows
    headerRow.innerHTML = "<th>Date</th>";
    weekRow.innerHTML = "<td>Week Day</td>";
    cycleRow.innerHTML = "<td>Cycle Day</td>";
    
          
    // Populate header rows from currentCycle data
    currentCycle.forEach((dayData, index) => {
        const th = document.createElement("th");
        th.textContent = dayData.day;
        th.classList.add("clickable");
        th.style.cursor = 'pointer'; // Add visual indicator
        th.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Header cell clicked: ${index}`);
            openGeneralMenu(index);
        };
        if (isToday(dayData.date)) th.classList.add("current-day");
        headerRow.appendChild(th);

        const weekdayCell = document.createElement("td");
        weekdayCell.textContent = dayData.weekday;
        weekRow.appendChild(weekdayCell);

        const cycleDayCell = document.createElement("td");
        cycleDayCell.textContent = dayData.cycleDay;
        cycleDayCell.classList.add("cycle-day-cell");
        cycleRow.appendChild(cycleDayCell);
    });
  
  
        // Clear and rebuild the tracker body
        trackerBody.querySelectorAll("tr").forEach(row => {
          const firstCell = row.firstElementChild;
          row.innerHTML = "";
          row.appendChild(firstCell);
  
          currentCycle.forEach((dayData, i) => {
              const cell = document.createElement("td");
              cell.dataset.dayIndex = i;
  
              if (row.dataset.type === "calories" || row.dataset.type === "notes") {
                  if (dayData.data) {
                      if (row.dataset.type === "calories") {
                          cell.textContent = dayData.data.calories || '';
                      } else {
                          cell.innerHTML = (dayData.data.notes || '').replace(/\n/g, "<br>");
                      }
                  }
              }
  
              if (row.dataset.type === "symptoms") {
                  if (dayData.data && dayData.data.symptoms) {
                      let symptomsText = '';
                      dayData.data.symptoms.forEach(symptom => {
                          let severityIndicator = '';
                          switch (symptom.severity) {
                              case 'mild':
                                  severityIndicator = `<span style="color: green;">&#9679;</span>`;
                                  break;
                              case 'moderate':
                                  severityIndicator = `<span style="color: orange;">&#9679;</span>`;
                                  break;
                              case 'severe':
                                  severityIndicator = `<span style="color: red;">&#9679;</span>`;
                                  break;
                          }
                          symptomsText += `${symptom.name} ${severityIndicator}, `;
                      });
                      cell.innerHTML = symptomsText.slice(0, -2);
                  }
              }
  
              if (row.dataset.type === "habit") {
                const habit = row.dataset.habit;
                if (dayData.data && dayData.data[habit]) {
                    cell.textContent = dayData.data[habit];
                    cell.style.backgroundColor = 'transparent'; // Ensure no background color
                }
            }
  
            if (row.dataset.type === "habit" && row.dataset.habit === "Mood") {
                cell.classList.add("emoji-cell");
                const moodTime = row.dataset.moodTime;
                if (dayData.data && dayData.data.moods && dayData.data.moods[moodTime]) {
                    cell.textContent = dayData.data.moods[moodTime];
                    cell.style.backgroundColor = 'transparent'; // Ensure no background color
                }
            }
                row.appendChild(cell);
              });
          });
          console.log("Grid generated with currentCycle:", currentCycle);
      }
  
    // Add click handlers only to header cells
    headerRow.querySelectorAll('th').forEach((cell, index) => {
        if (index > 0) { // Skip the first header cell
            cell.classList.add('clickable');
            cell.addEventListener('click', () => openGeneralMenu(index - 1));
        }
    });
    weekRow.querySelectorAll('td').forEach((cell, index) => {
        if (index > 0) {
            cell.classList.add('clickable');
            cell.addEventListener('click', () => openGeneralMenu(index - 1));
        }
    });
    cycleRow.querySelectorAll('td').forEach((cell, index) => {
        if (index > 0) {
            cell.classList.add('clickable');
            cell.addEventListener('click', () => openGeneralMenu(index - 1));
        }
    });
  // Check what today's date is 
    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
  // Use shortened version of date?
    function formatDate(date) {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
  // Cycle through emojis when cell is clicked
    function toggleEmoji(cell, emojis) {
        let currentIndex = -1;
        if (cell.textContent) {
            currentIndex = emojis.indexOf(cell.textContent);
        }
        cell.textContent = emojis[(currentIndex + 1) % emojis.length];
  
         // Save emoji state after toggling
         const rowType = cell.parentElement.dataset.type;
         const habit = cell.parentElement.dataset.habit;
         const dayIndex = parseInt(cell.dataset.dayIndex);
         if (rowType === "habit" && dayIndex !== undefined) {
             if (!currentCycle[dayIndex].data) {
                 currentCycle[dayIndex].data = {};
             }
             currentCycle[dayIndex].data[habit] = cell.textContent;
             saveToLocalStorage();
             console.log(`Saved ${habit} emoji: ${cell.textContent} for day ${dayIndex + 1}`);
         }
     }
  
  
    // CALORIES AND NOTES LOG SCREEN
    function openLogScreen(dayIndex) { // Take the index as argument
        selectedDayIndex = dayIndex;
        selectedDayText.textContent = `Day ${dayIndex + 1}`; // Display day + 1
        loggingScreen.classList.remove("hidden");
        //Pre-fill the form if there is already data for that day
        if (currentCycle[selectedDayIndex].data.calories) {
            caloriesLog.value = currentCycle[selectedDayIndex].data.calories;
        } else {
            caloriesLog.value = "";
        }
        if (currentCycle[selectedDayIndex].data.notes) {
            notesLog.value = currentCycle[selectedDayIndex].data.notes;
        } else {
            notesLog.value = "";
        }
    }
  
    saveLogBtn.addEventListener("click", () => {
        const calories = caloriesLog.value;
        const notes = notesLog.value;
  
        if (selectedDayIndex !== undefined && selectedDayIndex >= 0 && selectedDayIndex < currentCycle.length) {
            currentCycle[selectedDayIndex].data.calories = calories;
            currentCycle[selectedDayIndex].data.notes = notes;
  
            // *** UPDATE TABLE CELLS ***
            const caloriesRow = document.querySelector('[data-type="calories"]');
            const notesRow = document.querySelector('[data-type="notes"]');
  
            if (caloriesRow && notesRow) {
                const caloriesCell = caloriesRow.cells[selectedDayIndex + 1]; // +1 to account for the first cell with the row label
                const notesCell = notesRow.cells[selectedDayIndex + 1];
  
                if (caloriesCell) {
                    caloriesCell.textContent = calories;
                }
  
                //adding innerHTML so line breaks can appear.
                if (notesCell) {
                    notesCell.innerHTML = notes.replace(/\n/g, "<br>");
                }
            }
        }
  
        loggingScreen.classList.add("hidden");
        console.log(currentCycle); //For testing purposes to see if the data is saved
        saveToLocalStorage();
    });
  
    closeLogBtn.addEventListener("click", () => {
        loggingScreen.classList.add("hidden");
    });
  
  //SYMPTOMS LOG SCREEN 
  
  function openSymptomsScreen(dayIndex) {
    selectedDayIndex = dayIndex;
    symptomsScreen.classList.remove("hidden");
    symptomsList.innerHTML = "";
    
    const selectedDayText = document.createElement('p'); 
    selectedDayText.id = "selectedDay";
    selectedDayText.textContent = `Day ${dayIndex + 1}`;
    
    symptomsList.appendChild(selectedDayText); 
  
    symptoms.forEach(symptom => {
      const item = document.createElement("div");
      item.textContent = symptom;
      item.classList.add("symptom-item");
  
      // Load previously saved severity
      const savedSymptoms = currentCycle[selectedDayIndex]?.data?.symptoms || [];
      const savedSymptom = savedSymptoms.find(s => s.name === symptom);
      if (savedSymptom) {
        item.classList.add(savedSymptom.severity);
      }
  
      // Implement click logic for symptom selection
      item.addEventListener("click", () => {
        // Cycle through severities: none, mild, moderate, severe
        if (item.classList.contains("mild")) {
          item.classList.remove("mild");
          item.classList.add("moderate");
        } else if (item.classList.contains("moderate")) {
          item.classList.remove("moderate");
          item.classList.add("severe");
        } else if (item.classList.contains("severe")) {
          item.classList.remove("severe");
          item.classList.remove("mild"); // Remove any existing severity
        } else { 
          item.classList.add("mild"); 
        }
      });
  
      symptomsList.appendChild(item);
    });
  }
  
  saveSymptomBtn.addEventListener("click", () => {
    const selectedSymptoms = [];
    document.querySelectorAll(".symptom-item").forEach(item => {
        if (item.classList.contains("mild")) {
            selectedSymptoms.push({ name: item.textContent, severity: "mild" });
        } else if (item.classList.contains("moderate")) {
            selectedSymptoms.push({ name: item.textContent, severity: "moderate" });
        } else if (item.classList.contains("severe")) {
            selectedSymptoms.push({ name: item.textContent, severity: "severe" });
        }
    });
  
    if (selectedDayIndex !== undefined && selectedDayIndex >= 0 && selectedDayIndex < currentCycle.length) {
        currentCycle[selectedDayIndex].data.symptoms = selectedSymptoms;
        
        // Update both the summary row and individual symptom rows
        updateSymptomRows(Array.from(new Set(
            currentCycle.flatMap(day => day.data?.symptoms || [])
            .map(symptom => ({ name: symptom.name, severity: symptom.severity }))
        )));
        
        // Update the summary cell
        const symptomsRow = document.querySelector('tr[data-type="symptoms"]');
        if (symptomsRow) {
            const symptomsCell = symptomsRow.cells[selectedDayIndex + 1];
            if (symptomsCell) {
                let symptomsText = selectedSymptoms.map(symptom => 
                    `${symptom.name} <span style="color: ${getSeverityColor(symptom.severity)}">●</span>`
                ).join(', ');
                symptomsCell.innerHTML = symptomsText;
            }
        }
    }
    
    symptomsScreen.classList.add("hidden");
    saveToLocalStorage();
  });
  
  closeSymptomBtn.addEventListener("click", () => {
    symptomsScreen.classList.add("hidden");
  });
  
  
  
  

  saveAsJsonAndPdf?.addEventListener('click', async () => {
    console.log("Save button clicked - starting save process");
    
    // Create a flag to prevent double execution
    if (saveAsJsonAndPdf.dataset.saving) {
        console.log("Save already in progress, skipping");
        return;
    }
    
    saveAsJsonAndPdf.dataset.saving = "true";
    
    try {
        // Save as JSON
        const data = JSON.stringify(currentCycle, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Cycle_${cycleStartDateInput.value}.json`; 
        link.click();
        URL.revokeObjectURL(url);
        console.log("JSON file saved");

        // Save as PDF
        const { jsPDF } = window.jspdf;
        const trackerTable = document.getElementById("trackerTable");
        const pdf = new jsPDF('l', 'mm', 'a3');

        const canvas = await html2canvas(trackerTable, {
            scrollY: -window.scrollY,
            scale: 2,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = 0;
        while (position < imgHeight) {
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            position += pageHeight;
            if (position < imgHeight) pdf.addPage();
        }

        const filename = `Cycle_${cycleStartDateInput.value}.pdf`;
        pdf.save(filename);
        console.log("PDF file saved");

    } catch (error) {
        console.error('Error during save process:', error);
    } finally {
        // Reset the saving flag
        delete saveAsJsonAndPdf.dataset.saving;
    }
});


// MOOD MENU
function openMoodMenu(cell) {
    selectedMoodCell = cell;
    const row = cell.parentElement;
    moodMenuScreen.classList.remove("hidden");
    moodMenuScreen.dataset.moodTime = row.dataset.moodTime;
    moodMenuScreen.dataset.columnIndex = cell.cellIndex;
}

// Remove any existing handlers and add new ones
document.querySelectorAll(".mood-btn").forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener("click", function() {
        // Extract just the emoji using a more precise method
        const emoji = this.textContent.match(/^[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]/u)[0];
        const moodTime = moodMenuScreen.dataset.moodTime;
        const columnIndex = parseInt(moodMenuScreen.dataset.columnIndex);
        
        if (selectedMoodCell) {
            selectedMoodCell.textContent = emoji;
            const dayIndex = columnIndex - 1;
            if (!currentCycle[dayIndex].data) {
                currentCycle[dayIndex].data = {};
            }
            if (!currentCycle[dayIndex].data.moods) {
                currentCycle[dayIndex].data.moods = {};
            }
            currentCycle[dayIndex].data.moods[moodTime] = emoji;
            saveToLocalStorage();
        }
        moodMenuScreen.classList.add("hidden");
    });
});

closeMoodMenuBtn.addEventListener("click", () => {
    moodMenuScreen.classList.add("hidden");
});

// Add new general menu functions
function openGeneralMenu(dayIndex) {
    console.log(`Opening general menu for day: ${dayIndex}`);
    selectedDayIndex = dayIndex;
    selectedColumnIndex = dayIndex + 1;
    const dayData = currentCycle[dayIndex];
    
    selectedDayHeader.textContent = `Day ${dayData.cycleDay} - ${dayData.weekday} ${dayData.day}`;
    
    // Reset all form fields and states
    document.getElementById('generalMenuCalories').value = '';
    document.getElementById('generalMenuNotes').value = '';
    
    // Reset all buttons
    document.querySelectorAll('.emoji-btn, .habit-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.backgroundColor = '';
    });
    
    // Load saved data for this specific day
    if (dayData.data) {
        // Load calories and notes
        document.getElementById('generalMenuCalories').value = dayData.data.calories || '';
        document.getElementById('generalMenuNotes').value = dayData.data.notes || '';
        
        // Load cycle phase and sex selections
        if (dayData.data.cyclePhase) {
            const cycleBtn = document.querySelector(`.emoji-btn[data-habit="cyclePhase"][data-value="${dayData.data.cyclePhase}"]`);
            if (cycleBtn) {
                cycleBtn.classList.add('selected');
                cycleBtn.style.backgroundColor = '#e0e0e0';
            }
        }
        
        if (dayData.data.Sex) {
            const sexBtn = document.querySelector(`.emoji-btn[data-habit="Sex"][data-value="${dayData.data.Sex}"]`);
            if (sexBtn) {
                sexBtn.classList.add('selected');
                sexBtn.style.backgroundColor = '#e0e0e0';
            }
        }
        
        // Load other habits
        document.querySelectorAll('.habit-btn').forEach(btn => {
            const habit = btn.dataset.habit;
            if (dayData.data[habit]) {
                btn.classList.add('selected');
                btn.style.backgroundColor = '#e0e0e0';
            }
        });
    }

    generalMenuScreen.classList.remove('hidden');
}

// Single event handler for emoji buttons (cycle phase and sex)
document.addEventListener('click', function(e) {
    if (!e.target.matches('.emoji-btn')) return;
    
    const button = e.target;
    const habit = button.dataset.habit;
    const value = button.dataset.value;
    
    // Reset other buttons in the same group
    const group = button.closest('.emoji-options');
    group.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.backgroundColor = '';
    });
    
    // Handle selection
    if (value === ' ') {
        if (currentCycle[selectedDayIndex].data && currentCycle[selectedDayIndex].data[habit]) {
            delete currentCycle[selectedDayIndex].data[habit];
        }
    } else {
        button.classList.add('selected');
        button.style.backgroundColor = '#e0e0e0';
        
        if (!currentCycle[selectedDayIndex].data) {
            currentCycle[selectedDayIndex].data = {};
        }
        currentCycle[selectedDayIndex].data[habit] = value;
    }
    
    // Update tracker table
    updateTrackerCell(habit, value);
    saveToLocalStorage();
});

// Single event handler for habit buttons
document.querySelector('.habit-buttons').addEventListener('click', function(e) {
    if (!e.target.classList.contains('habit-btn')) return;
    
    const button = e.target;
    const habit = button.dataset.habit;
    const emoji = button.textContent.trim().split(' ').pop(); // Get emoji from button text
    
    button.classList.toggle('selected');
    button.style.backgroundColor = button.classList.contains('selected') ? '#e0e0e0' : '';
    
    if (!currentCycle[selectedDayIndex].data) {
        currentCycle[selectedDayIndex].data = {};
    }
    
    currentCycle[selectedDayIndex].data[habit] = button.classList.contains('selected') ? emoji : '';
    updateTrackerCell(habit, currentCycle[selectedDayIndex].data[habit]);
    saveToLocalStorage();
});

// Helper function to update tracker table cell
function updateTrackerCell(habit, value) {
    const row = document.querySelector(`tr[data-habit="${habit}"]`);
    if (row) {
        const cell = row.cells[selectedColumnIndex];
        if (cell) {
            cell.textContent = value;
            cell.style.backgroundColor = 'transparent'; // Ensure no background color
        }
    }
}

// Save button handler
saveGeneralMenu.addEventListener('click', () => {
    if (!currentCycle[selectedDayIndex].data) {
        currentCycle[selectedDayIndex].data = {};
    }

    const calories = document.getElementById('generalMenuCalories').value;
    const notes = document.getElementById('generalMenuNotes').value;
    
    // Save calories and notes
    currentCycle[selectedDayIndex].data.calories = calories;
    currentCycle[selectedDayIndex].data.notes = notes;
    
    // Update tracker cells
    const caloriesRow = document.querySelector('[data-type="calories"]');
    const notesRow = document.querySelector('[data-type="notes"]');
    
    if (caloriesRow) {
        caloriesRow.cells[selectedColumnIndex].textContent = calories;
    }
    if (notesRow) {
        notesRow.cells[selectedColumnIndex].innerHTML = notes.replace(/\n/g, "<br>");
    }

    saveToLocalStorage();
    generalMenuScreen.classList.add('hidden');
});

// Remove all other duplicate event handlers and keep only these essential ones
// ...existing code...

// Add mood button handlers
document.getElementById('morningMoodBtn').addEventListener('click', () => {
    openMoodMenuFromGeneral('morning');
});
document.getElementById('afternoonMoodBtn').addEventListener('click', () => {
    openMoodMenuFromGeneral('afternoon');
});
document.getElementById('eveningMoodBtn').addEventListener('click', () => {
    openMoodMenuFromGeneral('evening');
});

function openMoodMenuFromGeneral(timeOfDay) {
    moodMenuScreen.dataset.moodTime = timeOfDay;
    moodMenuScreen.dataset.columnIndex = selectedColumnIndex;
    moodMenuScreen.classList.remove('hidden');
    moodMenuScreen.dataset.dayIndex = selectedDayIndex;
}

// Close buttons
closeGeneralMenu.addEventListener('click', () => {
    generalMenuScreen.classList.add('hidden');
});

// Add symptoms button handler
document.getElementById('openSymptomsBtn').addEventListener('click', () => {
    openSymptomsScreen(selectedDayIndex);
});

closeSymptomBtn.addEventListener("click", () => {
    symptomsScreen.classList.add("hidden");
});

closeMoodMenuBtn.addEventListener("click", () => {
    moodMenuScreen.classList.add("hidden");
});

// Update mood button click handlers
document.querySelectorAll(".mood-btn").forEach(btn => {
    btn.addEventListener("click", function() {
        const emoji = this.textContent.match(/^[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]/u)[0];
        const moodTime = moodMenuScreen.dataset.moodTime;
        const dayIndex = parseInt(moodMenuScreen.dataset.dayIndex);

        // Ensure data structure exists
        if (!currentCycle[dayIndex].data) {
            currentCycle[dayIndex].data = {};
        }
        if (!currentCycle[dayIndex].data.moods) {
            currentCycle[dayIndex].data.moods = {};
        }

        // Save mood
        currentCycle[dayIndex].data.moods[moodTime] = emoji;

        // Update cell in tracker table immediately
        const moodRow = document.querySelector(`tr[data-type="habit"][data-habit="Mood"][data-mood-time="${moodTime}"]`);
        if (moodRow) {
            const cell = moodRow.cells[dayIndex + 1];
            if (cell) {
                cell.textContent = emoji;
                cell.style.backgroundColor = 'transparent'; // Ensure no background color
            }
        }

        saveToLocalStorage();
        moodMenuScreen.classList.add('hidden');
    });
});

function openMoodMenuFromGeneral(timeOfDay) {
    moodMenuScreen.dataset.moodTime = timeOfDay;
    moodMenuScreen.dataset.columnIndex = selectedColumnIndex;
    moodMenuScreen.dataset.dayIndex = selectedDayIndex;
    moodMenuScreen.classList.remove('hidden');
}

// Make sure we have the closing bracket for DOMContentLoaded
    function updateSymptomRows(selectedSymptoms) {
        const trackerBody = document.getElementById('trackerBody');
        
        // First, remove any existing symptom rows
        document.querySelectorAll('tr[data-type="individual-symptom"]').forEach(row => row.remove());
        
        // Get all unique symptoms across all days
        const allSymptoms = new Set();
        currentCycle.forEach(day => {
            if (day.data && day.data.symptoms) {
                day.data.symptoms.forEach(symptom => {
                    allSymptoms.add(symptom.name);
                });
            }
        });
        
        // Convert to array and sort alphabetically
        const sortedSymptoms = Array.from(allSymptoms).sort();
        
        // Create rows for each unique symptom
        sortedSymptoms.forEach(symptomName => {
            const row = document.createElement('tr');
            row.dataset.type = 'individual-symptom';
            row.dataset.symptomName = symptomName;
            
            // Add the symptom name cell
            const nameCell = document.createElement('td');
            nameCell.textContent = symptomName;
            row.appendChild(nameCell);
            
            // Add cells for each day
            for (let i = 0; i < currentCycle.length; i++) {
                const cell = document.createElement('td');
                cell.classList.add('clickable');
                cell.style.cursor = 'pointer';
                
                // Check if this day has this symptom
                const daySymptoms = currentCycle[i]?.data?.symptoms || [];
                const daySymptom = daySymptoms.find(s => s.name === symptomName);
                
                if (daySymptom) {
                    cell.style.backgroundColor = getSeverityColor(daySymptom.severity);
                }
                
                // Add click handler to open symptoms screen
                cell.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openGeneralMenu(i);
                });
                
                row.appendChild(cell);
            }
            
            // Insert the new row before the summary symptoms row
            const summaryRow = document.querySelector('tr[data-type="symptoms"]');
            trackerBody.insertBefore(row, summaryRow);
        });
    }

    function getSeverityColor(severity) {
        switch (severity) {
            case 'mild': return '#9EE09E';
            case 'moderate': return '#FEB144';
            case 'severe': return '#FF6663';
            default: return '';
        }
    }

}); // Close the DOMContentLoaded event listener
