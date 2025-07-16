
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
let uploadedImageBlob = null;
let uploadedImageBlob2 = null;
let originalImageUrl1 = null;
let originalImageUrl2 = null;
let uploadedImageUrl = '';
let uploadedImageUrl2 = '';
let cropper;
let currentContainer = null;
            let isImageLoaded = false; // Track loading state globally

// Rotation state for both containers
let rotationState = {
    container1: {
        angle: 0,
        startAngle: 0,
        isRotating: false,
                locked: true,// Add this // Then modify your rotation functions to check this:

        startX: 0,
        startY: 0,
        centerX: 0,
        centerY: 0
    },
    container2: {
        angle: 0,
        startAngle: 0,
        isRotating: false,
                locked: true,// Add this // Then modify your rotation functions to check this:

        startX: 0,
        startY: 0,
        centerX: 0,
        centerY: 0
    }
};

// DOM Elements
const fileInput = document.getElementById('fileInput');
const fileInput2 = document.getElementById('fileInput2');
const imageContainer = document.getElementById('imageContainer');
const imageContainer2 = document.getElementById('imageContainer2');
const cropModal = document.getElementById('cropModal');
const cropCancel2 = document.getElementById('cropCancel2');

const cropImage = document.getElementById('cropImage');

const cropConfirm = document.getElementById('cropConfirm');
const cropCancel = document.getElementById('cropCancel');
const buttonContainer = document.getElementById('buttonContainer');
const buttonContainer2 = document.getElementById('buttonContainer2');
const deleteButton = document.getElementById('deleteButton');
const deleteButton2 = document.getElementById('deleteButton2');
const reCropButton = document.getElementById('reCropButton');
const reCropButton2 = document.getElementById('reCropButton2');
const addToCartBtn = document.getElementById('addToCartBtn');
const reAddToCartBtn = document.getElementById('reAddToCartBtn');
const uploadText = document.getElementById('uploadText');
const uploadText2 = document.getElementById('uploadText2');
const itemNameHeading = document.getElementById('item-nam');
// Rotation controls
const rotateSlider1 = document.getElementById('rotate-slider-1');
const rotateValue1 = document.getElementById('rotate-value-1');
const rotateSlider2 = document.getElementById('rotate-slider-2');
const rotateValue2 = document.getElementById('rotate-value-2');
const resetRotationBtn1 = document.getElementById('reset-rotation-1');
const resetRotationBtn2 = document.getElementById('reset-rotation-2');

// Initialize rotation controls
function initRotationControls() {
    // Container 1 rotation controls
    rotateSlider1.addEventListener('input', () => {
        rotationState.container1.angle = parseInt(rotateSlider1.value);
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

    // Container 2 rotation controls
    rotateSlider2.addEventListener('input', () => {
        rotationState.container2.angle = parseInt(rotateSlider2.value);
        rotateValue2.textContent = `${rotationState.container2.angle}°`;
        applyRotation('container2');
        toggleResetButton('container2');
    });

    resetRotationBtn2.addEventListener('click', () => {
        rotationState.container2.angle = 0;
        rotateSlider2.value = 0;
        rotateValue2.textContent = '0°';
        applyRotation('container2');
        resetRotationBtn2.style.display = 'none';
    });

    // Hide reset buttons initially
    resetRotationBtn1.style.display = 'none';
    resetRotationBtn2.style.display = 'none';
}

// Apply rotation to specified container
function applyRotation(containerId) {
    const container = containerId === 'container1' ? imageContainer : imageContainer2;
    container.style.transform = `rotate(${rotationState[containerId].angle}deg)`;
}

// Toggle reset button visibility based on rotation
function toggleResetButton(containerId) {
    const resetBtn = containerId === 'container1' ? resetRotationBtn1 : resetRotationBtn2;
    resetBtn.style.display = rotationState[containerId].angle !== 0 ? 'block' : 'none';
}

// Normalize angle to be within -180 to 180 degrees
function normalizeAngle(angle) {
    angle = angle % 360;
    if (angle > 180) {
        angle -= 360;
    } else if (angle < -180) {
        angle += 360;
    }
    return angle;
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
        
        let newAngle = rotationState[containerId].startAngle + angle - startAngle;
        // Normalize the angle to stay within -180 to 180
        newAngle = normalizeAngle(newAngle);
        
        rotationState[containerId].angle = newAngle;
        
        // Update slider and value display
        if (containerId === 'container1') {
            rotateSlider1.value = newAngle;
            rotateValue1.textContent = `${Math.round(newAngle)}°`;
        } else {
            rotateSlider2.value = newAngle;
            rotateValue2.textContent = `${Math.round(newAngle)}°`;
        }
        
        applyRotation(containerId);
        toggleResetButton(containerId);
    });

    container.addEventListener('touchend', () => {
        rotationState[containerId].isRotating = false;
    });
}


