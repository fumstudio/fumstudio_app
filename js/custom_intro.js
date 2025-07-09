        document.addEventListener('DOMContentLoaded', function() {
            // Show loading screen initially
            const loadingScreen = document.getElementById('loadingScreen');
            
            // Hide loading screen after 1 second
            setTimeout(function() {
                loadingScreen.classList.add('hidden');
                
                // Remove loading screen from DOM after fade out completes
                setTimeout(function() {
                    loadingScreen.remove();
                }, 500); // Match this with the CSS transition time
            }, 1000); // 1 second display time
        });