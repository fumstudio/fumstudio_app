import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, get, set, onValue, update,ref as dbRef } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
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
// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);
const auth = getAuth(app);
const db = getDatabase(app);

// Global variables
let currentItemData = null;
let currentCartID = null;
let currentUser = null;
let currentActiveThumbnailIndex = 0;
let isFirstLoad = true;

// Check authentication state

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in with UID:", user.uid);
        currentUser = user;
        getCartID(user.uid);
        
        // Only initialize currency monitoring if not already set
        if (currentCurrency === 'ZAR') {
            monitorCurrencyChanges(user.uid);
        }
        
        if (currentItemData) {
            initializeThumbnailLikes(currentItemData.id);
        }
    } else {
        console.log("User is not logged in");
        currentUser = null;
        // Don't reset currency if we have a stored preference
        if (!localStorage.getItem('preferredCurrency')) {
            currentCurrency = 'ZAR';
            updateAllPrices('ZAR');
        }
    }
});

async function loadCart(userId) {
    try {
        const cartRef = dbRef(db, `carts/${userId}/cartItems`);
        const snapshot = await get(cartRef);

        if (snapshot.exists()) {
            const cartData = snapshot.val();
            let cartItems = [];
            
            // Handle both array and object-with-numeric-keys formats
            if (Array.isArray(cartData)) {
                cartItems = cartData;
            } else if (cartData && typeof cartData === 'object') {
                // Convert object with numeric keys to array
                cartItems = Object.values(cartData);
            }

            // Process items and set default quantities
            const processedItems = cartItems.map(item => ({
                ...item,
                quantity: item.quantity || 1
            }));
            
            updateTotalItemCount(processedItems);
        } else {
            updateTotalItemCount([]);
        }
    } catch (error) {
        console.error("Error loading cart:", error);
        updateTotalItemCount([]);
    }
}

function listenToCartChanges(userId) {
    const cartRef = dbRef(db, `carts/${userId}/cartItems`);
    onValue(cartRef, (snapshot) => {
        if (snapshot.exists()) {
            const cartData = snapshot.val();
            let cartItems = [];
            
            if (Array.isArray(cartData)) {
                cartItems = cartData;
            } else if (cartData && typeof cartData === 'object') {
                cartItems = Object.values(cartData);
            }

            const processedItems = cartItems.map(item => ({
                ...item,
                quantity: item.quantity || 1
            }));
            
            updateTotalItemCount(processedItems);
        } else {
            updateTotalItemCount([]);
        }
    });
}

function updateTotalItemCount(cartItems) {
    const totalItemCount = cartItems.reduce((total, item) => {
        return total + (item.quantity || 1);
    }, 0);
    
    const itemCountElement = document.getElementById('totalItemCount');
    if (itemCountElement) {
        itemCountElement.innerText = totalItemCount;
    }
}

// Initialize Firebase authentication and listen for auth state changes
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadCart(user.uid);
            listenToCartChanges(user.uid);
        } else {
            updateTotalItemCount([]);
        }
    });
});





// Initialize Firebase authentication and listen for authentication state changes
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        const itemCountElement = document.getElementById('totalItemCount');
        
        if (user) {
            loadCart(user.uid);  // Load the cart if the user is logged in
            listenToCartChanges(user.uid);  // Set up real-time listener for cart updates
        } else {
            if (itemCountElement) {
                itemCountElement.innerText = '0';  // User not logged in
            }
        }
    });
});



// Get or create cart ID for user
function getCartID(userID) {
    const cartRef = ref(database, `users/${userID}/currentCart`);
    get(cartRef).then((snapshot) => {
        if (snapshot.exists()) {
            currentCartID = snapshot.val();
        } else {
            currentCartID = 'cart_' + Date.now();
            set(cartRef, currentCartID);
        }
    });
}

// Get parameters from URL
const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('itemId');
const imageIndex = urlParams.get('image');
const selectedSize = urlParams.get('size');
const itemContent = document.getElementById('item-content');

if (!itemId) {
    itemContent.innerHTML = '<div class="loading"></div>';
} else {
    // Load item data with realtime updates
    const itemRef = ref(database, `items/${itemId}`);
    onValue(itemRef, (snapshot) => {
        if (snapshot.exists()) {
            currentItemData = { ...snapshot.val(), id: itemId };
            renderItem(currentItemData);
            
            if (isFirstLoad) {
                // Handle URL parameters on first load
                if (imageIndex) {
                    setTimeout(() => {
                        const thumb = document.querySelector(`.gallery-thumbnail[data-index="${imageIndex}"]`);
                        if (thumb) {
                            thumb.click();
                            thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                        }
                    }, 500);
                }
                
                if (selectedSize) {
                    setTimeout(() => {
                        const sizeOption = document.querySelector(`.size-option[data-size="${selectedSize}"]`);
                        if (sizeOption) {
                            document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
                            sizeOption.classList.add('selected');
                        }
                    }, 500);
                }
                isFirstLoad = false;
            }
        } else {
            itemContent.innerHTML = '<div class="loading">Item not found.</div>';
        }
    }, (error) => {
        console.error('Error loading item:', error);
        itemContent.innerHTML = '<div class="loading">Error loading item. Please try again.</div>';
    });
}

// Function to format likes count
function formatLikesCount(count) {
    if (count >= 1000) {
        const formatted = (count / 1000).toFixed(1);
        return formatted.endsWith('.0') ? `${formatted.split('.')[0]}k` : `${formatted}k`;
    }
    return count.toString();
}