function updateAddToCartButton() {
  const hasImage1 = imageContainer.style.backgroundImage && imageContainer.style.backgroundImage !== 'none';
  const hasImage2 = imageContainer2.style.backgroundImage && imageContainer2.style.backgroundImage !== 'none';
  const shouldShowButton = hasImage1 && hasImage2;

  if (addToCartBtn) {
    addToCartBtn.style.display = shouldShowButton ? 'block' : 'none';
  }

  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.style.display = shouldShowButton ? 'block' : 'none';
  }

  const otherBtn = document.getElementById('otherBtn'); // replace 'otherBtn' with your actual button id
  if (otherBtn) {
    otherBtn.style.display = shouldShowButton ? 'none' : 'block';
  }

  const itemName = document.querySelector('h3.item-nam');
  if (itemName) {
    itemName.textContent = shouldShowButton ? 'Customized' : 'Custom';
  }
}
// Share button visibility control


document.addEventListener('DOMContentLoaded', () => {
    updateAddToCartButton();
    initRotationControls();
    initTouchRotation(imageContainer, 'container1');
    initTouchRotation(imageContainer2, 'container2');
});

// Event Listeners for image containers
imageContainer.addEventListener('click', () => {
    if (!imageContainer.style.backgroundImage || imageContainer.style.backgroundImage === 'none') {
        fileInput.click();
        currentContainer = 'container1';
    }
});

