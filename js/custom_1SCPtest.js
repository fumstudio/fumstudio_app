
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
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
const database = getDatabase(app);
const auth = getAuth(app);




const logosettings = document.getElementById('logosettings');
    const shareButton = document.getElementById('shareButton');
    const linkContainer = document.getElementById('linkContainer');
    const imageLink = document.getElementById('imageLink');
        const uploadFromDeviceBtn = document.getElementById('uploadFromDevice');
        const uploadFromGalleryBtn = document.getElementById('uploadFromGallery');
        const galleryModal = document.getElementById('galleryModal');
                const closeGalleryBtn = document.querySelector('#galleryModal .close-btn');
        const galleryImages = document.querySelectorAll('.gallery-image');
let autoBreakEnabled = true;
  let breakSize = 'words';
  let currentColor = "#FFFFFF";
  let currentFont = "sarina";
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




let uploadedImageUrl = '';
let cropper;
let isRotating = false;
let startAngle = 0;
let currentRotation = 0;
let originalImageUrl = null;
let currentContainer = null; // Track which container is being cropped
// DOM Elements
const rotationState = {
  container1: {
    angle: 0,
    isRotating: false,
        locked: true,// Add this // Then modify your rotation functions to check this:

    startX: 0,
    startY: 0,
    centerX: 0,
    centerY: 0,
    startAngle: 0
  }
};

const fileInput = document.getElementById('fileInput');
const portraitContainer = document.getElementById('portraitContainer');
const imageContainer = document.getElementById('imageContainer');
const cropModal = document.getElementById('cropModal');
const cropImage = document.getElementById('cropImage');
const cropConfirm = document.getElementById('cropConfirm');
const cropCancel = document.getElementById('cropCancel');
const buttonContainer = document.getElementById('buttonContainer');
const deleteButton = document.getElementById('deleteButton');
const reCropButton = document.getElementById('reCropButton');
const addToCartBtn = document.getElementById('addToCartBtn');
    // Get the re-add to cart button
    const reAddToCartBtn = document.getElementById('reAddToCartBtn');    
const uploadText = document.getElementById('uploadText');
// Rotation controls
const rotateSlider1 = document.getElementById('rotate-slider-1');
const rotateValue1 = document.getElementById('rotate-value-1');



const resetRotationBtn1 = document.getElementById('reset-rotation-1');

// Initialize rotation controls
function initRotationControls() {
    // Container 1 rotation controls
    rotateSlider1.addEventListener('input', () => {
        rotationState.container1.angle = normalizeAngle(parseInt(rotateSlider1.value));
        rotateValue1.textContent = `${rotationState.container1.angle}°`;
        applyRotation('container1');
        toggleResetButton('container1');
    });

    resetRotationBtn1.addEventListener('click', () => {
        rotationState.container1.angle = 0;
        rotateSlider1.value = 0;
        rotateValue1.textContent = '0°';
        applyRotation('container1');
        resetRotationBtn1.style.display = 'none';
    });

    // Hide reset button initially
    resetRotationBtn1.style.display = 'none';
}

// Normalize angle to be within -180 to 180 degrees
function normalizeAngle(angle) {
    angle = angle % 360;
    if (angle > 180) {
        angle -= 360;
    } else if (angle < -180) {
        angle += 360;
    }
    return Math.round(angle);
}

// Apply rotation to specified container
function applyRotation(containerId) {
    const container = containerId === 'container1' ? imageContainer : null;
    if (container) {
        container.style.transform = `rotate(${rotationState[containerId].angle}deg)`;
    }
}

// Toggle reset button visibility based on rotation
function toggleResetButton(containerId) {
    const resetBtn = containerId === 'container1' ? resetRotationBtn1 : null;
    if (resetBtn) {
        resetBtn.style.display = rotationState[containerId].angle !== 0 ? 'block' : 'none';
    }
}

