
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

let uploadedImageUrl = '';
let cropper;
let isRotating = false;
let startAngle = 0;
let currentRotation = 0;
let originalImageUrl = null;
let currentContainer = null; // Track which container is being cropped
// DOM Elements

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


// Initialize rotation controls

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


});

// Event Listeners for image containers
imageContainer.addEventListener('click', () => {
    if (!imageContainer.style.backgroundImage || imageContainer.style.backgroundImage === 'none') {
        fileInput.click();
        currentContainer = 'container1';
    }
});



// Delete buttons
deleteButton.addEventListener('click', () => {
    imageContainer.style.backgroundImage = '';
    imageContainer.style.transform = 'rotate(0deg)';
    buttonContainer.style.display = 'none';
    uploadText.style.display = 'block';
    fileInput.value = '';
    uploadedImageBlob = null;
    originalImageUrl = null;

    updateAddToCartButton();
   resetToUploadPrompt();           
});



            // Your existing image loading code
            const itemNameHeading = document.querySelector('.item-nam');
            let isImageLoaded = false; // Track loading state globally

            async function loadImage(imageId) {
                try {
                    
                    showLoading();
                    isImageLoaded = false; // Reset loading state
                    updateHeadingText(); // Update heading immediately when starting to load
                    console.log("Starting to load image");

                    const imageRef = ref(database, `sharedImages/${imageId}`);
                    const snapshot = await get(imageRef);
                    
                    if (snapshot.exists()) {
                        const imageData = snapshot.val();
                        const imageUrl = imageData.url;

                
                   
                        // Set the link's href
                        const imageLink = document.getElementById('imageLink');
                        imageLink.href = imageUrl;
                        
                        // Create new Image object to track actual loading
                        const img = new Image();
                        img.onload = () => {
                            // This runs when image is fully loaded
                            isImageLoaded = true;
                            updateHeadingText();
                            hideLoading();
                            
                            // Apply the image to container
                            imageContainer.style.backgroundImage = `url('${imageUrl}')`;
                            imageContainer.style.backgroundSize = "cover";
                            
              imageContainer.style.backgroundPosition = "center";
                            imageContainer.style.cursor = "pointer";
                            uploadText.style.display = "none";
                            
                     sharebuttons.style.display = 'block';         
                     
 
 
       imageContainer.replaceWith(imageContainer.cloneNode(true));
                        };
                        
                        img.onerror = () => {
                            console.error("Failed to load image");
                            isImageLoaded = false;
                            updateHeadingText();
                            resetToUploadPrompt();
                            hideLoading();
                            alert("Failed to load image.");
                        };
                        
                        // Start loading the image
                        img.src = imageUrl;
                        
                    } else {
                        console.log("Image not found in database");
                        isImageLoaded = false;
                        updateHeadingText();
                        resetToUploadPrompt();
                        alert("Image not found.");
                        hideLoading();
                    }
                } catch (error) {
                    console.error("Error loading image:", error);
                    isImageLoaded = false;
                    updateHeadingText();
                    resetToUploadPrompt();
                    hideLoading();
                }
            }
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    showLoading();
    currentContainer = 'container1';
    const reader = new FileReader();
    reader.onload = (event) => {
      originalImageUrl = event.target.result;
      cropImage.src = originalImageUrl;
      cropModal.style.display = 'flex';
      cropper = new Cropper(cropImage, {
        aspectRatio: 3/4,
        viewMode: 1,
        autoCropArea: 1,
      });
    };
    reader.readAsDataURL(file);
  } else {
            videoalert('  <i class="fas fa-cloud-upload-alt"></i></i>Please upload a photo!');
    fileInput.value = ''; // Reset file input
  }
});
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


// Crop confirm
cropConfirm.addEventListener('click', () => {
  const croppedCanvas = cropper.getCroppedCanvas();
  const croppedImageUrl = croppedCanvas.toDataURL();
  if (currentContainer === 'container1') {
    imageContainer.style.backgroundImage = `url(${croppedImageUrl})`;
    buttonContainer.style.display = 'block';
    uploadText.style.display = 'none';
    croppedCanvas.toBlob((blob) => {
      uploadedImageBlob = blob;
      isImageLoaded = true; 
      updateHeadingText();
      updateAddToCartButton(); // Add this line
    });
  }
  cropModal.style.display = 'none';
  cropper.destroy();
});
// In the crop cancel event listener


reCropButton.addEventListener('click', () => {
    if (originalImageUrl) {
   showLoading();
        cropImage.src = originalImageUrl;
        cropModal.style.display = 'flex';
        currentContainer = 'container1';
        cropper = new Cropper(cropImage, {
            aspectRatio: 3/4,
            viewMode: 1,
            autoCropArea: 1,
        });
    }
});


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


    addToCartBtn.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        if (!imageContainer.style.backgroundImage || imageContainer.style.backgroundImage === 'none') {
  alert("Please upload an image first.");
  return;
}