// Updated add to cart handler with proper update structure
function createAddToCartHandler(itemData, defaultIndex) {
    return async function() {
        const user = auth.currentUser;
        if (!user) {
            showAlert('Please sign in to add items to your cart', 'error');
            return;
        }

        // Get current selection data
        const activeThumbnail = document.querySelector('.gallery-thumbnail.active');
        const activeIndex = activeThumbnail ? parseInt(activeThumbnail.getAttribute('data-index')) : defaultIndex;
        const activeImageGroup = itemData.images[activeIndex];
        const mainImage = activeImageGroup.mainImage || {};

        // Get selected size
        const selectedSizeElement = document.querySelector('.size-option.selected');
        const selectedSize = selectedSizeElement ? selectedSizeElement.textContent : '';

        // Validate selection
        if (mainImage.sizes && mainImage.sizes.length > 1 && !selectedSize) {
            showAlert('Please select a size before adding to cart', 'warning');
            return;
        }

        if (mainImage.itemsLeft !== undefined && mainImage.itemsLeft <= 0) {
            showAlert('This item is out of stock', 'error');
            return;
        }

        try {
            const userCartRef = ref(database, `carts/${user.uid}/carts`);
            const snapshot = await get(userCartRef);

            // Calculate next available index
            let nextIndex = 0;
            if (snapshot.exists()) {
                const cartItems = snapshot.val();
                const keys = Object.keys(cartItems)
                    .map(k => parseInt(k))
                    .filter(n => !isNaN(n))
                    .sort((a, b) => a - b);
                
                // Find first available index
                for (let i = 0; i <= keys.length; i++) {
                    if (!keys.includes(i)) {
                        nextIndex = i;
                        break;
                    }
                }
            }

            // Prepare cart item with proper structure
            const cartItem = {
                addedAt: Date.now(),
                images: {
                    mainimage: {
                        [activeIndex]: true
                    }
                },
                itemID: itemData.itemId || itemData.id || '',
                price: mainImage.displayPrice || '0.00',
                quantity: 1,
                selectedSize: selectedSize,
                title: itemData.title || 'Untitled Item',
                imageUrl: mainImage.url || ''
            };

            // Store item using set() instead of update() since we're creating new entries
            const itemRef = ref(database, `carts/${user.uid}/carts/${nextIndex}`);
            await set(itemRef, cartItem);
            
            showAlert('Item added to cart successfully!', 'success', true);
            updateCartCount(user.uid);
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            showAlert('Failed to add item to cart. Please try again.', 'error');
        }
    };
}

// Updated updateCartCount function with proper update structure
function updateCartCount(userId) {
    const cartCountRef = ref(database, `users/${userId}/cartCount`);
    get(cartCountRef).then((snapshot) => {
        const currentCount = snapshot.exists() ? snapshot.val() : 0;
        // Use set() instead of update() for simple value updates
        set(cartCountRef, currentCount + 1)
            .catch(error => {
                console.error('Error updating cart count:', error);
            });
    }).catch(error => {
        console.error('Error getting cart count:', error);
    });
}

// Updated handleLike function with proper update structure

async function handleLike(itemId, imageIndex) {
    if (!currentUser) {
      window.location.href = 'login.html';
        return;
    }

    try {
        const userLikeRef = ref(database, `users/${currentUser.uid}/likedItems/${itemId}/images/${imageIndex}`);
        const itemLikesRef = ref(database, `items/${itemId}/images/${imageIndex}/mainImage/likes`);
        
        const snapshot = await get(userLikeRef);
        const isLiked = snapshot.exists();

        // Store current currency before any updates
        const previousCurrency = currentCurrency;

        // Prepare updates
        const updates = {};
        
        if (isLiked) {
            updates[`users/${currentUser.uid}/likedItems/${itemId}/images/${imageIndex}`] = null;
            const itemSnapshot = await get(itemLikesRef);
            const currentLikes = itemSnapshot.exists() ? itemSnapshot.val() : 0;
            updates[`items/${itemId}/images/${imageIndex}/mainImage/likes`] = Math.max(0, currentLikes - 1);
        } else {
            updates[`users/${currentUser.uid}/likedItems/${itemId}/images/${imageIndex}`] = true;
            const itemSnapshot = await get(itemLikesRef);
            const currentLikes = itemSnapshot.exists() ? itemSnapshot.val() : 0;
            updates[`items/${itemId}/images/${imageIndex}/mainImage/likes`] = currentLikes + 1;
        }

        await update(ref(database), updates);
        
        // Restore currency after update
        currentCurrency = previousCurrency;
        updateAllPrices(currentCurrency);
        
        updateLikeUI(itemId, imageIndex, !isLiked);
        
    } catch (error) {
        console.error('Error handling like:', error);
        showAlert('Failed to process like. Please try again.', 'error');
    }
}
// ... (keep all other functions the same)

// Update UI after like/unlike without refreshing
function updateLikeUI(itemId, imageIndex, isLiked) {
    // Update like button appearance in thumbnail
    const likeButton = document.querySelector(`.thumbnail-wrapper[data-index="${imageIndex}"] .like-button`);
    if (likeButton) {
        updateLikeButton(likeButton, isLiked);
    }
    
    // Update likes count in thumbnail
    const likesContainer = document.querySelector(`.thumbnail-wrapper[data-index="${imageIndex}"] .likes-container`);
    if (likesContainer) {
        const likesRef = ref(database, `items/${itemId}/images/${imageIndex}/mainImage/likes`);
        get(likesRef).then((snapshot) => {
            const likesCount = snapshot.exists() ? snapshot.val() : 0;
            likesContainer.textContent = formatLikesCount(likesCount);
        });
    }

    // Update main likes display under price (only if this is the currently active image)
    const activeThumbnail = document.querySelector('.gallery-thumbnail.active');
    const activeIndex = activeThumbnail ? parseInt(activeThumbnail.getAttribute('data-index')) : 0;
    
    if (imageIndex === activeIndex) {
        const mainLikesDisplay = document.querySelector('.likes-count-display');
        if (mainLikesDisplay) {
            const likesRef = ref(database, `items/${itemId}/images/${imageIndex}/mainImage/likes`);
            get(likesRef).then((snapshot) => {
                const likesCount = snapshot.exists() ? snapshot.val() : 0;
                mainLikesDisplay.innerHTML = `
                    <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> ${formatLikesCount(likesCount)}
                `;
            });
        }
    }
}
// Function to update like button appearance
function updateLikeButton(button, isLiked) {
    if (isLiked) {
        button.innerHTML = '<i class="fas fa-heart" style="color: #ff0000;"></i>';
        button.classList.add('liked');
    } else {
        button.innerHTML = '<i class="far fa-heart"></i>';
        button.classList.remove('liked');
    }
}

