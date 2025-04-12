//  Get all modal elements
const paymentModal = document.getElementById("paymentModal");
const cryptoModal = document.getElementById("cryptoModal");
const subscribeBtn = document.getElementById("subscribeBtn");
const closeBtns = document.querySelectorAll(".close, .close-crypto");
const backBtn = document.querySelector(".back-button");
const cryptoOption = document.getElementById("cryptoOption");
const paystackOption = document.getElementById("paystackOption");
const cryptoOptions = document.querySelectorAll(".crypto-option");

// When the user clicks the subscribe button, open the payment modal
subscribeBtn.onclick = function() {
    paymentModal.style.display = "block";
}

// When the user clicks on (x), close the current modal
closeBtns.forEach(btn => {
    btn.onclick = function() {
        paymentModal.style.display = "none";
        cryptoModal.style.display = "none";
    }
});

// Back button in crypto modal
backBtn.onclick = function() {
    cryptoModal.style.display = "none";
    paymentModal.style.display = "block";
}

// When the user clicks anywhere outside of a modal, close it
window.onclick = function(event) {
    if (event.target == paymentModal) {
        paymentModal.style.display = "none";
    }
    if (event.target == cryptoModal) {
        cryptoModal.style.display = "none";
    }
}

// Handle payment option selection
cryptoOption.querySelector(".select-button").onclick = async function () {
    try {
        const res = await fetch("http://localhost:5000/api/wallets/wallet-addresses");
        const data = await res.json();
    
        const walletList = document.getElementById("walletList");
        walletList.innerHTML = `
          <li>
            <strong>Bitcoin (BTC):</strong> ${data.btc}
            <button class="copy-btn" data-address="${data.btc}">Copy</button>
          </li>
          <li>
            <strong>Ethereum (ETH):</strong> ${data.eth}
            <button class="copy-btn" data-address="${data.eth}">Copy</button>
          </li>
          <li>
            <strong>Solana (SOL):</strong> ${data.sol}
            <button class="copy-btn" data-address="${data.sol}">Copy</button>
          </li>
        `;
        
        // Add click event listeners to all copy buttons
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', function() {
                const address = this.getAttribute('data-address');
                navigator.clipboard.writeText(address)
                    .then(() => {
                        // Change button text temporarily to show success
                        const originalText = this.textContent;
                        this.textContent = 'Copied!';
                        setTimeout(() => {
                            this.textContent = originalText;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy address: ', err);
                    });
            });
        });
    
        paymentModal.style.display = "none";
        cryptoModal.style.display = "block";
      } catch (error) {
        console.error("Failed to fetch wallet addresses:", error);
      }
}

paystackOption.querySelector(".select-button").addEventListener("click", async () => {
    paymentModal.style.display = "none";
    const token = localStorage.getItem("token");

    try {
        const res = await fetch("http://localhost:5000/api/paystack/pay", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        if (data.authorization_url) {
            window.location.href = data.authorization_url; // Redirect to Paystack payment page
        } else {
            alert("Payment initialization failed.");
        }
    } catch (error) {
        console.error("Error starting payment:", error);
        alert("An error occurred. Try again.");
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
        alert("Subscription successful!");
        localStorage.setItem("subscribed", "true");
    } else if (params.get("success") === "false") {
        alert("Payment failed. Try again.");
    }
});

// Handle crypto currency selection
// cryptoOptions.forEach(option => {
//     option.addEventListener('click', function() {
//         // Hide all wallet addresses first
//         document.querySelectorAll('.wallet-address').forEach(addr => {
//             addr.style.display = 'none';
//         });
        
//         // Hide all payment instructions
//         document.querySelector('.payment-instructions').style.display = 'none';
        
//         // Show the selected wallet address
//         const walletAddress = this.querySelector('.wallet-address');
//         walletAddress.style.display = 'block';
        
//         // Show payment instructions
//         document.querySelector('.payment-instructions').style.display = 'block';
//     });
// });

// Handle copy address buttons
// document.querySelectorAll('.copy-button').forEach(button => {
//     button.addEventListener('click', function(e) {
//         e.stopPropagation(); // Prevent triggering the parent click event
//         const address = this.getAttribute('data-address');
//         navigator.clipboard.writeText(address).then(() => {
//             const originalText = this.textContent;
//             this.textContent = 'Copied!';
//             setTimeout(() => {
//                 this.textContent = originalText;
//             }, 2000);
//         });
//     });
// });