
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
  import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL,deleteObject } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";
  import { getDatabase, ref, set, get, remove,ref as dbRef } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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
    let textLength = element.textContent.length;
    const containerWidth = element.offsetWidth;
    const containerHeight = element.offsetHeight;

    let baseFontSize = 10;

    if (textLength <= 10) {
      baseFontSize = 90;
    } else if (textLength <= 20) {
      baseFontSize = 40;
    } else if (textLength <= 30) {
      baseFontSize = 30;
    } else if (textLength <= 50) {
      baseFontSize = 20;
    } else {
      baseFontSize = 30;
    }

    let scaleFactor = Math.min(containerWidth / (textLength * 500), containerHeight / 100);
    const adjustedFontSize = Math.max(baseFontSize * scaleFactor, 16);

    element.style.fontSize = `${adjustedFontSize}px`;
  }

  function adjustSecondaryTextFontSize(element) {
    const containerWidth = document.getElementById('logoContainer').offsetWidth;
    const containerHeight = document.getElementById('logoContainer').offsetHeight;
    let fontSize = 18;

    const textLength = element.textContent.replace(/\s/g, '').length;
    fontSize = Math.max(10, Math.min(16, 18 - textLength / 4));

    element.style.fontSize = `${fontSize}px`;
  }

  function breakTextIntoChunks(text, breakSize) {
    if (autoBreakEnabled === 'word') {
      return breakTextByWords(text, breakSize);
    } else if (autoBreakEnabled === 'character') {
      return breakTextByCharacters(text, breakSize);
    }
    return text;
  }

  function breakTextByWords(text, breakSize) {
    const words = text.split(/\s+/);
    let chunks = [];
    let currentChunk = '';

    for (let word of words) {
      if (word.length >= 13) {
        while (word.length >= 13) {
          chunks.push(word.substring(0, 13));
          word = word.substring(13);
        }
        if (word.length > 0) {
          currentChunk += word;
        }
      } else {
        if (currentChunk.length + word.length + 1 <= breakSize) {
          currentChunk += (currentChunk.length > 0 ? ' ' : '') + word;
        } else {
          chunks.push(currentChunk);
          currentChunk = word;
        }
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks.join('<br>');
  }

  function breakTextByCharacters(text, breakSize) {
    const chars = text.split('');
    let formattedText = '';
    let chunk = '';

    for (let i = 0; i < chars.length; i++) {
      chunk += chars[i];

      if ((i + 1) % 3 === 0 || i === chars.length - 1) {
        formattedText += chunk + '<br>';
        chunk = '';
      }
    }
    return formattedText.trim();
  }

  // Function to set the font for logo text
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

function hideLoading() {
    console.log('Hiding loading...');
    console.log('uploadedImageBlob:', uploadedImageBlob);
    console.log('imageContainer style:', imageContainer.style.backgroundImage);
    if (uploadText) {
        uploadText.style.display = 'none';
        uploadText.style.visibility = 'hidden';
    }
    updateHeadingText(false);
}
function hidecropLoading() {
    console.log('Hiding loading...');
    console.log('uploadedImageBlob:', uploadedImageBlob);
    console.log('imageContainer style:', imageContainer.style.backgroundImage);
    if (uploadText) {
        uploadText.style.display = 'none';
        uploadText.style.visibility = 'hidden';
           fileInput.value = ''; 
    }
    updateHeadingText(false);
}

function showLoading() {
    console.log("Showing loading state");
    if (uploadText) {
        uploadText.style.display = 'block';
        uploadText.style.visibility = 'visible';
        uploadText.innerHTML = '<i class="fas fa-spinner fa-spin"></i><br>Loading photo...';
    }
    updateHeadingText(true);
}

window.onload = function() {
  showLoading();
  
  // Get the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const logoId = urlParams.get('logoId');
  const imageId = urlParams.get('logoId');
  const imageLink = document.getElementById('imageLink');
  const imageContainer = document.getElementById('imageContainer');

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
          imageLink.href = logoData.url;
        
        } else {
          alert("Logo ID not found.");
          hideLoading();
        }
      }).catch((error) => {
        console.error("Error loading logo data:", error);
        alert("Error loading logo data. Please try again.");
        hideLoading();
      }).finally(() => {
        if (!imageId) {
const sharebuttons = document.getElementById('sharebuttons');
sharebuttons.style.display = 'block';
          sharebuttons.style.marginTop = '100px'; 
logosettings.style.display = 'none';
     document.querySelector('.bottom-navbar').style.display = 'none';             
          hideLoading();
        }
      });
    }

    // If imageId is present, load the image and transformations (zoom, move, etc.)
    if (imageId) {
      const imageRef = ref(database, 'logos/' + imageId);
      get(imageRef).then((snapshot) => {
        if (snapshot.exists()) {
          const logoData = snapshot.val();
          const imgElement = document.createElement('img');
          imgElement.src = logoData.url;
          imageContainer.innerHTML = '';
          imageContainer.appendChild(imgElement);
          isImageLoaded = true;
          updateHeadingText();
          imageLink.href = logoData.url;
          imageContainer.addEventListener('click', function() {
            if (imageLink.href) {
              window.open(imageLink.href, '_blank');
            }
          });
          const sharebuttons = document.getElementById('sharebuttons');
          sharebuttons.style.display = 'block';
          sharebuttons.style.marginTop = '100px'; 

            logosettings.style.display = 'none';
      document.querySelector('.bottom-navbar').style.display = 'none';        
          } else {
          alert("Image not found.");
        }
      }).catch((error) => {
        console.error("Error loading image:", error);
        alert("Error loading image. Please try again.");
      }).finally(() => {
        hideLoading();
        resetToUploadPrompt();
      });
    } else if (!logoId) {

      hideLoading();
      resetToUploadPrompt();
    }
  } catch (error) {
    console.error("Error loading image:", error);
    alert("An error occurred. Please try again.");
    isImageLoaded = false;
    updateHeadingText();
    hideLoading();
    resetToUploadPrompt();
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



// Add to Cart button functionality with shareable URL generation and logo data
// Add to Cart button functionality with shareable URL generation and logo data
// Global Variables
let uploadedImageUrl = ''; // Variable to store the uploaded image URL
let cropper;
let uploadedImageBlob = null; // Store the cropped image blob
let originalImageBlob = null; // Store the original image blob

// DOM Elements
const fileInput = document.getElementById('fileInput');
const imageContainer = document.getElementById('imageContainer');
const cropModal = document.getElementById('cropModal');
const cropImage = document.getElementById('cropImage');
const cropConfirm = document.getElementById('cropConfirm');
const cropCancel = document.getElementById('cropCancel');
const buttonContainer = document.getElementById('buttonContainer');
const deleteButton = document.getElementById('deleteButton');
const reCropButton = document.getElementById('reCropButton');

const uploadText = document.getElementById('uploadText');


imageContainer.addEventListener('click', function() {
  if (imageLink.href) {
    window.open(imageLink.href, '_blank');
  } else if (!imageContainer.style.backgroundImage || imageContainer.style.backgroundImage === 'none') {
    fileInput.click(); // Open file selector only if no image is present
  }
});

            const itemNameHeading = document.querySelector('.item-nam');
            let isImageLoaded = false; // Track loading state globally

function updateHeadingText() {
  if (itemNameHeading) {
    itemNameHeading.textContent = isImageLoaded 
      ? "Customized" 
      : "Custom";
  }
}

 function updateAddToCartButton() {
    const hasImage1 = imageContainer.style.backgroundImage && 
                     imageContainer.style.backgroundImage !== 'none';


    if (addToCartBtn) {
        addToCartBtn.style.display = (hasImage1) ? 'block' : 'none';
    }
}


// Modified re-crop button to use original image
reCropButton.addEventListener('click', () => {
    if (originalImageBlob) {
        showLoading();
        const reader = new FileReader();
        reader.onload = (event) => {
            cropImage.src = event.target.result;
            cropModal.style.display = 'flex';
            cropper = new Cropper(cropImage, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1,
            });
        };
        reader.readAsDataURL(originalImageBlob);
    } else {
        // Fallback to current image if original not available
        const currentImage = imageContainer.style.backgroundImage.replace('url("', '').replace('")', '');
        if (currentImage) {
            showLoading();
            cropImage.src = currentImage;
            cropModal.style.display = 'flex';
            cropper = new Cropper(cropImage, {
                aspectRatio: 3/4,
                viewMode: 1,
                autoCropArea: 1,
            });
        }
    }
});