// Function to initialize likes for all thumbnails
async function initializeThumbnailLikes(itemId) {
    if (!itemId || !currentUser) return;
    
    const thumbnailWrappers = document.querySelectorAll('.thumbnail-wrapper');
    if (!thumbnailWrappers.length) return;
    
    // Get all likes data for this item from user's liked items
    const userLikesRef = ref(database, `users/${currentUser.uid}/likedItems/${itemId}/images`);
    const userSnapshot = await get(userLikesRef);
    
    thumbnailWrappers.forEach(wrapper => {
        const index = wrapper.getAttribute('data-index');
        const likeButton = wrapper.querySelector('.like-button');
        const likesContainer = wrapper.querySelector('.likes-container');
        
        // Initialize like button appearance
        if (userSnapshot.exists() && userSnapshot.val()[index]) {
            updateLikeButton(likeButton, true);
        } else {
            updateLikeButton(likeButton, false);
        }
        
        // Get likes count from item data
        const itemLikesRef = ref(database, `items/${itemId}/images/${index}/mainImage/likes`);
        onValue(itemLikesRef, (snapshot) => {
            const likesCount = snapshot.exists() ? snapshot.val() : 0;
            if (likesContainer) {
                likesContainer.textContent = formatLikesCount(likesCount);
            }
        });
    });
}


let currentCurrency = 'ZAR';

// Currency conversion rates
const conversionRates = {
    'USD': 0.054,
    'EUR': 0.050,
    'ZAR': 1
};

// Function to extract numeric price from formatted string
function extractNumericPrice(priceStr) {
    if (!priceStr) return null;
    const numericStr = priceStr.toString().replace(/[^\d.]/g, '');
    const numericValue = parseFloat(numericStr);
    return isNaN(numericValue) ? null : numericValue;
}

// Function to convert price between currencies


function convertPrice(price, originalCurrency, targetCurrency) {
    if (!price || price === 'Price not available') return 'Price not available';
    
    // Extract numeric value safely
    const numericMatch = price.toString().match(/(\d+\.?\d*)/);
    if (!numericMatch) return price;
    
    const numericPrice = parseFloat(numericMatch[0]);
    if (isNaN(numericPrice)) return price;

    // If same currency, just reformat
    if (targetCurrency === originalCurrency) {
        if (targetCurrency === 'ZAR') return `R ${numericPrice.toFixed(2)}`;
        return `${targetCurrency} ${numericPrice.toFixed(2)}`;
    }
    
    // Convert through ZAR as base
    let zarAmount;
    if (originalCurrency === 'ZAR') {
        zarAmount = numericPrice;
    } else {
        zarAmount = numericPrice / conversionRates[originalCurrency];
    }
    
    let convertedPrice;
    if (targetCurrency === 'ZAR') {
        convertedPrice = zarAmount;
    } else {
        convertedPrice = zarAmount * conversionRates[targetCurrency];
    }
    
    // Format the result
    if (targetCurrency === 'ZAR') {
        return `R ${convertedPrice.toFixed(2)}`;
    }
    return `${targetCurrency} ${convertedPrice.toFixed(2)}`;
}
function monitorCurrencyChanges(userId) {
    const userCurrencyRef = ref(database, `users/${userId}/selectedCurrency`);
    
    onValue(userCurrencyRef, (snapshot) => {
        if (snapshot.exists()) {
            currentCurrency = snapshot.val();
            localStorage.setItem('preferredCurrency', currentCurrency);
            updateAllPrices(currentCurrency);
            
            if (currentItemData) {
                renderItem(currentItemData);
            }
        }
    }, (error) => {
        console.error("Error monitoring currency:", error);
        const storedCurrency = localStorage.getItem('preferredCurrency') || 'ZAR';
        currentCurrency = storedCurrency;
        updateAllPrices(storedCurrency);
    });
}
// Function to update all prices on the page
function updateAllPrices(targetCurrency) {
    const priceElements = document.querySelectorAll('.price-display, .original-price');
    priceElements.forEach(element => {
        if (element.offsetParent !== null) { // Only update visible elements
            const priceText = element.textContent;
            const originalCurrency = element.dataset.originalCurrency || 'ZAR';
            const convertedPrice = convertPrice(priceText, originalCurrency, targetCurrency);
            
            if (!element.classList.contains('discount-percentage')) {
                element.textContent = convertedPrice;
            }
        }
    });
}

// Function to monitor currency changes for a user

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in with UID:", user.uid);
        currentUser = user;
        getCartID(user.uid);
        monitorCurrencyChanges(user.uid);
        if (currentItemData) {
            initializeThumbnailLikes(currentItemData.id);
        }
    } else {
        console.log("User is not logged in");
        currentUser = null;
        currentCurrency = 'ZAR';
        updateAllPrices('ZAR');
    }
});

// [Rest of the existing code remains exactly the same until the renderItem function]