imageContainer2.addEventListener('click', () => {
    if (!imageContainer2.style.backgroundImage || imageContainer2.style.backgroundImage === 'none') {
        fileInput2.click();
        currentContainer = 'container2';
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
    originalImageUrl1 = null;
    rotationState.container1.angle = 0;
    rotateSlider1.value = 0;
    rotateValue1.textContent = '0°';
    resetRotationBtn1.style.display = 'none';
    updateAddToCartButton();
    hidefrontLoading();
    resetToUploadPrompt1();
});

deleteButton2.addEventListener('click', () => {
    imageContainer2.style.backgroundImage = '';
    imageContainer2.style.transform = 'rotate(0deg)';
    buttonContainer2.style.display = 'none';
    uploadText2.style.display = 'block';
    fileInput2.value = '';
    uploadedImageBlob2 = null;
    originalImageUrl2 = null;
    rotationState.container2.angle = 0;
    rotateSlider2.value = 0;
    rotateValue2.textContent = '0°';
    resetRotationBtn2.style.display = 'none';
    updateAddToCartButton();
    hidebackLoading();
    resetToUploadPrompt2();
});

// Re-crop buttons
reCropButton.addEventListener('click', () => {
    showfrontLoading();
    if (originalImageUrl1) {
        if (cropper) cropper.destroy();
        cropImage.src = originalImageUrl1;
        cropModal.style.display = 'flex';
        currentContainer = 'container1';
        cropper = new Cropper(cropImage, {
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 1,
        });
    }
});

reCropButton2.addEventListener('click', () => {
    showbackLoading();
    if (originalImageUrl2) {
        if (cropper) cropper.destroy();
        cropImage2.src = originalImageUrl2;
        cropModal2.style.display = 'flex';
        currentContainer = 'container2';
        cropper = new Cropper(cropImage2, {
            aspectRatio: 1,
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

function resetToUploadPrompt1() {
    console.log("Resetting to upload prompt 1");
    if (uploadText && !imageContainer.style.backgroundImage) {
        uploadText.style.display = 'block';
        uploadText.style.visibility = 'visible';
        uploadText.innerHTML = '<i class="fas fa-image"></i><br>Click here to upload photo';
    }
    fileInput.value = '';
}

function resetToUploadPrompt2() {
    console.log("Resetting to upload prompt 2");
    if (uploadText2 && !imageContainer2.style.backgroundImage) {
        uploadText2.style.display = 'block';
        uploadText2.style.visibility = 'visible';
        uploadText2.innerHTML = '<i class="fas fa-image"></i><br>Click here to upload photo';
    }
    fileInput2.value = '';
}

cropCancel.addEventListener('click', () => {
    cropModal.style.display = 'none';
    if (cropper) cropper.destroy();
    hidefrontLoading(true);
});

cropCancel2.addEventListener('click', () => {
    cropModal2.style.display = 'none';
    if (cropper) cropper.destroy();
    hidebackLoading(true);
});

function hidefrontLoading(shouldReset = false) {
    console.log('Hiding front loading...');
    if (uploadText) {
        uploadText.style.display = 'none';
        uploadText.style.visibility = 'hidden';
        if (shouldReset) {
            resetToUploadPrompt1();
        }
    }
}

function hidebackLoading(shouldReset = false) {
    console.log('Hiding back loading...');
    if (uploadText2) {
        uploadText2.style.display = 'none';
        uploadText2.style.visibility = 'hidden';
        if (shouldReset) {
            resetToUploadPrompt2();
        }
    }
}

function showfrontLoading() {
    console.log("Showing front loading state");
    if (uploadText) {
        uploadText.style.display = 'block';
        uploadText.style.visibility = 'visible';
        uploadText.innerHTML = '<i class="fas fa-spinner fa-spin"></i><br>Loading photo...';
    }
    updateHeadingText(true);
}

function showbackLoading() {
    console.log("Showing back loading state");
    if (uploadText2) {
        uploadText2.style.display = 'block';
        uploadText2.style.visibility = 'visible';
        uploadText2.innerHTML = '<i class="fas fa-spinner fa-spin"></i><br>Loading photo...';
    }
    updateHeadingText(true);
}

// File input handlers
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    showfrontLoading();
    currentContainer = 'container1';
    const reader = new FileReader();
    reader.onload = (event) => {
      originalImageUrl1 = event.target.result;
      if (cropper) cropper.destroy();
      cropImage.src = originalImageUrl1;
      cropModal.style.display = 'flex';
      cropper = new Cropper(cropImage, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
      });
    };
    reader.readAsDataURL(file);
  } else {
            videoalert('  <i class="fas fa-cloud-upload-alt"></i></i>Please upload a photo!');

  }
  e.target.value = '';
});

fileInput2.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    showbackLoading();
    currentContainer = 'container2';
    const reader = new FileReader();
    reader.onload = (event) => {
      originalImageUrl2 = event.target.result;
      if (cropper) cropper.destroy();
      cropImage2.src = originalImageUrl2;
      cropModal2.style.display = 'flex';
      cropper = new Cropper(cropImage2, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
      });
    };
    reader.readAsDataURL(file);
  } else {
            videoalert('  <i class="fas fa-cloud-upload-alt"></i></i>Please upload a photo!');

  }
  e.target.value = '';
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

// Crop confirm buttons
cropConfirm.addEventListener('click', () => {
  const croppedCanvas = cropper.getCroppedCanvas();
  const croppedImageUrl = croppedCanvas.toDataURL();

  if (currentContainer === 'container1') {
    imageContainer.style.backgroundImage = `url(${croppedImageUrl})`;
    buttonContainer.style.display = 'block';
    uploadText.style.display = 'none';
    croppedCanvas.toBlob((blob) => {
      uploadedImageBlob = blob;
      updateAddToCartButton();
      updateHeadingText()
    });
  }

  cropModal.style.display = 'none';
  cropper.destroy();

});

cropConfirm2.addEventListener('click', () => {
  const croppedCanvas = cropper.getCroppedCanvas();
  const croppedImageUrl = croppedCanvas.toDataURL();

  if (currentContainer === 'container2') {
    imageContainer2.style.backgroundImage = `url(${croppedImageUrl})`;
    buttonContainer2.style.display = 'block';
    uploadText2.style.display = 'none';
    croppedCanvas.toBlob((blob) => {
      uploadedImageBlob2 = blob;
      updateAddToCartButton();
    });
  }

  cropModal2.style.display = 'none';
  cropper.destroy();

});


// Load image from URL parameter
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const imageId = getQueryParam("imageId");