// Crop confirm
cropConfirm.addEventListener('click', () => {
  const croppedCanvas = cropper.getCroppedCanvas();
  const croppedImageUrl = croppedCanvas.toDataURL();
 
    imageContainer.style.backgroundImage = `url(${croppedImageUrl})`;
    buttonContainer.style.display = 'block';
    uploadText.style.display = 'none';
    croppedCanvas.toBlob((blob) => {
      uploadedImageBlob = blob;
      isImageLoaded = true; 
      updateHeadingText();
      updateAddToCartButton(); // Add this line
    });
  
  cropModal.style.display = 'none';
  cropper.destroy();
});
// In the crop cancel event listener


// Modified cropCancel event listener to fully reset input
cropCancel.addEventListener('click', () => {
    cropModal.style.display = 'none';
    if (cropper) {
        cropper.destroy();
    }
    hideLoading();
    
    // Always reset the file input when canceling
    fileInput.value = '';  // This is crucial for allowing same file reselection
    originalImageBlob = null;
    uploadedImageBlob = null;
    
    // Only show upload prompt if no image is displayed
    if (!imageContainer.style.backgroundImage || imageContainer.style.backgroundImage === 'none') {
        resetToUploadPrompt();
    }
});

// Updated resetToUploadPrompt function
function resetToUploadPrompt() {
    console.log("Resetting to upload prompt");
    if (uploadText) {
        uploadText.style.display = 'block';
        uploadText.style.visibility = 'visible';
        uploadText.innerHTML = '<i class="fas fa-image"></i><br>Click here to upload photo';
    }
}