async function renderItem(itemData) {
    const user = auth.currentUser;
    const currency = currentCurrency || 'ZAR';

    const date = new Date(itemData.createdAt);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    let html = `<div class="item-content-wrapper"><div class="image-column"><div class="image-gallery">`;

    let displayPrice = '0.00';
    let originalPrice = null;

    if (itemData.images && itemData.images.length > 0) {
        const firstMainImage = itemData.images[0].mainImage || {};
        displayPrice = convertPrice(firstMainImage.displayPrice || '0', 'ZAR', currency);
        originalPrice = firstMainImage.originalPrice ? convertPrice(firstMainImage.originalPrice, 'ZAR', currency) : null;
        const firstImageLikes = firstMainImage.likes || 0; // Define likes count for first image

        html += `
            <div class="preview-container" id="preview-container">
                <div class="preview-slides" id="preview-slides"></div>
                <button class="slide-nav prev-slide">❮</button>
                <button class="slide-nav next-slide">❯</button>
            </div>
            <div class="dots-container" id="dots-container"></div>
            <div class="item-details-section">
                <h5>Select color / style</h5>
            </div>
            <div class="gallery-thumbnails">
        `;

        itemData.images.forEach((imageGroup, index) => {
            const mainImage = imageGroup.mainImage || {};
            const itemsLeft = mainImage.itemsLeft || 0;
            const likesCount = mainImage.likes || 0;
            html += `
                <div class="thumbnail-wrapper" data-index="${index}">
                    <div class="thumbnail-top-bar">
                        <button class="like-button" data-item-id="${itemData.id}" data-image-index="${index}">
                            <i class="far fa-heart"></i>
                        </button>
                        <div class="likes-container">${formatLikesCount(likesCount)}</div>
                    </div>
                    <img src="${mainImage.url}" class="gallery-thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}" alt="Image ${index + 1}" onerror="this.src='https://via.placeholder.com/300x375?text=No+Image';">
                    ${itemsLeft > 0 && itemsLeft <= 8 ? `<div class="thumbnail-items-left">${itemsLeft} left</div>` : ''}
                </div>
            `;
        });
        html += `</div>`;
    } else {
        html += `<div class="image-gallery">No images available for this item.</div>`;
    }

    html += `</div></div><div class="details-column"><div class="item-header">`;

    if (itemData.images && itemData.images.length > 0) {
        const firstMainImage = itemData.images[0].mainImage || {};
        const itemsLeft = firstMainImage.itemsLeft || 0;
        const firstImageLikes = firstMainImage.likes || 0; // Define again for this scope

        html += `
            <div class="main-image-description" id="main-image-description">
                ${firstMainImage.description || ''}
            </div>
            <div class="price-display" data-original-currency="ZAR">
                ${displayPrice}
                ${firstMainImage.discountPercentage > 0 && originalPrice ? `
                    <span class="original-price" data-original-currency="ZAR">${originalPrice}</span>
                    <span class="discount-percentage">${firstMainImage.discountPercentage}% OFF</span>
                ` : ''}
            </div>
            <div class="likes-count-display">
                <i class="far fa-heart"></i> likes ${formatLikesCount(firstImageLikes)}
            </div>
        `;

        document.getElementById("item-title").textContent = itemData.title || "Untitled Item";

        if (firstMainImage.sizes && firstMainImage.sizes.length > 0) {
            const autoSelect = firstMainImage.sizes.length === 1;
            html += `
                <div class="sizes-container">
                    <div class="sizes-title">Select size:</div>
                    <div class="sizes" id="sizes-container">
                        ${firstMainImage.sizes.map((size, i) => `
                            <div class="size-option ${autoSelect && i === 0 ? 'selected' : ''}" data-size="${size}">
                                ${size}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    if (itemData.images && itemData.images[0].relatedImages && itemData.images[0].relatedImages.length > 0) {
        html += `
            <div class="related-images-container">
                <div class="related-images-title" style="display:none;">Related Images</div>
                <div class="related-images">
                    ${itemData.images[0].relatedImages.map((img, index) => `
                        <img src="${img.url}" class="related-image" data-index="${index}" 
                             alt="Related Image ${index + 1}" 
                             onerror="this.src='https://via.placeholder.com/300x375?text=No+Image';">
                    `).join('')}
                </div>
            </div>
        `;
    }

    html += `<div id="action-button-container"></div>`;
    itemContent.innerHTML = html;
    initializeSlider(itemData);
    displayMainImageButton(itemData, 0);

    // Initialize thumbnail interactions
    const thumbnails = document.querySelectorAll('.gallery-thumbnail');
    const mainImageDesc = document.getElementById('main-image-description');
    const priceDisplay = document.querySelector('.price-display');
    const likesCountDisplay = document.querySelector('.likes-count-display');
    const itemsLeftContainer = document.querySelector('.items-left-container');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const selectedImage = itemData.images[index].mainImage || {};
            const selectedDisplayPrice = convertPrice(selectedImage.displayPrice || '0', 'ZAR', currency);
            const selectedOriginalPrice = selectedImage.originalPrice ? 
                convertPrice(selectedImage.originalPrice, 'ZAR', currency) : null;
            
            // Get the likes count and like status from the clicked thumbnail
            const thumbnailWrapper = this.closest('.thumbnail-wrapper');
            const likesCount = selectedImage.likes || 0;
            const likeButton = thumbnailWrapper.querySelector('.like-button');
            const isLiked = likeButton ? likeButton.classList.contains('liked') : false;

            // Update main display
            mainImageDesc.textContent = selectedImage.description || '';

            if (priceDisplay) {
                priceDisplay.innerHTML = `${selectedDisplayPrice} 
                    ${selectedImage.discountPercentage > 0 && selectedOriginalPrice ? 
                        `<span class="original-price" data-original-currency="ZAR">${selectedOriginalPrice}</span>
                        <span class="discount-percentage">${selectedImage.discountPercentage}% OFF</span>` : ''}`;
            }

            // Update likes display under price
            if (likesCountDisplay) {
                likesCountDisplay.innerHTML = `
                    <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> likes ${formatLikesCount(likesCount)}
                `;
            }

            if (itemsLeftContainer) {
                itemsLeftContainer.innerHTML = selectedImage.itemsLeft > 0 ? 
                    `<span class="items-left">${selectedImage.itemsLeft} items left</span>` : '';
            }

            displayMainImageButton(itemData, index);
            document.querySelectorAll('.gallery-thumbnail').forEach(thumb => thumb.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Initialize like buttons
    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.stopPropagation();
            const itemId = this.getAttribute('data-item-id');
            const imageIndex = this.getAttribute('data-image-index');
            await handleLike(itemId, imageIndex);
        });
    });

    if (currentUser) {
        initializeThumbnailLikes(itemData.id);
    }

    // Initialize share button if exists
    const shareButton = document.querySelector('.share-btn');
    if (shareButton) {
        shareButton.addEventListener('click', function() {
            const shareUrl = window.location.href;
            if (navigator.share) {
                navigator.share({ title: itemData.title || 'Check out this item', url: shareUrl })
                    .catch(err => console.log('Error sharing:', err));
            } else {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    showAlert('Link copied to clipboard!', 'success', true);
                });
            }
        });
    }
}
// Fixed function to display the main image button


