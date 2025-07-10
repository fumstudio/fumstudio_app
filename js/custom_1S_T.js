
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
  import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL,deleteObject } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";
  import { getDatabase, ref, set, get, remove,ref as dbRef } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

  // Firebase configuration
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

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  const database = getDatabase(app);  // Initialize Realtime Database
  const auth = getAuth();
  const db = getDatabase();

document.addEventListener('DOMContentLoaded', () => {



const logosettings = document.getElementById('logosettings');
    const shareButton = document.getElementById('shareButton');
    const linkContainer = document.getElementById('linkContainer');
    const imageLink = document.getElementById('imageLink');

  
  let autoBreakEnabled = true;
  let breakSize = 'words';
  let currentColor = "#000000";
  let currentFont = "shrikhand";
  let currentText = "";
  let secondaryText = "";
    // Firebase Authentication listener
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User is logged in:', user.email);  // Logs the user's email
        console.log('User ID:', user.uid);  // Logs the user's UID
      } else {
        console.log('No user is logged in');
        window.location.href = 'login.html';  // Redirect to login if not authenticated
      }
    });





// Function to delete the image
const urlParams = new URLSearchParams(window.location.search);
const logoId = urlParams.get('logoId');

if (logoId) {
  const logoRef = ref(database, 'logos/' + logoId);

  get(logoRef).then((snapshot) => {
    if (snapshot.exists()) {
      const logoData = snapshot.val();
      // Render the logo data on the page (e.g., display text and image)
      document.getElementById('logoText').textContent = logoData.text;
      document.getElementById('secondaryText').textContent = logoData.secondaryText;
      // You can add more logic to render colors, fonts, or the image URL if available
    } else {
      console.error('Logo not found');
      alert('Logo not found!');
    }
  }).catch((error) => {
    console.error('Error fetching logo:', error);
    alert('Error fetching logo!');
  });
}


  // File upload handling (optional, if using image upload)
  



  // Function to generate a random logo
  window.generateRandomLogo = function() {
    const randomFonts = ["shrikhand", "chewy", "Lobster", "Quicksand"];
    const randomColors = [" #A02A2A", " #4F6F9F", " #4B6F44", " #8808C1"];
    const randomText = ["Awesome", "Creative", "Logo Design", "Fantastic", "Brand Name"];
    const randomSecondaryText = ["Tagline", "By Us", "Est. 2024", "Your Brand", "Design Name"];

    const logoTextValue = document.getElementById('logoText').value || randomText[Math.floor(Math.random() * randomText.length)];
    const secondaryTextValue = document.getElementById('secondaryText').value || randomSecondaryText[Math.floor(Math.random() * randomSecondaryText.length)];

    const randomFont = randomFonts[Math.floor(Math.random() * randomFonts.length)];
    const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];

    document.getElementById('logoText').value = logoTextValue;
    document.getElementById('secondaryText').value = secondaryTextValue;
    setFont(randomFont);
    
    setTextColor(randomColor);
  };


  let currentUserId = null;
let isShared = false;

let isItalic = false;  // This will track whether italic is enabled
let isBold = false;     // Set this to true to make the font bold by default



  function toggleItalic() {
    isItalic = !isItalic;
    updateLogo();
    const toggleButton = document.getElementById('toggleItalicBtn');
    toggleButton.innerText = isItalic ? 'T' : 'T';
    toggleButton.style.fontStyle = isItalic ? 'normal' : 'italic';
  }

  function toggleBold() {
    isBold = !isBold;
    updateLogo();
    const toggleButton = document.getElementById('toggleBoldBtn');
    
      toggleButton.innerText = isBold ? 'B' : 'B';

    toggleButton.style.fontWeight = isBold ? 'normal' : 'bold';
  }

  document.getElementById('toggleItalicBtn').addEventListener('click', toggleItalic);
  document.getElementById('toggleBoldBtn').addEventListener('click', toggleBold);