if (imageId) {
    loadImage(imageId);
}
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('itemId');
    const imageIndex = urlParams.get('image') || '0';
    const selectedSize = urlParams.get('size') || 'default';

    let productPrice = null;

    addToCartBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    if ((!imageContainer.style.backgroundImage || imageContainer.style.backgroundImage === 'none') &&
        (!imageContainer2.style.backgroundImage || imageContainer2.style.backgroundImage === 'none')) {
        alert("Please upload at least one image first.");
        return;
    }

    // Check product price and availability
    const priceExists = await fetchProductPrice();
    if (!priceExists) {
        alert("This product variation is currently unavailable. Please try another option.");
        hideProcessingOverlay();
        return;
    }

    try {
        showProcessingOverlay();
        updateProgress(0);

        let totalProgress = 0;
        let imagesToUpload = 0;
        let imagesUploaded = 0;
        
        if (uploadedImageBlob) imagesToUpload++;
        if (uploadedImageBlob2) imagesToUpload++;

        const updateCombinedProgress = (individualProgress) => {
            totalProgress = Math.floor((imagesUploaded * 50) + (individualProgress * 0.5));
            updateProgress(totalProgress);
        };

        let imageUrl1 = null;
        let imageUrl2 = null;

        if (uploadedImageBlob) {
            const uniqueFileName1 = `image1_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
            const imageRef1 = storageRef(storage, 'images/' + uniqueFileName1);
            const uploadTask1 = uploadBytesResumable(imageRef1, uploadedImageBlob);
            
            uploadTask1.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    updateCombinedProgress(progress);
                },
                (error) => {
                    console.error('Error uploading image 1:', error);
                    throw error;
                }
            );
            
            await uploadTask1;
            imageUrl1 = await getDownloadURL(uploadTask1.snapshot.ref);
            imagesUploaded++;
            updateCombinedProgress(100);
        }

        if (uploadedImageBlob2) {
            const uniqueFileName2 = `image2_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
            const imageRef2 = storageRef(storage, 'images/' + uniqueFileName2);
            const uploadTask2 = uploadBytesResumable(imageRef2, uploadedImageBlob2);
            
            uploadTask2.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    updateCombinedProgress(50 + (progress * 0.5));
                },
                (error) => {
                    console.error('Error uploading image 2:', error);
                    throw error;
                }
            );
            
            await uploadTask2;
            imageUrl2 = await getDownloadURL(uploadTask2.snapshot.ref);
            imagesUploaded++;
            updateProgress(100);
        }

        const imageId = Date.now().toString();
const shareableLink = `${window.location.pathname}?itemId=${itemId}&image=${imageIndex}&size=${selectedSize}&imageId=${imageId}`;
        await set(ref(database, 'sharedImages/' + imageId), {
            url: imageUrl1,
            url2: imageUrl2,
            shareableLink: shareableLink,
            rotation1: rotationState.container1.angle,
            rotation2: rotationState.container2.angle
        });

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
                customImage: imageUrl1,
                customImage2: imageUrl2
            },
            price: productPrice, // Now using the dynamically fetched price
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
            rotation1: rotationState.container1.angle,
            rotation2: rotationState.container2.angle
        };

        cartItems.push(newItem);
        await set(cartRef, cartItems);
        
        function clearInputs() {
            imageContainer.style.backgroundImage = '';
            imageContainer.style.transform = 'rotate(0deg)';
            fileInput.value = '';
            uploadedImageBlob = null;
            if (uploadText) uploadText.style.display = 'block';
            if (buttonContainer) buttonContainer.style.display = 'none';
            rotationState.container1.angle = 0;
            rotateSlider1.value = 0;
            rotateValue1.textContent = '0°';
            resetRotationBtn1.style.display = 'none';
            
            imageContainer2.style.backgroundImage = '';
            imageContainer2.style.transform = 'rotate(0deg)';
            fileInput2.value = '';
            uploadedImageBlob2 = null;
            if (uploadText2) uploadText2.style.display = 'block';
            if (buttonContainer2) buttonContainer2.style.display = 'none';
            rotationState.container2.angle = 0;
            rotateSlider2.value = 0;
            rotateValue2.textContent = '0°';
            resetRotationBtn2.style.display = 'none';
        }
        
        clearInputs();
        hideProcessingOverlay();
        showCartAlert('<i class="fa fa-check-circle green-icon"></i>Item added to cart');
        window.location.href = "cart.html";           
    } catch (error) {
        console.error('Error uploading image:', error);
        hideProcessingOverlay();
        alert("Failed to upload image.");
    }
});