// Updated displayMainImageButton function with size validation for both button types
function displayMainImageButton(itemData, imageIndex) {
    const actionButtonContainer = document.getElementById('action-button-container');
    const selectedImage = itemData.images[imageIndex].mainImage || {};
    const buttonData = selectedImage.button || {};
    const buttonText = buttonData.selectedname || (buttonData.link ? 'View Item' : 'Add to Cart');
    
    // Get the selected size (if any)
    const selectedSizeElement = document.querySelector('.size-option.selected');
    const selectedSize = selectedSizeElement ? selectedSizeElement.getAttribute('data-size') : null;
    const hasMultipleSizes = selectedImage.sizes && selectedImage.sizes.length > 1;

    if (buttonData.link) {
        // For buttons with links - include parameters in URL
        const urlParams = new URLSearchParams();
        urlParams.set('itemId', itemData.id);
        urlParams.set('image', imageIndex);
        if (selectedSize) {
            urlParams.set('size', selectedSize);
        }
        
        // Handle existing parameters in the button's link
        let baseUrl = buttonData.link;
        if (buttonData.link.includes('?')) {
            const [path, existingParams] = buttonData.link.split('?');
            baseUrl = path;
            const existingUrlParams = new URLSearchParams(existingParams);
            existingUrlParams.forEach((value, key) => {
                urlParams.set(key, value);
            });
        }
        
        const finalUrl = `${baseUrl}?${urlParams.toString()}`;
        
        actionButtonContainer.innerHTML = `
            <a href="${finalUrl}" class="action-button" id="main-action-button" target="_blank">
                ${buttonText}
            </a>
        `;

        // Add click handler for link buttons to validate size selection
        const button = document.getElementById('main-action-button');
        button.addEventListener('click', function(e) {
            if (hasMultipleSizes && !selectedSize) {
                e.preventDefault();
                showAlert('Please select a size before proceeding', 'warning');
                return false;
            }
            return true;
        });
    } else {
        // For Add to Cart buttons - create a regular button that won't navigate
        actionButtonContainer.innerHTML = `
            <button type="button" class="action-button" id="main-action-button">
                ${buttonText}
            </button>
        `;
        
        // Add click handler for Add to Cart that prevents default behavior
        const button = document.getElementById('main-action-button');
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (hasMultipleSizes && !selectedSize) {
                showAlert('Please select a size before adding to cart', 'warning');
                return;
            }
            createAddToCartHandler(itemData, imageIndex)();
        });
    }
}



function showAlert(message, type = 'info', autoClose = false) {
    const overlay = document.createElement('div');
    overlay.className = 'alert-overlay-copy';
    
    const alertBox = document.createElement('div');
    alertBox.className = `alert-box ${type} ${autoClose ? 'auto-close' : ''}`;
    
    const iconContainer = document.createElement('div');
    iconContainer.className = 'alert-icon';
    
    let iconCode;
    switch(type) {
        case 'error':
            iconCode = 'f06a';
            break;
        case 'warning':
            iconCode = 'f071';
            break;
        case 'success':
            iconCode = 'f00c';
            break;
        case 'info':
        default:
            iconCode = 'f05a';
    }
    
    iconContainer.innerHTML = `<i class="fas" style="color: #1a2639; font-size: 40px;">&#x${iconCode};</i>`;
    alertBox.appendChild(iconContainer);
    
    const alertMessage = document.createElement('div');
    alertMessage.className = 'alert-message';
    alertMessage.textContent = message;
    alertBox.appendChild(alertMessage);
    
    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('active'), 10);
    
    if (autoClose) {
        setTimeout(() => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }, 3000);
    } else {
        const alertButton = document.createElement('button');
        alertButton.className = 'alert-button';
        alertButton.textContent = 'OK';
        alertButton.style.backgroundColor = '#800080';
        alertButton.style.marginLeft = 'auto';
        alertBox.appendChild(alertButton);
        
        alertButton.addEventListener('click', () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        });
    }
}