function adjustLogoTextFontSize(element) {
  let textLength = element.textContent.length; // Get the number of characters in the text

  // Measure the available width and height of the container
  const containerWidth = element.offsetWidth;
  const containerHeight = element.offsetHeight;

  // Set a base font size for logo text
  let baseFontSize = 50;  // Default base font size for the logo

  // Adjust base font size based on text length
  if (textLength <= 10) {
    baseFontSize = 600;
  } else if (textLength <= 20) {
    baseFontSize = 40;
  } else if (textLength <= 30) {
    baseFontSize = 30;
  } else if (textLength <= 50) {
    baseFontSize = 20;
  } else {
    baseFontSize = 15;
  }

  // Calculate scale factor based on container size and text length
  let scaleFactor = Math.min(containerWidth / (textLength * 600), containerHeight / 10);

  // Adjust font size based on scale factor and base font size
  const adjustedFontSize = Math.max(baseFontSize * scaleFactor, 20); // Ensure minimum font size of 20px

  // Apply the adjusted font size
  element.style.fontSize = `${adjustedFontSize}px`;
}

// Separate function to adjust the font size of the secondary text
function adjustSecondaryTextFontSize(element) {
  const containerWidth = document.getElementById('logoContainer').offsetWidth;
  const containerHeight = document.getElementById('logoContainer').offsetHeight;
  let fontSize = 15;  // Typically smaller for secondary text

  const textLength = element.textContent.replace(/\s/g, '').length;
  fontSize = Math.max(10, Math.min(15, 15 - textLength / 4));

  element.style.fontSize = `${fontSize}px`;
}

// Function to break text into chunks based on word or character mode
function breakTextIntoChunks(text, breakSize) {
  if (autoBreakEnabled === 'word') {
    return breakTextByWords(text, breakSize);
  } else if (autoBreakEnabled === 'character') {
    return breakTextByCharacters(text, breakSize);
  }
  return text;
}

// Break text by words
function breakTextByWords(text, breakSize) {
  const words = text.split(/\s+/); // Split text into words
  let chunks = [];
  let currentChunk = '';

  for (let word of words) {
    if (word.length >= 8) {
      // If word has 13 or more letters, break it into smaller chunks
      while (word.length >= 8) {
        chunks.push(word.substring(0, 8)); // Take the first 13 letters
        word = word.substring(8); // Take the remaining part of the word
      }
      if (word.length > 0) {
        currentChunk += word; // Add the remainder of the word
      }
    } else {
      // Add the word to the current chunk
      if (currentChunk.length + word.length + 1 <= breakSize) {
        currentChunk += (currentChunk.length > 0 ? ' ' : '') + word;
      } else {
        chunks.push(currentChunk);
        currentChunk = word; // Start a new chunk with the current word
      }
    }
  }

  // If there's any leftover text in the current chunk, push it to the chunks array
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks.join('<br>'); // Join chunks with a line break for display
}

// Break text by characters
function breakTextByCharacters(text, breakSize) {
  const chars = text.split(''); // Split text into individual characters
  let formattedText = '';
  let chunk = '';

  for (let i = 0; i < chars.length; i++) {
    chunk += chars[i]; // Add character to current chunk

    // Add line break after every 1 to 3 characters
    if ((i + 1) % 3 === 0 || i === chars.length - 1) {
      formattedText += chunk + '<br>';
      chunk = ''; // Reset chunk after breaking
    }
  }
  return formattedText.trim(); // Remove trailing space
}

// Function to update the logo with user input

  function setFont(font) {
    currentFont = font;
    updateLogo();  // Update the logo with the selected font
  }
  // Function to set the font for logo text
  window.setFont = function(font) {
      currentFont = font;
      updateLogo(); // Update the logo with the selected font
          // Hide the font container and overlay when a font is selected
      document.getElementById('font-container').style.display = 'none';
      document.getElementById('dark-overlay').style.display = 'none';

    }
  window.updateLogo = function() {
    let logoText = document.getElementById('logoText').value || '';
    let secondaryText = document.getElementById('secondaryText').value || '';

    logoText = logoText.substring(0, 150);
    secondaryText = secondaryText.substring(0, 150);

    const formattedText = breakTextIntoChunks(logoText, 25);
  const formattedSecondaryText = secondaryText;

    const logoTextPreview1 = document.getElementById('logoTextPreview1');
    const logoTextPreview2 = document.getElementById('logoTextPreview2');

    logoTextPreview1.innerHTML = formattedText;
    logoTextPreview2.innerHTML = formattedSecondaryText;

    logoTextPreview1.style.color = currentColor;
    logoTextPreview2.style.color = currentColor;
    logoTextPreview1.style.fontFamily = currentFont;
    logoTextPreview2.style.fontFamily = currentFont;

    if (isItalic) {
      logoTextPreview1.style.fontStyle = 'italic';
      logoTextPreview2.style.fontStyle = 'italic';
    } else {
      logoTextPreview1.style.fontStyle = 'normal';
      logoTextPreview2.style.fontStyle = 'normal';
    }

    if (isBold) {
      logoTextPreview1.style.fontWeight = 'bold';
      logoTextPreview2.style.fontWeight = 'bold';
    } else {
      logoTextPreview1.style.fontWeight = 'normal';
      logoTextPreview2.style.fontWeight = 'normal';
    }

    adjustLogoTextFontSize(logoTextPreview1);
    adjustSecondaryTextFontSize(logoTextPreview2);

    if (currentUserId) {
      saveLogoData(currentUserId, logoText, secondaryText, currentFont, currentColor, autoBreakEnabled);
    }
  };

  window.toggleAutoBreak = function() {
    if (autoBreakEnabled === 'word') {
      autoBreakEnabled = 'character';
      document.getElementById('autoBreakButton').innerText = 'Auto Break: 1-3 Characters';
    } else {
      autoBreakEnabled = 'word';
      document.getElementById('autoBreakButton').innerText = 'Auto Break: Every 2 Words';
    }
    updateLogo();
  };



  window.setTextColor = function(color) {
    currentColor = color;
    updateLogo();
  };