// Initialize touch rotation for a container
function initTouchRotation(container, containerId) {
    container.addEventListener('touchstart', (e) => {
        if (!container.style.backgroundImage || container.style.backgroundImage === 'none') return;
        
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        const touch = e.touches[0];
        
        rotationState[containerId].isRotating = true;
        rotationState[containerId].startX = touch.clientX;
        rotationState[containerId].startY = touch.clientY;
        rotationState[containerId].centerX = rect.left + rect.width / 2;
        rotationState[containerId].centerY = rect.top + rect.height / 2;
        rotationState[containerId].startAngle = rotationState[containerId].angle;
    });

    container.addEventListener('touchmove', (e) => {
        if (!rotationState[containerId].isRotating) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - rotationState[containerId].centerX;
        const deltaY = touch.clientY - rotationState[containerId].centerY;
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        // Calculate change from start angle
        const startDeltaX = rotationState[containerId].startX - rotationState[containerId].centerX;
        const startDeltaY = rotationState[containerId].startY - rotationState[containerId].centerY;
        const startAngle = Math.atan2(startDeltaY, startDeltaX) * 180 / Math.PI;
        
        // Calculate and normalize the new angle
        let newAngle = normalizeAngle(rotationState[containerId].startAngle + angle - startAngle);
        rotationState[containerId].angle = newAngle;
        
        // Update slider and value display
        if (containerId === 'container1') {
            rotateSlider1.value = newAngle;
            rotateValue1.textContent = `${newAngle}°`;
        }
        
        applyRotation(containerId);
        toggleResetButton(containerId);
    });

    container.addEventListener('touchend', () => {
        rotationState[containerId].isRotating = false;
    });
}
function updateAddToCartButton() {
    const hasImage1 = imageContainer.style.backgroundImage && 
                     imageContainer.style.backgroundImage !== 'none';


    if (addToCartBtn) {
        addToCartBtn.style.display = (hasImage1) ? 'block' : 'none';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAddToCartButton();
    initRotationControls();
    initTouchRotation(imageContainer, 'container1');

});


        // Event Listeners
        uploadFromDeviceBtn.addEventListener('click', () => fileInput.click());
        uploadFromGalleryBtn.addEventListener('click', showGalleryModal);
          closeGalleryBtn.addEventListener('click', () => galleryModal.style.display = 'none');

        // Gallery image selection
        galleryImages.forEach(img => {
            img.addEventListener('click', () => selectGalleryImage(img));
        });      
imageContainer.addEventListener('click', function() {
  if (imageLink.href) {
    window.open(imageLink.href, '_blank');
  } else if (!imageContainer.style.backgroundImage || imageContainer.style.backgroundImage === 'none') {
        currentContainer = 'container1';
  }
});



            // Your existing image loading code
            const itemNameHeading = document.querySelector('.item-nam');
            let isImageLoaded = false; // Track loading state globally



  
    
      
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        showLoading();
        currentContainer = 'container1';
        
        // Clean up any existing cropper
        if (cropper) {
            cropper.destroy();
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            originalImageUrl = event.target.result;
            cropImage.src = originalImageUrl;
            cropModal.style.display = 'flex';
           galleryModal.style.display = 'none';                   document.querySelector('.choosephotos').style.display = 'none';     
            // Wait for image to load before initializing cropper
            cropImage.onload = () => {
                cropper = new Cropper(cropImage, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 1,
                });
                hideLoading();
            };
            
            cropImage.onerror = () => {
                hideLoading();
                showCartAlert('Failed to load image');
                cropModal.style.display = 'none';
            };
        };
        reader.readAsDataURL(file);
    } else {
        videoalert('  <i class="fas fa-cloud-upload-alt"></i></i>Please upload a photo!');
        fileInput.value = '';
    }
});

        function showGalleryModal() {
            galleryModal.style.display = 'flex';
        }

// Add this at the top with other variable declarations

// Modified selectGalleryImage function
// Add these variables at the top with your other declarations

let originalImageBlob = null;


// Updated selectGalleryImage function
async function selectGalleryImage(imgElement) {
    galleryModal.style.display = 'none';
    showLoading();
    
    try {
        const imageUrl = imgElement.dataset.fullsize || imgElement.src;
        
        // First fetch the image
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        
        // Store the original image blob and create a URL for it
        originalImageBlob = await response.blob();
        originalImageUrl = URL.createObjectURL(originalImageBlob);
        
        // Set up crop modal with the original image
        cropImage.src = originalImageUrl;
        cropModal.style.display = 'flex';
        currentContainer = 'container1';
        
        // Clean up any existing cropper
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        
        // Initialize new cropper
        cropImage.onload = function() {
            cropper = new Cropper(cropImage, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 0.8,
                ready: function() {
                    hideLoading();
                }
            });
        };
        
        cropImage.onerror = function() {
            hideLoading();
            showCartAlert('Failed to load image for cropping');
            cropModal.style.display = 'none';
            cleanupImageResources();
        };
        
    } catch (error) {
        console.error('Error in selectGalleryImage:', error);
        hideLoading();
        showCartAlert('Error loading image');
        cleanupImageResources();
    }
}