// Improved slider with smooth touch handling and proper URL parameter handling
function initializeSlider(itemData) {
    let currentSlide = 0;
    let slidesContainer = document.getElementById('preview-slides');
    let dotsContainer = document.getElementById('dots-container');
    let currentRelatedImages = [];
    let isAnimating = false;
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartTime = 0;
    let velocity = 0;
    let currentActiveThumbnailIndex = 0;
    
    function createPreviewSlides(relatedImages) {
    // Reset animation state
    isAnimating = false;
    
    // Only recreate if we have different images
    if (JSON.stringify(currentRelatedImages) !== JSON.stringify(relatedImages)) {
        slidesContainer.innerHTML = '';
        dotsContainer.innerHTML = '';
        currentRelatedImages = relatedImages;
        currentSlide = 0; // Reset to first slide when changing image sets
        
        if (relatedImages && relatedImages.length > 0) {
            relatedImages.forEach((image, index) => {
                const slide = document.createElement('img');
                slide.src = image.url;
                slide.className = 'preview-slide';
                slide.alt = `Preview Image ${index + 1}`;
                slidesContainer.appendChild(slide);
                
                const dot = document.createElement('div');
                dot.className = 'dot';
                dot.dataset.index = index;
                dotsContainer.appendChild(dot);
                
                dot.addEventListener('click', () => {
                    if (!isAnimating) {
                        goToSlide(index);
                    }
                });
            });
        }
    }
    
    // Always update position after creating/changing slides
    goToSlide(currentSlide, true);
}


function goToSlide(index, instant = false) {
    if (!currentRelatedImages.length) return;
    
    // Normalize index
    if (index >= currentRelatedImages.length) {
        index = 0;
    } else if (index < 0) {
        index = currentRelatedImages.length - 1;
    }
    
    // Don't do anything if we're already on this slide
    if (index === currentSlide && !instant) return;
    
    currentSlide = index;
    isAnimating = true;
    
    const targetPosition = -index * slidesContainer.offsetWidth;
    
    slidesContainer.style.transition = instant ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    slidesContainer.style.transform = `translateX(${targetPosition}px)`;
    
    updateDots();

    if (!instant) {
        const onTransitionEnd = () => {
            isAnimating = false;
            slidesContainer.removeEventListener('transitionend', onTransitionEnd);
        };
        slidesContainer.addEventListener('transitionend', onTransitionEnd);
    } else {
        isAnimating = false;
    }
}


    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    function initSliderNavigation() {
        const prevBtn = document.querySelector('.prev-slide');
        const nextBtn = document.querySelector('.next-slide');
        
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        
        slidesContainer.addEventListener('touchstart', touchStart, { passive: true });
        slidesContainer.addEventListener('touchmove', touchMove, { passive: false });
        slidesContainer.addEventListener('touchend', touchEnd);
        
        slidesContainer.addEventListener('mousedown', mouseDown);
        slidesContainer.addEventListener('mousemove', mouseMove);
        slidesContainer.addEventListener('mouseup', mouseUp);
        slidesContainer.addEventListener('mouseleave', mouseUp);
    }
    
    function touchStart(e) {
        if (isAnimating) return;
        touchStartX = e.touches[0].clientX;
        touchStartTime = Date.now();
        slidesContainer.style.transition = 'none';
    }
    
    function touchMove(e) {
        if (isAnimating) return;
        touchEndX = e.touches[0].clientX;
        const diff = touchEndX - touchStartX;
        velocity = diff / (Date.now() - touchStartTime);
        
        const resistance = 3;
        const position = -currentSlide * slidesContainer.offsetWidth + (diff / resistance);
        slidesContainer.style.transform = `translateX(${position}px)`;
        
        if (Math.abs(diff) > 10) {
            e.preventDefault();
        }
    }
    
    
    function touchEnd() {
        if (isAnimating) return;
        
        const diff = touchEndX - touchStartX;
        const timeDiff = Date.now() - touchStartTime;
        velocity = diff / timeDiff;
        
        const velocityThreshold = 0.3;
        const distanceThreshold = slidesContainer.offsetWidth / 4;
        
        if (Math.abs(velocity) > velocityThreshold || Math.abs(diff) > distanceThreshold) {
            if (velocity > 0 || diff > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        } else {
            goToSlide(currentSlide);
        }
    }
    
    function mouseDown(e) {
        if (isAnimating) return;
        touchStartX = e.clientX;
        touchStartTime = Date.now();
        slidesContainer.style.transition = 'none';
        e.preventDefault();
    }
    
    function mouseMove(e) {
        if (isAnimating) return;
        touchEndX = e.clientX;
        const diff = touchEndX - touchStartX;
        velocity = diff / (Date.now() - touchStartTime);
        
        const resistance = 3;
        const position = -currentSlide * slidesContainer.offsetWidth + (diff / resistance);
        slidesContainer.style.transform = `translateX(${position}px)`;
    }
    
    function mouseUp() {
        if (isAnimating) return;
        
        const diff = touchEndX - touchStartX;
        const timeDiff = Date.now() - touchStartTime;
        velocity = diff / timeDiff;
        
        const velocityThreshold = 0.3;
        const distanceThreshold = slidesContainer.offsetWidth / 4;
        
        if (Math.abs(velocity) > velocityThreshold || Math.abs(diff) > distanceThreshold) {
            if (velocity > 0 || diff > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        } else {
            goToSlide(currentSlide);
        }
    }
    
    function nextSlide() {
        if (!isAnimating) {
            goToSlide(currentSlide + 1);
        }
    }
    
    function prevSlide() {
        if (!isAnimating) {
            goToSlide(currentSlide - 1);
        }
    }
    
    if (itemData.images[0].relatedImages && itemData.images[0].relatedImages.length > 0) {
        createPreviewSlides(itemData.images[0].relatedImages);
        
        const relatedImages = document.querySelectorAll('.related-image');
        relatedImages.forEach((img, index) => {
            img.addEventListener('click', () => {
                const activeThumbnail = document.querySelector('.gallery-thumbnail.active');
                const activeIndex = activeThumbnail ? parseInt(activeThumbnail.getAttribute('data-index')) : 0;
                const activeImageGroup = itemData.images[activeIndex];
                createPreviewSlides(activeImageGroup.relatedImages);
                goToSlide(index);
            });
        });
    }
    
    initSliderNavigation();
    
    const thumbnails = document.querySelectorAll('.gallery-thumbnail');
    const priceDisplay = document.querySelector('.price-display');
    const sizesContainer = document.querySelector('.sizes');
    const actionButtonContainer = document.getElementById('action-button-container');
    const relatedImagesContainer = document.querySelector('.related-images');
    const itemsLeftContainer = document.querySelector('.items-left-container');
    
    // Function to create/update the action button
    function updateActionButton(imageGroup) {
        const mainImage = imageGroup.mainImage || {};
        const buttonData = mainImage.button || {};
        const buttonText = buttonData.selectedname || (buttonData.link ? 'View Item' : 'Add to Cart');
        
        // Get selected size
        const selectedSizeElement = document.querySelector('.size-option.selected');
        const selectedSize = selectedSizeElement ? selectedSizeElement.getAttribute('data-size') : null;
        
        if (buttonData.link) {
            // For buttons with links - include parameters in URL
            const urlParams = new URLSearchParams();
            urlParams.set('itemId', itemData.id);
            urlParams.set('image', currentActiveThumbnailIndex);
            if (selectedSize) {
                urlParams.set('size', selectedSize);
            }
            
            // Handle existing parameters in the button's link
            let baseUrl = buttonData.link;
            if (buttonData.link.includes('?')) {
                const [path, existingQuery] = buttonData.link.split('?');
                baseUrl = path;
                const existingParams = new URLSearchParams(existingQuery);
                existingParams.forEach((value, key) => {
                    urlParams.set(key, value);
                });
            }
            
            const finalUrl = `${baseUrl}?${urlParams.toString()}`;
            
            actionButtonContainer.innerHTML = `
                <a href="${finalUrl}" class="action-button" id="main-action-button" target="_blank">
                    ${buttonText}
                </a>
            `;
        } else {
            // For Add to Cart buttons - create a regular button that won't navigate
            actionButtonContainer.innerHTML = `
                <button type="button" class="action-button" id="main-action-button">
                    ${buttonText}
                </button>
            `;
            
            // Add click handler for Add to Cart that prevents default behavior
            const button = document.getElementById('main-action-button');
            button.addEventListener('click', function(e) {
                e.preventDefault();
                createAddToCartHandler(itemData, currentActiveThumbnailIndex)();
            });
        }
    }
    
// Define the related image click handler outside the conditional block
function createRelatedImageClickHandler(imageGroup, relIndex) {
    let lastClickTime = 0;
    return function() {
        const now = Date.now();
        if (now - lastClickTime < 300) return; // 300ms debounce
        lastClickTime = now;
        
        createPreviewSlides(imageGroup.relatedImages);
        goToSlide(relIndex);
    };
}

// Define the thumbnail click handler outside the conditional block
function createThumbnailClickHandler(itemData, currentCurrency) {
    return function() {
        let lastClickTime = 0;
        return function() {
            const now = Date.now();
            if (now - lastClickTime < 300) return; // 300ms debounce
            lastClickTime = now;
            
            const index = this.getAttribute('data-index');
            currentActiveThumbnailIndex = index;
            const imageGroup = itemData.images[index];
            const mainImage = imageGroup.mainImage || {};
            const itemsLeft = mainImage.itemsLeft || 0;
            const likesCount = mainImage.likes !== undefined ? mainImage.likes : 0;

            // Update active thumbnail
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update price display with proper currency formatting
            if (priceDisplay) {
                const displayPrice = convertPrice(mainImage.displayPrice || '0', 'ZAR', currentCurrency);
                const originalPrice = mainImage.originalPrice ? 
                    convertPrice(mainImage.originalPrice, 'ZAR', currentCurrency) : null;
                
                priceDisplay.innerHTML = `
                    ${displayPrice}
                    ${mainImage.discountPercentage > 0 && originalPrice ? `
                        <span class="original-price">${originalPrice}</span>
                        <span class="discount-percentage">${mainImage.discountPercentage}% OFF</span>
                    ` : ''}
                `;
                
                // Store original prices in data attributes
                priceDisplay.dataset.originalPrice = mainImage.displayPrice || '0';
                if (mainImage.originalPrice) {
                    const originalPriceEl = priceDisplay.querySelector('.original-price');
                    if (originalPriceEl) {
                        originalPriceEl.dataset.originalPrice = mainImage.originalPrice;
                    }
                }
            }
            
            // Update items left display
            if (itemsLeftContainer) {
                itemsLeftContainer.innerHTML = itemsLeft > 0 
                    ? `<span class="items-left">${itemsLeft} items left</span>`
                    : '';
                itemsLeftContainer.style.display = itemsLeft > 0 ? 'block' : 'none';
            }
            
            // Update likes display under price
            const likesDisplay = document.querySelector('.likes-count-display');
            if (likesDisplay) {
                // Check if current user has liked this image
                const likeButton = this.querySelector('.like-button');
                const isLiked = likeButton ? likeButton.classList.contains('liked') : false;
                
                likesDisplay.innerHTML = `
                    <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>likes ${formatLikesCount(likesCount)}
                `;
            }

            // Update sizes
            if (sizesContainer) {
                sizesContainer.innerHTML = '';
                if (mainImage.sizes && mainImage.sizes.length > 0) {
                    const autoSelect = mainImage.sizes.length === 1;
                    
                    mainImage.sizes.forEach((size, i) => {
                        const sizeOption = document.createElement('div');
                        sizeOption.className = `size-option ${autoSelect && i === 0 ? 'selected' : ''}`;
                        sizeOption.textContent = size;
                        sizeOption.dataset.size = size;
                        sizeOption.addEventListener('click', function() {
                            sizesContainer.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
                            this.classList.add('selected');
                            updateActionButton(itemData.images[currentActiveThumbnailIndex]);
                        });
                        sizesContainer.appendChild(sizeOption);
                    });
                }
            }
            
            // Update related images
            if (relatedImagesContainer && imageGroup.relatedImages) {
                relatedImagesContainer.innerHTML = '';
                if (imageGroup.relatedImages.length > 0) {
                    imageGroup.relatedImages.forEach((relatedImage, relIndex) => {
                        const relatedImg = document.createElement('img');
                        relatedImg.src = relatedImage.url;
                        relatedImg.className = 'related-image';
                        relatedImg.setAttribute('data-index', relIndex);
                        relatedImg.alt = `Related Image ${relIndex + 1}`;
                        relatedImagesContainer.appendChild(relatedImg);
                        
                        // Use the debounced click handler
                        relatedImg.addEventListener('click', createRelatedImageClickHandler(imageGroup, relIndex));
                    });
                    
                    createPreviewSlides(imageGroup.relatedImages);
                }
            }
            
            updateActionButton(imageGroup);
        };
    };
}

if (thumbnails.length > 0) {
    const firstThumbnail = thumbnails[0];
    const index = firstThumbnail.getAttribute('data-index');
    const imageGroup = itemData.images[index];
    const mainImage = imageGroup.mainImage || {};
    const itemsLeft = mainImage.itemsLeft || 0;
    
    thumbnails.forEach(t => t.classList.remove('active'));
    firstThumbnail.classList.add('active');
    currentActiveThumbnailIndex = index;
    
    if (priceDisplay) {
        priceDisplay.innerHTML = `
            R${mainImage.displayPrice || '0.00'}
            ${mainImage.discountPercentage > 0 ? `
                <span class="original-price">R${mainImage.originalPrice || mainImage.displayPrice}</span>
                <span class="discount-percentage">${mainImage.discountPercentage}% OFF</span>
            ` : ''}
        `;
    }
    
    if (itemsLeftContainer) {
        if (itemsLeft > 0) {
            itemsLeftContainer.innerHTML = `<span class="items-left">${itemsLeft} items left</span>`;
            itemsLeftContainer.style.display = 'block';
        } else {
            itemsLeftContainer.style.display = 'none';
        }
    }
    
    // Initialize action button
    updateActionButton(imageGroup);
    
    if (sizesContainer) {
        sizesContainer.innerHTML = '';
        if (mainImage.sizes && mainImage.sizes.length > 0) {
            const autoSelect = mainImage.sizes.length === 1;
            
            mainImage.sizes.forEach((size, i) => {
                const sizeOption = document.createElement('div');
                sizeOption.className = `size-option ${autoSelect && i === 0 ? 'selected' : ''}`;
                sizeOption.textContent = size;
                sizeOption.dataset.size = size;
                sizeOption.addEventListener('click', function() {
                    sizesContainer.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    updateActionButton(itemData.images[currentActiveThumbnailIndex]);
                });
                sizesContainer.appendChild(sizeOption);
            });
        }
    }
    
        if (relatedImagesContainer && imageGroup.relatedImages) {
            relatedImagesContainer.innerHTML = '';
            if (imageGroup.relatedImages.length > 0) {
                imageGroup.relatedImages.forEach((relatedImage, relIndex) => {
                    const relatedImg = document.createElement('img');
                    relatedImg.src = relatedImage.url;
                    relatedImg.className = 'related-image';
                    relatedImg.setAttribute('data-index', relIndex);
                    relatedImg.alt = `Related Image ${relIndex + 1}`;
                    relatedImagesContainer.appendChild(relatedImg);
                    

relatedImg.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent double triggers
                if (!isAnimating) {
                    createPreviewSlides(imageGroup.relatedImages);
                    goToSlide(relIndex);
                }
            });
        });
 createPreviewSlides(imageGroup.relatedImages);
            }
        }
    }
    
thumbnails.forEach(thumb => {
    thumb.addEventListener('click', function() {
        const index = this.getAttribute('data-index');
        currentActiveThumbnailIndex = index;
        const imageGroup = itemData.images[index];
        const mainImage = imageGroup.mainImage || {};
        const itemsLeft = mainImage.itemsLeft || 0;
        
        // Get likes count - default to 0 if not available
        const likesCount = mainImage.likes !== undefined ? mainImage.likes : 0;

        // Update active thumbnail
        thumbnails.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // Update price display with proper currency formatting
        if (priceDisplay) {
            const displayPrice = convertPrice(mainImage.displayPrice || '0', 'ZAR', currentCurrency);
            const originalPrice = mainImage.originalPrice ? 
                convertPrice(mainImage.originalPrice, 'ZAR', currentCurrency) : null;
            
            priceDisplay.innerHTML = `
                ${displayPrice}
                ${mainImage.discountPercentage > 0 && originalPrice ? `
                    <span class="original-price">${originalPrice}</span>
                    <span class="discount-percentage">${mainImage.discountPercentage}% OFF</span>
                ` : ''}
            `;
            
            // Store original prices in data attributes
            priceDisplay.dataset.originalPrice = mainImage.displayPrice || '0';
            if (mainImage.originalPrice) {
                const originalPriceEl = priceDisplay.querySelector('.original-price');
                if (originalPriceEl) {
                    originalPriceEl.dataset.originalPrice = mainImage.originalPrice;
                }
            }
        }
        
        // Update items left display
        if (itemsLeftContainer) {
            itemsLeftContainer.innerHTML = itemsLeft > 0 
                ? `<span class="items-left">${itemsLeft} items left</span>`
                : '';
            itemsLeftContainer.style.display = itemsLeft > 0 ? 'block' : 'none';
        }
        
        // Update likes display under price
        const likesDisplay = document.querySelector('.likes-count-display');
        if (likesDisplay) {
            // Check if current user has liked this image
            const likeButton = this.querySelector('.like-button');
            const isLiked = likeButton ? likeButton.classList.contains('liked') : false;
            
            likesDisplay.innerHTML = `
                <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>likes ${formatLikesCount(likesCount)}
            `;
        }

        // Rest of your code (sizes, related images, action button) remains the same...
        if (sizesContainer) {
            sizesContainer.innerHTML = '';
            if (mainImage.sizes && mainImage.sizes.length > 0) {
                const autoSelect = mainImage.sizes.length === 1;
                
                mainImage.sizes.forEach((size, i) => {
                    const sizeOption = document.createElement('div');
                    sizeOption.className = `size-option ${autoSelect && i === 0 ? 'selected' : ''}`;
                    sizeOption.textContent = size;
                    sizeOption.dataset.size = size;
                    sizeOption.addEventListener('click', function() {
                        sizesContainer.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
                        this.classList.add('selected');
                        updateActionButton(itemData.images[currentActiveThumbnailIndex]);
                    });
                    sizesContainer.appendChild(sizeOption);
                });
            }
        }
        
        if (relatedImagesContainer && imageGroup.relatedImages) {
            relatedImagesContainer.innerHTML = '';
            if (imageGroup.relatedImages.length > 0) {
                imageGroup.relatedImages.forEach((relatedImage, relIndex) => {
                    const relatedImg = document.createElement('img');
                    relatedImg.src = relatedImage.url;
                    relatedImg.className = 'related-image';
                    relatedImg.setAttribute('data-index', relIndex);
                    relatedImg.alt = `Related Image ${relIndex + 1}`;
                    relatedImagesContainer.appendChild(relatedImg);
                    
                    relatedImg.addEventListener('click', () => {
                        createPreviewSlides(imageGroup.relatedImages);
                        goToSlide(relIndex);
                    });
                });
                
                createPreviewSlides(imageGroup.relatedImages);
            }
        }
        
        updateActionButton(imageGroup);
    });
});
}

