import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCg8WRJx4wu-kkynIIIiLbbU5GaTxU-E9s",
  authDomain: "fumstudio-b6694.firebaseapp.com",
  databaseURL: "https://fumstudio-b6694-default-rtdb.firebaseio.com",
  projectId: "fumstudio-b6694",
  storageBucket: "fumstudio-b6694.firebasestorage.app",
  messagingSenderId: "505195774753",
  appId: "1:505195774753:web:7b94be0cf52e52a22f7460",
  measurementId: "G-E4LBX75DR0"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const conversionRates = {
    'USD': 0.054,
    'EUR': 0.050,
    'ZAR': 1
};

function convertPrice(price, currency) {
    if (!price) return 'Price not available';
    
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return price;
    
    if (currency === 'ZAR') {
        return `R ${numericPrice.toFixed(2)}`;
    } else if (conversionRates[currency]) {
        const convertedPrice = numericPrice * conversionRates[currency];
        return `${currency} ${convertedPrice.toFixed(2)}`;
    }
    return `$${numericPrice.toFixed(2)}`; // Default to USD format
}

function updateAllPrices(currency) {
    const priceElements = document.querySelectorAll('.item-price');
    priceElements.forEach(element => {
        const originalPrice = element.dataset.price;
        element.textContent = convertPrice(originalPrice, currency);
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        const userRef = ref(db, `users/${userId}/selectedCurrency`);
        
        get(userRef).then((snapshot) => {
            const selectedCurrency = snapshot.exists() ? snapshot.val() : 'ZAR';
            updateAllPrices(selectedCurrency);
        }).catch((error) => {
            console.error("Error fetching currency:", error);
            updateAllPrices('ZAR'); // Fallback to ZAR
        });
    } else {
        updateAllPrices('ZAR'); // Default to ZAR for non-logged in users
    }
});