// Helper function to clean up image resources
function cleanupImageResources() {
    if (originalImageUrl) {
        URL.revokeObjectURL(originalImageUrl);
        originalImageUrl = null;
    }
    originalImageBlob = null;
}

// Updated recrop functionality
reCropButton.addEventListener('click', async () => {
    try {
        showLoading();
        
        // If we have the original blob, create a new URL from it
        if (originalImageBlob) {
            // Clean up previous URL if it exists
            if (originalImageUrl) {
                URL.revokeObjectURL(originalImageUrl);
            }
            
            // Create new URL from the original blob
            originalImageUrl = URL.createObjectURL(originalImageBlob);
            cropImage.src = originalImageUrl;
            
            // Wait for image to load
            await new Promise((resolve) => {
                cropImage.onload = resolve;
                cropImage.onerror = () => {
                    throw new Error('Failed to load original image');
                };
            });
        } 
        // If we have the original URL but not the blob (legacy case)
        else if (originalImageUrl) {
            cropImage.src = originalImageUrl;
            
            // Wait for image to load
            await new Promise((resolve) => {
                cropImage.onload = resolve;
                cropImage.onerror = () => {
                    throw new Error('Failed to load original image');
                };
            });
        } 
        else {
            throw new Error('No original image available for recropping');
        }
        
        // Show crop modal
        cropModal.style.display = 'flex';
        currentContainer = 'container1';
        
        // Clean up existing cropper
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        
        // Initialize new cropper
        cropper = new Cropper(cropImage, {
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 1,
            ready: function() {
                hideLoading();
            }
        });
        
    } catch (error) {
        console.error('Recrop error:', error);
        hideLoading();
        showCartAlert(error.message);
        cropModal.style.display = 'none';
        cleanupImageResources();
    }
});

// Updated crop confirmation handler
cropConfirm.addEventListener('click', () => {
    if (!cropper) {
        showCartAlert('No image to crop');
        return;
    }
    
    const croppedCanvas = cropper.getCroppedCanvas();
    if (!croppedCanvas) {
        showCartAlert('Cropping failed. Please try again.');
        return;
    }
    
    try {
        // Get the cropped image as data URL
        const croppedImageUrl = croppedCanvas.toDataURL('image/jpeg', 0.9);
        
        // Apply to the appropriate container
        if (currentContainer === 'container1') {
            imageContainer.style.backgroundImage = `url(${croppedImageUrl})`;
            imageContainer.style.backgroundSize = "cover";
            imageContainer.style.backgroundPosition = "center";
            buttonContainer.style.display = 'block';
            uploadText.style.display = 'none';
            uploadFromGallery.style.display = 'none';
            
            // Convert the cropped canvas to a blob for later use
            croppedCanvas.toBlob((blob) => {
                uploadedImageBlob = blob;
                isImageLoaded = true;
                updateHeadingText();
                updateAddToCartButton();
            }, 'image/jpeg', 0.9);
        }
        
        // Clean up
        cropModal.style.display = 'none';
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        
    } catch (error) {
        console.error('Crop confirmation error:', error);
        showCartAlert('Error processing cropped image');
    }
});
// [Rest of the code remains the same]
// Updated crop confirmation handler