// Enhanced deleteButton event listener
deleteButton.addEventListener('click', () => {
    // Clear all image references
    imageContainer.style.backgroundImage = '';
    buttonContainer.style.display = 'none';
    
    // Reset all stored image data
    fileInput.value = '';
    uploadedImageUrl = '';
    originalImageBlob = null;
    uploadedImageBlob = null;
    
    // Show upload prompt
    uploadText.style.display = 'block';
    resetToUploadPrompt();
});

// Update file input event listener to ensure proper reset
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        showLoading();
        originalImageBlob = file;
        const reader = new FileReader();
        reader.onload = (event) => {
            cropImage.src = event.target.result;
            cropModal.style.display = 'flex';
            cropper = new Cropper(cropImage, {
                aspectRatio:1,
                viewMode: 1,
                autoCropArea: 1,
            });
        };
        reader.readAsDataURL(file);
    } else {
        // If no file selected, ensure complete reset
        fileInput.value = '';
        resetToUploadPrompt();
    }
});

function hideLoading() {
    if (uploadText) {
        uploadText.style.display = 'none';
        uploadText.style.visibility = 'hidden';
    }
}

// Function to show loading state
function showLoading() {
    console.log("Showing loading state"); // Debug log
    if (uploadText) {
        uploadText.style.display = 'block';
        uploadText.style.visibility = 'visible'; // Ensure it's visible
        uploadText.innerHTML = '<i class="fas fa-spinner fa-spin"></i><br>Loading photo...';
    }
}

// Function to upload the image to Firebase with a custom name

// Function to show the processing overlay

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
async function uploadImageToFirebase(file, uniqueFileName) {
    const storageReference = storageRef(storage, 'images/' + uniqueFileName);
    const uploadTask = uploadBytesResumable(storageReference, file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
}




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
    const whatsappNumber = "0728662309"; // +27 0728662309 (South Africa)

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


// Function to create shareable link
function createShareableLink(designId) {
    return `/glass_music.html?itemId=${itemId}&image=${imageIndex}&size=${selectedSize}&logoId=${designId}`;
}

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
async function uploadImageToFirebase(file, uniqueFileName) {
    const storageReference = storageRef(storage, 'images/' + uniqueFileName);
    const uploadTask = uploadBytesResumable(storageReference, file);

    return new Promise((resolve, reject) => {
        let lastProgress = 0;
        
        uploadTask.on('state_changed',
            (snapshot) => {
                const rawProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                // Ensure we don't go backwards and increment smoothly
                const smoothProgress = Math.max(lastProgress, Math.min(rawProgress, lastProgress + 5));
                lastProgress = smoothProgress;
                
                updateProgress(smoothProgress);
                console.log('Upload is ' + smoothProgress + '% done');
            },
            (error) => {
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    // Ensure we reach 100% at completion
                    updateProgress(100);
                    resolve(downloadURL);
                });
            }
        );
    });
}