window.onload = function() {
  // Get the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const logoId = urlParams.get('logoId');

  const logosettings = document.querySelector('.logo-settings');

  try {
    // If logoId is present, load the logo data (text, font, color, etc.)
    if (logoId) {
      const dbRef = ref(database, 'logos/' + logoId);
      get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
          const logoData = snapshot.val();
          // Set the logo text and settings
          document.getElementById('logoText').value = logoData.text;
          document.getElementById('secondaryText').value = logoData.secondaryText;
          currentFont = logoData.font || 'Roboto';
          currentColor = logoData.color;
          autoBreakEnabled = logoData.autoBreakEnabled;
          breakSize = logoData.breakSize;
          isItalic = logoData.isItalic || false;
          isBold = logoData.isBold || false;
          updateLogo();

          // Remove image and load styles
          logosettings.style.display = 'none';
          document.querySelector('.bottom-navbar').style.display = 'none';
        } else {
          alert("Logo ID not found.");
        }
      }).catch((error) => {
        console.error("Error loading logo data:", error);
        alert("Error loading logo data. Please try again.");
      }).finally(() => {
        const sharebuttons = document.getElementById('sharebuttons');
        sharebuttons.style.display = 'block';
        addToCartBtn.style.display = 'none';
        shareBtn.style.display = 'none';

      });
    }
  } catch (error) {
    console.error("Error loading logo data:", error);
  }
};
const shareLink = document.getElementById('shareLink');
const shareLinkContainer = document.getElementById('shareLinkContainer');


// Function to generate a shareable URL

function showCartAlert(message, iconClass = "") {
  console.log('Displaying cart alert message:', message); // Debugging: Log when cart alert is triggered

  const cartAlert = document.getElementById('Alert');
  const overlay = document.getElementById('overlay');

  if (cartAlert && overlay) {
    // Add the icon to the message if an icon class is provided
    const iconHtml = iconClass ? `<i class="${iconClass}"></i> ` : '';
    cartAlert.innerHTML = iconHtml + message; // Set the message with the icon inside the cart alert
    cartAlert.style.display = 'block'; // Show the cart alert
    overlay.style.display = 'block'; // Show the overlay

    // Start the countdown for hiding the alert
    startAlertTimeout();

    // Pause the countdown when the user interacts with the overlay or alert
    overlay.addEventListener('mousedown', pauseAlertCountdown);
    cartAlert.addEventListener('mousedown', pauseAlertCountdown);
    overlay.addEventListener('touchstart', pauseAlertCountdown);
    cartAlert.addEventListener('touchstart', pauseAlertCountdown);

    // Cancel the alert and hide immediately when the user clicks on the alert or overlay
    overlay.addEventListener('click', cancelAndHideAlert);
    cartAlert.addEventListener('click', cancelAndHideAlert);

    // Resume countdown after the user stops interacting
    overlay.addEventListener('mouseup', resumeAlertCountdown);
    cartAlert.addEventListener('mouseup', resumeAlertCountdown);
    overlay.addEventListener('touchend', resumeAlertCountdown);
    cartAlert.addEventListener('touchend', resumeAlertCountdown);
  } else {
    console.error('Cart alert or overlay element not found');
  }
}







    // Fetch product price from Firebase
    async function fetchProductPrice() {
        try {
            const priceRef = ref(database, `items/${itemId}/images/${imageIndex}/mainImage/displayPrice`);
            const snapshot = await get(priceRef);
            
            if (snapshot.exists()) {
                productPrice = parseFloat(snapshot.val());
                console.log("Fetched product price:", productPrice);
                return true;
            } else {
                console.warn("No price found for this product variation");
                return false;
            }
        } catch (error) {
            console.error("Error fetching price:", error);
            return false;
        }
    }