function videoalert(message, iconClass = "") {
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



function updateHeadingText() {
  if (itemNameHeading) {
    itemNameHeading.textContent = isImageLoaded 
      ? "Customized" 
      : "Custom";
  }
}

 

function resetToUploadPrompt() {
    console.log("Resetting to upload prompt");
    if (uploadText) {
        uploadText.style.display = 'block';
        uploadText.style.visibility = 'visible';
        uploadText.innerHTML = '<i class="fas fa-image"></i><br>Click here to upload photo';
    }
    
    // Reset image container styles
    imageContainer.style.backgroundImage = '';
    imageContainer.style.cursor = '';
    
    // Reset rotation controls
    rotateSlider1.disabled = false;
    resetRotationBtn1.style.display = 'block';
    
    // Update loading state and heading
    isImageLoaded = false;
    updateHeadingText();
}

cropCancel.addEventListener('click', () => {
    cropModal.style.display = 'none';
    if (cropper) {
        cropper.destroy();
    }
    hidecropLoading();
    
    const isImageSet = imageContainer.style.backgroundImage && 
                      imageContainer.style.backgroundImage !== 'none' && 
                      imageContainer.style.backgroundImage !== '';
    
    if (!isImageSet) {
        resetToUploadPrompt();
    } else {
        isImageLoaded = true; // Ensure state is consistent
        updateHeadingText();
    }
});

deleteButton.addEventListener('click', () => {
    // Clean up cropper if it exists
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    
    // Reset image container
    imageContainer.style.backgroundImage = '';
    imageContainer.style.backgroundSize = '';
    imageContainer.style.backgroundPosition = '';
    imageContainer.style.transform = 'rotate(0deg)';
    
    // Reset UI elements
    buttonContainer.style.display = 'none';
    uploadText.style.display = 'block';
               uploadFromGallery.style.display = 'block';         
               
               
               galleryModal.style.display = 'block';                   document.querySelector('.choosephotos').style.display = 'block';                
    uploadText.innerHTML = '<i class="fas fa-image"></i><br>Click here to upload photo';
    
    // Reset file input
    fileInput.value = '';
    
    // Reset image data
    uploadedImageBlob = null;
    originalImageUrl = null;
    originalImageBlob = null;
    
    // Reset rotation state
    rotationState.container1.angle = 0;
    rotateSlider1.value = 0;
    rotateValue1.textContent = '0°';
    resetRotationBtn1.style.display = 'none';
    
    // Reset loading state
    isImageLoaded = false;
    updateHeadingText();
    updateAddToCartButton();
    
    // Reset to upload prompt
    resetToUploadPrompt();
    
    // If this is a shared logo (has logoId in URL), remove the logoId from URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('logoId')) {
        urlParams.delete('logoId');
        const newUrl = window.location.pathname + '?' + urlParams.toString();
        window.history.replaceState({}, '', newUrl);
    }
    
    console.log('Image and all related state has been reset');
});



// Add this CSS to your stylesheet
/*

*/

// Initialize loading elements
function initTopLoading() {
  if (!document.getElementById('top-loading-overlay')) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'top-loading-overlay';
    overlay.className = 'top-loading-overlay';
    
    // Create loading container
    const container = document.createElement('div');
    container.id = 'top-loading-container';
    container.className = 'top-loading-container';
    
    // Create spinner
    const spinner = document.createElement('div');
    spinner.className = 'top-loading-spinner';
    
    // Create text
    const text = document.createElement('div');
    text.className = 'top-loading-text';
    text.textContent = 'Loading...';
    
    // Assemble elements
    container.appendChild(spinner);
    container.appendChild(text);
    document.body.appendChild(overlay);
    document.body.appendChild(container);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initTopLoading);

// Show loading spinner with dark overlay
function showLoading(message = 'Loading...') {
  const overlay = document.getElementById('top-loading-overlay');
  const container = document.getElementById('top-loading-container');
  const text = document.querySelector('.top-loading-text');
  
  if (overlay) overlay.style.display = 'block';
  if (container) container.style.display = 'block';
  if (text) text.textContent = message;
  
  console.log("Showing loading state");
}

// Hide loading spinner and overlay
function hideLoading() {
  const overlay = document.getElementById('top-loading-overlay');
  const container = document.getElementById('top-loading-container');
  
  if (overlay) overlay.style.display = 'none';
  if (container) container.style.display = 'none';
  
  console.log('Hiding loading');
}

// Special version for crop loading
function hidecropLoading() {
  hideLoading();
  if (uploadText) {
    uploadText.style.display = 'none';
    uploadText.style.visibility = 'hidden';
    fileInput.value = ''; 
  }
  updateHeadingText(false);
}
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

function showProcessingOverlay() {
    const processingOverlay = document.getElementById('processingOverlay');
    processingOverlay.style.display = 'flex';
    updateProgress(0);
}

function hideProcessingOverlay() {
    const processingOverlay = document.getElementById('processingOverlay');
    processingOverlay.style.display = 'none';
}

function updateProgress(progress) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    progressBar.style.width = progress + '%';
    progressText.textContent = progress + '%';
}