if (!uploadedImageBlob || !uploadedImageBlob.type.startsWith('image/')) {
  alert("Invalid file type. Please upload an image.");
  return;
}

        const priceExists = await fetchProductPrice();
        if (!priceExists) {
            alert("This product variation is currently unavailable. Please try another option.");
            hideProcessingOverlay();
            return;
        }

        try {
            showProcessingOverlay();

            const uniqueFileName = `image_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
            const imageRef = storageRef(storage, 'images/' + uniqueFileName);
            const uploadTask = uploadBytesResumable(imageRef, uploadedImageBlob);

            await simulateUploadProgress(uploadTask);

            const uploadedImageUrl = await new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    null,
                    (error) => reject(error),
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    }
                );
            });

            const imageId = Date.now().toString();
const shareableLink = `${window.location.pathname}?itemId=${itemId}&image=${imageIndex}&size=${selectedSize}&imageId=${imageId}`;

            await set(ref(database, 'sharedImages/' + imageId), {
                url: uploadedImageUrl,
                shareableLink: shareableLink,

            });

            const userId = user.uid;
            const cartRef = ref(database, `carts/${userId}/carts`);
            const snapshot = await get(cartRef);
            let cartItems = snapshot.exists() ? snapshot.val() : [];

            const now = new Date();
            const newItem = {
                itemID: itemId,
                addedAt: now.getTime(),
                images: {
                    mainimage: {
                        [imageIndex]: true
                    },
                    customImage: uploadedImageUrl
                },
                price: productPrice,
                quantity: 1,
                selectedSize: selectedSize,
             

                shareableLink: shareableLink,
                addedAtISO: now.toISOString(),
                addedAtReadable: now.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
    };

            cartItems.push(newItem);
            await set(cartRef, cartItems);


            hideProcessingOverlay();
            showCartAlert('<i class="fa fa-check-circle green-icon"></i>Item added to cart');
            window.location.href = "cart_page.html";
        } catch (error) {
            console.error('Error uploading image:', error);
            hideProcessingOverlay();
            alert("Failed to upload image. Please try again.");
        }
    });


    reAddToCartBtn.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        // Check if there's a loaded image
        if (!imageContainer.style.backgroundImage || imageContainer.style.backgroundImage === 'none') {
            alert("No image loaded to add to cart.");
            return;
        }

        // Extract the image URL from backgroundImage style
        const imageUrl = imageContainer.style.backgroundImage
            .replace('url("', '')
            .replace('")', '');

        const priceExists = await fetchProductPrice();
        if (!priceExists) {
            alert("This product variation is currently unavailable. Please try another option.");
            return;
        }

        try {
            showProcessingOverlay();

            // Generate a unique ID for this cart item
            const imageId = Date.now().toString();
            
            // Create shareable link with current rotation
const shareableLink = `${window.location.pathname}?itemId=${itemId}&image=${imageIndex}&size=${selectedSize}&imageId=${imageId}`;

            // Store the image reference in database (without re-uploading)
            await set(ref(database, 'sharedImages/' + imageId), {
                url: imageUrl,
                shareableLink: shareableLink,
          
            });

            // Add to user's cart
            const userId = user.uid;
            const cartRef = ref(database, `carts/${userId}/cartItems`);
            const snapshot = await get(cartRef);
            let cartItems = snapshot.exists() ? snapshot.val() : [];

            const now = new Date();
            const newItem = {
                itemID: itemId,
                addedAt: now.getTime(),
                images: {
                    mainimage: {
                        [imageIndex]: true
                    },
                    customImage: imageUrl // Use the existing image URL
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

            };

            cartItems.push(newItem);
            await set(cartRef, cartItems);

            hideProcessingOverlay();
            showCartAlert('<i class="fa fa-check-circle green-icon"></i>Item added to cart');
            window.location.href = "cart_page.html";
        } catch (error) {
            console.error('Error adding to cart:', error);
            hideProcessingOverlay();
            alert("Failed to add item to cart. Please try again.");
        }
    });

const shareBtn = document.getElementById('shareBtn');
shareBtn.addEventListener('click', async () => {
    if (!imageContainer.style.backgroundImage || imageContainer.style.backgroundImage === 'none') {
        alert("Please upload an image first.");
        return;
    }

    if (!uploadedImageBlob) {
        alert("No cropped image available.");
        return;
    }

    try {
        showProcessingOverlay();
        const uniqueFileName = `image_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
        const imageRef = storageRef(storage, 'images/' + uniqueFileName);
        const uploadTask = uploadBytesResumable(imageRef, uploadedImageBlob);
        await simulateUploadProgress(uploadTask);
        const uploadedImageUrl = await new Promise((resolve, reject) => {
            uploadTask.on('state_changed', null, (error) => reject(error), async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            });
        });

        const imageId = Date.now().toString();
 
 const shareableLink = `${window.location.pathname}?itemId=${itemId}&image=${imageIndex}&size=${selectedSize}&imageId=${imageId}`;
 
        await set(ref(database, 'sharedImages/' + imageId), {
            url: uploadedImageUrl,
            shareableLink: shareableLink

        });

        const whatsappNumber = "0728662309";
        const message = `Check out this item: ${shareableLink}`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_self");
            showCartAlert('<i class="fa fa-check-circle green-icon"></i>Upload successful!');
        hideProcessingOverlay();
    } catch (error) {
        console.error('Error uploading image:', error);
        hideProcessingOverlay();
        alert("Failed to upload image. Please try again.");
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