let alertTimeout;
let alertStartTime = 0;
let alertTimeLeft = 3000;


function startAlertTimeout() {
  alertStartTime = Date.now();
  clearTimeout(alertTimeout);
  alertTimeout = setTimeout(() => {
    const cartAlert = document.getElementById('Alert');
    const overlay = document.getElementById('overlay');
    if (cartAlert && overlay) {
      console.log("Hiding alert after timeout");
      cartAlert.style.display = 'none';
      overlay.style.display = 'none';
    } else {
      console.error('Cart alert or overlay not found during timeout.');
    }
    alertTimeLeft = 3000;
  }, alertTimeLeft);
}

function pauseAlertCountdown() {
  clearTimeout(alertTimeout);
  console.log("Alert paused, countdown stopped.");
}

function cancelAndHideAlert(event) {
  const cartAlert = document.getElementById('Alert');
  const overlay = document.getElementById('overlay');

  if (cartAlert && overlay) {
    cartAlert.style.display = 'none';
    overlay.style.display = 'none';
    console.log("Alert canceled and hidden immediately.");
  } else {
    console.error('Cart alert or overlay not found when canceling.');
  }

  alertTimeLeft = 3000;
  clearTimeout(alertTimeout);
  console.log("Countdown reset to 5000.");
}

function resumeAlertCountdown() {
  startAlertTimeout();
  console.log("Alert resumed, countdown restarted.");
}

function showCartAlert(message, iconClass = "") {
  console.log('Displaying cart alert message:', message);

  const cartAlert = document.getElementById('Alert');
  const overlay = document.getElementById('overlay');

  if (cartAlert && overlay) {
    const iconHtml = iconClass ? `<i class="${iconClass}"></i> ` : '';
    cartAlert.innerHTML = iconHtml + message;
    cartAlert.style.display = 'block';
    overlay.style.display = 'block';

    startAlertTimeout();

    overlay.addEventListener('mousedown', pauseAlertCountdown);
    cartAlert.addEventListener('mousedown', pauseAlertCountdown);
    overlay.addEventListener('touchstart', pauseAlertCountdown);
    cartAlert.addEventListener('touchstart', pauseAlertCountdown);

    overlay.addEventListener('click', cancelAndHideAlert);
    cartAlert.addEventListener('click', cancelAndHideAlert);

    overlay.addEventListener('mouseup', resumeAlertCountdown);
    cartAlert.addEventListener('mouseup', resumeAlertCountdown);
    overlay.addEventListener('touchend', resumeAlertCountdown);
    cartAlert.addEventListener('touchend', resumeAlertCountdown);
  } else {
    console.error('Cart alert or overlay element not found');
  }
}
// Modified Add to Cart button functionality with automatic sharing


    const nativeShareBtn = document.getElementById('nativeShareBtn');
    const whatsappShareBtn = document.getElementById('whatsappShareBtn');


    

    const itemId = urlParams.get('itemId');
    const imageIndex = urlParams.get('image') || '0';
    const selectedSize = urlParams.get('size') || 'default';


    let productPrice = null;
    let currentShareableLink = '';

    // Fetch product price
    async function fetchProductPrice() {
        try {
            const priceRef = ref(database, `items/${itemId}/images/${imageIndex}/mainImage/displayPrice`);
            const snapshot = await get(priceRef);
            
            if (snapshot.exists()) {
                productPrice = parseFloat(snapshot.val());
                return true;
            } else {
                console.warn("No price found for this product variation");
                return false;
            }
        } catch (error) {
            console.error("Error fetching price:", error);
            return false;
        }
    }


  
    // DOM Elements
    const shareBtn = document.getElementById('shareBtn');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const reAddToCartBtn = document.getElementById('reAddToCartBtn');
    





    // WhatsApp Configuration
    const whatsappNumber = "0659860276"; // +27 65 986 0276 (South Africa)

    // Fetch product price from Firebase

    // Create shareable link
