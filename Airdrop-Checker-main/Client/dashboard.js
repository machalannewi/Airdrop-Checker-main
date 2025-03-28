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