function simulateUploadProgress(uploadTask) {
    return new Promise((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
            if (progress < 100) {
                progress++;
                updateProgress(progress);
            } else {
                clearInterval(interval);
                resolve();
            }
        }, 50);
    });
}

let alertTimeout;
let alertStartTime = 0;
let alertTimeLeft = 3000;

let uploadedImageBlob = null;

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

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('itemId');
    const imageIndex = urlParams.get('image') || '0';
    const selectedSize = urlParams.get('size') || 'default';

    let productPrice = null;

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
// Add click event listener


// Shared function to generate and store logo data
async function generateAndStoreLogoData() {
    // Check if image exists
    const imageContainer = document.getElementById('imageContainer');
    if (!uploadedImageBlob && (!imageContainer.style.backgroundImage || 
        imageContainer.style.backgroundImage === 'none')) {
        throw new Error('Please upload and crop an image first');
    }

    // Get current values from input fields
    const currentText = document.getElementById('logoText').value || 'Your Logo';
    const secondaryText = document.getElementById('secondaryText').value || 'Secondary Text';

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
        url: finalImageUrl,
            rotation1: rotationState.container1.angle, // Store rotation for container 1
            
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
        imageUrl: finalImageUrl,
               rotation1: rotationState.container1.angle, // Store rotation for container 1
          
    };
}

// Function to create shareable link
function createShareableLink(designId) {
    return `/glass_music.html?itemId=${itemId}&image=${imageIndex}&size=${selectedSize}&logoId=${designId}`;
}

    // DOM Elements
    const shareBtn = document.getElementById('shareBtn');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const reAddToCartBtn = document.getElementById('reAddToCartBtn');
    
    // WhatsApp Configuration
    const whatsappNumber = "0626172613"; // +27 65 986 0276 (South Africa)
    
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

        // Open WhatsApp with the shareable link
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Check out my design: ' + shareableLink)}`;
        window.open(whatsappUrl, '_blank');
        updateProgress(100);

        showCartAlert('<i class="fas fa-check-circle"></i> Design shared on WhatsApp!');

    } catch (error) {
        console.error('Share error:', error);
        showCartAlert(`Error: ${error.message}`, 'fas fa-exclamation-circle');
    } finally {
        hideProcessingOverlay();
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
            displayPrice: productPrice,
            
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

        // Show success message with links
        showCartAlert(`
            <i class="fas fa-check-circle"></i> Added to cart!<br>
            <a href="cart.html" style="color: white; text-decoration: underline;">View Cart</a> | 
            <a href="${shareableLink}" style="color: white; text-decoration: underline;">Share Design</a>
        `);

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
        showCartAlert(`
            <i class="fas fa-check-circle"></i> Item re-added to cart!<br>
            <a href="cart.html" style="color: white; text-decoration: underline;">View Cart</a> | 
            <a href="${shareableLink}" style="color: white; text-decoration: underline;">Share Design</a>
        `);

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
          uploadFromGallery.style.display = 'none';
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
          imgElement.onload = function() {
            isImageLoaded = true;
            updateHeadingText();
          };
          imageContainer.innerHTML = '';
          imageContainer.appendChild(imgElement);
          isImageLoaded = true;
          updateHeadingText();
          imageLink.href = logoData.url;

          // Apply rotation if it exists in the saved data
          const rotation1 = logoData.rotation1 || 0;
          imageContainer.style.transform = `rotate(${rotation1}deg)`;
          if (rotateSlider1) {
            rotateSlider1.value = rotation1;
            rotateValue1.textContent = `${Math.round(rotation1)}°`;

            // Disable rotation controls if needed
            rotateSlider1.disabled = true;
            if (resetRotationBtn1) {
              resetRotationBtn1.style.display = 'none';
            }
          }

          imageContainer.addEventListener('click', function() {
            if (imageLink.href) {
              window.open(imageLink.href, '_blank');
            }
          });

          const sharebuttons = document.getElementById('sharebuttons');
          sharebuttons.style.display = 'block';
          sharebuttons.style.marginTop = '100px';
          uploadFromGallery.style.display = 'none';
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

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const imageId = getQueryParam("imageId");

if (imageId) {
    loadImage(imageId);
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    resetToUploadPrompt();
    const imageId = new URLSearchParams(window.location.search).get("imageId");
    if (imageId) {
        console.log("Loading image with ID:", imageId);
        loadImage(imageId);
    }


});