// Add the fetchProductPrice function if not already defined
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
reAddToCartBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Check if there are loaded images in either container
    if ((!imageContainer.style.backgroundImage || imageContainer.style.backgroundImage === 'none') &&
        (!imageContainer2.style.backgroundImage || imageContainer2.style.backgroundImage === 'none')) {
        alert("No images loaded to add to cart.");
        return;
    }

    // Extract image URLs from backgroundImage styles
    const imageUrl1 = imageContainer.style.backgroundImage.includes('url("') ? 
        imageContainer.style.backgroundImage.replace('url("', '').replace('")', '') : null;
    
    const imageUrl2 = imageContainer2.style.backgroundImage.includes('url("') ? 
        imageContainer2.style.backgroundImage.replace('url("', '').replace('")', '') : null;

    const priceExists = await fetchProductPrice();
    if (!priceExists) {
        alert("This product variation is currently unavailable. Please try another option.");
        hideProcessingOverlay();
        return;
    }

    try {
        showProcessingOverlay();

        // Generate a unique ID for this cart item
        const imageId = Date.now().toString();
        
        // Create shareable link with current rotations
const shareableLink = `${window.location.pathname}?itemId=${itemId}&image=${imageIndex}&size=${selectedSize}&imageId=${imageId}`;
        // Store the image references in database (without re-uploading)
        await set(ref(database, 'sharedImages/' + imageId), {
            url: imageUrl1,
            url2: imageUrl2,
            shareableLink: shareableLink,
            rotation1: rotationState.container1.angle,
            rotation2: rotationState.container2.angle
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
                customImage: imageUrl1,
                customImage2: imageUrl2
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
            rotation1: rotationState.container1.angle,
            rotation2: rotationState.container2.angle
        };

        cartItems.push(newItem);
        await set(cartRef, cartItems);

        hideProcessingOverlay();
        showCartAlert('<i class="fa fa-check-circle green-icon"></i>Item added to cart');
        window.location.href = "cart.html";
    } catch (error) {
        console.error('Error adding to cart:', error);
        hideProcessingOverlay();
        alert("Failed to add item to cart. Please try again.");
    }
});