function createShareableLink(designId) {
  return `${window.location.pathname}?itemId=${itemId}&image=${imageIndex}&size=${selectedSize}&logoId=${designId}`;
}
function showProcessingOverlay() {
    const processingOverlay = document.getElementById('processingOverlay');
    processingOverlay.style.display = 'flex'; // Show the overlay
    updateProgress(0); // Initialize the progress to 0%
}

// Function to hide the processing overlay
function hideProcessingOverlay() {
    const processingOverlay = document.getElementById('processingOverlay');
    processingOverlay.style.display = 'none'; // Hide the overlay
}

// Function to update the progress bar



// Function to update the progress bar with smooth counting
function updateProgress(progress) {
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  
  // Ensure progress is between 0 and 100
  progress = Math.max(0, Math.min(100, progress));
  
  // Update the display
  progressBar.style.width = progress + '%';
  progressText.textContent = Math.round(progress) + '%';
}


// Modified upload function with smooth progress updates




async function generateAndStoreLogoData() {

    // Get current values from input fields
    const currentText = document.getElementById('logoText').value || 'Your Logo';
    const secondaryText = document.getElementById('secondaryText').value || 'Secondary Text';

    // Upload image if new blob exists

    // Prepare logo data
    const logoData = {
        text: currentText,
        secondaryText: secondaryText,
        font: currentFont,
        color: currentColor,
        autoBreakEnabled: autoBreakEnabled,
        breakSize: breakSize,
        isItalic: isItalic || false,
        isBold: isBold || false,

    };

    // Save logo data to Firebase
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User is not authenticated. Please log in.");
    }

    const designId = logoId || Date.now().toString();
    const logoRef = ref(database, 'logos/' + designId);
    await set(logoRef, logoData);

    return {
        logoData: logoData,
        designId: designId,

    };
}


// Keep your original shareable link function
function createShareableLink(designId) {
    return `${window.location.pathname}?itemId=${itemId}&image=${imageIndex}&size=${selectedSize}&logoId=${designId}`;
}

// Share Button Click Handler
shareBtn.addEventListener('click', async () => {
    try {
        showProcessingOverlay();
        updateProgress(0);

        // Generate and store logo data
        const { designId } = await generateAndStoreLogoData();
        updateProgress(60);

        // Generate shareable URL
        const shareableLink = createShareableLink(designId);
        updateProgress(80);

  
        // 2. Prepare WhatsApp (90-100%)
        const whatsappNumber = "27728662309";
        const shareableLink = createShareableLink(designId);
        const message = `Check out my design: ${window.location.origin}${shareableLink}`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        
        updateProgress(100);
  hideProcessingOverlay();
           showCartAlert('<i class="fab fa-whatsapp green-icon"></i> Opening WhatsApp...');
        // Open WhatsApp
        window.location.href = whatsappUrl;
        setTimeout(() => {
            if (window.location.href !== whatsappUrl) {
                window.open(whatsappUrl, '_blank');
            }
        }, 1000);

    } catch (error) {
        console.error('Share error:', error);
        showCartAlert(`<i class="fas fa-exclamation-circle"></i> ${error.message || 'Sharing failed'}`);
    } finally {
        setTimeout(hideProcessingOverlay, 2000);
    }
});

// Add to Cart Button Click Handler
addToCartBtn.addEventListener('click', async () => {
    try {
        // Check if user is logged in
        const user = auth.currentUser;
        if (!user) {
            window.location.href = "login.html";
            return;
        }
        const userId = user.uid;

        // Check if price exists before proceeding
        const priceExists = await fetchProductPrice();
        if (!priceExists) {
            alert("This product variation is currently unavailable. Please try another option.");
            hideProcessingOverlay();
            return;
        }


        // Show processing overlay
        showProcessingOverlay();
        updateProgress(0);



        // Generate and store logo data
        const { logoData, designId } = await generateAndStoreLogoData();

        // Generate the shareable URL
        const shareableLink = createShareableLink(designId);


        // Prepare cart item data
        const now = new Date();
        const cartRef = ref(database, `carts/${userId}/carts`);
        
        // Get existing cart items
        const snapshot = await get(cartRef);
        let cartItems = snapshot.exists() ? snapshot.val() : [];

        const newItem = {
            itemID: itemId,
            designId: designId,
            addedAt: now.getTime(),
            images: {
                mainimage: {
                    [imageIndex]: true
                },

            },
            price: productPrice,
            quantity: 1,
            selectedSize: selectedSize,
            title: "Custom Necklace",
            isCustom: true,
            shareableLink: shareableLink,
            addedAtISO: now.toISOString(),
            addedAtReadable: now.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
            logoData: logoData
        };

        // Add new item to cart
        cartItems.push(newItem);
        await set(cartRef, cartItems);
        updateProgress(100);

            showCartAlert('<i class="fa fa-check-circle green-icon"></i>Item added to cart');
            window.location.href = "cart.html";
      

        // Clear inputs after successful add to cart
    } catch (error) {
        console.error("Add to cart error:", error);
        showCartAlert(`Error: ${error.message}`, 'fas fa-exclamation-circle');
    } finally {
        hideProcessingOverlay();
    }
});

