document.getElementById("viewAirdropBtn").addEventListener("click", async () => {
    const token = localStorage.getItem("token"); // Get JWT token from local storage
    if (!token) {
        document.getElementById("message").textContent = "You need to log in first!";
        return;
    }

    try {
        // Check if the user is subscribed
        const res = await fetch("http://localhost:5000/api/users/status", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!data.subscribed) {
            document.getElementById("message").textContent = "You must subscribe to view airdrops!";
            return;
        }

        // Fetch Airdrops if Subscribed
        const airdropRes = await fetch("http://localhost:5000/api/airdrops", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const airdropData = await airdropRes.json();
        displayAirdrops(airdropData);
    } catch (error) {
        document.getElementById("message").textContent = "Error fetching data!";
    }
});

// Function to Display Airdrops
// function displayAirdrops(airdrops) {
//     const container = document.getElementById("airdropContainer");
//     container.innerHTML = ""; // Clear previous content

//     if (airdrops.length === 0) {
//         container.innerHTML = "<p>No airdrops available.</p>";
//         return;
//     }

//     airdrops.forEach(airdrop => {
//         const div = document.createElement("div");
//         div.innerHTML = `<h3>${airdrop.name}</h3><p>${airdrop.description}</p>`;
//         container.appendChild(div);
//     });
// }


document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch("http://localhost:5000/api/deposits/user", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();

        if (data.deposits.length === 0) {
            document.getElementById("deposit-list").innerHTML = "<p>No deposits yet.</p>";
        } else { 
            data.deposits.forEach(deposit => {
            const card = document.createElement("div");
            card.className = "deposit-card";
            card.innerHTML = `
              <p><strong>Amount:</strong> $${deposit.amount}</p>
              <p><strong>Currency:</strong> ${deposit.currency}</p>
              <p><strong>Status:</strong> 
                <span class="${deposit.status === 'verified' ? 'status-verified' : 'status-pending'}">
                  ${deposit.status}
                </span>
              </p>
              <p><strong>Date:</strong> ${new Date(deposit.createdAt).toLocaleString()}</p>
              
            `;
            depositList.appendChild(card);
          });
        }
    } catch (error) {
        console.error("📛 Error fetching deposits:", error);
        document.getElementById("deposit-list").innerHTML = "<p>Failed to load deposits.</p>";
    }
});



const depositList = document.getElementById("deposit-list");

deposits.forEach(deposit => {
  const card = document.createElement("div");
  card.className = "deposit-card";
  card.innerHTML = `
    <h2>${deposit.username || deposit.email}</h2>
    <p><strong>Amount:</strong> $${deposit.amount}</p>
    <p><strong>Currency:</strong> ${deposit.currency}</p>
    <p><strong>Status:</strong> 
      <span class="${deposit.status === 'verified' ? 'status-verified' : 'status-pending'}">
        ${deposit.status}
      </span>
    </p>
    <p><strong>Date:</strong> ${new Date(deposit.createdAt).toLocaleString()}</p>
    ${deposit.status === "pending" ? `<button class="verify-btn" onclick="verifyDeposit('${deposit._id}')">Verify</button>` : ""}
  `;
  depositList.appendChild(card);
});