// Shared function to generate and store logo data
async function generateAndStoreLogoData() {
    // Check if image exists
    const imageContainer = document.getElementById('imageContainer');
    if (!uploadedImageBlob && (!imageContainer.style.backgroundImage || 
        imageContainer.style.backgroundImage === 'none')) {
        throw new Error('Please upload and crop an image first');
    }

    // Get current values from input fields
    const currentText = document.getElementById('logoText').value || '';
    const secondaryText = document.getElementById('secondaryText').value || '';

    // Upload image if new blob exists
    let finalImageUrl;
    if (uploadedImageBlob) {
        const uniqueFileName = `custom_image_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.png`;
        finalImageUrl = await uploadImageToFirebase(uploadedImageBlob, uniqueFileName);
    } else {
        // Extract URL from existing background image
        finalImageUrl = imageContainer.style.backgroundImage
            .replace('url("', '')
            .replace('")', '');
    }

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
        url: finalImageUrl
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
        imageUrl: finalImageUrl
    };
}

// Function to create shareable link
function createShareableLink(designId) {
    return `${window.location.pathname}?itemId=${itemId}&image=${imageIndex}&size=${selectedSize}&imageId=${designId}`;
}
  
// Improved WhatsApp Share Button Click Handler
shareBtn.addEventListener('click', async () => {
    try {
        showProcessingOverlay();
        updateProgress(0);

        // Generate and store logo data
        const { designId } = await generateAndStoreLogoData();
        updateProgress(60);

        // Generate complete shareable URL
        const shareableLink = createShareableLink(designId);
        updateProgress(80);
      
        // Create WhatsApp message
        const message = `Check out my design: ${shareableLink}`;
        const encodedMessage = encodeURIComponent(message);
        
        // Improved WhatsApp URL with international number format
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // More reliable window opening method
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.location.href = whatsappUrl;
            setTimeout(() => {
                if (newWindow.closed || newWindow.location.href === 'about:blank') {
                    // Fallback if window was blocked
                    window.location.href = whatsappUrl;
                }
            }, 500);
        } else {
            // Direct fallback
            window.location.href = whatsappUrl;
        }
        
        updateProgress(100);
        showCartAlert('<i class="fas fa-check-circle"></i> Design shared on WhatsApp!');
        
    } catch (error) {
        console.error('Share error:', error);
        // More user-friendly error messages
        let errorMessage = 'Error sharing design';
        if (error.message.includes("user is not authenticated")) {
            errorMessage = 'Please log in to share designs';
        } else if (error.message.includes("upload and crop")) {
            errorMessage = 'Please complete your design first';
        }
        showCartAlert(`<i class="fas fa-exclamation-circle"></i> ${errorMessage}`);
    } finally {
        setTimeout(hideProcessingOverlay, 1000); // Give time for user to see completion
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

        // Check if an image exists
        const hasImage = uploadedImageBlob || 
                        (imageContainer.style.backgroundImage && 
                         imageContainer.style.backgroundImage !== 'none');
        
        if (!hasImage) {
            showCartAlert('Please upload and crop an image first', 'fas fa-exclamation-circle');
            return;
        }

        // Show processing overlay
        showProcessingOverlay();
        updateProgress(0);



        // Generate and store logo data
        const { logoData, designId, imageUrl } = await generateAndStoreLogoData();

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
                customImage: imageUrl
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

        // Get image container and check for existing image
        const imageContainer = document.getElementById('imageContainer');
        let imageUrl = '';
        
        if (imageContainer.style.backgroundImage && 
            imageContainer.style.backgroundImage !== 'none' &&
            imageContainer.style.backgroundImage !== '') {
            imageUrl = imageContainer.style.backgroundImage
                .replace('url("', '')
                .replace('")', '');
        } else if (imageContainer.querySelector('img')) {
            imageUrl = imageContainer.querySelector('img').src;
        } else {
            showCartAlert('Please load an image first', 'fas fa-exclamation-circle');
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
            url: imageUrl
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
                customImage: imageUrl
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


        cartItems.push(newItem);
        await set(cartRef, cartItems);

        // Show success message with options
   showCartAlert('<i class="fa fa-check-circle green-icon"></i>Item added to cart');
            window.location.href = "cart_page.html";  

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