reAddToCartBtn.addEventListener('click', async () => {
    try {
        // Check if user is logged in
        const user = auth.currentUser;
        if (!user) {
            window.location.href = "login.html";
            return;
        }


        // Check product availability and price
        const priceExists = await fetchProductPrice();
        if (!priceExists) {
            showCartAlert('This product variation is currently unavailable', 'fas fa-exclamation-circle');
            return;
        }

        showProcessingOverlay();
        updateProgress(0);


        const currentText = document.getElementById('logoText').value || 'Your Logo';
        const secondaryText = document.getElementById('secondaryText').value || 'Secondary Text';

        const logoData = {
            text: currentText,
            secondaryText: secondaryText,
            font: currentFont,
            color: currentColor,
            autoBreakEnabled: autoBreakEnabled,
            breakSize: breakSize,
            isItalic: isItalic,
            isBold: isBold,

        };


        const designId = logoId || Date.now().toString();
        const logoRef = ref(database, 'logos/' + designId);
        await set(logoRef, logoData);

        // Generate shareable link

        const shareableLink = createShareableLink(designId);
        updateProgress(100);

        const now = new Date();
        const cartRef = ref(database, `carts/${user.uid}/carts`);
        const snapshot = await get(cartRef);
        let cartItems = snapshot.exists() ? snapshot.val() : [];

        const newItem = {
            itemID: itemId,
            designId: designId,
            addedAt: now.getTime(),
            images: {
                mainimage: { [imageIndex]: true },
            },
            price: productPrice,
            quantity: 1,
            selectedSize: selectedSize,

            isCustom: true,
            shareableLink: shareableLink,
            addedAtISO: now.toISOString(),
            addedAtReadable: now.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
            logoData: logoData
        };


        cartItems.push(newItem);
        await set(cartRef, cartItems);

        // Show success message with options
        showCartAlert('<i class="fa fa-check-circle green-icon"></i>Item added to cart');
        // Redirect to cart after delay
        setTimeout(() => {
            window.location.href = "cart.html";
        }, 1500);

    } catch (error) {
        console.error('Re-add to cart error:', error);
        showCartAlert(`Error: ${error.message}`, 'fas fa-exclamation-circle');
    } finally {
        hideProcessingOverlay();
    }
});


});

const nativeShareBtn = document.getElementById('nativeShareBtn');
            const whatsappShareBtn = document.getElementById('whatsappShareBtn');
            
            // Native Share function
            function shareWithNative() {
                if (navigator.share) {
                    navigator.share({
                        title: 'Check this out!',
                        text: 'You might find this interesting:',
                        url: window.location.href
                    }).catch(error => {
                        console.error('Error sharing:', error);
                        alert('Sharing failed. Please try again.');
                    });
                } else {
                    // Fallback for browsers that don't support the Share API
                    copyToClipboard(window.location.href);
                    alert('Link copied to clipboard! You can now share it manually.');
                }
            }
            
            // WhatsApp Share function
            function shareWithWhatsApp() {
                const message = encodeURIComponent('Check this out: ' + window.location.href);
                const whatsappUrl = `https://wa.me/?text=${message}`;
                window.open(whatsappUrl, '_blank');
            }
            
            // Helper function to copy text to clipboard
            function copyToClipboard(text) {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            // Add event listeners
            nativeShareBtn.addEventListener('click', shareWithNative);
            whatsappShareBtn.addEventListener('click', shareWithWhatsApp);