const shareBtn = document.getElementById('shareBtn');
shareBtn.addEventListener('click', async () => {
  // Check both containers for images
  const hasImage1 = imageContainer.style.backgroundImage && imageContainer.style.backgroundImage !== 'none';
  const hasImage2 = imageContainer2.style.backgroundImage && imageContainer2.style.backgroundImage !== 'none';

  if (!(hasImage1 && hasImage2)) {
    alert("Please upload 2 images first.");
    return;
  }

  if (!(uploadedImageBlob && uploadedImageBlob2)) {
    alert("Please crop both images.");
    return;
  }

  try {
    showProcessingOverlay();
    updateProgress(0); // Initialize progress bar
    let totalProgress = 0;
    let imagesToUpload = 2;
    let imagesUploaded = 0;

    const updateCombinedProgress = (individualProgress) => {
      totalProgress = Math.floor((imagesUploaded * 50) + (individualProgress * 0.5));
      updateProgress(totalProgress);
    };

    // Upload both images
    const uniqueFileName1 = `image1_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
    const imageRef1 = storageRef(storage, 'images/' + uniqueFileName1);
    const uploadTask1 = uploadBytesResumable(imageRef1, uploadedImageBlob);
    uploadTask1.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      updateCombinedProgress(progress);
    }, (error) => {
      console.error('Error uploading image 1:', error);
      throw error;
    });
    await uploadTask1;
    const imageUrl1 = await getDownloadURL(uploadTask1.snapshot.ref);
    imagesUploaded++;

    const uniqueFileName2 = `image2_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
    const imageRef2 = storageRef(storage, 'images/' + uniqueFileName2);
    const uploadTask2 = uploadBytesResumable(imageRef2, uploadedImageBlob2);
    uploadTask2.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      updateCombinedProgress(progress);
    }, (error) => {
      console.error('Error uploading image 2:', error);
      throw error;
    });
    await uploadTask2;
    const imageUrl2 = await getDownloadURL(uploadTask2.snapshot.ref);
    imagesUploaded++;

    // Generate unique ID for this shared image set
    const imageId = Date.now().toString();
    const shareableLink = `${window.location.origin}${window.location.pathname}?itemId=${itemId}&image=${imageIndex}&size=${selectedSize}&imageId=${imageId}`;

    // Save to database
    await set(ref(database, 'sharedImages/' + imageId), {
      url: imageUrl1,
      url2: imageUrl2,
      shareableLink: shareableLink,
            rotation1: rotationState.container1.angle,
            rotation2: rotationState.container2.angle
    });

    // Prepare WhatsApp sharing
    const whatsappNumber = "27728662309";
    const whatsappMessage = `Check out my design: ${shareableLink}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    // Complete progress and show success
    updateProgress(100);
    hideProcessingOverlay();
    showCartAlert('<i class="fab fa-whatsapp green-icon"></i> Opening WhatsApp...');
    
    // Open WhatsApp with fallback
    window.location.href = whatsappUrl;
    setTimeout(() => {
      if (window.location.href !== whatsappUrl) {
        window.open(whatsappUrl, '_blank');
      }
    }, 1000);

  } catch (error) {
    console.error('Share error:', error);
    showCartAlert(`<i class="fas fa-exclamation-circle"></i> ${error.message || 'Sharing failed'}`);
    updateProgress(0);
  } finally {
    setTimeout(hideProcessingOverlay, 2000);
  }
});
// Native share and WhatsApp share functions remain the same
const nativeShareBtn = document.getElementById('nativeShareBtn');
const whatsappShareBtn = document.getElementById('whatsappShareBtn');

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
        copyToClipboard(window.location.href);
        alert('Link copied to clipboard! You can now share it manually.');
    }
}

function shareWithWhatsApp() {
    const message = encodeURIComponent('Check this out: ' + window.location.href);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

nativeShareBtn.addEventListener('click', shareWithNative);
whatsappShareBtn.addEventListener('click', shareWithWhatsApp);    
});
async function loadImage(imageId) {
    try {
        const itemName = document.querySelector('.item-nam');
        if (itemName) itemName.textContent = 'Double sided photo pendant customized';
        
        if (uploadText) uploadText.innerHTML = '<i class="fas fa-spinner fa-spin"></i><br>Loading front photo...';
        if (uploadText2) uploadText2.innerHTML = '<i class="fas fa-spinner fa-spin"></i><br>Loading back photo...';
        
        const imageRef = ref(database, `sharedImages/${imageId}`);
        const snapshot = await get(imageRef);

        if (snapshot.exists()) {
            const imageData = snapshot.val();
            const imageUrl = imageData.url;
            const imageUrl2 = imageData.url2;
            const rotation1 = imageData.rotation1 || 0;
            const rotation2 = imageData.rotation2 || 0;

            if (addToCartBtn) addToCartBtn.style.display = "none";

            let imagesLoaded = 0;

            // Load first image with rotation
            if (imageUrl) {
                imageContainer.style.backgroundImage = `url('${imageUrl}')`;
                imageContainer.style.transform = `rotate(${rotation1}deg)`;
                imageContainer.style.backgroundSize = "cover";
                imageContainer.style.backgroundPosition = "center";
                imageContainer.style.cursor = "pointer";
                if (uploadText) uploadText.style.display = "none";
                if (buttonContainer) buttonContainer.style.display = "none";
                if (sharebuttons) sharebuttons.style.display = 'block';
                
                rotationState.container1.angle = rotation1;
                rotateSlider1.value = rotation1;
                rotateValue1.textContent = `${Math.round(rotation1)}°`;
                toggleResetButton('container1');

                const imageLink = document.getElementById('frontImageLink');
                if (imageLink) imageLink.href = imageUrl;
                
                rotateSlider1.disabled = true;
                if (resetRotationBtn1) resetRotationBtn1.style.display = 'none';
                imageContainer.replaceWith(imageContainer.cloneNode(true));
                imagesLoaded++;
            } else {
                if (uploadText) uploadText.innerHTML = '<i class="fas fa-image"></i><br>Click to upload front photo';
            }

            // Load second image with rotation
            if (imageUrl2) {
                imageContainer2.style.backgroundImage = `url('${imageUrl2}')`;
                imageContainer2.style.transform = `rotate(${rotation2}deg)`;
                imageContainer2.style.backgroundSize = "cover";
                imageContainer2.style.backgroundPosition = "center";
                imageContainer2.style.cursor = "pointer";
                if (uploadText2) uploadText2.style.display = "none";
                if (buttonContainer2) buttonContainer2.style.display = "none";
                
                rotationState.container2.angle = rotation2;
                rotateSlider2.value = rotation2;
                rotateValue2.textContent = `${Math.round(rotation2)}°`;
                toggleResetButton('container2');

                const imageLink2 = document.getElementById('backImageLink');
                if (imageLink2) imageLink2.href = imageUrl2;
                
                rotateSlider2.disabled = true;
                if (resetRotationBtn2) resetRotationBtn2.style.display = 'none';
                imageContainer2.replaceWith(imageContainer2.cloneNode(true));
                imagesLoaded++;
            } else {
                if (uploadText2) uploadText2.innerHTML = '<i class="fas fa-image"></i><br>Click to upload back photo';
            }

            // Update item name if any images loaded
            if (imagesLoaded > 0 && itemName) {
                itemName.textContent = 'Customized';
            }

        } else {
            console.log("Image not found.");
            if (uploadText) uploadText.innerHTML = '<i class="fas fa-image"></i><br>Click to upload front photo';
            if (uploadText2) uploadText2.innerHTML = '<i class="fas fa-image"></i><br>Click to upload back photo';
        }
    } catch (error) {
        console.error("Error loading image:", error);
        if (uploadText) uploadText.innerHTML = '<i class="fas fa-image"></i><br>Error loading photo';
        if (uploadText2) uploadText2.innerHTML = '<i class="fas fa-image"></i><br>Error loading photo';
    }
} if (true) {
    
}
// Function to show the processing overlay
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
function updateProgress(progress) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    progressBar.style.width = progress + '%'; // Update the width of the progress bar
    progressText.textContent = progress + '%'; // Update the progress text
}

// Function to simulate image upload progress
function simulateUploadProgress(uploadTask) {
    return new Promise((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
            if (progress < 100) {
                progress++;
                updateProgress(progress); // Update the progress bar
            } else {
                clearInterval(interval);
                resolve();
            }
        }, 50); // Update progress every 50ms to simulate a smooth upload
    });
}

let alertTimeout;
let alertStartTime = 0;
let alertTimeLeft = 3000; // 3 seconds for the alert to auto-dismiss


// Start the timeout to hide the alert after a certain time
function startAlertTimeout() {
  alertStartTime = Date.now();
  clearTimeout(alertTimeout); // Clear any existing timeouts first
  alertTimeout = setTimeout(() => {
    const cartAlert = document.getElementById('Alert');
    const overlay = document.getElementById('overlay');
    if (cartAlert && overlay) {
      console.log("Hiding alert after timeout"); // Debugging: Confirming that timeout is firing
      cartAlert.style.display = 'none'; // Hide the cart alert
      overlay.style.display = 'none'; // Hide the overlay
    } else {
      console.error('Cart alert or overlay not found during timeout.');
    }
    alertTimeLeft = 3000; // Reset time to 5000 after timeout
  }, alertTimeLeft); // Use current alertTimeLeft
}

// Pause the countdown without hiding the alert or overlay
function pauseAlertCountdown() {
  clearTimeout(alertTimeout); // Stop the countdown
  console.log("Alert paused, countdown stopped.");
}

// Cancel and hide the alert immediately when the user clicks or taps on it
function cancelAndHideAlert(event) {
  const cartAlert = document.getElementById('Alert');
  const overlay = document.getElementById('overlay');

  // Hide the alert and overlay immediately
  if (cartAlert && overlay) {
    cartAlert.style.display = 'none';
    overlay.style.display = 'none';
    console.log("Alert canceled and hidden immediately.");
  } else {
    console.error('Cart alert or overlay not found when canceling.');
  }

  // Reset the countdown immediately when canceled
  alertTimeLeft = 3000;
  clearTimeout(alertTimeout); // Clear the current timeout
  console.log("Countdown reset to 5000.");
}

// Resume the countdown when the user releases the mouse or touch
function resumeAlertCountdown() {
  startAlertTimeout(); // Restart the countdown from the current time left
  console.log("Alert resumed, countdown restarted.");
}

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
