document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and activity select
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants header + list (rendered separately for better markup)
        const participantsHeader = document.createElement("p");
        participantsHeader.className = "participants-header";
        participantsHeader.innerHTML = "<strong>Participants:</strong>";

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          details.participants.forEach((p) => {
            const li = document.createElement("li");

            const emailSpan = document.createElement("span");
            emailSpan.className = "participant-email";
            emailSpan.textContent = p;

            const removeBtn = document.createElement("button");
            removeBtn.className = "participant-remove";
            removeBtn.type = "button";
            removeBtn.title = `Remove ${p}`;
            removeBtn.setAttribute("aria-label", `Remove ${p} from ${name}`);
            removeBtn.innerHTML = "✖";

            removeBtn.addEventListener("click", async () => {
              if (!confirm(`Unregister ${p} from ${name}?`)) return;
              try {
                const res = await fetch(
                  `/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(p)}`,
                  { method: "DELETE" }
                );
                const resJson = await res.json();
                if (res.ok) {
                  messageDiv.textContent = resJson.message;
                  messageDiv.className = "success";
                  messageDiv.classList.remove("hidden");
                  // Refresh the list to reflect changes
                  fetchActivities();
                } else {
                  messageDiv.textContent = resJson.detail || "Failed to remove participant";
                  messageDiv.className = "error";
                  messageDiv.classList.remove("hidden");
                }

                // Auto-hide message after a short delay
                setTimeout(() => {
                  messageDiv.classList.add("hidden");
                }, 3500);
              } catch (err) {
                console.error(err);
                messageDiv.textContent = "Failed to remove participant";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
              }
            });

            li.appendChild(emailSpan);
            li.appendChild(removeBtn);
            participantsList.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.textContent = "No participants yet";
          li.className = "muted";
          participantsList.appendChild(li);
        }

        activityCard.appendChild(participantsHeader);
        activityCard.appendChild(participantsList);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities to show the newly registered participant
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
